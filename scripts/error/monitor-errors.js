#!/usr/bin/env node

/**
 * Error Monitoring Script for Beauty with AI Precision
 * Monitors and reports on system errors and performance
 */

const { execAsync } = require('util').promisify(require('child_process').exec)
const fs = require('fs')
const path = require('path')

class ErrorMonitor {
  constructor() {
    this.metrics = {
      startTime: Date.now(),
      totalErrors: 0,
      errorsByType: {},
      errorsBySeverity: {},
      recentErrors: [],
      performanceMetrics: {
        responseTime: [],
        errorRate: [],
        throughput: []
      }
    }
    this.config = {
      checkInterval: 30000, // 30 seconds
      alertThresholds: {
        errorRate: 0.05, // 5% error rate
        responseTime: 2000, // 2 seconds
        consecutiveErrors: 10
      },
      notifications: {
        email: false,
        slack: false,
        console: true
      }
    }
  }

  async startMonitoring() {
    console.log('🔍 Starting Error Monitoring...')
    
    // Start monitoring interval
    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics()
    }, this.config.checkInterval)

    // Graceful shutdown
    process.on('SIGINT', () => this.shutdown())
    process.on('SIGTERM', () => this.shutdown())

    console.log('✅ Error monitoring started. Press Ctrl+C to stop.')
  }

  async collectMetrics() {
    try {
      const timestamp = Date.now()
      
      // Collect error metrics
      const errorMetrics = await this.getErrorMetrics()
      
      // Collect performance metrics
      const performanceMetrics = await this.getPerformanceMetrics()
      
      // Update metrics
      this.updateMetrics(errorMetrics, performanceMetrics)
      
      // Check for alerts
      this.checkAlerts()
      
      // Log summary
      this.logSummary()

    } catch (error) {
      console.error('❌ Metrics collection error:', error)
    }
  }

  async getErrorMetrics() {
    try {
      // This would query your error logging system
      // For now, return mock data
      return {
        totalErrors: Math.floor(Math.random() * 10),
        errorsByType: {
          'VALIDATION': Math.floor(Math.random() * 5),
          'EXTERNAL_API': Math.floor(Math.random() * 3),
          'DATABASE': Math.floor(Math.random() * 2),
          'AI_SERVICE': Math.floor(Math.random() * 4)
        },
        errorsBySeverity: {
          'LOW': Math.floor(Math.random() * 6),
          'MEDIUM': Math.floor(Math.random() * 3),
          'HIGH': Math.floor(Math.random() * 1),
          'CRITICAL': 0
        },
        recentErrors: [
          {
            message: 'Sample error',
            type: 'VALIDATION',
            severity: 'LOW',
            timestamp: Date.now()
          }
        ]
      }
    } catch (error) {
      return { error: error.message }
    }
  }

  async getPerformanceMetrics() {
    try {
      // This would query your performance monitoring system
      return {
        averageResponseTime: 150 + Math.random() * 200,
        errorRate: Math.random() * 0.1,
        throughput: 100 + Math.random() * 50,
        activeConnections: 5 + Math.floor(Math.random() * 10)
      }
    } catch (error) {
      return { error: error.message }
    }
  }

  updateMetrics(errorMetrics: any, performanceMetrics: any) {
    // Update error metrics
    this.metrics.totalErrors += errorMetrics.totalErrors || 0
    
    if (errorMetrics.errorsByType) {
      Object.entries(errorMetrics.errorsByType).forEach(([type, count]) => {
        this.metrics.errorsByType[type] = (this.metrics.errorsByType[type] || 0) + (count as number)
      })
    }
    
    if (errorMetrics.errorsBySeverity) {
      Object.entries(errorMetrics.errorsBySeverity).forEach(([severity, count]) => {
        this.metrics.errorsBySeverity[severity] = (this.metrics.errorsBySeverity[severity] || 0) + (count as number)
      })
    }
    
    if (errorMetrics.recentErrors) {
      this.metrics.recentErrors.push(...errorMetrics.recentErrors)
      
      // Keep only last 100 errors
      if (this.metrics.recentErrors.length > 100) {
        this.metrics.recentErrors = this.metrics.recentErrors.slice(-100)
      }
    }
    
    // Update performance metrics
    if (performanceMetrics.averageResponseTime) {
      this.metrics.performanceMetrics.responseTime.push(performanceMetrics.averageResponseTime)
      
      if (this.metrics.performanceMetrics.responseTime.length > 100) {
        this.metrics.performanceMetrics.responseTime.shift()
      }
    }
    
    if (performanceMetrics.errorRate !== undefined) {
      this.metrics.performanceMetrics.errorRate.push(performanceMetrics.errorRate)
      
      if (this.metrics.performanceMetrics.errorRate.length > 100) {
        this.metrics.performanceMetrics.errorRate.shift()
      }
    }
    
    if (performanceMetrics.throughput) {
      this.metrics.performanceMetrics.throughput.push(performanceMetrics.throughput)
      
      if (this.metrics.performanceMetrics.throughput.length > 100) {
        this.metrics.performanceMetrics.throughput.shift()
      }
    }
  }

  checkAlerts() {
    const alerts = []
    
    // Check error rate
    const recentErrorRate = this.getRecentErrorRate()
    if (recentErrorRate > this.config.alertThresholds.errorRate) {
      alerts.push({
        type: 'error_rate',
        level: 'warning',
        message: `High error rate: ${(recentErrorRate * 100).toFixed(2)}%`
      })
    }
    
    // Check response time
    const avgResponseTime = this.getAverageResponseTime()
    if (avgResponseTime > this.config.alertThresholds.responseTime) {
      alerts.push({
        type: 'response_time',
        level: 'warning',
        message: `High response time: ${avgResponseTime.toFixed(0)}ms`
      })
    }
    
    // Check consecutive errors
    const recentErrors = this.getRecentErrorCount()
    if (recentErrors > this.config.alertThresholds.consecutiveErrors) {
      alerts.push({
        type: 'consecutive_errors',
        level: 'critical',
        message: `High number of recent errors: ${recentErrors}`
      })
    }
    
    // Send alerts
    alerts.forEach(alert => {
      this.sendAlert(alert)
    })
  }

  sendAlert(alert: any) {
    const emoji = alert.level === 'critical' ? '🚨' : '⚠️'
    console.log(`${emoji} [${alert.type.toUpperCase()}] ${alert.message}`)
    
    // Here you would add integration with notification services
    // - Send to Slack
    // - Send email
    // - Send to monitoring system
  }

  logSummary() {
    const time = new Date().toLocaleTimeString()
    
    console.log(`\n📊 [${time}] Error Monitoring Summary:`)
    console.log(`  🚨 Total Errors: ${this.metrics.totalErrors}`)
    console.log(`  📈 Error Rate: ${(this.getRecentErrorRate() * 100).toFixed(2)}%`)
    console.log(`  ⚡ Avg Response Time: ${this.getAverageResponseTime().toFixed(0)}ms`)
    console.log(`  🔄 Throughput: ${this.getAverageThroughput().toFixed(0)} req/s`)
    
    if (this.metrics.recentErrors.length > 0) {
      console.log(`  📋 Recent Errors: ${this.metrics.recentErrors.slice(-5).map(e => e.message).join(', ')}`)
    }
  }

  getRecentErrorRate(): number {
    const recentRates = this.metrics.performanceMetrics.errorRate.slice(-10)
    return recentRates.length > 0 ? recentRates.reduce((a, b) => a + b, 0) / recentRates.length : 0
  }

  getAverageResponseTime(): number {
    const responseTimes = this.metrics.performanceMetrics.responseTime.slice(-10)
    return responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0
  }

  getAverageThroughput(): number {
    const throughput = this.metrics.performanceMetrics.throughput.slice(-10)
    return throughput.length > 0 ? throughput.reduce((a, b) => a + b, 0) / throughput.length : 0
  }

  getRecentErrorCount(): number {
    const fiveMinutesAgo = Date.now() - 300000 // 5 minutes
    return this.metrics.recentErrors.filter(e => e.timestamp > fiveMinutesAgo).length
  }

  async shutdown() {
    console.log('\n🔄 Shutting down error monitor...')
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
    }

    // Save final report
    await this.saveReport()
    
    console.log('✅ Error monitoring stopped. Report saved.')
    process.exit(0)
  }

  async saveReport() {
    const report = {
      summary: {
        monitoringDuration: Date.now() - this.metrics.startTime,
        totalErrors: this.metrics.totalErrors,
        averageErrorRate: this.getRecentErrorRate(),
        averageResponseTime: this.getAverageResponseTime()
      },
      metrics: this.metrics,
      generatedAt: new Date().toISOString()
    }

    const reportPath = path.join(process.cwd(), 'logs', 'error-monitoring-report.json')
    
    // Ensure logs directory exists
    const logsDir = path.dirname(reportPath)
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true })
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`📄 Report saved to: ${reportPath}`)
  }
}

// Start monitoring if run directly
if (require.main === module) {
  const monitor = new ErrorMonitor()
  monitor.startMonitoring()
}

module.exports = ErrorMonitor
