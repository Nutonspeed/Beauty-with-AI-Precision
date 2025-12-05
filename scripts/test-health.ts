import { setTimeout as delay } from 'timers/promises'

const TARGET = process.env.TEST_URL || 'http://localhost:3004/api/health'
const RETRIES = Number(process.env.RETRIES || 3)
const TIMEOUT_MS = Number(process.env.TIMEOUT_MS || 5000)

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: controller.signal })
    const text = await res.text()
    return { ok: res.ok, status: res.status, text }
  } finally {
    clearTimeout(timer)
  }
}

async function main() {
  console.log(`➡️  Checking health: ${TARGET}`)
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const result = await fetchWithTimeout(TARGET, TIMEOUT_MS)
      console.log(`Attempt ${attempt}: status ${result.status}, ok=${result.ok}`)
      console.log(result.text)
      if (result.ok) {
        console.log('✅ Health check passed')
        return
      }
    } catch (err) {
      console.error(`Attempt ${attempt} failed:`, err instanceof Error ? err.message : err)
    }
    if (attempt < RETRIES) {
      await delay(500)
    }
  }
  console.error('❌ Health check failed after retries')
  process.exitCode = 1
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
