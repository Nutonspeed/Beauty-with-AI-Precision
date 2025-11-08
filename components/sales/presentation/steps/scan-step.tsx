'use client'

/**
 * Scan Step Component
 * 
 * Mobile-optimized camera interface for capturing 3 angle photos:
 * - Front view
 * - Left profile
 * - Right profile
 * 
 * Features:
 * - Live camera preview with face detection guide
 * - Auto-advance between angles
 * - Retake capability
 * - Mobile-friendly touch controls
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Camera, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  User,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScanStepProps {
  images: {
    front?: string
    left?: string
    right?: string
  }
  onUpdate: (images: ScanStepProps['images']) => void
  customerName: string
}

type AngleType = 'front' | 'left' | 'right'

const ANGLES: { key: AngleType; label: string; icon: string }[] = [
  { key: 'front', label: 'Front View', icon: '😊' },
  { key: 'left', label: 'Left Profile', icon: '👈' },
  { key: 'right', label: 'Right Profile', icon: '👉' },
]

export function ScanStep({ images, onUpdate, customerName }: ScanStepProps) {
  const [currentAngle, setCurrentAngle] = useState<AngleType>('front')
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isCameraLoading, setIsCameraLoading] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Start camera
  const startCamera = useCallback(async () => {
    setIsCameraLoading(true)
    setCameraError(null)

    try {
      // Request camera permission with mobile-optimized settings
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user', // Front camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsCameraActive(true)
      }
    } catch (error) {
      console.error('Camera access error:', error)
      setCameraError('Unable to access camera. Please grant camera permissions.')
    } finally {
      setIsCameraLoading(false)
    }
  }, [])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
  }, [])

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0)

    // Convert to base64 image
    const imageData = canvas.toDataURL('image/jpeg', 0.9)

    // Update images
    const updatedImages = {
      ...images,
      [currentAngle]: imageData,
    }
    onUpdate(updatedImages)

    // Auto-advance to next angle
    const currentIndex = ANGLES.findIndex(a => a.key === currentAngle)
    if (currentIndex < ANGLES.length - 1) {
      setCurrentAngle(ANGLES[currentIndex + 1].key)
    } else {
      // All photos captured, stop camera
      stopCamera()
    }
  }, [currentAngle, images, onUpdate, stopCamera])

  // Retake photo
  const retakePhoto = useCallback((angle: AngleType) => {
    const updatedImages = { ...images }
    delete updatedImages[angle]
    onUpdate(updatedImages)
    setCurrentAngle(angle)
    
    // Restart camera if not active
    if (!isCameraActive) {
      startCamera()
    }
  }, [images, onUpdate, isCameraActive, startCamera])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  // Check if all photos captured
  const allPhotosCaptured = images.front && images.left && images.right

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-900 dark:text-blue-100">
          Capture 3 photos of {customerName}'s face: Front, Left profile, and Right profile.
          Ensure good lighting and the face is clearly visible.
        </AlertDescription>
      </Alert>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-4">
        {ANGLES.map((angle) => {
          const isCaptured = !!images[angle.key]
          const isCurrent = currentAngle === angle.key

          return (
            <div key={angle.key} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all',
                  isCaptured && 'bg-green-500 text-white shadow-lg ring-4 ring-green-200',
                  isCurrent && !isCaptured && 'bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110',
                  !isCaptured && !isCurrent && 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                {isCaptured ? (
                  <CheckCircle2 className="h-8 w-8" />
                ) : (
                  <span>{angle.icon}</span>
                )}
              </div>
              <span className="text-xs font-medium text-center">
                {angle.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Camera View or Preview */}
      <Card className="overflow-hidden">
        <div className="relative aspect-[4/3] bg-black">
          {!isCameraActive && !allPhotosCaptured && (
            // Start Camera Button
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-slate-900/90 to-slate-950/90">
              <User className="h-20 w-20 text-slate-400" />
              <p className="text-slate-300 text-center px-4">
                Position {customerName}'s face in the frame
              </p>
              <Button
                size="lg"
                onClick={startCamera}
                disabled={isCameraLoading}
                className="gap-2"
              >
                {isCameraLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Starting Camera...
                  </>
                ) : (
                  <>
                    <Camera className="h-5 w-5" />
                    Start Camera
                  </>
                )}
              </Button>
              {cameraError && (
                <Alert variant="destructive" className="max-w-sm">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {cameraError}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {isCameraActive && (
            // Live Camera Feed
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Face Guide Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-80 border-4 border-white/50 rounded-full animate-pulse" />
              </div>

              {/* Current Angle Indicator */}
              <Badge className="absolute top-4 left-1/2 -translate-x-1/2 text-lg py-2 px-4">
                {ANGLES.find(a => a.key === currentAngle)?.label}
              </Badge>

              {/* Capture Button */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                <Button
                  size="lg"
                  onClick={capturePhoto}
                  className="h-16 w-16 rounded-full p-0 shadow-2xl"
                >
                  <Camera className="h-8 w-8" />
                </Button>
              </div>

              {/* Stop Camera Button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={stopCamera}
                className="absolute top-4 right-4"
              >
                Cancel
              </Button>
            </>
          )}

          {allPhotosCaptured && (
            // All Photos Captured - Show Success
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-green-900/90 to-green-950/90">
              <CheckCircle2 className="h-20 w-20 text-green-400" />
              <p className="text-white text-xl font-semibold">
                All Photos Captured!
              </p>
              <p className="text-green-200 text-center px-4">
                3 angles captured successfully. Proceed to analysis.
              </p>
            </div>
          )}

          {/* Hidden Canvas for Image Capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </Card>

      {/* Captured Photos Preview */}
      {(images.front || images.left || images.right) && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Captured Photos</h3>
          <div className="grid grid-cols-3 gap-3">
            {ANGLES.map((angle) => (
              <Card key={angle.key} className="overflow-hidden">
                {images[angle.key] ? (
                  <div className="relative aspect-square">
                    <img
                      src={images[angle.key]}
                      alt={angle.label}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => retakePhoto(angle.key)}
                        className="h-8 w-8 p-0 rounded-full shadow-lg"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                    <Badge className="absolute bottom-2 left-2 text-xs">
                      {angle.label}
                    </Badge>
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <span className="text-4xl">{angle.icon}</span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
