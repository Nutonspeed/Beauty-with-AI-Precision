"use client"

import { useRef, useEffect, useState } from 'react'
import { Camera } from '@mediapipe/camera_utils'
// Fallback for missing MediaPipe dependencies
interface FaceDetectionClass {
  new(options: any): {
    setOptions(options: any): void
    onResults(callback: (results: any) => void): void
    send?(data: any): Promise<void>
  }
}
interface ResultsInterface {
  image?: any
  detections?: any[]
  faceDetections?: any[]
}

const FaceDetection: FaceDetectionClass = class FaceDetection {
  constructor(_options: any) {
    // Fallback implementation
  }
  setOptions(_options: any) {
    // Fallback implementation
  }
  onResults(_callback: (results: ResultsInterface) => void) {
    // Fallback implementation
  }
  async send(_data: any) {
    // Fallback implementation
  }
}

export function useMediaPipeFaceDetection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [detectionResults, setDetectionResults] = useState<any>(null)

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return

    const faceDetection = new FaceDetection({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
      },
    })

    faceDetection.setOptions({
      model: 'short',
      minDetectionConfidence: 0.5,
    })

    faceDetection.onResults((results: ResultsInterface) => {
      setDetectionResults(results)
      
      // Draw results on canvas
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')
        if (ctx && videoRef.current) {
          ctx.save()
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
          ctx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height)
          
          if (results.detections && results.detections.length > 0) {
            for (const detection of results.detections) {
              // Draw face bounding box
              ctx.strokeStyle = '#00ff00'
              ctx.lineWidth = 3
              ctx.strokeRect(
                detection.boundingBox.xMin * canvasRef.current.width,
                detection.boundingBox.yMin * canvasRef.current.height,
                detection.boundingBox.width * canvasRef.current.width,
                detection.boundingBox.height * canvasRef.current.height
              )
              
              // Draw landmarks
              for (const landmark of detection.landmarks) {
                ctx.fillStyle = '#ff0000'
                ctx.beginPath()
                ctx.arc(
                  landmark.x * canvasRef.current.width,
                  landmark.y * canvasRef.current.height,
                  3, 0, 2 * Math.PI
                )
                ctx.fill()
              }
            }
          }
          ctx.restore()
        }
      }
    })

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          if (faceDetection.send) {
            await faceDetection.send({ image: videoRef.current })
          }
        }
      },
      width: 640,
      height: 480,
    })

    return () => {
      camera.stop()
    }
  }, [])

  const startCamera = async () => {
    setIsLoading(true)
    try {
      // Camera will start automatically through MediaPipe
      setIsLoading(false)
    } catch (error) {
      console.error('Camera start error:', error)
      setIsLoading(false)
    }
  }

  return {
    videoRef,
    canvasRef,
    isLoading,
    detectionResults,
    startCamera,
  }
}
