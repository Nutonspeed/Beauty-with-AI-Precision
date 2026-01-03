// @ts-nocheck
import { test, expect, waitForLoading, takeScreenshot, testUsers } from '../test-setup';

const devices = [
  { name: 'iPhone 12', viewport: { width: 390, height: 844 }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15' },
  { name: 'Samsung Galaxy S21', viewport: { width: 360, height: 640 }, userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36' },
  { name: 'iPad', viewport: { width: 768, height: 1024 }, userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15' },
  { name: 'Desktop', viewport: { width: 1920, height: 1080 }, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
];

test.describe('Mobile Responsiveness', () => {
  devices.forEach(device => {
    test.describe(`${device.name}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize(device.viewport);
        await page.setUserAgent(device.userAgent);
      });

      test('should display landing page correctly', async ({ page }) => {
        await page.goto('/th');
        await waitForLoading(page);
        
        // Check responsive navigation
        if (device.viewport.width < 768) {
          // Mobile navigation
          await expect(page.locator('[data-testid="mobile-menu-toggle"]')).toBeVisible();
          await expect(page.locator('[data-testid="mobile-navigation"]')).not.toBeVisible();
          
          // Open mobile menu
          await page.click('[data-testid="mobile-menu-toggle"]');
          await expect(page.locator('[data-testid="mobile-navigation"]')).toBeVisible();
        } else {
          // Desktop navigation
          await expect(page.locator('nav')).toBeVisible();
          await expect(page.locator('[data-testid="mobile-menu-toggle"]')).not.toBeVisible();
        }
        
        // Check hero section
        await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
        await expect(page.locator('h1')).toBeVisible();
        
        // Check CTA buttons
        await expect(page.locator('button:has-text("เริ่มต้น")')).toBeVisible();
        await expect(page.locator('button:has-text("ทดลองใช้")')).toBeVisible();
        
        await takeScreenshot(page, `mobile-landing-${device.name.toLowerCase().replace(' ', '-')}`);
      });

      test('should handle login page correctly', async ({ page }) => {
        await page.goto('/th/login');
        await waitForLoading(page);
        
        // Check form layout
        await expect(page.locator('form')).toBeVisible();
        await expect(page.locator('input[name="email"]')).toBeVisible();
        await expect(page.locator('input[name="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
        
        // Check mobile-specific features
        if (device.viewport.width < 768) {
          // Check for mobile keyboard optimization
          await expect(page.locator('input[name="email"]')).toHaveAttribute('autocomplete', 'email');
          await expect(page.locator('input[name="password"]')).toHaveAttribute('autocomplete', 'current-password');
          
          // Check for mobile-friendly button sizes
          const submitButton = page.locator('button[type="submit"]');
          const boundingBox = await submitButton.boundingBox();
          expect(boundingBox.height).toBeGreaterThan(44); // Minimum touch target
        }
        
        await takeScreenshot(page, `mobile-login-${device.name.toLowerCase().replace(' ', '-')}`);
      });

      test('should handle dashboard correctly on mobile', async ({ page }) => {
        // Login first
        await page.goto('/th/login');
        await page.fill('input[name="email"]', testUsers.customer.email);
        await page.fill('input[name="password"]', testUsers.customer.password);
        await page.click('button[type="submit"]');
        await page.waitForURL('/th/customer/dashboard');
        await waitForLoading(page);
        
        // Check dashboard layout
        await expect(page.locator('h1')).toContainText('Dashboard');
        
        if (device.viewport.width < 768) {
          // Mobile dashboard
          await expect(page.locator('[data-testid="mobile-dashboard-grid"]')).toBeVisible();
          
          // Check for mobile navigation
          await expect(page.locator('[data-testid="bottom-navigation"]')).toBeVisible();
          
          // Check card layout
          await expect(page.locator('[data-testid="dashboard-card"]')).toHaveCount.greaterThan(0);
        } else {
          // Desktop dashboard
          await expect(page.locator('[data-testid="desktop-dashboard-grid"]')).toBeVisible();
          await expect(page.locator('[data-testid="sidebar-navigation"]')).toBeVisible();
        }
        
        await takeScreenshot(page, `mobile-dashboard-${device.name.toLowerCase().replace(' ', '-')}`);
      });

      test('should handle appointments page on mobile', async ({ page }) => {
        // Login and navigate
        await page.goto('/th/login');
        await page.fill('input[name="email"]', testUsers.customer.email);
        await page.fill('input[name="password"]', testUsers.customer.password);
        await page.click('button[type="submit"]');
        await page.waitForURL('/th/customer/dashboard');
        
        await page.goto('/th/customer/appointments');
        await waitForLoading(page);
        
        if (device.viewport.width < 768) {
          // Mobile appointments
          await expect(page.locator('[data-testid="mobile-appointment-list"]')).toBeVisible();
          await expect(page.locator('[data-testid="appointment-card"]')).toHaveCount.greaterThan(0);
          
          // Check mobile calendar view
          await expect(page.locator('[data-testid="mobile-calendar"]')).toBeVisible();
          
          // Test swipe gestures (if implemented)
          const calendar = page.locator('[data-testid="mobile-calendar"]');
          await calendar.tap();
          await page.waitForTimeout(500);
        } else {
          // Desktop appointments
          await expect(page.locator('table')).toBeVisible();
          await expect(page.locator('[data-testid="calendar-grid"]')).toBeVisible();
        }
        
        await takeScreenshot(page, `mobile-appointments-${device.name.toLowerCase().replace(' ', '-')}`);
      });

      test('should handle skin analysis on mobile', async ({ page }) => {
        // Login and navigate
        await page.goto('/th/login');
        await page.fill('input[name="email"]', testUsers.customer.email);
        await page.fill('input[name="password"]', testUsers.customer.password);
        await page.click('button[type="submit"]');
        await page.waitForURL('/th/customer/dashboard');
        
        await page.goto('/th/customer/analysis');
        await waitForLoading(page);
        
        // Check mobile-specific features
        if (device.viewport.width < 768) {
          // Mobile camera integration
          await expect(page.locator('button:has-text("ถ่ายรูป")')).toBeVisible();
          await expect(page.locator('button:has-text("เลือกรูปภาพ")')).toBeVisible();
          
          // Check mobile file input
          const fileInput = page.locator('input[type="file"]');
          await expect(fileInput).toHaveAttribute('accept', 'image/*');
          await expect(fileInput).toHaveAttribute('capture', 'environment');
        }
        
        await takeScreenshot(page, `mobile-analysis-${device.name.toLowerCase().replace(' ', '-')}`);
      });

      test('should handle AR simulator on mobile', async ({ page }) => {
        // Login and navigate
        await page.goto('/th/login');
        await page.fill('input[name="email"]', testUsers.customer.email);
        await page.fill('input[name="password"]', testUsers.customer.password);
        await page.click('button[type="submit"]');
        await page.waitForURL('/th/customer/dashboard');
        
        await page.goto('/th/ar-simulator');
        await waitForLoading(page);
        
        if (device.viewport.width < 768) {
          // Mobile AR controls
          await expect(page.locator('[data-testid="mobile-ar-controls"]')).toBeVisible();
          await expect(page.locator('button:has-text("จับภาพ")')).toBeVisible();
          
          // Check touch gesture hints
          await expect(page.locator('[data-testid="gesture-hint"]')).toBeVisible();
          
          // Test touch interactions
          const canvas = page.locator('canvas');
          if (await canvas.isVisible()) {
            await canvas.tap();
            await page.waitForTimeout(500);
          }
        }
        
        await takeScreenshot(page, `mobile-ar-${device.name.toLowerCase().replace(' ', '-')}`);
      });

      test('should handle sales dashboard on mobile', async ({ page }) => {
        // Login as sales staff
        await page.goto('/th/login');
        await page.fill('input[name="email"]', testUsers.salesStaff.email);
        await page.fill('input[name="password"]', testUsers.salesStaff.password);
        await page.click('button[type="submit"]');
        await page.waitForURL('/th/sales/dashboard');
        await waitForLoading(page);
        
        if (device.viewport.width < 768) {
          // Mobile sales dashboard
          await expect(page.locator('[data-testid="mobile-sales-grid"]')).toBeVisible();
          await expect(page.locator('[data-testid="quick-action-button"]')).toHaveCount.greaterThan(0);
          
          // Check mobile lead management
          await expect(page.locator('[data-testid="mobile-lead-card"]')).toHaveCount.greaterThan(0);
        } else {
          // Desktop sales dashboard
          await expect(page.locator('[data-testid="desktop-sales-grid"]')).toBeVisible();
          await expect(page.locator('table')).toBeVisible();
        }
        
        await takeScreenshot(page, `mobile-sales-${device.name.toLowerCase().replace(' ', '-')}`);
      });

      test('should handle forms correctly on mobile', async ({ page }) => {
        await page.goto('/th/register');
        await waitForLoading(page);
        
        if (device.viewport.width < 768) {
          // Check mobile form layout
          await expect(page.locator('[data-testid="mobile-form"]')).toBeVisible();
          
          // Check input field sizes
          const inputs = page.locator('input');
          const inputCount = await inputs.count();
          
          for (let i = 0; i < inputCount; i++) {
            const input = inputs.nth(i);
            const boundingBox = await input.boundingBox();
            expect(boundingBox.height).toBeGreaterThan(44); // Minimum touch target
          }
          
          // Check mobile keyboard optimization
          await expect(page.locator('input[name="email"]')).toHaveAttribute('inputmode', 'email');
          await expect(page.locator('input[name="phone"]')).toHaveAttribute('inputmode', 'tel');
        }
        
        await takeScreenshot(page, `mobile-forms-${device.name.toLowerCase().replace(' ', '-')}`);
      });

      test('should handle navigation correctly on mobile', async ({ page }) => {
        await page.goto('/th');
        await waitForLoading(page);
        
        if (device.viewport.width < 768) {
          // Test mobile menu
          await page.click('[data-testid="mobile-menu-toggle"]');
          await expect(page.locator('[data-testid="mobile-navigation"]')).toBeVisible();
          
          // Test navigation items
          const navItems = page.locator('[data-testid="mobile-navigation"] a');
          const itemCount = await navItems.count();
          
          for (let i = 0; i < Math.min(itemCount, 3); i++) {
            const item = navItems.nth(i);
            const boundingBox = await item.boundingBox();
            expect(boundingBox.height).toBeGreaterThan(44); // Minimum touch target
          }
          
          // Close mobile menu
          await page.click('[data-testid="mobile-menu-toggle"]');
          await expect(page.locator('[data-testid="mobile-navigation"]')).not.toBeVisible();
        }
        
        await takeScreenshot(page, `mobile-navigation-${device.name.toLowerCase().replace(' ', '-')}`);
      });

      test('should handle tables correctly on mobile', async ({ page }) => {
        // Login as sales staff
        await page.goto('/th/login');
        await page.fill('input[name="email"]', testUsers.salesStaff.email);
        await page.fill('input[name="password"]', testUsers.salesStaff.password);
        await page.click('button[type="submit"]');
        await page.waitForURL('/th/sales/dashboard');
        
        await page.goto('/th/sales/leads');
        await waitForLoading(page);
        
        if (device.viewport.width < 768) {
          // Mobile should use card layout instead of table
          await expect(page.locator('[data-testid="mobile-lead-cards"]')).toBeVisible();
          await expect(page.locator('table')).not.toBeVisible();
          
          // Check card layout
          const cards = page.locator('[data-testid="lead-card"]');
          const cardCount = await cards.count();
          expect(cardCount).toBeGreaterThan(0);
          
          // Check card content
          const firstCard = cards.first();
          await expect(firstCard.locator('[data-testid="lead-name"]')).toBeVisible();
          await expect(firstCard.locator('[data-testid="lead-status"]')).toBeVisible();
          await expect(firstCard.locator('[data-testid="lead-actions"]')).toBeVisible();
        } else {
          // Desktop should use table layout
          await expect(page.locator('table')).toBeVisible();
          await expect(page.locator('[data-testid="mobile-lead-cards"]')).not.toBeVisible();
        }
        
        await takeScreenshot(page, `mobile-tables-${device.name.toLowerCase().replace(' ', '-')}`);
      });

      test('should handle modals correctly on mobile', async ({ page }) => {
        await page.goto('/th/login');
        await waitForLoading(page);
        
        // Click forgot password to open modal
        await page.click('a[href="/th/forgot-password"]');
        await waitForLoading(page);
        
        if (device.viewport.width < 768) {
          // Check modal layout
          await expect(page.locator('[data-testid="mobile-modal"]')).toBeVisible();
          
          // Check modal takes full screen on mobile
          const modal = page.locator('[data-testid="mobile-modal"]');
          const boundingBox = await modal.boundingBox();
          expect(boundingBox.width).toBeLessThanOrEqual(device.viewport.width);
          
          // Check mobile close button
          await expect(page.locator('[data-testid="mobile-modal-close"]')).toBeVisible();
        }
        
        await takeScreenshot(page, `mobile-modals-${device.name.toLowerCase().replace(' ', '-')}`);
      });

      test('should handle scrolling correctly on mobile', async ({ page }) => {
        await page.goto('/th');
        await waitForLoading(page);
        
        // Check if page is scrollable
        const pageHeight = await page.evaluate(() => document.body.scrollHeight);
        const viewportHeight = device.viewport.height;
        
        if (pageHeight > viewportHeight) {
          // Test scrolling
          await page.evaluate(() => window.scrollTo(0, 500));
          await page.waitForTimeout(500);
          
          // Check if elements are still visible after scroll
          await expect(page.locator('footer')).toBeVisible();
          
          // Test pull-to-refresh (if implemented)
          if (device.viewport.width < 768) {
            await page.evaluate(() => window.scrollTo(0, 0));
            await page.mouse.wheel(0, 100);
            await page.waitForTimeout(500);
          }
        }
        
        await takeScreenshot(page, `mobile-scrolling-${device.name.toLowerCase().replace(' ', '-')}`);
      });
    });
  });

  test('should handle orientation changes', async ({ page }) => {
    // Start in portrait
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/th');
    await waitForLoading(page);
    
    // Take portrait screenshot
    await takeScreenshot(page, 'mobile-orientation-portrait');
    
    // Switch to landscape
    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(1000);
    
    // Check layout adapts
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
    
    // Take landscape screenshot
    await takeScreenshot(page, 'mobile-orientation-landscape');
    
    // Switch back to portrait
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1000);
    
    // Check layout returns to normal
    await expect(page.locator('h1')).toBeVisible();
  });
});
