/**
 * Simple In-Memory Rate Limiter
 * For production, use Redis-based solution
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

interface RateLimitConfig {
  windowMs: number  // Time window in milliseconds
  maxRequests: number  // Max requests per window
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
}

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(
  identifier: string,
  config: Partial<RateLimitConfig> = {}
): { allowed: boolean; remaining: number; resetIn: number } {
  const { windowMs, maxRequests } = { ...defaultConfig, ...config }
  const now = Date.now()
  
  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    cleanupExpiredEntries()
  }

  const entry = rateLimitStore.get(identifier)

  if (!entry || now > entry.resetTime) {
    // New window
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    })
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetIn: windowMs,
    }
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    }
  }

  entry.count++
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  }
}

/**
 * Clean up expired entries
 */
function cleanupExpiredEntries() {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Get rate limit headers
 */
export function getRateLimitHeaders(
  remaining: number,
  resetIn: number,
  limit: number = defaultConfig.maxRequests
): Record<string, string> {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(Date.now() / 1000 + resetIn / 1000).toString(),
  }
}

/**
 * Rate limit configurations for different endpoints
 */
export const rateLimitConfigs = {
  // Strict limits for auth endpoints
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 10 }, // 10 per 15 min
  
  // Standard API limits
  api: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 per min
  
  // Higher limits for read-only endpoints
  read: { windowMs: 60 * 1000, maxRequests: 200 }, // 200 per min
  
  // Very strict for expensive operations
  analysis: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 per min
  
  // Upload limits
  upload: { windowMs: 60 * 1000, maxRequests: 20 }, // 20 per min
}

/**
 * Example usage in API route:
 * 
 * const ip = request.headers.get('x-forwarded-for') || 'unknown'
 * const { allowed, remaining, resetIn } = checkRateLimit(ip, rateLimitConfigs.api)
 * 
 * if (!allowed) {
 *   return NextResponse.json(
 *     { error: 'Too many requests' },
 *     { status: 429, headers: getRateLimitHeaders(remaining, resetIn) }
 *   )
 * }
 */
