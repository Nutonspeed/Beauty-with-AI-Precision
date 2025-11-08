"use client"

/**
 * Multi-Angle Camera Component
 * VISIA-style 3-view capture system (Front, Left 45°, Right 45°)
 */

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Camera, Check, RotateCcw, RotateCw } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CapturedView {
  angle: "front" | "left" | "right"
  imageData: string
  timestamp: number
}

export interface MultiAngleCameraProps {
  onComplete?: (views: CapturedView[]) => void
  className?: string
}

export function MultiAngleCamera({ onComplete, className }: MultiAngleCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [isActive, setIsActive] = useState(false)
  const [currentAngle, setCurrentAngle] = useState<"front" | "left" | "right">("front")
  const [capturedViews, setCapturedViews] = useState<CapturedView[]>([])
  const [isCapturing, setIsCapturing] = useState(false)

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsActive(true)
      }
    } catch (error) {
      console.error("[v0] Camera error:", error)
      alert("Unable to access camera. Please check permissions.")
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsActive(false)
  }, [])

  const captureView = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas) return

    setIsCapturing(true)

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Draw video frame
    ctx.drawImage(video, 0, 0)

    // Get high-quality JPEG
    const imageData = canvas.toDataURL("image/jpeg", 0.95)

    const newView: CapturedView = {
      angle: currentAngle,
      imageData,
      timestamp: Date.now(),
    }

    setCapturedViews((prev) => [...prev, newView])

    // Move to next angle
    if (currentAngle === "front") {
      setCurrentAngle("left")
    } else if (currentAngle === "left") {
      setCurrentAngle("right")
    } else {
      // All views captured
      stopCamera()
      if (onComplete) {
        onComplete([...capturedViews, newView])
      }
    }

    setIsCapturing(false)
  }, [currentAngle, capturedViews, stopCamera, onComplete])

  const reset = useCallback(() => {
    setCapturedViews([])
    setCurrentAngle("front")
    if (!isActive) {
      startCamera()
    }
  }, [isActive, startCamera])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  const getAngleInstruction = () => {
    switch (currentAngle) {
      case "front":
        return {
          title: "Front View / มุมหน้าตรง",
          instruction: "Look straight at the camera / มองตรงกล้อง",
          icon: <Camera className="w-8 h-8" />,
        }
      case "left":
        return {
          title: "Left 45° View / มุมซ้าย 45°",
          instruction: "Turn your face 45° to the left / หันหน้าไปทางซ้าย 45°",
          icon: <RotateCcw className="w-8 h-8" />,
        }
      case "right":
        return {
          title: "Right 45° View / มุมขวา 45°",
          instruction: "Turn your face 45° to the right / หันหน้าไปทางขวา 45°",
          icon: <RotateCw className="w-8 h-8" />,
        }
    }
  }

  const instruction = getAngleInstruction()
  const progress = (capturedViews.length / 3) * 100

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Progress Bar */}
      <div className="h-2 bg-muted">
        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      {/* Video Container */}
      <div className="relative aspect-video bg-black">
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" autoPlay playsInline muted />
        <canvas ref={canvasRef} className="hidden" />

        {/* Instruction Overlay */}
        {isActive && (
          <div className="absolute top-4 left-0 right-0 flex flex-col items-center gap-2">
            <div className="bg-black/80 text-white px-6 py-3 rounded-full flex items-center gap-3">
              {instruction.icon}
              <div className="text-left">
                <div className="font-semibold">{instruction.title}</div>
                <div className="text-sm opacity-90">{instruction.instruction}</div>
              </div>
            </div>
          </div>
        )}

        {/* Angle Guide Overlay */}
        {isActive && (
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Center guideline */}
              <line
                x1="50"
                y1="0"
                x2="50"
                y2="100"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />

              {/* Face oval guide */}
              <ellipse cx="50" cy="50" rx="20" ry="30" fill="none" stroke="rgba(0,255,0,0.5)" strokeWidth="0.5" />
            </svg>
          </div>
        )}

        {/* Captured Views Preview */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          {["front", "left", "right"].map((angle) => {
            const captured = capturedViews.find((v) => v.angle === angle)
            return (
              <div
                key={angle}
                className={cn(
                  "w-16 h-16 rounded border-2 flex items-center justify-center text-xs font-medium",
                  captured
                    ? "border-green-500 bg-green-500/20 text-green-500"
                    : angle === currentAngle
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-muted bg-muted/20 text-muted-foreground",
                )}
              >
                {captured ? <Check className="w-6 h-6" /> : <span className="uppercase">{angle[0]}</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 space-y-3 bg-muted">
        {!isActive ? (
          <Button onClick={startCamera} className="w-full gap-2" size="lg">
            <Camera className="w-5 h-5" />
            Start Multi-Angle Capture / เริ่มถ่ายหลายมุม
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={captureView} disabled={isCapturing} className="flex-1 gap-2" size="lg">
              <Camera className="w-5 h-5" />
              Capture {instruction.title.split(" ")[0]} / ถ่าย
            </Button>
            <Button onClick={reset} variant="outline" size="lg">
              Reset / รีเซ็ต
            </Button>
          </div>
        )}

        {/* Progress Text */}
        <div className="text-center text-sm text-muted-foreground">
          {capturedViews.length} of 3 views captured / ถ่ายแล้ว {capturedViews.length} จาก 3 มุม
        </div>
      </div>
    </Card>
  )
}
