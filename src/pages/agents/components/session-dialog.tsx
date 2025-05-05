import { useRef, useState } from 'react'
import {
  Plus,
  Paperclip,
  X,
  FileSpreadsheet,
  Image as ImageIcon,
  FileType2,
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SessionDialog() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [dataContext, setDataContext] = useState('')
  const [files, setFiles] = useState<File[]>([])

  const handleAttachClick = () => fileInputRef.current?.click()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList) return

    const newFiles = Array.from(fileList)

    setFiles((prev) => [...prev, ...newFiles])

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveFile = (i: number) =>
    setFiles((prev) => prev.filter((_, idx) => idx !== i))

  return (
    <Dialog>
      <DialogTrigger>
        <Plus className='size-4 cursor-pointer' />
      </DialogTrigger>

      <DialogContent className='!max-w-none w-[800px]'>
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

        {step === 0 && (
          <div className='flex flex-col gap-6'>
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
                  className='mt-[-6px]'
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
          </div>
        )}

        {step === 1 && (
          <div className='flex flex-col gap-4'>
            <Label>What format are your CSV columns in?</Label>
            <Textarea placeholder='e.g. dates are YYYY-MM-DD, amounts in USD' />
            <Label>Anything else we should know?</Label>
            <Textarea placeholder='e.g. missing headers, special delimiters' />
          </div>
        )}

        <DialogFooter className='sm:justify-end'>
          <DialogClose asChild>
            <Button variant='secondary'>Close</Button>
          </DialogClose>
          {step === 0 ? (
            <Button
              onClick={() => {
                setStep(1)
              }}
            >
              Next
            </Button>
          ) : (
            <Button onClick={() => {}}>Submit</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
