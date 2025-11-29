import { test, expect } from '@playwright/test'

/**
 * Super Admin Security Actions E2E Tests
 * ⚠️ Requires: admin@example.com user in database
 * Skip these tests if no test database is available
 */
test.describe('Super Admin Security Actions E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login
    await page.goto('/th/auth/login')
    await page.waitForLoadState('domcontentloaded')
    
    // Wait for form to be ready (client-side hydration)
    const emailInput = page.locator('#email')
    await emailInput.waitFor({ state: 'visible', timeout: 15000 })
    
    // Login as super admin - use actual test user from DB
    await emailInput.fill('admin@ai367bar.com')
    await page.locator('#password').fill('password123')
    await page.locator('button[type="submit"]').click()
    
    // Wait for redirect to super-admin (with longer timeout)
    await page.waitForURL(/\/super-admin/, { timeout: 20000 })
    
    // Navigate to Security tab
    await page.getByRole('tab', { name: /Security/i }).click()
    // Wait for security content to load
    await page.waitForTimeout(2000)
  })

  test('should display security overview metrics', async ({ page }) => {
    // Wait for security content to load - check for sub-tabs
    await expect(page.getByRole('tab', { name: 'Recent Events' })).toBeVisible({ timeout: 15000 })
    await expect(page.getByRole('tab', { name: 'Failed Logins' })).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('tab', { name: 'Active Sessions' })).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('tab', { name: 'Suspicious Activity' })).toBeVisible({ timeout: 5000 })
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

  test('should handle unauthorized access gracefully', async ({ page, context }) => {
    // Clear all cookies to simulate logged out state
    await context.clearCookies()
    
    // Try to access security monitoring endpoint directly without auth
    const response = await page.request.post('/api/admin/security-monitoring/resolve', {
      data: { id: 'test-event-id' }
    })
    
    // Should return 401 Unauthorized
    expect(response.status()).toBe(401)
  })
})
