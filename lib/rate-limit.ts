/**
 * Simple in-memory rate limiter for API routes
 * For production at scale, consider Redis-based solution
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /**
   * Maximum requests allowed within the window
   */
  limit: number;
  
  /**
   * Time window in milliseconds
   */
  window: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check if a request should be rate limited
 * 
 * @param identifier Unique identifier (IP address, user ID, etc.)
 * @param config Rate limit configuration
 * @returns Rate limit result with success status and metadata
 * 
 * @example
 * ```ts
 * const result = checkRateLimit(clientIp, { limit: 100, window: 60000 });
 * if (!result.success) {
 *   return NextResponse.json(
 *     { error: 'Too many requests' },
 *     { 
 *       status: 429,
 *       headers: {
 *         'X-RateLimit-Limit': result.limit.toString(),
 *         'X-RateLimit-Remaining': result.remaining.toString(),
 *         'X-RateLimit-Reset': result.reset.toString(),
 *       }
 *     }
 *   );
 * }
 * ```
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = `${identifier}:${config.window}`;
  
  let entry = rateLimitMap.get(key);
  
  // Create new entry if doesn't exist or expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.window,
    };
    rateLimitMap.set(key, entry);
  }
  
  // Increment counter
  entry.count++;
  
  const success = entry.count <= config.limit;
  const remaining = Math.max(0, config.limit - entry.count);
  
  return {
    success,
    limit: config.limit,
    remaining,
    reset: entry.resetTime,
  };
}

/**
 * Get client IP from request headers
 * Supports various proxy headers (Vercel, Cloudflare, etc.)
 */
export function getClientIp(headers: Headers): string {
  // Try various headers in order of preference
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take first IP if multiple
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp;
  
  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp;
  
  // Fallback (won't work behind proxy, but better than nothing)
  return 'unknown';
}
