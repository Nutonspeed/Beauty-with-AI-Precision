#!/usr/bin/env node

// Health Check Script
const https = require('https')
const http = require('http')

class HealthChecker {
  constructor(url = 'http://localhost:3000/api/monitoring/health') {
    this.url = url
    this.isHealthy = false
    this.lastCheck = null
    this.checkInterval = null
  }

  async checkHealth() {
    return new Promise((resolve, reject) => {
      const protocol = this.url.startsWith('https') ? https : http
      
      const request = protocol.get(this.url, (response) => {
        let data = ''
        
        response.on('data', (chunk) => {
          data += chunk
        })
        
        response.on('end', () => {
          try {
            const health = JSON.parse(data)
            this.isHealthy = health.status === 'healthy'
            this.lastCheck = Date.now()
            
            console.log(`Health check: ${health.status} (${response.statusCode})`)
            
            if (health.status !== 'healthy') {
              console.log('Health issues detected:', health.checks)
            }
            
            resolve(health)
          } catch (error) {
            console.error('Failed to parse health check response:', error)
            reject(error)
          }
        })
      })
      
      request.on('error', (error) => {
        console.error('Health check failed:', error.message)
        this.isHealthy = false
        this.lastCheck = Date.now()
        reject(error)
      })
      
      request.setTimeout(10000, () => {
        request.destroy()
        reject(new Error('Health check timeout'))
      })
    })
  }

  startMonitoring(intervalMs = 60000) {
    console.log(`Starting health monitoring every ${intervalMs / 1000} seconds...`)
    
    // Initial check
    this.checkHealth().catch(console.error)
    
    // Regular checks
    this.checkInterval = setInterval(() => {
      this.checkHealth().catch(console.error)
    }, intervalMs)
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
      console.log('Health monitoring stopped')
    }
  }

  async waitForHealthy(timeoutMs = 300000) {
    console.log('Waiting for service to become healthy...')
    
    const startTime = Date.now()
    
    while (Date.now() - startTime < timeoutMs) {
      try {
        const health = await this.checkHealth()
        if (health.status === 'healthy') {
          console.log('Service is healthy!')
          return health
        }
      } catch (error) {
        // Service not responding, continue waiting
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
    
    throw new Error(`Service did not become healthy within ${timeoutMs / 1000} seconds`)
  }
}

// CLI interface
const checker = new HealthChecker()
const command = process.argv[2]

switch (command) {
  case 'check':
    checker.checkHealth()
      .then(health => console.log(JSON.stringify(health, null, 2)))
      .catch(error => {
        console.error('Health check failed:', error)
        process.exit(1)
      })
    break
    
  case 'monitor':
    const interval = parseInt(process.argv[3]) || 60000
    checker.startMonitoring(interval)
    
    process.on('SIGINT', () => {
      console.log('\nStopping health monitoring...')
      checker.stopMonitoring()
      process.exit(0)
    })
    
    process.stdin.resume()
    break
    
  case 'wait':
    const timeout = parseInt(process.argv[3]) || 300000
    checker.waitForHealthy(timeout)
      .then(() => process.exit(0))
      .catch(error => {
        console.error(error.message)
        process.exit(1)
      })
    break
    
  default:
    console.log('Usage: node health-checker.js [check|monitor|wait] [interval|timeout]')
    break
}

module.exports = HealthChecker
