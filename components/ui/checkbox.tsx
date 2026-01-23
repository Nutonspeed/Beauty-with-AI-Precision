import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer h-6 w-6 shrink-0 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-md shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-500/5 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-pink-600 data-[state=checked]:text-white data-[state=checked]:border-pink-600 data-[state=checked]:shadow-glow-pink hover:border-pink-500/30',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className={cn('flex items-center justify-center text-current')}
      >
        <Check className="h-4 w-4 stroke-[3]" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
