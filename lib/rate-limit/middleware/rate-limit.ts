// Rate Limiting Middleware for Next.js
import { NextRequest, NextResponse } from 'next/server'
import { RateLimitFactory, RateLimitStrategy, RateLimitConfig } from '../algorithms/rate-limiters'
import { StorageFactory } from '../storage/storage'
import { rateLimitLogger } from './logger'

// Rate limit middleware configuration
export interface RateLimitMiddlewareConfig {
  general?: RateLimitConfig
  auth?: RateLimitConfig
  api?: RateLimitConfig
  upload?: RateLimitConfig
  ai?: RateLimitConfig
  database?: RateLimitConfig
  custom?: Record<string, RateLimitConfig>
}

// Default configurations
const DEFAULT_CONFIGS: RateLimitMiddlewareConfig = {
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests, please try again later.',
    strategy: RateLimitStrategy.SLIDING_WINDOW
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 auth attempts per window
    message: 'Too many authentication attempts, please try again later.',
    strategy: RateLimitStrategy.SLIDING_WINDOW
  },
  api: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // 60 API requests per minute
    message: 'API rate limit exceeded, please try again later.',
    strategy: RateLimitStrategy.TOKEN_BUCKET
  },
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 uploads per hour
    message: 'Upload limit exceeded, please try again later.',
    strategy: RateLimitStrategy.FIXED_WINDOW
  },
  ai: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // 20 AI requests per minute
    message: 'AI service rate limit exceeded, please try again later.',
    strategy: RateLimitStrategy.TOKEN_BUCKET
  },
  database: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 DB queries per minute
    message: 'Database rate limit exceeded, please try again later.',
    strategy: RateLimitStrategy.LEAKY_BUCKET
  }
}

export class RateLimitMiddleware {
  private static instance: RateLimitMiddleware
  private storage: any = null
  private configs: RateLimitMiddlewareConfig

  constructor(configs: RateLimitMiddlewareConfig = {}) {
    this.configs = { ...DEFAULT_CONFIGS, ...configs }
  }

  static getInstance(configs?: RateLimitMiddlewareConfig): RateLimitMiddleware {
    if (!RateLimitMiddleware.instance) {
      RateLimitMiddleware.instance = new RateLimitMiddleware(configs)
    }
    return RateLimitMiddleware.instance
  }

  // Initialize storage
  private async getStorage() {
    if (!this.storage) {
      this.storage = await StorageFactory.create('redis')
    }
    return this.storage
  }

  // Main middleware function
  async rateLimit(request: NextRequest, category: keyof RateLimitMiddlewareConfig = 'general'): Promise<NextResponse | null> {
    const config = this.configs[category] as RateLimitConfig
    if (!config) {
      return null // No rate limiting for this category
    }

    // Skip if configured
    if (config.skip && typeof config.skip === 'function' && await config.skip(request)) {
      return null
    }

    // Generate key for rate limiting
    const key = this.generateKey(request, config)

    try {
      const storage = await this.getStorage()
      const rateLimiter = RateLimitFactory.create(storage, config)
      const result = await rateLimiter.isAllowed(key)

      // Log rate limit event
      await this.logRateLimitEvent(request, category, result)

      if (!result.allowed) {
        // Create rate limit response
        const response = this.createRateLimitResponse(result, config)
        
        // Call limit reached callback
        if (config.onLimitReached && typeof config.onLimitReached === 'function') {
          config.onLimitReached(request, response)
        }

        return response
      }

      return null // Allowed, continue processing

    } catch (error) {
      rateLimitLogger.logError(error as Error, {
        action: 'rate_limit_check',
        category,
        key
      })
      
      // Fail open - allow request if rate limiting fails
      return null
    }
  }

  // Generate rate limit key
  private generateKey(request: NextRequest, config: RateLimitConfig): string {
    if (config.keyGenerator) {
      return config.keyGenerator(request)
    }

    // Default key generation
    const ip = this.getClientIP(request)
    const headers: any = (request as any)?.headers
    const userAgent = (typeof headers?.get === 'function'
      ? (headers.get('user-agent') || headers.get('User-Agent'))
      : (headers?.['user-agent'] || headers?.['User-Agent'] || headers?.['USER-AGENT'])) || 'unknown'
    const path = new URL((request as any)?.url || 'http://localhost').pathname
    
    // Create hash of IP + user agent for basic identification
    const identifier = `${ip}:${userAgent}`
    
    return `rate_limit:${path}:${this.hashString(identifier)}`
  }

  // Get client IP
  private getClientIP(request: NextRequest): string {
    const headers: any = (request as any)?.headers
    const getHeader = (name: string) => {
      if (!headers) return undefined
      if (typeof headers.get === 'function') return headers.get(name) || headers.get(name.toLowerCase())
      if (typeof headers === 'object') return headers[name] || headers[name.toLowerCase()] || headers[name.toUpperCase()]
      return undefined
    }

    const forwardedFor =
      getHeader('x-vercel-forwarded-for') ||
      getHeader('x-forwarded-for')
    if (forwardedFor) return String(forwardedFor).split(',')[0].trim()

    const requestIp = (request as any)?.ip

    return (
      requestIp ||
      getHeader('x-real-ip') ||
      getHeader('true-client-ip') ||
      getHeader('cf-connecting-ip') ||
      getHeader('fastly-client-ip') ||
      getHeader('x-client-ip') ||
      'unknown'
    )
  }

  // Hash string for consistent keys
  private hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  // Create rate limit response
  private createRateLimitResponse(result: { allowed: boolean; retryAfter?: number; limit: number; remaining: number; resetTime?: number }, config: RateLimitConfig): NextResponse {
    const response = NextResponse.json({
      success: false,
      error: {
        type: 'RATE_LIMIT',
        message: config.message || 'Rate limit exceeded',
        retryAfter: result.retryAfter,
        limit: result.limit,
        remaining: result.remaining,
        resetTime: result.resetTime || Date.now() + 60000
      }
    }, { status: 429 })

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', result.limit.toString())
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
    response.headers.set('X-RateLimit-Reset', (result.resetTime || Date.now() + 60000).toString())
    
    if (result.retryAfter) {
      response.headers.set('Retry-After', result.retryAfter.toString())
    }

    return response
  }

  // Log rate limit events
  private async logRateLimitEvent(request: NextRequest, category: string, result: any): Promise<void> {
    await rateLimitLogger.logInfo('Rate limit check', {
      category,
      allowed: result.allowed,
      remaining: result.remaining,
      limit: result.limit,
      ip: this.getClientIP(request),
      path: new URL(request.url).pathname,
      userAgent: request.headers.get('user-agent')
    })
  }
}

// Rate limit wrapper for API routes
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  category: keyof RateLimitMiddlewareConfig = 'general',
  configs?: RateLimitMiddlewareConfig
) {
  const middleware = RateLimitMiddleware.getInstance(configs)
  
  return async (request: NextRequest): Promise<NextResponse> => {
    // Check rate limit
    const rateLimitResponse = await middleware.rateLimit(request, category)
    
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Continue with handler
    return handler(request)
  }
}

// Specialized rate limit wrappers
export function withAuthRateLimit(handler: (req: NextRequest) => Promise<NextResponse>) {
  return withRateLimit(handler, 'auth')
}

export function withAPIRateLimit(handler: (req: NextRequest) => Promise<NextResponse>) {
  return withRateLimit(handler, 'api')
}

export function withUploadRateLimit(handler: (req: NextRequest) => Promise<NextResponse>) {
  return withRateLimit(handler, 'upload')
}

export function withAIRateLimit(handler: (req: NextRequest) => Promise<NextResponse>) {
  return withRateLimit(handler, 'ai')
}

export function withDatabaseRateLimit(handler: (req: NextRequest) => Promise<NextResponse>) {
  return withRateLimit(handler, 'database')
}

// Dynamic rate limiting based on user tier
export function withTieredRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  tiers: Record<string, RateLimitConfig>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Get user tier from request (this would depend on your auth system)
    const userTier = await getUserTier(request)
    const config = tiers[userTier] || tiers['default']
    
    const middleware = RateLimitMiddleware.getInstance({ custom: { tiered: config } } as RateLimitMiddlewareConfig)
    const rateLimitResponse = await middleware.rateLimit(request, 'tiered' as keyof RateLimitMiddlewareConfig)
    
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    return handler(request)
  }
}

// Helper function to get user tier (implement based on your auth system)
async function getUserTier(request: NextRequest): Promise<string> {
  // This would extract user tier from JWT token or session
  // For now, return default
  return 'default'
}

// DDoS protection middleware
export class DDoSProtection {
  private static instance: DDoSProtection
  private suspiciousIPs: Set<string> = new Set()
  private blockDuration: number = 60 * 60 * 1000 // 1 hour

  static getInstance(): DDoSProtection {
    if (!DDoSProtection.instance) {
      DDoSProtection.instance = new DDoSProtection()
    }
    return DDoSProtection.instance
  }

  async checkRequest(request: NextRequest): Promise<NextResponse | null> {
    const ip = this.getClientIP(request)
    
    // Check if IP is blocked
    if (this.suspiciousIPs.has(ip)) {
      return NextResponse.json({
        success: false,
        error: {
          type: 'DDOS_PROTECTION',
          message: 'Access temporarily blocked due to suspicious activity'
        }
      }, { status: 403 })
    }

    // Check for DDoS patterns
    const isSuspicious = await this.analyzeRequest(request)
    
    if (isSuspicious) {
      this.blockIP(ip)
      return NextResponse.json({
        success: false,
        error: {
          type: 'DDOS_PROTECTION',
          message: 'Access blocked due to suspicious activity'
        }
      }, { status: 429 })
    }

    return null
  }

  private getClientIP(request: NextRequest): string {
    const forwardedFor =
      request.headers.get('x-vercel-forwarded-for') ||
      request.headers.get('x-forwarded-for')
    if (forwardedFor) return String(forwardedFor).split(',')[0].trim()

    return (
      (request as any)?.ip ||
      request.headers.get('x-real-ip') ||
      request.headers.get('true-client-ip') ||
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('fastly-client-ip') ||
      request.headers.get('x-client-ip') ||
      'unknown'
    )
  }

  private async analyzeRequest(request: NextRequest): Promise<boolean> {
    // Analyze request patterns for DDoS detection
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /scraper/i
    ]

    const userAgent = request.headers.get('user-agent') || ''
    
    // Check user agent
    if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
      return true
    }

    // Check request frequency (this would need storage)
    // For now, return false
    return false
  }

  private blockIP(ip: string): void {
    this.suspiciousIPs.add(ip)
    
    // Unblock after duration
    setTimeout(() => {
      this.suspiciousIPs.delete(ip)
    }, this.blockDuration)
  }
}

// Export singleton instance
export const rateLimitMiddleware = RateLimitMiddleware.getInstance()
export const ddosProtection = DDoSProtection.getInstance()
