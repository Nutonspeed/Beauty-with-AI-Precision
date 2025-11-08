/**
 * React Hook for Live AR Preview
 * จัดการ state และ lifecycle ของ live AR preview
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getLiveARPreviewManager, type AREffectConfig, type FaceTrackingResult, type LivePreviewConfig } from '@/lib/ar/live-preview-manager'

export interface UseLiveARPreviewState {
  isActive: boolean
  isInitializing: boolean
  error: string | null
  fps: number
  faceDetected: boolean
  lastFaceResult: FaceTrackingResult | null
}

export interface UseLiveARPreviewReturn extends UseLiveARPreviewState {
  // Actions
  startPreview: (config?: Partial<LivePreviewConfig>) => Promise<void>
  stopPreview: () => void
  
  // Effects management
  addEffect: (effect: AREffectConfig) => void
  removeEffect: (type: AREffectConfig['type']) => void
  clearEffects: () => void
  updateEffectIntensity: (type: AREffectConfig['type'], intensity: number) => void
  
  // Utilities
  captureFrame: () => string | null
  
  // Refs
  videoRef: React.RefObject<HTMLVideoElement>
  canvasRef: React.RefObject<HTMLCanvasElement>
}

export function useLiveARPreview(): UseLiveARPreviewReturn {
  const [state, setState] = useState<UseLiveARPreviewState>({
    isActive: false,
    isInitializing: false,
    error: null,
    fps: 0,
    faceDetected: false,
    lastFaceResult: null
  })

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const managerRef = useRef(getLiveARPreviewManager())

  // Setup callbacks
  useEffect(() => {
    const manager = managerRef.current

    manager.setCallbacks({
      onFaceDetected: (result: FaceTrackingResult) => {
        setState((prev: UseLiveARPreviewState) => ({
          ...prev,
          faceDetected: true,
          lastFaceResult: result
        }))
      },
      onFPSUpdate: (fps: number) => {
        setState((prev: UseLiveARPreviewState) => ({
          ...prev,
          fps
        }))
      },
      onError: (error: Error) => {
        setState((prev: UseLiveARPreviewState) => ({
          ...prev,
          error: error.message,
          isInitializing: false,
          isActive: false
        }))
      }
    })
  }, [])

  const startPreview = useCallback(async (config?: Partial<LivePreviewConfig>) => {
    if (!videoRef.current || !canvasRef.current) {
      const error = 'Video or Canvas element not available'
      setState((prev: UseLiveARPreviewState) => ({
        ...prev,
        error
      }))
      throw new Error(error)
    }

    try {
      setState((prev: UseLiveARPreviewState) => ({
        ...prev,
        isInitializing: true,
        error: null
      }))

      await managerRef.current.start(
        videoRef.current,
        canvasRef.current,
        config
      )

      setState((prev: UseLiveARPreviewState) => ({
        ...prev,
        isActive: true,
        isInitializing: false
      }))

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start preview'
      
      setState((prev: UseLiveARPreviewState) => ({
        ...prev,
        error: errorMessage,
        isInitializing: false,
        isActive: false
      }))

      throw error
    }
  }, [])

  const stopPreview = useCallback(() => {
    managerRef.current.stop()
    
    setState((prev: UseLiveARPreviewState) => ({
      ...prev,
      isActive: false,
      faceDetected: false,
      lastFaceResult: null,
      fps: 0
    }))
  }, [])

  const addEffect = useCallback((effect: AREffectConfig) => {
    managerRef.current.addEffect(effect)
  }, [])

  const removeEffect = useCallback((type: AREffectConfig['type']) => {
    managerRef.current.removeEffect(type)
  }, [])

  const clearEffects = useCallback(() => {
    managerRef.current.clearEffects()
  }, [])

  const updateEffectIntensity = useCallback((type: AREffectConfig['type'], intensity: number) => {
    managerRef.current.updateEffectIntensity(type, intensity)
  }, [])

  const captureFrame = useCallback(() => {
    return managerRef.current.captureFrame()
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.isActive) {
        managerRef.current.stop()
      }
    }
  }, [state.isActive])

  return {
    ...state,
    startPreview,
    stopPreview,
    addEffect,
    removeEffect,
    clearEffects,
    updateEffectIntensity,
    captureFrame,
    videoRef,
    canvasRef
  }
}
