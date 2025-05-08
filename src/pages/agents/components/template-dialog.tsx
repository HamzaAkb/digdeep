import { useContext, useState } from 'react'
import { format } from 'date-fns'
import { ChatContext } from '@/contexts/chat-context'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { generateRedReportTaskDefinition } from '@/queries'

export interface TemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function TemplateDialog({
  open,
  onOpenChange,
}: TemplateDialogProps) {
  const { sendTask } = useContext(ChatContext)
  const [redReportChecked, setRedReportChecked] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const handleDateSelect = (range: DateRange | undefined) => {
    setDateRange(range)
    if (range?.to) setCalendarOpen(false)
  }

  const handleRun = () => {
    if (redReportChecked && dateRange?.from && dateRange.to) {
      const start = format(dateRange.from, 'yyyy-MM-dd')
      const end = format(dateRange.to, 'yyyy-MM-dd')
      const payload = generateRedReportTaskDefinition(start, end)
      sendTask(JSON.stringify(payload))
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl w-full'>
        <DialogHeader>
          <DialogTitle>Templates</DialogTitle>
        </DialogHeader>

        <div className='flex items-center justify-between mb-4'>
          <label className='flex items-center space-x-2'>
            <input
              type='checkbox'
              checked={redReportChecked}
              onChange={() => setRedReportChecked((c) => !c)}
              className='h-4 w-4'
            />
            <span className='text-sm'>Red Report</span>
          </label>
          <div className='relative'>
            <Button
              variant='outline'
              className={
                dateRange
                  ? 'w-[300px] justify-start text-left'
                  : 'w-[300px] justify-start text-left text-muted-foreground'
              }
              onClick={() => setCalendarOpen((o) => !o)}
            >
              <CalendarIcon className='mr-2' />
              {dateRange?.from
                ? dateRange.to
                  ? `${format(dateRange.from, 'LLL dd, y')} - ${format(
                      dateRange.to,
                      'LLL dd, y'
                    )}`
                  : format(dateRange.from, 'LLL dd, y')
                : 'Pick a date'}
            </Button>

            {calendarOpen && (
              <div className='absolute z-50 mt-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg'>
                <Calendar
                  initialFocus
                  mode='range'
                  defaultMonth={dateRange?.from || new Date()}
                  selected={dateRange}
                  onSelect={handleDateSelect}
                  numberOfMonths={2}
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleRun}
            disabled={!redReportChecked || !dateRange?.to}
          >
            Run
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
