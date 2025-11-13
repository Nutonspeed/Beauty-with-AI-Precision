"use client"

import * as React from "react"

type LogoProps = {
  className?: string
  title?: string
}

// Modern medical-tech mark: sharp geometric design
export function ClinicIQMark({ className, title }: LogoProps) {
  const ariaTitle = title || "ClinicIQ"
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      role="img"
      aria-label={ariaTitle}
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="geometricPrecision"
    >
      <title>{ariaTitle}</title>
      <defs>
        <linearGradient id="ciq_grad_main" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--accent))" />
        </linearGradient>
        <filter id="ciq_shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="0.5"/>
          <feOffset dx="0" dy="0.5" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.15"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Outer ring with solid fill for presence */}
      <circle 
        cx="24" 
        cy="24" 
        r="20" 
        fill="url(#ciq_grad_main)" 
        opacity="0.12"
      />
      
      {/* Main Q shape - bold and clean */}
      <circle 
        cx="24" 
        cy="24" 
        r="14" 
        fill="none" 
        stroke="url(#ciq_grad_main)" 
        strokeWidth="3"
        filter="url(#ciq_shadow)"
      />
      
      {/* Q tail - strong diagonal */}
      <line
        x1="33"
        y1="33"
        x2="40"
        y2="40"
        stroke="url(#ciq_grad_main)"
        strokeWidth="3"
        strokeLinecap="round"
        filter="url(#ciq_shadow)"
      />
      
      {/* Medical plus - modern and sharp */}
      <g filter="url(#ciq_shadow)">
        <rect x="22.5" y="18" width="3" height="12" rx="1" fill="hsl(var(--primary))" opacity="0.9"/>
        <rect x="18" y="22.5" width="12" height="3" rx="1" fill="hsl(var(--primary))" opacity="0.9"/>
      </g>
    </svg>
  )
}

// Wordmark: clean, geometric sans with subtle weight contrast, built with paths for SSR safety
export function ClinicIQWordmark({ className, title }: LogoProps) {
  const ariaTitle = title || "ClinicIQ"
  return (
    <svg
      className={className}
      viewBox="0 0 300 64"
      role="img"
      aria-label={ariaTitle}
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="geometricPrecision"
    >
      <title>{ariaTitle}</title>
      <g fill="currentColor">
        {/* C */}
        <path d="M32 16c-8.837 0-16 7.163-16 16s7.163 16 16 16c5.21 0 9.83-2.52 12.7-6.4l-5.8-4.2c-1.77 2.46-4.64 4-7.9 4-5.52 0-10-4.48-10-10s4.48-10 10-10c3.26 0 6.13 1.54 7.9 4l5.8-4.2C41.83 18.52 37.21 16 32 16z" />
        {/* l */}
        <rect x="60" y="20" width="6" height="24" rx="3" />
        {/* i */}
        <rect x="74" y="28" width="6" height="16" rx="3" />
        <rect x="74" y="22" width="6" height="4" rx="2" />
        {/* n */}
        <path d="M90 44V28a4 4 0 1 1 8 0v6c0 3.314 2.686 6 6 6s6-2.686 6-6v-6a4 4 0 1 1 8 0v16h-6v-4.2c-2.4 2.64-5.88 4.2-9.6 4.2-7.18 0-12.4-5.22-12.4-12.4V44h-6z" />
        {/* i */}
        <rect x="132" y="28" width="6" height="16" rx="3" />
        <rect x="132" y="22" width="6" height="4" rx="2" />
        {/* c */}
        <path d="M170 22c-7.732 0-14 6.268-14 14s6.268 14 14 14c4.38 0 8.3-2.02 10.84-5.2l-5.04-3.64c-1.46 1.94-3.78 3.16-6.38 3.16-4.42 0-8-3.58-8-8s3.58-8 8-8c2.6 0 4.92 1.22 6.38 3.16l5.04-3.64C178.3 24.02 174.38 22 170 22z" />
        {/* IQ */}
        <rect x="192" y="20" width="6" height="24" rx="3" />
        <path d="M218 16c-8.837 0-16 7.163-16 16s7.163 16 16 16c5.21 0 9.83-2.52 12.7-6.4l-5.8-4.2c-1.77 2.46-4.64 4-7.9 4-5.52 0-10-4.48-10-10s4.48-10 10-10c3.26 0 6.13 1.54 7.9 4l5.8-4.2C227.83 18.52 223.21 16 218 16z" />
        <path d="M232 44l6 6" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      </g>
    </svg>
  )
}

export function ClinicIQLogo({ className, title }: LogoProps) {
  return (
    <div className={className} aria-label={title || "ClinicIQ Logo"}>
      <div className="flex items-center gap-2">
        <ClinicIQMark className="h-7 w-7 sm:h-8 sm:w-8" />
        <ClinicIQWordmark className="h-5 sm:h-6 w-auto text-foreground" />
      </div>
    </div>
  )
}
