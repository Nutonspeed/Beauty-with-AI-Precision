'use client'

import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'

import { cn } from '@/lib/utils'

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        'relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={
          'bg-slate-100 relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-3 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-3 shadow-inner border border-slate-200/50'
        }
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={
            'bg-gradient-to-r from-pink-500 to-rose-500 absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full shadow-glow-pink'
          }
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="border-white shadow-premium block size-7 shrink-0 rounded-full border-4 bg-white transition-all duration-500 hover:scale-110 hover:shadow-glow-pink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-500/20 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing relative"
        >
          <div className="absolute inset-0 rounded-full bg-pink-500/10 animate-pulse" />
        </SliderPrimitive.Thumb>
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
