'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Landmark {
  x: number
  y: number
  z?: number
}

interface FaceLandmarksCanvasProps {
  imageUrl: string
  landmarks: Landmark[]
  confidence: number
  boundingBox?: {
    xMin: number
    yMin: number
    width: number
    height: number
  }
}

export function FaceLandmarksCanvas({
  imageUrl,
  landmarks,
  confidence,
  boundingBox,
}: FaceLandmarksCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    if (!canvasRef.current || !imageUrl || !landmarks.length) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setIsDrawing(true)
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      // Set canvas size to match image
      const maxWidth = 600
      const maxHeight = 600
      let width = img.width
      let height = img.height

      // Scale down if too large
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = width * ratio
        height = height * ratio
      }

      canvas.width = width
      canvas.height = height

      // Draw image
      ctx.drawImage(img, 0, 0, width, height)

      // Draw bounding box if available
      if (boundingBox) {
        ctx.strokeStyle = '#3b82f6'
        ctx.lineWidth = 2
        ctx.strokeRect(
          boundingBox.xMin * width,
          boundingBox.yMin * height,
          boundingBox.width * width,
          boundingBox.height * height
        )
      }

      // Draw landmarks with different colors for face regions
      landmarks.forEach((landmark, index) => {
        const x = landmark.x * width
        const y = landmark.y * height

        // Color coding for different face regions
        let color = '#10b981' // Default green

        // Face oval (0-16)
        if (index <= 16) color = '#3b82f6' // Blue
        // Eyebrows (17-26, 70-79)
        else if ((index >= 17 && index <= 26) || (index >= 70 && index <= 79))
          color = '#f59e0b' // Orange
        // Eyes (33-42, 133-154, 263-284)
        else if (
          (index >= 33 && index <= 42) ||
          (index >= 133 && index <= 154) ||
          (index >= 263 && index <= 284)
        )
          color = '#8b5cf6' // Purple
        // Nose (1-9, 48-59, 115-125, 168-175, 188-196, 209-217, 240-248, 326-334, 420-428)
        else if (
          (index >= 1 && index <= 9) ||
          (index >= 48 && index <= 59) ||
          (index >= 115 && index <= 125) ||
          (index >= 168 && index <= 175) ||
          (index >= 188 && index <= 196)
        )
          color = '#ec4899' // Pink
        // Lips (61-68, 78-95, 146-153, 172-181, 185-194, 267-277, 308-324, 375-402, 415-422)
        else if (
          (index >= 61 && index <= 68) ||
          (index >= 78 && index <= 95) ||
          (index >= 146 && index <= 153) ||
          (index >= 172 && index <= 181) ||
          (index >= 267 && index <= 277) ||
          (index >= 308 && index <= 324) ||
          (index >= 375 && index <= 402)
        )
          color = '#ef4444' // Red

        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(x, y, 1.5, 0, 2 * Math.PI)
        ctx.fill()
      })

      // Add text overlay with landmark count
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.fillRect(10, 10, 200, 40)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 14px sans-serif'
      ctx.fillText(`${landmarks.length} landmarks`, 20, 30)
      ctx.font = '12px sans-serif'
      ctx.fillText(`Confidence: ${(confidence * 100).toFixed(1)}%`, 20, 45)

      setImageLoaded(true)
      setIsDrawing(false)
    }

    img.onerror = () => {
      console.error('Failed to load image for canvas')
      setIsDrawing(false)
    }

    img.src = imageUrl
  }, [imageUrl, landmarks, confidence, boundingBox])

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Face Landmark Visualization</CardTitle>
            <CardDescription>
              MediaPipe detected {landmarks.length} facial landmarks
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Real AI
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {isDrawing && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/30 rounded-lg">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Drawing landmarks...</p>
              </div>
            </div>
          )}
          <canvas
            ref={canvasRef}
            className="w-full h-auto rounded-lg border border-border max-w-[600px] max-h-[600px]"
          />
          {imageLoaded && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span>Face Oval</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-orange-500" />
                <span>Eyebrows</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-purple-500" />
                <span>Eyes</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-pink-500" />
                <span>Nose</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span>Lips</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
