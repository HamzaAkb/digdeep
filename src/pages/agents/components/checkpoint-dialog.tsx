import { useState } from 'react'
import { useParams } from 'react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
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

  const handleCreate = async () => {
    if (!sessionId) return
    setLoading(true)
    try {
      await api.post(
        `/session/checkpoint/${sessionId}/checkpoint`,
        {},
        { params: { label } }
      )
      toast.success('Checkpoint created')
      onOpenChange(false)
    } catch (err: any) {
      toast.error('Checkpoint creation failed')
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
        </div>

        <DialogFooter className='mt-4 space-x-2'>
          <DialogClose asChild>
            <Button variant='secondary'>Cancel</Button>
          </DialogClose>
          <Button onClick={handleCreate} disabled={!label.trim() || loading}>
            {loading && <Loader2 className='animate-spin h-4 w-4' />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
