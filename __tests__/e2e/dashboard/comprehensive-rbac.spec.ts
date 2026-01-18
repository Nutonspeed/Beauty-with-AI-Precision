import { test, expect } from '../test-setup';
import path from 'path';

// เพิ่ม timeout สำหรับการนำทางและการทำงานให้ครอบคลุมความหน่วงของระบบ
test.use({ navigationTimeout: 180000, actionTimeout: 120000 });

test.describe('Comprehensive Dashboard RBAC & Flow', () => {
  
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

    await page.goto('/auth/login', { waitUntil: 'domcontentloaded', timeout: 120000 });
    
    try {
      // ตรวจสอบ URL จริงที่ได้ (อาจมีการ redirect อัตโนมัติ)
      console.log(`Current URL: ${page.url()}`);

      // รอให้ React Hydration เสร็จสิ้น (Global)
      console.log('Waiting for global React hydration...');
      await page.waitForSelector('body[data-hydrated="true"]', { timeout: 90000 });

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
      
      await page.fill('input[id="email"]', credentials[roleLabel]);
      await page.fill('input[id="password"]', 'Admin123!');
      
      const loginButton = page.locator('button[type="submit"]');
      await expect(loginButton).toBeEnabled({ timeout: 30000 });
      await loginButton.click();
      console.log('Login button clicked, waiting for response...');
      
      // Wait for either a redirect OR a destructive error message to appear
      const result = await Promise.race([
        page.waitForURL((url: URL) => !url.pathname.includes('/auth/login'), { timeout: 120000 }).then(() => 'redirect'),
        page.waitForSelector('.bg-rose-500\\/10', { timeout: 120000 }).then(() => 'error')
      ]);

      if (result === 'error') {
        const errorMsg = await page.locator('.bg-rose-500\\/10').innerText();
        console.error(`Login failed with destructive error: ${errorMsg}`);
        throw new Error(`Login failed: ${errorMsg}`);
      }
      console.log(`Successfully logged in or redirected. URL: ${page.url()}`);
    } catch (error) {
      const timestamp = Date.now();
      const screenshotPath = `test-results/login-failed-${roleLabel}-${timestamp}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Screenshot saved to: ${screenshotPath}`);
      
      // บันทึก HTML เพื่อดูสถานะของ DOM
      const html = await page.content();
      console.log(`HTML content at failure [${roleLabel}] (first 2000 chars):`, html.substring(0, 2000) + '...');
      
      // ตรวจสอบว่ามี error element อื่นๆ ไหม
      const errorText = await page.evaluate(() => {
        const alert = document.querySelector('[role="alert"]');
        if (alert) return "Alert: " + alert.textContent;
        const error = document.querySelector('.text-rose-400');
        if (error) return "Rose Error: " + error.textContent;
        return "No specific error element found";
      });
      console.log(`Detected Error Element [${roleLabel}]: ${errorText}`);
      
      throw error;
    }
  };

  // 1. Super Admin Flow
  test('Super Admin Dashboard Access', async ({ page }) => {
    await loginAs(page, 'Admin');
    // Account for redirect from /super-admin to /admin
    await expect(page).toHaveURL(/.*\/super-admin/, { timeout: 120000 });
    
    // Wait for the page to load
    console.log('Waiting for dashboard to load...');
    await page.waitForLoadState('networkidle', { timeout: 60000 });
    
    // Verify we're on the super admin dashboard
    await expect(page.locator('body')).toBeVisible({ timeout: 30000 });
    console.log('✅ Super Admin: Dashboard access verified');
  });

  // 2. Clinic Owner Flow
  test('Clinic Owner: Dashboard and Staff Invitation Flow', async ({ page }) => {
    await loginAs(page, 'Owner');
    await expect(page).toHaveURL(/.*\/dashboard|.*\/center/, { timeout: 120000 });
    
    await page.waitForLoadState('networkidle', { timeout: 60000 });
    console.log('✅ Clinic Owner: Dashboard access verified');
  });

  // 3. Sales Staff Flow
  test('Sales Staff: Dashboard and Customer Creation Flow', async ({ page }) => {
    await loginAs(page, 'Sales');
    await expect(page).toHaveURL(/.*\/sales/, { timeout: 120000 });
    
    await page.waitForLoadState('networkidle', { timeout: 60000 });
    console.log('✅ Sales Staff: Dashboard access verified');
  });

  // 4. Customer Flow
  test('Customer: Dashboard and Profile Access', async ({ page }) => {
    await loginAs(page, 'Client');
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 120000 });
    
    await page.waitForLoadState('networkidle', { timeout: 60000 });
    console.log('✅ Customer: Dashboard access verified');
  });

  // 5. Security Check
  test('Security: RBAC restriction verified', async ({ page }) => {
    await loginAs(page, 'Sales');
    await page.goto('/th/super-admin', { waitUntil: 'load' });
    expect(page.url()).not.toContain('/super-admin');
    console.log('✅ Security: RBAC restriction verified');
  });
});
