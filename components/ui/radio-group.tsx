'use client'

import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { Circle } from 'lucide-react'

import { cn } from '@/lib/utils'

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn('grid gap-3', className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'border-slate-200 text-pink-600 focus-visible:ring-4 focus-visible:ring-pink-500/5 aria-invalid:ring-rose-500/20 aria-invalid:border-rose-500 bg-white/80 backdrop-blur-md aspect-square size-6 shrink-0 rounded-full border shadow-sm transition-all duration-300 outline-none disabled:cursor-not-allowed disabled:opacity-50 hover:border-pink-500/30 data-[state=checked]:border-pink-600 data-[state=checked]:shadow-glow-pink',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <Circle className="fill-pink-600 absolute top-1/2 left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 shadow-glow-pink" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
