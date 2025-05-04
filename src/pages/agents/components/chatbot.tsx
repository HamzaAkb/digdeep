import { Textarea } from '@/components/ui/textarea'
import { ParsedBlock, parseEventStream } from '@/lib/utils'
import { SendHorizontal } from 'lucide-react'
import { useState } from 'react'
import { FormattedBotResponse } from './formatted-bot-response'

type Message = {
  sender: 'user' | 'bot'
  text?: string
  parsed?: ParsedBlock
}

const TASK_API_URL =
  'http://127.0.0.1:8000/api/v1/session/run_task_v2/111f8bc2-648e-4854-a9bc-23035f5260d0'
const ACCESS_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmYXNpaDk4IiwiZXhwIjoxNzQ2MzcyNDQxLCJ0b2tlbl90eXBlIjoiYWNjZXNzIn0.noOlllEFydDdUDWFwgNCjYpocF7PowfniiWFaQlPf0M'

function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'user',
      text: 'How can i help you today?',
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
      body: JSON.stringify({
        task: input,
        log_iter: 3,
      }),
    })

    if (!response.ok || !response.body) {
      console.error('network error: ', response.statusText)
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
          // push each parsed event
          parsedEvents.forEach((parsed) => {
            setMessages((prev) => [
              ...prev,
              { sender: 'bot', parsed, timestamp: new Date().toISOString() },
            ])
          })
        } else {
          // fallback to raw text
          setMessages((prev) => [
            ...prev,
            { sender: 'bot', text, timestamp: new Date().toISOString() },
          ])
        }
      }
    }
  }

  console.log(messages)

  return (
    <div className='px-6'>
      <div className='flex-1/2 max-w-4xl flex flex-col justify-between h-[90vh]'>
        <div className='flex-1 overflow-y-auto overflow-x-hidden mb-6'>
          {messages.map((msg, idx) => (
            <div key={idx} className='max-w-[95%] mb-4'>
              {msg.sender === 'bot' ? (
                msg.parsed ? (
                  // only format when you actually have a parsed object
                  <FormattedBotResponse parsed={msg.parsed} />
                ) : (
                  // raw bot text
                  <div className='rounded-3xl text-sm px-4 py-2 whitespace-pre-wrap'>
                    {msg.text}
                  </div>
                )
              ) : (
                // user bubble
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
              setInput('')
              setMessages([...messages, { sender: 'user', text: input }])
              runTask()
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default Chatbot
