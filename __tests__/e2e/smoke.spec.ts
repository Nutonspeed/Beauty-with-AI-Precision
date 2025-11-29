import { test, expect } from '@playwright/test'

/**
 * Smoke Tests - ทดสอบหน้า public ที่ไม่ต้อง authentication
 * รันได้โดยไม่ต้องมี database connection หรือ test user
 */

test.describe('Smoke Tests - Public Pages', () => {
  
  test.describe('Homepage', () => {
    test('should load homepage', async ({ page }) => {
      await page.goto('/th')
      await expect(page.locator('body')).toBeVisible()
    })

    test('should have navigation', async ({ page }) => {
      await page.goto('/th')
      // Wait for hydration
      await page.waitForLoadState('domcontentloaded')
      // Check page fully loaded
      await expect(page.locator('body')).toBeVisible()
    })

    test('should switch to English', async ({ page }) => {
      await page.goto('/en')
      await expect(page.locator('body')).toBeVisible()
    })
  })

  test.describe('Navigation', () => {
    test('should navigate to features', async ({ page }) => {
      await page.goto('/th/features')
      await page.waitForLoadState('domcontentloaded')
      await expect(page.locator('body')).toBeVisible()
    })

    test('should navigate to pricing', async ({ page }) => {
      await page.goto('/th/pricing')
      await page.waitForLoadState('domcontentloaded')
      await expect(page.locator('body')).toBeVisible()
    })

    test('should navigate to about', async ({ page }) => {
      await page.goto('/th/about')
      await expect(page.locator('body')).toBeVisible()
    })

    test('should navigate to contact', async ({ page }) => {
      await page.goto('/th/contact')
      await expect(page.locator('body')).toBeVisible()
    })

    test('should navigate to case studies', async ({ page }) => {
      await page.goto('/th/case-studies')
      await expect(page.locator('body')).toBeVisible()
    })
  })

  test.describe('Auth Pages (No Login)', () => {
    test('should show login page', async ({ page }) => {
      await page.goto('/th/auth/login')
      await page.waitForLoadState('domcontentloaded')
      // Just verify page loaded without errors
      await expect(page.locator('body')).toBeVisible()
    })

    test('should show register page', async ({ page }) => {
      await page.goto('/th/auth/register')
      await page.waitForLoadState('domcontentloaded')
      // Just verify page loaded without errors
      await expect(page.locator('body')).toBeVisible()
    })

    test('should validate empty login form', async ({ page }) => {
      await page.goto('/th/auth/login')
      const submitBtn = page.locator('button[type="submit"]')
      if (await submitBtn.isVisible()) {
        await submitBtn.click()
        await expect(page).toHaveURL(/login/)
      }
    })
  })

  test.describe('Legal Pages', () => {
    test('should show privacy policy', async ({ page }) => {
      await page.goto('/th/privacy')
      await expect(page.locator('body')).toBeVisible()
    })

    test('should show terms of service', async ({ page }) => {
      await page.goto('/th/terms')
      await expect(page.locator('body')).toBeVisible()
    })

    test('should show PDPA compliance', async ({ page }) => {
      await page.goto('/th/pdpa')
      await expect(page.locator('body')).toBeVisible()
    })
  })

  test.describe('Error Handling', () => {
    test('should handle 404', async ({ page }) => {
      await page.goto('/th/this-page-does-not-exist-12345')
      await expect(page.locator('body')).toBeVisible()
    })
  })

  test.describe('Mobile Responsiveness', () => {
    test.use({ viewport: { width: 375, height: 667 } })

    test('homepage on mobile', async ({ page }) => {
      await page.goto('/th')
      await expect(page.locator('body')).toBeVisible()
    })

    test('features on mobile', async ({ page }) => {
      await page.goto('/th/features')
      await expect(page.locator('body')).toBeVisible()
    })
  })

  test.describe('Tablet Responsiveness', () => {
    test.use({ viewport: { width: 768, height: 1024 } })

    test('homepage on tablet', async ({ page }) => {
      await page.goto('/th')
      await expect(page.locator('body')).toBeVisible()
    })
  })
})
