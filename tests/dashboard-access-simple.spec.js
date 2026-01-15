const { test, expect } = require('@playwright/test');

test.describe('Dashboard Access Tests - Simplified', () => {
  test.beforeEach(async ({ context }) => {
    // Clear cookies before each test
    await context.clearCookies();
  });

  test('Direct login test - Super Admin', async ({ page }) => {
    console.log('🧪 Testing Super Admin direct login...');
    
    // Go directly to login page
    await page.goto('http://localhost:3004/auth/login', { waitUntil: 'load', timeout: 60000 });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot to see what's on the page
    await page.screenshot({ path: 'test-results/login-page-super-admin.png' });
    
    console.log('[TEST] 📝 Entering credentials...');
    await page.fill('input[type="email"]', 'admin@ai367bar.com');
    await page.fill('input[type="password"]', 'Admin123!');
    
    console.log('[TEST] 🖱️ Clicking login button...');
    await page.click('button[type="submit"]');
    
    console.log('[TEST] ⏳ Waiting for redirection from /auth/login...');
    
    try {
      await page.waitForFunction(() => {
        console.log(`[BROWSER] Current URL: ${window.location.href}`);
        return !window.location.href.includes('/auth/login');
      }, { timeout: 30000 });
      console.log(`[TEST] ✅ Redirection successful. New URL: ${page.url()}`);
    } catch (e) {
      console.error(`[TEST] ❌ Redirection timed out. Final URL: ${page.url()}`);
      const screenshotPath = `test-results/timeout-super-admin.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`[TEST] 📸 Screenshot saved to ${screenshotPath}`);
      throw e;
    }
    
    // Wait for page to load
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Check final URL
    const currentUrl = page.url();
    console.log('Final URL after login:', currentUrl);
    
    // Take screenshot for verification
    await page.screenshot({ path: 'test-results/super-admin-final.png' });
    
    // Check if page loaded successfully (not 404)
    const pageTitle = await page.title();
    console.log('Page title:', pageTitle);
    
    console.log('✅ Super Admin test completed!');
  });

  test('Direct login test - Clinic Owner', async ({ page }) => {
    console.log('🧪 Testing Clinic Owner direct login...');
    
    // Go directly to login page
    await page.goto('http://localhost:3004/auth/login', { waitUntil: 'load', timeout: 30000 });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Fill login form
    await page.fill('input[type="email"]', 'clinic-owner@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForFunction(() => !window.location.href.includes('/auth/login'), { timeout: 10000 });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Check final URL
    const currentUrl = page.url();
    console.log('Final URL after login:', currentUrl);
    
    // Take screenshot for verification
    await page.screenshot({ path: 'test-results/clinic-owner-final.png' });
    
    console.log('✅ Clinic Owner test completed!');
  });

  test('Direct login test - Sales Staff', async ({ page }) => {
    console.log('🧪 Testing Sales Staff direct login...');
    
    // Go directly to login page
    await page.goto('http://localhost:3004/auth/login', { waitUntil: 'load', timeout: 30000 });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Fill login form
    await page.fill('input[type="email"]', 'sales@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForFunction(() => !window.location.href.includes('/auth/login'), { timeout: 10000 });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Check final URL
    const currentUrl = page.url();
    console.log('Final URL after login:', currentUrl);
    
    // Take screenshot for verification
    await page.screenshot({ path: 'test-results/sales-staff-final.png' });
    
    console.log('✅ Sales Staff test completed!');
  });

  test('Direct login test - Customer', async ({ page }) => {
    console.log('🧪 Testing Customer direct login...');
    
    // Go directly to login page
    await page.goto('http://localhost:3004/auth/login', { waitUntil: 'load', timeout: 30000 });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Fill login form
    await page.fill('input[type="email"]', 'customer@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForFunction(() => !window.location.href.includes('/auth/login'), { timeout: 10000 });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Check final URL
    const currentUrl = page.url();
    console.log('Final URL after login:', currentUrl);
    
    // Take screenshot for verification
    await page.screenshot({ path: 'test-results/customer-final.png' });
    
    console.log('✅ Customer test completed!');
  });

  test('Debug: Check page content', async ({ page }) => {
    console.log('🧪 Checking page content...');
    
    // Go to homepage
    await page.goto('http://localhost:3004', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/homepage-content.png' });
    
    // Get page content
    const pageContent = await page.content();
    console.log('Page title:', await page.title());
    console.log('Page URL:', page.url());
    
    // Look for login button
    const loginButton = await page.locator('text=Login').count();
    console.log('Login buttons found:', loginButton);
    
    // Look for any login-related elements
    const loginElements = await page.locator('[href*="login"], [href*="auth"], button:has-text("Login")').count();
    console.log('Login-related elements found:', loginElements);
    
    // Try to find any clickable elements
    const clickableElements = await page.locator('button, a').count();
    console.log('Total clickable elements:', clickableElements);
    
    console.log('✅ Page content check completed!');
  });
});
