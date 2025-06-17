import { createContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { useParams } from 'react-router'
import { ParsedBlock, parseEventStream } from '@/lib/utils'

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

interface ChatProviderProps {
  children: ReactNode
  isSharedSession?: boolean
  visitorId?: string
  sessionLabel?: string
}

export const ChatContext = createContext<ChatContextType>({
  messages: [],
  streaming: false,
  sendTask: async () => {},
})

export function ChatProvider({ 
  children, 
  isSharedSession = false, 
  visitorId, 
  sessionLabel 
}: ChatProviderProps) {
  const { sessionId, shareToken } = useParams<{ sessionId: string, shareToken: string }>()
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'user',
      text: '👋 How can I help you today?',
      timestamp: new Date().toISOString(),
    },
  ])
  const [streaming, setStreaming] = useState(false)

  useEffect(() => {
    setMessages([
      {
        sender: 'user',
        text: '👋 How can I help you today?',
        timestamp: new Date().toISOString(),
      },
    ])
    setStreaming(false)
  }, [sessionId])

  const sendTask = useCallback(
    async (task: string) => {
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: task, timestamp: new Date().toISOString() },
      ])

      const currentSessionId = isSharedSession ? shareToken : sessionId
      if (!currentSessionId) return

      setStreaming(true)
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }

        if (isSharedSession && visitorId) {
          headers['X-Visitor-Id'] = visitorId
        } else {
          const token = localStorage.getItem('access_token')
          if (token) {
            headers['Authorization'] = `Bearer ${token}`
          }
        }

        const endpoint = isSharedSession 
          ? `/public/${currentSessionId}/run`
          : `/session/run_task_v2/${currentSessionId}`

        console.log('Making API call to:', endpoint, 'with headers:', headers)

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}${endpoint}`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({ task, log_iter: 3, red_report: false }),
          }
        )
        if (!res.ok || !res.body) {
          console.error('run_task error:', res.statusText)
          return
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let done = false

        while (!done) {
          const { value, done: readerDone } = await reader.read()
          done = readerDone
          if (value) {
            const chunk = decoder.decode(value, { stream: true })
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
                {
                  sender: 'bot',
                  text: chunk,
                  timestamp: new Date().toISOString(),
                },
              ])
            }
          }
        }
      } catch (err) {
        console.error('run_task failed:', err)
      } finally {
        setStreaming(false)
      }
    },
    [sessionId, shareToken, isSharedSession, visitorId]
  )

  return (
    <ChatContext.Provider value={{ messages, streaming, sendTask }}>
      {children}
    </ChatContext.Provider>
  )
}
