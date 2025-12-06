import { type Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    console.log('Navigating to login page...');
    
    try {
      // Navigate to login page with a longer timeout
      await this.page.goto('/th/auth/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      console.log('Login page navigation completed, waiting for form elements...');
      
      // Wait for page to be fully loaded - check for multiple possible indicators
      await Promise.race([
        // Wait for the main form elements
        this.page.waitForSelector('form', { state: 'visible', timeout: 10000 }),
        // Wait for email input
        this.page.waitForSelector('#email', { state: 'visible', timeout: 10000 }),
        // Wait for password input
        this.page.waitForSelector('#password', { state: 'visible', timeout: 10000 }),
        // Wait for submit button
        this.page.waitForSelector('button[type="submit"]', { state: 'visible', timeout: 10000 }),
        // Wait for specific card content
        this.page.waitForSelector('.card-content, [data-testid="login-form"]', { state: 'visible', timeout: 10000 })
      ]);
      
      // Additional wait for any animations or dynamic content to settle
      await this.page.waitForTimeout(2000);
      
      console.log('Login form elements are now visible');
      await this.page.screenshot({ path: 'login-form-loaded.png', fullPage: true });
      
    } catch (error) {
      console.error('Error in goto() - Current URL:', this.page.url());
      console.error('Page title:', await this.page.title());
      await this.page.screenshot({ path: 'login-page-error.png', fullPage: true });
      
      // Check if we're already on the dashboard
      if (this.page.url().includes('/dashboard') || this.page.url().includes('/admin')) {
        console.log('Already logged in and redirected to dashboard');
        return;
      }
      
      console.error('Error loading login page:', error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    console.log(`Attempting to login with email: ${email}`);
    
    try {
      // First check if we're already on the dashboard
      if (this.page.url().includes('/dashboard')) {
        console.log('Already logged in, skipping login');
        return;
      }
      
      // Wait for form to be ready with flexible selectors
      const formSelector = 'form, [data-testid="login-form"]';
      console.log(`Waiting for form with selector: ${formSelector}`);
      
      try {
        await this.page.waitForSelector(formSelector, { 
          state: 'visible', 
          timeout: 20000 
        });
      } catch (error) {
        console.error('Form not found, current page content:', await this.page.content());
        await this.page.screenshot({ path: 'form-not-found.png', fullPage: true });
        throw error;
      }
      
      // Take a screenshot before login attempt
      await this.page.screenshot({ path: 'before-login.png', fullPage: true });
      
      // Fill email
      console.log('Filling email...');
      const emailInput = this.page.locator('input[type="email"], #email, [name="email"]').first();
      await emailInput.waitFor({ state: 'visible', timeout: 10000 });
      await emailInput.fill(email);
      
      // Fill password
      console.log('Filling password...');
      const passwordInput = this.page.locator('input[type="password"], #password, [name="password"]').first();
      await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
      await passwordInput.fill(password);
      
      // Find and click the submit button
      console.log('Submitting login form...');
      const loginButton = this.page.locator(
        'button[type="submit"], button:has-text("เข้าสู่ระบบ"), button:has-text("Sign In")'
      ).first();
      
      await loginButton.waitFor({ state: 'visible', timeout: 10000 });
      
      // Click and wait for navigation
      const navigationPromise = this.page.waitForNavigation({ 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      await loginButton.click();
      console.log('Login button clicked, waiting for navigation...');
      
      // Wait for navigation to complete
      try {
        await navigationPromise;
        console.log('Navigation complete, current URL:', this.page.url());
      } catch (error) {
        console.warn('Navigation timeout, but continuing...');
      }
      
      // Check if we're on the dashboard or if we need to handle MFA/2FA
      const maxRetries = 3;
      let retries = 0;
      
      while (retries < maxRetries) {
        // Check for dashboard elements
        const isDashboard = await Promise.race([
          this.page.waitForURL('**/dashboard', { timeout: 10000 }).then(() => true).catch(() => false),
          this.page.waitForURL('**/admin', { timeout: 10000 }).then(() => true).catch(() => false),
          this.page.waitForSelector('h1:has-text("Dashboard"), [data-testid="dashboard"]', { 
            state: 'visible', 
            timeout: 10000 
          }).then(() => true).catch(() => false)
        ]);
        
        if (isDashboard) {
          console.log('Successfully logged in and redirected to dashboard/admin');
          break;
        }
        
        // Check for MFA/2FA prompt
        const mfaPrompt = await this.page.locator('input[type="text"][name*="code"], #mfaCode, #totpCode').isVisible().catch(() => false);
        if (mfaPrompt) {
          console.log('MFA/2FA prompt detected - test environment may not support this');
          await this.page.screenshot({ path: 'mfa-prompt.png', fullPage: true });
          throw new Error('MFA/2FA not supported in test environment');
        }
        
        // Check for error messages with multiple selectors
        const errorSelectors = [
          '[role="alert"]',
          '.text-destructive',
          '.error-message',
          '.alert-error',
          '.alert',
          'text=/Invalid|กรุณา|ผิดพลาด|error|Error/i'
        ];
        
        let errorFound = false;
        let errorMessage = '';
        
        for (const selector of errorSelectors) {
          try {
            const errorElement = this.page.locator(selector).first();
            const isVisible = await errorElement.isVisible();
            if (isVisible) {
              errorMessage = (await errorElement.textContent()) ?? ''
              console.log(`Found error message: "${errorMessage}"`);
              errorFound = true;
              break;
            }
          } catch (error) {
            // Continue to next selector
          }
        }
        
        if (errorFound) {
          await this.page.screenshot({ path: 'login-error.png', fullPage: true });
          throw new Error(`Login failed with error: ${errorMessage}`);
        }
        
        // Check if we're still on login page (no redirect happened)
        const stillOnLogin = this.page.url().includes('/auth/login');
        if (stillOnLogin && retries === maxRetries - 1) {
          console.log('Still on login page after multiple attempts');
          await this.page.screenshot({ path: 'still-on-login.png', fullPage: true });
          throw new Error('Login did not redirect - possibly invalid credentials or form submission failed');
        }
        
        retries++;
        console.log(`Login attempt ${retries}/${maxRetries} - waiting for redirect...`);
        await this.page.waitForTimeout(2000);
      }
      
      if (retries >= maxRetries) {
        throw new Error('Failed to confirm login after multiple attempts');
      }
      
      // Final check to ensure we're logged in
      await this.page.waitForLoadState('networkidle');
      console.log('Login flow completed successfully');
      
      // Take a screenshot after successful login
      await this.page.screenshot({ path: 'after-login-success.png', fullPage: true });
      
    } catch (error) {
      console.error('Error during login process:', error);
      console.log('Current URL:', this.page.url());
      console.log('Page title:', await this.page.title());
      console.log('Page content (first 1000 chars):', (await this.page.content()).substring(0, 1000));
      
      await this.page.screenshot({ path: 'login-error.png', fullPage: true });
      throw error;
    }
  }
}
