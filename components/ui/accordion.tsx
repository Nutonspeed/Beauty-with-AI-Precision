'use client'

import * as React from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('border-b border-slate-100 last:border-b-0 hover:bg-slate-50/30 transition-all duration-500 rounded-3xl mb-2 last:mb-0', className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'focus-visible:ring-4 focus-visible:ring-pink-500/5 flex flex-1 items-center justify-between gap-4 py-8 px-6 text-left text-[10px] font-black uppercase tracking-[0.3em] italic transition-all duration-500 outline-none [&[data-state=open]>svg]:rotate-180 group',
          className,
        )}
        {...props}
      >
        {children}
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 group-data-[state=open]:bg-pink-50 transition-colors duration-500">
          <ChevronDown className="text-slate-400 pointer-events-none size-4 transition-transform duration-500 group-hover:text-pink-600 group-data-[state=open]:text-pink-600" />
        </div>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-xs italic font-medium text-slate-500 leading-relaxed"
      {...props}
    >
      <div className={cn('px-6 pb-8 pt-0', className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
