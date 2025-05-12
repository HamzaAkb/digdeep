import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Loader2 } from 'lucide-react'
import api from '@/lib/api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import ClarificationStep, { QuestionBlock } from './clarification'

export default function ClarificationDialog() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [questions, setQuestions] = useState<QuestionBlock[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        const status = await api.get<{ submitted: boolean }>(
          `/session/${sessionId}/clarification_status`
        )
        if (!status.data.submitted) {
          const formRes = await api.get<{
            form: { questions: QuestionBlock[] }
          }>(`/session/${sessionId}/form`)
          setQuestions(formRes.data.form.questions)
          setOpen(true)
        }
      } catch (err) {
        console.error('Failed to load clarification status/form', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [sessionId])

  const handleSubmit = async () => {
    setError(null)
    setSubmitting(true)
    try {
      const clarMap: Record<string, string> = {}
      questions.forEach((blk) =>
        blk.questions.forEach((q, i) => {
          clarMap[q] = blk.answers[i] || ''
        })
      )
      await api.post(`/session/clarify/${sessionId}`, {
        clarifications: clarMap,
      })

      setOpen(false)
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => navigate('/')}>
      <DialogContent
        className='!max-w-none w-[800px] max-h-[80vh] flex flex-col'
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className='relative'>
          <DialogTitle>Clarification Form</DialogTitle>
        </DialogHeader>

        <div className='overflow-y-auto px-4 flex-1'>
          {loading ? (
            <div className='space-y-4'>
              <Skeleton className='h-6 w-1/3' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-3/4' />
            </div>
          ) : (
            <ClarificationStep
              formQuestions={questions}
              setFormQuestions={setQuestions}
              error={error}
            />
          )}
        </div>

        <DialogFooter className='sm:justify-end space-x-2'>
          <Button onClick={handleSubmit} disabled={submitting || loading}>
            {submitting && <Loader2 className='animate-spin h-4 w-4' />}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
