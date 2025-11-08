"use client"

/**
 * Advanced AR Viewer Component
 *
 * Real-time AR visualization with:
 * - Object detection and tracking
 * - Skin condition analysis
 * - Interactive overlays
 * - Performance monitoring
 */

import { useEffect, useRef, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Camera, CameraOff, Activity, Zap, Target } from "lucide-react"
import {
  getObjectRecognitionSystem,
  type ObjectRecognitionResult,
  type DetectedObject,
  type SkinCondition,
} from "@/lib/ar/advanced-object-recognition"

export function AdvancedARViewer() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | null>(null)

  const [isActive, setIsActive] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [result, setResult] = useState<ObjectRecognitionResult | null>(null)
  const [fps, setFps] = useState(0)
  const [error, setError] = useState<string | null>(null)

  /**
   * Start camera and AR system
   */
  const startAR = useCallback(async () => {
    if (!videoRef.current) return

    setIsInitializing(true)
    setError(null)

    try {
      console.log("[v0] 🎬 Starting AR system...")

      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      })

      videoRef.current.srcObject = stream
      await videoRef.current.play()

      // Initialize recognition system
      const system = getObjectRecognitionSystem()
      await system.initialize()

      setIsActive(true)
      processFrames()

      console.log("[v0] ✅ AR system started")
    } catch (err) {
      console.error("[v0] ❌ Failed to start AR:", err)
      setError(err instanceof Error ? err.message : "Failed to start AR system")
    } finally {
      setIsInitializing(false)
    }
  }, [])

  /**
   * Stop camera and AR system
   */
  const stopAR = useCallback(() => {
    console.log("[v0] 🛑 Stopping AR system...")

    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    setIsActive(false)
    setResult(null)
  }, [])

  /**
   * Process video frames
   */
  const processFrames = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isActive) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const startTime = performance.now()

    try {
      // Match canvas size to video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Analyze frame
      const system = getObjectRecognitionSystem()
      const analysisResult = await system.analyzeFrame(video)

      setResult(analysisResult)

      // Draw overlays
      drawOverlays(ctx, analysisResult, canvas.width, canvas.height)

      // Calculate FPS
      const processingTime = performance.now() - startTime
      setFps(Math.round(1000 / processingTime))
    } catch (err) {
      console.error("[v0] ❌ Frame processing error:", err)
    }

    // Continue loop
    animationFrameRef.current = requestAnimationFrame(processFrames)
  }, [isActive])

  /**
   * Draw AR overlays
   */
  const drawOverlays = (
    ctx: CanvasRenderingContext2D,
    result: ObjectRecognitionResult,
    width: number,
    height: number,
  ) => {
    // Draw detected objects
    result.objects.forEach((obj) => {
      drawObject(ctx, obj, width, height)
    })

    // Draw skin conditions
    result.skinConditions.forEach((condition) => {
      drawSkinCondition(ctx, condition, width, height)
    })

    // Draw performance info
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    ctx.fillRect(10, 10, 200, 80)
    ctx.fillStyle = "#00ff00"
    ctx.font = "14px monospace"
    ctx.fillText(`FPS: ${fps}`, 20, 30)
    ctx.fillText(`Objects: ${result.objects.length}`, 20, 50)
    ctx.fillText(`Conditions: ${result.skinConditions.length}`, 20, 70)
  }

  /**
   * Draw detected object
   */
  const drawObject = (ctx: CanvasRenderingContext2D, obj: DetectedObject, width: number, height: number) => {
    const x = obj.boundingBox.normalized ? obj.boundingBox.x * width : obj.boundingBox.x
    const y = obj.boundingBox.normalized ? obj.boundingBox.y * height : obj.boundingBox.y
    const w = obj.boundingBox.normalized ? obj.boundingBox.width * width : obj.boundingBox.width
    const h = obj.boundingBox.normalized ? obj.boundingBox.height * height : obj.boundingBox.height

    // Draw bounding box
    ctx.strokeStyle = obj.tracking.stable ? "#00ff00" : "#ffff00"
    ctx.lineWidth = 3
    ctx.strokeRect(x, y, w, h)

    // Draw label
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    ctx.fillRect(x, y - 25, w, 25)
    ctx.fillStyle = "#ffffff"
    ctx.font = "14px sans-serif"
    ctx.fillText(`${obj.label} (${(obj.confidence * 100).toFixed(0)}%)`, x + 5, y - 8)

    // Draw tracking trail
    if (obj.tracking.positions.length > 1) {
      ctx.strokeStyle = "rgba(0, 255, 0, 0.3)"
      ctx.lineWidth = 2
      ctx.beginPath()
      obj.tracking.positions.forEach((pos, i) => {
        const px = pos.x * width
        const py = pos.y * height
        if (i === 0) {
          ctx.moveTo(px, py)
        } else {
          ctx.lineTo(px, py)
        }
      })
      ctx.stroke()
    }
  }

  /**
   * Draw skin condition
   */
  const drawSkinCondition = (
    ctx: CanvasRenderingContext2D,
    condition: SkinCondition,
    width: number,
    height: number,
  ) => {
    const bbox = condition.location.boundingBox
    const x = bbox.normalized ? bbox.x * width : bbox.x
    const y = bbox.normalized ? bbox.y * height : bbox.y
    const w = bbox.normalized ? bbox.width * width : bbox.width
    const h = bbox.normalized ? bbox.height * height : bbox.height

    // Color based on severity
    const severity = condition.severity
    const color = severity > 70 ? "#ff0000" : severity > 40 ? "#ffaa00" : "#00ff00"

    // Draw highlight
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.strokeRect(x, y, w, h)
    ctx.setLineDash([])

    // Draw label
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    const labelWidth = 150
    ctx.fillRect(x, y + h, labelWidth, 20)
    ctx.fillStyle = color
    ctx.font = "12px sans-serif"
    ctx.fillText(`${condition.type}: ${severity.toFixed(0)}%`, x + 5, y + h + 15)
  }

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopAR()
      const system = getObjectRecognitionSystem()
      system.dispose()
    }
  }, [stopAR])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Advanced AR Object Recognition
          </span>
          {isActive && (
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                <Activity className="mr-1 h-3 w-3 animate-pulse" />
                Live
              </Badge>
              <Badge variant="secondary">
                <Zap className="mr-1 h-3 w-3" />
                {fps} FPS
              </Badge>
            </div>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Video/Canvas Container */}
        <div className="relative aspect-video overflow-hidden rounded-lg border-2 border-border bg-black">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            playsInline
            muted
            style={{ display: isActive ? "none" : "block" }}
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ display: isActive ? "block" : "none" }}
          />

          {!isActive && !isInitializing && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <CameraOff className="mx-auto mb-4 h-16 w-16 opacity-50" />
                <p className="text-lg">AR System Inactive</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute bottom-4 left-4 right-4 rounded bg-red-500/90 p-3 text-white">{error}</div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {!isActive ? (
            <Button onClick={startAR} disabled={isInitializing} className="flex-1">
              <Camera className="mr-2 h-4 w-4" />
              {isInitializing ? "Initializing..." : "Start AR"}
            </Button>
          ) : (
            <Button onClick={stopAR} variant="destructive" className="flex-1">
              <CameraOff className="mr-2 h-4 w-4" />
              Stop AR
            </Button>
          )}
        </div>

        {/* Analysis Results */}
        {result && (
          <div className="space-y-3">
            <div className="rounded-lg bg-muted/50 p-4">
              <h4 className="mb-2 font-semibold">Detection Results</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Objects Detected:</span>
                  <Badge>{result.objects.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Skin Conditions:</span>
                  <Badge>{result.skinConditions.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Overall Confidence:</span>
                  <Badge variant="secondary">{(result.confidence * 100).toFixed(1)}%</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Processing Time:</span>
                  <Badge variant="outline">{result.processingTime.toFixed(0)}ms</Badge>
                </div>
              </div>
            </div>

            {/* Skin Conditions Detail */}
            {result.skinConditions.length > 0 && (
              <div className="rounded-lg bg-muted/50 p-4">
                <h4 className="mb-3 font-semibold">Skin Analysis</h4>
                <div className="space-y-3">
                  {result.skinConditions.map((condition, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize">{condition.type.replace("_", " ")}</span>
                        <span className="font-medium">{condition.severity.toFixed(0)}%</span>
                      </div>
                      <Progress value={condition.severity} className="h-2" />
                      {condition.recommendations.length > 0 && (
                        <p className="text-xs text-muted-foreground">💡 {condition.recommendations[0]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
