'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'

import { cn } from '@/lib/utils'

interface ProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string
}

function Progress({
  className,
  value,
  indicatorClassName,
  ...props
}: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        'bg-slate-100 relative h-3 w-full overflow-hidden rounded-full shadow-inner border border-slate-200/50 p-0.5',
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn('bg-gradient-to-r from-pink-500 to-rose-500 h-full w-full flex-1 transition-all duration-700 shadow-glow-pink rounded-full', indicatorClassName)}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0)_100%)] animate-shimmer" />
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  )
}

export { Progress }
