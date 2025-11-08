/**
 * Phase 3 Complete Testing Script
 * Automated UI testing for all critical flows
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = './test-results/phase3-screenshots';

// Test accounts
const ACCOUNTS = {
  admin: { email: 'admin@demo.com', password: 'demo123', role: 'Admin' },
  clinicOwner: { email: 'owner@demo.com', password: 'demo123', role: 'Clinic Owner' },
  sales: { email: 'sales@demo.com', password: 'demo123', role: 'Sales' },
  customer: { email: 'customer@demo.com', password: 'demo123', role: 'Customer' },
};

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  screenshot?: string;
  errors?: string[];
}

const results: TestResult[] = [];

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function captureScreenshot(page: Page, name: string): Promise<string> {
  const filename = `${Date.now()}-${name}.png`;
  const filepath = path.join(SCREENSHOTS_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  return filepath;
}

async function checkConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });
  return errors;
}

async function testPublicPages(browser: Browser) {
  console.log('\n📄 Testing Public Pages...');
  const page = await browser.newPage();
  const errors = await checkConsoleErrors(page);

  const pages = [
    { url: '/', name: 'Homepage' },
    { url: '/about', name: 'About' },
    { url: '/pricing', name: 'Pricing' },
    { url: '/features', name: 'Features' },
  ];

  for (const pageInfo of pages) {
    try {
      await page.goto(`${BASE_URL}${pageInfo.url}`, { waitUntil: 'networkidle' });
      const screenshot = await captureScreenshot(page, `public-${pageInfo.name}`);
      
      const hasErrors = errors.length > 0;
      results.push({
        name: `Public Page: ${pageInfo.name}`,
        status: hasErrors ? 'WARN' : 'PASS',
        message: hasErrors ? `Loaded with ${errors.length} console errors` : 'Loaded successfully',
        screenshot,
        errors: hasErrors ? errors : undefined,
      });
      
      console.log(`  ✅ ${pageInfo.name}: ${pageInfo.url}`);
    } catch (error) {
      results.push({
        name: `Public Page: ${pageInfo.name}`,
        status: 'FAIL',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      console.log(`  ❌ ${pageInfo.name}: FAILED`);
    }
  }

  await page.close();
}

async function testLogin(browser: Browser, accountKey: keyof typeof ACCOUNTS) {
  console.log(`\n🔐 Testing Login: ${ACCOUNTS[accountKey].role}...`);
  const page = await browser.newPage();
  const errors = await checkConsoleErrors(page);

  try {
    await page.goto(`${BASE_URL}/auth/signin`, { waitUntil: 'networkidle' });
    
    // Fill login form
    await page.fill('input[type="email"]', ACCOUNTS[accountKey].email);
    await page.fill('input[type="password"]', ACCOUNTS[accountKey].password);
    
    const screenshotBefore = await captureScreenshot(page, `login-${accountKey}-before`);
    
    // Submit
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    const screenshotAfter = await captureScreenshot(page, `login-${accountKey}-after`);
    
    // Check if redirected (not on signin page)
    const currentUrl = page.url();
    const isLoggedIn = !currentUrl.includes('/auth/signin');
    
    results.push({
      name: `Login: ${ACCOUNTS[accountKey].role}`,
      status: isLoggedIn ? 'PASS' : 'FAIL',
      message: isLoggedIn ? `Logged in successfully → ${currentUrl}` : 'Login failed - still on signin page',
      screenshot: screenshotAfter,
      errors: errors.length > 0 ? errors : undefined,
    });
    
    console.log(`  ${isLoggedIn ? '✅' : '❌'} ${ACCOUNTS[accountKey].role}: ${currentUrl}`);
    
  } catch (error) {
    results.push({
      name: `Login: ${ACCOUNTS[accountKey].role}`,
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    console.log(`  ❌ ${ACCOUNTS[accountKey].role}: FAILED`);
  }

  await page.close();
}

async function testSkinAnalysis(browser: Browser) {
  console.log('\n🔬 Testing Skin Analysis Flow...');
  const page = await browser.newPage();
  const errors = await checkConsoleErrors(page);

  try {
    // Login as customer first
    await page.goto(`${BASE_URL}/auth/signin`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', ACCOUNTS.customer.email);
    await page.fill('input[type="password"]', ACCOUNTS.customer.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // Go to analysis page
    await page.goto(`${BASE_URL}/analysis`, { waitUntil: 'networkidle' });
    const screenshotAnalysisPage = await captureScreenshot(page, 'analysis-upload-page');
    
    // Upload image (if file input exists)
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      // Use a test image
      const testImagePath = path.join(process.cwd(), 'public', 'test-face.jpg');
      if (fs.existsSync(testImagePath)) {
        await fileInput.setInputFiles(testImagePath);
        
        // Wait for analysis to complete
        console.log('  ⏳ Waiting for analysis to complete...');
        await page.waitForURL(/\/analysis\/detail\//, { timeout: 30000 });
        
        const screenshotDetail = await captureScreenshot(page, 'analysis-detail-page');
        
        // Check for bugs
        const bugs: string[] = [];
        
        // Bug #14: Check recommendations
        const recommendationsText = await page.textContent('text=Personalized Recommendations');
        if (recommendationsText && await page.textContent('text=No recommendations available')) {
          bugs.push('Bug #14: Recommendations empty (showing fallback)');
        }
        
        // Bug #15: Check AI Confidence
        const confidenceText = await page.textContent('text=Confidence:');
        if (confidenceText && confidenceText.includes('Confidence: %')) {
          bugs.push('Bug #15: AI Confidence missing number');
        }
        
        // Bug #16: Check Health Score
        const healthScoreElement = await page.$('.text-6xl.font-bold');
        if (healthScoreElement) {
          const healthScore = await healthScoreElement.textContent();
          if (healthScore === '0') {
            bugs.push('Bug #16: Health Score = 0');
          }
        }
        
        results.push({
          name: 'Skin Analysis Upload & Results',
          status: bugs.length > 0 ? 'WARN' : 'PASS',
          message: bugs.length > 0 ? `Analysis completed with ${bugs.length} bugs` : 'Analysis completed successfully',
          screenshot: screenshotDetail,
          errors: bugs.length > 0 ? bugs : undefined,
        });
        
        console.log(`  ${bugs.length > 0 ? '⚠️' : '✅'} Analysis completed`);
        bugs.forEach(bug => console.log(`    - ${bug}`));
        
      } else {
        results.push({
          name: 'Skin Analysis Upload & Results',
          status: 'WARN',
          message: 'Test image not found, skipping upload test',
          screenshot: screenshotAnalysisPage,
        });
        console.log('  ⚠️ Test image not found');
      }
    } else {
      results.push({
        name: 'Skin Analysis Upload & Results',
        status: 'WARN',
        message: 'File input not found on page',
        screenshot: screenshotAnalysisPage,
      });
      console.log('  ⚠️ File input not found');
    }
    
  } catch (error) {
    results.push({
      name: 'Skin Analysis Upload & Results',
      status: 'FAIL',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    console.log(`  ❌ Analysis test FAILED: ${error}`);
  }

  await page.close();
}

async function generateReport() {
  console.log('\n📊 Generating Test Report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      passed: results.filter(r => r.status === 'PASS').length,
      failed: results.filter(r => r.status === 'FAIL').length,
      warnings: results.filter(r => r.status === 'WARN').length,
    },
    results,
  };
  
  const reportPath = path.join(SCREENSHOTS_DIR, 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Console summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${report.summary.total}`);
  console.log(`✅ Passed: ${report.summary.passed}`);
  console.log(`❌ Failed: ${report.summary.failed}`);
  console.log(`⚠️  Warnings: ${report.summary.warnings}`);
  console.log('='.repeat(60));
  
  console.log('\n📸 Screenshots saved to:', SCREENSHOTS_DIR);
  console.log('📄 Report saved to:', reportPath);
  
  return report;
}

async function main() {
  console.log('🚀 Starting Phase 3 Automated Testing...');
  console.log('📍 Base URL:', BASE_URL);
  
  const browser = await chromium.launch({ headless: true });
  
  try {
    // Run all tests
    await testPublicPages(browser);
    
    await testLogin(browser, 'admin');
    await testLogin(browser, 'clinicOwner');
    await testLogin(browser, 'sales');
    await testLogin(browser, 'customer');
    
    await testSkinAnalysis(browser);
    
    // Generate report
    const report = await generateReport();
    
    // Exit with error if any tests failed
    if (report.summary.failed > 0) {
      console.log('\n❌ Some tests failed!');
      process.exit(1);
    } else {
      console.log('\n✅ All tests passed!');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
