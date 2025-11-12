'use client'

import { useEffect, useRef } from 'react'

type Props = Readonly<{
  className?: string
}>

export function FluidSimulation({ className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
  const canvas = canvasRef.current
  if (!canvas) return

    // Set canvas size
    const updateSize = () => {
      if (!canvas) {
        return
      }
      canvas.width = globalThis.innerWidth
      canvas.height = globalThis.innerHeight
    }
    updateSize()

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Motion preferences
    const prefersReduced =
      typeof globalThis !== 'undefined' &&
      !!globalThis.matchMedia &&
      globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches

    let time = 0
    let raf = 0
    let px = 0
    let py = 0

    const onPointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1
      const ny = (e.clientY / window.innerHeight) * 2 - 1
      // smooth follow
      px += (nx - px) * 0.08
      py += (ny - py) * 0.08
    }

    const animate = () => {
      time += prefersReduced ? 0.005 : 0.02

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      // subtle base tint helps visibility on white
      ctx.fillStyle = 'rgba(20,24,60,0.04)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const cx = canvas.width / 2
      const cy = canvas.height / 2
      const r = Math.max(canvas.width, canvas.height) * 0.8

      ctx.globalCompositeOperation = 'lighter'
      for (let i = 0; i < 3; i++) {
        const ox = Math.sin(time + i * 2) * (canvas.width * 0.18) + px * 60
        const oy = Math.cos(time + i * 2) * (canvas.height * 0.14) + py * 45
        const g = ctx.createRadialGradient(cx + ox, cy + oy, 0, cx + ox, cy + oy, r)
        const hue = (200 + i * 25 + time * 10) % 360
        g.addColorStop(0, `hsla(${hue}, 65%, 62%, 0.55)`)
        g.addColorStop(0.45, `hsla(${hue + 12}, 70%, 58%, 0.25)`)
        g.addColorStop(1, `hsla(${hue + 40}, 75%, 52%, 0.04)`)
        ctx.fillStyle = g
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      ctx.globalCompositeOperation = 'source-over'

      raf = requestAnimationFrame(animate)
    }

    animate()
  globalThis.addEventListener('resize', updateSize)
  globalThis.addEventListener('pointermove', onPointerMove)

    return () => {
  globalThis.removeEventListener('resize', updateSize)
  globalThis.removeEventListener('pointermove', onPointerMove)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none opacity-100 z-0 ${className}`}
      data-testid="fluid-canvas"
    />
  )
}
