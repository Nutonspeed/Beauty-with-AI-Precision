import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { withPublicAccess } from '@/lib/auth/middleware'

export const runtime = 'nodejs'

type IncomingEvent = {
  type: string
  ts: number
  payload: Record<string, unknown>
}

type IncomingBody = {
  events?: IncomingEvent[]
}

const safeJoin = (...segments: string[]) =>
  path.posix.join(...segments.filter(Boolean))

const ROOT = process.cwd() || __dirname
const DATA_DIR = safeJoin(ROOT, 'data')
const FILE_PATH = safeJoin(DATA_DIR, 'analytics-events.ndjson')

async function ensureDataFile() {
  try { await fs.mkdir(DATA_DIR, { recursive: true }) } catch {}
  try { await fs.access(FILE_PATH) } catch { await fs.writeFile(FILE_PATH, '') }
}

async function postHandler(req: NextRequest) {
  // Rate limit: 100 requests per minute per IP
  const clientIp = getClientIp(req.headers);
  const rateLimit = checkRateLimit(clientIp, {
    limit: 100,
    window: 60 * 1000, // 1 minute
  });

  if (!rateLimit.success) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Too many requests. Please try again later.',
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.reset).toISOString(),
          'Retry-After': Math.ceil((rateLimit.reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  try {
    await ensureDataFile()
    const body = (await req.json()) as IncomingBody
    const events = Array.isArray(body?.events) ? body.events : []
    if (events.length === 0) return NextResponse.json({ ok: true, written: 0 })

    // Sanitize and append as NDJSON lines
    const lines = events.map((e) => {
      const type = typeof e.type === 'string' ? e.type : 'unknown'
      const ts = typeof e.ts === 'number' ? e.ts : Date.now()
      const payload = e && typeof e.payload === 'object' && e.payload ? e.payload : {}
      // Never store base64/raw images
      const filtered: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(payload)) {
        if (typeof v === 'string' && v.startsWith('data:image')) continue
        filtered[k] = v
      }
      return JSON.stringify({ type, ts, payload: filtered })
    })
    await fs.appendFile(FILE_PATH, lines.join('\n') + '\n', 'utf8')
    return NextResponse.json({ ok: true, written: lines.length })
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 })
  }
}

// Simple aggregation for CTA experiment (debug/local dashboard use)
async function getHandler() {
  try {
    await ensureDataFile()
    const data = await fs.readFile(FILE_PATH, 'utf8')
    const lines = data.split('\n').filter(Boolean)
    let exposureA = 0
    let exposureB = 0
    let clickA_primary = 0
    let clickA_secondary = 0
    let clickB_primary = 0
    let clickB_secondary = 0

    for (const line of lines) {
      try {
        const evt = JSON.parse(line) as IncomingEvent
        if (evt.type === 'ab_exposure') {
          const v = String((evt.payload as any)?.variant || '')
          if (v === 'A') exposureA++
          else if (v === 'B') exposureB++
        } else if (evt.type === 'cta_click') {
          const v = String((evt.payload as any)?.variant || '')
          const btn = String((evt.payload as any)?.button || '')
          if (v === 'A') {
            if (btn === 'primary') clickA_primary++
            else if (btn === 'secondary') clickA_secondary++
          } else if (v === 'B') {
            if (btn === 'primary') clickB_primary++
            else if (btn === 'secondary') clickB_secondary++
          }
        }
      } catch {}
    }

    const result = {
      exposures: { A: exposureA, B: exposureB },
      clicks: {
        A: { primary: clickA_primary, secondary: clickA_secondary },
        B: { primary: clickB_primary, secondary: clickB_secondary },
      },
      ctr: {
        A: {
          primary: exposureA ? clickA_primary / exposureA : 0,
          secondary: exposureA ? clickA_secondary / exposureA : 0,
        },
        B: {
          primary: exposureB ? clickB_primary / exposureB : 0,
          secondary: exposureB ? clickB_secondary / exposureB : 0,
        },
      },
    }
    return NextResponse.json({ ok: true, result })
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 })
  }
}

export const POST = withPublicAccess(postHandler);
export const GET = withPublicAccess(getHandler);
