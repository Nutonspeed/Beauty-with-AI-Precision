'use client'

import * as React from 'react'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { DayButton, DayPicker, getDefaultClassNames } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  buttonVariant = 'outline',
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>['variant']
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        'bg-white group/calendar p-6 rounded-[3rem] border border-slate-100 shadow-premium [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent',
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString('default', { month: 'short' }),
        ...formatters,
      }}
      classNames={{
        root: cn('w-fit', defaultClassNames.root),
        months: cn(
          'flex gap-6 flex-col md:flex-row relative',
          defaultClassNames.months,
        ),
        month: cn('flex flex-col w-full gap-6', defaultClassNames.month),
        nav: cn(
          'flex items-center gap-2 w-full absolute top-0 inset-x-0 justify-between',
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant, size: 'icon-sm' }),
          'rounded-xl aria-disabled:opacity-50 p-0 select-none hover:bg-pink-50 hover:text-pink-600 transition-all duration-300',
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant, size: 'icon-sm' }),
          'rounded-xl aria-disabled:opacity-50 p-0 select-none hover:bg-pink-50 hover:text-pink-600 transition-all duration-300',
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          'flex items-center justify-center h-12 w-full px-12 text-[10px] font-black uppercase tracking-[0.3em] italic text-slate-950',
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          'w-full flex items-center text-[10px] font-black uppercase tracking-widest italic justify-center h-10 gap-2',
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          'relative border border-slate-100 bg-slate-50/50 shadow-inner rounded-xl px-2',
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn(
          'absolute bg-white inset-0 opacity-0',
          defaultClassNames.dropdown,
        ),
        caption_label: cn(
          'select-none font-black text-[10px] uppercase tracking-[0.3em] italic text-slate-950',
          captionLayout === 'label'
            ? ''
            : 'rounded-xl pl-3 pr-2 flex items-center gap-2 h-10 bg-slate-50 border border-slate-100 [&>svg]:text-slate-400 [&>svg]:size-3.5',
          defaultClassNames.caption_label,
        ),
        table: 'w-full border-collapse',
        weekdays: cn('flex gap-1', defaultClassNames.weekdays),
        weekday: cn(
          'text-slate-400 rounded-xl flex-1 font-black text-[8px] uppercase tracking-widest select-none py-3 italic',
          defaultClassNames.weekday,
        ),
        week: cn('flex w-full mt-1 gap-1', defaultClassNames.week),
        day: cn(
          'relative w-10 h-10 p-0 text-center group/day aspect-square select-none flex items-center justify-center',
          defaultClassNames.day,
        ),
        range_start: cn(
          'rounded-xl bg-pink-50 text-pink-600',
          defaultClassNames.range_start,
        ),
        range_middle: cn('rounded-none bg-pink-50/50 text-pink-600', defaultClassNames.range_middle),
        range_end: cn('rounded-xl bg-pink-50 text-pink-600', defaultClassNames.range_end),
        today: cn(
          'bg-slate-950 text-white rounded-xl shadow-lg',
          defaultClassNames.today,
        ),
        outside: cn(
          'text-slate-300 aria-selected:text-slate-400',
          defaultClassNames.outside,
        ),
        disabled: cn(
          'text-slate-200 opacity-50 cursor-not-allowed',
          defaultClassNames.disabled,
        ),
        hidden: cn('invisible', defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === 'left') {
            return (
              <ChevronLeft className={cn('size-4', className)} {...props} />
            )
          }

          if (orientation === 'right') {
            return (
              <ChevronRight className={cn('size-4', className)} {...props} />
            )
          }

          return (
            <ChevronDown className={cn('size-4', className)} {...props} />
          )
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        'data-[selected-single=true]:bg-pink-600 data-[selected-single=true]:text-white data-[selected-single=true]:shadow-glow-pink data-[range-middle=true]:bg-pink-50 data-[range-middle=true]:text-pink-600 data-[range-start=true]:bg-pink-600 data-[range-start=true]:text-white data-[range-start=true]:shadow-glow-pink data-[range-end=true]:bg-pink-600 data-[range-end=true]:text-white data-[range-end=true]:shadow-glow-pink hover:bg-pink-50 hover:text-pink-600 flex items-center justify-center size-10 rounded-xl leading-none font-black text-[10px] uppercase tracking-widest italic transition-all duration-300 focus-visible:ring-4 focus-visible:ring-pink-500/10 [&>span]:text-[8px] [&>span]:font-black',
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
