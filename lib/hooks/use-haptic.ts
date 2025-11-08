"use client"

import { useCallback } from "react"

type HapticFeedbackType = "light" | "medium" | "heavy" | "success" | "warning" | "error" | "selection"

interface HapticOptions {
  enabled?: boolean
  duration?: number
}

/**
 * Custom hook for haptic feedback on mobile devices
 * Provides vibration patterns for different interaction types
 * 
 * @example
 * const haptic = useHaptic()
 * haptic.trigger('light') // Quick tap feedback
 * haptic.trigger('success') // Success pattern
 */
export function useHaptic(options: HapticOptions = {}) {
  const { enabled = true, duration } = options

  const isSupported = useCallback(() => {
    return globalThis.window !== undefined && "vibrate" in navigator
  }, [])

  const trigger = useCallback(
    (type: HapticFeedbackType = "light") => {
      if (!enabled || !isSupported()) {
        return
      }

      // Define vibration patterns for different feedback types
      const patterns: Record<HapticFeedbackType, number | number[]> = {
        light: duration || 10,
        medium: duration || 20,
        heavy: duration || 30,
        success: [10, 50, 10],
        warning: [20, 100, 20],
        error: [30, 100, 30, 100, 30],
        selection: 5,
      }

      const pattern = patterns[type]

      try {
        navigator.vibrate(pattern)
      } catch (error) {
        console.warn("Haptic feedback failed:", error)
      }
    },
    [enabled, duration, isSupported]
  )

  const cancel = useCallback(() => {
    if (!isSupported()) {
      return
    }

    try {
      navigator.vibrate(0)
    } catch (error) {
      console.warn("Failed to cancel haptic feedback:", error)
    }
  }, [isSupported])

  return {
    trigger,
    cancel,
    isSupported: isSupported(),
  }
}

/**
 * Haptic feedback patterns for common UI interactions
 */
export const HAPTIC_PATTERNS = {
  // Button interactions
  BUTTON_TAP: "light" as const,
  BUTTON_HOLD: "medium" as const,
  
  // Navigation
  TAB_SWITCH: "selection" as const,
  PAGE_CHANGE: "light" as const,
  
  // Gestures
  SWIPE: "light" as const,
  PINCH: "medium" as const,
  DRAG_START: "medium" as const,
  DRAG_END: "light" as const,
  
  // Feedback
  SUCCESS: "success" as const,
  ERROR: "error" as const,
  WARNING: "warning" as const,
  
  // AR/3D interactions
  AR_SCAN_COMPLETE: "success" as const,
  MODEL_ROTATE: "selection" as const,
  TREATMENT_APPLIED: "medium" as const,
} as const

export type HapticPattern = keyof typeof HAPTIC_PATTERNS
