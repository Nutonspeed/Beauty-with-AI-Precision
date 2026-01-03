import { test, expect } from '@playwright/test'

/**
 * Payment Flow E2E Tests
 * ทดสอบการชำระเงินและ PromptPay
 */

test.describe('Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Go to pricing page
    await page.goto('/th/pricing')
  })

  test('should display pricing plans', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('ราคา')
    
    // Check for plan cards
    const plans = page.locator('.plan-card')
    await expect(plans.first()).toBeVisible()
  })

  test('should select premium plan', async ({ page }) => {
    const premiumPlan = page.locator('.plan-card:has-text("Professional")')
    await premiumPlan.click()
    
    // Should show payment options
    await expect(page.locator('.payment-options')).toBeVisible()
  })

  test('should show PromptPay QR code', async ({ page }) => {
    const premiumPlan = page.locator('.plan-card:has-text("Professional")')
    await premiumPlan.click()
    
    // Select PromptPay
    const promptpayOption = page.locator('button:has-text("พร้อมเพย์")')
    if (await promptpayOption.isVisible()) {
      await promptpayOption.click()
      
      // Should show QR code
      await expect(page.locator('.qr-code')).toBeVisible({ timeout: 5000 })
    }
  })

  test('should handle payment confirmation', async ({ page }) => {
    // Navigate to payment confirmation page
    await page.goto('/th/payment/confirmation?session=test')
    
    await expect(page.locator('h1')).toContainText('การชำระเงิน')
    await expect(page.locator('.payment-details')).toBeVisible()
  })

  test('should show receipt download option', async ({ page }) => {
    await page.goto('/th/payment/confirmation?session=test')
    
    const downloadButton = page.locator('button:has-text("ดาวน์โหลดใบเสร็จ")')
    if (await downloadButton.isVisible()) {
      // Start download
      const downloadPromise = page.waitForEvent('download')
      await downloadButton.click()
      const download = await downloadPromise
      
      // Verify filename
      expect(download.suggestedFilename()).toContain('receipt')
    }
  })

  test('should handle payment failure', async ({ page }) => {
    await page.goto('/th/payment/failed?reason=timeout')
    
    await expect(page.locator('h1')).toContainText('การชำระเงินไม่สำเร็จ')
    await expect(page.locator('.retry-button')).toBeVisible()
  })
})
