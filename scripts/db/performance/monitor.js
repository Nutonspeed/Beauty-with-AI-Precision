#!/usr/bin/env node

/**
 * Database Performance Monitoring Script
 * Monitors and reports on database performance metrics
 */

const { execAsync } = require('util').promisify(require('child_process').exec)
const fs = require('fs')
const path = require('path')

class DatabasePerformanceMonitor {
  constructor() {
    this.metrics = {
      startTime: Date.now(),
      measurements: [],
      alerts: []
    }
    this.config = {
      checkInterval: 30000, // 30 seconds
      slowQueryThreshold: 1000, // 1 second
      connectionThreshold: 80, // 80% connection usage
      cacheHitRateThreshold: 0.7 // 70% cache hit rate
    }
  }

  async startMonitoring() {
    console.log('🔍 Starting Database Performance Monitoring...')
    
    // Start monitoring interval
    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics()
    }, this.config.checkInterval)

    // Graceful shutdown
    process.on('SIGINT', () => this.shutdown())
    process.on('SIGTERM', () => this.shutdown())

    console.log('✅ Database monitoring started. Press Ctrl+C to stop.')
  }

  async collectMetrics() {
    try {
      const timestamp = Date.now()
      
      // Collect database metrics
      const dbMetrics = await this.getDatabaseMetrics()
      
      // Collect connection pool metrics
      const connectionMetrics = await this.getConnectionMetrics()
      
      // Collect query performance metrics
      const queryMetrics = await this.getQueryMetrics()
      
      const measurement = {
        timestamp,
        database: dbMetrics,
        connections: connectionMetrics,
        queries: queryMetrics
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
      console.error('❌ Database metrics collection error:', error)
    }
  }

  async getDatabaseMetrics() {
    try {
      // This would connect to your database and get metrics
      // For now, return mock data
      return {
        activeConnections: 5,
        idleConnections: 15,
        maxConnections: 20,
        avgQueryTime: 85,
        slowQueries: 2,
        cacheHitRate: 0.85,
        throughput: 45
      }
    } catch (error) {
      return { error: error.message }
    }
  }

  async getConnectionMetrics() {
    try {
      // Get connection pool metrics
      return {
        totalConnections: 5,
        activeConnections: 3,
        idleConnections: 2,
        connectionUtilization: 25,
        poolHealth: 'healthy'
      }
    } catch (error) {
      return { error: error.message }
    }
  }

  async getQueryMetrics() {
    try {
      // Get query performance metrics
      return {
        totalQueries: 1250,
        avgExecutionTime: 85,
        slowQueries: [
          { query: 'SELECT * FROM skin_analyses WHERE...', time: 1250 },
          { query: 'SELECT * FROM users JOIN clinics...', time: 1100 }
        ],
        cacheHitRate: 0.85,
        indexUsageRate: 0.92
      }
    } catch (error) {
      return { error: error.message }
    }
  }

  checkAlerts(measurement) {
    const alerts = []

    // Connection alerts
    if (measurement.connections.connectionUtilization > this.config.connectionThreshold) {
      alerts.push({
        type: 'connections',
        level: 'warning',
        message: `High connection utilization: ${measurement.connections.connectionUtilization}%`
      })
    }

    // Query performance alerts
    if (measurement.database.avgQueryTime > this.config.slowQueryThreshold) {
      alerts.push({
        type: 'performance',
        level: 'warning',
        message: `Slow average query time: ${measurement.database.avgQueryTime}ms`
      })
    }

    // Cache hit rate alerts
    if (measurement.database.cacheHitRate < this.config.cacheHitRateThreshold) {
      alerts.push({
        type: 'cache',
        level: 'warning',
        message: `Low cache hit rate: ${(measurement.database.cacheHitRate * 100).toFixed(1)}%`
      })
    }

    // Slow query alerts
    if (measurement.database.slowQueries > 5) {
      alerts.push({
        type: 'slow_queries',
        level: 'critical',
        message: `High number of slow queries: ${measurement.database.slowQueries}`
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
    
    console.log(`\n📊 [${time}] Database Performance Summary:`)
    
    if (measurement.database.activeConnections !== undefined) {
      console.log(`  🔗 Connections: ${measurement.database.activeConnections}/${measurement.database.maxConnections} active`)
    }
    
    if (measurement.database.avgQueryTime !== undefined) {
      console.log(`  ⚡ Avg Query Time: ${measurement.database.avgQueryTime}ms`)
    }
    
    if (measurement.database.cacheHitRate !== undefined) {
      console.log(`  💾 Cache Hit Rate: ${(measurement.database.cacheHitRate * 100).toFixed(1)}%`)
    }
    
    if (measurement.database.slowQueries !== undefined) {
      console.log(`  🐌 Slow Queries: ${measurement.database.slowQueries}`)
    }
    
    if (measurement.database.throughput !== undefined) {
      console.log(`  📈 Throughput: ${measurement.database.throughput} queries/sec`)
    }
  }

  async shutdown() {
    console.log('\n🔄 Shutting down database performance monitor...')
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
    }

    // Save final report
    await this.saveReport()
    
    console.log('✅ Database monitoring stopped. Report saved.')
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

    const reportPath = path.join(process.cwd(), 'logs', 'db-performance-report.json')
    
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
  const monitor = new DatabasePerformanceMonitor()
  monitor.startMonitoring()
}

module.exports = DatabasePerformanceMonitor
