import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[1.5rem] text-sm font-black uppercase tracking-widest italic transition-all duration-500 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95",
  {
    variants: {
      variant: {
        default: 'bg-slate-950 text-white hover:bg-slate-900 shadow-2xl shadow-slate-950/20 hover:shadow-slate-950/30 border-none',
        destructive:
          'bg-rose-600 text-white hover:bg-rose-700 shadow-2xl shadow-rose-600/20 border-none',
        outline:
          'border-2 bg-white/80 backdrop-blur-md border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-950 shadow-sm',
        secondary:
          'bg-slate-100 text-slate-900 hover:bg-slate-200 shadow-sm border-none',
        ghost:
          'hover:bg-slate-50 hover:text-slate-950',
        link: 'text-pink-600 underline-offset-4 hover:underline',
        premium: 'bg-gradient-to-r from-slate-950 via-slate-800 to-slate-950 bg-[length:200%_auto] text-white animate-gradient-x hover:shadow-premium shadow-2xl border-none',
        glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 shadow-glass',
      },
      size: {
        default: 'h-14 px-8 py-2',
        sm: 'h-10 rounded-2xl gap-1.5 px-5 text-[10px]',
        lg: 'h-16 rounded-[2rem] px-12 text-base',
        xl: 'h-20 rounded-[2.5rem] px-16 text-lg',
        icon: 'size-14 rounded-2xl',
        'icon-sm': 'size-10 rounded-xl',
        'icon-lg': 'size-16 rounded-[1.5rem]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
