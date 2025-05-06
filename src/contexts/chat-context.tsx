import { createContext, useState, useCallback, ReactNode } from 'react'
import { ParsedBlock, parseEventStream } from '@/lib/utils'
import { useParams } from 'react-router'

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

  const TOKEN = import.meta.env.VITE_TOKEN
  const API_BASE = import.meta.env.VITE_API_URL

  const sendTask = useCallback(
    async (task: string) => {
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: task, timestamp: new Date().toISOString() },
      ])
      if (!sessionId) return

      setStreaming(true)
      try {
        const res = await fetch(
          `${API_BASE}/session/run_task_v2/${sessionId}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${TOKEN}`,
            },
            body: JSON.stringify({ task, log_iter: 3 }),
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
      } finally {
        setStreaming(false)
      }
    },
    [API_BASE, TOKEN, sessionId]
  )

  return (
    <ChatContext.Provider value={{ messages, streaming, sendTask }}>
      {children}
    </ChatContext.Provider>
  )
}
