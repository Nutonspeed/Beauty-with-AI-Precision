import { cn } from '@/lib/utils'

function Kbd({ className, ...props }: React.ComponentProps<'kbd'>) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        'bg-slate-100/50 text-slate-500 pointer-events-none inline-flex h-6 min-w-6 items-center justify-center gap-1 rounded-lg px-2 font-mono text-[10px] font-black uppercase tracking-widest italic shadow-inner border border-slate-200/50 select-none',
        "[&_svg:not([class*='size-'])]:size-3.5",
        '[[data-slot=tooltip-content]_&]:bg-white/20 [[data-slot=tooltip-content]_&]:text-white [[data-slot=tooltip-content]_&]:border-white/10 dark:[[data-slot=tooltip-content]_&]:bg-white/10',
        className,
      )}
      {...props}
    />
  )
}

function KbdGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn('inline-flex items-center gap-1', className)}
      {...props}
    />
  )
}

export { Kbd, KbdGroup }
