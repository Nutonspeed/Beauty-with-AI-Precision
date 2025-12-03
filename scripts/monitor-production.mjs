#!/usr/bin/env node

/**
 * Production Monitoring Dashboard for Beauty-with-AI-Precision
 *
 * Monitors production environment health, performance, and key metrics
 * Run with: node scripts/monitor-production.mjs
 */

import https from 'https'
import { performance } from 'perf_hooks'

const PRODUCTION_URL = 'https://beauty-with-ai-precision-b11a57.vercel.app'
const SUPABASE_URL = process.env.SUPABASE_URL

class ProductionMonitor {
  constructor() {
    this.metrics = {
      uptime: 0,
      responseTime: 0,
      errorRate: 0,
      lastChecked: null,
      status: 'unknown'
    }
  }

  async checkHealth() {
    const startTime = performance.now()

    try {
      const response = await this.makeRequest(PRODUCTION_URL)
      const responseTime = performance.now() - startTime

      this.metrics = {
        ...this.metrics,
        uptime: this.metrics.status === 'healthy' ? this.metrics.uptime + 1 : 1,
        responseTime: Math.round(responseTime),
        status: 'healthy',
        lastChecked: new Date().toISOString()
      }

      console.log(`✅ Production Healthy - ${responseTime.toFixed(2)}ms`)
      return true
    } catch (error) {
      this.metrics = {
        ...this.metrics,
        errorRate: this.metrics.errorRate + 1,
        status: 'unhealthy',
        lastChecked: new Date().toISOString()
      }

      console.log(`❌ Production Issue: ${error.message}`)
      return false
    }
  }

  async checkDatabase() {
    if (!SUPABASE_URL) {
      console.log('⚠️  SUPABASE_URL not configured')
      return false
    }

    try {
      const response = await this.makeRequest(`${SUPABASE_URL}/rest/v1/`)
      console.log('✅ Database Connection: OK')
      return true
    } catch (error) {
      console.log(`❌ Database Issue: ${error.message}`)
      return false
    }
  }

  async checkAPIEndpoints() {
    const endpoints = [
      '/api/health',
      '/api/auth/session',
      '/api/analytics/dashboard'
    ]

    let passed = 0
    let failed = 0

    for (const endpoint of endpoints) {
      try {
        await this.makeRequest(PRODUCTION_URL + endpoint)
        console.log(`✅ ${endpoint}: OK`)
        passed++
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.message}`)
        failed++
      }
    }

    console.log(`📊 API Check: ${passed}/${passed + failed} endpoints healthy`)
    return failed === 0
  }

  async runFullCheck() {
    console.log('\n🏥 Beauty-with-AI-Precision Production Monitor')
    console.log('=' .repeat(50))
    console.log(`⏰ ${new Date().toLocaleString()}`)
    console.log('')

    const healthCheck = await this.checkHealth()
    const dbCheck = await this.checkDatabase()
    const apiCheck = await this.checkAPIEndpoints()

    console.log('')
    console.log('📈 Metrics Summary:')
    console.log(`   Status: ${this.metrics.status.toUpperCase()}`)
    console.log(`   Response Time: ${this.metrics.responseTime}ms`)
    console.log(`   Uptime Checks: ${this.metrics.uptime}`)
    console.log(`   Error Rate: ${this.metrics.errorRate}`)
    console.log(`   Last Checked: ${this.metrics.lastChecked}`)
    console.log('')

    const overallStatus = healthCheck && dbCheck && apiCheck ? '✅ ALL SYSTEMS OPERATIONAL' : '⚠️  ISSUES DETECTED'
    console.log(overallStatus)

    return { healthCheck, dbCheck, apiCheck }
  }

  makeRequest(url) {
    return new Promise((resolve, reject) => {
      const req = https.get(url, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data)
          } else {
            reject(new Error(`HTTP ${res.statusCode}`))
          }
        })
      })

      req.on('error', reject)
      req.setTimeout(10000, () => {
        req.destroy()
        reject(new Error('Timeout'))
      })
    })
  }

  async startContinuousMonitoring(intervalMinutes = 5) {
    console.log(`🔄 Starting continuous monitoring every ${intervalMinutes} minutes...`)
    console.log('Press Ctrl+C to stop\n')

    const interval = setInterval(async () => {
      await this.runFullCheck()
    }, intervalMinutes * 60 * 1000)

    // Initial check
    await this.runFullCheck()

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping monitoring...')
      clearInterval(interval)
      process.exit(0)
    })
  }
}

// CLI interface
const monitor = new ProductionMonitor()

if (process.argv.includes('--continuous')) {
  const interval = parseInt(process.argv[process.argv.indexOf('--continuous') + 1]) || 5
  monitor.startContinuousMonitoring(interval)
} else {
  monitor.runFullCheck()
}
