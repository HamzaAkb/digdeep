import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import api from '@/lib/api'

interface FileEmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionId: string
  fileName: string
}

export function FileEmailDialog({
  open,
  onOpenChange,
  sessionId,
  fileName,
}: FileEmailDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    recipient_email: '',
    subject: '',
    custom_message: '',
    prefer_link: false,
    link_description: '',
    link_expires_in_days: 10,
    link_strategy: 'reuse' as const,
  })

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      await api.post(
        `/files/session/${sessionId}/outputs/${encodeURIComponent(fileName)}/share/email`,
        formData
      )
      toast.success('Email sent successfully')
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to send email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share via Email</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Recipient Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.recipient_email}
              onChange={(e) =>
                setFormData({ ...formData, recipient_email: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">Custom Message</Label>
            <Textarea
              id="message"
              value={formData.custom_message}
              onChange={(e) =>
                setFormData({ ...formData, custom_message: e.target.value })
              }
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="prefer-link"
              checked={formData.prefer_link}
              onCheckedChange={(checked: boolean) =>
                setFormData({ ...formData, prefer_link: checked })
              }
            />
            <Label htmlFor="prefer-link">Prefer Link</Label>
          </div>
          {formData.prefer_link && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="link-description">Link Description</Label>
                <Input
                  id="link-description"
                  value={formData.link_description}
                  onChange={(e) =>
                    setFormData({ ...formData, link_description: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expiry">Link Expires In (Days)</Label>
                <Input
                  id="expiry"
                  type="number"
                  value={formData.link_expires_in_days}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      link_expires_in_days: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Share'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 