// src/components/SessionSetupStep.tsx
import { Dispatch, SetStateAction } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import FileUploader from './file-uploader'

interface Props {
  name: string
  setName: Dispatch<SetStateAction<string>>
  dataContext: string
  setDataContext: Dispatch<SetStateAction<string>>
  files: File[]
  setFiles: Dispatch<SetStateAction<File[]>>
  loading: boolean
  error: string | null
}

export default function SessionSetupStep({
  name,
  setName,
  dataContext,
  setDataContext,
  files,
  setFiles,
  loading,
  error,
}: Props) {
  return (
    <div className='flex flex-col gap-6 pb-6'>
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

      <FileUploader files={files} setFiles={setFiles} />
    </div>
  )
}
