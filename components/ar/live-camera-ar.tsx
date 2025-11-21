"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, CameraOff, Loader2, AlertCircle, CheckCircle2, TrendingUp } from "lucide-react"
import { getMediaPipeDetector, type FaceDetectionResult } from "@/lib/ai/mediapipe-detector"
import { getFaceTrackingStabilizer } from "@/lib/ar/face-tracking-stabilizer"

interface LiveCameraARProps {
  readonly treatment: string
  readonly intensity: number
  readonly onCapture?: (imageData: string) => void
}

export function LiveCameraAR({ treatment, intensity, onCapture }: LiveCameraARProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)

  const [isStreaming, setIsStreaming] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [faceDetected, setFaceDetected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fps, setFps] = useState(0)
  const [lastFaceResult, setLastFaceResult] = useState<FaceDetectionResult | null>(null)
  const [stabilityScore, setStabilityScore] = useState(0)
  const [trackingQuality, setTrackingQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good')

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      setIsProcessing(true)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setIsStreaming(true)

        // Initialize MediaPipe
        const detector = getMediaPipeDetector()
        await detector.initialize()

        // Start AR processing loop
        processFrameRef.current?.()
      }
    } catch (err) {
      console.error("Camera error:", err)
      setError("Failed to access camera. Please grant camera permissions.")
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    setIsStreaming(false)
    setFaceDetected(false)
  }, [])

  const processFrameRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const processFrame = async () => {
      if (!videoRef.current || !canvasRef.current || !isStreaming) return

      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d", {
        alpha: false,
        desynchronized: true, // Better real-time performance
        willReadFrequently: false
      })
      if (!ctx) return

      const startTime = performance.now()

      // High-quality canvas setup
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      try {
        // Detect face with MediaPipe
        const detector = getMediaPipeDetector()
        const result = await detector.detectFace(video)

        // ENHANCED: Apply stabilization
        const stabilizer = getFaceTrackingStabilizer()
        const stabilizedResult = stabilizer.stabilize(result)

        if (stabilizedResult) {
          setFaceDetected(true)
          setLastFaceResult(stabilizedResult)
          setStabilityScore(stabilizedResult.stabilityScore)
          setTrackingQuality(stabilizedResult.trackingQuality)

          // Draw face mesh
          drawFaceMesh(ctx, stabilizedResult, canvas.width, canvas.height)

          // Apply AR treatment effect
          applyTreatmentEffect(ctx, stabilizedResult, treatment, intensity, canvas.width, canvas.height)
        } else {
          setFaceDetected(false)
        }

        // Calculate FPS
        const processingTime = performance.now() - startTime
        setFps(Math.round(1000 / processingTime))
      } catch (err) {
        console.error("Frame processing error:", err)
      }

      // Continue loop
      animationFrameRef.current = requestAnimationFrame(processFrame)
    }

    processFrameRef.current = processFrame
  }, [isStreaming, treatment, intensity])

  const drawFaceMesh = (ctx: CanvasRenderingContext2D, result: FaceDetectionResult, width: number, height: number) => {
    // Draw landmarks
    ctx.fillStyle = "rgba(0, 255, 0, 0.5)"
    result.landmarks.forEach((landmark) => {
      const x = landmark.x * width
      const y = landmark.y * height
      ctx.beginPath()
      ctx.arc(x, y, 1, 0, 2 * Math.PI)
      ctx.fill()
    })

    // Draw bounding box
    ctx.strokeStyle = "rgba(0, 255, 0, 0.8)"
    ctx.lineWidth = 2
    ctx.strokeRect(
      result.boundingBox.xMin * width,
      result.boundingBox.yMin * height,
      result.boundingBox.width * width,
      result.boundingBox.height * height,
    )
  }

  const applyTreatmentEffect = (
    ctx: CanvasRenderingContext2D,
    result: FaceDetectionResult,
    selectedTreatment: string,
    effectIntensity: number,
    width: number,
    height: number,
  ) => {
    const alpha = effectIntensity / 100
    const bbox = result.boundingBox

    // ENHANCED: High-quality real-time AR effects
    switch (selectedTreatment) {
      case "botox": {
        // Multi-layer forehead smoothing
        const foreheadY = bbox.yMin * height
        const foreheadHeight = bbox.height * height * 0.35
        
        // Layer 1: Blur for wrinkle smoothing
        ctx.filter = `blur(${alpha * 3}px)`
        ctx.drawImage(
          ctx.canvas,
          bbox.xMin * width,
          foreheadY,
          bbox.width * width,
          foreheadHeight,
          bbox.xMin * width,
          foreheadY,
          bbox.width * width,
          foreheadHeight,
        )
        ctx.filter = "none"
        
        // Layer 2: Subtle highlight for lifted appearance
        ctx.globalCompositeOperation = 'screen'
        ctx.globalAlpha = alpha * 0.12
        ctx.fillStyle = "rgba(255, 250, 245, 0.4)"
        ctx.fillRect(bbox.xMin * width, foreheadY, bbox.width * width, foreheadHeight)
        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = 'source-over'
        break
      }

      case "filler": {
        // Realistic volume enhancement with highlights
        const cheekY = bbox.yMin * height + bbox.height * height * 0.5
        const cheekHeight = bbox.height * height * 0.3
        const cheekWidth = bbox.width * width
        
        // Layer 1: Volume base
        ctx.globalAlpha = alpha * 0.35
        ctx.fillStyle = "rgba(255, 220, 200, 0.4)"
        ctx.fillRect(bbox.xMin * width, cheekY, cheekWidth, cheekHeight)
        ctx.globalAlpha = 1
        
        // Layer 2: Specular highlight (glossy effect)
        const highlightX = bbox.xMin * width + cheekWidth * 0.5
        const highlightY = cheekY + cheekHeight * 0.4
        const gradient = ctx.createRadialGradient(
          highlightX, highlightY, 0,
          highlightX, highlightY, cheekWidth * 0.4
        )
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)')
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
        ctx.globalAlpha = alpha * 0.4
        ctx.fillStyle = gradient
        ctx.fillRect(bbox.xMin * width, cheekY, cheekWidth, cheekHeight)
        ctx.globalAlpha = 1
        break
      }

      case "laser": {
        // Brightening with radiant glow
        // Layer 1: Overall brightness
        ctx.filter = `brightness(${1 + alpha * 0.2}) contrast(${1 + alpha * 0.1})`
        ctx.drawImage(ctx.canvas, 0, 0)
        ctx.filter = "none"
        
        // Layer 2: Radiant glow overlay
        ctx.globalCompositeOperation = 'screen'
        ctx.globalAlpha = alpha * 0.18
        ctx.fillStyle = 'rgba(255, 245, 230, 0.5)'
        ctx.fillRect(0, 0, width, height)
        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = 'source-over'
        break
      }

      case "peel": {
        // Skin tone evening with gradient blend
        ctx.filter = `saturate(${1 + alpha * 0.25}) brightness(${1 + alpha * 0.12})`
        ctx.drawImage(ctx.canvas, 0, 0)
        ctx.filter = "none"
        
        // Gradient tone overlay
        ctx.globalCompositeOperation = 'overlay'
        ctx.globalAlpha = alpha * 0.2
        const toneGradient = ctx.createLinearGradient(0, 0, width, 0)
        toneGradient.addColorStop(0, 'rgba(255, 230, 210, 0.3)')
        toneGradient.addColorStop(0.5, 'rgba(255, 220, 200, 0.2)')
        toneGradient.addColorStop(1, 'rgba(255, 230, 210, 0.3)')
        ctx.fillStyle = toneGradient
        ctx.fillRect(0, 0, width, height)
        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = 'source-over'
        break
      }

      case "thread": {
        // Lifting effect with shadow mapping
        const jawY = bbox.yMin * height + bbox.height * height * 0.6
        const jawHeight = bbox.height * height * 0.2
        
        // Shadow for definition
        ctx.globalCompositeOperation = 'multiply'
        ctx.globalAlpha = alpha * 0.15
        const shadowGradient = ctx.createLinearGradient(0, jawY, 0, jawY + jawHeight)
        shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
        shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)')
        ctx.fillStyle = shadowGradient
        ctx.fillRect(bbox.xMin * width, jawY, bbox.width * width, jawHeight)
        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = 'source-over'
        
        // Highlight for lift
        ctx.globalCompositeOperation = 'screen'
        ctx.globalAlpha = alpha * 0.2
        const liftHighlight = ctx.createLinearGradient(0, jawY - jawHeight, 0, jawY)
        liftHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.15)')
        liftHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)')
        ctx.fillStyle = liftHighlight
        ctx.fillRect(bbox.xMin * width, jawY - jawHeight, bbox.width * width, jawHeight)
        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = 'source-over'
        break
      }
    }
  }

  const captureSnapshot = useCallback(() => {
    if (!canvasRef.current) return

    const imageData = canvasRef.current.toDataURL("image/jpeg", 0.9)
    onCapture?.(imageData)
  }, [onCapture])

  useEffect(() => {
    return () => {
      stopCamera()
      
      // Cleanup
      const detector = getMediaPipeDetector()
      detector.dispose()
      
      const stabilizer = getFaceTrackingStabilizer()
      stabilizer.reset()
    }
  }, [stopCamera])

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Live Camera AR Preview</h3>
            <div className="flex gap-2">
              {isStreaming && (
                <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                  <div className="mr-1 h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  Live
                </Badge>
              )}
              {faceDetected && (
                <>
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-700">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Face Detected
                  </Badge>
                  {trackingQuality === 'excellent' && (
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      Excellent
                    </Badge>
                  )}
                  {trackingQuality === 'good' && (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                      Good
                    </Badge>
                  )}
                  {trackingQuality === 'fair' && (
                    <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700">
                      Fair
                    </Badge>
                  )}
                  {trackingQuality === 'poor' && (
                    <Badge variant="secondary" className="bg-red-500/10 text-red-700">
                      Poor - Hold Still
                    </Badge>
                  )}
                </>
              )}
              {isStreaming && <Badge variant="secondary">{fps} FPS</Badge>}
            </div>
          </div>

          <div className="relative aspect-video overflow-hidden rounded-lg border-2 border-border bg-black ar-transition">
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover ar-video-hidden"
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 h-full w-full object-cover ar-canvas-high-quality ar-canvas-visible"
            />

            {!isStreaming && !error && (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <Camera className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                  <p className="text-muted-foreground">Camera not started</p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <AlertCircle className="mx-auto mb-4 h-16 w-16 text-destructive" />
                  <p className="text-destructive">{error}</p>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {!isStreaming ? (
              <Button onClick={startCamera} disabled={isProcessing} className="flex-1">
                <Camera className="mr-2 h-4 w-4" />
                Start Camera
              </Button>
            ) : (
              <>
                <Button onClick={stopCamera} variant="destructive" className="flex-1">
                  <CameraOff className="mr-2 h-4 w-4" />
                  Stop Camera
                </Button>
                <Button onClick={captureSnapshot} variant="secondary">
                  Capture
                </Button>
              </>
            )}
          </div>

          {lastFaceResult && (
            <div className="rounded-lg bg-muted/50 p-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="font-medium">Landmarks:</span> {lastFaceResult.landmarks.length}
                </div>
                <div>
                  <span className="font-medium">Confidence:</span> {(lastFaceResult.confidence * 100).toFixed(1)}%
                </div>
                <div>
                  <span className="font-medium">Stability:</span> {(stabilityScore * 100).toFixed(0)}%
                </div>
                <div>
                  <span className="font-medium">Processing:</span> {lastFaceResult.processingTime.toFixed(0)}ms
                </div>
                <div>
                  <span className="font-medium">FPS:</span> {fps}
                </div>
                <div>
                  <span className="font-medium">Quality:</span> {trackingQuality}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
