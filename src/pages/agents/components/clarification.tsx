import { Dispatch, SetStateAction } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export type QuestionBlock = {
  field: string
  source: string
  questions: string[]
  answers: string[]
}

interface Props {
  formQuestions: QuestionBlock[]
  setFormQuestions: Dispatch<SetStateAction<QuestionBlock[]>>
  error: string | null
}

export default function ClarificationStep({
  formQuestions,
  setFormQuestions,
  error,
}: Props) {
  const grouped = formQuestions.reduce<Record<string, QuestionBlock[]>>(
    (acc, blk) => {
      acc[blk.source] = acc[blk.source] || []
      acc[blk.source].push(blk)
      return acc
    },
    {}
  )

  return (
    <div className='space-y-6 pb-6'>
      {error && <p className='text-sm text-red-600'>{error}</p>}

      {Object.entries(grouped).map(([src, blocks]) => {
        const filename = src.split('/').pop() || src
        return (
          <section key={src} className='space-y-4'>
            <p className='font-semibold'>
              Source: <strong>{filename}</strong>
            </p>
            {blocks.map((block) =>
              block.questions.map((q, i) => (
                <div key={`${block.field}-${i}`}>
                  <Label className='font-medium mb-1'>{q}</Label>
                  <Textarea
                    value={block.answers[i]}
                    onChange={(e) => {
                      const val = e.target.value
                      setFormQuestions((prev) =>
                        prev.map((b) => {
                          if (b === block) {
                            const newAnswers = [...b.answers]
                            newAnswers[i] = val
                            return { ...b, answers: newAnswers }
                          }
                          return b
                        })
                      )
                    }}
                  />
                </div>
              ))
            )}
          </section>
        )
      })}
    </div>
  )
}
