import { useState } from 'react'
import { useParams } from 'react-router'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'

interface CheckpointDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CheckpointDialog({
  open,
  onOpenChange,
}: CheckpointDialogProps) {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [label, setLabel] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!sessionId) return
    setError(null)
    setLoading(true)
    try {
      await api.post(
        `/session/${sessionId}/checkpoint`,
        {},
        { params: { label } }
      )
      onOpenChange(false)
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          err.response?.statusText ||
          err.message ||
          'Failed to create checkpoint'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Create Checkpoint</DialogTitle>
          <DialogDescription>
            Enter a name for this checkpoint.
          </DialogDescription>
        </DialogHeader>

        <div className='mt-2'>
          <Input
            placeholder='Checkpoint name'
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          {error && <p className='text-sm text-red-600 mt-1'>{error}</p>}
        </div>

        <DialogFooter className='mt-4 space-x-2'>
          <DialogClose asChild>
            <Button variant='secondary'>Cancel</Button>
          </DialogClose>
          <Button onClick={handleCreate} disabled={!label.trim() || loading}>
            {loading && <Loader2 className='animate-spin h-4 w-4 mr-2' />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
