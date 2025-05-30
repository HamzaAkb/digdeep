import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'

interface CheckpointItem {
  checkpoint_id: string
  name: string | null
  created_at: string
  label: string
}

export default function Checkpoints() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [items, setItems] = useState<CheckpointItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [activeId, setActiveId] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [deactivating, setDeactivating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) return
    setLoading(true)
    setError(null)
    api
      .get(`/session/checkpoint/${sessionId}/checkpoints`, {
        params: { page: 1, items_per_page: 50 },
      })
      .then((res) => setItems(res.data.data ?? []))
      .catch((err) => setError(err.response?.data?.detail || err.message))
      .finally(() => setLoading(false))
  }, [sessionId])

  const handleActivate = async (cp: CheckpointItem) => {
    if (!sessionId) return
    setProcessingId(cp.checkpoint_id)
    try {
      await api.post(
        `/session/checkpoint/${sessionId}/checkpoint/activate/${cp.checkpoint_id}`
      )
      setActiveId(cp.checkpoint_id)
      toast.success(`${cp.label} Activated`)
    } catch {
      toast.error(`Failed to activate ${cp.label}`)
    } finally {
      setProcessingId(null)
    }
  }

  const handleDeactivate = async () => {
    if (!sessionId) return
    setDeactivating(true)
    try {
      await api.post(
        `/session/checkpoint/${sessionId}/checkpoint/deactivate`,
        {},
        { params: { store_changes: true } }
      )
      toast.success('Checkpoint deactivated')
      setActiveId(null)
    } catch {
      toast.error('Failed to deactivate checkpoint')
    } finally {
      setDeactivating(false)
    }
  }

  const handleDelete = async (cp: CheckpointItem) => {
    setDeletingId(cp.checkpoint_id)
    try {
      await api.delete(`/session/checkpoint/checkpoint/${cp.checkpoint_id}`)
      setItems((prev) =>
        prev.filter((i) => i.checkpoint_id !== cp.checkpoint_id)
      )
      toast.success(`${cp.label} deleted`)
      if (activeId === cp.checkpoint_id) {
        setActiveId(null)
      }
    } catch {
      toast.error(`Failed to delete ${cp.label}`)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <Loader2 className='animate-spin h-6 w-6' />
      </div>
    )
  }
  if (error) {
    return <div className='p-4 text-red-600'>{error}</div>
  }
  if (items.length === 0) {
    return <div className='p-4 text-gray-500'>No checkpoints found.</div>
  }

  return (
    <div className='p-4 space-y-3 overflow-auto h-full'>
      {items.map((cp) => (
        <div
          key={cp.checkpoint_id}
          className='flex justify-between items-center border rounded-lg p-3'
        >
          <div>
            <div className='font-semibold'>{cp.label}</div>
            <div className='text-sm text-gray-500'>
              {new Date(cp.created_at).toLocaleString()}
            </div>
          </div>

          <div className='flex items-center space-x-2'>
            {activeId === cp.checkpoint_id ? (
              <Button
                size='sm'
                variant='outline'
                onClick={handleDeactivate}
                disabled={deactivating}
              >
                {deactivating ? (
                  <Loader2 className='animate-spin h-4 w-4' />
                ) : (
                  'Deactivate'
                )}
              </Button>
            ) : (
              <Button
                size='sm'
                variant='outline'
                onClick={() => handleActivate(cp)}
                disabled={processingId === cp.checkpoint_id}
              >
                {processingId === cp.checkpoint_id ? (
                  <Loader2 className='animate-spin h-4 w-4' />
                ) : (
                  'Activate'
                )}
              </Button>
            )}

            <Button
              size='icon'
              variant='ghost'
              onClick={() => handleDelete(cp)}
              disabled={deletingId === cp.checkpoint_id}
            >
              {deletingId === cp.checkpoint_id ? (
                <Loader2 className='animate-spin h-4 w-4' />
              ) : (
                <Trash2 className='h-4 w-4 text-red-600 hover:text-red-700' />
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
