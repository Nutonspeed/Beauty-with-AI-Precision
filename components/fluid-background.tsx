"use client"

import { useEffect, useRef } from "react"

export function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      console.log('Canvas not found')
      return
    }

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    console.log('Canvas size:', canvas.width, 'x', canvas.height)
    console.log('Attempting to load webgl-fluid...')

    // Import webgl-fluid dynamically
    import('webgl-fluid')
      .then((module) => {
        console.log('webgl-fluid loaded successfully', module)
        const FluidSimulation = module.default
        
        if (typeof FluidSimulation !== 'function') {
          console.error('FluidSimulation is not a function:', typeof FluidSimulation)
          return
        }

        console.log('Initializing fluid simulation...')
        
        // Create fluid simulation instance
        const result = FluidSimulation(canvas, {
          SIM_RESOLUTION: 128,
          DYE_RESOLUTION: 512,
          DENSITY_DISSIPATION: 0.97,
          VELOCITY_DISSIPATION: 0.98,
          PRESSURE: 0.8,
          PRESSURE_ITERATIONS: 20,
          CURL: 30,
          SPLAT_RADIUS: 0.25,
          SPLAT_FORCE: 6000,
          SHADING: true,
          COLORFUL: true,
          COLOR_UPDATE_SPEED: 10,
          PAUSED: false,
          BACK_COLOR: { r: 0, g: 0, b: 0 },
          TRANSPARENT: true,
          BLOOM: true,
          BLOOM_ITERATIONS: 8,
          BLOOM_RESOLUTION: 256,
          BLOOM_INTENSITY: 0.8,
          BLOOM_THRESHOLD: 0.6,
          BLOOM_SOFT_KNEE: 0.7,
          SUNRAYS: true,
          SUNRAYS_RESOLUTION: 196,
          SUNRAYS_WEIGHT: 1.0,
        })
        
        console.log('Fluid simulation initialized:', result)
      })
      .catch((err) => {
        console.error('Failed to load fluid simulation:', err)
      })

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto opacity-70 mix-blend-screen touch-none"
    />
  )
}
