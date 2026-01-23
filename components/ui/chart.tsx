"use client"

import * as React from "react"
import { ResponsiveContainer } from "recharts"

import { cn } from "@/lib/utils"

export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: Record<string, { label: string; color?: string }>
    children: React.ComponentProps<typeof ResponsiveContainer>["children"]
  }
>(({ className, children, config, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("flex aspect-video justify-center text-xs", className)} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
})
ChartContainer.displayName = "ChartContainer"

export const ChartTooltip = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-slate-100 bg-white/90 backdrop-blur-md p-3 shadow-premium text-[10px] font-black uppercase tracking-widest italic",
          className
        )}
        {...props}
      />
    )
  }
)
ChartTooltip.displayName = "ChartTooltip"

export const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
  }
>(({ className, hideLabel, hideIndicator, indicator: _indicator = "dot", ...props }, ref) => {
  return (
    <div ref={ref} className={cn("grid gap-2", className)} {...props}>
      {!hideLabel && <div className="font-black text-pink-600 mb-1">{props.children}</div>}
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

export const ChartLegend = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("flex items-center justify-center gap-4", className)} {...props} />
  }
)
ChartLegend.displayName = "ChartLegend"

export const ChartLegendContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("flex items-center gap-1.5", className)} {...props} />
  }
)
ChartLegendContent.displayName = "ChartLegendContent"
