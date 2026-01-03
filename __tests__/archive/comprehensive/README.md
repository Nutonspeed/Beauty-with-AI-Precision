# 📋 Comprehensive E2E Testing Guide

## 🎯 ปัญหาปัจจุบัน

E2E tests ในปัจจุบันเร็วเกินไปและไม่ครอบคลุม:
- ❌ Tests ทำเร็ว (2-5 วินาที)
- ❌ ไม่รอ UI โหลดเสร็จ
- ❌ ไม่ทดสอบฟีเจอร์จริง
- ❌ ไม่มี data validation
- ❌ ไม่ทดสอบ error cases

## 🚀 E2E Tests ที่ถูกต้อง

### **1. Wait Strategies**
```typescript
// ❌ ไม่ดี - ไม่รอ
await expect(element).toBeVisible()

// ✅ ดี - รอพร้อม
await expect(element).toBeVisible({ timeout: 10000 })
await page.waitForSelector('.element', { timeout: 10000 })
await page.waitForFunction(() => document.querySelector('.loaded'))
```

### **2. Test Real Features**
```typescript
// ❌ ไม่ดี - ทดสอบแค่ UI
await expect(page.locator('h1')).toBeVisible()

// ✅ ดี - ทดสอบฟีเจอร์
await uploadImage()
await waitForAnalysis()
await validateResults()
await saveToDatabase()
```

### **3. Data Validation**
```typescript
// ✅ ตรวจสอบข้อมูลจริง
const results = await page.locator('.analysis-results')
const concerns = await results.locator('.concern-item').count()
expect(concerns).toBeGreaterThan(0)

// ✅ ตรวจสอ API response
const response = await page.waitForResponse('/api/analysis')
expect(response.status()).toBe(200)
```

### **4. Error Handling**
```typescript
// ✅ ทดสอบ error cases
test('should handle upload error', async () => {
  await uploadInvalidFile()
  await expect(page.locator('.error')).toBeVisible()
  await expect(page.locator('button:has-text("ลองใหม่")')).toBeEnabled()
})
```

## 📊 Test Coverage ที่ต้องการ

### **Critical Paths**
1. **Authentication Flow**
   - Login/Logout
   - Session management
   - Role-based access

2. **AI Analysis Pipeline**
   - Image upload
   - Processing (30-60s)
   - Results display
   - Save to history

3. **Payment Flow**
   - Plan selection
   - QR generation
   - Payment verification
   - Receipt generation

4. **Data Persistence**
   - Save analysis
   - Update user plan
   - History retrieval

### **Edge Cases**
- Slow connection (3G)
- Network errors
- Invalid data
- Timeouts
- Concurrent users

## 🛠️ Setup สำหรับ E2E จริง

### **1. Test Environment**
```bash
# Test database
TEST_DB_URL=postgresql://test:test@localhost:5432/test

# Test API keys
TEST_OPENAI_API_KEY=sk-test-...
TEST_SUPABASE_URL=https://test.supabase.co

# Test mode
NODE_ENV=test
```

### **2. Test Data Fixtures**
```typescript
// fixtures/users.ts
export const testUsers = {
  clinicOwner: {
    email: 'test@clinic.com',
    password: 'test123',
    role: 'clinic_owner'
  },
  salesStaff: {
    email: 'sales@test.com',
    password: 'test123',
    role: 'sales_staff'
  }
}
```

### **3. Test Utilities**
```typescript
// utils/test-helpers.ts
export async function createTestUser(userData) {
  return await db.users.create(userData)
}

export async function cleanupTestData(testId) {
  return await db.cleanup({ testId })
}
```

## 📝 Best Practices

### **1. Test Structure**
```typescript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup
    await login()
  })

  test('should do something', async ({ page }) => {
    // Arrange
    await navigateToPage()
    
    // Act
    await performAction()
    
    // Assert
    await expect(result).toBeVisible()
  })
})
```

### **2. Timeouts**
```typescript
// Default: 30s
// API calls: 10s
// File uploads: 15s
// AI processing: 60s
// Payment: 30s
```

### **3. Selectors**
```typescript
// ✅ Good - Stable
page.locator('[data-testid="submit-button"]')
page.locator('button[type="submit"]')

// ❌ Bad - Brittle
page.locator('div > div > button')
page.locator('.btn-primary')
```

## 🚦 Running Tests

### **Development**
```bash
# Quick tests
pnpm test:e2e --grep "smoke"

# Full suite
pnpm test:e2e

# With UI
pnpm test:e2e:ui
```

### **CI/CD**
```bash
# Headless
pnpm test:e2e --headed=false

# Parallel
pnpm test:e2e --workers=4

# Report
pnpm test:e2e --reporter=html
```

## 📈 Metrics

### **Target Goals**
- **Test Duration**: 10-30 minutes
- **Coverage**: 90%+ critical paths
- **Reliability**: 95%+ pass rate
- **Speed**: Complete in < 30 minutes

### **Current Status**
- **Duration**: 5 minutes (too fast)
- **Coverage**: 60% (needs improvement)
- **Reliability**: 85% (needs improvement)

## 🎯 Next Steps

1. **Implement wait strategies**
2. **Add real feature tests**
3. **Create test data fixtures**
4. **Setup test environment**
5. **Add error case testing**
6. **Implement CI/CD integration**

---

**Remember**: Good E2E tests take time but save more time in production!
