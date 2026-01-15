const { test, expect } = require('@playwright/test');

test.describe('Login Debug Tests', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('Debug login process with console logs', async ({ page }) => {
    console.log('🧪 Debugging login process...');
    
    // Listen for all console messages
    const allConsoleMessages = [];
    page.on('console', msg => {
      allConsoleMessages.push(msg.text());
      console.log('📋 Console:', msg.text());
    });
    
    // Listen for network requests
    const networkRequests = [];
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method()
      });
      if (request.url().includes('auth') || request.url().includes('login')) {
        console.log('🌐 Request:', request.method(), request.url());
      }
    });
    
    // Listen for network responses
    const networkResponses = [];
    page.on('response', response => {
      networkResponses.push({
        url: response.url(),
        status: response.status()
      });
      if (response.url().includes('auth') || response.url().includes('login')) {
        console.log('📡 Response:', response.status(), response.url());
      }
    });
    
    // Go to login page
    await page.goto('http://localhost:3004/auth/login', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot before login
    await page.screenshot({ path: 'test-results/before-login.png' });
    
    // Fill login form
    await page.fill('input[type="email"]', 'admin@ai367bar.com');
    await page.fill('input[type="password"]', 'Admin123!');
    
    // Wait a bit to see if form is filled
    await page.waitForTimeout(1000);
    
    // Take screenshot after filling form
    await page.screenshot({ path: 'test-results/form-filled.png' });
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Wait for any network activity
    await page.waitForTimeout(5000);
    
    // Take screenshot after submit
    await page.screenshot({ path: 'test-results/after-submit.png' });
    
    // Check final URL
    const finalUrl = page.url();
    console.log('Final URL:', finalUrl);
    
    // Check for error messages
    const errorElements = await page.locator('.error, .alert, [role="alert"]').count();
    console.log('Error elements found:', errorElements);
    
    if (errorElements > 0) {
      const errorText = await page.locator('.error, .alert, [role="alert"]').first().textContent();
      console.log('Error text:', errorText);
    }
    
    // Check for loading states
    const loadingElements = await page.locator('.loading, [disabled], .spinner').count();
    console.log('Loading elements found:', loadingElements);
    
    // Summary
    console.log('=== DEBUG SUMMARY ===');
    console.log('Total console messages:', allConsoleMessages.length);
    console.log('Total network requests:', networkRequests.length);
    console.log('Total network responses:', networkResponses.length);
    
    // Look for auth-related requests
    const authRequests = networkRequests.filter(req => 
      req.url.includes('auth') || req.url.includes('login') || req.url.includes('signin')
    );
    console.log('Auth-related requests:', authRequests);
    
    // Look for error messages in console
    const errorMessages = allConsoleMessages.filter(msg => 
      msg.toLowerCase().includes('error') || 
      msg.toLowerCase().includes('failed') || 
      msg.toLowerCase().includes('exception')
    );
    console.log('Error messages in console:', errorMessages);
    
    console.log('✅ Debug test completed!');
  });

  test('Check if login form elements exist', async ({ page }) => {
    console.log('🧪 Checking login form elements...');
    
    // Go to login page
    await page.goto('http://localhost:3004/auth/login', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for email input
    const emailInputs = await page.locator('input[type="email"]').count();
    console.log('Email inputs found:', emailInputs);
    
    // Check for password input
    const passwordInputs = await page.locator('input[type="password"]').count();
    console.log('Password inputs found:', passwordInputs);
    
    // Check for submit button
    const submitButtons = await page.locator('button[type="submit"]').count();
    console.log('Submit buttons found:', submitButtons);
    
    // Check for any buttons
    const allButtons = await page.locator('button').count();
    console.log('All buttons found:', allButtons);
    
    // Get page content structure
    const pageContent = await page.content();
    console.log('Page has form tag:', pageContent.includes('<form'));
    console.log('Page has input elements:', pageContent.includes('<input'));
    console.log('Page has button elements:', pageContent.includes('<button'));
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/form-elements.png' });
    
    console.log('✅ Form elements check completed!');
  });
});
