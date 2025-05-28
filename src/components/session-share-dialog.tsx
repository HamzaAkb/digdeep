import { useState } from 'react'
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

interface SessionShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionId: string
  onShare: (sessionId: string, email: string) => void
}

export function SessionShareDialog({ open, onOpenChange, sessionId, onShare }: SessionShareDialogProps) {
  const [email, setEmail] = useState('')

  const handleShare = async () => {
    await onShare(sessionId, email)
    setEmail('')
    onOpenChange(false)
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
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleShare}>Share</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 