#!/usr/bin/env node

// Performance Metrics Collection Script
const { performance } = require('perf_hooks')
const fs = require('fs')
const path = require('path')

class PerformanceCollector {
  constructor() {
    this.metrics = []
    this.isRunning = false
    this.interval = null
  }

  start() {
    if (this.isRunning) {
      console.log('Performance collector is already running')
      return
    }

    console.log('Starting performance metrics collection...')
    this.isRunning = true

    // Collect metrics every 30 seconds
    this.interval = setInterval(() => {
      this.collectMetrics()
    }, 30000)

    // Initial collection
    this.collectMetrics()
  }

  stop() {
    if (!this.isRunning) {
      console.log('Performance collector is not running')
      return
    }

    console.log('Stopping performance metrics collection...')
    this.isRunning = false

    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }

  collectMetrics() {
    const memUsage = process.memoryUsage()
    const cpuUsage = process.cpuUsage()

    const metrics = {
      timestamp: Date.now(),
      memory: {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      uptime: process.uptime()
    }

    this.metrics.push(metrics)

    // Keep only last 24 hours of metrics
    const cutoff = Date.now() - (24 * 60 * 60 * 1000)
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff)

    // Save to file
    this.saveMetrics()

    // Check for alerts
    this.checkAlerts(metrics)

    console.log(`Metrics collected: Memory ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB, CPU ${cpuUsage.user + cpuUsage.system}ms`)
  }

  saveMetrics() {
    const metricsPath = path.join(process.cwd(), 'public', 'monitoring', 'metrics.json')
    
    try {
      fs.writeFileSync(metricsPath, JSON.stringify(this.metrics, null, 2))
    } catch (error) {
      console.error('Failed to save metrics:', error)
    }
  }

  checkAlerts(metrics) {
    const memoryUsageMB = metrics.memory.heapUsed / 1024 / 1024
    
    // High memory usage alert
    if (memoryUsageMB > 500) {
      this.sendAlert({
        type: 'HIGH_MEMORY',
        severity: 'WARNING',
        message: `High memory usage detected: ${memoryUsageMB.toFixed(1)}MB`,
        metadata: metrics
      })
    }

    // Critical memory usage alert
    if (memoryUsageMB > 800) {
      this.sendAlert({
        type: 'CRITICAL_MEMORY',
        severity: 'CRITICAL',
        message: `Critical memory usage: ${memoryUsageMB.toFixed(1)}MB`,
        metadata: metrics
      })
    }
  }

  async sendAlert(alert) {
    try {
      const response = await fetch('http://localhost:3000/api/monitoring/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(alert)
      })

      if (!response.ok) {
        console.error('Failed to send alert:', await response.text())
      }
    } catch (error) {
      console.error('Failed to send alert:', error)
    }
  }

  getMetrics() {
    return this.metrics
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      metricsCount: this.metrics.length,
      lastCollection: this.metrics.length > 0 ? this.metrics[this.metrics.length - 1].timestamp : null
    }
  }
}

// CLI interface
const collector = new PerformanceCollector()
const command = process.argv[2]

switch (command) {
  case 'start':
    collector.start()
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\nShutting down performance collector...')
      collector.stop()
      process.exit(0)
    })
    
    // Keep process running
    process.stdin.resume()
    break
    
  case 'stop':
    collector.stop()
    break
    
  case 'status':
    console.log(JSON.stringify(collector.getStatus(), null, 2))
    break
    
  case 'metrics':
    console.log(JSON.stringify(collector.getMetrics(), null, 2))
    break
    
  default:
    console.log('Usage: node performance-collector.js [start|stop|status|metrics]')
    break
}

module.exports = PerformanceCollector
