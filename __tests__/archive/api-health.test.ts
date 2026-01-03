import { describe, it, expect } from 'vitest'
import { GET } from '@/app/api/ai/health/route'

describe('api/ai/health route', () => {
  it('returns shallow health with ok=true', async () => {
    const req: any = { url: 'http://localhost:3000/api/ai/health?mode=shallow' }
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toMatchObject({ ok: true, mode: 'shallow' })
    expect(Array.isArray(body.configuredProviders)).toBe(true)
  })
})
