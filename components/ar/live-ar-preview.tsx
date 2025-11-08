/**
 * Live AR Preview Component
 * Component สำหรับแสดง AR live preview พร้อม controls
 */

'use client'

import React, { useState } from 'react'
import { useLiveARPreview } from '@/hooks/useLiveARPreview'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import type { AREffectConfig } from '@/lib/ar/live-preview-manager'

interface LiveARPreviewProps {
  className?: string
  onCapture?: (imageData: string) => void
  defaultEffects?: AREffectConfig[]
}

export function LiveARPreview({ className = '', onCapture, defaultEffects = [] }: LiveARPreviewProps) {
  const {
    isActive,
    isInitializing,
    error,
    fps,
    faceDetected,
    startPreview,
    stopPreview,
    addEffect,
    removeEffect,
    clearEffects,
    updateEffectIntensity,
    captureFrame,
    videoRef,
    canvasRef
  } = useLiveARPreview()

  const [selectedEffect, setSelectedEffect] = useState<AREffectConfig['type'] | null>(null)
  const [effectIntensity, setEffectIntensity] = useState(0.5)

  const handleStart = async () => {
    try {
      await startPreview({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'user',
          frameRate: { ideal: 30, max: 60 }
        },
        enableFaceTracking: true,
        enableAREffects: true,
        targetFPS: 30,
        quality: 'high'
      })

      // Apply default effects
      defaultEffects.forEach(effect => addEffect(effect))
    } catch (err) {
      console.error('Failed to start preview:', err)
    }
  }

  const handleStop = () => {
    stopPreview()
    clearEffects()
    setSelectedEffect(null)
  }

  const handleEffectToggle = (type: AREffectConfig['type']) => {
    if (selectedEffect === type) {
      removeEffect(type)
      setSelectedEffect(null)
    } else {
      if (selectedEffect) {
        removeEffect(selectedEffect)
      }
      addEffect({
        type,
        intensity: effectIntensity,
        targetAreas: type === 'botox' ? ['forehead'] : type === 'filler' ? ['cheeks'] : ['full']
      })
      setSelectedEffect(type)
    }
  }

  const handleIntensityChange = (value: number[]) => {
    const newIntensity = value[0]
    setEffectIntensity(newIntensity)
    
    if (selectedEffect) {
      updateEffectIntensity(selectedEffect, newIntensity)
    }
  }

  const handleCapture = () => {
    const imageData = captureFrame()
    if (imageData && onCapture) {
      onCapture(imageData)
    }
  }

  const effects: Array<{ type: AREffectConfig['type']; label: string; icon: string }> = [
    { type: 'smoothing', label: 'ปรับผิวเรียบ', icon: '✨' },
    { type: 'whitening', label: 'กระจ่างใส', icon: '💎' },
    { type: 'botox', label: 'Botox', icon: '💉' },
    { type: 'filler', label: 'Filler', icon: '💧' },
    { type: 'laser', label: 'Laser', icon: '⚡' },
    { type: 'peel', label: 'Peel', icon: '🌟' }
  ]

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Video Display */}
      <Card className="relative overflow-hidden bg-black">
        <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
          {/* Hidden video element */}
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover opacity-0"
            playsInline
            muted
          />
          
          {/* Canvas for AR preview */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Status Overlays */}
          <div className="absolute top-4 left-4 space-y-2">
            {isActive && (
              <>
                <Badge variant="default" className="bg-red-500">
                  🔴 LIVE
                </Badge>
                <Badge variant="secondary">
                  {fps} FPS
                </Badge>
                {faceDetected && (
                  <Badge variant="default" className="bg-green-500">
                    ✓ Face Detected
                  </Badge>
                )}
              </>
            )}
          </div>

          {/* Controls Overlay */}
          {isActive && (
            <div className="absolute bottom-4 right-4">
              <Button
                onClick={handleCapture}
                size="lg"
                className="rounded-full w-16 h-16"
              >
                📷
              </Button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-center text-white p-6">
                <p className="text-xl mb-2">⚠️ เกิดข้อผิดพลาด</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Placeholder when inactive */}
          {!isActive && !isInitializing && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center text-white">
                <p className="text-2xl mb-4">📹</p>
                <p className="text-lg">AR Live Preview</p>
                <p className="text-sm text-gray-400 mt-2">กดเริ่มเพื่อเปิดกล้อง</p>
              </div>
            </div>
          )}

          {/* Loading overlay */}
          {isInitializing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-center text-white">
                <div className="animate-spin text-4xl mb-4">⚙️</div>
                <p>กำลังเริ่มต้น...</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Controls */}
      <Card className="p-4 space-y-4">
        {/* Start/Stop Buttons */}
        <div className="flex gap-2">
          {!isActive ? (
            <Button
              onClick={handleStart}
              disabled={isInitializing}
              className="flex-1"
              size="lg"
            >
              {isInitializing ? 'กำลังเริ่มต้น...' : '🎥 เริ่ม Live Preview'}
            </Button>
          ) : (
            <Button
              onClick={handleStop}
              variant="destructive"
              className="flex-1"
              size="lg"
            >
              ⏹️ หยุด
            </Button>
          )}
        </div>

        {/* AR Effects */}
        {isActive && (
          <>
            <div>
              <h3 className="font-semibold mb-3">AR Effects</h3>
              <div className="grid grid-cols-3 gap-2">
                {effects.map(effect => (
                  <Button
                    key={effect.type}
                    onClick={() => handleEffectToggle(effect.type)}
                    variant={selectedEffect === effect.type ? 'default' : 'outline'}
                    className="h-auto py-3 flex flex-col items-center"
                  >
                    <span className="text-2xl mb-1">{effect.icon}</span>
                    <span className="text-xs">{effect.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Intensity Control */}
            {selectedEffect && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">
                    ความเข้ม {selectedEffect}
                  </label>
                  <span className="text-sm text-gray-500">
                    {Math.round(effectIntensity * 100)}%
                  </span>
                </div>
                <Slider
                  value={[effectIntensity]}
                  onValueChange={handleIntensityChange}
                  min={0}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
              </div>
            )}

            {/* Info */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>💡 เลือก effect เพื่อดูผลลัพธ์แบบ real-time</p>
              <p>📸 กดปุ่มถ่ายรูปเพื่อบันทึกภาพ</p>
              <p>🎯 หันหน้าเข้ากล้องเพื่อผลลัพธ์ที่ดีที่สุด</p>
            </div>
          </>
        )}
      </Card>

      {/* Performance Info (Dev) */}
      {isActive && process.env.NODE_ENV === 'development' && (
        <Card className="p-3 bg-gray-50">
          <div className="text-xs space-y-1">
            <p>
              <span className="font-semibold">FPS:</span> {fps}
            </p>
            <p>
              <span className="font-semibold">Face Detected:</span>{' '}
              {faceDetected ? 'Yes' : 'No'}
            </p>
            <p>
              <span className="font-semibold">Active Effect:</span>{' '}
              {selectedEffect || 'None'}
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}

export default LiveARPreview
