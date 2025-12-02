#!/usr/bin/env node

/**
 * Rate Limiting Monitoring Script
 * Monitors rate limiting effectiveness and provides alerts
 */

const { execAsync } = require('util').promisify(require('child_process').exec)
const fs = require('fs')
const path = require('path')

class RateLimitMonitor {
  constructor() {
    this.metrics = {
      startTime: Date.now(),
      totalRequests: 0,
      blockedRequests: 0,
      violationsByIP: new Map(),
      violationsByEndpoint: new Map(),
      alerts: []
    }
    
    this.config = {
      checkInterval: 30000, // 30 seconds
      alertThresholds: {
        blockRate: 0.1, // 10% block rate
        violationsPerIP: 50, // 50 violations per IP
        violationsPerEndpoint: 100 // 100 violations per endpoint
      }
    }
  }

  async startMonitoring() {
    console.log('🛡️ Starting Rate Limit Monitoring...')
    
    // Start monitoring interval
    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics()
    }, this.config.checkInterval)

    // Graceful shutdown
    process.on('SIGINT', () => this.shutdown())
    process.on('SIGTERM', () => this.shutdown())

    console.log('✅ Rate limit monitoring started. Press Ctrl+C to stop.')
  }

  async collectMetrics() {
    try {
      const timestamp = Date.now()
      
      // Collect rate limit metrics
      const rateLimitMetrics = await this.getRateLimitMetrics()
      
      // Update metrics
      this.updateMetrics(rateLimitMetrics)
      
      // Check for alerts
      this.checkAlerts()
      
      // Log summary
      this.logSummary()

    } catch (error) {
      console.error('❌ Metrics collection error:', error)
    }
  }

  async getRateLimitMetrics() {
    try {
      // This would query your rate limit logging system
      // For now, return mock data
      return {
        totalRequests: Math.floor(Math.random() * 1000),
        blockedRequests: Math.floor(Math.random() * 100),
        violations: [
          {
            ip: '192.168.1.100',
            endpoint: '/api/ai/analysis',
            timestamp: Date.now()
          },
          {
            ip: '10.0.0.50',
            endpoint: '/api/auth/login',
            timestamp: Date.now()
          }
        ]
      }
    } catch (error) {
      return { error: error.message }
    }
  }

  updateMetrics(metrics: any) {
    // Update request counts
    this.metrics.totalRequests += metrics.totalRequests || 0
    this.metrics.blockedRequests += metrics.blockedRequests || 0
    
    // Update violations by IP
    if (metrics.violations) {
      metrics.violations.forEach(violation => {
        const count = this.metrics.violationsByIP.get(violation.ip) || 0
        this.metrics.violationsByIP.set(violation.ip, count + 1)
      })
    }
  }

  checkAlerts() {
    const alerts = []
    
    // Check block rate
    const blockRate = this.metrics.totalRequests > 0 
      ? this.metrics.blockedRequests / this.metrics.totalRequests 
      : 0
    
    if (blockRate > this.config.alertThresholds.blockRate) {
      alerts.push({
        type: 'high_block_rate',
        level: 'warning',
        message: `High block rate: ${(blockRate * 100).toFixed(2)}%`,
        value: blockRate
      })
    }
    
    // Check IP violations
    for (const [ip, count] of this.metrics.violationsByIP.entries()) {
      if (count > this.config.alertThresholds.violationsPerIP) {
        alerts.push({
          type: 'ip_violations',
          level: 'critical',
          message: `High violations from IP ${ip}: ${count}`,
          ip,
          value: count
        })
      }
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
    const blockRate = this.metrics.totalRequests > 0 
      ? (this.metrics.blockedRequests / this.metrics.totalRequests) * 100 
      : 0
    
    console.log(`\n📊 [${time}] Rate Limit Monitoring Summary:`)
    console.log(`  📈 Total Requests: ${this.metrics.totalRequests}`)
    console.log(`  🛡️ Blocked Requests: ${this.metrics.blockedRequests}`)
    console.log(`  📊 Block Rate: ${blockRate.toFixed(2)}%`)
    console.log(`  🚨 Violating IPs: ${this.metrics.violationsByIP.size}`)
    
    if (this.metrics.violationsByIP.size > 0) {
      console.log(`  📋 Top Violators:`)
      const topViolators = Array.from(this.metrics.violationsByIP.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
      
      topViolators.forEach(([ip, count]) => {
        console.log(`    • ${ip}: ${count} violations`)
      })
    }
  }

  async shutdown() {
    console.log('\n🔄 Shutting down rate limit monitor...')
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
    }

    // Save final report
    await this.saveReport()
    
    console.log('✅ Rate limit monitoring stopped. Report saved.')
    process.exit(0)
  }

  async saveReport() {
    const report = {
      summary: {
        monitoringDuration: Date.now() - this.metrics.startTime,
        totalRequests: this.metrics.totalRequests,
        blockedRequests: this.metrics.blockedRequests,
        blockRate: this.metrics.totalRequests > 0 
          ? this.metrics.blockedRequests / this.metrics.totalRequests 
          : 0
      },
      metrics: {
        totalRequests: this.metrics.totalRequests,
        blockedRequests: this.metrics.blockedRequests,
        violationsByIP: Object.fromEntries(this.metrics.violationsByIP),
        violationsByEndpoint: Object.fromEntries(this.metrics.violationsByEndpoint)
      },
      alerts: this.metrics.alerts,
      generatedAt: new Date().toISOString()
    }

    const reportPath = path.join(process.cwd(), 'logs', 'rate-limit-monitoring-report.json')
    
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
  const monitor = new RateLimitMonitor()
  monitor.startMonitoring()
}

module.exports = RateLimitMonitor
