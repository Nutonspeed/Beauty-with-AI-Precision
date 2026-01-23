"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type LogoProps = {
  className?: string
  title?: string
  variant?: 'default' | 'white' | 'dark'
}

// 2026 High-End Aesthetic Logo Mark
export function CenterIQMark({ className, title, variant = 'default' }: LogoProps) {
  const ariaTitle = title || "CenterIQ"
  
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      role="img"
      aria-label={ariaTitle}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{ariaTitle}</title>
      <defs>
        <linearGradient id="logo_2026_silver" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="50%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <linearGradient id="logo_2026_accent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" /> {/* Pink-500 */}
          <stop offset="100%" stopColor="#3b82f6" /> {/* Blue-500 */}
        </linearGradient>
        <filter id="logo_glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Outer Prism - Sharp and Minimal */}
      <path 
        d="M24 4 L40 14 L40 34 L24 44 L8 34 L8 14 Z" 
        fill="none" 
        stroke={variant === 'white' ? 'white' : 'url(#logo_2026_silver)'} 
        strokeWidth="1"
        strokeOpacity="0.3"
      />
      
      {/* Core Precision Diamond */}
      <path 
        d="M24 12 L32 24 L24 36 L16 24 Z" 
        fill="url(#logo_2026_accent)" 
        filter="url(#logo_glow)"
      />
      
      {/* Precision Crosshair / Reflection */}
      <path 
        d="M24 8 V40 M8 24 H40" 
        stroke={variant === 'white' ? 'white' : 'url(#logo_2026_silver)'} 
        strokeWidth="0.5" 
        strokeOpacity="0.2" 
      />
      
      {/* Active Data Nodes */}
      <circle cx="24" cy="12" r="1" fill="#ec4899" />
      <circle cx="32" cy="24" r="1" fill="#3b82f6" />
      <circle cx="24" cy="36" r="1" fill="#ec4899" />
      <circle cx="16" cy="24" r="1" fill="#3b82f6" />
    </svg>
  )
}

// 2026 High-End Typography
export function CenterIQWordmark({ className, title }: LogoProps) {
  const ariaTitle = title || "CenterIQ"
  return (
    <span 
      className={cn(
        "font-black tracking-[0.2em] uppercase italic text-slate-950",
        className
      )}
      aria-label={ariaTitle}
    >
      Center
      <span className="bg-gradient-to-r from-pink-500 to-blue-600 bg-clip-text text-transparent not-italic ml-1">
        IQ
      </span>
    </span>
  )
}

// Alternative: Simple text with gradient (2026 Refined)
export function CenterIQText({ className }: { className?: string }) {
  return (
    <span className={cn("font-black tracking-[0.1em] uppercase italic", className)}>
      <span className="text-slate-900">Center</span>
      <span className="text-pink-500 not-italic ml-0.5">IQ</span>
    </span>
  )
}

export function CenterIQLogo({ className, title }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`} aria-label={title || "CenterIQ Logo"}>
      <CenterIQMark className="h-9 w-9 sm:h-10 sm:w-10" />
      <CenterIQWordmark className="text-xl sm:text-2xl" />
    </div>
  )
}

// Compact logo for mobile/small spaces (2026 Refined)
export function CenterIQLogoCompact({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <CenterIQMark className="h-8 w-8" />
      <span className="font-black text-lg tracking-tighter italic text-slate-950">
        C<span className="text-pink-500 not-italic">IQ</span>
      </span>
    </div>
  )
}

// Logo with tagline (2026 High-End)
export function CenterIQLogoFull({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center md:items-start", className)}>
      <div className="flex items-center gap-3">
        <CenterIQMark className="h-12 w-12" />
        <CenterIQWordmark className="text-3xl" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1.5 mt-2 italic">
        Aesthetic Intelligence Layer
      </span>
    </div>
  )
}
