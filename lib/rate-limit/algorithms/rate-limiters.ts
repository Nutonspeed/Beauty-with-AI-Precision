// Advanced Rate Limiting Algorithms
import { RateLimitStorage } from '../storage/storage'

// Rate limit strategies
export enum RateLimitStrategy {
  FIXED_WINDOW = 'FIXED_WINDOW',
  SLIDING_WINDOW = 'SLIDING_WINDOW',
  TOKEN_BUCKET = 'TOKEN_BUCKET',
  LEAKY_BUCKET = 'LEAKY_BUCKET',
  FIXED_COUNTER = 'FIXED_COUNTER'
}

// Rate limit result
export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
  limit: number
  windowMs: number
}

// Rate limit config
export interface RateLimitConfig {
  windowMs: number
  max: number
  message?: string
  standardHeaders?: boolean
  legacyHeaders?: boolean
  keyGenerator?: (req: any) => string
  skip?: (req: any) => boolean
  onLimitReached?: (req: any, res: any) => void
  strategy?: RateLimitStrategy
}

// Fixed Window Counter Algorithm
export class FixedWindowCounter {
  private storage: RateLimitStorage
  private windowMs: number
  private max: number

  constructor(storage: RateLimitStorage, config: RateLimitConfig) {
    this.storage = storage
    this.windowMs = config.windowMs
    this.max = config.max
  }

  async isAllowed(key: string): Promise<RateLimitResult> {
    const now = Date.now()
    const windowStart = Math.floor(now / this.windowMs) * this.windowMs
    const windowKey = `${key}:${windowStart}`

    const current = await this.storage.increment(windowKey, 1, this.windowMs)
    
    return {
      allowed: current <= this.max,
      remaining: Math.max(0, this.max - current),
      resetTime: windowStart + this.windowMs,
      limit: this.max,
      windowMs: this.windowMs
    }
  }
}

// Sliding Window Algorithm
export class SlidingWindowCounter {
  private storage: RateLimitStorage
  private windowMs: number
  private max: number

  constructor(storage: RateLimitStorage, config: RateLimitConfig) {
    this.storage = storage
    this.windowMs = config.windowMs
    this.max = config.max
  }

  async isAllowed(key: string): Promise<RateLimitResult> {
    const now = Date.now()
    const windowStart = now - this.windowMs
    
    // Remove old entries and add new one
    await this.storage.addToList(key, now.toString(), this.windowMs)
    await this.storage.removeOldFromList(key, windowStart)
    
    const count = await this.storage.getListLength(key)
    
    return {
      allowed: count <= this.max,
      remaining: Math.max(0, this.max - count),
      resetTime: now + this.windowMs,
      limit: this.max,
      windowMs: this.windowMs
    }
  }
}

// Token Bucket Algorithm
export class TokenBucket {
  private storage: RateLimitStorage
  private windowMs: number
  private max: number
  private refillRate: number

  constructor(storage: RateLimitStorage, config: RateLimitConfig) {
    this.storage = storage
    this.windowMs = config.windowMs
    this.max = config.max
    this.refillRate = config.max / (config.windowMs / 1000) // tokens per second
  }

  async isAllowed(key: string, tokens: number = 1): Promise<RateLimitResult> {
    const now = Date.now()
    const bucketKey = `${key}:bucket`
    
    // Get current bucket state
    const bucket = await this.storage.getBucket(bucketKey)
    
    // Refill tokens based on time elapsed
    const timeElapsed = bucket.lastRefill ? (now - bucket.lastRefill) / 1000 : 0
    const tokensToAdd = Math.floor(timeElapsed * this.refillRate)
    bucket.tokens = Math.min(this.max, bucket.tokens + tokensToAdd)
    bucket.lastRefill = now
    
    // Check if enough tokens available
    if (bucket.tokens >= tokens) {
      bucket.tokens -= tokens
      await this.storage.setBucket(bucketKey, bucket, this.windowMs)
      
      return {
        allowed: true,
        remaining: bucket.tokens,
        resetTime: now + this.windowMs,
        limit: this.max,
        windowMs: this.windowMs
      }
    } else {
      // Calculate retry after
      const tokensNeeded = tokens - bucket.tokens
      const retryAfter = Math.ceil(tokensNeeded / this.refillRate * 1000)
      
      await this.storage.setBucket(bucketKey, bucket, this.windowMs)
      
      return {
        allowed: false,
        remaining: bucket.tokens,
        resetTime: now + this.windowMs,
        retryAfter,
        limit: this.max,
        windowMs: this.windowMs
      }
    }
  }
}

// Leaky Bucket Algorithm
export class LeakyBucket {
  private storage: RateLimitStorage
  private windowMs: number
  private max: number
  private leakRate: number

  constructor(storage: RateLimitStorage, config: RateLimitConfig) {
    this.storage = storage
    this.windowMs = config.windowMs
    this.max = config.max
    this.leakRate = config.max / (config.windowMs / 1000) // requests per second
  }

  async isAllowed(key: string): Promise<RateLimitResult> {
    const now = Date.now()
    const bucketKey = `${key}:leaky`
    
    // Get current bucket state
    const bucket = await this.storage.getBucket(bucketKey)
    
    // Leak requests based on time elapsed
    const timeElapsed = bucket.lastLeak ? (now - bucket.lastLeak) / 1000 : 0
    const tokensToLeak = Math.floor(timeElapsed * this.leakRate)
    bucket.queueSize = Math.max(0, bucket.queueSize - tokensToLeak)
    bucket.lastLeak = now
    
    // Check if bucket is full
    if (bucket.queueSize < this.max) {
      bucket.queueSize += 1
      await this.storage.setBucket(bucketKey, bucket, this.windowMs)
      
      return {
        allowed: true,
        remaining: this.max - bucket.queueSize,
        resetTime: now + this.windowMs,
        limit: this.max,
        windowMs: this.windowMs
      }
    } else {
      // Calculate retry after based on queue size
      const retryAfter = Math.ceil((bucket.queueSize - this.max + 1) / this.leakRate * 1000)
      
      await this.storage.setBucket(bucketKey, bucket, this.windowMs)
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: now + this.windowMs,
        retryAfter,
        limit: this.max,
        windowMs: this.windowMs
      }
    }
  }
}

// Adaptive Rate Limiting
export class AdaptiveRateLimit {
  private storage: RateLimitStorage
  private baseConfig: RateLimitConfig
  private loadThreshold: number
  private scaleFactor: number

  constructor(storage: RateLimitStorage, config: RateLimitConfig, loadThreshold: number = 0.8, scaleFactor: number = 0.5) {
    this.storage = storage
    this.baseConfig = config
    this.loadThreshold = loadThreshold
    this.scaleFactor = scaleFactor
  }

  async isAllowed(key: string): Promise<RateLimitResult> {
    // Get current system load
    const systemLoad = await this.getSystemLoad()
    
    // Adjust limits based on load
    let adjustedConfig = { ...this.baseConfig }
    if (systemLoad > this.loadThreshold) {
      adjustedConfig.max = Math.floor(adjustedConfig.max * this.scaleFactor)
    }
    
    // Use sliding window for adaptive limiting
    const slidingWindow = new SlidingWindowCounter(this.storage, adjustedConfig)
    return slidingWindow.isAllowed(key)
  }

  private async getSystemLoad(): Promise<number> {
    // This would integrate with your monitoring system
    // For now, return a mock value
    return 0.5
  }
}

// Rate Limit Factory
export class RateLimitFactory {
  static create(storage: RateLimitStorage, config: RateLimitConfig) {
    const strategy = config.strategy || RateLimitStrategy.SLIDING_WINDOW
    
    switch (strategy) {
      case RateLimitStrategy.FIXED_WINDOW:
        return new FixedWindowCounter(storage, config)
      case RateLimitStrategy.SLIDING_WINDOW:
        return new SlidingWindowCounter(storage, config)
      case RateLimitStrategy.TOKEN_BUCKET:
        return new TokenBucket(storage, config)
      case RateLimitStrategy.LEAKY_BUCKET:
        return new LeakyBucket(storage, config)
      case RateLimitStrategy.FIXED_COUNTER:
        return new FixedWindowCounter(storage, config)
      default:
        return new SlidingWindowCounter(storage, config)
    }
  }
}
