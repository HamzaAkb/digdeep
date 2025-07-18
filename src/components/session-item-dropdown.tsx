import { useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SessionShareDialog } from './session-share-dialog'
import { PublicShareDialog } from './public-share-dialog'
import { CopySessionDialog } from './copy-session-dialog'

interface SessionItemDropdownProps {
  sessionId: string
  onDelete: (sessionId: string) => void
  onShare: (sessionId: string, email: string) => void
}

export function SessionItemDropdown({ sessionId, onDelete, onShare }: SessionItemDropdownProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [publicShareDialogOpen, setPublicShareDialogOpen] = useState(false)
  const [copyDialogOpen, setCopyDialogOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md dropdown-trigger">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation();
            setShareDialogOpen(true);
          }}>
            Share
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation();
            setPublicShareDialogOpen(true);
          }}>
            Public Share
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation();
            setCopyDialogOpen(true);
          }}>
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600 dark:text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(sessionId);
            }}
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
      <PublicShareDialog
        open={publicShareDialogOpen}
        onOpenChange={setPublicShareDialogOpen}
        sessionId={sessionId}
      />
      <CopySessionDialog
        open={copyDialogOpen}
        onOpenChange={setCopyDialogOpen}
        sessionId={sessionId}
      />
    </>
  )
} 