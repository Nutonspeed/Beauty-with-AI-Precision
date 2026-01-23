"use client"

import React, { useRef } from "react"
import { motion, useMotionValue } from "framer-motion"
import { cn } from "@/lib/utils"

interface GlowCardProps {
  children: React.ReactNode
  className?: string
  glowColor?: string
}

export function GlowCard({ 
  children, 
  className, 
  glowColor = "rgba(236, 72, 153, 0.15)" 
}: GlowCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const { left, top } = containerRef.current.getBoundingClientRect()
    mouseX.set(e.clientX - left)
    mouseY.set(e.clientY - top)
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white/80 backdrop-blur-md transition-all duration-500 group shadow-premium hover:shadow-glow-pink hover:border-pink-200",
        className
      )}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${mouseX}px ${mouseY}px, ${glowColor}, transparent 40%)`,
        }}
      />
      
      {/* Scanner Effect Line */}
      <motion.div 
        className="pointer-events-none absolute left-0 right-0 h-[1px] bg-pink-500/20 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ top: mouseY }}
      />

      <div className="relative z-20">
        {children}
      </div>
    </div>
  )
}
