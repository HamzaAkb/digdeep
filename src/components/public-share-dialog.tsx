import { useState, useEffect } from 'react'
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
import api from '@/lib/api'
import { Label } from '@/components/ui/label'

interface PublicShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionId: string
}

export function PublicShareDialog({ open, onOpenChange, sessionId }: PublicShareDialogProps) {
  const [loading, setLoading] = useState(false)
  const [link, setLink] = useState<string | null>(null)
  const [ttlDays, setTtlDays] = useState(7)
  const [shareLabel, setShareLabel] = useState('')

  useEffect(() => {
    if (open) {
      setLink(null)
      setShareLabel('')
    }
  }, [open])

  const handleCopyLink = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        ttl_days: ttlDays.toString(),
      })
      if (shareLabel.trim()) {
        params.append('label', shareLabel.trim())
      }
      const response = await api.post(`/public/share/session/${sessionId}?${params.toString()}`)
      const shareToken = response.data.share_token
      const url = `/share/${shareToken}`
      setLink(url)
      await navigator.clipboard.writeText(window.location.origin + url)
      toast.success('Public share link copied to clipboard!')
      onOpenChange(false)
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        'Failed to create public share link'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Public Share</DialogTitle>
        </DialogHeader>
        <div className='py-4'>
          <p className='mb-4'>Generate a public link to share this session. Anyone with the link can access it for the selected number of days.</p>
          <div className='mb-4'>
            <Label htmlFor='share-label'>Label</Label>
            <input
              id='share-label'
              type='text'
              value={shareLabel}
              onChange={e => setShareLabel(e.target.value)}
              disabled={loading}
              className='mt-1 block w-full rounded border px-2 py-1 text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500'
              placeholder='Optional label for this shared session'
            />
          </div>
          <div className='mb-4'>
            <Label htmlFor='ttl-days'>Expires in (days)</Label>
            <input
              id='ttl-days'
              type='number'
              min={1}
              value={ttlDays}
              onChange={e => setTtlDays(Number(e.target.value))}
              disabled={loading}
              className='mt-1 block w-full rounded border px-2 py-1 text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500'
            />
          </div>
          {link && (
            <div className='mb-2 break-all text-sm text-gray-700 dark:text-gray-300'>
              {window.location.origin + link}
            </div>
          )}
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
            onClick={handleCopyLink}
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