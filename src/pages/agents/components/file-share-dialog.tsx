import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import api from '@/lib/api'

interface FileShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionId: string
  fileName: string
}

export function FileShareDialog({
  open,
  onOpenChange,
  sessionId,
  fileName,
}: FileShareDialogProps) {
  const [description, setDescription] = useState('')
  const [expiresIn, setExpiresIn] = useState('10')
  const [loading, setLoading] = useState(false)

  const handleShare = async () => {
    setLoading(true)
    try {
      const response = await api.post(
        `/files/session/${sessionId}/outputs/${encodeURIComponent(fileName)}/share`,
        {
          description,
          expires_in_days: parseInt(expiresIn),
          strategy: 'reuse'
        }
      )

      const shareUrl = `${import.meta.env.VITE_BASE_URL}/downloads/${response.data.share_token}`
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard')
      onOpenChange(false)
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          error.message ||
          'Failed to share file'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share File</DialogTitle>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              placeholder='Enter a description for this file'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='expiresIn'>Expires in (days)</Label>
            <Input
              id='expiresIn'
              type='number'
              min='1'
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleShare}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Copy Link
              </>
            ) : (
              'Copy Link'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 