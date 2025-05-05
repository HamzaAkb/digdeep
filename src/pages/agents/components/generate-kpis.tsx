import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { SendHorizontal } from 'lucide-react'

const kpis = [
  {
    title: 'Survival Rate by Passenger Class and Gender',
    description:
      'Measures the percentage of survivors segmented by passenger class (1st, 2nd, 3rd) and gender to identify demographic survival differences.',
  },
  {
    title: 'Average Fare by Embarkation Port',
    description:
      'Calculates the mean ticket fare paid by passengers from each embarkation port (Cherbourg, Queenstown, Southampton) to detect pricing variations.',
  },
  {
    title: 'Survival Correlation with Age',
    description:
      'Assesses how passenger age correlates with survival probability to understand age-based risk factors.',
  },
  {
    title: 'Family Survival Impact',
    description:
      'Compares survival rates of passengers traveling alone versus those with family (siblings/spouses, parents/children) to gauge family effect.',
  },
  {
    title: 'Survival Rate by Cabin Deck',
    description:
      'Determines survival percentages by cabin deck letter (A–G, T) inferred from cabin numbers to explore spatial safety patterns.',
  },
]

export default function GenerateKPIs() {
  const [goal, setGoal] = useState('')

  return (
    <div className='h-full p-4'>
      <div className='flex justify-center my-12'>
        <div className='relative w-[500px] '>
          <Textarea
            placeholder='Enter your task goal'
            className='h-24'
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
          <SendHorizontal
            className='size-4 absolute bottom-3 right-3 cursor-pointer'
            onClick={() => setGoal('')}
          />
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className='border rounded-lg p-4 hover:shadow-md transition cursor-pointer'
          >
            <div className='font-semibold mb-2'>{kpi.title}</div>
            <div className='text-sm text-gray-600'>{kpi.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
