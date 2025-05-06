import { useState, useCallback } from 'react'
import { useParams } from 'react-router'
import { Textarea } from '@/components/ui/textarea'
import { SendHorizontal } from 'lucide-react'

type KPI = {
  title: string
  description: string
}

export default function GenerateKPIs() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [goal, setGoal] = useState('')
  const [kpis, setKpis] = useState<KPI[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const TOKEN = import.meta.env.VITE_TOKEN
  const API_URL = import.meta.env.VITE_API_URL

  const generate = useCallback(async () => {
    if (!sessionId || !goal.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `${API_URL}/session/generate_tasks/${sessionId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${TOKEN}`,
          },
          body: JSON.stringify({ task_goals: goal }),
        }
      )
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || res.statusText)
      }
      const data = await res.json()
      const complex = data.tasks?.complex_kpis ?? []
      const mapped: KPI[] = complex.map((item: any) => ({
        title: item.kpi_name,
        description: item.description,
      }))
      setKpis(mapped)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [API_URL, TOKEN, sessionId, goal])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      generate()
    }
  }

  if (!sessionId) {
    return <div className='p-4 text-red-600'>No session ID in URL.</div>
  }

  const skeletonCount = 6

  return (
    <div className='h-full p-4'>
      <div className='flex justify-center my-12'>
        <div className='relative w-[500px]'>
          <Textarea
            placeholder='Enter your analysis goal'
            className='h-24'
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={loading}
          />
          <SendHorizontal
            className='size-4 absolute bottom-3 right-3 cursor-pointer'
            onClick={generate}
          />
        </div>
      </div>

      {error && <p className='text-sm text-red-600 mb-4'>{error}</p>}

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {loading
          ? Array.from({ length: skeletonCount }).map((_, idx) => (
              <div
                key={idx}
                className='border rounded-lg p-4 animate-pulse space-y-4'
              >
                <div className='h-4 bg-gray-200 rounded w-3/4' />
                <div className='h-3 bg-gray-200 rounded w-full' />
                <div className='h-3 bg-gray-200 rounded w-5/6' />
              </div>
            ))
          : kpis.map((kpi, idx) => (
              <div
                key={idx}
                className='border rounded-lg p-4 hover:shadow-md transition cursor-pointer'
              >
                <div className='font-semibold mb-2'>{kpi.title}</div>
                <div className='text-sm text-gray-600'>{kpi.description}</div>
              </div>
            ))}
      </div>
    </div>
  )
}
