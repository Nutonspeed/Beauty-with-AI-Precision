import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

function ItemGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      role="list"
      data-slot="item-group"
      className={cn('group/item-group flex flex-col', className)}
      {...props}
    />
  )
}

function ItemSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="item-separator"
      orientation="horizontal"
      className={cn('my-0', className)}
      {...props}
    />
  )
}

const itemVariants = cva(
  'group/item flex items-center border border-transparent text-sm rounded-2xl transition-all duration-500 [a&]:hover:bg-pink-50/50 [a&]:hover:border-pink-500/10 flex-wrap outline-none focus-visible:ring-4 focus-visible:ring-pink-500/5',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline: 'border-slate-100 bg-white/80 backdrop-blur-sm shadow-sm',
        muted: 'bg-slate-50/50',
      },
      size: {
        default: 'p-6 gap-6',
        sm: 'py-4 px-6 gap-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Item({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'div'> &
  VariantProps<typeof itemVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="item"
      data-variant={variant}
      data-size={size}
      className={cn(itemVariants({ variant, size, className }))}
      {...props}
    />
  )
}

const itemMediaVariants = cva(
  'flex shrink-0 items-center justify-center gap-3 group-has-[[data-slot=item-description]]/item:self-start [&_svg]:pointer-events-none group-has-[[data-slot=item-description]]/item:translate-y-0.5 transition-all duration-500',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        icon: "size-12 border border-slate-100 rounded-xl bg-slate-50/50 text-slate-400 group-hover/item:text-pink-600 group-hover/item:bg-pink-50/50 group-hover/item:border-pink-500/20 shadow-inner [&_svg:not([class*='size-'])]:size-6",
        image:
          'size-14 rounded-xl overflow-hidden [&_img]:size-full [&_img]:object-cover border border-slate-100 shadow-sm group-hover/item:shadow-glow-pink/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function ItemMedia({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof itemMediaVariants>) {
  return (
    <div
      data-slot="item-media"
      data-variant={variant}
      className={cn(itemMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

function ItemContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-content"
      className={cn(
        'flex flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none',
        className,
      )}
      {...props}
    />
  )
}

function ItemTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-title"
      className={cn(
        'flex w-fit items-center gap-2 text-sm leading-snug font-black uppercase tracking-widest italic text-slate-950',
        className,
      )}
      {...props}
    />
  )
}

function ItemDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="item-description"
      className={cn(
        'text-slate-500 line-clamp-2 text-sm leading-relaxed font-medium italic text-balance',
        '[&>a:hover]:text-pink-600 [&>a]:underline [&>a]:underline-offset-4',
        className,
      )}
      {...props}
    />
  )
}

function ItemActions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-actions"
      className={cn('flex items-center gap-2', className)}
      {...props}
    />
  )
}

function ItemHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-header"
      className={cn(
        'flex basis-full items-center justify-between gap-2',
        className,
      )}
      {...props}
    />
  )
}

function ItemFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-footer"
      className={cn(
        'flex basis-full items-center justify-between gap-2',
        className,
      )}
      {...props}
    />
  )
}

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
}
