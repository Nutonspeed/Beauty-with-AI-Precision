import { test, expect } from '@playwright/test'

/**
 * Authentication Flow E2E Tests
 * ทดสอบการล็อกอิน ล็อกเอาท์ และสมัครสมาชิก
 */

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies/storage
    await page.context().clearCookies()
    await page.goto('/th/auth/login')
  })

  test('should show login form', async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('button:has-text("เข้าสู่ระบบ")')).toBeVisible()
  })

  test('should show validation errors', async ({ page }) => {
    // Submit empty form
    const submitButton = page.locator('button:has-text("เข้าสู่ระบบ")')
    await submitButton.click()
    
    await expect(page.locator('.error-message').filter({ hasText: /กรุณา/ })).toBeVisible()
  })

  test('should handle login with demo credentials', async ({ page }) => {
    // Fill demo credentials
    await page.fill('input[type="email"]', 'demo@clinic.com')
    await page.fill('input[type="password"]', 'demo123')
    
    const submitButton = page.locator('button:has-text("เข้าสู่ระบบ")')
    await submitButton.click()
    
    // Wait for redirect or success
    await page.waitForURL(/\/dashboard|\/clinic|\/sales/, { timeout: 10000 })
  })

  test('should show admin contact info', async ({ page }) => {
    const loginButton = page.locator('button:has-text("เข้าสู่ระบบ")')
    await loginButton.click()
    
    // Should show admin contact message instead of signup
    await expect(page.locator('text=สำหรับการสมัครสมาชิก')).toBeVisible()
    await expect(page.locator('text=กรุณาติดต่อแอดมิน')).toBeVisible()
  })

  test('should handle logout', async ({ page }) => {
    // First login (if not already)
    await page.goto('/th/auth/login')
    await page.fill('input[type="email"]', 'demo@clinic.com')
    await page.fill('input[type="password"]', 'demo123')
    await page.click('button:has-text("ล็อกอิน")')
    await page.waitForTimeout(2000)
    
    // Then logout
    const logoutButton = page.locator('button:has-text("ออกจากระบบ")')
    if (await logoutButton.isVisible()) {
      await logoutButton.click()
      
      // Should return to homepage
      await expect(page).toHaveURL('/')
      await expect(page.locator('button:has-text("เข้าสู่ระบบ")')).toBeVisible()
    }
  })

  test('should handle password reset', async ({ page }) => {
    const loginButton = page.locator('button:has-text("เข้าสู่ระบบ")')
    await loginButton.click()
    
    const forgotLink = page.locator('a:has-text("ลืมรหัสผ่าน")')
    if (await forgotLink.isVisible()) {
      await forgotLink.click()
      
      await expect(page.locator('.reset-password-modal')).toBeVisible()
      await expect(page.locator('input[type="email"]')).toBeVisible()
    }
  })
})
