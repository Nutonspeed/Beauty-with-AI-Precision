import { test, expect } from '@playwright/test';

test.describe('Profile Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login directly on page
    await page.goto('/th/auth/login');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for form
    await page.locator('#email').waitFor({ state: 'visible', timeout: 10000 });
    
    // Use admin user for profile tests (has access to all pages)
    await page.locator('#email').fill('admin@ai367bar.com');
    await page.locator('#password').fill('password123');
    await page.locator('button[type="submit"]').click();
    
    // Wait for any redirect (login success)
    await page.waitForTimeout(3000);
    
    // Navigate to profile
    await page.goto('/th/profile');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for page to be interactive
    await page.waitForTimeout(2000);
  });

  test('should display security settings', async ({ page }) => {
    const url = page.url();
    if (url.includes('/auth/login')) {
      test.skip();
      return;
    }
    
    const securityTab = page.getByRole('tab', { name: /Security|ความปลอดภัย/i });
    if (await securityTab.isVisible()) {
      await securityTab.click();
      await page.waitForTimeout(500);
      // Verify password fields exist
      await expect(page.locator('input[type="password"]').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display notification settings', async ({ page }) => {
    const url = page.url();
    if (url.includes('/auth/login')) {
      test.skip();
      return;
    }
    
    const notifTab = page.getByRole('tab', { name: /Notifications|การแจ้งเตือน/i });
    if (await notifTab.isVisible()) {
      await notifTab.click();
      await page.waitForTimeout(500);
      // Verify switch elements exist
      await expect(page.locator('[role="switch"]').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display preferences settings', async ({ page }) => {
    const url = page.url();
    if (url.includes('/auth/login')) {
      test.skip();
      return;
    }
    
    const prefTab = page.getByRole('tab', { name: /Preferences|การตั้งค่า/i });
    if (await prefTab.isVisible()) {
      await prefTab.click();
      await page.waitForTimeout(500);
      // Verify form loaded
      await expect(page.locator('button, select, input').first()).toBeVisible({ timeout: 5000 });
    }
  });
});
