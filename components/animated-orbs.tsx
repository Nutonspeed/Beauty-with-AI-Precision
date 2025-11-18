"use client"

import { useEffect, useRef } from "react"

interface Orb {
  x: number
  y: number
  size: number
  vx: number
  vy: number
  color: string
  blur: number
}

export function AnimatedOrbs() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const orbsRef = useRef<Orb[]>([])
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      
      ctx.scale(dpr, dpr)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
    }

    updateCanvasSize()

    // Initialize orbs
    const colors = [
      "rgba(59, 130, 246, 0.15)", // blue-500
      "rgba(147, 51, 234, 0.15)", // purple-600
      "rgba(236, 72, 153, 0.15)", // pink-500
      "rgba(14, 165, 233, 0.15)", // sky-500
      "rgba(168, 85, 247, 0.15)", // violet-500
    ]

    orbsRef.current = Array.from({ length: 5 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 200 + Math.random() * 300,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      color: colors[i % colors.length],
      blur: 40 + Math.random() * 40,
    }))

    // Animation loop
    const animate = () => {
      const rect = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)

      orbsRef.current.forEach((orb) => {
        // Update position
        orb.x += orb.vx
        orb.y += orb.vy

        // Bounce off edges
        if (orb.x < -orb.size / 2 || orb.x > rect.width + orb.size / 2) {
          orb.vx *= -1
        }
        if (orb.y < -orb.size / 2 || orb.y > rect.height + orb.size / 2) {
          orb.vy *= -1
        }

        // Keep orbs within bounds
        orb.x = Math.max(-orb.size / 2, Math.min(rect.width + orb.size / 2, orb.x))
        orb.y = Math.max(-orb.size / 2, Math.min(rect.height + orb.size / 2, orb.y))

        // Draw orb with gradient
        const gradient = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          orb.size / 2
        )
        
        gradient.addColorStop(0, orb.color.replace("0.15", "0.25"))
        gradient.addColorStop(0.5, orb.color.replace("0.15", "0.12"))
        gradient.addColorStop(1, orb.color.replace("0.15", "0"))

        ctx.filter = `blur(${orb.blur}px)`
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(orb.x, orb.y, orb.size / 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.filter = "none"
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      updateCanvasSize()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none mix-blend-normal opacity-60"
    />
  )
}
