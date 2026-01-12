import { test, waitForLoading, takeScreenshot, testUsers } from '../test-setup';

test.describe('Center Owner Dashboard', () => {
  test.skip(({ browserName }) => browserName === 'webkit', 'Safari/WebKit redirects back to login with Supabase cookies');

  test.beforeEach(async ({ page }) => {
    // Login as center owner
    await page.goto('/th/auth/login');
    await waitForLoading(page);
    await page.fill('#email', testUsers.centerOwner.email);
    await page.fill('#password', testUsers.centerOwner.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('domcontentloaded');
    await page.goto('/th/centers/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await waitForLoading(page);
  });

  test('should reach center owner dashboard (smoke)', async ({ page }) => {
    await takeScreenshot(page, 'center-owner-dashboard-smoke');
  });

  });
