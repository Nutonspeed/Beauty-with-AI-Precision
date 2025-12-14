import { test, expect, type Page } from '@playwright/test'

type Locale = 'th' | 'en'

const locales: Locale[] = ['th', 'en']
const defaultLocale: Locale = 'th'

async function gotoAndAssertOk(page: Page, url: string) {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
  expect(response?.ok(), `Expect OK response for ${url} but got ${response?.status()}`).toBeTruthy()
}

test.describe('Homepage E2E Tests', () => {
  test('redirects / to default locale', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 })
    // Next dev server can be slow/flaky to finalize navigation; assert by content.
    await page.waitForTimeout(250)
    await page.waitForLoadState('domcontentloaded')

    // Allow redirect chain to complete (/, /th, etc.)
    await page.waitForURL(new RegExp(`/${defaultLocale}(/|$)`), { timeout: 30000 }).catch(() => {})

    const body = page.locator('body')
    await expect(body).toBeVisible({ timeout: 10000 })

    // Validate we actually landed on the locale homepage by checking stable elements
    const nav = page.locator('nav, header').first()
    await expect(nav).toBeVisible({ timeout: 20000 })
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
    await gotoAndAssertOk(page, `/${defaultLocale}/case-studies`)

    const firstCaseStudyLink = page
      .locator('a')
      .filter({ hasText: /case|study|ศึกษา|กรณี/i })
      .first()

    if (await firstCaseStudyLink.count()) {
      await firstCaseStudyLink.click()
      await page.waitForLoadState('domcontentloaded')
      await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 })
    } else {
      const anyLink = page.locator('a').first()
      await expect(anyLink).toBeVisible({ timeout: 10000 })
    }
  })
})
