#!/usr/bin/env node

/**
 * AI Performance Monitoring Script
 * Monitors and reports on AI system performance
 */

const { execAsync } = require('util').promisify(require('child_process').exec)
const fs = require('fs')
const path = require('path')

class AIPerformanceMonitor {
  constructor() {
    this.metrics = {
      startTime: Date.now(),
      measurements: [],
      alerts: []
    }
  }

  async startMonitoring() {
    console.log('🔍 Starting AI Performance Monitoring...')
    
    // Start monitoring interval
    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics()
    }, 30000) // Every 30 seconds

    // Graceful shutdown
    process.on('SIGINT', () => this.shutdown())
    process.on('SIGTERM', () => this.shutdown())

    console.log('✅ Monitoring started. Press Ctrl+C to stop.')
  }

  async collectMetrics() {
    try {
      const timestamp = Date.now()
      
      // Collect system metrics
      const systemMetrics = await this.getSystemMetrics()
      
      // Collect AI service metrics
      const aiMetrics = await this.getAIMetrics()
      
      // Collect queue metrics
      const queueMetrics = await this.getQueueMetrics()
      
      const measurement = {
        timestamp,
        system: systemMetrics,
        ai: aiMetrics,
        queue: queueMetrics
      }

      this.metrics.measurements.push(measurement)
      
      // Keep only last 100 measurements
      if (this.metrics.measurements.length > 100) {
        this.metrics.measurements.shift()
      }

      // Check for alerts
      this.checkAlerts(measurement)
      
      // Log summary
      this.logSummary(measurement)

    } catch (error) {
      console.error('❌ Metrics collection error:', error)
    }
  }

  async getSystemMetrics() {
    try {
      // Get memory usage
      const memoryUsage = process.memoryUsage()
      
      // Get CPU usage (platform specific)
      let cpuUsage = 0
      if (process.platform === 'linux') {
        const { stdout } = await execAsync("top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1")
        cpuUsage = parseFloat(stdout.trim())
      }

      return {
        memory: {
          used: memoryUsage.heapUsed / 1024 / 1024, // MB
          total: memoryUsage.heapTotal / 1024 / 1024, // MB
          external: memoryUsage.external / 1024 / 1024 // MB
        },
        cpu: {
          usage: cpuUsage
        },
        uptime: process.uptime()
      }
    } catch (error) {
      return { error: error.message }
    }
  }

  async getAIMetrics() {
    try {
      // Call AI performance API
      const response = await fetch('http://localhost:3000/api/ai/optimized')
      const data = await response.json()
      
      return data.performance || {}
    } catch (error) {
      return { error: 'AI service unavailable' }
    }
  }

  async getQueueMetrics() {
    try {
      // This would integrate with your queue system
      return {
        totalJobs: 0,
        activeJobs: 0,
        waitingJobs: 0,
        failedJobs: 0
      }
    } catch (error) {
      return { error: error.message }
    }
  }

  checkAlerts(measurement) {
    const alerts = []

    // Memory alerts
    if (measurement.system.memory.used > 1024) { // 1GB
      alerts.push({
        type: 'memory',
        level: 'warning',
        message: `High memory usage: ${measurement.system.memory.used.toFixed(1)}MB`
      })
    }

    // CPU alerts
    if (measurement.system.cpu.usage > 80) {
      alerts.push({
        type: 'cpu',
        level: 'warning',
        message: `High CPU usage: ${measurement.system.cpu.usage.toFixed(1)}%`
      })
    }

    // Cache hit rate alerts
    if (measurement.ai.cache && measurement.ai.cache.hitRate < 0.7) {
      alerts.push({
        type: 'cache',
        level: 'warning',
        message: `Low cache hit rate: ${(measurement.ai.cache.hitRate * 100).toFixed(1)}%`
      })
    }

    // Queue alerts
    if (measurement.queue && measurement.queue.waitingJobs > 100) {
      alerts.push({
        type: 'queue',
        level: 'critical',
        message: `High queue backlog: ${measurement.queue.waitingJobs} jobs`
      })
    }

    // Store alerts
    this.metrics.alerts.push(...alerts)
    
    // Keep only last 50 alerts
    if (this.metrics.alerts.length > 50) {
      this.metrics.alerts = this.metrics.alerts.slice(-50)
    }

    // Print alerts
    alerts.forEach(alert => {
      const emoji = alert.level === 'critical' ? '🚨' : '⚠️'
      console.log(`${emoji} [${alert.type.toUpperCase()}] ${alert.message}`)
    })
  }

  logSummary(measurement) {
    const time = new Date(measurement.timestamp).toLocaleTimeString()
    
    console.log(`\n📊 [${time}] Performance Summary:`)
    
    if (measurement.system.memory) {
      console.log(`  💾 Memory: ${measurement.system.memory.used.toFixed(1)}MB / ${measurement.system.memory.total.toFixed(1)}MB`)
    }
    
    if (measurement.system.cpu.usage > 0) {
      console.log(`  🖥️  CPU: ${measurement.system.cpu.usage.toFixed(1)}%`)
    }
    
    if (measurement.ai.cache) {
      console.log(`  🎯 Cache Hit Rate: ${(measurement.ai.cache.hitRate * 100).toFixed(1)}%`)
    }
    
    if (measurement.queue) {
      console.log(`  ⏳ Queue: ${measurement.queue.activeJobs} active, ${measurement.queue.waitingJobs} waiting`)
    }
  }

  async shutdown() {
    console.log('\n🔄 Shutting down performance monitor...')
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
    }

    // Save final report
    await this.saveReport()
    
    console.log('✅ Monitoring stopped. Report saved.')
    process.exit(0)
  }

  async saveReport() {
    const report = {
      summary: {
        monitoringDuration: Date.now() - this.metrics.startTime,
        totalMeasurements: this.metrics.measurements.length,
        totalAlerts: this.metrics.alerts.length
      },
      metrics: this.metrics,
      generatedAt: new Date().toISOString()
    }

    const reportPath = path.join(process.cwd(), 'logs', 'ai-performance-report.json')
    
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
  const monitor = new AIPerformanceMonitor()
  monitor.startMonitoring()
}

module.exports = AIPerformanceMonitor
