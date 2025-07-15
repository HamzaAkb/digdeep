import { useState, useRef, useEffect } from 'react'
import { SendHorizontal } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'
import ReactMarkdown from 'react-markdown'
import type { Message } from '@/routes/_authenticated/sessions/$sessionId'
import { FormattedBotResponse } from './formatted-bot-response'

interface ChatPanelProps {
  messages: Message[]
  onSendMessage: (message: string) => void
  isStreaming: boolean
}

export function ChatPanel({
  messages,
  onSendMessage,
  isStreaming,
}: ChatPanelProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleSubmit = () => {
    if (!input.trim() || isStreaming) return
    onSendMessage(input)
    setInput('')
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
    return () => clearTimeout(timer)
  }, [messages])

  return (
    <div className='relative h-full w-full'>
      <ScrollArea className='absolute top-0 left-0 h-full w-full'>
        <div className='space-y-6 p-4 pb-32'>
          {' '}
          {/* Increased bottom padding */}
          {messages.map((msg) => (
            <div key={msg.id}>
              {msg.type === 'user' ? (
                <div className='flex justify-end'>
                  <div className='max-w-[80%] rounded-lg px-4 py-2 bg-primary text-primary-foreground'>
                    {msg.content}
                  </div>
                </div>
              ) :
              msg.parsed ? (
                <FormattedBotResponse parsed={msg.parsed} />
              ) : (
                <div className='text-sm prose prose-sm dark:prose-invert max-w-none'>
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              )}
            </div>
          ))}
          {isStreaming && (
            <div className='p-3 bg-background/50 border rounded-md animate-pulse'>
              <p className='text-sm text-muted-foreground'>
                Agent is thinking...
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className='absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-background via-background/90 to-transparent'>
        <div className='relative'>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Ask about your data...'
            className='pr-16'
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            disabled={isStreaming}
          />
          <Button
            type='submit'
            size='icon'
            className='absolute right-2 top-1/2 -translate-y-1/2'
            onClick={handleSubmit}
            disabled={isStreaming || !input.trim()}
          >
            <SendHorizontal className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}
