import { ParsedBlock } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'

const ICONS: Record<string, string> = {
  started: '🚀',
  summary: '📝',
  finished: '✅',
  final: '🎉',
  Thought: '🧠',
  Action: '⚙️',
  Results: '✅',
  'Final Answer': '🏁',
  Summary: '🔍',
}

export function FormattedBotResponse({ parsed }: { parsed: ParsedBlock }) {
  return (
    <div className='mb-6'>
      {/* Separator */}
      <hr className='mb-4' />

      {/* Event header */}
      <div className='text-xs text-gray-500 mb-2'>
        {ICONS[parsed.event] || '📦'} <strong>Event:</strong> {parsed.event}
      </div>

      {/* Blocks */}
      {parsed.blocks.map((b, i) => (
        <div key={i} className='mb-3'>
          <div className='font-semibold'>
            {ICONS[b.label] || '📌'} {b.label}
          </div>
          <div className='text-sm ml-4 mt-1 whitespace-pre-wrap prose-sm'>
            <ReactMarkdown>{b.content}</ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  )
}
