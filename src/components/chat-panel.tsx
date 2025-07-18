import { useState, useRef, useEffect } from 'react'
import { SendHorizontal, StopCircle } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ScrollArea } from './ui/scroll-area'
import ReactMarkdown from 'react-markdown'
import type { Message } from '@/routes/_authenticated/sessions/$sessionId'
import { FormattedBotResponse } from './formatted-bot-response'
import { TemplateDialog } from './template-dialog'

interface ChatPanelProps {
  messages: Message[]
  onSendMessage: (message: string) => void
  onSendReportMessage: (message: string, template?: string) => void
  isStreaming: boolean
  onCancelStream: () => void
}

export function ChatPanel({
  messages,
  onSendMessage,
  onSendReportMessage,
  isStreaming,
  onCancelStream,
}: ChatPanelProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [reportChecked, setReportChecked] = useState(false)
  const [templateOpen, setTemplateOpen] = useState(false)
  const [reportHtmlTemplate, setReportHtmlTemplate] = useState<string | null>(
    null
  )

  const handleSubmit = () => {
    const trimmedInput = input.trim()
    if (!trimmedInput || isStreaming) return

    if (reportChecked) {
      onSendReportMessage(trimmedInput, reportHtmlTemplate || undefined)
    } else {
      onSendMessage(trimmedInput)
    }

    setInput('')
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
    return () => clearTimeout(timer)
  }, [messages])

  return (
    <>
      <div className='relative h-full w-full'>
        <ScrollArea className='absolute top-0 left-0 h-full w-full'>
          <div className='space-y-6 p-4 pb-40'>
            {messages.map((msg) => (
              <div key={msg.id}>
                {msg.type === 'user' ? (
                  <div className='flex justify-end'>
                    <div className='max-w-[80%] rounded-lg px-4 py-2 bg-primary text-primary-foreground'>
                      <div className='prose prose-sm dark:prose-invert max-w-none prose-p:my-0'>
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ) : msg.parsed ? (
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

        <div className='absolute bottom-0 left-0 w-full bg-background p-4'>
          <div className='relative flex items-end'>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                reportChecked
                  ? 'Describe the report you need...'
                  : 'Ask about your data...'
              }
              className='min-h-[120px] resize-none pr-10'
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              disabled={isStreaming}
            />

            <div className='absolute bottom-3 left-3 flex items-center gap-2'>
              <Button
                type='button'
                variant='ghost'
                aria-pressed={reportChecked}
                onClick={() => setReportChecked((v) => !v)}
                className={`h-auto gap-1 rounded px-2 py-1 text-xs font-medium
                  ${
                    reportChecked
                      ? 'border border-blue-600 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:border-blue-900 dark:bg-blue-800 dark:text-blue-300 dark:hover:bg-blue-700'
                      : 'border border-transparent bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
              >
                {/* <Bookmark className='h-4 w-4' /> */}
                <span className='px-1'>Report</span>
              </Button>

              {reportChecked && (
                <Button
                  type='button'
                  variant='ghost'
                  onClick={() => setTemplateOpen(true)}
                  className='h-auto gap-1 rounded border border-transparent bg-muted px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                >
                  {/* <FileText className='h-4 w-4' /> */}
                  <span className='px-1'>Templates</span>
                </Button>
              )}
            </div>

            <div className='absolute bottom-3 right-3'>
              {isStreaming ? (
                <StopCircle
                  className='h-5 w-5 cursor-pointer text-red-500 transition-colors hover:text-red-400'
                  onClick={onCancelStream}
                />
              ) : (
                <SendHorizontal
                  className='h-4 w-4 cursor-pointer text-muted-foreground transition-colors hover:text-foreground'
                  onClick={handleSubmit}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <TemplateDialog
        open={templateOpen}
        onOpenChange={setTemplateOpen}
        onSelect={(tpl: string) => {
          setReportHtmlTemplate(tpl)
          setTemplateOpen(false)
        }}
      />
    </>
  )
}
