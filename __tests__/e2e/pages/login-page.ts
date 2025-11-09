import { type Page, type Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel(/Email|อีเมล/i).first();
    this.passwordInput = page.getByLabel(/Password|รหัสผ่าน/i).first();
    this.loginButton = page.getByRole('button', { name: /เข้าสู่ระบบ|Sign In/i });
    this.heading = this.page.locator('[data-slot="card-title"]').getByText(/เข้าสู่ระบบ|Sign In/i);
  }

  async goto() {
    await this.page.goto('/auth/login');
    await expect(this.heading).toBeVisible();
  }

  async login(email: string, password_str: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password_str);
    await Promise.all([
      this.page.waitForURL(/\/(analysis|clinic\/dashboard|sales\/dashboard)/, { timeout: 20000 }).catch(() => undefined),
      this.loginButton.click(),
    ]);
  }
}
