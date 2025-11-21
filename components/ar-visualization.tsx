"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface ARVisualizationProps {
  readonly image: string | null
  readonly treatment: string
  readonly intensity: number
  readonly compact?: boolean
  readonly viewMode?: "front" | "side" | "profile"
  readonly multiTreatment?: boolean
}

/**
 * Simple sharpening filter for texture detail preservation
 */
function sharpenImage(imageData: ImageData, strength: number): ImageData {
  const data = imageData.data
  const width = imageData.width
  const height = imageData.height
  const output = new ImageData(width, height)
  
  // Sharpening kernel (3x3 convolution)
  const kernel = [
    0, -strength, 0,
    -strength, 1 + 4 * strength, -strength,
    0, -strength, 0
  ]
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) { // RGB channels only
        let sum = 0
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c
            const kernelIdx = (ky + 1) * 3 + (kx + 1)
            sum += data[idx] * kernel[kernelIdx]
          }
        }
        const outIdx = (y * width + x) * 4 + c
        output.data[outIdx] = Math.max(0, Math.min(255, sum))
      }
      // Copy alpha channel
      const alphaIdx = (y * width + x) * 4 + 3
      output.data[alphaIdx] = data[alphaIdx]
    }
  }
  
  return output
}

export function ARVisualization({
  image,
  treatment,
  intensity,
  compact = false,
  viewMode = "front",
  multiTreatment = false,
}: ARVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const applyViewModeTransform = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, mode: string) => {
    // Apply zoom and pan first
    ctx.translate(pan.x, pan.y)
    ctx.scale(zoom, zoom)
    
    // Simulate different view angles with transformations
    switch (mode) {
      case "side":
        // Slight skew to simulate side view
        ctx.setTransform(0.85 * zoom, 0, -0.15, 1 * zoom, canvas.width * 0.1 + pan.x, pan.y)
        break
      case "profile":
        // More pronounced skew for profile view
        ctx.setTransform(0.7 * zoom, 0, -0.3, 1 * zoom, canvas.width * 0.2 + pan.x, pan.y)
        break
      case "front":
      default:
        // Reset to normal with zoom and pan
        ctx.setTransform(zoom, 0, 0, zoom, pan.x, pan.y)
        break
    }
  }, [pan.x, pan.y, zoom])

  // Handle mouse/touch zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY * -0.001
    const newZoom = Math.min(Math.max(0.5, zoom + delta), 3)
    setZoom(newZoom)
  }, [zoom])

  // Handle pan start
  const handlePanStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)
    const point = 'touches' in e ? e.touches[0] : e
    setDragStart({ x: point.clientX - pan.x, y: point.clientY - pan.y })
  }

  // Handle pan move
  const handlePanMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return
    const point = 'touches' in e ? e.touches[0] : e
    setPan({
      x: point.clientX - dragStart.x,
      y: point.clientY - dragStart.y
    })
  }

  // Handle pan end
  const handlePanEnd = () => {
    setIsDragging(false)
  }

  // Pinch-to-zoom for mobile
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let initialDistance = 0
    let initialZoom = zoom

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        initialDistance = Math.sqrt(dx * dx + dy * dy)
        initialZoom = zoom
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDistance > 0) {
        e.preventDefault()
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const distance = Math.sqrt(dx * dx + dy * dy)
        const scale = distance / initialDistance
        const newZoom = Math.min(Math.max(0.5, initialZoom * scale), 3)
        setZoom(newZoom)
      }
    }

    const handleTouchEnd = () => {
      initialDistance = 0
    }

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd)
    canvas.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
      canvas.removeEventListener('wheel', handleWheel)
    }
  }, [zoom, pan, handleWheel])

  const applyAREffect = useCallback((imageSrc: string, selectedTreatment: string, effectIntensity: number, mode: string) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { 
      alpha: true, 
      willReadFrequently: false,
      desynchronized: true // Better performance for animations
    })
    if (!ctx) return

    const img = globalThis.Image ? new globalThis.Image() : new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      // PHASE 1: High-resolution rendering (2x for sharper quality)
      const scaleFactor = 2
      canvas.width = img.width * scaleFactor
      canvas.height = img.height * scaleFactor

      // Enable image smoothing for better quality
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      // Draw original image at high resolution
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Apply view mode transformation
      applyViewModeTransform(ctx, canvas, mode)

      // PHASE 2: Apply realistic lighting and treatment effects
      const alpha = effectIntensity / 100

      // Create gradient for depth perception (subtle shadow/highlight)
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)') // Subtle highlight at top
      gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)') // Neutral middle
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)') // Subtle shadow at bottom

      switch (selectedTreatment) {
        case "botox":
          // ENHANCED: Multi-layer smoothing with depth preservation
          // Layer 1: Gentle blur for wrinkle smoothing
          ctx.filter = `blur(${alpha * 3}px)`
          ctx.drawImage(canvas, 0, 0)
          ctx.filter = "none"
          
          // Layer 2: Brightness boost for "lifted" appearance
          ctx.globalCompositeOperation = 'lighten'
          ctx.globalAlpha = alpha * 0.15
          ctx.fillStyle = 'rgba(255, 250, 245, 0.3)'
          ctx.fillRect(0, canvas.height * 0.1, canvas.width, canvas.height * 0.3) // Forehead area
          ctx.globalAlpha = 1
          ctx.globalCompositeOperation = 'source-over'
          
          // Layer 3: Subtle ambient occlusion (shadows in creases)
          ctx.globalCompositeOperation = 'multiply'
          ctx.globalAlpha = 0.08
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.globalAlpha = 1
          ctx.globalCompositeOperation = 'source-over'
          break

        case "filler":
          // ENHANCED: Realistic volume with specular highlights
          // Layer 1: Volume enhancement (cheeks/lips)
          ctx.globalAlpha = alpha * 0.35
          ctx.fillStyle = "rgba(255, 220, 200, 0.4)"
          const cheekY = canvas.height * 0.4
          ctx.fillRect(0, cheekY, canvas.width, canvas.height * 0.3)
          ctx.globalAlpha = 1
          
          // Layer 2: Specular highlight (glossy skin effect)
          const highlightGradient = ctx.createRadialGradient(
            canvas.width * 0.5, cheekY + canvas.height * 0.15, 0,
            canvas.width * 0.5, cheekY + canvas.height * 0.15, canvas.width * 0.3
          )
          highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)')
          highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
          ctx.globalAlpha = alpha * 0.4
          ctx.fillStyle = highlightGradient
          ctx.fillRect(0, cheekY, canvas.width, canvas.height * 0.3)
          ctx.globalAlpha = 1
          break

        case "laser":
          // ENHANCED: Brightening with texture preservation and glow
          // Layer 1: Overall brightening
          ctx.filter = `brightness(${1 + alpha * 0.2}) contrast(${1 + alpha * 0.12})`
          ctx.drawImage(canvas, 0, 0)
          ctx.filter = "none"
          
          // Layer 2: Radiant glow (simulates skin luminosity)
          ctx.globalCompositeOperation = 'screen'
          ctx.globalAlpha = alpha * 0.2
          ctx.fillStyle = 'rgba(255, 245, 230, 0.5)'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.globalAlpha = 1
          ctx.globalCompositeOperation = 'source-over'
          
          // Layer 3: Subtle texture sharpening
          ctx.filter = `contrast(${1 + alpha * 0.08})`
          ctx.drawImage(canvas, 0, 0)
          ctx.filter = "none"
          break

        case "peel":
          // ENHANCED: Even skin tone with gradient blending
          // Layer 1: Color correction
          ctx.filter = `saturate(${1 + alpha * 0.25}) brightness(${1 + alpha * 0.12})`
          ctx.drawImage(canvas, 0, 0)
          ctx.filter = "none"
          
          // Layer 2: Skin tone evening (gradient overlay)
          ctx.globalCompositeOperation = 'overlay'
          ctx.globalAlpha = alpha * 0.2
          const toneGradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
          toneGradient.addColorStop(0, 'rgba(255, 230, 210, 0.3)')
          toneGradient.addColorStop(0.5, 'rgba(255, 220, 200, 0.2)')
          toneGradient.addColorStop(1, 'rgba(255, 230, 210, 0.3)')
          ctx.fillStyle = toneGradient
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.globalAlpha = 1
          ctx.globalCompositeOperation = 'source-over'
          break

        case "microneedling":
          // ENHANCED: Texture refinement with pore-level detail
          // Layer 1: Contrast boost for texture definition
          ctx.filter = `contrast(${1 + alpha * 0.18}) brightness(${1 + alpha * 0.06})`
          ctx.drawImage(canvas, 0, 0)
          ctx.filter = "none"
          
          // Layer 2: Subtle sharpening (preserves pore detail)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const sharpened = sharpenImage(imageData, alpha * 0.5)
          ctx.putImageData(sharpened, 0, 0)
          
          // Layer 3: Slight glow for smoother appearance
          ctx.globalCompositeOperation = 'lighten'
          ctx.globalAlpha = alpha * 0.1
          ctx.fillStyle = 'rgba(255, 245, 240, 0.2)'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.globalAlpha = 1
          ctx.globalCompositeOperation = 'source-over'
          break

        case "thread":
          // ENHANCED: Lifting effect with realistic shadow mapping
          // Layer 1: Subtle upward shift simulation
          ctx.globalAlpha = alpha * 0.4
          ctx.fillStyle = "rgba(255, 240, 230, 0.25)"
          ctx.fillRect(0, canvas.height * 0.3, canvas.width, canvas.height * 0.4)
          ctx.globalAlpha = 1
          
          // Layer 2: Shadow mapping for jawline definition
          ctx.globalCompositeOperation = 'multiply'
          ctx.globalAlpha = alpha * 0.15
          const shadowGradient = ctx.createLinearGradient(0, canvas.height * 0.6, 0, canvas.height * 0.8)
          shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
          shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)')
          ctx.fillStyle = shadowGradient
          ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.2)
          ctx.globalAlpha = 1
          ctx.globalCompositeOperation = 'source-over'
          
          // Layer 3: Highlight for lifted appearance
          ctx.globalCompositeOperation = 'screen'
          ctx.globalAlpha = alpha * 0.2
          const liftHighlight = ctx.createLinearGradient(0, canvas.height * 0.3, 0, canvas.height * 0.5)
          liftHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.15)')
          liftHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)')
          ctx.fillStyle = liftHighlight
          ctx.fillRect(0, canvas.height * 0.3, canvas.width, canvas.height * 0.2)
          ctx.globalAlpha = 1
          ctx.globalCompositeOperation = 'source-over'
          break
      }
    }
    img.src = imageSrc
  }, [applyViewModeTransform])

  const applyMultiTreatmentEffect = useCallback((imageSrc: string, treatments: string[], effectIntensity: number, mode: string) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = globalThis.Image ? new globalThis.Image() : new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height

      // Draw original image
      ctx.drawImage(img, 0, 0)

      // Apply view mode transformation
      applyViewModeTransform(ctx, canvas, mode)

      const alpha = effectIntensity / 100

      // Apply combined effects from all selected treatments
      for (const selectedTreatment of treatments) {
        switch (selectedTreatment) {
          case "botox":
            ctx.filter = `blur(${alpha * 1.5}px) brightness(${1 + alpha * 0.08})`
            ctx.drawImage(canvas, 0, 0)
            ctx.filter = "none"
            break

          case "filler":
            ctx.globalAlpha = alpha * 0.2
            ctx.fillStyle = "rgba(255, 220, 200, 0.2)"
            ctx.fillRect(0, canvas.height * 0.4, canvas.width, canvas.height * 0.3)
            ctx.globalAlpha = 1
            break

          case "laser":
            ctx.filter = `brightness(${1 + alpha * 0.1}) contrast(${1 + alpha * 0.08})`
            ctx.drawImage(canvas, 0, 0)
            ctx.filter = "none"
            break

          case "peel":
            ctx.filter = `saturate(${1 + alpha * 0.15}) brightness(${1 + alpha * 0.08})`
            ctx.drawImage(canvas, 0, 0)
            ctx.filter = "none"
            break

          case "microneedling":
            ctx.filter = `contrast(${1 + alpha * 0.1})`
            ctx.drawImage(canvas, 0, 0)
            ctx.filter = "none"
            break

          case "thread":
            ctx.globalAlpha = alpha * 0.3
            ctx.fillStyle = "rgba(255, 240, 230, 0.15)"
            ctx.fillRect(0, canvas.height * 0.3, canvas.width, canvas.height * 0.4)
            ctx.globalAlpha = 1
            break
        }
      }
    }
    img.src = imageSrc
  }, [applyViewModeTransform])

  useEffect(() => {
    if (!image || !canvasRef.current) return

    setIsProcessing(true)

    // PHASE 3: Smooth transitions with requestAnimationFrame
    let startTime: number | null = null
    const duration = 300 // ms for smooth transition
    
    const animateTransition = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function (ease-out cubic)
      const easedProgress = 1 - Math.pow(1 - progress, 3)
      
      // Apply effect with animated intensity
      const animatedIntensity = intensity * easedProgress
      
      if (multiTreatment) {
        applyMultiTreatmentEffect(image, treatment.split(","), animatedIntensity, viewMode)
      } else {
        applyAREffect(image, treatment, animatedIntensity, viewMode)
      }
      
      if (progress < 1) {
        requestAnimationFrame(animateTransition)
      } else {
        setIsProcessing(false)
      }
    }
    
    requestAnimationFrame(animateTransition)
  }, [image, treatment, intensity, viewMode, multiTreatment, zoom, pan, applyAREffect, applyMultiTreatmentEffect])

  if (!image) {
    return (
      <div className="flex aspect-[3/4] items-center justify-center rounded-lg bg-muted">
        <p className="text-muted-foreground">No image available</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div
        className={`relative ${compact ? "aspect-[3/4]" : "aspect-[4/3]"} overflow-hidden rounded-lg border-2 border-border transition-all duration-300`}
      >
        {isProcessing && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-200">
            <div className="text-center">
              <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Processing AR...</p>
            </div>
          </div>
        )}

        <canvas 
          ref={canvasRef} 
          className="h-full w-full object-contain ar-canvas-high-quality ar-transition cursor-grab active:cursor-grabbing touch-none" 
          onMouseDown={handlePanStart}
          onMouseMove={handlePanMove}
          onMouseUp={handlePanEnd}
          onMouseLeave={handlePanEnd}
          onTouchStart={handlePanStart}
          onTouchMove={handlePanMove}
          onTouchEnd={handlePanEnd}
        />

        {!compact && (
          <div className="absolute left-3 top-3 flex gap-2">
            <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm">AR Live Preview</Badge>
            {multiTreatment && (
              <Badge className="bg-purple-500/90 text-white backdrop-blur-sm">Multi-Treatment</Badge>
            )}
          </div>
        )}
      </div>

      {!compact && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Zoom: {(zoom * 100).toFixed(0)}%</span>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setZoom(Math.min(3, zoom + 0.2))}
                className="h-7 px-2"
              >
                +
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setZoom(1)}
                className="h-7 px-2"
              >
                Reset
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
                className="h-7 px-2"
              >
                -
              </Button>
            </div>
          </div>
          
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              💡 <strong>Controls:</strong> Scroll/pinch to zoom • Drag to pan • Double-click to reset
              <br />
              เลื่อนแถบความเข้มข้นเพื่อดูความแรงของการรักษาที่แตกต่างกัน ตัวอย่างจะอัปเดตแบบเรียลไทม์
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
