"use client"

/**
 * Camera Positioning Guide Component
 * Helps users position their face correctly for optimal analysis
 * Enhanced with MediaPipe Face Mesh for accurate detection
 */

import { useEffect, useRef, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle, Camera } from "lucide-react"
// Import dynamically to avoid SSR issues
// import { FaceMesh } from "@mediapipe/face_mesh"

export interface CameraPositioningGuideProps {
  videoStream?: MediaStream
  onPositionValid?: (isValid: boolean) => void
  showOverlay?: boolean
}

export function CameraPositioningGuide({
  videoStream,
  onPositionValid: _onPositionValid,
  showOverlay = true,
}: CameraPositioningGuideProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const faceMeshRef = useRef<any | null>(null)
  const [faceLandmarks, setFaceLandmarks] = useState<any>(null)
  const [positionStatus, setPositionStatus] = useState<{
    distance: "too-close" | "too-far" | "good"
    angle: "left" | "right" | "up" | "down" | "good"
    lighting: "too-dark" | "too-bright" | "good"
    overall: boolean
  }>({
    distance: "good",
    angle: "good",
    lighting: "good",
    overall: true,
  })

  const onFaceMeshResults = (results: any) => {
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      setFaceLandmarks(results.multiFaceLandmarks[0])
    } else {
      setFaceLandmarks(null)
    }
  }

  const checkLighting = useCallback((imageData: ImageData): "too-dark" | "too-bright" | "good" => {
    const data = imageData.data
    let sum = 0
    const sampleSize = 1000

    // Sample pixels
    for (let i = 0; i < sampleSize; i++) {
      const idx = Math.floor(Math.random() * (data.length / 4)) * 4
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3
      sum += brightness
    }

    const avgBrightness = sum / sampleSize

    if (avgBrightness < 80) return "too-dark"
    if (avgBrightness > 200) return "too-bright"
    return "good"
  }, [])

  const checkDistance = useCallback((_imageData: ImageData): "too-close" | "too-far" | "good" => {
    if (!faceLandmarks) {
      return "good" // No face detected, assume neutral
    }

    // Calculate face bounding box from landmarks
    let minX = 1,
      maxX = 0,
      minY = 1,
      maxY = 0

    for (const landmark of faceLandmarks) {
      minX = Math.min(minX, landmark.x)
      maxX = Math.max(maxX, landmark.x)
      minY = Math.min(minY, landmark.y)
      maxY = Math.max(maxY, landmark.y)
    }

    const faceWidth = maxX - minX
    const faceHeight = maxY - minY
    const faceArea = faceWidth * faceHeight

    // Optimal face should occupy 25-45% of frame
    if (faceArea > 0.45) return "too-close"
    if (faceArea < 0.2) return "too-far"
    return "good"
  }, [faceLandmarks])

  const checkAngle = useCallback((_imageData: ImageData): "left" | "right" | "up" | "down" | "good" => {
    if (!faceLandmarks) {
      return "good" // No face detected, assume neutral
    }

    // Use key landmarks for angle detection
    // Nose tip: 1, Left eye: 33, Right eye: 263, Left mouth: 61, Right mouth: 291
    const noseTip = faceLandmarks[1]
    const leftEye = faceLandmarks[33]
    const rightEye = faceLandmarks[263]
    const leftMouth = faceLandmarks[61]
    const rightMouth = faceLandmarks[291]

    // Check horizontal rotation (left/right)
    const eyeCenterX = (leftEye.x + rightEye.x) / 2
    const horizontalOffset = noseTip.x - eyeCenterX
    if (horizontalOffset > 0.03) return "right"
    if (horizontalOffset < -0.03) return "left"

    // Check vertical rotation (up/down)
    const eyeCenterY = (leftEye.y + rightEye.y) / 2
    const mouthCenterY = (leftMouth.y + rightMouth.y) / 2
    const faceLength = mouthCenterY - eyeCenterY
    const verticalOffset = noseTip.y - (eyeCenterY + faceLength * 0.4)

    if (verticalOffset < -0.02) return "up"
    if (verticalOffset > 0.02) return "down"

    return "good"
  }, [faceLandmarks])

  // Check overall position status
  const checkPosition = useCallback(() => {
    if (!canvasRef.current || !videoRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Get ImageData from video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    setPositionStatus({
      lighting: checkLighting(imageData),
      distance: checkDistance(imageData),
      angle: checkAngle(imageData),
      overall:
        checkLighting(imageData) === "good" && checkDistance(imageData) === "good" && checkAngle(imageData) === "good",
    })
  }, [checkLighting, checkDistance, checkAngle])

  useEffect(() => {
    if (!videoStream || !videoRef.current) return

    videoRef.current.srcObject = videoStream
    videoRef.current.play()

    // Initialize MediaPipe Face Mesh dynamically
    import('@mediapipe/face_mesh').then(({ FaceMesh }) => {
      const faceMesh = new FaceMesh({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        },
      })

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })

      faceMesh.onResults(onFaceMeshResults)
      faceMeshRef.current = faceMesh
    })

    // Start position checking
    const checkInterval = setInterval(() => {
      checkPosition()
    }, 100) // Check every 100ms for smooth updates

    return () => {
      clearInterval(checkInterval)
      if (faceMeshRef.current) {
        faceMeshRef.current.close()
      }
    }
  }, [videoStream, checkPosition])

  // Update position status when face landmarks change
  useEffect(() => {
    if (!faceLandmarks) return

    checkPosition()
  }, [faceLandmarks, checkPosition])

  return (
    <div className="relative">
      {/* Video Preview */}
      <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden">
        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

        {/* Face Outline Overlay */}
        {showOverlay && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className={`w-[60%] h-[80%] border-4 rounded-full transition-colors ${
                positionStatus.overall ? "border-green-500" : "border-yellow-500 animate-pulse"
              }`}
            >
              {/* Center crosshair */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white rounded-full" />
              </div>
            </div>
          </div>
        )}

        {/* Status Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <Badge variant={positionStatus.lighting === "good" ? "default" : "destructive"} className="gap-1">
            {positionStatus.lighting === "good" ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <AlertCircle className="w-3 h-3" />
            )}
            Lighting: {positionStatus.lighting}
          </Badge>

          <Badge variant={positionStatus.distance === "good" ? "default" : "destructive"} className="gap-1">
            {positionStatus.distance === "good" ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <AlertCircle className="w-3 h-3" />
            )}
            Distance: {positionStatus.distance}
          </Badge>

          <Badge variant={positionStatus.angle === "good" ? "default" : "destructive"} className="gap-1">
            {positionStatus.angle === "good" ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <AlertCircle className="w-3 h-3" />
            )}
            Angle: {positionStatus.angle}
          </Badge>
        </div>

        {/* Overall Status */}
        {positionStatus.overall ? (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <Badge className="bg-green-500 text-white gap-2 px-4 py-2">
              <CheckCircle2 className="w-4 h-4" />
              Perfect Position!
            </Badge>
          </div>
        ) : (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <Badge variant="destructive" className="gap-2 px-4 py-2">
              <AlertCircle className="w-4 h-4" />
              Adjust Position
            </Badge>
          </div>
        )}
      </div>

      {/* Hidden canvas for analysis */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Instructions */}
      <Card className="mt-4 p-4">
        <div className="flex items-start gap-3">
          <Camera className="w-5 h-5 text-primary mt-0.5" />
          <div className="space-y-2 text-sm">
            <p className="font-medium">Positioning Tips:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Face the camera directly</li>
              <li>Keep your face centered in the oval</li>
              <li>Maintain 30-50cm distance from camera</li>
              <li>Ensure good, even lighting</li>
              <li>Remove glasses if possible</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
