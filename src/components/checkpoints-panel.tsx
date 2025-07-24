import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchCheckpoints,
  activateCheckpoint,
  deleteCheckpoint,
  createCheckpoint,
} from '@/lib/api'
import { Button } from './ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { Input } from './ui/input'

interface Checkpoint {
  checkpoint_id: string
  label: string
  created_at: string
}

export function CheckpointsPanel({ sessionId }: { sessionId: string }) {
  const queryClient = useQueryClient()
  const [newCheckpointLabel, setNewCheckpointLabel] = useState('')

  const checkpointsQuery = useQuery({
    queryKey: ['checkpoints', sessionId],
    queryFn: () => fetchCheckpoints(sessionId),
  })

  const onMutationSuccess = (message: string) => {
    toast.success(message)
    queryClient.invalidateQueries({ queryKey: ['checkpoints', sessionId] })
    setNewCheckpointLabel('')
  }
  const onMutationError = (error: Error) => toast.error(error.message)

  const createMutation = useMutation({
    mutationFn: createCheckpoint,
    onSuccess: () => onMutationSuccess('Checkpoint created!'),
    onError: onMutationError,
  })
  const activateMutation = useMutation({
    mutationFn: activateCheckpoint,
    onSuccess: () => onMutationSuccess('Checkpoint activated!'),
    onError: onMutationError,
  })
  const deleteMutation = useMutation({
    mutationFn: deleteCheckpoint,
    onSuccess: () => onMutationSuccess('Checkpoint deleted!'),
    onError: onMutationError,
  })

  const handleCreate = () => {
    if (!newCheckpointLabel.trim()) return
    createMutation.mutate({ sessionId, label: newCheckpointLabel.trim() })
  }

  if (checkpointsQuery.isPending) {
    return (
      <div className='space-y-4'>
        <Skeleton className='h-24 w-full' />
        <Skeleton className='h-24 w-full' />
      </div>
    )
  }

  if (checkpointsQuery.isError) {
    return <p className='text-destructive'>{checkpointsQuery.error.message}</p>
  }

  const checkpoints = checkpointsQuery.data?.data ?? []

  return (
    <div className='space-y-4'>
      <div className='flex gap-2'>
        <Input
          placeholder='New checkpoint label...'
          value={newCheckpointLabel}
          onChange={(e) => setNewCheckpointLabel(e.target.value)}
          disabled={createMutation.isPending}
        />
        <Button
          onClick={handleCreate}
          disabled={createMutation.isPending || !newCheckpointLabel.trim()}
        >
          {createMutation.isPending ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Plus className='h-4 w-4' />
          )}
        </Button>
      </div>

      {checkpoints.length === 0 ? (
        <p className='text-muted-foreground text-sm text-center'>
          No checkpoints created yet.
        </p>
      ) : (
        checkpoints.map((cp: Checkpoint) => (
          <Card key={cp.checkpoint_id}>
            <CardHeader>
              <CardTitle className='text-base'>{cp.label}</CardTitle>
              <CardDescription>
                {format(new Date(cp.created_at), 'PPp')}
              </CardDescription>
            </CardHeader>
            <CardFooter className='flex justify-between'>
              <Button
                size='sm'
                variant='outline'
                disabled={activateMutation.isPending}
                onClick={() =>
                  activateMutation.mutate({
                    sessionId,
                    checkpointId: cp.checkpoint_id,
                  })
                }
              >
                {activateMutation.isPending &&
                activateMutation.variables?.checkpointId ===
                  cp.checkpoint_id ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : null}
                Activate
              </Button>
              <Button
                size='icon'
                variant='ghost'
                className='text-destructive hover:text-destructive-foreground hover:bg-destructive'
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(cp.checkpoint_id)}
              >
                {deleteMutation.isPending &&
                deleteMutation.variables === cp.checkpoint_id ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Trash2 className='h-4 w-4' />
                )}
              </Button>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  )
}