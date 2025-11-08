"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Maximize2, Download } from "lucide-react"
import { useHaptic } from "@/lib/hooks/use-haptic"

interface BeforeAfterSliderProps {
  beforeImage: string | null
  afterImage: string | null
  title?: string
  description?: string
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  title = "Before & After Comparison",
  description = "Drag the slider to compare / ลากแถบเพื่อเปรียบเทียบ",
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const haptic = useHaptic()
  const [sliderPosition, setSliderPosition] = useState([50])
  const [isDragging, setIsDragging] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleMouseDown = () => {
    setIsDragging(true)
    haptic.trigger("medium")
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    haptic.trigger("light")
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition([percentage])
    
    // Haptic at midpoint (50%)
    if (Math.abs(percentage - 50) < 2) {
      haptic.trigger("selection")
    }
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const touch = e.touches[0]
    const x = touch.clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition([percentage])
    
    // Haptic at midpoint (50%)
    if (Math.abs(percentage - 50) < 2) {
      haptic.trigger("selection")
    }
  }

  // Animation effect on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      // Animate from 0 to 50 to 100 and back to 50
      let pos = 0
      const interval = setInterval(() => {
        pos += 5
        setSliderPosition([pos])
        if (pos >= 100) {
          setTimeout(() => {
            const backInterval = setInterval(() => {
              pos -= 5
              setSliderPosition([pos])
              if (pos <= 50) {
                clearInterval(backInterval)
              }
            }, 20)
          }, 500)
          clearInterval(interval)
        }
      }, 20)
    }, 500)

    return () => clearTimeout(timer)
  }, [beforeImage, afterImage])

  const handleFullscreen = () => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleDownload = () => {
    // Create a canvas to combine both images
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx || !beforeImage || !afterImage) return

    const img1 = new window.Image()
    const img2 = new window.Image()

    img1.crossOrigin = "anonymous"
    img2.crossOrigin = "anonymous"

    Promise.all([
      new Promise((resolve) => {
        img1.onload = resolve
        img1.src = beforeImage
      }),
      new Promise((resolve) => {
        img2.onload = resolve
        img2.src = afterImage
      }),
    ]).then(() => {
      canvas.width = img1.width * 2
      canvas.height = img1.height

      // Draw before image on left
      ctx.drawImage(img1, 0, 0, img1.width, img1.height)

      // Draw after image on right
      ctx.drawImage(img2, img1.width, 0, img2.width, img2.height)

      // Draw divider line
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(img1.width, 0)
      ctx.lineTo(img1.width, img1.height)
      ctx.stroke()

      // Add labels
      ctx.font = "bold 24px sans-serif"
      ctx.fillStyle = "#ffffff"
      ctx.strokeStyle = "#000000"
      ctx.lineWidth = 3

      ctx.strokeText("BEFORE", 20, 40)
      ctx.fillText("BEFORE", 20, 40)

      ctx.strokeText("AFTER", img1.width + 20, 40)
      ctx.fillText("AFTER", img1.width + 20, 40)

      // Download
      const link = document.createElement("a")
      link.download = `before-after-${Date.now()}.png`
      link.href = canvas.toDataURL()
      link.click()
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleFullscreen}>
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Before/After Slider Container */}
          <div
            ref={containerRef}
            className="relative aspect-[4/3] overflow-hidden rounded-lg border-2 border-border cursor-col-resize select-none bg-muted"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseUp}
            onTouchMove={handleTouchMove}
          >
            {/* After Image (bottom layer) */}
            {afterImage && (
              <div className="absolute inset-0">
                <Image
                  src={afterImage}
                  alt="After Treatment"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute bottom-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  AFTER
                </div>
              </div>
            )}

            {/* Before Image (top layer with clip) */}
            {beforeImage && (
              <div
                className="absolute inset-0 transition-all duration-75"
                style={{
                  clipPath: `inset(0 ${100 - sliderPosition[0]}% 0 0)`,
                }}
              >
                <Image
                  src={beforeImage}
                  alt="Before Treatment"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute bottom-4 left-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  BEFORE
                </div>
              </div>
            )}

            {/* Slider Handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl transition-all duration-75 pointer-events-none"
              style={{
                left: `${sliderPosition[0]}%`,
              }}
            >
              {/* Handle Circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-2xl border-4 border-primary">
                  <ChevronLeft className="h-5 w-5 text-primary -mr-1" />
                  <ChevronRight className="h-5 w-5 text-primary -ml-1" />
                </div>
              </div>
            </div>

            {/* Instructions overlay (shows on first load) */}
            {sliderPosition[0] === 50 && !isDragging && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-500 pointer-events-none animate-pulse">
                <div className="bg-white/90 backdrop-blur rounded-lg px-6 py-3 shadow-xl">
                  <p className="text-sm font-medium text-center">
                    👆 Drag the slider left or right
                    <br />
                    <span className="text-xs text-muted-foreground">
                      ลากแถบไปซ้ายหรือขวา
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Slider Control */}
          <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Comparison Position / ตำแหน่งเปรียบเทียบ</label>
              <span className="text-sm font-bold text-primary">{Math.round(sliderPosition[0])}%</span>
            </div>
            <Slider
              value={sliderPosition}
              onValueChange={setSliderPosition}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>100% Before</span>
              <span>50/50</span>
              <span>100% After</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSliderPosition([0])}
              className="text-xs"
            >
              Before Only
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSliderPosition([50])}
              className="text-xs"
            >
              50/50 Split
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSliderPosition([100])}
              className="text-xs"
            >
              After Only
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 rounded-lg border bg-gradient-to-r from-blue-500/10 to-green-500/10 p-4">
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Improvement</div>
              <div className="text-2xl font-bold text-green-600">+35%</div>
              <div className="text-xs text-muted-foreground">Overall Score</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Treatment</div>
              <div className="text-2xl font-bold text-primary">6 Weeks</div>
              <div className="text-xs text-muted-foreground">Progress</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
