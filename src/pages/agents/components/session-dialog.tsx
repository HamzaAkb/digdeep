import { useState } from 'react'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import CreateSession from './create-session'

export default function SessionDialog() {
  const [step, setStep] = useState(0)

  return (
    <Dialog>
      <DialogTrigger>
        <Plus className='size-4 cursor-pointer' />
      </DialogTrigger>

      <DialogContent className='!max-w-none w-[800px]'>
        <DialogHeader>
          <DialogTitle>
            {step === 0 ? 'Start a new session' : 'Clarification form'}
          </DialogTitle>
          <DialogDescription>
            {step === 0
              ? 'Provide a brief description and upload your data files.'
              : 'Answer a few questions so we can better understand your data.'}
          </DialogDescription>
        </DialogHeader>

        {step == 0 && <CreateSession handleStepChange={() => {}} />}

        <DialogFooter className='sm:justify-end'>
          <DialogClose asChild>
            <Button variant='secondary'>Close</Button>
          </DialogClose>
          <Button
            onClick={() => {
              setStep(1)
            }}
          >
            Next
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
