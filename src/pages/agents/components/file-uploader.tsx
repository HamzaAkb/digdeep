import { useRef, Dispatch, SetStateAction } from 'react'
import {
  Paperclip,
  X,
  FileSpreadsheet,
  Image as ImageIcon,
  FileType2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface Props {
  files: File[]
  setFiles: Dispatch<SetStateAction<File[]>>
}

export default function FileUploader({ files, setFiles }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList) return
    setFiles((prev) => [...prev, ...Array.from(fileList)])
    e.target.value = ''
  }

  return (
    <div>
      <div className='flex items-center'>
        <Label>Upload Files</Label>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className='h-4 w-4' />
        </Button>
        <input
          type='file'
          multiple
          ref={fileInputRef}
          onChange={addFiles}
          className='hidden'
        />
      </div>

      {files.length > 0 && (
        <div className='mt-2 space-y-1'>
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
                onClick={() =>
                  setFiles((prev) => prev.filter((_, i) => i !== idx))
                }
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
