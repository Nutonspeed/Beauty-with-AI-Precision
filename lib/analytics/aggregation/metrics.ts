// Real-time Metrics Aggregation System
import { createClient } from '@/lib/supabase/server'
import { analyticsLogger } from './logger'

// Metric types
export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  TIMER = 'timer'
}

// Metric categories
export enum MetricCategory {
  BUSINESS = 'business',
  PERFORMANCE = 'performance',
  USER = 'user',
  SYSTEM = 'system',
  AI = 'ai',
  DATABASE = 'database'
}

// Metric interface
export interface Metric {
  name: string
  type: MetricType
  category: MetricCategory
  value: number
  labels?: Record<string, string>
  timestamp: number
  clinicId?: string
  userId?: string
}

// Aggregated metric interface
export interface AggregatedMetric {
  name: string
  type: MetricType
  category: MetricCategory
  value: number
  count: number
  min: number
  max: number
  avg: number
  labels?: Record<string, string>
  timeWindow: string
  timestamp: number
}

export class MetricsAggregator {
  private static instance: MetricsAggregator
  private metrics: Map<string, Metric[]> = new Map()
  private aggregationIntervals: Map<string, NodeJS.Timeout> = new Map()
  private subscribers: Map<string, Array<(metric: AggregatedMetric) => void>> = new Map()

  constructor() {
    this.startAggregation()
  }

  static getInstance(): MetricsAggregator {
    if (!MetricsAggregator.instance) {
      MetricsAggregator.instance = new MetricsAggregator()
    }
    return MetricsAggregator.instance
  }

  // Record a metric
  recordMetric(metric: Metric): void {
    const key = this.getMetricKey(metric)
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, [])
    }
    
    const metricList = this.metrics.get(key)!
    metricList.push(metric)
    
    // Keep only last 1000 metrics per key to prevent memory issues
    if (metricList.length > 1000) {
      metricList.shift()
    }
    
    // Notify subscribers
    this.notifySubscribers(key, metric)
  }

  // Increment counter metric
  incrementCounter(
    name: string, 
    value: number = 1, 
    labels?: Record<string, string>,
    clinicId?: string,
    userId?: string
  ): void {
    this.recordMetric({
      name,
      type: MetricType.COUNTER,
      category: MetricCategory.SYSTEM,
      value,
      labels,
      timestamp: Date.now(),
      clinicId,
      userId
    })
  }

  // Set gauge metric
  setGauge(
    name: string,
    value: number,
    labels?: Record<string, string>,
    clinicId?: string,
    userId?: string
  ): void {
    this.recordMetric({
      name,
      type: MetricType.GAUGE,
      category: MetricCategory.SYSTEM,
      value,
      labels,
      timestamp: Date.now(),
      clinicId,
      userId
    })
  }

  // Record timer metric
  recordTimer(
    name: string,
    duration: number,
    labels?: Record<string, string>,
    clinicId?: string,
    userId?: string
  ): void {
    this.recordMetric({
      name,
      type: MetricType.TIMER,
      category: MetricCategory.PERFORMANCE,
      value: duration,
      labels,
      timestamp: Date.now(),
      clinicId,
      userId
    })
  }

  // Record histogram metric
  recordHistogram(
    name: string,
    value: number,
    labels?: Record<string, string>,
    clinicId?: string,
    userId?: string
  ): void {
    this.recordMetric({
      name,
      type: MetricType.HISTOGRAM,
      category: MetricCategory.SYSTEM,
      value,
      labels,
      timestamp: Date.now(),
      clinicId,
      userId
    })
  }

  // Get aggregated metrics
  getAggregatedMetrics(
    name: string,
    timeWindow: string = '5m',
    clinicId?: string
  ): AggregatedMetric | null {
    const key = this.getMetricKey({ name, clinicId } as any)
    const metrics = this.metrics.get(key) || []
    
    const cutoffTime = this.getCutoffTime(timeWindow)
    const recentMetrics = metrics.filter(m => m.timestamp >= cutoffTime)
    
    if (recentMetrics.length === 0) {
      return null
    }
    
    const values = recentMetrics.map(m => m.value)
    const firstMetric = recentMetrics[0]
    
    return {
      name: firstMetric.name,
      type: firstMetric.type,
      category: firstMetric.category,
      value: this.aggregateValue(firstMetric.type, values),
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      labels: firstMetric.labels,
      timeWindow,
      timestamp: Date.now()
    }
  }

  // Get multiple metrics
  getMultipleMetrics(
    names: string[],
    timeWindow?: string,
    clinicId?: string
  ): Map<string, AggregatedMetric> {
    const results = new Map<string, AggregatedMetric>()
    
    names.forEach(name => {
      const metric = this.getAggregatedMetrics(name, timeWindow, clinicId)
      if (metric) {
        results.set(name, metric)
      }
    })
    
    return results
  }

  // Subscribe to metric updates
  subscribe(name: string, callback: (metric: AggregatedMetric) => void): void {
    if (!this.subscribers.has(name)) {
      this.subscribers.set(name, [])
    }
    
    this.subscribers.get(name)!.push(callback)
  }

  // Unsubscribe from metric updates
  unsubscribe(name: string, callback: (metric: AggregatedMetric) => void): void {
    const subscribers = this.subscribers.get(name)
    if (subscribers) {
      const index = subscribers.indexOf(callback)
      if (index > -1) {
        subscribers.splice(index, 1)
      }
    }
  }

  // Start aggregation process
  private startAggregation(): void {
    // Aggregate metrics every minute
    this.aggregationIntervals.set('1m', setInterval(() => {
      this.performAggregation('1m')
    }, 60000))
    
    // Aggregate metrics every 5 minutes
    this.aggregationIntervals.set('5m', setInterval(() => {
      this.performAggregation('5m')
    }, 300000))
    
    // Aggregate metrics every hour
    this.aggregationIntervals.set('1h', setInterval(() => {
      this.performAggregation('1h')
    }, 3600000))
  }

  // Perform aggregation for time window
  private performAggregation(timeWindow: string): void {
    const cutoffTime = this.getCutoffTime(timeWindow)
    
    this.metrics.forEach((metrics, key) => {
      const recentMetrics = metrics.filter(m => m.timestamp >= cutoffTime)
      
      if (recentMetrics.length > 0) {
        const firstMetric = recentMetrics[0]
        const values = recentMetrics.map(m => m.value)
        
        const aggregatedMetric: AggregatedMetric = {
          name: firstMetric.name,
          type: firstMetric.type,
          category: firstMetric.category,
          value: this.aggregateValue(firstMetric.type, values),
          count: values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          avg: values.reduce((sum, val) => sum + val, 0) / values.length,
          labels: firstMetric.labels,
          timeWindow,
          timestamp: Date.now()
        }
        
        // Store aggregated metric
        this.storeAggregatedMetric(aggregatedMetric)
        
        // Notify subscribers
        this.notifyAggregatedSubscribers(firstMetric.name, aggregatedMetric)
      }
    })
  }

  // Aggregate value based on metric type
  private aggregateValue(type: MetricType, values: number[]): number {
    switch (type) {
      case MetricType.COUNTER:
        return values.reduce((sum, val) => sum + val, 0)
      case MetricType.GAUGE:
        return values[values.length - 1] // Latest value
      case MetricType.HISTOGRAM:
      case MetricType.TIMER:
        return values.reduce((sum, val) => sum + val, 0) / values.length // Average
      default:
        return values.reduce((sum, val) => sum + val, 0)
    }
  }

  // Get metric key
  private getMetricKey(metric: Partial<Metric>): string {
    const parts = [metric.name]
    
    if (metric.clinicId) {
      parts.push(`clinic:${metric.clinicId}`)
    }
    
    if (metric.userId) {
      parts.push(`user:${metric.userId}`)
    }
    
    if (metric.labels) {
      const labelStr = Object.entries(metric.labels)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join(',')
      parts.push(labelStr)
    }
    
    return parts.join(':')
  }

  // Get cutoff time for time window
  private getCutoffTime(timeWindow: string): number {
    const now = Date.now()
    
    switch (timeWindow) {
      case '1m':
        return now - 60000
      case '5m':
        return now - 300000
      case '15m':
        return now - 900000
      case '30m':
        return now - 1800000
      case '1h':
        return now - 3600000
      case '6h':
        return now - 21600000
      case '24h':
        return now - 86400000
      default:
        return now - 300000 // Default to 5 minutes
    }
  }

  // Notify subscribers of new metric
  private notifySubscribers(key: string, metric: Metric): void {
    const subscribers = this.subscribers.get(metric.name)
    if (subscribers) {
      // For now, we'll notify on the next aggregation cycle
      // Real-time notification would require immediate aggregation
    }
  }

  // Notify subscribers of aggregated metric
  private notifyAggregatedSubscribers(name: string, metric: AggregatedMetric): void {
    const subscribers = this.subscribers.get(name)
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(metric)
        } catch (error) {
          analyticsLogger.log({
            operation: 'metric_subscription_callback_error',
            error: error instanceof Error ? error.message : String(error)
          })
        }
      })
    }
  }

  // Store aggregated metric in database
  private async storeAggregatedMetric(metric: AggregatedMetric): Promise<void> {
    try {
      const supabase = await createClient()
      
      const { error } = await supabase
        .from('analytics_metrics')
        .insert({
          name: metric.name,
          type: metric.type,
          category: metric.category,
          value: metric.value,
          count: metric.count,
          min_value: metric.min,
          max_value: metric.max,
          avg_value: metric.avg,
          labels: metric.labels,
          time_window: metric.timeWindow,
          created_at: new Date(metric.timestamp).toISOString()
        })
      
      if (error) {
        throw error
      }
    } catch (error) {
      analyticsLogger.log({
        operation: 'store_aggregated_metric_error',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  // Cleanup old metrics
  cleanup(): void {
    const cutoffTime = this.getCutoffTime('24h')
    
    this.metrics.forEach((metrics, key) => {
      const filteredMetrics = metrics.filter(m => m.timestamp >= cutoffTime)
      this.metrics.set(key, filteredMetrics)
    })
  }

  // Get system overview
  getSystemOverview(): any {
    const totalMetrics = Array.from(this.metrics.values()).reduce((sum, metrics) => sum + metrics.length, 0)
    const activeSubscriptions = Array.from(this.subscribers.values()).reduce((sum, subs) => sum + subs.length, 0)
    
    return {
      totalMetrics,
      activeSubscriptions,
      metricKeys: this.metrics.size,
      timestamp: Date.now()
    }
  }

  // Shutdown
  shutdown(): void {
    this.aggregationIntervals.forEach(interval => clearInterval(interval))
    this.aggregationIntervals.clear()
    this.metrics.clear()
    this.subscribers.clear()
  }
}

// Business metrics helpers
export class BusinessMetrics {
  private static aggregator = MetricsAggregator.getInstance()

  // Track user registration
  static trackUserRegistration(clinicId: string): void {
    this.aggregator.incrementCounter('user_registrations', 1, { event: 'registration' }, clinicId)
  }

  // Track skin analysis
  static trackSkinAnalysis(clinicId: string, userId: string, confidence: number): void {
    this.aggregator.incrementCounter('skin_analyses', 1, { event: 'analysis' }, clinicId, userId)
    this.aggregator.recordHistogram('analysis_confidence', confidence, undefined, clinicId, userId)
  }

  // Track treatment booking
  static trackTreatmentBooking(clinicId: string, userId: string, treatmentType: string): void {
    this.aggregator.incrementCounter('treatment_bookings', 1, { treatment_type: treatmentType }, clinicId, userId)
  }

  // Track revenue
  static trackRevenue(clinicId: string, amount: number, currency: string = 'THB'): void {
    this.aggregator.incrementCounter('revenue', amount, { currency }, clinicId)
  }

  // Track lead conversion
  static trackLeadConversion(clinicId: string, userId: string): void {
    this.aggregator.incrementCounter('lead_conversions', 1, { event: 'conversion' }, clinicId, userId)
  }

  // Track API usage
  static trackAPIUsage(endpoint: string, method: string, statusCode: number, responseTime: number): void {
    this.aggregator.incrementCounter('api_requests', 1, { endpoint, method, status: statusCode.toString() })
    this.aggregator.recordTimer('api_response_time', responseTime, { endpoint, method })
  }

  // Track AI service usage
  static trackAIServiceUsage(service: string, model: string, tokens: number, responseTime: number): void {
    this.aggregator.incrementCounter('ai_requests', 1, { service, model })
    this.aggregator.recordHistogram('ai_tokens_used', tokens, { service, model })
    this.aggregator.recordTimer('ai_response_time', responseTime, { service, model })
  }
}

// Performance metrics helpers
export class PerformanceMetrics {
  private static aggregator = MetricsAggregator.getInstance()

  // Track database query performance
  static trackDatabaseQuery(query: string, duration: number, success: boolean): void {
    this.aggregator.recordTimer('db_query_duration', duration, { query, success: success.toString() })
    if (!success) {
      this.aggregator.incrementCounter('db_query_errors', 1, { query })
    }
  }

  // Track cache performance
  static trackCacheHit(key: string, hit: boolean): void {
    this.aggregator.incrementCounter('cache_requests', 1, { hit: hit.toString() })
  }

  // Track memory usage
  static trackMemoryUsage(): void {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage()
      this.aggregator.setGauge('memory_heap_used', usage.heapUsed, { type: 'heap' })
      this.aggregator.setGauge('memory_heap_total', usage.heapTotal, { type: 'heap' })
      this.aggregator.setGauge('memory_external', usage.external, { type: 'external' })
    }
  }

  // Track active connections
  static trackActiveConnections(type: string, count: number): void {
    this.aggregator.setGauge('active_connections', count, { type })
  }
}

// Export singleton instance
export const metricsAggregator = MetricsAggregator.getInstance()
