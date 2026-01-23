import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-slate-200 placeholder:text-slate-400 focus-visible:border-pink-500/50 focus-visible:ring-4 focus-visible:ring-pink-500/5 aria-invalid:ring-rose-500/20 aria-invalid:border-rose-500 flex field-sizing-content min-h-32 w-full rounded-[2rem] border bg-white/80 backdrop-blur-md px-6 py-4 text-base shadow-sm transition-all duration-500 outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm italic font-medium',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
