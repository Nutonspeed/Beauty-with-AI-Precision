
'use client'

import { useEffect, useRef } from 'react'

interface EngagementTelemetryProps {
  shareToken: string
  analysisId?: string
}

export function EngagementTelemetry({ shareToken, analysisId }: EngagementTelemetryProps) {
  const startTimeRef = useRef<number>(Date.now())
  const interactionsRef = useRef<number>(0)

  useEffect(() => {
    if (!shareToken) return

    const handleInteraction = () => {
      interactionsRef.current += 1
    }

    const startTime = startTimeRef.current;

    const sendTelemetry = (durationSeconds: number) => {
      const data = JSON.stringify({
        duration_seconds: durationSeconds,
        interactions: interactionsRef.current,
        scroll_depth: Math.round((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100),
        analysis_id: analysisId
      })

      // Use beacon for reliability on close
      if (navigator.sendBeacon) {
        navigator.sendBeacon(`/api/share/${shareToken}/telemetry`, data)
      } else {
        fetch(`/api/share/${shareToken}/telemetry`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: data,
          keepalive: true
        }).catch(() => {})
      }
    }

    // Heartbeat to track active time more reliably
    const heartbeatInterval = setInterval(() => {
      const activeDuration = Math.round((Date.now() - startTime) / 1000)
      if (activeDuration > 0 && activeDuration % 30 === 0) { // Every 30s
        sendTelemetry(activeDuration)
      }
    }, 10000) // Check every 10s

    window.addEventListener('click', handleInteraction)
    window.addEventListener('scroll', handleInteraction)

    return () => {
      clearInterval(heartbeatInterval)
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('scroll', handleInteraction)

      const endTime = Date.now()
      const durationSeconds = Math.round((endTime - startTime) / 1000)
      
      if (durationSeconds > 5) {
        sendTelemetry(durationSeconds)
      }
    }
  }, [shareToken, analysisId])

  return null // Renderless component
}
