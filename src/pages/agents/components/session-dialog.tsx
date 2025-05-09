import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import api from '@/lib/api'
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
import { Button } from '@/components/ui/button'
import SessionSetupStep, { DataSourceItem } from './session-setup'
import ClarificationStep, { QuestionBlock } from './clarification'

export default function SessionDialog() {
  const [step, setStep] = useState(0)
  const [sessionId] = useState(() => crypto.randomUUID())
  const [name, setName] = useState('')
  const [dataContext, setDataContext] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [dataSources, setDataSources] = useState<DataSourceItem[]>([])
  const [formQuestions, setFormQuestions] = useState<QuestionBlock[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleNext = async () => {
    setError(null)
    setLoading(true)
    try {
      await api.post('/session/start', {
        session_id: sessionId,
        name,
        data_context: dataContext,
      })

      if (files.length > 0 || dataSources.length > 0) {
        const formData = new FormData()
        files.forEach((f) => formData.append('files', f))

        const payload = {
          sources: dataSources.map((ds) =>
            ds.type === 'url'
              ? { type: 'url', link: ds.value }
              : { type: 'db', connection_string: ds.value, queries: [] }
          ),
        }
        formData.append('data_sources', JSON.stringify(payload))

        const uploadRes = await api.post(
          `/session/files/${sessionId}`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )

        const questions = (uploadRes.data.form.questions ??
          []) as QuestionBlock[]
        if (!questions.length) {
          window.location.href = `/session/${sessionId}`
          return
        }
        setFormQuestions(questions)
        setStep(1)
      } else {
        window.location.href = `/session/${sessionId}`
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    setError(null)
    setLoading(true)
    try {
      const clarMap: Record<string, string> = {}
      formQuestions.forEach((blk) =>
        blk.questions.forEach((q, i) => {
          clarMap[q] = blk.answers[i] || ''
        })
      )
      await api.post(`/session/clarify/${sessionId}`, {
        clarifications: clarMap,
      })
      window.location.href = `/session/${sessionId}`
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message)
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
              ? 'Provide a brief description, upload your data files, and add any data sources.'
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
              dataSources={dataSources}
              setDataSources={setDataSources}
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
              Create
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
