import { test, expect } from '@playwright/test'

/**
 * Comprehensive Payment E2E Tests
 * ทดสอบการชำระเงินแบบจริง
 */

test.describe('Payment Flow - Full Pipeline', () => {
  test.beforeEach(async ({ page }) => {
    // Login with test user
    await page.goto('/th/auth/login')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForSelector('input#email', { timeout: 5000 })
    await page.waitForTimeout(5000) // Allow time for hydration
    await page.fill('input#email', 'demo@clinic.com')
    await page.fill('input#password', 'demo123')
    await page.click('button[type="submit"]')
    
    // Wait for login to complete
    await page.waitForURL('**/th', { timeout: 30000 })
    await page.waitForLoadState('networkidle')
  })

  test('should complete full payment flow', async ({ page }) => {
    // 1. Go to pricing
    await page.goto('/th/pricing')
    await page.waitForLoadState('networkidle')
    
    // 2. Select Professional plan
    const professionalPlan = page.locator('.plan-card:has-text("Professional")')
    await expect(professionalPlan).toBeVisible()
    await professionalPlan.click()
    
    // 3. Wait for payment options
    await page.waitForSelector('.payment-options', { timeout: 5000 })
    await expect(page.locator('.payment-options')).toBeVisible()
    
    // 4. Select PromptPay
    const promptpayOption = page.locator('button:has-text("พร้อมเพย์")')
    await expect(promptpayOption).toBeVisible()
    await promptpayOption.click()
    
    // 5. Generate QR code
    await page.waitForSelector('.qr-code', { timeout: 10000 })
    await expect(page.locator('.qr-code')).toBeVisible()
    
    // 6. Check payment details
    await expect(page.locator('text=฿2,900')).toBeVisible()
    await expect(page.locator('text=Professional')).toBeVisible()
    
    // 7. Show payment instructions
    const instructions = page.locator('.payment-instructions')
    await expect(instructions).toBeVisible()
    await expect(instructions).toContainText('สแกน QR')
    
    // 8. Simulate payment (in test mode)
    // Look for test payment button
    const testPayButton = page.locator('button:has-text("จ่ายเทส"), button[data-testid="test-payment"]')
    if (await testPayButton.isVisible()) {
      await testPayButton.click()
      
      // 9. Wait for payment processing
      await page.waitForSelector('.payment-processing', { timeout: 5000 })
      
      // 10. Wait for success
      await page.waitForFunction(() => {
        return document.body.textContent?.includes('ชำระเงินสำเร็จ') ||
               document.querySelector('.payment-success')
      }, { timeout: 30000 })
      
      // 11. Redirect to confirmation
      await expect(page).toHaveURL('**/payment/confirmation**')
      
      // 12. Verify confirmation page
      await expect(page.locator('h1')).toContainText('การชำระเงินสำเร็จ')
      await expect(page.locator('.payment-details')).toBeVisible()
      
      // 13. Check receipt
      const receiptNumber = page.locator('.receipt-number, .transaction-id')
      await expect(receiptNumber).toBeVisible()
      await expect(receiptNumber).toHaveText(/PAY-\d{4}-\d{3}/)
      
      // 14. Download receipt
      const downloadButton = page.locator('button:has-text("ดาวน์โหลดใบเสร็จ")')
      if (await downloadButton.isVisible()) {
        const downloadPromise = page.waitForEvent('download')
        await downloadButton.click()
        const download = await downloadPromise
        expect(download.suggestedFilename()).toContain('receipt')
      }
      
      // 15. Check user plan updated
      await page.goto('/th/dashboard')
      await page.waitForLoadState('networkidle')
      
      const planBadge = page.locator('.plan-badge, .subscription-plan')
      if (await planBadge.isVisible()) {
        await expect(planBadge).toContainText('Professional')
      }
    }
  })

  test('should handle payment timeout', async ({ page }) => {
    // Mock slow payment
    await page.route('**/api/payment/verify', route => {
      // Don't respond to simulate timeout
    })
    
    await page.goto('/th/pricing')
    
    // Select plan and proceed to payment
    const professionalPlan = page.locator('.plan-card:has-text("Professional")')
    await professionalPlan.click()
    
    const promptpayOption = page.locator('button:has-text("พร้อมเพย์")')
    await promptpayOption.click()
    
    // Wait for timeout
    await page.waitForSelector('.payment-timeout, .error-message', { timeout: 35000 })
    await expect(page.locator('.payment-timeout')).toContainText('หมดเวลา')
    
    // Should show retry option
    const retryButton = page.locator('button:has-text("ลองใหม่")')
    await expect(retryButton).toBeVisible()
  })

  test('should handle payment failure', async ({ page }) => {
    // Mock payment failure
    await page.route('**/api/payment/verify', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Payment failed' })
      })
    })
    
    await page.goto('/th/pricing')
    
    // Complete payment flow
    const professionalPlan = page.locator('.plan-card:has-text("Professional")')
    await professionalPlan.click()
    
    const promptpayOption = page.locator('button:has-text("พร้อมเพย์")')
    await promptpayOption.click()
    
    // Simulate payment
    const testPayButton = page.locator('button:has-text("จ่ายเทส")')
    if (await testPayButton.isVisible()) {
      await testPayButton.click()
      
      // Should show failure
      await page.waitForSelector('.payment-error', { timeout: 5000 })
      await expect(page.locator('.payment-error')).toContainText('การชำระเงินล้มเหลว')
    }
  })

  test('should validate payment amount', async ({ page }) => {
    await page.goto('/th/pricing')
    
    // Check all plans have correct prices
    const plans = [
      { name: 'Basic', price: '฿990' },
      { name: 'Professional', price: '฿2,900' },
      { name: 'Enterprise', price: '฿9,900' }
    ]
    
    for (const plan of plans) {
      const planCard = page.locator(`.plan-card:has-text("${plan.name}")`)
      await expect(planCard.locator(`text=${plan.price}`)).toBeVisible()
    }
  })

  test('should handle multiple payment attempts', async ({ page }) => {
    await page.goto('/th/pricing')
    
    // Start payment
    const professionalPlan = page.locator('.plan-card:has-text("Professional")')
    await professionalPlan.click()
    
    const promptpayOption = page.locator('button:has-text("พร้อมเพย์")')
    await promptpayOption.click()
    
    // Cancel and restart
    const cancelButton = page.locator('button:has-text("ยกเลิก")')
    if (await cancelButton.isVisible()) {
      await cancelButton.click()
      
      // Should return to pricing
      await expect(page).toHaveURL('**/pricing')
      
      // Can start again
      await professionalPlan.click()
      await promptpayOption.click()
      await expect(page.locator('.qr-code')).toBeVisible()
    }
  })
})
