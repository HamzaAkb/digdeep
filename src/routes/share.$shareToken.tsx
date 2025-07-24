import { useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'sonner'
import {
  fetchSharedSessionInfo,
  bootstrapSharedSession,
  streamTask,
} from '@/lib/api'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { ChatPanel } from '@/components/chat-panel'
import { FileViewerPanel } from '@/components/file-viewer-panel'
import type { Message } from './_authenticated/sessions/$sessionId'
import { useMutation } from '@tanstack/react-query'

const VISITOR_IDS_KEY = 'shared_session_visitor_ids'

export const Route = createFileRoute('/share/$shareToken')({
  loader: async ({ params: { shareToken } }) => {
    try {
      const sessionInfo = await fetchSharedSessionInfo(shareToken)

      if (new Date(sessionInfo.expires_at) < new Date()) {
        toast.error('This shared link has expired.')
        throw redirect({ to: '/' })
      }

      const getVisitorIds = (): Record<string, string> => {
        const stored = localStorage.getItem(VISITOR_IDS_KEY)
        return stored ? JSON.parse(stored) : {}
      }
      const saveVisitorId = (token: string, id: string) => {
        const ids = getVisitorIds()
        ids[token] = id
        localStorage.setItem(VISITOR_IDS_KEY, JSON.stringify(ids))
      }

      let visitorId = getVisitorIds()[shareToken]
      if (!visitorId) {
        visitorId = uuidv4()
        await bootstrapSharedSession(shareToken, visitorId)
        saveVisitorId(shareToken, visitorId)
      }

      return { sessionInfo, visitorId }
    } catch (error) {
      toast.error((error as Error).message || 'Failed to load shared session.')
      throw redirect({ to: '/' })
    }
  },
  component: SharePageComponent,
})

function SharePageComponent() {
  const { sessionInfo, visitorId } = Route.useLoaderData()
  const { shareToken } = Route.useParams()
  const [messages, setMessages] = useState<Message[]>([])

  const streamMutation = useMutation({
    mutationFn: async ({ task }: { task: string }) => {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), sender: 'user', content: task },
      ])
      const botMessageId = crypto.randomUUID()
      setMessages((prev) => [
        ...prev,
        { id: botMessageId, sender: 'bot', content: '' },
      ])

      await streamTask(
        shareToken,
        task,
        (chunk) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMessageId ? { ...m, content: m.content + chunk } : m
            )
          )
        },
        true,
        visitorId
      ) 
    },
    onError: (error) => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: 'bot',
          content: `Error: ${error.message}`,
        },
      ])
    },
  })

  const handleRunTask = (task: string) => {
    streamMutation.mutate({ task })
  }

  return (
    <div className='h-screen w-screen flex flex-col overflow-hidden bg-background'>
      <header className='flex items-center h-14 px-4 border-b shrink-0'>
        <span className='font-semibold'>DigDeep Session</span>
        {sessionInfo.label && (
          <span className='ml-4 text-sm text-muted-foreground'>
            {sessionInfo.label}
          </span>
        )}
      </header>

      <div className='flex-1 flex overflow-hidden'>
        <ResizablePanelGroup direction='horizontal' className='flex-1'>
          <ResizablePanel defaultSize={40} minSize={25}>
            <ChatPanel
              messages={messages}
              onSendMessage={handleRunTask}
              isStreaming={streamMutation.isPending}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={60} minSize={30}>
            <FileViewerPanel shareToken={shareToken} visitorId={visitorId} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
