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
    email: 'clinic-owner@example.com', 
    password: 'Admin123!',
    role: 'clinic_owner',
    name: 'Center Owner Test',
    centerId: 'test-center-1'
  },
  salesStaff: {
    email: 'sales@example.com',
    password: 'Admin123!', 
    role: 'sales_staff',
    name: 'Sales Staff Test',
    centerId: 'test-center-1'
  },
  customer: {
    email: 'customer@example.com',
    password: 'Admin123!',
    role: 'customer_free', 
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
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
  
  // Wait for React hydration when marker exists (prevents input reset after fill)
  await page
    .waitForFunction(() => {
      const hydrated = document.querySelector('[data-hydrated]') as HTMLElement | null
      if (!hydrated) return true
      return hydrated.getAttribute('data-hydrated') === 'true'
    }, { timeout: 30000 })
    .catch(() => {})
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
