# 🧪 E2E Testing Guide

## Overview
Comprehensive guide for end-to-end testing of the Beauty AI Clinic application.

**Test Coverage:**
- Authentication flows
- Booking system with payment
- Email/SMS notifications
- AI skin analysis
- Admin functions
- Multi-device compatibility

---

## Quick Start (Manual Testing - 30 minutes)

### Prerequisites
- [ ] Application deployed (or running locally)
- [ ] All environment variables configured
- [ ] Test Stripe card: `4242 4242 4242 4242`
- [ ] Test phone number verified in Twilio

### Test Flow
Follow the steps in `QUICK_START_DEPLOYMENT.md` Phase 5 for immediate testing.

---

## Automated E2E Testing Setup

### 1. Install Playwright (If Not Installed)

```powershell
pnpm add -D @playwright/test
pnpm exec playwright install
```

### 2. Configure Playwright

Already configured in `playwright.config.ts`. Verify settings:
- Base URL
- Timeout settings
- Browser options
- Screenshot on failure

---

## Test Scenarios

### 1. Authentication Flow (Priority: CRITICAL)

#### Test: User Registration
```typescript
// __tests__/e2e/auth-signup.test.ts
test('User can sign up with email', async ({ page }) => {
  await page.goto('/auth/signup');
  
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'SecurePass123!');
  await page.fill('[name="confirmPassword"]', 'SecurePass123!');
  await page.click('button[type="submit"]');
  
  // Should redirect to verify email page
  await expect(page).toHaveURL(/verify-email/);
});
```

#### Test: User Login
```typescript
test('User can login', async ({ page }) => {
  await page.goto('/auth/login');
  
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'SecurePass123!');
  await page.click('button[type="submit"]');
  
  // Should redirect to dashboard
  await expect(page).toHaveURL(/dashboard/);
});
```

#### Test: Password Reset
```typescript
test('User can reset password', async ({ page }) => {
  await page.goto('/auth/forgot-password');
  
  await page.fill('[name="email"]', 'test@example.com');
  await page.click('button[type="submit"]');
  
  // Check for success message
  await expect(page.locator('text=Check your email')).toBeVisible();
});
```

---

### 2. Booking Flow with Payment (Priority: CRITICAL)

#### Test: Complete Booking with Payment
```typescript
// __tests__/e2e/booking-flow.test.ts
test('User can complete booking with payment', async ({ page }) => {
  // Login first
  await page.goto('/auth/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'SecurePass123!');
  await page.click('button[type="submit"]');
  
  // Navigate to booking
  await page.goto('/booking');
  
  // Select service
  await page.click('text=Acne Treatment');
  await page.click('button:has-text("Next")');
  
  // Select date/time
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  await page.click(`[data-date="${tomorrow.toISOString().split('T')[0]}"]`);
  await page.click('[data-time="14:00"]');
  await page.click('button:has-text("Next")');
  
  // Upload image (optional)
  await page.setInputFiles('input[type="file"]', 'test-images/face-sample.jpg');
  await page.click('button:has-text("Next")');
  
  // Proceed to payment
  await page.click('button:has-text("Proceed to Payment")');
  
  // Fill Stripe card details
  const frame = page.frameLocator('iframe[name*="stripe"]');
  await frame.locator('[placeholder="Card number"]').fill('4242424242424242');
  await frame.locator('[placeholder="MM / YY"]').fill('12/34');
  await frame.locator('[placeholder="CVC"]').fill('123');
  await frame.locator('[placeholder="ZIP"]').fill('10000');
  
  // Submit payment
  await page.click('button:has-text("Pay")');
  
  // Wait for success
  await expect(page.locator('text=Booking Confirmed')).toBeVisible({ timeout: 30000 });
  
  // Verify booking appears in user's bookings
  await page.goto('/bookings');
  await expect(page.locator('text=Acne Treatment')).toBeVisible();
});
```

#### Test: Payment Failure Handling
```typescript
test('Payment failure is handled gracefully', async ({ page }) => {
  // Use declined card: 4000000000000002
  // ... similar steps but with declined card
  
  const frame = page.frameLocator('iframe[name*="stripe"]');
  await frame.locator('[placeholder="Card number"]').fill('4000000000000002');
  // ... rest of card details
  
  await page.click('button:has-text("Pay")');
  
  // Should show error message
  await expect(page.locator('text=Payment failed')).toBeVisible();
});
```

---

### 3. Email/SMS Notifications (Priority: HIGH)

#### Test: Booking Confirmation Email
```typescript
// Note: Email testing requires Resend test mode or email verification service
test('Booking confirmation email is sent', async ({ request }) => {
  // Create booking via API
  const response = await request.post('/api/bookings/create', {
    data: {
      serviceId: 'service-123',
      date: '2024-12-01',
      time: '14:00',
    },
  });
  
  expect(response.ok()).toBeTruthy();
  
  // Manual verification: Check email inbox for confirmation
  // For automated testing, use email testing service like MailHog
});
```

#### Test: SMS Notification
```typescript
test('SMS notification is sent', async ({ request }) => {
  // Create booking via API
  const response = await request.post('/api/bookings/create', {
    data: {
      serviceId: 'service-123',
      date: '2024-12-01',
      time: '14:00',
      phoneNumber: '+66812345678',
    },
  });
  
  expect(response.ok()).toBeTruthy();
  
  // Manual verification: Check phone for SMS
  // For automated testing, use Twilio test credentials
});
```

---

### 4. AI Skin Analysis (Priority: HIGH)

#### Test: Image Upload and Analysis
```typescript
// __tests__/e2e/ai-analysis.test.ts
test('User can analyze skin image', async ({ page }) => {
  await page.goto('/ai-analysis');
  
  // Upload image
  await page.setInputFiles('input[type="file"]', 'test-images/face-sample.jpg');
  
  // Wait for preview
  await expect(page.locator('img[alt="Preview"]')).toBeVisible();
  
  // Start analysis
  await page.click('button:has-text("Analyze")');
  
  // Wait for results (may take 10-30 seconds)
  await expect(page.locator('text=Analysis Complete')).toBeVisible({ timeout: 60000 });
  
  // Verify results sections appear
  await expect(page.locator('text=Skin Type')).toBeVisible();
  await expect(page.locator('text=Concerns Detected')).toBeVisible();
  await expect(page.locator('text=Recommendations')).toBeVisible();
});
```

#### Test: Analysis Error Handling
```typescript
test('Invalid image format is rejected', async ({ page }) => {
  await page.goto('/ai-analysis');
  
  // Try to upload non-image file
  await page.setInputFiles('input[type="file"]', 'package.json');
  
  // Should show error
  await expect(page.locator('text=Invalid file format')).toBeVisible();
});
```

---

### 5. Admin Functions (Priority: MEDIUM)

#### Test: Admin Login
```typescript
// __tests__/e2e/admin-flow.test.ts
test('Admin can access admin panel', async ({ page }) => {
  await page.goto('/auth/login');
  
  await page.fill('[name="email"]', 'admin@example.com');
  await page.fill('[name="password"]', 'AdminPass123!');
  await page.click('button[type="submit"]');
  
  // Navigate to admin panel
  await page.goto('/admin');
  
  // Should see admin dashboard
  await expect(page.locator('text=Admin Dashboard')).toBeVisible();
});
```

#### Test: Manage Bookings
```typescript
test('Admin can view and manage bookings', async ({ page }) => {
  // Login as admin
  // ... admin login steps
  
  await page.goto('/admin/bookings');
  
  // Should see bookings list
  await expect(page.locator('table')).toBeVisible();
  
  // Can update booking status
  await page.click('button:has-text("Confirm")').first();
  await expect(page.locator('text=Status updated')).toBeVisible();
});
```

---

### 6. Mobile Compatibility (Priority: HIGH)

#### Test: Mobile Navigation
```typescript
// __tests__/e2e/mobile-navigation.test.ts
test('Mobile menu works correctly', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  
  await page.goto('/');
  
  // Click hamburger menu
  await page.click('[aria-label="Menu"]');
  
  // Menu should be visible
  await expect(page.locator('nav')).toBeVisible();
  
  // Can navigate to booking
  await page.click('text=Book Appointment');
  await expect(page).toHaveURL(/booking/);
});
```

#### Test: Mobile Booking Flow
```typescript
test('User can complete booking on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  
  // Complete full booking flow on mobile
  // ... similar to desktop booking flow
});
```

---

## Running Tests

### Run All Tests
```powershell
pnpm test:e2e
```

### Run Specific Test File
```powershell
pnpm exec playwright test __tests__/e2e/booking-flow.test.ts
```

### Run in Debug Mode
```powershell
pnpm exec playwright test --debug
```

### Run with UI
```powershell
pnpm exec playwright test --ui
```

### Generate Report
```powershell
pnpm exec playwright show-report
```

---

## Test Data Management

### Test Users

Create test users for each role:

```sql
-- User (regular customer)
INSERT INTO profiles (id, email, role, full_name)
VALUES (
  'test-user-uuid',
  'test@example.com',
  'user',
  'Test User'
);

-- Beautician
INSERT INTO profiles (id, email, role, full_name)
VALUES (
  'test-beautician-uuid',
  'beautician@example.com',
  'beautician',
  'Test Beautician'
);

-- Admin
INSERT INTO profiles (id, email, role, full_name)
VALUES (
  'test-admin-uuid',
  'admin@example.com',
  'admin',
  'Test Admin'
);
```

### Test Images

Store in `test-images/` directory:
- `face-sample.jpg` - Normal face photo
- `skin-close-up.jpg` - Close-up skin texture
- `acne-sample.jpg` - Face with acne
- `invalid-image.txt` - For error testing

---

## Manual Testing Checklist

### Before Each Release

#### Critical Features
- [ ] User can sign up
- [ ] User can login
- [ ] User can book appointment
- [ ] Payment processing works
- [ ] Email confirmation sent
- [ ] SMS confirmation sent
- [ ] AI analysis works
- [ ] Booking appears in user dashboard
- [ ] Admin can view bookings

#### User Experience
- [ ] All pages load within 3 seconds
- [ ] No console errors
- [ ] Mobile responsive on iPhone/Android
- [ ] Images load correctly
- [ ] Forms validate properly
- [ ] Error messages are clear
- [ ] Loading states work

#### Cross-Browser
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

#### Performance
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.8s
- [ ] Time to Interactive < 3.8s
- [ ] Core Web Vitals pass

---

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Install Playwright
        run: pnpm exec playwright install --with-deps
      
      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          # Add other necessary env vars
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Best Practices

### 1. Test Independence
- Each test should be independent
- Don't rely on test execution order
- Clean up test data after each test

### 2. Stable Selectors
- Use data-testid attributes
- Avoid CSS selectors that may change
- Use role-based selectors when possible

### 3. Wait Strategies
- Use `waitFor` instead of hardcoded delays
- Wait for specific elements/conditions
- Set appropriate timeouts

### 4. Test Data
- Use factories for test data
- Reset database between tests
- Use transactions when possible

### 5. Error Handling
- Test both success and failure cases
- Verify error messages
- Check edge cases

---

## Monitoring Test Results

### Playwright Reporter

View detailed test results:
```powershell
pnpm exec playwright show-report
```

### Screenshots

Failed tests automatically capture screenshots in `test-results/`.

### Videos

Enable video recording in `playwright.config.ts`:
```typescript
use: {
  video: 'retain-on-failure',
}
```

---

## Troubleshooting

### Tests Timing Out
- Increase timeout in config
- Check network speed
- Verify services are running

### Flaky Tests
- Add more specific waits
- Check for race conditions
- Increase retry count

### Authentication Issues
- Verify test user exists
- Check auth cookies
- Clear browser storage between tests

---

## Cost Estimate for Testing

### Manual Testing
- **Time:** 2-4 hours per release
- **Cost:** Free

### Automated E2E Tests
- **Setup Time:** 3-4 days initial
- **Maintenance:** 2-4 hours per month
- **CI/CD (GitHub Actions):** Free for public repos, ~$5/month for private

### External Testing Services (Optional)
- **BrowserStack:** $29/month (cross-browser testing)
- **Percy:** $29/month (visual regression testing)
- **MailHog/Mailosaur:** $20/month (email testing)

**Recommended:** Start with manual testing + basic Playwright tests (Free)

---

## Next Steps

### Week 1: Manual Testing
1. Follow manual checklist
2. Test all critical flows
3. Document any bugs found
4. Fix high-priority issues

### Week 2: Basic Automation
1. Setup Playwright
2. Write auth tests
3. Write booking flow tests
4. Setup CI/CD

### Month 2: Expand Coverage
1. Add AI analysis tests
2. Add admin function tests
3. Add mobile tests
4. Improve test stability

### Month 3: Advanced Testing
1. Add visual regression tests
2. Add performance tests
3. Add API tests
4. Setup monitoring

---

## Resources

- **Playwright Docs:** https://playwright.dev/
- **Testing Best Practices:** https://kentcdodds.com/blog/common-mistakes-with-react-testing-library
- **E2E Testing Guide:** https://martinfowler.com/articles/practical-test-pyramid.html
- **Stripe Testing:** https://stripe.com/docs/testing

---

## Summary

**Manual Testing:** 30 minutes following QUICK_START_DEPLOYMENT.md Phase 5

**Automated Testing:** 3-4 days for complete setup

**Priority:**
1. ✅ Critical flows (auth, booking, payment)
2. ✅ Mobile compatibility
3. ✅ Admin functions
4. ⭐ Optional: Visual regression, performance tests

**Ready to test!** Start with manual testing for immediate launch, then add automation incrementally. 🧪
