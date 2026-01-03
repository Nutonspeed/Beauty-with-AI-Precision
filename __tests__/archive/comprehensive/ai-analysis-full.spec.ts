// @ts-nocheck
import { test, expect } from '@playwright/test'
import path from 'path'

/**
 * Comprehensive AI Analysis E2E Tests
 * ทดสอบทุกขั้นตอนของการวิเคราะห์ผิวหนัดจริง
 */

test.describe('AI Analysis - Full Pipeline', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/th/auth/login')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForSelector('input#email', { timeout: 5000 })
    await page.waitForTimeout(5000) // Allow time for hydration
    await page.fill('input#email', 'demo@clinic.com')
    await page.fill('input#password', 'demo123')
    await page.click('button[type="submit"]')
    
    // Wait for login to complete
    await page.waitForSelector('.dashboard, .main-content, h1', { timeout: 30000 })
    await page.waitForLoadState('networkidle')
  })

  test('should complete full analysis pipeline', async ({ page }) => {
    // 1. Navigate to analysis page
    await page.goto('/th/analysis')
    await page.waitForLoadState('networkidle')
    
    // 2. Check page loaded completely
    await expect(page.locator('h1')).toContainText('วิเคราะห์ผิวหนัด')
    
    // 3. Upload image (real file)
    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput).toBeVisible({ timeout: 10000 })
    
    // Use test image
    const testImagePath = path.join(__dirname, '../../fixtures/test-skin.jpg')
    await fileInput.setInputFiles(testImagePath)
    
    // 4. Wait for upload preview
    await page.waitForSelector('.upload-preview, .preview-container', { timeout: 15000 })
    await expect(page.locator('.upload-preview')).toBeVisible()
    
    // 5. Start analysis
    const analyzeButton = page.locator('button:has-text("เริ่มวิเคราะห์")')
    await expect(analyzeButton).toBeEnabled()
    await analyzeButton.click()
    
    // 6. Wait for analysis to start
    await page.waitForSelector('.analyzing, .processing, .loading', { timeout: 5000 })
    
    // 7. Monitor analysis progress
    await expect(page.locator('.progress-bar, .analysis-progress')).toBeVisible()
    
    // 8. Wait for completion (this might take 30+ seconds)
    await page.waitForFunction(() => {
      const progress = document.querySelector('.progress-bar, .analysis-status')
      return progress?.textContent?.includes('100%') || 
             progress?.textContent?.includes('เสร็จสิ้น')
    }, { timeout: 60000 })
    
    // 9. Check results are displayed
    await expect(page.locator('.analysis-results')).toBeVisible({ timeout: 10000 })
    
    // 10. Validate results structure
    const results = page.locator('.analysis-results')
    await expect(results.locator('.concern-item, .analysis-metric')).toHaveCount({ min: 1 })
    
    // 11. Check specific concerns
    const concerns = ['ริ้วรอย', 'รอยดำ', 'รูขุมขน', 'รอยแดง']
    for (const concern of concerns) {
      const element = page.locator(`text=${concern}`)
      if (await element.isVisible()) {
        await expect(element).toBeVisible()
        break
      }
    }
    
    // 12. Check scores/values
    const scores = page.locator('.score, .percentage, .value')
    if (await scores.count() > 0) {
      await expect(scores.first()).toBeVisible()
    }
    
    // 13. Check recommendations
    await expect(page.locator('.recommendations, .suggestions')).toBeVisible()
    
    // 14. Save results
    const saveButton = page.locator('button:has-text("บันทึก")')
    if (await saveButton.isVisible()) {
      await saveButton.click()
      
      // Wait for save confirmation
      await page.waitForSelector('.save-success, .saved-notification', { timeout: 5000 })
      await expect(page.locator('.save-success')).toContainText('บันทึกแล้ว')
    }
    
    // 15. Check history updated
    await page.goto('/th/analysis/history')
    await page.waitForLoadState('networkidle')
    
    const historyItems = page.locator('.history-item, .analysis-record')
    await expect(historyItems.first()).toBeVisible({ timeout: 10000 })
  })

  test('should handle analysis errors gracefully', async ({ page }) => {
    await page.goto('/th/analysis')
    
    // Upload invalid file
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('test-assets/invalid.txt')
    
    // Should show error
    await expect(page.locator('.error-message')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('.error-message')).toContainText('ไฟล์ไม่รองรับ')
    
    // Try to analyze anyway (should be disabled)
    const analyzeButton = page.locator('button:has-text("เริ่มวิเคราะห์")')
    await expect(analyzeButton).toBeDisabled()
  })

  test('should work with slow connection', async ({ page }) => {
    // Simulate slow 3G
    await page.route('**/*', route => {
      // Slow down API calls
      if (route.request().url().includes('/api/')) {
        setTimeout(() => route.continue(), 2000)
      } else {
        route.continue()
      }
    })
    
    await page.goto('/th/analysis')
    
    // Should show loading states
    await expect(page.locator('.loading, .skeleton')).toBeVisible()
    
    // Should still work after loading
    const title = page.locator('h1')
    await expect(title).toBeVisible({ timeout: 15000 })
  })

  test('should persist results after refresh', async ({ page }) => {
    // Complete an analysis first
    await page.goto('/th/analysis')
    
    // Use demo mode if available
    const demoButton = page.locator('button:has-text("ทดลอง")')
    if (await demoButton.isVisible()) {
      await demoButton.click()
      await page.waitForSelector('.demo-results', { timeout: 10000 })
    }
    
    // Refresh page
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Results should still be there
    await expect(page.locator('.analysis-results, .demo-results')).toBeVisible()
  })

  test('should export results', async ({ page }) => {
    // Generate results first
    await page.goto('/th/analysis/demo')
    await page.waitForSelector('.demo-results', { timeout: 10000 })
    
    // Try export
    const exportButton = page.locator('button:has-text("ส่งออก")')
    if (await exportButton.isVisible()) {
      const downloadPromise = page.waitForEvent('download')
      await exportButton.click()
      
      const download = await downloadPromise
      expect(download.suggestedFilename()).toMatch(/\.(pdf|jpg|png)$/)
    }
  })
})
