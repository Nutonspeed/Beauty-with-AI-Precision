'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { DateRange } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  className?: string
}

export function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-[300px] h-14 justify-start text-left font-black uppercase tracking-widest italic text-[10px] rounded-2xl bg-white/80 backdrop-blur-md border-slate-200 shadow-sm hover:border-pink-500/30 transition-all duration-300',
              !value && 'text-slate-400'
            )}
          >
            <div className="size-8 rounded-xl bg-slate-50 flex items-center justify-center mr-3 shadow-inner text-pink-600">
              <CalendarIcon className="size-4" />
            </div>
            {value?.from ? (
              value.to ? (
                <span className="text-slate-950">
                  {format(value.from, 'LLL dd, y')} -{' '}
                  {format(value.to, 'LLL dd, y')}
                </span>
              ) : (
                <span className="text-slate-950">{format(value.from, 'LLL dd, y')}</span>
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 rounded-[3rem] border-slate-100 shadow-premium overflow-hidden" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
