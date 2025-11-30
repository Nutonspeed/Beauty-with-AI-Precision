"use client"

import * as React from "react"

type LogoProps = {
  className?: string
  title?: string
  variant?: 'default' | 'white' | 'dark'
}

// Modern AI-powered clinic logo mark
export function ClinicIQMark({ className, title, variant = 'default' }: LogoProps) {
  const ariaTitle = title || "ClinicIQ"
  
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
        <linearGradient id="logo_grad_cyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="logo_grad_glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      
      {/* Glow background */}
      <circle cx="24" cy="24" r="22" fill="url(#logo_grad_glow)" />
      
      {/* Main circle - gradient border */}
      <circle 
        cx="24" 
        cy="24" 
        r="18" 
        fill="none" 
        stroke="url(#logo_grad_cyan)" 
        strokeWidth="2.5"
      />
      
      {/* AI Brain/Sparkle Icon */}
      <g fill="url(#logo_grad_cyan)">
        {/* Central star/sparkle */}
        <path d="M24 14 L25.5 20 L32 21 L25.5 22 L24 28 L22.5 22 L16 21 L22.5 20 Z" />
        
        {/* Orbiting dots - representing AI analysis */}
        <circle cx="24" cy="10" r="2" opacity="0.8" />
        <circle cx="34" cy="18" r="1.5" opacity="0.6" />
        <circle cx="34" cy="30" r="1.5" opacity="0.6" />
        <circle cx="24" cy="38" r="2" opacity="0.8" />
        <circle cx="14" cy="30" r="1.5" opacity="0.6" />
        <circle cx="14" cy="18" r="1.5" opacity="0.6" />
      </g>
      
      {/* Inner ring */}
      <circle 
        cx="24" 
        cy="24" 
        r="10" 
        fill="none" 
        stroke="url(#logo_grad_cyan)" 
        strokeWidth="1"
        opacity="0.4"
      />
    </svg>
  )
}

// Modern text-based wordmark
export function ClinicIQWordmark({ className, title }: LogoProps) {
  const ariaTitle = title || "ClinicIQ"
  return (
    <span 
      className={`font-bold tracking-tight ${className}`}
      aria-label={ariaTitle}
    >
      <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 bg-clip-text text-transparent">
        Clinic
      </span>
      <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
        IQ
      </span>
    </span>
  )
}

// Alternative: Simple text with gradient
export function ClinicIQText({ className }: { className?: string }) {
  return (
    <span className={`font-bold ${className}`}>
      <span className="text-cyan-500">Clinic</span>
      <span className="text-blue-600">IQ</span>
    </span>
  )
}

export function ClinicIQLogo({ className, title }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`} aria-label={title || "ClinicIQ Logo"}>
      <ClinicIQMark className="h-9 w-9 sm:h-10 sm:w-10" />
      <ClinicIQWordmark className="text-xl sm:text-2xl" />
    </div>
  )
}

// Compact logo for mobile/small spaces
export function ClinicIQLogoCompact({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <ClinicIQMark className="h-8 w-8" />
      <span className="font-bold text-lg">
        <span className="text-cyan-500">C</span>
        <span className="text-blue-600">IQ</span>
      </span>
    </div>
  )
}

// Logo with tagline
export function ClinicIQLogoFull({ className }: { className?: string }) {
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center gap-2.5">
        <ClinicIQMark className="h-10 w-10" />
        <ClinicIQWordmark className="text-2xl" />
      </div>
      <span className="text-xs text-muted-foreground ml-12 -mt-1">
        AI-Powered Skin Analysis
      </span>
    </div>
  )
}
