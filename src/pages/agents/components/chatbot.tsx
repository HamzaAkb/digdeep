import { useContext, useState } from 'react'
import { SendHorizontal } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { ChatContext } from '@/contexts/chat-context'
import { FormattedBotResponse } from './formatted-bot-response'

export default function Chatbot() {
  const { messages, sendTask } = useContext(ChatContext)
  const [input, setInput] = useState('')

  return (
    <div className='px-6'>
      <div className='max-w-4xl h-[90vh] flex flex-col justify-between'>
        <div className='flex-1 overflow-y-auto overflow-x-hidden mb-6'>
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
              if (input.trim()) {
                sendTask(input.trim())
                setInput('')
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
