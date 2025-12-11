import { test, expect } from '@playwright/test'
import { getCaseStudies, type Locale } from '../../data/case-studies'

const locales: Locale[] = ['th', 'en']
const defaultLocale: Locale = 'th'

async function gotoAndAssertOk(page, url: string) {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
  expect(response?.ok(), `Expect OK response for ${url} but got ${response?.status()}`).toBeTruthy()
}

test.describe('Homepage E2E Tests', () => {
  test('redirects / to default locale', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForURL(new RegExp(`/${defaultLocale}(/|$)`), { timeout: 10000 })
    const body = page.locator('body')
    await expect(body).toBeVisible({ timeout: 5000 })
  })

  test.describe('locale pages load', () => {
    for (const locale of locales) {
      test(`/${locale} should render without 404/500`, async ({ page }) => {
        await gotoAndAssertOk(page, `/${locale}`)
        const hero = page.locator('main, body').first()
        await expect(hero).toBeVisible({ timeout: 10000 })
      })
    }
  })

  test('homepage shows key sections', async ({ page }) => {
    await gotoAndAssertOk(page, `/${defaultLocale}`)
    const headline = page.locator('h1').first()
    await expect(headline).toBeVisible({ timeout: 10000 })

    const nav = page.locator('nav, header, [class*=\"nav\"]').first()
    await expect(nav).toBeVisible({ timeout: 10000 })

    const anyCta = page.locator('button, a').first()
    await expect(anyCta).toBeVisible({ timeout: 10000 })

    const footer = page.locator('footer')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)
    await expect(footer).toBeVisible({ timeout: 5000 })
  })

  test('case study page renders content', async ({ page }) => {
    const thCaseStudies = getCaseStudies('th')
    const sample = thCaseStudies[0]
    const url = `/${defaultLocale}/case-studies/${sample.slug}`
    await gotoAndAssertOk(page, url)

    await expect(page.locator('h1, h2')).toContainText(sample.title, { timeout: 10000 })

    for (const metric of sample.metrics) {
      await expect(page.locator('body')).toContainText(metric.label)
      await expect(page.locator('body')).toContainText(metric.value)
    }
  })
})
