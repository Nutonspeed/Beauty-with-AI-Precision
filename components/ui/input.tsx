import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-slate-950 placeholder:text-slate-400 selection:bg-pink-500/10 selection:text-slate-950 dark:bg-white/5 border-slate-200 h-14 w-full min-w-0 rounded-2xl border bg-white/80 backdrop-blur-md px-6 py-2 text-base shadow-sm transition-all duration-500 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm italic font-medium',
        'focus-visible:border-pink-500/50 focus-visible:ring-4 focus-visible:ring-pink-500/5 hover:border-pink-500/30 shadow-inner',
        'aria-invalid:ring-rose-500/20 aria-invalid:border-rose-500',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
