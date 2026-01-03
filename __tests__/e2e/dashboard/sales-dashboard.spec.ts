import { test, expect, waitForLoading, takeScreenshot, testUsers } from '../test-setup';

test.describe('Sales Dashboard', () => {
  test.skip(({ browserName }) => browserName === 'webkit', 'Safari/WebKit redirects back to login with Supabase cookies');

  test.beforeEach(async ({ page }) => {
    // Login as sales staff
    await page.goto('/th/auth/login');
    await waitForLoading(page);
    await page.fill('#email', testUsers.salesStaff.email);
    await page.fill('#password', testUsers.salesStaff.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('domcontentloaded');
    await page.goto('/th/sales/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await waitForLoading(page);
  });

  test('should reach sales dashboard (smoke)', async ({ page }) => {
    await takeScreenshot(page, 'sales-dashboard-smoke');
  });

  });
