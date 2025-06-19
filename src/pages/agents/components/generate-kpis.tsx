import { useState, useCallback, useContext, useRef } from 'react'
import { useParams } from 'react-router'
import { SendHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ChatContext } from '@/contexts/chat-context'
import api from '@/lib/api'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export type KPI = {
  title: string
  description: string
}

type GenerateKPIsProps = {
  kpis: KPI[]
  setKpis: React.Dispatch<React.SetStateAction<KPI[]>>
}

export default function GenerateKPIs({ kpis, setKpis }: GenerateKPIsProps) {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { sendTask, streaming } = useContext(ChatContext)
  const [goal, setGoal] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [batchRunning, setBatchRunning] = useState(false)
  const stopRef = useRef(false)

  const generate = useCallback(async () => {
    if (!sessionId || !goal.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.post(`/session/generate_tasks/${sessionId}`, {
        task_goals: goal,
      })
      const complex = res.data.tasks?.complex_kpis ?? []
      setKpis(
        complex.map((item: any) => ({
          title: item.kpi_name,
          description: item.description,
        }))
      )
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          'Failed to generate KPIs'
      )
    } finally {
      setLoading(false)
    }
  }, [sessionId, goal])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      generate()
    }
  }

  const toggleKpi = (idx: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const runSequentially = async (tasks: { title: string, description: string }[]) => {
    setBatchRunning(true)
    stopRef.current = false
    for (const { title, description } of tasks) {
      if (stopRef.current) break;
      const toastId = `kpi-${title}`
      toast.info(`Running ${title}`, { id: toastId, duration: Infinity })
      await sendTask(description)
      await new Promise<void>((resolve) => {
        const check = () => {
          if (!streaming) resolve()
          else setTimeout(check, 100)
        }
        check()
      })
      toast.dismiss(toastId)
    }
    setBatchRunning(false)
  }

  const stopExecution = () => {
    stopRef.current = true
  }

  return (
    <div className='h-full p-4'>
      <div className='flex justify-center my-12'>
        <div className='relative w-[500px]'>
          <Input
            placeholder='Enter your analysis goal'
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={loading}
          />
          <SendHorizontal
            className='size-4 absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer'
            onClick={generate}
          />
        </div>
      </div>

      {error && <p className='text-sm text-red-600 mb-4'>{error}</p>}

      <div className='flex gap-3 mb-6 justify-end'>
        {batchRunning && (
          <Button
            variant='destructive'
            onClick={stopExecution}
            className='mr-auto'
          >
            Stop Execution
          </Button>
        )}
        {selected.size > 0 && (
          <Button
            onClick={() => runSequentially(kpis.filter((_, idx) => selected.has(idx)))}
            variant='secondary'
            disabled={batchRunning || loading || kpis.length === 0}
          >
            Run Selected
          </Button>
        )}
        <Button
          onClick={() => runSequentially(kpis)}
          variant='default'
          disabled={batchRunning || loading || kpis.length === 0}
        >
          Run All
        </Button>
      </div>

      {loading ? (
        <div className='space-y-6'>
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className='border rounded-lg p-4 animate-pulse space-y-4'
            >
              <div className='h-4 bg-gray-200 rounded w-3/4' />
              <div className='h-3 bg-gray-200 rounded w-full' />
              <div className='h-3 bg-gray-200 rounded w-5/6' />
            </div>
          ))}
        </div>
      ) : (
        <div className='space-y-6'>
          {kpis.map((kpi, idx) => (
            <Label
              key={idx}
              className={`hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 cursor-pointer has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950`}
            >
              <Checkbox
                checked={selected.has(idx)}
                onCheckedChange={() => toggleKpi(idx)}
                className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
              />
              <div className="grid gap-1.5 font-normal" onClick={() => sendTask(kpi.description)}>
                <div className='font-semibold mb-2'>{kpi.title}</div>
                <div className='text-sm text-gray-600 dark:text-gray-300'>{kpi.description}</div>
              </div>
            </Label>
          ))}
        </div>
      )}
    </div>
  )
}
