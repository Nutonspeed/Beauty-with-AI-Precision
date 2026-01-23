'use client'

import * as React from 'react'
import { GripVertical } from 'lucide-react'
import * as ResizablePrimitive from 'react-resizable-panels'

import { cn } from '@/lib/utils'

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) {
  return (
    <ResizablePrimitive.PanelGroup
      data-slot="resizable-panel-group"
      className={cn(
        'flex h-full w-full data-[panel-group-direction=vertical]:flex-col',
        className,
      )}
      {...props}
    />
  )
}

function ResizablePanel({
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) {
  return (
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        'bg-slate-100/50 hover:bg-pink-500/30 focus-visible:ring-4 focus-visible:ring-pink-500/5 relative flex w-1.5 items-center justify-center transition-all duration-500 focus-visible:outline-hidden data-[panel-group-direction=vertical]:h-1.5 data-[panel-group-direction=vertical]:w-full',
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="bg-white z-10 flex h-6 w-4 items-center justify-center rounded-lg border border-slate-200 shadow-premium">
          <GripVertical className="size-3 text-slate-400" />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
