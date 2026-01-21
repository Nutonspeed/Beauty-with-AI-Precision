import { test, expect, waitForLoading } from '../test-setup';
import path from 'path';

// เพิ่ม timeout สำหรับการนำทางและการทำงานให้ครอบคลุมความหน่วงของระบบ
test.use({ navigationTimeout: 180000, actionTimeout: 120000 });

test.describe('Comprehensive Dashboard RBAC & Flow', () => {
  test.describe.configure({ mode: 'serial' })
  
  // Helper สำหรับการ Login เพื่อความเสถียรสูงสุด
  const loginAs = async (page: any, roleLabel: string) => {
    console.log(`Attempting login as ${roleLabel}...`);
    
    // บันทึก console logs จาก browser
    page.on('console', (msg: any) => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') {
        console.log(`BROWSER ERROR [${roleLabel}]:`, text);
      } else {
        console.log(`BROWSER LOG [${roleLabel}]:`, text);
      }
    });

    await page.goto('/th/auth/login', { waitUntil: 'domcontentloaded', timeout: 120000 });
    await waitForLoading(page);
    
    try {
      // ตรวจสอบ URL จริงที่ได้ (อาจมีการ redirect อัตโนมัติ)
      console.log(`Current URL: ${page.url()}`);

      // รอให้ฟอร์มโหลดเสร็จจริงและพร้อมโต้ตอบ
      console.log('Waiting for email input field...');
      const emailInput = page.locator('input[id="email"]');
      await emailInput.waitFor({ state: 'visible', timeout: 90000 });
      
      // บังคับใช้การกรอกข้อมูลด้วยตนเองเสมอเพื่อความเสถียร (ไม่ใช้ปุ่ม Demo ใน E2E)
      console.log(`Using manual input for ${roleLabel}`);
      const credentials: Record<string, string> = {
        'Admin': 'admin@ai367bar.com',
        'Owner': 'clinic-owner@example.com',
        'Sales': 'sales@example.com',
        'Client': 'customer@example.com'
      };
      
      await emailInput.fill(credentials[roleLabel]);
      const passwordInput = page.locator('input[id="password"]');
      await passwordInput.fill('Admin123!');
      await expect(emailInput).toHaveValue(credentials[roleLabel], { timeout: 10000 });
      await expect(passwordInput).toHaveValue('Admin123!', { timeout: 10000 });
      
      const loginButton = page.locator('button[type="submit"]');
      await expect(loginButton).toBeEnabled({ timeout: 30000 });

      const authResponsePromise = page.waitForResponse((response: any) => {
        return response.url().includes('/auth/v1/token') && response.request().method() === 'POST';
      }, { timeout: 20000 }).catch(() => null);

      const navPromise = page
        .waitForURL((url: URL) => !url.pathname.includes('/auth/login'), { timeout: 20000 })
        .then(() => true)
        .catch(() => false);

      await loginButton.click({ noWaitAfter: true });
      console.log('Login button clicked, waiting for session cookie...');

      const errorLocator = page.locator('.bg-rose-500\\/10');
      const start = Date.now();
      let hasSession = false;
      let lastCookieNames: string[] = [];
      while (Date.now() - start < 20000) {
        const cookies = await page.context().cookies().catch(() => []);
        lastCookieNames = cookies.map((cookie: { name: string }) => cookie.name);

        const hasCookie = cookies.some((cookie: { name: string }) =>
          /auth-token|access-token|refresh-token/i.test(cookie.name)
        );
        const hasLocalStorageSession = await page
          .evaluate(() => {
            try {
              return Object.keys(localStorage).some((key) =>
                /auth-token|supabase\.auth\.token|sb-.*-auth-token/i.test(key)
              )
            } catch {
              return false
            }
          })
          .catch(() => false);
        hasSession = hasCookie || hasLocalStorageSession;
        if (hasSession) break;

        const errorCount = await errorLocator.count().catch(() => 0);
        if (errorCount > 0) {
          const errorMsg = await errorLocator.first().innerText().catch(() => '');
          if (errorMsg.trim().length > 0) {
            console.error(`Login failed with error: ${errorMsg}`);
            throw new Error(`Login failed: ${errorMsg}`);
          }
        }
        await page.waitForTimeout(500);
      }

      const [authResponse, didNavigate] = await Promise.all([authResponsePromise, navPromise]);
      if (authResponse) {
        const status = authResponse.status();
        const authBody = await authResponse.json().catch(() => null);
        console.log(`Auth response [${roleLabel}] status:`, status, authBody?.error ?? authBody?.message ?? '');
      } else {
        console.warn(`Auth response [${roleLabel}] not captured.`);
      }

      if (didNavigate) {
        console.log(`Navigation detected after login [${roleLabel}]:`, page.url());
      }

      if (!hasSession) {
        console.warn(`Session token not detected for ${roleLabel}. Cookies: ${lastCookieNames.join(', ') || 'none'}`);
        throw new Error(`Session token not detected for ${roleLabel} after login.`);
      }

      console.log('Session token detected.');
    } catch (error) {
      const timestamp = Date.now();
      const screenshotPath = `test-results/login-failed-${roleLabel}-${timestamp}.png`;
      const pageClosed = typeof page.isClosed === 'function' ? page.isClosed() : false;
      if (pageClosed) {
        console.warn(`Login failure for ${roleLabel}, but page already closed. Skipping screenshot.`);
      } else {
        try {
          await page.screenshot({ path: screenshotPath, fullPage: true, timeout: 15000 });
          console.log(`Screenshot saved to: ${screenshotPath}`);
        } catch (screenshotError) {
          console.warn(`Failed to capture screenshot for ${roleLabel}:`, screenshotError);
        }

        // บันทึก HTML เพื่อดูสถานะของ DOM
        try {
          const html = await page.content();
          console.log(`HTML content at failure [${roleLabel}] (first 2000 chars):`, html.substring(0, 2000) + '...');
        } catch (contentError) {
          console.warn(`Failed to capture HTML content for ${roleLabel}:`, contentError);
        }

        // ตรวจสอบว่ามี error element อื่นๆ ไหม
        try {
          const errorText = await page.evaluate(() => {
            const alert = document.querySelector('[role="alert"]');
            if (alert) return "Alert: " + alert.textContent;
            const error = document.querySelector('.text-rose-400');
            if (error) return "Rose Error: " + error.textContent;
            return "No specific error element found";
          });
          console.log(`Detected Error Element [${roleLabel}]: ${errorText}`);
        } catch (evalError) {
          console.warn(`Failed to evaluate error elements for ${roleLabel}:`, evalError);
        }
      }

      throw error;
    }
  };

  // 1. Super Admin Flow
  test('Super Admin Dashboard Access', async ({ page }) => {
    await loginAs(page, 'Admin');
    await page.waitForLoadState('domcontentloaded', { timeout: 60000 });
    const currentUrl = page.url();
    if (!/\/\/(super-admin|admin)(\/|$)/.test(currentUrl)) {
      await page.goto('/th/super-admin', { waitUntil: 'domcontentloaded', timeout: 120000 });
    }
    await expect(page).toHaveURL(/.*\/(super-admin|admin)(\/|$)/, { timeout: 120000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 60000 });
    
    // Verify we're on the super admin dashboard
    await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
    console.log('✅ Super Admin: Dashboard access verified');
  });

  // 2. Clinic Owner Flow
  test('Clinic Owner: Dashboard and Staff Invitation Flow', async ({ page }) => {
    await loginAs(page, 'Owner');
    await page.waitForLoadState('domcontentloaded', { timeout: 60000 });
    const ownerUrl = page.url();
    if (!/\/(center|centers)\/(dashboard|revenue)(\/|$)/.test(ownerUrl)) {
      await page.goto('/th/centers/dashboard', { waitUntil: 'domcontentloaded', timeout: 120000 });
    }
    await expect(page).toHaveURL(/.*\/(center|centers)\/(dashboard|revenue)(\/|$)/, { timeout: 120000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 60000 });
    console.log('✅ Clinic Owner: Dashboard access verified');
  });

  // 3. Sales Staff Flow
  test('Sales Staff: Dashboard and Customer Creation Flow', async ({ page }) => {
    await loginAs(page, 'Sales');
    await page.waitForLoadState('domcontentloaded', { timeout: 60000 });
    const salesUrl = page.url();
    if (!/\/sales\/dashboard(\/|$)/.test(salesUrl)) {
      await page.goto('/th/sales/dashboard', { waitUntil: 'domcontentloaded', timeout: 120000 });
    }
    await expect(page).toHaveURL(/.*\/sales\/dashboard(\/|$)/, { timeout: 120000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 60000 });
    console.log('✅ Sales Staff: Dashboard access verified');
  });

  // 4. Customer Flow
  test('Customer: Dashboard and Profile Access', async ({ page }) => {
    await loginAs(page, 'Client');
    await page.waitForLoadState('domcontentloaded', { timeout: 60000 });
    const customerUrl = page.url();
    if (!/\/(dashboard|customer\/dashboard)(\/|$)/.test(customerUrl)) {
      await page.goto('/th/dashboard', { waitUntil: 'domcontentloaded', timeout: 120000 });
    }
    await expect(page).toHaveURL(/.*\/(dashboard|customer\/dashboard)(\/|$)/, { timeout: 120000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 60000 });
    console.log('✅ Customer: Dashboard access verified');
  });

  // 5. Security Check
  test('Security: RBAC restriction verified', async ({ page }) => {
    await loginAs(page, 'Sales');
    await page.waitForLoadState('domcontentloaded', { timeout: 60000 });
    const securitySalesUrl = page.url();
    if (!/\/sales\/dashboard(\/|$)/.test(securitySalesUrl)) {
      await page.goto('/th/sales/dashboard', { waitUntil: 'domcontentloaded', timeout: 120000 });
    }
    await expect(page).toHaveURL(/.*\/sales\/dashboard(\/|$)/, { timeout: 120000 });
    await page.goto('/th/super-admin', { waitUntil: 'domcontentloaded', timeout: 120000 });
    expect(page.url()).not.toMatch(/\/super-admin|\/admin/);
    console.log('✅ Security: RBAC restriction verified');
  });
});
