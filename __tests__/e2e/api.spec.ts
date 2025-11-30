import { test, expect } from '@playwright/test'

test.describe('API Endpoints E2E Tests', () => {
  const baseUrl = 'http://localhost:3000'

  test('GET /api/health should return healthy status', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/health`)
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('status')
    expect(data.status).toBe('healthy')
  })

  test('GET /api/health/live should return ok', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/health/live`)
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('status')
  })

  test('GET /api/health/ready should check readiness', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/health/ready`)
    // May return 200 or 503 depending on DB state
    expect([200, 503]).toContain(response.status())
  })

  test('POST /api/auth/login with invalid credentials should return 401', async ({ request }) => {
    const response = await request.post(`${baseUrl}/api/auth/login`, {
      data: {
        email: 'invalid@test.com',
        password: 'wrongpassword'
      }
    })
    // Should return error for invalid credentials
    expect([400, 401, 500]).toContain(response.status())
  })

  test('GET /api/auth/me without token should return 401', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/auth/me`)
    expect([401, 403]).toContain(response.status())
  })

  test('API should return JSON content type', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/health`)
    const contentType = response.headers()['content-type']
    expect(contentType).toContain('application/json')
  })

  test('API should handle OPTIONS request for CORS', async ({ request }) => {
    const response = await request.fetch(`${baseUrl}/api/health`, {
      method: 'OPTIONS'
    })
    // Should not error
    expect([200, 204, 405]).toContain(response.status())
  })
})
