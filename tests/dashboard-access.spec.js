const { test, expect } = require('@playwright/test');

test.describe('Dashboard Access Tests', () => {
  test.beforeEach(async ({ context }) => {
    // Clear cookies and localStorage before each test
    await context.clearCookies();
    // Note: localStorage clearing removed due to security restrictions
  });

  test('Super Admin login and redirect to /super-admin', async ({ page }) => {
    console.log('🧪 Testing Super Admin login...');
    
    // Go to homepage with longer timeout
    await page.goto('http://localhost:3004', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click login button
    await page.click('text=Login');
    
    // Wait for login page
    await page.waitForURL('**/auth/login', { timeout: 10000 });
    
    // Fill login form
    await page.fill('input[type="email"]', 'admin@ai367bar.com');
    await page.fill('input[type="password"]', 'Admin123!');
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Wait for redirect (max 10 seconds)
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Check final URL
    const currentUrl = page.url();
    console.log('Final URL after login:', currentUrl);
    
    // Should redirect to /super-admin or /th/super-admin
    expect(currentUrl).toMatch(/\/super-admin$/);
    
    // Check if page loaded successfully (not 404)
    const pageTitle = await page.title();
    console.log('Page title:', pageTitle);
    expect(pageTitle).not.toContain('404');
    
    // Take screenshot for verification
    await page.screenshot({ path: 'test-results/super-admin-dashboard.png' });
    
    console.log('✅ Super Admin test passed!');
  });

  test('Clinic Owner login and redirect to /center/dashboard', async ({ page }) => {
    console.log('🧪 Testing Clinic Owner login...');
    
    // Go to homepage with longer timeout
    await page.goto('http://localhost:3004', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click login button
    await page.click('text=Login');
    
    // Wait for login page
    await page.waitForURL('**/auth/login', { timeout: 10000 });
    
    // Fill login form
    await page.fill('input[type="email"]', 'clinic-owner@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Wait for redirect (max 10 seconds)
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Check final URL
    const currentUrl = page.url();
    console.log('Final URL after login:', currentUrl);
    
    // Should redirect to /center/dashboard or /th/center/dashboard
    expect(currentUrl).toMatch(/\/center\/dashboard$/);
    
    // Check if page loaded successfully (not 404)
    const pageTitle = await page.title();
    console.log('Page title:', pageTitle);
    expect(pageTitle).not.toContain('404');
    
    // Take screenshot for verification
    await page.screenshot({ path: 'test-results/clinic-owner-dashboard.png' });
    
    console.log('✅ Clinic Owner test passed!');
  });

  test('Sales Staff login and redirect to /sales/dashboard', async ({ page }) => {
    console.log('🧪 Testing Sales Staff login...');
    
    // Go to homepage with longer timeout
    await page.goto('http://localhost:3004', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click login button
    await page.click('text=Login');
    
    // Wait for login page
    await page.waitForURL('**/auth/login', { timeout: 10000 });
    
    // Fill login form
    await page.fill('input[type="email"]', 'sales@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Wait for redirect (max 10 seconds)
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Check final URL
    const currentUrl = page.url();
    console.log('Final URL after login:', currentUrl);
    
    // Should redirect to /sales/dashboard or /th/sales/dashboard
    expect(currentUrl).toMatch(/\/sales\/dashboard$/);
    
    // Check if page loaded successfully (not 404)
    const pageTitle = await page.title();
    console.log('Page title:', pageTitle);
    expect(pageTitle).not.toContain('404');
    
    // Take screenshot for verification
    await page.screenshot({ path: 'test-results/sales-staff-dashboard.png' });
    
    console.log('✅ Sales Staff test passed!');
  });

  test('Customer login and redirect to /dashboard', async ({ page }) => {
    console.log('🧪 Testing Customer login...');
    
    // Go to homepage with longer timeout
    await page.goto('http://localhost:3004', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click login button
    await page.click('text=Login');
    
    // Wait for login page
    await page.waitForURL('**/auth/login', { timeout: 10000 });
    
    // Fill login form
    await page.fill('input[type="email"]', 'customer@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Wait for redirect (max 10 seconds)
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Check final URL
    const currentUrl = page.url();
    console.log('Final URL after login:', currentUrl);
    
    // Should redirect to /dashboard or /th/dashboard
    expect(currentUrl).toMatch(/\/dashboard$/);
    
    // Check if page loaded successfully (not 404)
    const pageTitle = await page.title();
    console.log('Page title:', pageTitle);
    expect(pageTitle).not.toContain('404');
    
    // Take screenshot for verification
    await page.screenshot({ path: 'test-results/customer-dashboard.png' });
    
    console.log('✅ Customer test passed!');
  });

  test('Debug: Check console logs for middleware debug info', async ({ page }) => {
    console.log('🧪 Testing with console logging...');
    
    // Listen for console messages
    const consoleMessages = [];
    page.on('console', msg => {
      if (msg.text().includes('MIDDLEWARE DEBUG')) {
        consoleMessages.push(msg.text());
        console.log('📋 Console Debug:', msg.text());
      }
    });
    
    // Go to homepage with longer timeout
    await page.goto('http://localhost:3004', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click login button
    await page.click('text=Login');
    
    // Wait for login page
    await page.waitForURL('**/auth/login', { timeout: 10000 });
    
    // Fill login form
    await page.fill('input[type="email"]', 'admin@ai367bar.com');
    await page.fill('input[type="password"]', 'Admin123!');
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Wait a bit for console logs
    await page.waitForTimeout(3000);
    
    // Check if we got debug logs
    expect(consoleMessages.length).toBeGreaterThan(0);
    console.log(`📊 Total debug messages: ${consoleMessages.length}`);
    
    // Look for specific debug patterns
    const hasUserId = consoleMessages.some(msg => msg.includes('User ID:'));
    const hasUserRole = consoleMessages.some(msg => msg.includes('User Profile:'));
    const hasRolePath = consoleMessages.some(msg => msg.includes('Role Dashboard Path:'));
    
    console.log('🔍 Debug checks:');
    console.log('- Has User ID:', hasUserId);
    console.log('- Has User Role:', hasUserRole);
    console.log('- Has Role Path:', hasRolePath);
    
    expect(hasUserId).toBeTruthy();
    expect(hasUserRole).toBeTruthy();
    expect(hasRolePath).toBeTruthy();
    
    console.log('✅ Console logging test passed!');
  });
});
