/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, expect, type Page, type Route } from '@playwright/test'
import path from 'path'

// Fixtures for test data
export const test = base.extend<{
  authenticatedPage: Page;
  testImagePath: string;
  mockAnalysisData: any;
}>({
  // Authenticated page
  authenticatedPage: async ({ page }, use: (page: Page) => Promise<void>) => {
    // Login before each test
    await page.goto('/th/auth/login')
    await page.fill('input[type="email"]', 'demo@clinic.com')
    await page.fill('input[type="password"]', 'demo123')
    await page.click('button:has-text("เข้าสู่ระบบ")')
    await page.waitForLoadState('networkidle')
    
    await use(page)
    
    // Cleanup after test
    await page.goto('/th/logout')
  },
  
  // Test image fixture
  testImagePath: async ({}, use: (value: string) => Promise<void>) => {
    const imagePath = path.join(__dirname, '../fixtures/test-skin.jpg')
    await use(imagePath)
  },
  
  // Mock data
  mockAnalysisData: async ({}, use: (value: any) => Promise<void>) => {
    const data = {
      concerns: [
        { type: 'ริ้วรอย', severity: 65, confidence: 0.85 },
        { type: 'รอยดำ', severity: 45, confidence: 0.78 },
        { type: 'รูขุมขน', severity: 70, confidence: 0.92 }
      ],
      metrics: {
        skinAge: 32,
        hydration: 65,
        elasticity: 70,
        texture: 60
      },
      recommendations: [
        'ใช้ครีมกันแดต SPF 30+ ทุกวัน',
        'ทำความสะอาดผิว 2 ครั้ง/วัน',
        'ใช้มอยเจอร์ไรเซอร์'
      ]
    }
    await use(data)
  }
})

export { expect }

// Custom matchers
expect.extend({
  async toBeVisibleWithin(received, timeout) {
    try {
      await received.waitFor({ state: 'visible', timeout })
      return {
        message: () => `element is visible within ${timeout}ms`,
        pass: true
      }
    } catch {
      return {
        message: () => `element is not visible within ${timeout}ms`,
        pass: false
      }
    }
  }
})

// Test utilities
export class TestUtils {
  static async waitForAnalysis(page: any, timeout = 60000) {
    return page.waitForFunction(() => {
      const status = document.querySelector('.analysis-status, .progress-text')
      return status?.textContent?.includes('เสร็จสิ้น') || 
             status?.textContent?.includes('100%')
    }, { timeout })
  }
  
  static async mockPaymentSuccess(page: any) {
    await page.route('**/api/payment/verify', (route: Route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          status: 'success',
          transactionId: 'TEST-' + Date.now()
        })
      })
    })
  }
  
  static async createTestUser(page: any, userData: any) {
    // Helper to create test user via API
    const response = await page.request.post('/api/test/create-user', {
      data: userData
    })
    return response.json()
  }
  
  static async cleanupTestData(page: any) {
    // Clean up test data
    await page.request.post('/api/test/cleanup', {
      data: { testId: process.env.TEST_ID }
    })
  }
}
