'use client'

import * as React from 'react'
import * as TogglePrimitive from '@radix-ui/react-toggle'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all duration-500 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-pink-50 data-[state=on]:text-pink-600 data-[state=on]:shadow-premium [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:ring-4 focus-visible:ring-pink-500/5 outline-none whitespace-nowrap",
  {
    variants: {
      variant: {
        default: 'bg-transparent hover:bg-slate-50 hover:text-slate-900',
        outline:
          'border-2 border-slate-200 bg-white/80 backdrop-blur-md shadow-sm hover:bg-slate-50 hover:border-slate-300',
      },
      size: {
        default: 'h-12 px-6 min-w-12',
        sm: 'h-10 px-4 min-w-10',
        lg: 'h-14 px-8 min-w-14',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
