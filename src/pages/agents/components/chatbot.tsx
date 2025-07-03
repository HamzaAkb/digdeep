import { useContext, useState, useEffect, useRef } from 'react'
import { ChatContext } from '@/contexts/chat-context'
import { Textarea } from '@/components/ui/textarea'
import { SendHorizontal, Bookmark, FileText } from 'lucide-react'
import { FormattedBotResponse } from './formatted-bot-response'
import CheckpointDialog from './checkpoint-dialog'
import { TemplateDialog } from './template-dialog'

export default function Chatbot() {
  const { messages, streaming, sendTask, isSharedSession, sendReportTask } = useContext(ChatContext)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')
  const [cpOpen, setCpOpen] = useState(false)
  const [templateOpen, setTemplateOpen] = useState(false)
  const [reportChecked, setReportChecked] = useState(false)
  const [reportHtmlTemplate, setReportHtmlTemplate] = useState<string | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  const lastBotIndex = messages.map((m) => m.sender).lastIndexOf('bot')

  return (
    <>
      <div className='px-6'>
        <div className='max-w-4xl h-[90vh] flex flex-col'>
          <div className='flex-1 overflow-y-auto mb-6'>
            {messages.map((msg, i) => (
              <div key={i} className='max-w-[95%] mb-4 break-words'>
                {msg.sender === 'bot' ? (
                  <>
                    {msg.parsed ? (
                      <FormattedBotResponse parsed={msg.parsed} />
                    ) : (
                      <div className='rounded-3xl text-sm px-4 py-2 whitespace-pre-wrap break-words'>
                        {msg.text}
                      </div>
                    )}

                    {i === lastBotIndex && !streaming && !isSharedSession && (
                      <button
                        onClick={() => setCpOpen(true)}
                        className='mt-2 inline-flex items-center space-x-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 font-semibold px-3 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-700'
                      >
                        <Bookmark className='h-4 w-4' />
                        <span>Create Checkpoint</span>
                      </button>
                    )}
                  </>
                ) : (
                  <div className='bg-sidebar border rounded-3xl text-sm px-4 py-2 break-words'>
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
          
          <div className="relative flex items-end">
            <button
              type="button"
              aria-pressed={reportChecked}
              onClick={() => setReportChecked((v) => !v)}
              className={`absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded transition-colors text-xs font-medium
                ${reportChecked ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 border border-blue-600 dark:border-blue-900' : 'bg-muted text-muted-foreground hover:bg-accent border border-transparent'}`}
            >
              <Bookmark className="h-4 w-4" />
              Report
            </button>
            {reportChecked && (
              <button
                type="button"
                onClick={() => setTemplateOpen(true)}
                className="absolute bottom-3 left-24 flex items-center gap-1 px-2 py-1 rounded transition-colors text-xs font-medium bg-muted text-muted-foreground hover:bg-accent border border-transparent"
              >
                <FileText className="h-4 w-4" />
                Templates
              </button>
            )}
            <Textarea
              placeholder='Type your message…'
              className='h-24'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  const t = input.trim()
                  if (!t) return
                  setInput('')
                  if (reportChecked) {
                    sendReportTask(t, reportHtmlTemplate || undefined)
                  } else {
                    sendTask(t)
                  }
                }
              }}
            />
            <SendHorizontal
              className='size-4 absolute bottom-3 right-3 cursor-pointer'
              onClick={() => {
                const t = input.trim()
                if (!t) return
                setInput('')
                if (reportChecked) {
                  sendReportTask(t, reportHtmlTemplate || undefined)
                } else {
                  sendTask(t)
                }
              }}
            />
          </div>
        </div>
      </div>

      <CheckpointDialog open={cpOpen} onOpenChange={setCpOpen} />
      <TemplateDialog
        open={templateOpen}
        onOpenChange={setTemplateOpen}
        onSelect={(tpl: string) => setReportHtmlTemplate(tpl)}
      />
    </>
  )
}
