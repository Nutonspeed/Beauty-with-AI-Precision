"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision"
import { treatmentEffects, type TreatmentType } from "@/lib/ar/treatment-effects"

interface LiveARCameraProps {
  treatment: TreatmentType
  intensity: number
  onFaceDetected?: (detected: boolean) => void
}

let faceLandmarker: FaceLandmarker | null = null

export function LiveARCamera({ treatment, intensity, onFaceDetected }: Readonly<LiveARCameraProps>) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fps, setFps] = useState(0)
  const animationFrameRef = useRef<number | null>(null)
  const lastFrameTimeRef = useRef<number>(0)

  const startProcessing = useCallback(() => {
    const processFrame = (timestamp: number) => {
      if (!videoRef.current || !canvasRef.current || !faceLandmarker) {
        animationFrameRef.current = globalThis.requestAnimationFrame?.(processFrame) ?? null
        return
      }

      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d', { willReadFrequently: true })

      if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationFrameRef.current = globalThis.requestAnimationFrame?.(processFrame) ?? null
        return
      }

      // Set canvas size to match video
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
      }

      // Calculate FPS
      const deltaTime = timestamp - lastFrameTimeRef.current
      if (deltaTime > 0) {
        setFps(Math.round(1000 / deltaTime))
      }
      lastFrameTimeRef.current = timestamp

      // 1. Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // 2. Detect face landmarks
  const detectionResult = faceLandmarker.detectForVideo(video, timestamp)

  if (detectionResult?.faceLandmarks?.length) {
        onFaceDetected?.(true)
        
        const landmarks = detectionResult.faceLandmarks[0]

        // 3. Apply treatment effect if selected
        if (treatment !== 'none') {
          const effect = treatmentEffects[treatment]
          
          if (effect) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const processedData = effect.apply(ctx, imageData, intensity, landmarks)
            ctx.putImageData(processedData, 0, 0)
          }
        }

        // 4. Draw landmarks (optional - for debugging)
        // drawLandmarks(ctx, landmarks, canvas.width, canvas.height)
      } else {
        onFaceDetected?.(false)
      }

      // Continue processing
      animationFrameRef.current = globalThis.requestAnimationFrame?.(processFrame) ?? null
    }

    animationFrameRef.current = globalThis.requestAnimationFrame?.(processFrame) ?? null
  }, [treatment, intensity, onFaceDetected])

  // Initialize MediaPipe and camera
  useEffect(() => {
    let stream: MediaStream | null = null

    const init = async () => {
      try {
        // 1. Initialize MediaPipe Face Landmarker
        if (!faceLandmarker) {
          const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
          )

          faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
              delegate: "GPU"
            },
            runningMode: "VIDEO",
            numFaces: 1,
            minFaceDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
          })
        }

        // 2. Request camera access
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
          }
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setIsLoading(false)
          startProcessing()
        }
      } catch (err) {
        console.error("Error initializing camera:", err)
        setError(err instanceof Error ? err.message : "Failed to access camera")
        setIsLoading(false)
      }
    }

    init()

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        globalThis.cancelAnimationFrame?.(animationFrameRef.current)
      }
      if (stream) {
        for (const track of stream.getTracks()) {
          track.stop()
        }
      }
    }
  }, [startProcessing])

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900 rounded-lg">
        <div className="text-center text-white p-6">
          <p className="text-lg font-semibold mb-2">Camera Error</p>
          <p className="text-sm text-slate-300">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      {/* Hidden video element */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
      />

      {/* Canvas for rendering with effects */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Initializing camera...</p>
          </div>
        </div>
      )}

      {/* FPS counter */}
      {!isLoading && (
        <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-mono">
          {fps} FPS
        </div>
      )}

      {/* Treatment indicator */}
      {!isLoading && treatment !== 'none' && (
        <div className="absolute bottom-4 left-4 bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg">
          <p className="text-sm font-medium">
            {treatmentEffects[treatment]?.name} - {Math.round(intensity * 100)}%
          </p>
        </div>
      )}
    </div>
  )
}


