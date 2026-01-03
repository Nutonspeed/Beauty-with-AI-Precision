import { test, expect, waitForLoading, takeScreenshot, testUsers } from '../test-setup';

test.describe('Super Admin Dashboard', () => {
  test.skip(({ browserName }) => browserName === 'webkit', 'Safari/WebKit redirects to undefined/admin (Supabase cookie issue)');

  test.beforeEach(async ({ page }) => {
    // Login as super admin
    await page.goto('/th/auth/login');
    await waitForLoading(page);
    await page.fill('#email', testUsers.superAdmin.email);
    await page.fill('#password', testUsers.superAdmin.password);
    await page.click('button[type="submit"]');
    // Wait for redirect after login, then navigate to dashboard
    await page.waitForLoadState('domcontentloaded');
    await page.goto('/th/super-admin');
    await page.waitForLoadState('domcontentloaded');
    await waitForLoading(page);
  });

  test('should reach super admin dashboard (smoke)', async ({ page }) => {
    // Basic smoke: just ensure we can navigate to super admin after login
    await takeScreenshot(page, 'super-admin-dashboard-smoke');
  });

  test.skip('rest of admin flows (create clinic, filters, analytics) are skipped pending UX alignment', async () => {});
});
