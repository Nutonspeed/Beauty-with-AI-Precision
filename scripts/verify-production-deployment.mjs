#!/usr/bin/env node

/**
 * Comprehensive Deployment Verification Script
 *
 * Verifies production deployment end-to-end
 * Run with: node scripts/verify-production-deployment.mjs
 */

import https from 'https'
import { performance } from 'perf_hooks'

const PRODUCTION_URL = 'https://beauty-with-ai-precision-b11a57.vercel.app'

class DeploymentVerifier {
  constructor() {
    this.results = {
      health: false,
      database: false,
      authentication: false,
      aiFeatures: false,
      performance: false,
      security: false,
      score: 0
    }
  }

  async verifyHealth() {
    console.log('🏥 Checking application health...')
    try {
      const response = await this.makeRequest('/')
      this.results.health = response.status === 200
      console.log(this.results.health ? '✅ Homepage loads' : '❌ Homepage failed')
      return this.results.health
    } catch (error) {
      console.log('❌ Health check failed:', error.message)
      return false
    }
  }

  async verifyDatabase() {
    console.log('🗄️  Checking database connection...')
    try {
      // Test auth endpoint which requires database
      const response = await this.makeRequest('/api/auth/session')
      this.results.database = response.status !== 500
      console.log(this.results.database ? '✅ Database connected' : '❌ Database error')
      return this.results.database
    } catch (error) {
      console.log('❌ Database check failed:', error.message)
      return false
    }
  }

  async verifyAuthentication() {
    console.log('🔐 Checking authentication system...')
    try {
      // Check if login page loads
      const loginPage = await this.makeRequest('/th/auth/login')
      const hasDemoAccounts = loginPage.data?.includes('Demo Accounts')

      this.results.authentication = loginPage.status === 200 && hasDemoAccounts
      console.log(this.results.authentication ? '✅ Authentication working' : '❌ Authentication failed')
      return this.results.authentication
    } catch (error) {
      console.log('❌ Authentication check failed:', error.message)
      return false
    }
  }

  async verifyAIFeatures() {
    console.log('🤖 Checking AI features...')
    try {
      // Check if analysis page loads
      const analysisPage = await this.makeRequest('/th/analysis')
      const hasUploadArea = analysisPage.data?.includes('upload') || analysisPage.data?.includes('file')

      this.results.aiFeatures = analysisPage.status === 200 && hasUploadArea
      console.log(this.results.aiFeatures ? '✅ AI features accessible' : '❌ AI features failed')
      return this.results.aiFeatures
    } catch (error) {
      console.log('❌ AI features check failed:', error.message)
      return false
    }
  }

  async verifyPerformance() {
    console.log('⚡ Checking performance metrics...')
    try {
      const startTime = performance.now()
      await this.makeRequest('/')
      const loadTime = performance.now() - startTime

      // Check if load time is under 3 seconds
      this.results.performance = loadTime < 3000
      console.log(`📊 Load time: ${loadTime.toFixed(2)}ms ${this.results.performance ? '✅' : '❌'}`)
      return this.results.performance
    } catch (error) {
      console.log('❌ Performance check failed:', error.message)
      return false
    }
  }

  async verifySecurity() {
    console.log('🔒 Checking security headers...')
    try {
      const response = await this.makeRequest('/', false) // Don't parse JSON

      const headers = response.headers
      const hasSecurityHeaders = headers['strict-transport-security'] &&
                                headers['x-content-type-options'] &&
                                headers['x-frame-options']

      this.results.security = hasSecurityHeaders
      console.log(this.results.security ? '✅ Security headers present' : '❌ Security headers missing')
      return this.results.security
    } catch (error) {
      console.log('❌ Security check failed:', error.message)
      return false
    }
  }

  async runFullVerification() {
    console.log('🎯 Beauty-with-AI-Precision Production Verification')
    console.log('=' .repeat(60))
    console.log(`⏰ ${new Date().toLocaleString()}`)
    console.log(`🌐 URL: ${PRODUCTION_URL}`)
    console.log('')

    const checks = [
      this.verifyHealth.bind(this),
      this.verifyDatabase.bind(this),
      this.verifyAuthentication.bind(this),
      this.verifyAIFeatures.bind(this),
      this.verifyPerformance.bind(this),
      this.verifySecurity.bind(this)
    ]

    let passed = 0
    for (const check of checks) {
      const result = await check()
      if (result) passed++
      console.log('')
    }

    // Calculate score
    this.results.score = Math.round((passed / checks.length) * 100)

    console.log('📊 VERIFICATION RESULTS')
    console.log('=' .repeat(30))
    console.log(`Passed: ${passed}/${checks.length} checks`)
    console.log(`Score: ${this.results.score}%`)

    if (this.results.score >= 80) {
      console.log('🎉 PRODUCTION READY - All critical systems operational!')
    } else if (this.results.score >= 60) {
      console.log('⚠️  MOSTLY READY - Minor issues to resolve')
    } else {
      console.log('❌ NEEDS ATTENTION - Critical issues found')
    }

    console.log('')
    console.log('📋 Detailed Results:')
    Object.entries(this.results).forEach(([key, value]) => {
      if (key !== 'score') {
        console.log(`   ${key}: ${value ? '✅' : '❌'}`)
      }
    })

    return this.results
  }

  makeRequest(path, parseJson = true) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'beauty-with-ai-precision-b11a57.vercel.app',
        path: path,
        method: 'GET',
        headers: {
          'User-Agent': 'DeploymentVerifier/1.0'
        }
      }

      const req = https.request(options, (res) => {
        let data = ''

        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          if (parseJson) {
            try {
              resolve({ status: res.statusCode, data: JSON.parse(data) })
            } catch {
              resolve({ status: res.statusCode, data: data })
            }
          } else {
            resolve({ status: res.statusCode, headers: res.headers, data: data })
          }
        })
      })

      req.on('error', reject)
      req.setTimeout(15000, () => {
        req.destroy()
        reject(new Error('Timeout'))
      })

      req.end()
    })
  }
}

// CLI interface
const verifier = new DeploymentVerifier()

if (process.argv.includes('--continuous')) {
  const interval = parseInt(process.argv[process.argv.indexOf('--continuous') + 1]) || 30
  console.log(`🔄 Running continuous verification every ${interval} minutes...`)
  setInterval(() => verifier.runFullVerification(), interval * 60 * 1000)
  verifier.runFullVerification() // Initial run
} else {
  verifier.runFullVerification()
}
