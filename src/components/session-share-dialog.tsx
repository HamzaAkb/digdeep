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
import api from '@/lib/api'

interface SessionShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionId: string
  onShare: (sessionId: string, email: string) => void
}

export function SessionShareDialog({ open, onOpenChange, sessionId, onShare }: SessionShareDialogProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleShare = async () => {
    if (!email) return
    
    setLoading(true)
    try {
      const userResponse = await api.get(`/user/email/${encodeURIComponent(email)}`)
      const userId = userResponse.data.id

      const shareResponse = await api.post(`/session/${sessionId}/share/user/${userId}`)
      
      toast.success(shareResponse.data.message)
      setEmail('')
      onOpenChange(false)
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 
        error.response?.data?.detail || 
        error.message || 
        'Failed to share session'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Session</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleShare} disabled={loading || !email}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Share
              </>
            ) : (
              'Share'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 