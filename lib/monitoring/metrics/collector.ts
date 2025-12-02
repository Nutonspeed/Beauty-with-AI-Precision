// Performance Metrics Collector
import { performance } from 'perf_hooks'

export interface PerformanceMetrics {
  timestamp: number
  requestId: string
  endpoint: string
  method: string
  responseTime: number
  memoryUsage: NodeJS.MemoryUsage
  cpuUsage: NodeJS.CpuUsage
  statusCode: number
  userAgent?: string
  userId?: string
  clinicId?: string
}

export interface SystemMetrics {
  timestamp: number
  memory: {
    used: number
    free: number
    total: number
    percentage: number
  }
  cpu: {
    usage: number
    loadAverage: number[]
  }
  disk: {
    used: number
    free: number
    total: number
    percentage: number
  }
  network: {
    bytesIn: number
    bytesOut: number
    connections: number
  }
  database: {
    connections: number
    queryTime: number
    cacheHitRate: number
  }
}

class MetricsCollector {
  private metrics: PerformanceMetrics[] = []
  private systemMetrics: SystemMetrics[] = []
  private maxMetrics = 10000
  private collectionInterval: NodeJS.Timeout | null = null

  constructor() {
    this.startSystemMetricsCollection()
  }

  // Start collecting system metrics
  startSystemMetricsCollection() {
    this.collectionInterval = setInterval(() => {
      this.collectSystemMetrics()
    }, 30000) // Collect every 30 seconds
  }

  // Stop collecting system metrics
  stopSystemMetricsCollection() {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval)
      this.collectionInterval = null
    }
  }

  // Record API performance metrics
  recordRequestMetrics(metrics: Omit<PerformanceMetrics, 'timestamp'>) {
    const fullMetrics: PerformanceMetrics = {
      ...metrics,
      timestamp: Date.now()
    }

    this.metrics.push(fullMetrics)

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }

    // Check for performance alerts
    this.checkPerformanceAlerts(fullMetrics)
  }

  // Collect system metrics
  private collectSystemMetrics() {
    const memUsage = process.memoryUsage()
    const cpuUsage = process.cpuUsage()

    const systemMetrics: SystemMetrics = {
      timestamp: Date.now(),
      memory: {
        used: memUsage.heapUsed,
        free: memUsage.heapTotal - memUsage.heapUsed,
        total: memUsage.heapTotal,
        percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100
      },
      cpu: {
        usage: (cpuUsage.user + cpuUsage.system) / 1000000, // Convert to milliseconds
        loadAverage: require('os').loadavg()
      },
      disk: {
        used: 0, // Would need fs.statSync for actual disk usage
        free: 0,
        total: 0,
        percentage: 0
      },
      network: {
        bytesIn: 0, // Would need network interface stats
        bytesOut: 0,
        connections: 0
      },
      database: {
        connections: 0, // Would need database connection pool stats
        queryTime: 0,
        cacheHitRate: 0
      }
    }

    this.systemMetrics.push(systemMetrics)

    // Keep only recent system metrics
    if (this.systemMetrics.length > 2880) { // 24 hours of 30-second intervals
      this.systemMetrics = this.systemMetrics.slice(-2880)
    }

    // Check for system alerts
    this.checkSystemAlerts(systemMetrics)
  }

  // Check performance alerts
  private checkPerformanceAlerts(metrics: PerformanceMetrics) {
    // Slow response time alert
    if (metrics.responseTime > 5000) {
      this.triggerAlert({
        type: 'SLOW_RESPONSE',
        severity: 'WARNING',
        message: `Slow response detected: ${metrics.responseTime}ms for ${metrics.endpoint}`,
        metadata: {
          endpoint: metrics.endpoint,
          responseTime: metrics.responseTime,
          requestId: metrics.requestId
        }
      })
    }

    // Critical slow response alert
    if (metrics.responseTime > 10000) {
      this.triggerAlert({
        type: 'CRITICAL_SLOW_RESPONSE',
        severity: 'CRITICAL',
        message: `Critical slow response: ${metrics.responseTime}ms for ${metrics.endpoint}`,
        metadata: {
          endpoint: metrics.endpoint,
          responseTime: metrics.responseTime,
          requestId: metrics.requestId
        }
      })
    }

    // High memory usage alert
    if (metrics.memoryUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
      this.triggerAlert({
        type: 'HIGH_MEMORY_USAGE',
        severity: 'WARNING',
        message: `High memory usage: ${Math.round(metrics.memoryUsage.heapUsed / 1024 / 1024)}MB`,
        metadata: {
          memoryUsage: metrics.memoryUsage.heapUsed,
          requestId: metrics.requestId
        }
      })
    }
  }

  // Check system alerts
  private checkSystemAlerts(metrics: SystemMetrics) {
    // High memory usage
    if (metrics.memory.percentage > 80) {
      this.triggerAlert({
        type: 'SYSTEM_HIGH_MEMORY',
        severity: 'WARNING',
        message: `System memory usage high: ${metrics.memory.percentage.toFixed(1)}%`,
        metadata: {
          memoryPercentage: metrics.memory.percentage,
          memoryUsed: metrics.memory.used
        }
      })
    }

    // Critical memory usage
    if (metrics.memory.percentage > 90) {
      this.triggerAlert({
        type: 'SYSTEM_CRITICAL_MEMORY',
        severity: 'CRITICAL',
        message: `Critical memory usage: ${metrics.memory.percentage.toFixed(1)}%`,
        metadata: {
          memoryPercentage: metrics.memory.percentage,
          memoryUsed: metrics.memory.used
        }
      })
    }

    // High CPU usage
    if (metrics.cpu.usage > 80) {
      this.triggerAlert({
        type: 'HIGH_CPU_USAGE',
        severity: 'WARNING',
        message: `High CPU usage: ${metrics.cpu.usage.toFixed(1)}%`,
        metadata: {
          cpuUsage: metrics.cpu.usage,
          loadAverage: metrics.cpu.loadAverage
        }
      })
    }
  }

  // Trigger alert
  private triggerAlert(alert: {
    type: string
    severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
    message: string
    metadata: Record<string, any>
  }) {
    // Log alert
    console.log(`[${alert.severity}] PERFORMANCE ALERT: ${alert.message}`)

    // Send to alert system
    // This would integrate with your alert notification system
    this.sendAlert(alert)
  }

  // Send alert to notification system
  private async sendAlert(alert: {
    type: string
    severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
    message: string
    metadata: Record<string, any>
  }) {
    try {
      // Send to monitoring service
      await fetch('/api/monitoring/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...alert,
          timestamp: Date.now(),
          service: 'beauty-ai-precision'
        })
      })
    } catch (error) {
      console.error('Failed to send alert:', error)
    }
  }

  // Get performance metrics
  getPerformanceMetrics(timeRange?: { start: number; end: number }) {
    let metrics = this.metrics

    if (timeRange) {
      metrics = metrics.filter(m => 
        m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      )
    }

    return metrics
  }

  // Get system metrics
  getSystemMetrics(timeRange?: { start: number; end: number }) {
    let metrics = this.systemMetrics

    if (timeRange) {
      metrics = metrics.filter(m => 
        m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      )
    }

    return metrics
  }

  // Get performance summary
  getPerformanceSummary(timeRange?: { start: number; end: number }) {
    const metrics = this.getPerformanceMetrics(timeRange)
    
    if (metrics.length === 0) {
      return null
    }

    const responseTimes = metrics.map(m => m.responseTime)
    const statusCodes = metrics.reduce((acc, m) => {
      acc[m.statusCode] = (acc[m.statusCode] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    return {
      totalRequests: metrics.length,
      averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      minResponseTime: Math.min(...responseTimes),
      maxResponseTime: Math.max(...responseTimes),
      p95ResponseTime: this.calculatePercentile(responseTimes, 95),
      p99ResponseTime: this.calculatePercentile(responseTimes, 99),
      errorRate: (metrics.filter(m => m.statusCode >= 400).length / metrics.length) * 100,
      statusCodes,
      timeRange
    }
  }

  // Calculate percentile
  private calculatePercentile(values: number[], percentile: number) {
    const sorted = values.sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    return sorted[index]
  }

  // Get system summary
  getSystemSummary() {
    const metrics = this.systemMetrics
    
    if (metrics.length === 0) {
      return null
    }

    const latest = metrics[metrics.length - 1]
    const memoryUsage = metrics.map(m => m.memory.percentage)
    const cpuUsage = metrics.map(m => m.cpu.usage)

    return {
      current: latest,
      averages: {
        memory: memoryUsage.reduce((a, b) => a + b, 0) / memoryUsage.length,
        cpu: cpuUsage.reduce((a, b) => a + b, 0) / cpuUsage.length
      },
      peaks: {
        memory: Math.max(...memoryUsage),
        cpu: Math.max(...cpuUsage)
      }
    }
  }

  // Cleanup old metrics
  cleanup() {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000) // 24 hours ago
    
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff)
    this.systemMetrics = this.systemMetrics.filter(m => m.timestamp > cutoff)
  }
}

// Global metrics collector instance
export const metricsCollector = new MetricsCollector()

// Performance monitoring middleware
export function performanceMonitor() {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const startTime = performance.now()
      const startMemory = process.memoryUsage()
      const startCpu = process.cpuUsage()
      const requestId = Math.random().toString(36).substr(2, 9)

      try {
        const result = await method.apply(this, args)
        const endTime = performance.now()
        const endMemory = process.memoryUsage()
        const endCpu = process.cpuUsage(startCpu)

        metricsCollector.recordRequestMetrics({
          requestId,
          endpoint: propertyName,
          method: 'FUNCTION',
          responseTime: endTime - startTime,
          memoryUsage: endMemory,
          cpuUsage: endCpu,
          statusCode: 200
        })

        return result
      } catch (error) {
        const endTime = performance.now()
        const endMemory = process.memoryUsage()
        const endCpu = process.cpuUsage(startCpu)

        metricsCollector.recordRequestMetrics({
          requestId,
          endpoint: propertyName,
          method: 'FUNCTION',
          responseTime: endTime - startTime,
          memoryUsage: endMemory,
          cpuUsage: endCpu,
          statusCode: 500
        })

        throw error
      }
    }

    return descriptor
  }
}

export default MetricsCollector
