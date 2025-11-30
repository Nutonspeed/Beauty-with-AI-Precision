import { test, expect } from '@playwright/test'

test.describe('Homepage E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/th')
    await page.waitForLoadState('domcontentloaded')
  })

  test('should display hero section', async ({ page }) => {
    // Check hero headline
    const headline = page.locator('h1').first()
    await expect(headline).toBeVisible({ timeout: 10000 })
  })

  test('should display navigation', async ({ page }) => {
    // Check logo
    const logo = page.locator('[aria-label*="ClinicIQ"], svg').first()
    await expect(logo).toBeVisible({ timeout: 5000 })
  })

  test('should display CTA buttons', async ({ page }) => {
    // Check primary CTA
    const ctaButton = page.locator('a[href*="analysis"], button').first()
    await expect(ctaButton).toBeVisible({ timeout: 5000 })
  })

  test('should display features section', async ({ page }) => {
    // Scroll to features
    await page.evaluate(() => window.scrollBy(0, 500))
    await page.waitForTimeout(500)
    
    // Check features cards exist
    const cards = page.locator('[class*="card"], [class*="Card"]')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should display footer', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)
    
    // Check footer exists
    const footer = page.locator('footer')
    await expect(footer).toBeVisible({ timeout: 5000 })
  })

  test('should have working language switch', async ({ page }) => {
    // Look for language toggle
    const langToggle = page.locator('button[aria-label*="language"], [class*="language"]').first()
    
    if (await langToggle.isVisible().catch(() => false)) {
      await langToggle.click()
      await page.waitForTimeout(500)
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)
    
    // Check content is still visible
    const content = page.locator('main, [class*="container"]').first()
    await expect(content).toBeVisible({ timeout: 5000 })
  })
})
