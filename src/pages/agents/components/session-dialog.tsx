import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
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
import SessionSetupStep from './session-setup'
import ClarificationStep, { QuestionBlock } from './clarification'
import { Button } from '@/components/ui/button'

const API_BASE = import.meta.env.VITE_API_URL
const TOKEN = import.meta.env.VITE_TOKEN

export default function SessionDialog() {
  const [step, setStep] = useState(0)
  const [sessionId] = useState(() => crypto.randomUUID())
  const [name, setName] = useState('')
  const [dataContext, setDataContext] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [formQuestions, setFormQuestions] = useState<QuestionBlock[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const handleSubmit = async () => {
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

        <div className='overflow-y-auto px-4 flex-1'>
          {step === 0 ? (
            <SessionSetupStep
              name={name}
              setName={setName}
              dataContext={dataContext}
              setDataContext={setDataContext}
              files={files}
              setFiles={setFiles}
              loading={loading}
              error={error}
            />
          ) : (
            <ClarificationStep
              formQuestions={formQuestions}
              setFormQuestions={setFormQuestions}
              error={error}
            />
          )}
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
              {loading && <Loader2 className='animate-spin h-4 w-4' />}
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading && <Loader2 className='animate-spin h-4 w-4' />}
              Submit
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
