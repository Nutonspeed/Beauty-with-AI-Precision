'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import type {
  TabsProps,
  TabsListProps,
  TabsTriggerProps,
  TabsContentProps,
} from '@radix-ui/react-tabs'

import { cn } from '@/lib/utils'

type TabsPropsWithClassName = TabsProps & { className?: string }
type TabsListPropsWithClassName = TabsListProps & { className?: string }
type TabsTriggerPropsWithClassName = TabsTriggerProps & { className?: string }
type TabsContentPropsWithClassName = TabsContentProps & { className?: string }

function Tabs({
  className,
  ...props
}: TabsPropsWithClassName) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: TabsListPropsWithClassName) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        'bg-slate-50 border border-slate-100 text-slate-400 inline-flex h-14 w-fit items-center justify-center rounded-2xl p-1.5 shadow-inner',
        className,
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: TabsTriggerPropsWithClassName) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-white data-[state=active]:text-pink-600 data-[state=active]:shadow-premium text-slate-400 inline-flex h-full flex-1 items-center justify-center gap-2.5 rounded-xl border border-transparent px-6 py-2 text-[10px] font-black uppercase tracking-widest italic whitespace-nowrap transition-all duration-500 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: TabsContentPropsWithClassName) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
