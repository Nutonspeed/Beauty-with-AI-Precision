/**
 * FPS Monitor and Performance Tracker
 * Real-time performance monitoring for 60 FPS target
 */

export interface FPSMetrics {
  current: number
  average: number
  min: number
  max: number
  frameTime: number
  droppedFrames: number
}

export interface PerformanceReport {
  fps: FPSMetrics
  memory: {
    used: number
    total: number
    percentage: number
  }
  timing: {
    render: number
    compute: number
    idle: number
  }
  warnings: string[]
}

export class FPSMonitor {
  private frames: number[] = []
  private lastFrameTime = 0
  private frameCount = 0
  private droppedFrames = 0
  private readonly TARGET_FPS = 60
  private readonly TARGET_FRAME_TIME = 1000 / 60 // ~16.67ms
  private readonly MAX_SAMPLES = 60 // Keep last 60 frames

  private renderTimes: number[] = []
  private computeTimes: number[] = []

  private isMonitoring = false
  private animationFrameId: number | null = null

  /**
   * Start monitoring FPS
   */
  start(): void {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.lastFrameTime = performance.now()
    this.frameCount = 0
    this.droppedFrames = 0
    this.frames = []

    this.monitorFrame()
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    this.isMonitoring = false
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  /**
   * Monitor frame performance
   */
  private monitorFrame = (): void => {
    if (!this.isMonitoring) return

    const currentTime = performance.now()
    const deltaTime = currentTime - this.lastFrameTime

    // Calculate FPS
    const fps = 1000 / deltaTime
    this.frames.push(fps)

    // Keep only recent samples
    if (this.frames.length > this.MAX_SAMPLES) {
      this.frames.shift()
    }

    // Track dropped frames (if frame time > target)
    if (deltaTime > this.TARGET_FRAME_TIME * 1.5) {
      this.droppedFrames++
    }

    this.lastFrameTime = currentTime
    this.frameCount++

    // Continue monitoring
    this.animationFrameId = requestAnimationFrame(this.monitorFrame)
  }

  /**
   * Record render time
   */
  recordRenderTime(time: number): void {
    this.renderTimes.push(time)
    if (this.renderTimes.length > this.MAX_SAMPLES) {
      this.renderTimes.shift()
    }
  }

  /**
   * Record compute time
   */
  recordComputeTime(time: number): void {
    this.computeTimes.push(time)
    if (this.computeTimes.length > this.MAX_SAMPLES) {
      this.computeTimes.shift()
    }
  }

  /**
   * Get current FPS metrics
   */
  getMetrics(): FPSMetrics {
    if (this.frames.length === 0) {
      return {
        current: 0,
        average: 0,
        min: 0,
        max: 0,
        frameTime: 0,
        droppedFrames: 0,
      }
    }

    const current = this.frames[this.frames.length - 1]
    const average = this.frames.reduce((a, b) => a + b, 0) / this.frames.length
    const min = Math.min(...this.frames)
    const max = Math.max(...this.frames)
    const frameTime = 1000 / average

    return {
      current: Math.round(current),
      average: Math.round(average),
      min: Math.round(min),
      max: Math.round(max),
      frameTime: Math.round(frameTime * 100) / 100,
      droppedFrames: this.droppedFrames,
    }
  }

  /**
   * Get comprehensive performance report
   */
  getReport(): PerformanceReport {
    const fps = this.getMetrics()
    const warnings: string[] = []

    // Check for performance issues
    if (fps.average < 30) {
      warnings.push("Critical: FPS below 30. Consider reducing quality or resolution.")
    } else if (fps.average < 45) {
      warnings.push("Warning: FPS below 45. Performance may be degraded.")
    }

    if (fps.droppedFrames > 10) {
      warnings.push(`${fps.droppedFrames} frames dropped. Check for heavy computations.`)
    }

    // Memory metrics
    const memory = this.getMemoryMetrics()
    if (memory.percentage > 80) {
      warnings.push("High memory usage detected. Consider clearing caches.")
    }

    // Timing metrics
    const avgRenderTime =
      this.renderTimes.length > 0 ? this.renderTimes.reduce((a, b) => a + b, 0) / this.renderTimes.length : 0

    const avgComputeTime =
      this.computeTimes.length > 0 ? this.computeTimes.reduce((a, b) => a + b, 0) / this.computeTimes.length : 0

    const timing = {
      render: Math.round(avgRenderTime * 100) / 100,
      compute: Math.round(avgComputeTime * 100) / 100,
      idle: Math.max(0, this.TARGET_FRAME_TIME - avgRenderTime - avgComputeTime),
    }

    return {
      fps,
      memory,
      timing,
      warnings,
    }
  }

  /**
   * Get memory metrics
   */
  private getMemoryMetrics(): { used: number; total: number; percentage: number } {
    if ("memory" in performance) {
      const mem = (performance as any).memory
      return {
        used: Math.round(mem.usedJSHeapSize / 1024 / 1024),
        total: Math.round(mem.totalJSHeapSize / 1024 / 1024),
        percentage: Math.round((mem.usedJSHeapSize / mem.totalJSHeapSize) * 100),
      }
    }

    return { used: 0, total: 0, percentage: 0 }
  }

  /**
   * Check if performance is acceptable
   */
  isPerformanceAcceptable(): boolean {
    const metrics = this.getMetrics()
    return metrics.average >= 45 && metrics.droppedFrames < 10
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.frames = []
    this.renderTimes = []
    this.computeTimes = []
    this.frameCount = 0
    this.droppedFrames = 0
    this.lastFrameTime = performance.now()
  }
}

// Singleton instance
let fpsMonitorInstance: FPSMonitor | null = null

export function getFPSMonitor(): FPSMonitor {
  if (!fpsMonitorInstance) {
    fpsMonitorInstance = new FPSMonitor()
  }
  return fpsMonitorInstance
}
