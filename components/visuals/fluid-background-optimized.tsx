"use client"

import React, { useEffect, useRef } from "react"

type FluidBackgroundProps = {
  className?: string
  /** CSS selector ขององค์ประกอบที่อยากให้ fluid "ไหลเข้าหา" เช่น .cta-primary */
  focusSelector?: string
  /** ความแรงของแรงดึงดูดไปหา focus target (0–1) */
  focusAttraction?: number
  /** จำนวนอนุภาคพื้นฐาน */
  particleCount?: number
  /** ความเข้มของสีเอฟเฟกต์ (0–1) */
  intensity?: number
  /** ปรับชุดสีอนุภาค (HSL hue) เช่น [210, 200, 190] */
  hues?: number[]
  /** กำหนดสี gradient พื้นหลัง เช่น ["hsla(210,80%,55%,.05)", "hsla(195,70%,60%,.05)"] */
  gradient?: [string, string]
  /** หยุดเมื่ออยู่นอก viewport เพื่อลดการใช้ทรัพยากร */
  pauseWhenOffscreen?: boolean
  /** ลดภาระงานอัตโนมัติเมื่อ FPS ต่ำ */
  autoThrottle?: boolean
  /** โทนสีสำเนียง (เช่น cyan) สำหรับโซนใกล้ CTA */
  accentHue?: number
  /** ปริมาณการผสมสีสำเนียง 0–1 */
  accentAmount?: number
  /** Production mode - disable animations for faster builds */
  isProduction?: boolean
}

/**
 * FluidBackground: เอฟเฟกต์พื้นหลังเบาๆ ด้วยอนุภาคที่ไหลตามเวกเตอร์ฟิลด์ (noise + time)
 * - ปรับขนาดตาม container ด้วย ResizeObserver
 * - Respect prefers-reduced-motion
 * - ดึงดูดอนุภาคใกล้บริเวณ CTA ที่กำหนดด้วย focusSelector
 * - Production mode: ปิด animation สำหรับ build performance
 */
export default function FluidBackground({
  className,
  focusSelector = ".cta-primary",
  focusAttraction = 0.35,
  particleCount = 1200,
  intensity = 0.6,
  hues,
  gradient,
  pauseWhenOffscreen = true,
  autoThrottle = true,
  accentHue = 190,
  accentAmount = 0.25,
  isProduction = false,
}: FluidBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const cleanupsRef = useRef<(() => void)[]>([])
  const inViewRef = useRef(true)
  const throttleRef = useRef(1) // 1 = ทุกเฟรม, 2 = ข้าม 1 เฟรม, 3 = ข้าม 2 เฟรม
  const frameCountRef = useRef(0)
  const focusHoverRef = useRef(false)

  useEffect(() => {
    // Skip animation in production or if reduced motion is preferred
    const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced || isProduction) {
      // Just render static background in production
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container) return

      const ctx = canvas.getContext("2d", { alpha: true })
      if (!ctx) return

      const resize = () => {
        const { width, height } = container.getBoundingClientRect()
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
        canvas.width = Math.max(1, width)
        canvas.height = Math.max(1, height)
        ctx.setTransform(1, 0, 0, 1, 0, 0)
      }

      resize()
      
      // Static gradient background
      const { width, height } = container.getBoundingClientRect()
      const grad = ctx.createLinearGradient(0, 0, width, height)
      const g0 = gradient?.[0] ?? `hsla(210, 80%, 55%, ${0.05 * intensity})`
      const g1 = gradient?.[1] ?? `hsla(195, 70%, 60%, ${0.05 * intensity})`
      grad.addColorStop(0, g0)
      grad.addColorStop(1, g1)
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)

      return
    }

    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    // Scale with DPR
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    // Helper: query focus element
    const getFocus = () => document.querySelector(focusSelector) as HTMLElement | null

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    // hover listeners for focus element to boost accent
    const fe = getFocus()
    if (fe) {
      const onEnter = () => { focusHoverRef.current = true }
      const onLeave = () => { focusHoverRef.current = false }
      fe.addEventListener("mouseenter", onEnter)
      fe.addEventListener("mouseleave", onLeave)
      cleanupsRef.current.push(() => {
        fe.removeEventListener("mouseenter", onEnter)
        fe.removeEventListener("mouseleave", onLeave)
      })
    }

    const ro = new ResizeObserver(resize)
    ro.observe(container)
    cleanupsRef.current.push(() => ro.disconnect())

    // Simple pseudo-noise field using trig (เบากว่า Perlin)
    const field = (x: number, y: number, t: number) => {
      const k1 = 0.0018
      const k2 = 0.0012
      const u = Math.sin(x * k1 + t * 0.6) + Math.cos(y * k2 - t * 0.4)
      const v = Math.cos(y * k1 + t * 0.5) - Math.sin(x * k2 - t * 0.3)
      return { u, v }
    }

    type P = { x: number; y: number; vx: number; vy: number; life: number; hue: number }
    const particles: P[] = []
    const { width: cw, height: ch } = container.getBoundingClientRect()
    
    // Reduce particle count for better performance
    const baseCount = Math.floor(particleCount * Math.max(0.5, Math.min(1, (cw * ch) / (1200 * 700))))
    const isMobile = Math.min(cw, ch) < 640 || (window.matchMedia && window.matchMedia("(max-width: 640px)").matches)
    const count = Math.floor(baseCount * (isMobile ? 0.4 : 0.6)) // Further reduce for mobile

    // สีโทนแบรนด์ (ปรับได้ตามต้องการ)
    const baseHues = (hues && hues.length > 0 ? hues : [210, 200, 190]) // น้ำเงิน-เทา-พรีเมียม

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * cw,
        y: Math.random() * ch,
        vx: 0,
        vy: 0,
        life: Math.random() * 100 + 40,
        hue: baseHues[Math.floor(Math.random() * baseHues.length)],
      })
    }

    let t = 0
    let last = performance.now()

    const step = () => {
      const now = performance.now()
      const dt = Math.min(33, now - last) / 1000
      last = now
      t += dt

      const { width, height } = container.getBoundingClientRect()
      if (pauseWhenOffscreen && !inViewRef.current) {
        // clear ครั้งเดียวเพื่อประหยัด
        ctx.clearRect(0, 0, width, height)
        rafRef.current = requestAnimationFrame(step)
        return
      }
      ctx.clearRect(0, 0, width, height)

      // soft background glow
      const grad = ctx.createLinearGradient(0, 0, width, height)
      const effIntensity = (isMobile ? intensity * 0.85 : intensity)
      const g0 = gradient?.[0] ?? `hsla(210, 80%, 55%, ${0.05 * effIntensity})`
      const g1 = gradient?.[1] ?? `hsla(195, 70%, 60%, ${0.05 * effIntensity})`
      grad.addColorStop(0, g0)
      grad.addColorStop(1, g1)
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)

      const focusEl = getFocus()
      const fb = focusEl?.getBoundingClientRect()
      const containerB = container.getBoundingClientRect()
      const fx = fb ? (fb.left + fb.width / 2) - containerB.left : width * 0.5
      const fy = fb ? (fb.top + fb.height / 2) - containerB.top : height * 0.6
      const focusRadius = Math.min(width, height) * 0.22

      frameCountRef.current++
      const skip = autoThrottle ? throttleRef.current : 1
      // หากกำหนด throttle และถึงเฟรมที่ต้องข้าม ให้ข้ามการอัปเดตอนุภาคเพื่อลดภาระ
      if (autoThrottle && (frameCountRef.current % skip !== 0)) {
        rafRef.current = requestAnimationFrame(step)
        return
      }
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const F = field(p.x, p.y, t)
        // attraction to CTA area (เบามาก ๆ เพื่อแค่ชี้นำ)
        const dx = fx - p.x
        const dy = fy - p.y
        const dist = Math.max(1, Math.hypot(dx, dy))
        const ax = F.u * 0.4 + (dx / dist) * (0.6 * focusAttraction)
        const ay = F.v * 0.4 + (dy / dist) * (0.6 * focusAttraction)

        p.vx = (p.vx + ax * dt * 60) * 0.96
        p.vy = (p.vy + ay * dt * 60) * 0.96
        p.x += p.vx * dt
        p.y += p.vy * dt

        // wrap
        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10
        if (p.y < -10) p.y = height + 10
        if (p.y > height + 10) p.y = -10

        // draw
        // near-focus accent blend
        const near = Math.hypot(p.x - fx, p.y - fy) < focusRadius || focusHoverRef.current
        const hue = near ? (isFinite(accentHue) ? accentHue : p.hue) : p.hue
        const blend = near ? Math.min(1, Math.max(0, accentAmount)) : 0
        const finalHue = blend > 0 ? (p.hue * (1 - blend) + hue * blend) : p.hue
        const alphaScale = near ? 1.1 : 1
        ctx.beginPath()
        ctx.fillStyle = `hsla(${finalHue}, 85%, 60%, ${0.08 * intensity * alphaScale})`
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2)
        ctx.fill()

        // trails
        ctx.beginPath()
        ctx.strokeStyle = `hsla(${finalHue}, 85%, 60%, ${0.12 * intensity * alphaScale})`
        ctx.lineWidth = 0.6
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p.x - p.vx * 0.4, p.y - p.vy * 0.4)
        ctx.stroke()

        p.life -= dt
        if (p.life <= 0) {
          p.x = Math.random() * width
          p.y = Math.random() * height
          p.vx = 0
          p.vy = 0
          p.life = Math.random() * 100 + 40
        }
      }

      // simple FPS sensing
      if (autoThrottle) {
        // หากวาดนานเกิน 22ms ต่อเฟรม ( < ~45 FPS ) ให้เพิ่มการข้ามเฟรม
        const frameMs = (performance.now() - now)
        if (frameMs > 22 && throttleRef.current < 3) throttleRef.current++
        else if (frameMs < 14 && throttleRef.current > 1) throttleRef.current--
      }

      rafRef.current = requestAnimationFrame(step)
    }

    resize()
    rafRef.current = requestAnimationFrame(step)
    cleanupsRef.current.push(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    })

    const visibilityHandler = () => {
      if (document.hidden) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      } else if (!rafRef.current) {
        last = performance.now()
        rafRef.current = requestAnimationFrame(step)
      }
    }

    document.addEventListener("visibilitychange", visibilityHandler)
    cleanupsRef.current.push(() => {
      document.removeEventListener("visibilitychange", visibilityHandler)
    })

    // Capture cleanups array before cleanup function runs
    const cleanups = cleanupsRef.current
    return () => {
      cleanups.forEach(cleanup => cleanup())
      cleanups.length = 0
    }
  }, [focusSelector, focusAttraction, particleCount, intensity, hues, gradient, pauseWhenOffscreen, autoThrottle, accentHue, accentAmount, isProduction])

  return (
    <div ref={containerRef} className={className}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  )
}
