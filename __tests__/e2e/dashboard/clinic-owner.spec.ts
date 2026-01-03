import { test, expect, waitForLoading, takeScreenshot, testUsers } from '../test-setup';

test.describe('Clinic Owner Dashboard', () => {
  test.skip(({ browserName }) => browserName === 'webkit', 'Safari/WebKit redirects back to login with Supabase cookies');

  test.beforeEach(async ({ page }) => {
    // Login as clinic owner
    await page.goto('/th/auth/login');
    await waitForLoading(page);
    await page.fill('#email', testUsers.clinicOwner.email);
    await page.fill('#password', testUsers.clinicOwner.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('domcontentloaded');
    await page.goto('/th/clinic/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await waitForLoading(page);
  });

  test('should reach clinic owner dashboard (smoke)', async ({ page }) => {
    await takeScreenshot(page, 'clinic-owner-dashboard-smoke');
  });

  });
