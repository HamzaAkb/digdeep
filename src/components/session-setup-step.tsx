import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, PlusCircle } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useForm } from '@tanstack/react-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { FileUploader } from './file-uploader'
import { startSession, uploadSessionData, clarifySession } from '@/lib/api'
import { ClarificationStep, type QuestionBlock } from './clarification-step'

type Step = 'setup' | 'clarification'

type StartSessionVariables = {
  name: string
  data_context: string
  files: File[]
}

type StartSessionData = {
  questions: QuestionBlock[]
  sessionId: string
}

export function CreateSessionDialog() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('setup')
  const [sessionId, setSessionId] = useState('')
  const [formQuestions, setFormQuestions] = useState<QuestionBlock[]>([])

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const form = useForm({
    defaultValues: {
      name: '',
      data_context: '',
      files: [] as File[],
    },
    onSubmit: async ({ value }) => {
      if (step === 'setup') {
        startSessionMutation.mutate(value)
      } else {
        clarifySessionMutation.mutate()
      }
    },
  })

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setStep('setup')
        setSessionId('')
        setFormQuestions([])
        form.reset()
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [open, form])

  const finishAndNavigate = (id: string, name: string) => {
    toast.success(`Session "${name || 'Untitled'}" created!`)
    queryClient.invalidateQueries({ queryKey: ['sessions'] })
    setOpen(false)
    navigate({
      to: '/sessions/$sessionId',
      params: { sessionId: id },
    })
  }

  const startSessionMutation = useMutation<
    StartSessionData,
    Error,
    StartSessionVariables
  >({
    mutationFn: async (values) => {
      const newSessionId = uuidv4()
      setSessionId(newSessionId)

      await startSession({
        session_id: newSessionId,
        name: values.name,
        data_context: values.data_context,
      })

      if (values.files.length > 0) {
        const formData = new FormData()
        values.files.forEach((f) => formData.append('files', f))
        formData.append('data_sources', JSON.stringify({ sources: [] }))

        const uploadRes = await uploadSessionData(newSessionId, formData)
        return {
          questions: uploadRes.form?.questions ?? [],
          sessionId: newSessionId,
        }
      }
      return { questions: [], sessionId: newSessionId }
    },
    onSuccess: ({ questions, sessionId: newSessionId }, variables) => {
      if (questions && questions.length > 0) {
        setFormQuestions(
          questions.map((q) => ({
            ...q,
            answers: Array(q.questions.length).fill(''),
          }))
        )
        setStep('clarification')
      } else {
        finishAndNavigate(newSessionId, variables.name)
      }
    },
    onError: (err) => toast.error(`Step 1 failed: ${err.message}`),
  })

  const clarifySessionMutation = useMutation({
    mutationFn: async () => {
      const clarMap: Record<string, string> = {}
      formQuestions.forEach((blk) =>
        blk.questions.forEach((q, i) => {
          clarMap[q] = blk.answers[i] || ''
        })
      )
      await clarifySession(sessionId, clarMap)
    },
    onSuccess: () => {
      finishAndNavigate(sessionId, form.state.values.name)
    },
    onError: (err) => toast.error(`Clarification failed: ${err.message}`),
  })

  const handleAnswerChange = (
    blockIndex: number,
    questionIndex: number,
    value: string
  ) => {
    setFormQuestions((prev) => {
      const newQuestions = [...prev]
      const newAnswers = [...newQuestions[blockIndex].answers]
      newAnswers[questionIndex] = value
      newQuestions[blockIndex] = {
        ...newQuestions[blockIndex],
        answers: newAnswers,
      }
      return newQuestions
    })
  }

  const isLoading =
    startSessionMutation.isPending || clarifySessionMutation.isPending

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className='mr-2 h-4 w-4' /> Create Session
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl'>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {step === 'setup' ? 'Create a New Session' : 'Clarification Form'}
            </DialogTitle>
            <DialogDescription>
              {step === 'setup'
                ? 'Provide details and upload data for your new session.'
                : 'Answer a few questions so we can better understand your data.'}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className='max-h-[60vh] my-4 pr-6'>
            {step === 'setup' ? (
              <div className='space-y-4'>
                <form.Field
                  name='name'
                  validators={{
                    onBlur: ({ value }) =>
                      !value ? 'Session name is required' : undefined,
                  }}
                  children={(field) => (
                    <div className='grid gap-2'>
                      <Label htmlFor={field.name}>Session Name</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder='e.g., Q4 Financial Analysis'
                      />
                      {field.state.meta.errors.length > 0 && (
                        <em className='text-destructive text-sm'>
                          {field.state.meta.errors.join(', ')}
                        </em>
                      )}
                    </div>
                  )}
                />
                <form.Field
                  name='data_context'
                  children={(field) => (
                    <div className='grid gap-2'>
                      <Label htmlFor={field.name}>
                        Data Context (Optional)
                      </Label>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder='Describe your data and analysis goals...'
                      />
                    </div>
                  )}
                />
                <form.Field
                  name='files'
                  children={(field) => (
                    <FileUploader
                      files={field.state.value}
                      onFilesChange={field.handleChange}
                    />
                  )}
                />
              </div>
            ) : (
              <ClarificationStep
                formQuestions={formQuestions}
                onAnswerChange={handleAnswerChange}
              />
            )}
          </ScrollArea>

          <DialogFooter>
            {step === 'clarification' && (
              <Button
                type='button'
                variant='outline'
                onClick={() => setStep('setup')}
                disabled={isLoading}
              >
                Back
              </Button>
            )}
            <Button type='submit' disabled={isLoading} className='ml-auto'>
              {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {step === 'setup'
                ? 'Create & Continue'
                : 'Submit & Start Session'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}