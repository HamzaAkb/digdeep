import { useState } from 'react'
import { useParams } from 'react-router'
import { SendHorizontal } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { ParsedBlock, parseEventStream } from '@/lib/utils'
import { FormattedBotResponse } from './formatted-bot-response'

type Message = {
  sender: 'user' | 'bot'
  text?: string
  parsed?: ParsedBlock
  timestamp?: string
}

const ACCESS_TOKEN = import.meta.env.VITE_TOKEN
const API_BASE = import.meta.env.VITE_API_URL

export default function Chatbot() {
  const { sessionId } = useParams<{ sessionId: string }>()

  if (!sessionId) {
    return <div className='p-6'>No session ID provided.</div>
  }

  const TASK_API_URL = `${API_BASE}/session/run_task_v2/${sessionId}`

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'user',
      text: 'How can I help you today?',
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState('')

  const runTask = async () => {
    const response = await fetch(TASK_API_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify({ task: input, log_iter: 3 }),
    })

    if (!response.ok || !response.body) {
      console.error('network error:', response.statusText)
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let done = false

    while (!done) {
      const { value, done: readerDone } = await reader.read()
      done = readerDone
      if (value) {
        const text = decoder.decode(value, { stream: true })
        const parsedEvents = parseEventStream(text)

        if (parsedEvents.length > 0) {
          parsedEvents.forEach((parsed) => {
            setMessages((prev) => [
              ...prev,
              { sender: 'bot', parsed, timestamp: new Date().toISOString() },
            ])
          })
        } else {
          setMessages((prev) => [
            ...prev,
            { sender: 'bot', text, timestamp: new Date().toISOString() },
          ])
        }
      }
    }
  }

  return (
    <div className='px-6'>
      <div className='max-w-4xl h-[90vh] flex flex-col justify-between'>
        <div className='flex-1 overflow-y-auto overflow-x-hidden mb-6'>
          {messages.map((msg, idx) => (
            <div key={idx} className='max-w-[95%] mb-4'>
              {msg.sender === 'bot' ? (
                msg.parsed ? (
                  <FormattedBotResponse parsed={msg.parsed} />
                ) : (
                  <div className='rounded-3xl text-sm px-4 py-2 whitespace-pre-wrap'>
                    {msg.text}
                  </div>
                )
              ) : (
                <div className='bg-sidebar border rounded-3xl text-sm px-4 py-2'>
                  {msg.text}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className='relative'>
          <Textarea
            placeholder='Ask a follow up'
            className='h-24'
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <SendHorizontal
            className='size-4 absolute bottom-3 right-3 cursor-pointer'
            onClick={() => {
              setMessages((prev) => [
                ...prev,
                {
                  sender: 'user',
                  text: input,
                  timestamp: new Date().toISOString(),
                },
              ])
              setInput('')
              runTask()
            }}
          />
        </div>
      </div>
    </div>
  )
}
