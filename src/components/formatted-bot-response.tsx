import ReactMarkdown from 'react-markdown'
import type { ParsedBlock } from '@/lib/stream-parser'
import {
  Brain,
  Zap,
  CheckCircle,
  Rocket,
  FileText,
  Check,
  Award,
  Search,
} from 'lucide-react'

const ICONS: Record<string, React.ReactNode> = {
  started: <Rocket className='h-4 w-4' />,
  summary: <FileText className='h-4 w-4' />,
  finished: <Check className='h-4 w-4' />,
  final: <Award className='h-4 w-4' />,
  Thought: <Brain className='h-4 w-4 text-purple-500' />,
  Action: <Zap className='h-4 w-4 text-yellow-500' />,
  Results: <CheckCircle className='h-4 w-4 text-green-500' />,
  'Final Answer': <Award className='h-4 w-4 text-green-500' />,
  Summary: <Search className='h-4 w-4 text-blue-500' />,
  Data: '📦',
}

export function FormattedBotResponse({ parsed }: { parsed: ParsedBlock }) {
  return (
    <div className='space-y-2'>
      <hr className='my-4' />
      <div className='text-xs text-muted-foreground flex items-center gap-2'>
        {ICONS[parsed.event] || ICONS.Data} <strong>Event:</strong>{' '}
        {parsed.event}
      </div>

      <div className='space-y-3'>
        {parsed.blocks.map((b, i) => (
          <div key={i} className='pl-2'>
            <div className='font-semibold flex items-center gap-2'>
              {ICONS[b.label] || '📌'}
              {b.label}
            </div>
            <div className='text-sm ml-6 mt-1 whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none'>
              <ReactMarkdown>{b.content}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}