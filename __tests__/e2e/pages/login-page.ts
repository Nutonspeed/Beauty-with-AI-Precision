import { type Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/th/auth/login');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async login(email: string, password_str: string) {
    // Wait for form to be ready
    const emailInput = this.page.locator('#email');
    await emailInput.waitFor({ state: 'visible', timeout: 15000 });
    
    const passwordInput = this.page.locator('#password');
    const loginButton = this.page.locator('button[type="submit"]');
    
    // Fill form
    await emailInput.fill(email);
    await passwordInput.fill(password_str);
    
    // Click login
    await loginButton.click();
    
    // Wait for redirect
    await this.page.waitForURL(/\/(analysis|clinic|sales|super-admin|dashboard|customer)/, { timeout: 20000 });
  }
}
