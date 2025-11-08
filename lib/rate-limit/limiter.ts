/**
 * Simple In-Memory Rate Limiter
 * Protects API endpoints from abuse
 * 
 * For production: Consider Redis-based rate limiting
 * For now: In-memory Map (resets on server restart)
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup old entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Check if request is allowed under rate limit
   * @param identifier - Unique identifier (e.g., user ID, IP address)
   * @param maxRequests - Maximum requests allowed in window
   * @param windowMs - Time window in milliseconds
   * @returns {allowed, remaining, resetAt}
   */
  check(
    identifier: string,
    maxRequests: number = 100,
    windowMs: number = 60 * 1000 // 1 minute default
  ): {
    allowed: boolean;
    remaining: number;
    resetAt: number;
    retryAfter?: number;
  } {
    const now = Date.now();
    const entry = this.limits.get(identifier);

    if (!entry || now > entry.resetAt) {
      // No entry or window expired - reset
      this.limits.set(identifier, {
        count: 1,
        resetAt: now + windowMs,
      });

      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetAt: now + windowMs,
      };
    }

    if (entry.count >= maxRequests) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.resetAt,
        retryAfter,
      };
    }

    // Increment count
    entry.count++;
    this.limits.set(identifier, entry);

    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetAt: entry.resetAt,
    };
  }

  /**
   * Remove expired entries to prevent memory leak
   */
  private cleanup() {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetAt) {
        this.limits.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`[RateLimiter] Cleaned up ${removed} expired entries`);
    }
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier: string) {
    this.limits.delete(identifier);
  }

  /**
   * Get current stats
   */
  getStats() {
    return {
      totalEntries: this.limits.size,
      entries: Array.from(this.limits.entries()).map(([id, entry]) => ({
        identifier: id.substring(0, 8) + '...', // Truncate for privacy
        count: entry.count,
        resetAt: new Date(entry.resetAt).toISOString(),
      })),
    };
  }

  /**
   * Destroy rate limiter and cleanup
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.limits.clear();
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

export default rateLimiter;

// ============================================================================
// Pre-configured Rate Limit Configurations
// ============================================================================

export const RATE_LIMITS = {
  // Authentication endpoints
  AUTH_LOGIN: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  AUTH_REGISTER: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },

  // Analysis endpoints
  ANALYSIS_CREATE: {
    maxRequests: 50, // 50 analyses per hour per user
    windowMs: 60 * 60 * 1000,
  },
  ANALYSIS_VIEW: {
    maxRequests: 200,
    windowMs: 60 * 1000, // 200 views per minute
  },

  // Lead management
  LEAD_CREATE: {
    maxRequests: 100, // 100 leads per hour per sales staff
    windowMs: 60 * 60 * 1000,
  },
  LEAD_UPDATE: {
    maxRequests: 200,
    windowMs: 60 * 60 * 1000,
  },

  // Share/Export
  SHARE_CREATE: {
    maxRequests: 20,
    windowMs: 60 * 60 * 1000,
  },
  EXPORT_PDF: {
    maxRequests: 30,
    windowMs: 60 * 60 * 1000,
  },

  // API General
  API_GENERAL: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 100 requests per minute
  },

  // Strict limits for public/unauthenticated
  PUBLIC_API: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 10 requests per minute
  },
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get identifier for rate limiting
 * Priority: User ID > IP Address
 */
export function getRateLimitIdentifier(
  userId?: string,
  ipAddress?: string
): string {
  if (userId) {
    return `user:${userId}`;
  }
  if (ipAddress) {
    return `ip:${ipAddress}`;
  }
  return 'anonymous';
}

/**
 * Apply rate limit to request
 */
export function applyRateLimit(
  identifier: string,
  config: { maxRequests: number; windowMs: number }
) {
  return rateLimiter.check(identifier, config.maxRequests, config.windowMs);
}

/**
 * Create rate limit error response
 */
export function createRateLimitError(retryAfter: number) {
  return {
    error: 'rate_limit_exceeded',
    message: `Too many requests. Please try again in ${retryAfter} seconds.`,
    retryAfter,
  };
}
