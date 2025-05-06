import { useContext, useState, useEffect, useRef } from 'react'
import { ChatContext } from '@/contexts/chat-context'
import { Textarea } from '@/components/ui/textarea'
import { SendHorizontal } from 'lucide-react'
import { FormattedBotResponse } from './formatted-bot-response'

export default function Chatbot() {
  const { messages, streaming, sendTask } = useContext(ChatContext)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  return (
    <div className='px-6'>
      <div className='max-w-4xl h-[90vh] flex flex-col'>
        <div className='flex-1 overflow-y-auto mb-6'>
          {messages.map((msg, i) => (
            <div key={i} className='max-w-[95%] mb-4'>
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

          {streaming && (
            <div className='max-w-[95%] mb-4 animate-pulse'>
              <div className='rounded-3xl p-4 space-y-2'>
                <div className='h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4' />
                <div className='h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2' />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className='relative'>
          <Textarea
            placeholder='Type your message…'
            className='h-24'
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <SendHorizontal
            className='size-4 absolute bottom-3 right-3 cursor-pointer'
            onClick={() => {
              const t = input.trim()
              if (!t) return
              setInput('')
              sendTask(t)
            }}
          />
        </div>
      </div>
    </div>
  )
}
