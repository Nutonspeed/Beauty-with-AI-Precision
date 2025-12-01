/**
 * Performance Monitoring Service
 * 
 * Tracks application performance metrics for production monitoring
 */

interface PerformanceMetrics {
  // Page performance
  pageLoad: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  
  // API performance
  apiResponseTime: number
  apiErrorRate: number
  
  // AI performance
  aiProcessingTime: number
  aiAccuracy: number
  
  // User metrics
  sessionDuration: number
  bounceRate: number
  
  // System metrics
  memoryUsage: number
  cpuUsage: number
}

interface MetricEvent {
  name: string
  value: number
  timestamp: Date
  metadata?: Record<string, any>
}

class PerformanceMonitor {
  private metrics: Map<string, MetricEvent[]> = new Map()
  private isEnabled: boolean = false

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'production' || 
                    process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true'
  }

  /**
   * Track a metric event
   */
  track(name: string, value: number, metadata?: Record<string, any>) {
    if (!this.isEnabled) return

    const event: MetricEvent = {
      name,
      value,
      timestamp: new Date(),
      metadata
    }

    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    this.metrics.get(name)!.push(event)
    
    // Keep only last 100 events per metric
    const events = this.metrics.get(name)!
    if (events.length > 100) {
      events.splice(0, events.length - 100)
    }

    // Send to monitoring service (in production)
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(event)
    }
  }

  /**
   * Track API response time
   */
  trackApiResponse(endpoint: string, responseTime: number, statusCode: number) {
    this.track('api_response_time', responseTime, {
      endpoint,
      status_code: statusCode,
      is_error: statusCode >= 400
    })

    if (statusCode >= 400) {
      this.track('api_error', 1, {
        endpoint,
        status_code: statusCode
      })
    }
  }

  /**
   * Track AI processing time
   */
  trackAIProcessing(model: string, processingTime: number, confidence?: number) {
    this.track('ai_processing_time', processingTime, {
      model,
      confidence
    })

    if (confidence) {
      this.track('ai_accuracy', confidence, {
        model
      })
    }
  }

  /**
   * Track page load performance
   */
  trackPageLoad(metrics: Partial<PerformanceMetrics>) {
    if (metrics.pageLoad) this.track('page_load_time', metrics.pageLoad)
    if (metrics.firstContentfulPaint) {
      this.track('first_contentful_paint', metrics.firstContentfulPaint)
    }
    if (metrics.largestContentfulPaint) {
      this.track('largest_contentful_paint', metrics.largestContentfulPaint)
    }
    if (metrics.cumulativeLayoutShift) {
      this.track('cumulative_layout_shift', metrics.cumulativeLayoutShift)
    }
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary(): Record<string, any> {
    const summary: Record<string, any> = {}

    for (const [name, events] of this.metrics.entries()) {
      if (events.length === 0) continue

      const values = events.map(e => e.value)
      summary[name] = {
        count: events.length,
        average: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        latest: events[events.length - 1].timestamp
      }
    }

    return summary
  }

  /**
   * Get performance score (0-100)
   */
  getPerformanceScore(): number {
    const summary = this.getMetricsSummary()
    
    let score = 100
    
    // Page load time (target < 2 seconds)
    if (summary.page_load_time?.average > 2000) {
      score -= Math.min(30, (summary.page_load_time.average - 2000) / 100)
    }
    
    // API response time (target < 500ms)
    if (summary.api_response_time?.average > 500) {
      score -= Math.min(20, (summary.api_response_time.average - 500) / 50)
    }
    
    // Error rate (target < 1%)
    const totalApiCalls = summary.api_response_time?.count || 1
    const errorCount = summary.api_error?.count || 0
    const errorRate = (errorCount / totalApiCalls) * 100
    if (errorRate > 1) {
      score -= Math.min(40, errorRate * 10)
    }
    
    return Math.max(0, Math.round(score))
  }

  /**
   * Send metrics to monitoring service
   */
  private async sendToMonitoringService(event: MetricEvent) {
    try {
      // Send to Vercel Analytics, Sentry, or custom monitoring
      if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        // Send to Sentry
        await fetch('/api/monitoring/metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event)
        })
      }
    } catch (error) {
      console.warn('Failed to send metrics:', error)
    }
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics.clear()
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

// React hook for performance tracking
export function usePerformanceMonitor() {
  return {
    track: performanceMonitor.track.bind(performanceMonitor),
    trackApiResponse: performanceMonitor.trackApiResponse.bind(performanceMonitor),
    trackAIProcessing: performanceMonitor.trackAIProcessing.bind(performanceMonitor),
    trackPageLoad: performanceMonitor.trackPageLoad.bind(performanceMonitor),
    getMetricsSummary: performanceMonitor.getMetricsSummary.bind(performanceMonitor),
    getPerformanceScore: performanceMonitor.getPerformanceScore.bind(performanceMonitor)
  }
}

// Helper function to measure function execution time
export function measurePerformance<T>(
  name: string,
  fn: () => Promise<T> | T,
  metadata?: Record<string, any>
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const startTime = performance.now()
    
    try {
      const result = await fn()
      const endTime = performance.now()
      const duration = endTime - startTime
      
      performanceMonitor.track(name, duration, metadata)
      resolve(result)
    } catch (error) {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      performanceMonitor.track(`${name}_error`, duration, {
        ...metadata,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      reject(error)
    }
  })
}
