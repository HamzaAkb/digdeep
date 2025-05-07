import { useEffect, Dispatch, SetStateAction } from 'react'
import { Plus, X } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import FileUploader from './file-uploader'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

export type DataSourceItem = {
  type: 'url' | 'db'
  value: string
}

interface Props {
  name: string
  setName: Dispatch<SetStateAction<string>>
  dataContext: string
  setDataContext: Dispatch<SetStateAction<string>>
  files: File[]
  setFiles: Dispatch<SetStateAction<File[]>>
  dataSources: DataSourceItem[]
  setDataSources: Dispatch<SetStateAction<DataSourceItem[]>>
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
  dataSources,
  setDataSources,
  error,
}: Props) {
  const addSource = () =>
    setDataSources((prev) => [...prev, { type: 'url', value: '' }])

  const updateSource = (idx: number, key: 'type' | 'value', val: string) =>
    setDataSources((prev) =>
      prev.map((ds, i) =>
        i === idx
          ? { ...ds, [key]: key === 'type' ? (val as 'url' | 'db') : val }
          : ds
      )
    )

  const removeSource = (idx: number) =>
    setDataSources((prev) => prev.filter((_, i) => i !== idx))

  useEffect(() => {
    if (dataSources.length === 0) addSource()
  }, [])

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

      <div>
        <div className='flex items-center justify-between mb-2'>
          <Label>Data Sources</Label>
          <button
            type='button'
            onClick={addSource}
            className='p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700'
          >
            <Plus size={16} />
          </button>
        </div>

        <div className='space-y-2'>
          {dataSources.map((ds, idx) => (
            <div key={idx} className='flex items-center space-x-2'>
              <Select
                value={ds.type}
                onValueChange={(val) => updateSource(idx, 'type', val)}
              >
                <SelectTrigger className='w-[100px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='url'>URL</SelectItem>
                  <SelectItem value='db'>DB</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder={
                  ds.type === 'url' ? 'Enter URL' : 'Enter connection string'
                }
                value={ds.value}
                onChange={(e) => updateSource(idx, 'value', e.target.value)}
                className='flex-1'
              />

              <button
                type='button'
                onClick={() => removeSource(idx)}
                className='p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700'
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <FileUploader files={files} setFiles={setFiles} />
    </div>
  )
}
