import { useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SessionShareDialog } from './session-share-dialog'

interface SessionItemDropdownProps {
  sessionId: string
  onDelete: (sessionId: string) => void
  onShare: (sessionId: string, email: string) => void
}

export function SessionItemDropdown({ sessionId, onDelete, onShare }: SessionItemDropdownProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShareDialogOpen(true)}>
            Share
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600 dark:text-red-400"
            onClick={() => onDelete(sessionId)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SessionShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        sessionId={sessionId}
        onShare={onShare}
      />
    </>
  )
} 