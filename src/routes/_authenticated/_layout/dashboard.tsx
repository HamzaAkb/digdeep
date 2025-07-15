

import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { fetchSessions, deleteSession, type Session } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import { UserNav } from '@/components/user-nav'
import { SessionCard, SessionCardSkeleton } from '@/components/session-card'
import { CreateSessionDialog } from '@/components/create-session-dialog'
import { DuplicateSessionDialog } from '@/components/duplicate-session-dialog'
import { SessionShareDialog } from '@/components/session-share-dialog'
import { PublicShareDialog } from '@/components/public-share-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AlertCircle, FilePlus, Loader2 } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/_layout/dashboard')({
  pendingComponent: DashboardSkeleton,
  component: DashboardComponent,
})

function DashboardSkeleton() {
  return (
    <div className='container mx-auto p-4 md:p-8 animate-pulse'>
      <header className='flex items-center justify-between mb-8'>
        <div className='h-8 w-32 bg-muted rounded-md' />
        <div className='flex items-center gap-4'>
          <div className='h-10 w-36 bg-muted rounded-md' />
          <div className='h-10 w-10 bg-muted rounded-md' />
          <div className='h-8 w-8 bg-muted rounded-full' />
        </div>
      </header>
      <main>
        <div className='h-7 w-48 bg-muted rounded-md mb-6' />
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {Array.from({ length: 8 }).map((_, i) => (
            <SessionCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  )
}

function DashboardComponent() {
  const queryClient = useQueryClient()

  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null)
  const [sessionToDuplicate, setSessionToDuplicate] = useState<Session | null>(
    null
  )
  const [sessionToShare, setSessionToShare] = useState<Session | null>(null)
  const [sessionToPublicShare, setSessionToPublicShare] =
    useState<Session | null>(null)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['sessions'],
    queryFn: fetchSessions,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage?.has_more) {
        return (lastPage.page || 1) + 1
      }
      return undefined
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (sessionId: string) => deleteSession(sessionId),
    onSuccess: () => {
      toast.success('Session deleted successfully.')
      setSessionToDelete(null)
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
    onError: (error) => {
      toast.error(`Deletion failed: ${error.message}`)
      setSessionToDelete(null)
    },
  })

  const sessions = data?.pages.flatMap((page) => page.data) ?? []
  const showSkeleton = isPending && sessions.length === 0

  const handleConfirmDelete = () => {
    if (sessionToDelete) {
      deleteMutation.mutate(sessionToDelete.session_id)
    }
  }

  return (
    <>
      <div className='container mx-auto p-4 md:p-8'>
        <header className='flex items-center justify-between mb-8'>
          <h1 className='text-2xl font-bold'>DigDeep</h1>
          <div className='flex items-center gap-4'>
            <CreateSessionDialog />
            <ModeToggle />
            <UserNav />
          </div>
        </header>

        <main>
          <h2 className='text-xl font-semibold mb-6'>Your Sessions</h2>

          {showSkeleton ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {Array.from({ length: 8 }).map((_, i) => (
                <SessionCardSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <div className='flex flex-col items-center justify-center text-center py-12 text-destructive bg-destructive/5 border border-destructive/20 rounded-lg'>
              <AlertCircle className='h-10 w-10 mb-4' />
              <p className='text-lg font-semibold'>Error Loading Sessions</p>
              <p className='text-sm'>{error.message}</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className='flex flex-col items-center justify-center text-center py-12 bg-muted/50 border border-dashed rounded-lg'>
              <FilePlus className='h-10 w-10 mb-4 text-muted-foreground' />
              <p className='text-lg font-semibold'>No Sessions Found</p>
              <p className='text-sm text-muted-foreground'>
                Get started by creating your first session.
              </p>
              <div className='mt-4'>
                <CreateSessionDialog />
              </div>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {sessions.map((session) => (
                <Link
                  key={session.session_id}
                  to='/sessions/$sessionId'
                  params={{ sessionId: session.session_id }}
                  className='focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg'
                >
                  <SessionCard
                    session={session}
                    onInitiateDelete={setSessionToDelete}
                    onInitiateDuplicate={setSessionToDuplicate}
                    onInitiateShare={setSessionToShare}
                    onInitiatePublicShare={setSessionToPublicShare}
                  />
                </Link>
              ))}
            </div>
          )}

          {hasNextPage && (
            <div className='mt-8 text-center'>
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant='outline'
              >
                {isFetchingNextPage ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : null}
                {isFetchingNextPage ? 'Loading...' : 'Load More Sessions'}
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* --- RENDER ALL DIALOGS (DECOUPLED FROM THE CARDS) --- */}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!sessionToDelete}
        onOpenChange={(isOpen) => !isOpen && setSessionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              session "{sessionToDelete?.name || 'Untitled Session'}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive hover:bg-destructive/90'
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Duplicate Session Dialog */}
      {sessionToDuplicate && (
        <DuplicateSessionDialog
          sessionId={sessionToDuplicate.session_id}
          sessionName={sessionToDuplicate.name}
          open={!!sessionToDuplicate}
          onOpenChange={() => setSessionToDuplicate(null)}
        />
      )}

      {/* Share with User Dialog */}
      {sessionToShare && (
        <SessionShareDialog
          sessionId={sessionToShare.session_id}
          open={!!sessionToShare}
          onOpenChange={() => setSessionToShare(null)}
        />
      )}

      {/* Public Share Dialog */}
      {sessionToPublicShare && (
        <PublicShareDialog
          sessionId={sessionToPublicShare.session_id}
          open={!!sessionToPublicShare}
          onOpenChange={() => setSessionToPublicShare(null)}
        />
      )}
    </>
  )
}
