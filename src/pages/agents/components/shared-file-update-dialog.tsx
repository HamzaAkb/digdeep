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
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import api from '@/lib/api'

interface SharedFileUpdateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sharedFile: {
    id: number
    description: string
    expires_at: string
    is_active: boolean
  }
  onUpdate: () => void
}

function calculateDaysUntilExpiration(expiresAt: string): number {
  const now = new Date()
  const expirationDate = new Date(expiresAt)
  const diffTime = expirationDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(1, diffDays)
}

export function SharedFileUpdateDialog({
  open,
  onOpenChange,
  sharedFile,
  onUpdate,
}: SharedFileUpdateDialogProps) {
  const [description, setDescription] = useState(sharedFile.description)
  const [expiresInDays, setExpiresInDays] = useState(calculateDaysUntilExpiration(sharedFile.expires_at))
  const [isActive, setIsActive] = useState(sharedFile.is_active)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setDescription(sharedFile.description)
    setExpiresInDays(calculateDaysUntilExpiration(sharedFile.expires_at))
    setIsActive(sharedFile.is_active)
  }, [sharedFile])

  const handleUpdate = async () => {
    try {
      setLoading(true)
      await api.patch(`/files/share_links/${sharedFile.id}`, {
        description,
        expires_in_days: expiresInDays,
        is_active: isActive,
      })
      toast.success('Shared file updated successfully')
      onUpdate()
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating shared file:', error)
      toast.error('Failed to update shared file')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Shared File</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiresInDays">Expires in (days)</Label>
            <Input
              id="expiresInDays"
              type="number"
              min="1"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(parseInt(e.target.value))}
              disabled={loading}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={loading}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating
              </>
            ) : (
              'Update'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 