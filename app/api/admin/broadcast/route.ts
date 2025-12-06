import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/auth/middleware';

// In-memory rate limit store (use Redis in production)
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limit configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // Max 10 requests per minute

function getRateLimitKey(userId: string): string {
  return `broadcast:${userId}`;
}

function checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetAt: number } {
  const key = getRateLimitKey(userId);
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // No entry or expired window
  if (!entry || now >= entry.resetAt) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS
    };
    rateLimitStore.set(key, newEntry);
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      resetAt: newEntry.resetAt
    };
  }

  // Increment count
  entry.count++;

  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt
    };
  }

  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - entry.count,
    resetAt: entry.resetAt
  };
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

async function handler(req: NextRequest, user: any) {
  try {
    // Check rate limit
    const rateLimit = checkRateLimit(user.id);
    if (!rateLimit.allowed) {
      const resetIn = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many requests. Please try again in ${resetIn} seconds.`,
          resetAt: rateLimit.resetAt
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetAt.toString(),
            'Retry-After': resetIn.toString()
          }
        }
      );
    }

    const body = await req.json();
    const { message, filter } = body;

    if (!message || typeof message.type !== 'string') {
      return NextResponse.json({ error: 'Invalid message payload' }, { status: 400 });
    }

    // Forward to WS server /broadcast endpoint
    const wsPort = process.env.WS_PORT || '3001';
    const wsAdminSecret = process.env.WS_ADMIN_SECRET;
    if (!wsAdminSecret) {
      return NextResponse.json({ error: 'WS_ADMIN_SECRET not configured' }, { status: 500 });
    }

    const wsUrl = `http://localhost:${wsPort}/broadcast`;
    const res = await fetch(wsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ws-admin-secret': wsAdminSecret,
      },
      body: JSON.stringify({ message, filter }),
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err.error || 'Broadcast failed' }, { status: res.status });
    }

    return NextResponse.json(
      { ok: true },
      {
        headers: {
          'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetAt.toString()
        }
      }
    );
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export const POST = withAdminAuth(handler);
