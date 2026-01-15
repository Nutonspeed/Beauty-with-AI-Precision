import { test as base, expect, type Page } from '@playwright/test';

// Test data fixtures
export const testUsers = {
  superAdmin: {
    email: 'admin@ai367bar.com',
    password: 'Admin123!',
    role: 'super_admin',
    name: 'Super Admin Test'
  },
  centerOwner: {
    email: 'center-owner@test.com', 
    password: 'password123',
    role: 'center_owner',
    name: 'Center Owner Test',
    centerId: 'test-center-1'
  },
  salesStaff: {
    email: 'sales2@test.com',
    password: 'password123', 
    role: 'sales_staff',
    name: 'Sales Staff Test',
    centerId: 'test-center-1'
  },
  customer: {
    email: 'customer3@test.com',
    password: 'password123',
    role: 'customer', 
    name: 'Customer Test',
    centerId: 'test-center-1'
  }
};

export const testCenters = {
  center1: {
    id: 'test-center-1',
    name: 'Test Beauty Center',
    email: 'center@test.com',
    phone: '+6621234567',
    address: '123 Test Street, Bangkok'
  }
};

// Use base test directly (no custom fixtures to avoid TS fixture typing issues)
export const test = base;
export { expect };

// Test utilities
export const waitForLoading = async (page: Page) => {
  // Some pages stream; use domcontentloaded to avoid hanging
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
  // Fallback: ensure body is present
  await page.locator('body').first().waitFor({ state: 'visible', timeout: 10000 });
};

export const takeScreenshot = async (page: Page, name: string) => {
  await page.screenshot({ path: `test-results/${name}-${Date.now()}.png` });
};

export const checkAccessibility = async (page: Page) => {
  // Basic accessibility checks
  const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
  const buttons = await page.locator('button').count();
  const inputs = await page.locator('input').count();
  
  console.log(`Accessibility check: ${headings} headings, ${buttons} buttons, ${inputs} inputs`);
  
  // Check for alt text on images
  const imagesWithoutAlt = await page.locator('img:not([alt])').count();
  if (imagesWithoutAlt > 0) {
    console.warn(`Found ${imagesWithoutAlt} images without alt text`);
  }
};
