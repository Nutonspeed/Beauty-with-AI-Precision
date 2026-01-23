import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-4 py-1 text-[9px] font-black uppercase tracking-[0.3em] italic w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-2 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-500 overflow-hidden shadow-sm',
  {
    variants: {
      variant: {
        default:
          'border-none bg-slate-950 text-white shadow-lg shadow-slate-950/10 hover:bg-slate-800',
        secondary:
          'border-none bg-slate-100 text-slate-950 hover:bg-slate-200',
        destructive:
          'border-none bg-rose-600 text-white shadow-lg shadow-rose-600/10 hover:bg-rose-700',
        outline:
          'text-slate-950 border-slate-200 bg-white/80 backdrop-blur-md hover:border-pink-500/30 hover:text-pink-600',
        premium:
          'border-none bg-gradient-to-r from-slate-950 via-slate-800 to-slate-950 bg-[length:200%_auto] text-white animate-gradient-x shadow-xl hover:shadow-glow-pink/20',
        glass:
          'bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-glass hover:bg-white/20',
        pink:
          'border-none bg-pink-50 text-pink-600 shadow-inner hover:bg-pink-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
