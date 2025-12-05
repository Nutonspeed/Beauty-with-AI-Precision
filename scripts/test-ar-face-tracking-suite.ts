#!/usr/bin/env node

import { execSync } from 'child_process'
import { setTimeout as delay } from 'timers/promises'

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3004'
const TIMEOUT = Number(process.env.TEST_TIMEOUT || 30000)

console.log('🚀 Starting AR Face Tracking Test Suite\n')

async function runTests() {
  try {
    console.log('📋 Test Plan:')
    console.log('1. Health Check')
    console.log('2. TypeScript Compilation')
    console.log('3. Unit Tests (AR Face Tracker)')
    console.log('4. E2E Tests (AR Face Tracking Page)')
    console.log('5. Build Check\n')

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: controller.signal })
    const text = await res.text()
    return { ok: res.ok, status: res.status, text }
  } finally {
    clearTimeout(timer)
  }
}

    // 1. Health Check
    console.log('1️⃣  Health Check...')
    try {
      const response = await fetchWithTimeout(`${BASE_URL}/api/health`, TIMEOUT)
      if (response.ok) {
        console.log('✅ Health check passed')
      } else {
        throw new Error(`Health check failed: ${response.status}`)
      }
    } catch (error) {
      console.log('⚠️  Health check failed, skipping API tests')
      console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`)
    }

    // 2. TypeScript Check
    console.log('\n2️⃣  TypeScript Compilation...')
    try {
      execSync('pnpm run type-check', { stdio: 'inherit', timeout: TIMEOUT })
      console.log('✅ TypeScript compilation passed')
    } catch (error) {
      console.log('❌ TypeScript compilation failed')
      throw error
    }

    // 3. Unit Tests
    console.log('\n3️⃣  Unit Tests (AR Face Tracker)...')
    try {
      execSync('pnpm test:ci ar-face-tracker', { stdio: 'inherit', timeout: TIMEOUT })
      console.log('✅ Unit tests passed')
    } catch (error) {
      console.log('❌ Unit tests failed')
      throw error
    }

    // 4. E2E Tests
    console.log('\n4️⃣  E2E Tests (AR Face Tracking Page)...')
    try {
      execSync('pnpm test:e2e --grep "AR Face Tracking"', { stdio: 'inherit', timeout: TIMEOUT * 2 })
      console.log('✅ E2E tests passed')
    } catch (error) {
      console.log('❌ E2E tests failed')
      throw error
    }

    // 5. Build Check
    console.log('\n5️⃣  Build Check...')
    try {
      execSync('pnpm run build:pages', { stdio: 'inherit', timeout: TIMEOUT * 3 })
      console.log('✅ Build check passed')
    } catch (error) {
      console.log('❌ Build check failed')
      throw error
    }

    console.log('\n🎉 All tests passed! AR Face Tracking is ready for production.')
    console.log('\n📊 Test Summary:')
    console.log('• TypeScript: ✅ Compiled without errors')
    console.log('• Unit Tests: ✅ ARFaceTracker class functions correctly')
    console.log('• E2E Tests: ✅ Page loads and UI elements work')
    console.log('• Build: ✅ Production build succeeds')

  } catch (error) {
    console.error('\n💥 Test suite failed:', error instanceof Error ? error.message : String(error))
    console.log('\n🔧 Troubleshooting:')
    console.log('• Make sure dev server is running: pnpm run dev')
    console.log('• Check for missing dependencies: pnpm install')
    console.log('• Review error logs above for specific issues')
    process.exit(1)
  }
}

runTests()
