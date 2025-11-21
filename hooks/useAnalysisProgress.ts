/**
 * Analysis Progress Hook
 * 
 * Purpose: Provide smooth, informative progress tracking during AI analysis
 * Strategy: Use realistic timing based on benchmark results (963ms average)
 * 
 * Design Principles:
 * 1. Progressive disclosure - Show what's happening step by step
 * 2. Smooth animations - No jarring jumps in progress
 * 3. Realistic timing - Match actual AI processing stages
 * 4. User confidence - Clear status messages in Thai
 */

import { useState, useEffect, useCallback, useRef } from 'react'

export interface AnalysisStage {
  progress: number      // 0-100
  label: string        // Status message
  duration: number     // Milliseconds for this stage
  icon: string         // Emoji icon
  description?: string // Optional detailed description
}

export interface AnalysisProgressState {
  progress: number
  stage: string
  icon: string
  description: string
  isComplete: boolean
  timeElapsed: number
}

/**
 * Analysis stages based on actual benchmark results:
 * - Total time: ~963ms (parallel execution)
 * - MediaPipe: ~250-500ms
 * - TensorFlow: ~550-750ms (runs parallel)
 * - HuggingFace: ~650-900ms (runs parallel)
 * - CV Algorithms: ~130-180ms (after AI models)
 */
const DEFAULT_STAGES: AnalysisStage[] = [
  {
    progress: 0,
    label: 'เตรียมการวิเคราะห์',
    duration: 200,
    icon: '🔍',
    description: 'กำลังประมวลผลภาพและเตรียมข้อมูล',
  },
  {
    progress: 10,
    label: 'กำลังสแกนใบหน้า',
    duration: 300,
    icon: '👤',
    description: 'ตรวจจับใบหน้าและจุดสำคัญ 478 จุด',
  },
  {
    progress: 25,
    label: 'วิเคราะห์ด้วย MediaPipe AI',
    duration: 400,
    icon: '🧠',
    description: 'วิเคราะห์โครงสร้างใบหน้าและริ้วรอย',
  },
  {
    progress: 45,
    label: 'วิเคราะห์เนื้อผิวด้วย TensorFlow',
    duration: 400,
    icon: '🔬',
    description: 'ตรวจสอบเนื้อสัมผัสและความเรียบเนียน',
  },
  {
    progress: 65,
    label: 'วิเคราะห์รายละเอียดด้วย HuggingFace',
    duration: 350,
    icon: '✨',
    description: 'วิเคราะห์ลักษณะผิวเชิงลึก',
  },
  {
    progress: 80,
    label: 'ตรวจจับปัญหาผิว',
    duration: 200,
    icon: '🎯',
    description: 'ตรวจหาจุดด่างดำ รูขุมขน และริ้วรอย',
  },
  {
    progress: 95,
    label: 'รวบรวมผลการวิเคราะห์',
    duration: 150,
    icon: '📊',
    description: 'ประมวลผลข้อมูลจาก 3 AI models',
  },
  {
    progress: 100,
    label: 'เสร็จสมบูรณ์',
    duration: 100,
    icon: '✅',
    description: 'การวิเคราะห์เสร็จสิ้น',
  },
]

export interface UseAnalysisProgressOptions {
  stages?: AnalysisStage[]
  onComplete?: () => void
  autoStart?: boolean
  smoothTransition?: boolean
}

/**
 * Hook for tracking analysis progress with smooth animations
 */
export function useAnalysisProgress(options: UseAnalysisProgressOptions = {}) {
  const {
    stages = DEFAULT_STAGES,
    onComplete,
    autoStart = false,
    smoothTransition: _smoothTransition = true,
  } = options

  const [state, setState] = useState<AnalysisProgressState>({
    progress: 0,
    stage: stages[0].label,
    icon: stages[0].icon,
    description: stages[0].description || '',
    isComplete: false,
    timeElapsed: 0,
  })

  const startTimeRef = useRef<number | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const timeoutRefs = useRef<NodeJS.Timeout[]>([])

  /**
   * Start the progress animation
   */
  const start = useCallback(() => {
    startTimeRef.current = Date.now()
    let cumulativeTime = 0

    // Clear any existing timeouts
    for (const timeout of timeoutRefs.current) {
      clearTimeout(timeout)
    }
    timeoutRefs.current = []

    for (const stage of stages) {
      const timeout = setTimeout(() => {
        setState({
          progress: stage.progress,
          stage: stage.label,
          icon: stage.icon,
          description: stage.description || '',
          isComplete: stage.progress === 100,
          timeElapsed: Date.now() - (startTimeRef.current || 0),
        })

        // Call onComplete callback when finished
        if (stage.progress === 100 && onComplete) {
          onComplete()
        }
      }, cumulativeTime)

      timeoutRefs.current.push(timeout)
      cumulativeTime += stage.duration
    }
  }, [stages, onComplete])

  /**
   * Reset progress to initial state
   */
  const reset = useCallback(() => {
    // Clear all timeouts
    for (const timeout of timeoutRefs.current) {
      clearTimeout(timeout)
    }
    timeoutRefs.current = []

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    setState({
      progress: 0,
      stage: stages[0].label,
      icon: stages[0].icon,
      description: stages[0].description || '',
      isComplete: false,
      timeElapsed: 0,
    })

    startTimeRef.current = null
  }, [stages])

  /**
   * Manually set progress (useful for real progress updates)
   */
  const setProgress = useCallback((progress: number) => {
    // Find the appropriate stage for this progress value
    const currentStage = stages.reduce((prev, curr) => {
      if (curr.progress <= progress) return curr
      return prev
    }, stages[0])

    setState(prev => ({
      ...prev,
      progress,
      stage: currentStage.label,
      icon: currentStage.icon,
      description: currentStage.description || '',
      isComplete: progress >= 100,
      timeElapsed: Date.now() - (startTimeRef.current || Date.now()),
    }))
  }, [stages])

  /**
   * Complete the progress immediately
   */
  const complete = useCallback(() => {
    const finalStage = stages.at(-1)!
    setState({
      progress: 100,
      stage: finalStage.label,
      icon: finalStage.icon,
      description: finalStage.description || '',
      isComplete: true,
      timeElapsed: Date.now() - (startTimeRef.current || Date.now()),
    })

    if (onComplete) {
      onComplete()
    }
  }, [stages, onComplete])

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart) {
      start()
    }

    const currentAnimationFrame = animationFrameRef.current

    // Cleanup on unmount
    return () => {
      for (const timeout of timeoutRefs.current) {
        clearTimeout(timeout)
      }
      if (currentAnimationFrame) {
        cancelAnimationFrame(currentAnimationFrame)
      }
    }
  }, [autoStart, start])

  return {
    ...state,
    start,
    reset,
    setProgress,
    complete,
    totalStages: stages.length,
    currentStageIndex: stages.findIndex(s => s.progress >= state.progress),
  }
}

/**
 * Hook for real-time analysis progress tracking
 * Updates progress based on actual analysis events
 */
export interface RealTimeProgressEvent {
  type: 'mediapipe' | 'tensorflow' | 'huggingface' | 'cv' | 'complete'
  progress: number
  message: string
}

export function useRealTimeAnalysisProgress() {
  const [events, setEvents] = useState<RealTimeProgressEvent[]>([])
  const progressHook = useAnalysisProgress({ autoStart: false })

  const reportProgress = useCallback((event: RealTimeProgressEvent) => {
    setEvents(prev => [...prev, event])
    progressHook.setProgress(event.progress)
  }, [progressHook])

  const startRealTimeTracking = useCallback(() => {
    setEvents([])
    progressHook.start()
  }, [progressHook])

  return {
    ...progressHook,
    events,
    reportProgress,
    startRealTimeTracking,
  }
}

/**
 * Format time elapsed to human readable string
 */
export function formatTimeElapsed(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const seconds = (ms / 1000).toFixed(1)
  return `${seconds}s`
}

/**
 * Get estimated time remaining
 */
export function getEstimatedTimeRemaining(
  currentProgress: number,
  timeElapsed: number
): number {
  if (currentProgress === 0) return 0
  const totalEstimated = (timeElapsed / currentProgress) * 100
  return Math.max(0, totalEstimated - timeElapsed)
}
