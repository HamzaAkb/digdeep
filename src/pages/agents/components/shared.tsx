import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { MoreHorizontal } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { format } from 'date-fns'
import api from '@/lib/api'
import { SharedFileUpdateDialog } from './shared-file-update-dialog'

interface SharedFile {
  id: number
  description: string
  share_token: string
  file_name: string
  created_at: string
  expires_at: string
  is_active: boolean
  download_count: number
  full_share_url: string
  is_expired: boolean
}

export default function Shared() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<SharedFile | null>(null)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)

  const fetchSharedFiles = async () => {
    try {
      const { data } = await api.get(`/files/session/${sessionId}/shares`, {
        params: {
          skip: 0,
          limit: 10
        }
      })
      setSharedFiles(data)
    } catch (error) {
      console.error('Error fetching shared files:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (sessionId) {
      fetchSharedFiles()
    }
  }, [sessionId])

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Expires At</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Downloads</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sharedFiles.map((file) => (
            <TableRow key={file.id}>
              <TableCell className="font-medium">{file.file_name}</TableCell>
              <TableCell>{file.description}</TableCell>
              <TableCell>{format(new Date(file.created_at), 'PPp')}</TableCell>
              <TableCell>{format(new Date(file.expires_at), 'PPp')}</TableCell>
              <TableCell>
                <Badge variant={file.is_expired ? "destructive" : file.is_active ? "default" : "secondary"}>
                  {file.is_expired ? "Expired" : file.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>{file.download_count}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedFile(file)
                        setUpdateDialogOpen(true)
                      }}
                    >
                      Update
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedFile && (
        <SharedFileUpdateDialog
          open={updateDialogOpen}
          onOpenChange={setUpdateDialogOpen}
          sharedFile={selectedFile}
          onUpdate={fetchSharedFiles}
        />
      )}
    </div>
  )
} 