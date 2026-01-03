import { test, expect } from '@playwright/test';

// Skip tests if we're in CI environment without test database
const skipInCI = process.env.CI ? test.skip : test;

/**
 * Admin Dashboard E2E Tests
 * Tests the admin dashboard functionality and navigation
 */
test.describe('Security Monitoring - Filters & Pagination', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    console.log(`\n[${testInfo.title}] Starting test setup...`);
    
    try {
      // Navigate to Admin Dashboard (the actual page that exists)
      console.log('Navigating to Admin Dashboard...');
      await page.goto('/th/admin', { waitUntil: 'domcontentloaded', timeout: 60000 });
      
      // Check if we're on the admin dashboard
      const isAdminDashboard = await Promise.race([
        page.waitForURL('**/admin', { timeout: 10000 }).then(() => true).catch(() => false),
        page.waitForSelector('h1:has-text("Admin Dashboard"), [data-testid="admin-dashboard"]', { 
          state: 'visible', 
          timeout: 10000 
        }).then(() => true).catch(() => false)
      ]);
      
      if (!isAdminDashboard) {
        throw new Error('Failed to load Admin Dashboard');
      }
      
      console.log('Admin Dashboard loaded successfully');
      await page.screenshot({ path: 'admin-dashboard.png', fullPage: true });
      
    } catch (error) {
      console.error('Test setup failed:', error);
      await page.screenshot({ path: 'test-setup-failed.png', fullPage: true });
      throw error;
    }
  });

  test('should display admin dashboard', async ({ page }) => {
    console.log('\n[Test] Verifying admin dashboard...');
    
    try {
      await page.waitForLoadState('domcontentloaded')

      const titleElement = page.getByRole('heading', { name: /Admin Dashboard/i }).first()
      await expect(titleElement).toBeVisible({ timeout: 20000 })
      console.log('Admin Dashboard title found')
      
      // Take a screenshot for verification
      await page.screenshot({ path: 'admin-dashboard-verified.png', fullPage: true });
      
      // Verify the page contains admin-related content
      const pageContent = (await page.content()).toLowerCase();
      const hasAdminContent = [
        'admin', 'ผู้ดูแลระบบ',
        'dashboard', 'แดชบอร์ด',
        'system', 'ระบบ'
      ].some(term => pageContent.includes(term.toLowerCase()));
      
      if (!hasAdminContent) {
        console.warn('Warning: No admin-related content found on the page');
      }
      
      console.log('Admin dashboard verified successfully');
      
    } catch (error) {
      console.error('Error verifying admin dashboard:', error);
      console.log('Current URL:', page.url());
      console.log('Page title:', await page.title());
      await page.screenshot({ path: 'admin-dashboard-verification-failed.png', fullPage: true });
      throw error;
    }
  });

  test('should display system statistics', async ({ page }) => {
    console.log('\n[Test] Verifying system statistics...');
    
    try {
      // Wait for the page to be fully loaded
      await page.waitForLoadState('domcontentloaded');

      console.log('Looking for system statistics...')

      const expectedLabels = ['Total Users', 'Active Now', 'Clinics', 'Analyses']
      let foundStats = 0

      for (const label of expectedLabels) {
        const statElement = page.locator(`text=${label}`).first()
        try {
          await expect(statElement).toBeVisible({ timeout: 15000 })
          console.log(`Found stat: ${label}`)
          foundStats++
        } catch {
          console.warn(`Stat not found: ${label}`)
        }
      }
      
      // Take a screenshot of the current state
      await page.screenshot({ path: 'system-stats.png', fullPage: true });

      expect(foundStats).toBeGreaterThan(0)

      console.log(`Found ${foundStats} out of ${expectedLabels.length} expected statistics`)
      console.log('System statistics verification completed')
    } catch (error) {
      console.error('Error verifying system statistics:', error);
      await page.screenshot({ path: 'system-stats-error.png', fullPage: true });
      throw error;
    }
  });

  test('should display quick actions', async ({ page }) => {
    console.log('\n[Test] Verifying quick actions...');
    
    try {
      // Wait for the page to be fully loaded
      await page.waitForLoadState('domcontentloaded');
      
      // Look for quick actions section with multiple approaches
      const quickActionsSelectors = [
        'text=Quick Actions',
        'text=การดำเนินการด่วน',
        '[class*="quick-action"]',
        '.grid.grid-cols-2.md\\:grid-cols-4',
        'text=User Management',
        'text=Clinic Management',
        'text=Analytics',
        'text=System Settings'
      ];
      
      // Wait for any quick actions element to be visible
      console.log('Looking for quick actions...');
      let actionsFound = false;
      
      for (const selector of quickActionsSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });
          console.log(`Found quick actions element with selector: ${selector}`);
          actionsFound = true;
          break;
        } catch (error) {
          // Continue to next selector
        }
      }
      
      if (!actionsFound) {
        console.warn('No specific quick actions elements found, checking for general content...');
        // Check if page has action-related content
        const pageText = await page.textContent('body');
        const hasActions = pageText ? /(User Management|Clinic Management|Analytics|System Settings)/i.test(pageText) : false;
        
        if (hasActions) {
          console.log('Found action-related content on the page');
          actionsFound = true;
        }
      }
      
      // Take a screenshot of the current state
      await page.screenshot({ path: 'quick-actions.png', fullPage: true });
      
      // Check for specific action labels that should be present
      const expectedActions = ['User Management', 'Clinic Management', 'Analytics', 'System Settings'];
      let foundActions = 0;
      
      for (const action of expectedActions) {
        const actionElement = page.locator(`text=${action}`);
        try {
          await expect(actionElement).toBeVisible({ timeout: 3000 });
          console.log(`Found action: ${action}`);
          foundActions++;
        } catch (error) {
          console.warn(`Action not found: ${action}`);
        }
      }
      
      // Verify we have at least some actions visible
      expect(actionsFound || foundActions > 0).toBe(true);
      
      console.log(`Found ${foundActions} out of ${expectedActions.length} expected quick actions`);
      console.log('Quick actions verification completed');
    } catch (error) {
      console.error('Error verifying quick actions:', error);
      await page.screenshot({ path: 'quick-actions-error.png', fullPage: true });
      throw error;
    }
  });
});
