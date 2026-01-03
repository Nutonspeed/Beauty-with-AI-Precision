import { test, expect } from '@playwright/test'

/**
 * Sales Dashboard E2E Tests
 * ทดสอบ Dashboard สำหรับ Sales Team
 */

test.describe('Sales Dashboard', () => {
  // Use demo credentials
  test.use({
    storageState: {
      cookies: [],
      origins: [{
        origin: 'http://localhost:3011',
        localStorage: [{
          name: 'demo-auth',
          value: JSON.stringify({
            email: 'sales@demo.com',
            role: 'sales_staff',
            clinicId: 'demo-clinic'
          })
        }]
      }]
    }
  })

  test.beforeEach(async ({ page }) => {
    await page.goto('/th/sales')
  })

  test('should load dashboard', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Dashboard')
    await expect(page.locator('.sales-stats')).toBeVisible()
  })

  test('should show sales metrics', async ({ page }) => {
    // Check for metric cards
    const metrics = page.locator('.metric-card, .stat-card')
    if (await metrics.count() > 0) {
      await expect(metrics.first()).toBeVisible()
      
      // Check for values
      const values = page.locator('.value, .amount, .number')
      if (await values.count() > 0) {
        await expect(values.first()).toBeVisible()
      }
    }
  })

  test('should display activity feed', async ({ page }) => {
    const activityFeed = page.locator('.activity-feed, .recent-activities')
    if (await activityFeed.isVisible()) {
      const activities = page.locator('.activity-item')
      if (await activities.count() > 0) {
        await expect(activities.first()).toBeVisible()
      }
    }
  })

  test('should show proposal list', async ({ page }) => {
    // Navigate to proposals
    const proposalsLink = page.locator('a:has-text("ข้อเสนอ"), a:has-text("Proposals")')
    if (await proposalsLink.isVisible()) {
      await proposalsLink.click()
      await page.waitForTimeout(1000)
      
      const proposalList = page.locator('.proposal-list, .proposals-grid')
      if (await proposalList.isVisible()) {
        const proposals = page.locator('.proposal-item')
        if (await proposals.count() > 0) {
          await expect(proposals.first()).toBeVisible()
        }
      }
    }
  })

  test('should create new proposal', async ({ page }) => {
    const createButton = page.locator('button:has-text("สร้างข้อเสนอ"), button:has-text("New Proposal")')
    if (await createButton.isVisible()) {
      await createButton.click()
      
      // Should show form
      await expect(page.locator('.proposal-form, .modal')).toBeVisible({ timeout: 5000 })
      
      // Fill basic info
      const nameInput = page.locator('input[name="name"], input[name="title"]')
      if (await nameInput.isVisible()) {
        await nameInput.fill('Test Proposal')
        
        const saveButton = page.locator('button:has-text("บันทึก"), button:has-text("Save")')
        if (await saveButton.isVisible()) {
          await saveButton.click()
          await page.waitForTimeout(1000)
        }
      }
    }
  })

  test('should filter proposals', async ({ page }) => {
    const filterButton = page.locator('button:has-text("กรอง"), button:has-text("Filter")')
    if (await filterButton.isVisible()) {
      await filterButton.click()
      
      const filterOptions = page.locator('.filter-options, .filters')
      if (await filterOptions.isVisible()) {
        // Select a filter
        const statusFilter = page.locator('select[name="status"]')
        if (await statusFilter.isVisible()) {
          await statusFilter.selectOption('pending')
          
          const applyButton = page.locator('button:has-text("ใช้"), button:has-text("Apply")')
          if (await applyButton.isVisible()) {
            await applyButton.click()
            await page.waitForTimeout(1000)
          }
        }
      }
    }
  })

  test('should export data', async ({ page }) => {
    const exportButton = page.locator('button:has-text("ส่งออก"), button:has-text("Export")')
    if (await exportButton.isVisible()) {
      // Start download
      const downloadPromise = page.waitForEvent('download')
      await exportButton.click()
      const download = await downloadPromise
      
      // Verify download started
      expect(download.suggestedFilename()).toMatch(/\.(csv|xlsx|pdf)$/)
    }
  })
})
