import { createContext, useState, useCallback, ReactNode } from 'react'
import { useParams } from 'react-router'
import { ParsedBlock, parseEventStream } from '@/lib/utils'
import api from '@/lib/api'

export type Message = {
  sender: 'user' | 'bot'
  text?: string
  parsed?: ParsedBlock
  timestamp: string
}

interface ChatContextType {
  messages: Message[]
  streaming: boolean
  sendTask: (task: string) => Promise<void>
}

export const ChatContext = createContext<ChatContextType>({
  messages: [],
  streaming: false,
  sendTask: async () => {},
})

export function ChatProvider({ children }: { children: ReactNode }) {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'user',
      text: '👋 How can I help you today?',
      timestamp: new Date().toISOString(),
    },
  ])
  const [streaming, setStreaming] = useState(false)

  const sendTask = useCallback(
    async (task: string) => {
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: task, timestamp: new Date().toISOString() },
      ])
      if (!sessionId) return

      setStreaming(true)
      try {
        const res = await api.post<string>(
          `/session/run_task_v2/${sessionId}`,
          { task, log_iter: 3 },
          { responseType: 'text' }
        )

        const chunk = res.data
        const events = parseEventStream(chunk)
        if (events.length) {
          events.forEach((parsed) =>
            setMessages((prev) => [
              ...prev,
              {
                sender: 'bot',
                parsed,
                timestamp: new Date().toISOString(),
              },
            ])
          )
        } else {
          setMessages((prev) => [
            ...prev,
            { sender: 'bot', text: chunk, timestamp: new Date().toISOString() },
          ])
        }
      } catch (err: any) {
        console.error('run_task_v2 failed', err)
      } finally {
        setStreaming(false)
      }
    },
    [sessionId]
  )

  return (
    <ChatContext.Provider value={{ messages, streaming, sendTask }}>
      {children}
    </ChatContext.Provider>
  )
}
