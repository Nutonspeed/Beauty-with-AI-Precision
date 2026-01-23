'use client'

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

import { cn } from '@/lib/utils'

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer data-[state=checked]:bg-pink-600 data-[state=unchecked]:bg-slate-200 focus-visible:ring-4 focus-visible:ring-pink-500/10 inline-flex h-8 w-14 shrink-0 items-center rounded-full border border-transparent shadow-inner transition-all duration-500 outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={
          'bg-white pointer-events-none block size-6 rounded-full shadow-premium transition-transform data-[state=checked]:translate-x-[1.6rem] data-[state=unchecked]:translate-x-1'
        }
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
