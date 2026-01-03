import { expect } from '@playwright/test'

export class TestHelpers {
  /**
   * Wait for element with multiple strategies
   */
  static async waitForElement(page: any, selector: string, timeout = 30000) {
    try {
      // Strategy 1: waitForSelector
      await page.waitForSelector(selector, { timeout })
    } catch {
      try {
        // Strategy 2: waitForFunction
        await page.waitForFunction(
          (sel: string) => document.querySelector(sel) !== null,
          selector,
          { timeout }
        )
      } catch {
        // Strategy 3: Check visibility
        await expect(page.locator(selector)).toBeVisible({ timeout })
      }
    }
  }
  
  /**
   * Wait for API response
   */
  static async waitForApiResponse(page: any, urlPattern: string, timeout = 30000) {
    return page.waitForResponse(
      (response: any) => response.url().includes(urlPattern),
      { timeout }
    )
  }
  
  /**
   * Login with test user
   */
  static async login(page: any, user: any) {
    await page.goto('/th/auth/login')
    await page.fill('input[type="email"]', user.email)
    await page.fill('input[type="password"]', user.password)
    await page.click('button:has-text("เข้าสู่ระบบ")')
    
    // Wait for login complete
    await this.waitForElement(page, '[data-testid="user-menu"]', 10000)
    await page.waitForLoadState('networkidle')
  }
  
  /**
   * Upload image and wait for preview
   */
  static async uploadImage(page: any, imagePath: string) {
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(imagePath)
    
    // Wait for upload preview
    await this.waitForElement(page, '.upload-preview, .preview-container', 15000)
    
    // Verify upload success
    const preview = page.locator('.upload-preview img')
    await expect(preview).toBeVisible()
  }
  
  /**
   * Wait for AI analysis completion
   */
  static async waitForAnalysis(page: any, timeout = 60000) {
    // Wait for analyzing state
    await this.waitForElement(page, '.analyzing, .processing', 5000)
    
    // Wait for completion
    await page.waitForFunction(() => {
      const status = document.querySelector('.analysis-status, .progress-text')
      return status?.textContent?.includes('เสร็จสิ้น') || 
             status?.textContent?.includes('100%') ||
             document.querySelector('.analysis-results')
    }, { timeout })
    
    // Verify results visible
    await expect(page.locator('.analysis-results')).toBeVisible()
  }
  
  /**
   * Mock slow connection
   */
  static async simulateSlowConnection(page: any) {
    await page.route('**/*', (route: any) => {
      // Slow down API calls
      if (route.request().url().includes('/api/')) {
        setTimeout(() => route.continue(), 2000)
      } else {
        route.continue()
      }
    })
  }
  
  /**
   * Mock network error
   */
  static async simulateNetworkError(page: any, urlPattern: string) {
    await page.route(urlPattern, (route: any) => {
      route.abort()
    })
  }
  
  /**
   * Check element accessibility
   */
  static async checkAccessibility(page: any, selector: string) {
    const element = page.locator(selector)
    
    // Check if element is visible
    await expect(element).toBeVisible()
    
    // Check if element is enabled
    if (await element.getAttribute('disabled') === null) {
      await expect(element).toBeEnabled()
    }
    
    // Check if element has proper aria labels
    const ariaLabel = await element.getAttribute('aria-label')
    const ariaLabelledBy = await element.getAttribute('aria-labelledby')
    
    if (!ariaLabel && !ariaLabelledBy) {
      console.warn(`Element ${selector} missing accessibility label`)
    }
  }
  
  /**
   * Take screenshot on failure
   */
  static async captureScreenshot(page: any, testName: string) {
    const screenshotPath = `test-results/${testName}-failure.png`
    await page.screenshot({ path: screenshotPath, fullPage: true })
    console.log(`Screenshot saved: ${screenshotPath}`)
  }
  
  /**
   * Generate random test data
   */
  static generateTestData() {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(7)
    
    return {
      email: `test-${timestamp}-${random}@test.com`,
      name: `Test User ${timestamp}`,
      phone: `08${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      clinicName: `Test Clinic ${timestamp}`
    }
  }
  
  /**
   * Cleanup test data
   */
  static async cleanup(testId: string) {
    try {
      await fetch(`${process.env.TEST_API_URL}/api/test/cleanup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId })
      })
    } catch (error) {
      console.error('Cleanup failed:', error)
    }
  }
}

// Extend expect with custom matchers
expect.extend({
  async toBeAccessible(received) {
    try {
      await TestHelpers.checkAccessibility(received.page, received.selector)
      return {
        message: () => `element ${received.selector} is accessible`,
        pass: true
      }
    } catch (error) {
      return {
        message: () => `element ${received.selector} is not accessible: ${error}`,
        pass: false
      }
    }
  }
})
