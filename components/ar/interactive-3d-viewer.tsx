"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, RotateCcw, Move } from "lucide-react"
import Image from "next/image"
import { useHaptic } from "@/lib/hooks/use-haptic"

interface Interactive3DViewerProps {
  image: string | null
  treatment?: string
  intensity?: number
}

export function Interactive3DViewer({ image, treatment, intensity = 50 }: Interactive3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const haptic = useHaptic()
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 })
  const [autoRotate, setAutoRotate] = useState(false)
  const [zoom, setZoom] = useState([100])
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Auto-rotate effect
  useEffect(() => {
    if (!autoRotate) return

    const interval = setInterval(() => {
      setRotation((prev) => ({
        ...prev,
        y: (prev.y + 1) % 360,
      }))
    }, 50)

    return () => clearInterval(interval)
  }, [autoRotate])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setAutoRotate(false)
    haptic.trigger("medium")
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y

    setRotation((prev) => ({
      ...prev,
      y: (prev.y + deltaX * 0.5) % 360,
      x: Math.max(-45, Math.min(45, prev.x - deltaY * 0.5)), // Limit X rotation
    }))

    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    haptic.trigger("light")
  }

  const handleReset = () => {
    setRotation({ x: 0, y: 0, z: 0 })
    setZoom([100])
    setAutoRotate(false)
    haptic.trigger("medium")
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      setDragStart({ x: touch.clientX, y: touch.clientY })
      setIsDragging(true)
      setAutoRotate(false)
      haptic.trigger("medium")
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - dragStart.x
    const deltaY = touch.clientY - dragStart.y

    setRotation((prev) => ({
      ...prev,
      y: (prev.y + deltaX * 0.5) % 360,
      x: Math.max(-45, Math.min(45, prev.x - deltaY * 0.5)),
    }))

    setDragStart({ x: touch.clientX, y: touch.clientY })
    
    // Light haptic during drag for better feedback
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      haptic.trigger("selection")
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    haptic.trigger("light")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Interactive 3D View / มุมมอง 3D แบบอินเทอร์แอคทีฟ</CardTitle>
            <p className="text-sm text-muted-foreground">
              Drag to rotate, scroll to zoom / ลากเพื่อหมุน เลื่อนเพื่อซูม
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            3D Premium
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 3D Viewer Container */}
          <div
            ref={containerRef}
            className="relative aspect-square overflow-hidden rounded-lg border-2 border-border bg-gradient-to-br from-muted/50 to-muted cursor-move select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              perspective: "1000px",
            }}
          >
            <div
              className="absolute inset-0 transition-transform duration-100"
              style={{
                transform: `
                  rotateX(${rotation.x}deg) 
                  rotateY(${rotation.y}deg) 
                  rotateZ(${rotation.z}deg)
                  scale(${zoom[0] / 100})
                `,
                transformStyle: "preserve-3d",
              }}
            >
              {image ? (
                <div className="relative h-full w-full">
                  <Image
                    src={image}
                    alt="3D View"
                    fill
                    className="object-contain"
                    style={{
                      filter: treatment ? `brightness(${1 + (intensity / 100) * 0.2})` : "none",
                    }}
                  />
                  {/* Depth effect overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at ${50 + rotation.y * 0.1}% ${50 - rotation.x * 0.1}%, transparent 30%, rgba(0,0,0,0.3))`,
                    }}
                  />
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No image available</p>
                </div>
              )}
            </div>

            {/* Drag hint */}
            {!isDragging && rotation.y === 0 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
                <Badge className="bg-black/60 text-white backdrop-blur-sm animate-bounce">
                  <Move className="mr-1 h-3 w-3" />
                  Drag to rotate
                </Badge>
              </div>
            )}

            {/* Rotation indicator */}
            <div className="absolute top-2 right-2 bg-black/60 text-white backdrop-blur-sm rounded px-2 py-1 text-xs font-mono">
              X: {Math.round(rotation.x)}° Y: {Math.round(rotation.y)}°
            </div>
          </div>

          {/* Controls */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Zoom / ซูม</label>
                <span className="text-sm font-bold text-primary">{zoom[0]}%</span>
              </div>
              <Slider
                value={zoom}
                onValueChange={setZoom}
                min={50}
                max={200}
                step={10}
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={autoRotate ? "default" : "outline"}
                className="flex-1"
                onClick={() => setAutoRotate(!autoRotate)}
              >
                {autoRotate ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Auto Rotate
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          {/* Quick rotation buttons */}
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRotation({ x: 0, y: 0, z: 0 })}
              className="text-xs"
            >
              Front
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRotation({ x: 0, y: 90, z: 0 })}
              className="text-xs"
            >
              Left
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRotation({ x: 0, y: -90, z: 0 })}
              className="text-xs"
            >
              Right
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRotation({ x: -20, y: 45, z: 0 })}
              className="text-xs"
            >
              3/4
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid gap-2 rounded-lg border bg-muted/30 p-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>360° rotation control / หมุนครบ 360 องศา</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Zoom 50-200% / ซูม 50-200%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Touch gestures support / รองรับการสัมผัส</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Real-time treatment preview / ดูตัวอย่างการรักษาแบบเรียลไทม์</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
