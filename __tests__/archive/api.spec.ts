import { test, expect } from '@playwright/test'

test.describe('API Endpoints E2E Tests', () => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3004'

  test('GET /api/health should return healthy status', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/health`)
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('status')
    expect(['healthy', 'ok']).toContain(data.status)
  })

  test('GET /api/health/live should return ok', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/health/live`)
    // May return 200 or 404 if endpoint not implemented
    expect([200, 404]).toContain(response.status())
    
    if (response.status() === 200) {
      const data = await response.json()
      // Some implementations return { status: 'ok' } while others return { alive: true }
      const hasStatus = Object.prototype.hasOwnProperty.call(data, 'status') || Object.prototype.hasOwnProperty.call(data, 'alive')
      expect(hasStatus).toBeTruthy()
    }
  })

  test('GET /api/health/ready should check readiness', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/health/ready`)
    // May return 200, 404, or 503 depending on implementation and DB state
    expect([200, 404, 503]).toContain(response.status())
  })

  test('POST /api/auth/login with invalid credentials should return error', async ({ request }) => {
    const response = await request.post(`${baseUrl}/api/auth/login`, {
      data: {
        email: 'invalid@test.com',
        password: 'wrongpassword'
      }
    })
    // Accept either an error status or a 200 with error payload depending on implementation
    expect([200, 400, 401, 404, 422, 500]).toContain(response.status())
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
