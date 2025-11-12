'use client'

import { useEffect, useRef, useState } from 'react'

type FluidWebGLProps = Readonly<{
  className?: string
  variant?: 'simple' | 'full'
  autoPause?: boolean
  dampen?: boolean
}>

// Embeds david.li fluid simulation from public/fluid via iframe for reliability.
// Falls back silently if iframe fails to load.
export function FluidWebGL({ className = '', variant = 'simple', autoPause = true, dampen = false }: FluidWebGLProps) {
  const ref = useRef<HTMLIFrameElement>(null)
  const [cacheBuster, setCacheBuster] = useState<string | null>(null)

  // Cache-busting only on client side after mount to avoid hydration mismatch
  useEffect(() => {
    setCacheBuster(String(Date.now()))
  }, [])

  // Sync damping state to the iframe (reduce motion/energy when true)
  useEffect(() => {
    const iframe = ref.current
    const w = iframe?.contentWindow
    if (!w) return
    try {
      w.postMessage({ type: 'fluid-control', dampen, veilOpacity: dampen ? 0.6 : 0.85 }, window.location.origin)
    } catch {}
  }, [dampen])

  useEffect(() => {
    if (!autoPause) return
    const handleVisibility = () => {
      const iframe = ref.current
      if (!iframe) return
      const isHidden = document.hidden
      // Try to reduce GPU use when tab hidden by toggling CSS visibility
      iframe.style.opacity = isHidden ? '0' : '1'
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [autoPause])

  // Proxy mouse movement to the iframe so the fluid reacts even though it's behind content
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const iframe = ref.current
      if (!iframe || !iframe.contentWindow) return
      try {
        iframe.contentWindow.postMessage(
          { type: 'fluid-mouse', clientX: e.clientX, clientY: e.clientY },
          window.location.origin
        )
      } catch {}
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const base = variant === 'simple' ? '/fluid/simple.html' : '/fluid/index.html'
  const src = cacheBuster ? `${base}?v=${cacheBuster}` : base

  return (
    <div className={`absolute inset-0 -z-10 overflow-hidden ${className}`}>
      <iframe
        ref={ref}
        src={src}
        title="fluid-background"
        className="h-full w-full border-0"
        loading="eager"
        // sandbox omitted because same-origin; assets are local static JS
      />
      {/* Brand-toned veils: subtle, maintain motion visibility */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/25 via-background/10 to-background/0" />
      <div className="pointer-events-none absolute inset-0 mix-blend-soft-light dark:mix-blend-overlay bg-gradient-to-tr from-primary/20 via-cyan-300/10 to-transparent" />
    </div>
  )
}
