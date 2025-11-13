import { test, expect } from '@playwright/test'

test.describe('Super Admin Security Actions E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login
    await page.goto('/auth/login')
    
    // Login as super admin (adjust credentials to match your test DB seed)
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    
    // Wait for redirect and navigation to super-admin
    await page.waitForURL(/\/super-admin/, { timeout: 10000 })
    await page.goto('/super-admin')
    
    // Navigate to Security Monitoring tab
    await page.click('text=Security Monitoring')
    await expect(page.locator('h3:has-text("Security Events")')).toBeVisible({ timeout: 5000 })
  })

  test('should display security overview metrics', async ({ page }) => {
    // Check overview cards
    await expect(page.locator('text=Security Events')).toBeVisible()
    await expect(page.locator('text=Failed Logins')).toBeVisible()
    await expect(page.locator('text=Active Sessions')).toBeVisible()
    await expect(page.locator('text=Suspicious Activity')).toBeVisible()
  })

  test('should resolve a security event and refresh data', async ({ page }) => {
    // Switch to Recent Events tab
    await page.click('button[role="tab"]:has-text("Recent Events")')
    
    // Find first unresolved event
    const unresolvedRow = page.locator('tr:has(span:text("Unresolved"))').first()
    const isPresent = await unresolvedRow.isVisible().catch(() => false)
    
    if (!isPresent) {
      test.skip()
      return
    }
    
    // Click Resolve button
    await unresolvedRow.locator('button:has-text("Resolve")').click()
    
    // Wait for toast notification
    await expect(page.locator('text=Event resolved')).toBeVisible({ timeout: 5000 })
    
    // Verify UI updates (button should disappear or row shows "Resolved")
    await expect(page.locator('text=Resolved').first()).toBeVisible({ timeout: 3000 })
  })

  test('should mark suspicious activity as reviewed', async ({ page }) => {
    // Switch to Suspicious Activity tab
    await page.click('button[role="tab"]:has-text("Suspicious")')
    
    // Find first unreviewed activity
    const unreviewedRow = page.locator('tr:has(span:text("Unreviewed"))').first()
    const isPresent = await unreviewedRow.isVisible().catch(() => false)
    
    if (!isPresent) {
      test.skip()
      return
    }
    
    // Click Mark Reviewed button
    await unreviewedRow.locator('button:has-text("Mark Reviewed")').click()
    
    // Wait for toast notification
    await expect(page.locator('text=Marked reviewed')).toBeVisible({ timeout: 5000 })
    
    // Verify UI updates
    await expect(page.locator('text=Reviewed').first()).toBeVisible({ timeout: 3000 })
  })

  test('should handle unauthorized access gracefully', async ({ page }) => {
    // Logout
    await page.goto('/api/auth/signout')
    
    // Try to access security monitoring endpoint directly
    const response = await page.request.post('/api/admin/security-monitoring/resolve', {
      data: { id: 'test-event-id' }
    })
    
    expect(response.status()).toBe(401)
  })
})
