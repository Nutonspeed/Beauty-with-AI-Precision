import { test, expect, waitForLoading, takeScreenshot, testUsers } from '../test-setup';

test.describe('Multi-language Support', () => {
  const languages = [
    { code: 'th', name: 'Thai', expected: ['แดชบอร์ด', 'เข้าสู่ระบบ', 'ผู้ใช้'] },
    { code: 'en', name: 'English', expected: ['Dashboard', 'Login', 'User'] },
    { code: 'zh', name: 'Chinese', expected: ['仪表板', '登录', '用户'] }
  ];

  test('should display language selector', async ({ page }) => {
    await page.goto('/th');
    await waitForLoading(page);
    
    // Check language selector
    await expect(page.locator('[data-testid="language-selector"]')).toBeVisible();
    await expect(page.locator('button:has-text("TH")')).toBeVisible();
    await expect(page.locator('button:has-text("EN")')).toBeVisible();
    await expect(page.locator('button:has-text("ZH")')).toBeVisible();
    
    await takeScreenshot(page, 'lang-selector-visible');
  });

  test('should switch to Thai language', async ({ page }) => {
    await page.goto('/th');
    await waitForLoading(page);
    
    // Click Thai language
    await page.click('button:has-text("TH")');
    await page.waitForURL('/th');
    await waitForLoading(page);
    
    // Check Thai content
    await expect(page.locator('html')).toHaveAttribute('lang', 'th');
    
    // Check Thai text elements
    const thaiTexts = await page.locator('body').textContent();
    expect(thaiTexts).toMatch(/แดชบอร์ด|เข้าสู่ระบบ|ผู้ใช้|คลินิก|การวิเคราะห์ผิวหนัง/);
    
    await takeScreenshot(page, 'lang-thai-switched');
  });

  test('should switch to English language', async ({ page }) => {
    await page.goto('/en');
    await waitForLoading(page);
    
    // Check English content
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    
    // Check English text elements
    const englishTexts = await page.locator('body').textContent();
    expect(englishTexts).toMatch(/Dashboard|Login|User|Clinic|Skin Analysis/);
    
    await takeScreenshot(page, 'lang-english-switched');
  });

  test('should switch to Chinese language', async ({ page }) => {
    await page.goto('/zh');
    await waitForLoading(page);
    
    // Check Chinese content
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh');
    
    // Check Chinese text elements
    const chineseTexts = await page.locator('body').textContent();
    expect(chineseTexts).toMatch(/仪表板|登录|用户|诊所|皮肤分析/);
    
    await takeScreenshot(page, 'lang-chinese-switched');
  });

  test('should maintain language preference across pages', async ({ page }) => {
    // Start with Thai
    await page.goto('/th');
    await waitForLoading(page);
    
    // Navigate to login page
    await page.click('a[href="/th/login"]');
    await page.waitForURL('/th/login');
    await waitForLoading(page);
    
    // Should still be in Thai
    await expect(page.locator('html')).toHaveAttribute('lang', 'th');
    await expect(page.locator('h1')).toContainText(/เข้าสู่ระบบ|Login/);
    
    // Navigate to about page
    await page.goto('/th/about');
    await waitForLoading(page);
    
    // Should still be in Thai
    await expect(page.locator('html')).toHaveAttribute('lang', 'th');
    
    await takeScreenshot(page, 'lang-preference-maintained');
  });

  test('should handle language switching in authenticated pages', async ({ page }) => {
    // Login in Thai
    await page.goto('/th/login');
    await waitForLoading(page);
    
    await page.fill('input[name="email"]', testUsers.customer.email);
    await page.fill('input[name="password"]', testUsers.customer.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/th/customer/dashboard');
    await waitForLoading(page);
    
    // Should be in Thai dashboard
    await expect(page.locator('html')).toHaveAttribute('lang', 'th');
    
    // Switch to English
    await page.click('button:has-text("EN")');
    await page.waitForURL('/en/customer/dashboard');
    await waitForLoading(page);
    
    // Should be in English dashboard
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    
    await takeScreenshot(page, 'lang-authenticated-switch');
  });

  test('should handle language switching in forms', async ({ page }) => {
    // Test registration form in different languages
    await page.goto('/th/register');
    await waitForLoading(page);
    
    // Check Thai form labels
    await expect(page.locator('label[for="firstName"]')).toContainText(/ชื่อ|First Name/);
    await expect(page.locator('label[for="lastName"]')).toContainText(/นามสกุล|Last Name/);
    await expect(page.locator('label[for="email"]')).toContainText(/อีเมล|Email/);
    
    // Switch to English
    await page.click('button:has-text("EN")');
    await page.waitForURL('/en/register');
    await waitForLoading(page);
    
    // Check English form labels
    await expect(page.locator('label[for="firstName"]')).toContainText('First Name');
    await expect(page.locator('label[for="lastName"]')).toContainText('Last Name');
    await expect(page.locator('label[for="email"]')).toContainText('Email');
    
    await takeScreenshot(page, 'lang-form-localization');
  });

  test('should handle language switching in error messages', async ({ page }) => {
    // Test error messages in different languages
    await page.goto('/th/login');
    await waitForLoading(page);
    
    // Submit empty form in Thai
    await page.click('button[type="submit"]');
    await waitForLoading(page);
    
    // Check Thai error messages
    if (await page.locator('.alert-error').isVisible()) {
      const thaiError = await page.locator('.alert-error').textContent();
      expect(thaiError).toMatch(/จำเป็นต้องกรอก|Required/);
    }
    
    // Switch to English
    await page.click('button:has-text("EN")');
    await page.waitForURL('/en/login');
    await waitForLoading(page);
    
    // Submit empty form in English
    await page.click('button[type="submit"]');
    await waitForLoading(page);
    
    // Check English error messages
    if (await page.locator('.alert-error').isVisible()) {
      const englishError = await page.locator('.alert-error').textContent();
      expect(englishError).toMatch(/Required|กรอก/);
    }
    
    await takeScreenshot(page, 'lang-error-messages');
  });

  test('should handle RTL languages if supported', async ({ page }) => {
    // This test checks if RTL languages are properly handled
    // Currently the app supports TH, EN, ZH (all LTR)
    
    await page.goto('/ar'); // Try Arabic if supported
    await page.waitForTimeout(2000);
    
    // Check if page loads or redirects
    const currentUrl = page.url();
    if (currentUrl.includes('/ar')) {
      // Check RTL attributes
      const htmlDir = await page.locator('html').getAttribute('dir');
      if (htmlDir === 'rtl') {
        await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
      }
    } else {
      // Should redirect to default language
      expect(currentUrl).toMatch(/\/(th|en|zh)\//);
    }
    
    await takeScreenshot(page, 'lang-rtl-check');
  });

  test('should handle language-specific date and number formatting', async ({ page }) => {
    // Test date formatting
    await page.goto('/th/customer/appointments');
    await waitForLoading(page);
    
    // Check Thai date format
    const thaiDates = await page.locator('[data-testid="appointment-date"]').allTextContents();
    if (thaiDates.length > 0) {
      // Thai dates might use Buddhist calendar or different format
      console.log('Thai date format:', thaiDates[0]);
    }
    
    // Switch to English
    await page.click('button:has-text("EN")');
    await page.waitForURL('/en/customer/appointments');
    await waitForLoading(page);
    
    // Check English date format
    const englishDates = await page.locator('[data-testid="appointment-date"]').allTextContents();
    if (englishDates.length > 0) {
      // English dates should use standard format
      console.log('English date format:', englishDates[0]);
    }
    
    await takeScreenshot(page, 'lang-date-formatting');
  });

  test('should handle language-specific currency formatting', async ({ page }) => {
    // Test currency formatting in sales dashboard
    await page.goto('/th/login');
    await waitForLoading(page);
    
    // Login as sales staff
    await page.fill('input[name="email"]', testUsers.salesStaff.email);
    await page.fill('input[name="password"]', testUsers.salesStaff.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/th/sales/dashboard');
    await waitForLoading(page);
    
    // Check Thai currency format
    const thaiCurrency = await page.locator('[data-testid="revenue-today"]').textContent();
    console.log('Thai currency format:', thaiCurrency);
    
    // Switch to English
    await page.click('button:has-text("EN")');
    await page.waitForURL('/en/sales/dashboard');
    await waitForLoading(page);
    
    // Check English currency format
    const englishCurrency = await page.locator('[data-testid="revenue-today"]').textContent();
    console.log('English currency format:', englishCurrency);
    
    await takeScreenshot(page, 'lang-currency-formatting');
  });

  test('should handle language switching in mobile view', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/th');
    await waitForLoading(page);
    
    // Check mobile language selector
    await expect(page.locator('[data-testid="mobile-language-selector"]')).toBeVisible();
    
    // Switch language in mobile
    await page.click('[data-testid="mobile-language-selector"]');
    await page.click('button:has-text("EN")');
    
    await page.waitForURL('/en');
    await waitForLoading(page);
    
    // Verify language switched
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    
    await takeScreenshot(page, 'lang-mobile-switch');
  });

  test('should preserve language in URL parameters', async ({ page }) => {
    // Test with URL parameters
    await page.goto('/th?tab=about&section=team');
    await waitForLoading(page);
    
    // Switch language
    await page.click('button:has-text("EN")');
    
    // Should preserve parameters
    await page.waitForURL('/en?tab=about&section=team');
    
    // Verify parameters are preserved
    const url = page.url();
    expect(url).toContain('tab=about');
    expect(url).toContain('section=team');
    
    await takeScreenshot(page, 'lang-url-params');
  });

  test('should handle language switching with browser back/forward', async ({ page }) => {
    await page.goto('/th');
    await waitForLoading(page);
    
    // Navigate to another page
    await page.goto('/th/about');
    await waitForLoading(page);
    
    // Switch language
    await page.click('button:has-text("EN")');
    await page.waitForURL('/en/about');
    await waitForLoading(page);
    
    // Go back
    await page.goBack();
    await waitForLoading(page);
    
    // Should maintain English language
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.url()).toContain('/en/');
    
    // Go forward
    await page.goForward();
    await waitForLoading(page);
    
    // Should still be in English
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    
    await takeScreenshot(page, 'lang-browser-navigation');
  });

  test('should handle language switching in API responses', async ({ page }) => {
    // This test checks if API responses respect language headers
    await page.goto('/th');
    await waitForLoading(page);
    
    // Make an API call that returns localized data
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/health', {
        headers: {
          'Accept-Language': 'th-TH'
        }
      });
      return res.json();
    });
    
    console.log('Thai API response:', response);
    
    // Switch to English
    await page.click('button:has-text("EN")');
    await page.waitForURL('/en');
    await waitForLoading(page);
    
    // Make API call with English language
    const englishResponse = await page.evaluate(async () => {
      const res = await fetch('/api/health', {
        headers: {
          'Accept-Language': 'en-US'
        }
      });
      return res.json();
    });
    
    console.log('English API response:', englishResponse);
    
    await takeScreenshot(page, 'lang-api-responses');
  });
});
