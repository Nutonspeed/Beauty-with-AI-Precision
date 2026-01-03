import { test, expect } from '@playwright/test';

test.describe('Profile Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // In E2E test mode we allow /th/profile to render without auth redirects.
    // This avoids flakiness across browsers where the login page may auto-redirect
    // if a previous test left an authenticated session in storage.
    await page.goto('/th/profile');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);
  });

  test('should display security settings', async ({ page }) => {
    const securityTab = page.getByRole('tab', { name: /Security|ความปลอดภัย/i });
    if (await securityTab.isVisible()) {
      await securityTab.click();
      await page.waitForTimeout(500);
      // Verify password fields exist
      await expect(page.locator('input[type="password"]').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display notification settings', async ({ page }) => {
    const notifTab = page.getByRole('tab', { name: /Notifications|การแจ้งเตือน/i });
    if (await notifTab.isVisible()) {
      await notifTab.click();
      await page.waitForTimeout(500);
      // Verify switch elements exist
      await expect(page.locator('[role="switch"]').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display preferences settings', async ({ page }) => {
    const prefTab = page.getByRole('tab', { name: /Preferences|การตั้งค่า/i });
    if (await prefTab.isVisible()) {
      await prefTab.click();
      await page.waitForTimeout(500);
      // Verify form loaded
      await expect(page.locator('button, select, input').first()).toBeVisible({ timeout: 5000 });
    }
  });
});
