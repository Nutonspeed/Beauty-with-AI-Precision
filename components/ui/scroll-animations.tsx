"use client"

import React, { useRef, ReactNode } from 'react'
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion'
import { cn } from '@/lib/utils'

// ============================================
// 1. PARALLAX SECTION - Layers move at different speeds
// ============================================
interface ParallaxSectionProps {
  children: ReactNode
  className?: string
  speed?: number // -1 to 1, negative = opposite direction
  offset?: [string, string]
}

export function ParallaxSection({ 
  children, 
  className,
  speed = 0.5,
  offset = ["start end", "end start"]
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset as any
  })

  const y = useTransform(scrollYProgress, [0, 1], [speed * -100, speed * 100])
  const smoothY = useSpring(y, { damping: 30, stiffness: 100 })

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div style={{ y: smoothY }}>
        {children}
      </motion.div>
    </div>
  )
}

// ============================================
// 2. SCROLL REVEAL - Elements reveal as you scroll
// ============================================
interface ScrollRevealProps {
  children: ReactNode
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'rotate'
  delay?: number
  duration?: number
  once?: boolean
}

export function ScrollReveal({
  children,
  className,
  direction = 'up',
  delay = 0,
  duration = 0.8,
  once = true
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.4"]
  })

  // Handle unused 'once' prop
  const _unusedOnce = once;

  /*
  const getInitialTransform = () => {
    switch (direction) {
      case 'up': return { y: 80, opacity: 0 }
      case 'down': return { y: -80, opacity: 0 }
      case 'left': return { x: 80, opacity: 0 }
      case 'right': return { x: -80, opacity: 0 }
      case 'scale': return { scale: 0.8, opacity: 0 }
      case 'rotate': return { rotate: -10, opacity: 0, scale: 0.9 }
      default: return { y: 80, opacity: 0 }
    }
  }
  */

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 1])
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [80, 0, 0])
  const x = useTransform(scrollYProgress, [0, 0.5, 1], [direction === 'left' ? 80 : direction === 'right' ? -80 : 0, 0, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [direction === 'scale' || direction === 'rotate' ? 0.8 : 1, 1, 1])
  const rotate = useTransform(scrollYProgress, [0, 0.5, 1], [direction === 'rotate' ? -10 : 0, 0, 0])

  return (
    <div ref={ref} className={cn("relative", className)}>
      <motion.div
        style={{ 
          opacity,
          y: direction === 'up' || direction === 'down' ? y : 0,
          x: direction === 'left' || direction === 'right' ? x : 0,
          scale,
          rotate
        }}
        transition={{ duration, delay }}
      >
        {children}
      </motion.div>
    </div>
  )
}

// ============================================
// 3. STICKY REVEAL SECTION - Content changes while section stays pinned
// ============================================
interface StickyRevealProps {
  children: ReactNode[]
  className?: string
  stickyHeight?: string
}

export function StickyRevealSection({
  children,
  className,
  stickyHeight = "300vh"
}: StickyRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const childCount = React.Children.count(children)

  return (
    <div 
      ref={containerRef} 
      className={cn("relative", className)}
      style={{ height: stickyHeight }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {React.Children.map(children, (child, index) => {
          const _start = index / childCount
          const _end = (index + 1) / childCount
          
          return (
            <StickyChild 
              key={index}
              scrollYProgress={scrollYProgress}
              index={index}
              total={childCount}
            >
              {child}
            </StickyChild>
          )
        })}
      </div>
    </div>
  )
}

function StickyChild({ 
  children, 
  scrollYProgress, 
  index, 
  total 
}: { 
  children: ReactNode
  scrollYProgress: MotionValue<number>
  index: number
  total: number
}) {
  const start = index / total
  const end = (index + 1) / total
  const mid = start + (end - start) / 2

  const opacity = useTransform(
    scrollYProgress,
    [start, start + 0.1, end - 0.1, end],
    [0, 1, 1, 0]
  )

  const y = useTransform(
    scrollYProgress,
    [start, mid, end],
    [50, 0, -50]
  )

  const scale = useTransform(
    scrollYProgress,
    [start, mid, end],
    [0.95, 1, 0.95]
  )

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      style={{ opacity, y, scale }}
    >
      {children}
    </motion.div>
  )
}

// ============================================
// 4. HORIZONTAL SCROLL ON VERTICAL SCROLL
// ============================================
interface HorizontalScrollProps {
  children: ReactNode
  className?: string
  speed?: number
}

export function HorizontalScrollSection({
  children,
  className,
  speed = 1
}: HorizontalScrollProps) {
  // Handle unused 'speed' prop
  const _unusedSpeed = speed;
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const childCount = React.Children.count(children)
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", `-${(childCount - 1) * 100}%`]
  )
  const smoothX = useSpring(x, { damping: 30, stiffness: 100 })

  return (
    <div 
      ref={containerRef} 
      className={cn("relative", className)}
      style={{ height: `${childCount * 100}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div 
          className="flex h-full"
          style={{ x: smoothX }}
        >
          {React.Children.map(children, (child, index) => (
            <div key={index} className="w-screen h-full flex-shrink-0">
              {child}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

// ============================================
// 5. TEXT REVEAL CHARACTER BY CHARACTER
// ============================================
interface TextRevealProps {
  text: string
  className?: string
  charClassName?: string
  staggerDelay?: number
}

export function TextRevealByChar({
  text,
  className,
  charClassName,
  staggerDelay = 0.03
}: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.3"]
  })

  const chars = text.split('')

  return (
    <div ref={ref} className={cn("relative", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-flex flex-wrap">
        {chars.map((char, i) => {
          const start = i * staggerDelay
          const end = start + 0.3
          
          return (
            <CharReveal 
              key={i} 
              char={char}
              scrollYProgress={scrollYProgress}
              start={Math.min(start, 0.7)}
              end={Math.min(end, 1)}
              className={charClassName}
            />
          )
        })}
      </span>
    </div>
  )
}

function CharReveal({
  char,
  scrollYProgress,
  start,
  end,
  className
}: {
  char: string
  scrollYProgress: MotionValue<number>
  start: number
  end: number
  className?: string
}) {
  const opacity = useTransform(scrollYProgress, [start, end], [0.15, 1])
  const y = useTransform(scrollYProgress, [start, end], [20, 0])

  return (
    <motion.span 
      className={cn("inline-block", className)}
      style={{ opacity, y }}
    >
      {char === ' ' ? '\u00A0' : char}
    </motion.span>
  )
}

// ============================================
// 6. SCROLL PROGRESS INDICATOR
// ============================================
interface ScrollProgressProps {
  className?: string
  color?: string
}

export function ScrollProgressBar({ className, color = "bg-blue-600" }: ScrollProgressProps) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { damping: 30, stiffness: 100 })

  return (
    <motion.div
      className={cn("fixed top-0 left-0 right-0 h-1 origin-left z-50", color, className)}
      style={{ scaleX }}
    />
  )
}

// ============================================
// 7. 3D TILT ON SCROLL
// ============================================
interface Tilt3DProps {
  children: ReactNode
  className?: string
  perspective?: number
  maxRotate?: number
}

export function Tilt3DOnScroll({
  children,
  className,
  perspective = 1000,
  maxRotate = 15
}: Tilt3DProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [maxRotate, 0, -maxRotate])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.9])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.5, 1, 1, 0.5])

  return (
    <div 
      ref={ref} 
      className={cn("relative", className)}
      style={{ perspective }}
    >
      <motion.div
        style={{ 
          rotateX, 
          scale,
          opacity,
          transformStyle: "preserve-3d"
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}

// ============================================
// 8. PARALLAX BACKGROUND LAYERS
// ============================================
interface ParallaxLayer {
  speed: number
  className?: string
  content?: ReactNode
}

interface ParallaxLayersProps {
  children: ReactNode
  className?: string
  layers?: ParallaxLayer[]
}

function ParallaxLayerItem({ layer, scrollYProgress }: { layer: ParallaxLayer, scrollYProgress: MotionValue<number> }) {
  const y = useTransform(
    scrollYProgress, 
    [0, 1], 
    [layer.speed * -200, layer.speed * 200]
  )
  
  return (
    <motion.div
      className={cn("absolute inset-0 pointer-events-none", layer.className)}
      style={{ y }}
    >
      {layer.content}
    </motion.div>
  )
}

export function ParallaxLayers({
  children,
  className,
  layers = []
}: ParallaxLayersProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      {/* Background Layers */}
      {layers.map((layer, i) => (
        <ParallaxLayerItem key={i} layer={layer} scrollYProgress={scrollYProgress} />
      ))}
      
      {/* Main Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

// ============================================
// 9. ZOOM ON SCROLL
// ============================================
interface ZoomOnScrollProps {
  children: ReactNode
  className?: string
  startScale?: number
  endScale?: number
}

export function ZoomOnScroll({
  children,
  className,
  startScale = 0.8,
  endScale = 1
}: ZoomOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"]
  })

  const scale = useTransform(scrollYProgress, [0, 1], [startScale, endScale])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 1], [0, 1, 1])

  return (
    <div ref={ref} className={cn("relative", className)}>
      <motion.div style={{ scale, opacity }}>
        {children}
      </motion.div>
    </div>
  )
}

// ============================================
// 10. MASK REVEAL ON SCROLL
// ============================================
interface MaskRevealProps {
  children: ReactNode
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right'
}

export function MaskRevealOnScroll({
  children,
  className,
  direction = 'up'
}: MaskRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "start 0.3"]
  })

  const clipPathValue = useTransform(scrollYProgress, [0, 1], [
    direction === 'up' ? 'inset(100% 0 0 0)' : 
    direction === 'down' ? 'inset(0 0 100% 0)' :
    direction === 'left' ? 'inset(0 100% 0 0)' :
    'inset(0 0 0 100%)',
    'inset(0)'
  ])

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div
        style={{ 
          clipPath: clipPathValue
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}
