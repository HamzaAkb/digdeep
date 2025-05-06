import { useRef, useState } from 'react'
import {
  Plus,
  Paperclip,
  X,
  FileSpreadsheet,
  Image as ImageIcon,
  FileType2,
  Loader2,
} from 'lucide-react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const API_BASE = 'http://localhost:8000/api/v1'
const TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmYXNpaDk4IiwiZXhwIjoxNzQ2NTA5Mjc2LCJ0b2tlbl90eXBlIjoiYWNjZXNzIn0.GM-ALy6TkrcOZkKeN1WB06LbzP-Fbdu4831yNWXLDhs'

type QuestionBlock = {
  field: string
  source: string
  questions: string[]
  answers: string[]
}

export default function SessionDialog() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState(0)
  const [sessionId] = useState(() => crypto.randomUUID())
  const [name, setName] = useState('')
  const [dataContext, setDataContext] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [formQuestions, setFormQuestions] = useState<QuestionBlock[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAttachClick = () => fileInputRef.current?.click()
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList) return
    setFiles((prev) => [...prev, ...Array.from(fileList)])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }
  const handleRemoveFile = (idx: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== idx))

  const handleNext = async () => {
    setError(null)
    setLoading(true)
    try {
      const startRes = await fetch(`${API_BASE}/session/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({
          session_id: sessionId,
          name,
          data_context: dataContext,
        }),
      })
      if (!startRes.ok) {
        const err = await startRes.json()
        throw new Error(err.detail || startRes.statusText)
      }

      if (files.length > 0) {
        const formData = new FormData()
        files.forEach((f) => formData.append('files', f))
        formData.append('data_sources', JSON.stringify({ sources: [] }))

        const uploadRes = await fetch(
          `${API_BASE}/session/files/${sessionId}`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${TOKEN}` },
            body: formData,
          }
        )
        if (!uploadRes.ok) {
          const err = await uploadRes.json()
          throw new Error(err.detail || uploadRes.statusText)
        }
        const uploadJson = await uploadRes.json()
        setFormQuestions(uploadJson.form.questions as QuestionBlock[])
      }

      setStep(1)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitClarifications = async () => {
    setError(null)
    setLoading(true)
    try {
      const clarMap: Record<string, string> = {}
      formQuestions.forEach((block) =>
        block.questions.forEach((q, i) => {
          clarMap[q] = block.answers[i] || ''
        })
      )

      const res = await fetch(`${API_BASE}/session/clarify/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ clarifications: clarMap }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || res.statusText)
      }

      window.location.href = `/session/${sessionId}`
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const grouped = formQuestions.reduce<Record<string, QuestionBlock[]>>(
    (acc, blk) => {
      acc[blk.source] = acc[blk.source] || []
      acc[blk.source].push(blk)
      return acc
    },
    {}
  )

  return (
    <Dialog>
      <DialogTrigger>
        <Plus className='size-4 cursor-pointer' />
      </DialogTrigger>

      <DialogContent className='!max-w-none w-[800px] max-h-[80vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle>
            {step === 0 ? 'Start a new session' : 'Clarification form'}
          </DialogTitle>
          <DialogDescription>
            {step === 0
              ? 'Provide a brief description and upload your data files.'
              : 'Answer a few questions so we can better understand your data.'}
          </DialogDescription>
        </DialogHeader>

        <div className='overflow-y-auto px-4 flex-1 space-y-6'>
          {step === 0 && (
            <>
              {error && <p className='text-sm text-red-600'>{error}</p>}
              <div>
                <Label>Session Name</Label>
                <Input
                  placeholder='Enter name of session'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Label>Data Context</Label>
                <Textarea
                  placeholder='Tell us more about your data'
                  className='h-24'
                  value={dataContext}
                  onChange={(e) => setDataContext(e.target.value)}
                />
              </div>
              <div>
                <div className='flex items-center'>
                  <Label>Upload Files</Label>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={handleAttachClick}
                    className='ml-2'
                  >
                    <Paperclip className='h-4 w-4' />
                  </Button>
                  <input
                    type='file'
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className='hidden'
                  />
                </div>
                {files.length > 0 && (
                  <div className='mt-4 space-y-1'>
                    {files.map((file, idx) => (
                      <div
                        key={idx}
                        className='flex items-center justify-between text-sm'
                      >
                        <div className='flex items-center space-x-2'>
                          {file.type === 'text/csv' && <FileSpreadsheet />}
                          {file.type.includes('image') && <ImageIcon />}
                          {file.type === 'text/plain' && <FileType2 />}
                          <span>{file.name}</span>
                        </div>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => handleRemoveFile(idx)}
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {step === 1 &&
            Object.entries(grouped).map(([src, blocks]) => {
              const filename = src.split('/').pop() || src
              return (
                <section key={src} className='space-y-4'>
                  <p className='font-semibold'>
                    Source: <FileSpreadsheet className='inline-block mr-1' />
                    {filename}
                  </p>
                  {blocks.map((block) =>
                    block.questions.map((q, i) => (
                      <div key={`${block.field}-${i}`}>
                        <p className='font-medium mb-1'>{q}</p>
                        <Textarea
                          value={block.answers[i]}
                          onChange={(e) => {
                            const val = e.target.value
                            setFormQuestions((prev) =>
                              prev.map((b) => {
                                if (b === block) {
                                  const newAns = [...b.answers]
                                  newAns[i] = val
                                  return { ...b, answers: newAns }
                                }
                                return b
                              })
                            )
                          }}
                        />
                      </div>
                    ))
                  )}
                </section>
              )
            })}
        </div>

        <DialogFooter className='sm:justify-end space-x-2'>
          {step === 0 ? (
            <DialogClose asChild>
              <Button variant='secondary'>Close</Button>
            </DialogClose>
          ) : (
            <Button variant='secondary' onClick={() => setStep(0)}>
              Back
            </Button>
          )}
          {step === 0 ? (
            <Button onClick={handleNext} disabled={loading}>
              {loading && <Loader2 className='animate-spin mr-2 h-4 w-4' />}
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmitClarifications} disabled={loading}>
              {loading && <Loader2 className='animate-spin mr-2 h-4 w-4' />}
              Submit
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
