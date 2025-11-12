"use client"

import { useEffect } from "react"
import { usageTracker } from "@/lib/analytics/usage-tracker"

export function SessionTracker() {
  useEffect(() => {
    // Track session start when component mounts
    // Note: Session start is already tracked in usageTracker constructor

    // Track session end when page unloads
    const handleBeforeUnload = () => {
      usageTracker.trackSessionEnd()
    }

    // Track visibility changes (tab switching, minimizing)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        usageTracker.trackEvent({
          event: 'page_hidden',
          category: 'engagement',
          metadata: { timestamp: new Date() }
        })
      } else {
        usageTracker.trackEvent({
          event: 'page_visible',
          category: 'engagement',
          metadata: { timestamp: new Date() }
        })
      }
    }

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return null // This component doesn't render anything
}