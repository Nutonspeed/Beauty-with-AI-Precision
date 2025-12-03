// Performance Monitor Hook - Real-time FPS and metrics tracking
// Optimized for 60 FPS AR rendering

import { useState, useEffect, useRef, useCallback } from 'react'

interface PerformanceMetrics {
  fps: number
  frameTime: number
  memoryUsage?: number
  renderTime?: number
  networkLatency?: number
}

export function usePerformanceMonitor(updateInterval = 1000) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0
  })

  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())
  const isMonitoringRef = useRef(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const calculateMetrics = useCallback(() => {
    const now = performance.now()
    const deltaTime = now - lastTimeRef.current

    if (deltaTime > 0) {
      const fps = (frameCountRef.current / deltaTime) * 1000
      const frameTime = deltaTime / frameCountRef.current

      const newMetrics: PerformanceMetrics = {
        fps: Math.round(fps),
        frameTime: Math.round(frameTime * 100) / 100,
        memoryUsage: (performance as any)?.memory?.usedJSHeapSize,
        renderTime: frameTime
      }

      setMetrics(newMetrics)
    }

    // Reset counters
    frameCountRef.current = 0
    lastTimeRef.current = now
  }, [])

  const startMonitoring = useCallback(() => {
    if (isMonitoringRef.current) return

    isMonitoringRef.current = true
    lastTimeRef.current = performance.now()

    // Update metrics periodically
    intervalRef.current = setInterval(calculateMetrics, updateInterval)
  }, [calculateMetrics, updateInterval])

  const stopMonitoring = useCallback(() => {
    if (!isMonitoringRef.current) return

    isMonitoringRef.current = false
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }, [])

  const recordFrame = useCallback(() => {
    if (isMonitoringRef.current) {
      frameCountRef.current++
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring()
    }
  }, [stopMonitoring])

  return {
    metrics,
    startMonitoring,
    stopMonitoring,
    recordFrame,
    isMonitoring: isMonitoringRef.current
  }
}
