import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { generateGoals } from '@/lib/api'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Loader2, Wand2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Goal } from '@/routes/_authenticated/sessions/$sessionId'

interface GoalsPanelProps {
  sessionId: string
  onRunTask: (task: string) => void
  generatedGoals: Goal[]
  onSetGeneratedGoals: (goals: Goal[]) => void
}

export function GoalsPanel({
  sessionId,
  onRunTask,
  generatedGoals,
  onSetGeneratedGoals,
}: GoalsPanelProps) {
  const [goal, setGoal] = useState('')

  const generateMutation = useMutation({
    mutationFn: generateGoals,
    onSuccess: (data) => {
      const kpis =
        data.tasks?.complex_kpis?.map((item: any) => ({
          title: item.kpi_name,
          description: item.description,
        })) || []
      onSetGeneratedGoals(kpis)
      toast.success(`${kpis.length} goals generated!`)
    },
    onError: (error) => toast.error(error.message),
  })

  const handleGenerate = () => {
    if (!goal.trim()) {
      toast.error('Please enter a goal first.')
      return
    }
    generateMutation.mutate({ sessionId, goal })
  }

  return (
    <div className='space-y-6'>
      <div className='relative'>
        <Input
          placeholder='Enter your main analysis goal...'
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          disabled={generateMutation.isPending}
        />
        <Button
          size='icon'
          className='absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8'
          onClick={handleGenerate}
          disabled={generateMutation.isPending}
        >
          {generateMutation.isPending ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Wand2 className='h-4 w-4' />
          )}
        </Button>
      </div>

      <div className='space-y-4'>
        {generatedGoals.map((g, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className='text-base'>{g.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground mb-4'>
                {g.description}
              </p>
              <Button size='sm' onClick={() => onRunTask(g.description)}>
                Run Goal
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}