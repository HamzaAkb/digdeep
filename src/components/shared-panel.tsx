import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchSharedLinks, deleteSharedLink } from '@/lib/api'
import { Button } from './ui/button'
import { Skeleton } from './ui/skeleton'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { Copy, Trash2, Loader2 } from 'lucide-react'

interface SharedLink {
  id: number
  file_name: string
  full_share_url: string
  expires_at: string
  is_active: boolean
}

export function SharedPanel({ sessionId }: { sessionId: string }) {
  const queryClient = useQueryClient()
  const sharedLinksQuery = useQuery({
    queryKey: ['sharedLinks', sessionId],
    queryFn: () => fetchSharedLinks(sessionId),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSharedLink,
    onSuccess: () => {
      toast.success('Share link deleted.')
      queryClient.invalidateQueries({ queryKey: ['sharedLinks', sessionId] })
    },
    onError: (error) => toast.error(error.message),
  })

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard!')
  }

  if (sharedLinksQuery.isPending) {
    return (
      <div className='space-y-2'>
        <Skeleton className='h-12 w-full' />
        <Skeleton className='h-12 w-full' />
      </div>
    )
  }
  if (sharedLinksQuery.isError) {
    return <p className='text-destructive'>{sharedLinksQuery.error.message}</p>
  }

  const links = sharedLinksQuery.data?.data ?? []

  return (
    <div className='space-y-3'>
      {links.length === 0 ? (
        <p className='text-muted-foreground text-sm text-center'>
          No files have been shared from this session.
        </p>
      ) : (
        links.map((link: SharedLink) => (
          <div key={link.id} className='p-3 border rounded-md'>
            <p className='font-semibold truncate'>{link.file_name}</p>
            <p className='text-xs text-muted-foreground'>
              Expires{' '}
              {formatDistanceToNow(new Date(link.expires_at), {
                addSuffix: true,
              })}
            </p>
            <div className='flex items-center justify-between mt-2'>
              <Button
                size='sm'
                variant='ghost'
                onClick={() => copyToClipboard(link.full_share_url)}
              >
                <Copy className='mr-2 h-3 w-3' /> Copy
              </Button>
              <Button
                size='icon'
                variant='ghost'
                className='text-destructive'
                onClick={() => deleteMutation.mutate(link.id)}
                disabled={
                  deleteMutation.isPending &&
                  deleteMutation.variables === link.id
                }
              >
                {deleteMutation.isPending &&
                deleteMutation.variables === link.id ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Trash2 className='h-4 w-4' />
                )}
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}