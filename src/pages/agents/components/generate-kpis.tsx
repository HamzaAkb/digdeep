import { useState, useCallback, useContext } from 'react'
import { useParams } from 'react-router'
import { SendHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ChatContext } from '@/contexts/chat-context'
import api from '@/lib/api'

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
  const { sendTask } = useContext(ChatContext)
  const [goal, setGoal] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
            <div
              key={idx}
              className='border rounded-lg p-4 hover:shadow-md transition cursor-pointer'
              onClick={() => sendTask(kpi.description)}
            >
              <div className='font-semibold mb-2'>{kpi.title}</div>
              <div className='text-sm text-gray-600'>{kpi.description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
