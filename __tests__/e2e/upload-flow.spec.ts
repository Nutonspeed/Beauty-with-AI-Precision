import { test, expect } from '@playwright/test'
import path from 'node:path'

async function login(page: import('@playwright/test').Page) {
  await page.goto('/auth/login')
  // If app redirects automatically (already logged in), bail out early
  if (/\/(analysis|clinic\/dashboard|sales\/dashboard)/.test(page.url())) {
    return
  }

  const emailField = page.getByLabel(/Email|อีเมล/i).first()
  const passwordField = page.getByLabel(/Password|รหัสผ่าน/i).first()

  await emailField.fill('clinic-owner@example.com')
  await passwordField.fill('password123')

  await Promise.all([
    page.waitForURL(/\/(analysis|clinic\/dashboard|sales\/dashboard)/, { timeout: 20000 }),
    page.getByRole('button', { name: /เข้าสู่ระบบ|Sign In/i }).click(),
  ]).catch(async () => {
    const errorAlert = page.locator('text=/อีเมลหรือรหัสผ่านไม่ถูกต้อง|invalid email or password/i')
    if (await errorAlert.first().isVisible()) {
      throw new Error('Login failed: invalid credentials displayed on page')
    }
    throw new Error('Login did not complete within expected time')
  })
}

async function seedResultsSession(page: import('@playwright/test').Page) {
  // Ensure origin is set so sessionStorage writes to the right domain
  await page.goto('/analysis')

  const tinyTransparentPng =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='

  const minimalResults = {
    overall_score: 82,
    image_url: undefined,
    metrics: {
      wrinkles: { score: 78, grade: 'B', trend: 'up', description_en: 'Fine lines present', description_th: 'มีริ้วรอยเล็กน้อย' },
      spots: { score: 74, grade: 'B', trend: 'stable', description_en: 'Mild pigmentation', description_th: 'จุดด่างดำเล็กน้อย' },
      pores: { score: 70, grade: 'B', trend: 'down', description_en: 'Visible pores', description_th: 'รูขุมขนค่อนข้างชัด' },
      texture: { score: 85, grade: 'A', trend: 'up', description_en: 'Smooth texture', description_th: 'พื้นผิวเรียบ' },
      evenness: { score: 80, grade: 'B', trend: 'stable', description_en: 'Even tone', description_th: 'โทนสีสม่ำเสมอ' },
      firmness: { score: 76, grade: 'B', trend: 'up', description_en: 'Good elasticity', description_th: 'ความยืดหยุ่นดี' },
      radiance: { score: 83, grade: 'A', trend: 'up', description_en: 'Healthy glow', description_th: 'ผิวกระจ่างใส' },
      hydration: { score: 79, grade: 'B', trend: 'stable', description_en: 'Well hydrated', description_th: 'ความชุ่มชื้นดี' },
    },
    recommendations: [
      { title_en: 'Sunscreen', title_th: 'ครีมกันแดด', description_en: 'Use SPF 50 daily', description_th: 'ใช้ SPF 50 ทุกวัน', priority: 'high' },
      { title_en: 'Moisturizer', title_th: 'มอยส์เจอไรเซอร์', description_en: 'Apply twice daily', description_th: 'ทาวันละ 2 ครั้ง', priority: 'medium' },
      { title_en: 'Retinoids', title_th: 'เรตินอยด์', description_en: 'Use at night', description_th: 'ใช้ก่อนนอน', priority: 'low' },
    ],
    skin_type: 'combination',
    age_estimate: 28,
    confidence: 88,
    aiData: {
      totalProcessingTime: 950,
      faceDetection: {
        landmarks: [
          { x: 0.1, y: 0.2, z: 0 },
          { x: 0.3, y: 0.4, z: 0 },
          { x: 0.5, y: 0.6, z: 0 },
        ],
        confidence: 0.98,
        processingTime: 120,
      },
      skinAnalysis: {
        overallScore: 82,
        processingTime: 830,
        concerns: [
          { type: 'spots', severity: 45, confidence: 0.85 },
          { type: 'pores', severity: 60, confidence: 0.8 },
        ],
      },
      qualityReport: {
        score: 92,
        issues: [],
      },
    },
  }

  await page.evaluate(({ img, results }: { img: string; results: unknown }) => {
    sessionStorage.setItem('analysisImage', img)
    sessionStorage.setItem('analysisResults', JSON.stringify(results))
    sessionStorage.setItem('analysisTier', 'free')
  }, { img: tinyTransparentPng, results: minimalResults })
}

test.describe('Skin Analysis Upload Flow', () => {
  test('should complete full upload and analysis workflow', async ({ page }) => {
    // 1. Login first
    await login(page)

    if (!page.url().includes('/analysis')) {
      await page.goto('/analysis')
    }

    // 2. Wait for page to load
    await expect(page.locator('h1')).toContainText(/AI Skin Analysis|วิเคราะห์ผิว/i)

    // 3. Upload test image
    const fileInput = page.locator('input[type="file"]')
    const testImagePath = path.resolve(__dirname, '../../public/placeholder-user.jpg')
    await fileInput.setInputFiles(testImagePath)
    
    // 4. Wait for AI processing
    await expect(page.locator('text=/Processing|กำลังวิเคราะห์/i')).toBeVisible()
    
    // 5. Should detect 478 landmarks (wait up to 10 seconds)
    await expect(page.locator('text=/478.*landmarks|478.*จุด/i')).toBeVisible({ timeout: 10000 })
    
    // 6. Should navigate to results page
    await expect(page).toHaveURL(/\/analysis\/results/, { timeout: 15000 })
    
    // 7. Verify overall score is displayed
    await expect(page.locator('text=/Overall Score|คะแนนรวม/i')).toBeVisible()
    
    // 8. Click AI Details tab
    const aiDetailsTab = page.locator('button:has-text("AI Details")')
    await aiDetailsTab.click()
    
    // 9. Verify AI Details tab content
    await expect(page.locator('text=/Total Processing Time|เวลาประมวลผลรวม/i')).toBeVisible()
    
    // 10. Verify Face Detection metrics
    await expect(page.locator('text=/Face Detection|การตรวจจับใบหน้า/i')).toBeVisible()
    await expect(page.locator('text=/478/i')).toBeVisible()
    
    // 11. Verify Canvas visualization exists
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
    
    // 12. Verify landmark count on canvas
    await expect(page.locator('text=/478 landmarks/i')).toBeVisible()
    
    // 13. Verify confidence score
    await expect(page.locator('text=/Confidence|ความมั่นใจ/i')).toBeVisible()
    
    // 14. Verify legend is displayed
    await expect(page.locator('text=/Face Oval|โครงหน้า/i')).toBeVisible()
    await expect(page.locator('text=/Eyebrows|คิ้ว/i')).toBeVisible()
    await expect(page.locator('text=/Eyes|ตา/i')).toBeVisible()
    
    // 15. Verify Performance Metrics section
    await expect(page.locator('text=/Performance Metrics|ประสิทธิภาพ/i')).toBeVisible()
    
    // 16. Verify Technology Stack section
    await expect(page.locator('text=/Technology Stack|เทคโนโลยี/i')).toBeVisible()
    await expect(page.locator('text=/MediaPipe/i')).toBeVisible()
    await expect(page.locator('text=/TensorFlow/i')).toBeVisible()
  })

  test('should handle upload errors gracefully', async ({ page }) => {
    await login(page)
    await page.goto('/analysis')

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('not an image'),
    })

    await expect(page.locator('text=/error|ผิดพลาด/i')).toBeVisible({ timeout: 5000 })
  })

  test('should display loading states during processing', async ({ page }) => {
    await login(page)
    await page.goto('/analysis')

    const fileInput = page.locator('input[type="file"]')
    const testImagePath = path.resolve(__dirname, '../../public/placeholder-user.jpg')
    await fileInput.setInputFiles(testImagePath)

    await expect(page.locator('text=/Processing|กำลังประมวลผล/i')).toBeVisible()
    await expect(page.locator('text=/Detecting face|ตรวจจับใบหน้า/i')).toBeVisible()
    await expect(page.locator('text=/Analyzing skin|วิเคราะห์ผิว/i')).toBeVisible()
  })

  test('should allow switching between tabs in results page', async ({ page }) => {
    await login(page)
    await seedResultsSession(page)
    await page.goto('/analysis/results')

    const overviewTab = page.locator('button:has-text("Overview")')
    await overviewTab.click()
    await expect(page.locator('text=/Overall Score|คะแนนรวม/i')).toBeVisible()

    const aiDetailsTab = page.locator('button:has-text("AI Details")')
    await aiDetailsTab.click()
    await expect(page.locator('text=/Total Processing Time/i')).toBeVisible()

    const recommendationsTab = page.locator('button:has-text("Recommendations")')
    await recommendationsTab.click()
    await expect(page.locator('text=/Recommended|แนะนำ/i')).toBeVisible()
  })
})

test.describe('Canvas Visualization', () => {
  test('should render canvas with correct dimensions', async ({ page }) => {
    await login(page)
    await seedResultsSession(page)
    await page.goto('/analysis/results')
    await page.locator('button:has-text("AI Details")').click()
    
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
    
    // Canvas should have reasonable dimensions
    const box = await canvas.boundingBox()
    expect(box).toBeTruthy()
    expect(box!.width).toBeGreaterThan(0)
    expect(box!.height).toBeGreaterThan(0)
    expect(box!.width).toBeLessThanOrEqual(600)
    expect(box!.height).toBeLessThanOrEqual(600)
  })

  test('should display all landmark colors', async ({ page }) => {
    await login(page)
    await seedResultsSession(page)
    await page.goto('/analysis/results')
    await page.locator('button:has-text("AI Details")').click()
    
    // Verify legend contains all color descriptions
    await expect(page.locator('text=Face Oval')).toBeVisible()
    await expect(page.locator('text=Eyebrows')).toBeVisible()
    await expect(page.locator('text=Eyes')).toBeVisible()
    await expect(page.locator('text=Nose')).toBeVisible()
    await expect(page.locator('text=Lips')).toBeVisible()
  })
})

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await login(page)
    await page.goto('/analysis')

    const dropzoneButton = page.getByRole('button', { name: /Click to upload|คลิกเพื่ออัปโหลด/i })
    await expect(dropzoneButton).toBeVisible()
  })

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await login(page)
    await page.goto('/analysis')
    
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should work on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await login(page)
    await page.goto('/analysis')
    
    await expect(page.locator('h1')).toBeVisible()
  })
})
