import { useRef, useState } from 'react'
import { Paperclip, X, FileSpreadsheet, Image, FileType2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input'

interface Props {
  handleStepChange: (step: number) => void
}

function CreateSession({ handleStepChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])

  const handleAttachClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList) return

    setFiles((prev) => [...prev, ...Array.from(fileList)])

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveFile = (index: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== index))

  return (
    <DialogContent className='!max-w-none w-[800px]'>
      <DialogHeader>
        <DialogTitle>Start a new session</DialogTitle>
        <DialogDescription>
          Provide a brief description and upload your data files.
        </DialogDescription>
      </DialogHeader>

      <div className='flex flex-col gap-6'>
        <div>
            <Label>Session Name</Label>
            <Input placeholder='Enter name of the session' />
        </div>

        <div>
          <Label>Data Context</Label>
          <Textarea
            placeholder='Tell us more about your data'
            className='h-24'
          />
        </div>

        <div>
          <div className='flex items-center'>
            <Label>Upload Files</Label>
            <div className='relative mt-[-15px]'>
              <Button
                variant='ghost'
                size='icon'
                onClick={handleAttachClick}
                className='mt-2'
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
          </div>

          {files.length > 0 && (
            <div>
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className='flex items-center justify-between text-sm mb-1'
                >
                  <div className='flex items-center space-x-2'>
                    {file.type === 'text/csv' && <FileSpreadsheet />}
                    {file.type.includes('image') && <Image />}
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

      <DialogFooter className='sm:justify-end'>
        <DialogClose asChild>
          <Button type='button' variant='secondary'>
            Close
          </Button>
        </DialogClose>
        <Button type='button' onClick={() => handleStepChange(1)}>
          Next
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export default CreateSession
