const { test, expect } = require('@playwright/test');

test.describe('Login Component Debug', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('Debug login component behavior', async ({ page }) => {
    console.log('🧪 Debugging login component...');
    
    // Listen for console messages
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push(msg.text());
      if (msg.text().includes('LoginPage') || msg.text().includes('🔐') || msg.text().includes('✅') || msg.text().includes('❌')) {
        console.log('📋 Login Debug:', msg.text());
      }
    });
    
    // Go to login page
    await page.goto('http://localhost:3004/auth/login', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Fill login form
    await page.fill('input[type="email"]', 'admin@ai367bar.com');
    await page.fill('input[type="password"]', 'Admin123!');
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Wait for login process (longer timeout)
    await page.waitForTimeout(10000);
    
    // Check final URL
    const finalUrl = page.url();
    console.log('Final URL:', finalUrl);
    
    // Check for error messages
    const errorElements = await page.locator('.error, .alert, [role="alert"]').count();
    if (errorElements > 0) {
      const errorText = await page.locator('.error, .alert, [role="alert"]').first().textContent();
      console.log('Error text:', errorText);
    }
    
    // Check if still on login page
    const isStillOnLoginPage = finalUrl.includes('/auth/login');
    console.log('Still on login page:', isStillOnLoginPage);
    
    // Check for loading states
    const loadingElements = await page.locator('.loading, [disabled], .spinner').count();
    console.log('Loading elements found:', loadingElements);
    
    // Look for specific login console messages
    const loginMessages = consoleMessages.filter(msg => 
      msg.includes('LoginPage') || 
      msg.includes('🔐') || 
      msg.includes('✅') || 
      msg.includes('❌')
    );
    
    console.log('=== LOGIN CONSOLE MESSAGES ===');
    loginMessages.forEach(msg => console.log(msg));
    
    // Check if login was successful
    const loginSuccess = consoleMessages.some(msg => msg.includes('✅ Login successful'));
    const loginError = consoleMessages.some(msg => msg.includes('❌ Login error'));
    const userDetected = consoleMessages.some(msg => msg.includes('User detected'));
    
    console.log('=== LOGIN STATUS ===');
    console.log('Login successful:', loginSuccess);
    console.log('Login error:', loginError);
    console.log('User detected:', userDetected);
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/login-component-debug.png' });
    
    console.log('✅ Login component debug completed!');
  });

  test('Check if auth context is working', async ({ page }) => {
    console.log('🧪 Testing auth context...');
    
    // Listen for console messages
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push(msg.text());
      if (msg.text().includes('Auth') || msg.text().includes('User')) {
        console.log('📋 Auth Debug:', msg.text());
      }
    });
    
    // Go to login page
    await page.goto('http://localhost:3004/auth/login', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if auth context is initialized
    await page.waitForTimeout(2000);
    
    // Fill login form
    await page.fill('input[type="email"]', 'admin@ai367bar.com');
    await page.fill('input[type="password"]', 'Admin123!');
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Wait for auth context to update
    await page.waitForTimeout(5000);
    
    // Check final URL
    const finalUrl = page.url();
    console.log('Final URL after auth context wait:', finalUrl);
    
    // Look for auth-related console messages
    const authMessages = consoleMessages.filter(msg => 
      msg.includes('Auth') || 
      msg.includes('User') || 
      msg.includes('context')
    );
    
    console.log('=== AUTH CONTEXT MESSAGES ===');
    authMessages.forEach(msg => console.log(msg));
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/auth-context-debug.png' });
    
    console.log('✅ Auth context debug completed!');
  });
});
