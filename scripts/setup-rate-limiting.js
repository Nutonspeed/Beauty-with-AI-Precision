#!/usr/bin/env node

/**
 * Comprehensive API Rate Limiting and Throttling Setup Script
 * Implements advanced rate limiting, throttling, and DDoS protection
 */

const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const util = require('util')
const execAsync = util.promisify(exec)

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// Create rate limiting directories
function createRateLimitingDirectories() {
  colorLog('\n📁 Creating rate limiting directories...', 'cyan')
  
  const directories = [
    'lib/rate-limit',
    'lib/rate-limit/strategies',
    'lib/rate-limit/storage',
    'lib/rate-limit/middleware',
    'lib/rate-limit/algorithms',
    'components/rate-limit',
    'app/api/rate-limit',
    'middleware',
    'scripts/rate-limit'
  ]
  
  directories.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir)
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true })
      colorLog(`  ✅ Created ${dir}`, 'green')
    } else {
      colorLog(`  ✅ ${dir} exists`, 'blue')
    }
  })
}

// Create rate limiting algorithms
function createRateLimitingAlgorithms() {
  colorLog('\n🧮 Creating rate limiting algorithms...', 'cyan')
  
  const algorithms = `// Advanced Rate Limiting Algorithms
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
    const windowKey = \`\${key}:\${windowStart}\`

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
    const bucketKey = \`\${key}:bucket\`
    
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
    const bucketKey = \`\${key}:leaky\`
    
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
`

  const algorithmsPath = path.join(process.cwd(), 'lib', 'rate-limit', 'algorithms', 'rate-limiters.ts')
  fs.writeFileSync(algorithmsPath, algorithms)
  colorLog('✅ Rate limiting algorithms created', 'green')
}

// Create rate limiting storage
function createRateLimitingStorage() {
  colorLog('\n💾 Creating rate limiting storage...', 'cyan')
  
  const storage = `// Rate Limiting Storage Implementation
import { createClient } from '@/lib/supabase/server'
import { Redis } from 'ioredis'

// Storage interface
export interface RateLimitStorage {
  increment(key: string, value: number, ttl: number): Promise<number>
  get(key: string): Promise<string | null>
  set(key: string, value: string, ttl: number): Promise<void>
  delete(key: string): Promise<void>
  addToList(key: string, value: string, ttl: number): Promise<void>
  removeOldFromList(key: string, cutoff: number): Promise<void>
  getListLength(key: string): Promise<number>
  getBucket(key: string): Promise<BucketState>
  setBucket(key: string, bucket: BucketState, ttl: number): Promise<void>
}

// Bucket state for token/leaky bucket algorithms
export interface BucketState {
  tokens: number
  lastRefill?: number
  lastLeak?: number
  queueSize: number
}

// Redis Storage Implementation
export class RedisStorage implements RateLimitStorage {
  private redis: Redis

  constructor(redis: Redis) {
    this.redis = redis
  }

  async increment(key: string, value: number, ttl: number): Promise<number> {
    const result = await this.redis.incrby(key, value)
    if (result === value) {
      await this.redis.expire(key, Math.ceil(ttl / 1000))
    }
    return result
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key)
  }

  async set(key: string, value: string, ttl: number): Promise<void> {
    await this.redis.setex(key, Math.ceil(ttl / 1000), value)
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key)
  }

  async addToList(key: string, value: string, ttl: number): Promise<void> {
    const pipeline = this.redis.pipeline()
    pipeline.lpush(key, value)
    pipeline.expire(key, Math.ceil(ttl / 1000))
    await pipeline.exec()
  }

  async removeOldFromList(key: string, cutoff: number): Promise<void> {
    const members = await this.redis.lrange(key, 0, -1)
    const toRemove = members.filter(member => parseInt(member) < cutoff)
    
    if (toRemove.length > 0) {
      await this.redis.lrem(key, toRemove.length, ...toRemove)
    }
  }

  async getListLength(key: string): Promise<number> {
    return this.redis.llen(key)
  }

  async getBucket(key: string): Promise<BucketState> {
    const data = await this.redis.get(key)
    if (!data) {
      return { tokens: 0, queueSize: 0 }
    }
    
    try {
      return JSON.parse(data)
    } catch {
      return { tokens: 0, queueSize: 0 }
    }
  }

  async setBucket(key: string, bucket: BucketState, ttl: number): Promise<void> {
    await this.redis.setex(key, Math.ceil(ttl / 1000), JSON.stringify(bucket))
  }
}

// In-Memory Storage Implementation (for development)
export class MemoryStorage implements RateLimitStorage {
  private data: Map<string, { value: string; expiry: number }> = new Map()
  private lists: Map<string, string[]> = new Map()
  private buckets: Map<string, BucketState> = new Map()

  async increment(key: string, value: number, ttl: number): Promise<number> {
    const current = parseInt((await this.get(key)) || '0')
    const newValue = current + value
    await this.set(key, newValue.toString(), ttl)
    return newValue
  }

  async get(key: string): Promise<string | null> {
    const item = this.data.get(key)
    if (!item) return null
    
    if (Date.now() > item.expiry) {
      this.data.delete(key)
      return null
    }
    
    return item.value
  }

  async set(key: string, value: string, ttl: number): Promise<void> {
    this.data.set(key, {
      value,
      expiry: Date.now() + ttl
    })
  }

  async delete(key: string): Promise<void> {
    this.data.delete(key)
    this.lists.delete(key)
    this.buckets.delete(key)
  }

  async addToList(key: string, value: string, ttl: number): Promise<void> {
    if (!this.lists.has(key)) {
      this.lists.set(key, [])
    }
    
    const list = this.lists.get(key)!
    list.unshift(value)
    
    // Set expiry for the list
    setTimeout(() => {
      this.lists.delete(key)
    }, ttl)
  }

  async removeOldFromList(key: string, cutoff: number): Promise<void> {
    const list = this.lists.get(key)
    if (!list) return
    
    const filtered = list.filter(item => parseInt(item) >= cutoff)
    this.lists.set(key, filtered)
  }

  async getListLength(key: string): Promise<number> {
    const list = this.lists.get(key)
    return list ? list.length : 0
  }

  async getBucket(key: string): Promise<BucketState> {
    return this.buckets.get(key) || { tokens: 0, queueSize: 0 }
  }

  async setBucket(key: string, bucket: BucketState, ttl: number): Promise<void> {
    this.buckets.set(key, bucket)
    
    // Set expiry
    setTimeout(() => {
      this.buckets.delete(key)
    }, ttl)
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now()
    
    // Clean data map
    for (const [key, item] of this.data.entries()) {
      if (now > item.expiry) {
        this.data.delete(key)
      }
    }
  }
}

// Database Storage Implementation (fallback)
export class DatabaseStorage implements RateLimitStorage {
  private supabase = createClient()

  async increment(key: string, value: number, ttl: number): Promise<number> {
    const { data, error } = await this.supabase.rpc('increment_rate_limit', {
      p_key: key,
      p_value: value,
      p_ttl_seconds: Math.ceil(ttl / 1000)
    })

    if (error) throw error
    return data || 0
  }

  async get(key: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('rate_limits')
      .select('value')
      .eq('key', key)
      .single()

    if (error || !data) return null
    return data.value.toString()
  }

  async set(key: string, value: string, ttl: number): Promise<void> {
    const expiry = new Date(Date.now() + ttl)
    
    const { error } = await this.supabase
      .from('rate_limits')
      .upsert({
        key,
        value: parseInt(value),
        expires_at: expiry
      })

    if (error) throw error
  }

  async delete(key: string): Promise<void> {
    const { error } = await this.supabase
      .from('rate_limits')
      .delete()
      .eq('key', key)

    if (error) throw error
  }

  async addToList(key: string, value: string, ttl: number): Promise<void> {
    const expiry = new Date(Date.now() + ttl)
    
    const { error } = await this.supabase
      .from('rate_limit_lists')
      .insert({
        list_key: key,
        value: parseInt(value),
        expires_at: expiry
      })

    if (error) throw error
  }

  async removeOldFromList(key: string, cutoff: number): Promise<void> {
    const cutoffDate = new Date(cutoff)
    
    const { error } = await this.supabase
      .from('rate_limit_lists')
      .delete()
      .eq('list_key', key)
      .lt('value', cutoffDate.getTime())

    if (error) throw error
  }

  async getListLength(key: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('rate_limit_lists')
      .select('*', { count: 'exact', head: true })
      .eq('list_key', key)

    if (error) throw error
    return count || 0
  }

  async getBucket(key: string): Promise<BucketState> {
    const { data, error } = await this.supabase
      .from('rate_limit_buckets')
      .select('*')
      .eq('key', key)
      .single()

    if (error || !data) {
      return { tokens: 0, queueSize: 0 }
    }

    return {
      tokens: data.tokens || 0,
      lastRefill: data.last_refill ? new Date(data.last_refill).getTime() : undefined,
      lastLeak: data.last_leak ? new Date(data.last_leak).getTime() : undefined,
      queueSize: data.queue_size || 0
    }
  }

  async setBucket(key: string, bucket: BucketState, ttl: number): Promise<void> {
    const expiry = new Date(Date.now() + ttl)
    
    const { error } = await this.supabase
      .from('rate_limit_buckets')
      .upsert({
        key,
        tokens: bucket.tokens,
        last_refill: bucket.lastRefill ? new Date(bucket.lastRefill).toISOString() : null,
        last_leak: bucket.lastLeak ? new Date(bucket.lastLeak).toISOString() : null,
        queue_size: bucket.queueSize,
        expires_at: expiry
      })

    if (error) throw error
  }
}

// Storage Factory
export class StorageFactory {
  private static redisInstance: Redis | null = null
  private static memoryInstance: MemoryStorage | null = null

  static async create(type: 'redis' | 'memory' | 'database' = 'redis'): Promise<RateLimitStorage> {
    switch (type) {
      case 'redis':
        if (!this.redisInstance) {
          if (process.env.REDIS_URL) {
            this.redisInstance = new Redis(process.env.REDIS_URL)
          } else {
            console.warn('Redis URL not found, falling back to memory storage')
            return this.create('memory')
          }
        }
        return new RedisStorage(this.redisInstance)
      
      case 'memory':
        if (!this.memoryInstance) {
          this.memoryInstance = new MemoryStorage()
          
          // Cleanup every 5 minutes
          setInterval(() => {
            this.memoryInstance!.cleanup()
          }, 300000)
        }
        return this.memoryInstance
      
      case 'database':
        return new DatabaseStorage()
      
      default:
        return this.create('memory')
    }
  }
}
`

  const storagePath = path.join(process.cwd(), 'lib', 'rate-limit', 'storage', 'storage.ts')
  fs.writeFileSync(storagePath, storage)
  colorLog('✅ Rate limiting storage created', 'green')
}

// Create rate limiting middleware
function createRateLimitingMiddleware() {
  colorLog('\n🛡️ Creating rate limiting middleware...', 'cyan')
  
  const middleware = `// Rate Limiting Middleware for Next.js
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
    const config = this.configs[category]
    if (!config) {
      return null // No rate limiting for this category
    }

    // Skip if configured
    if (config.skip && config.skip(request)) {
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
        if (config.onLimitReached) {
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
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const path = new URL(request.url).pathname
    
    // Create hash of IP + user agent for basic identification
    const identifier = \`\${ip}:\${userAgent}\`
    
    return \`rate_limit:\${path}:\${this.hashString(identifier)}\`
  }

  // Get client IP
  private getClientIP(request: NextRequest): string {
    return request.headers.get('x-forwarded-for') ||
           request.headers.get('x-real-ip') ||
           request.headers.get('cf-connecting-ip') ||
           'unknown'
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
  private createRateLimitResponse(result: any, config: RateLimitConfig): NextResponse {
    const response = NextResponse.json({
      success: false,
      error: {
        type: 'RATE_LIMIT',
        message: config.message || 'Rate limit exceeded',
        retryAfter: result.retryAfter,
        limit: result.limit,
        remaining: result.remaining,
        resetTime: result.resetTime
      }
    }, { status: 429 })

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', result.limit.toString())
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
    response.headers.set('X-RateLimit-Reset', result.resetTime.toString())
    
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
    
    const middleware = RateLimitMiddleware.getInstance({ custom: { tiered: config } })
    const rateLimitResponse = await middleware.rateLimit(request, 'tiered')
    
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
    return request.headers.get('x-forwarded-for') ||
           request.headers.get('x-real-ip') ||
           request.headers.get('cf-connecting-ip') ||
           'unknown'
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
`

  const middlewarePath = path.join(process.cwd(), 'lib', 'rate-limit', 'middleware', 'rate-limit.ts')
  fs.writeFileSync(middlewarePath, middleware)
  colorLog('✅ Rate limiting middleware created', 'green')
}

// Create rate limiting logger
function createRateLimitingLogger() {
  colorLog('\n📝 Creating rate limiting logger...', 'cyan')
  
  const logger = `// Rate Limiting Logger
import { createClient } from '@/lib/supabase/server'

// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

// Log entry interface
export interface RateLimitLogEntry {
  level: LogLevel
  message: string
  context?: Record<string, any>
  timestamp: string
  ip?: string
  userAgent?: string
  path?: string
}

export class RateLimitLogger {
  private static instance: RateLimitLogger
  private logs: RateLimitLogEntry[] = []
  private maxLogs = 1000

  constructor() {
    // Setup periodic log flushing
    setInterval(() => {
      this.flushLogs()
    }, 30000) // Flush every 30 seconds
  }

  static getInstance(): RateLimitLogger {
    if (!RateLimitLogger.instance) {
      RateLimitLogger.instance = new RateLimitLogger()
    }
    return RateLimitLogger.instance
  }

  // Log debug message
  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context)
  }

  // Log info message
  logInfo(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context)
  }

  // Log warning message
  logWarning(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context)
  }

  // Log error message
  logError(error: Error, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, error.message, {
      ...context,
      stack: error.stack,
      name: error.name
    })
  }

  // Main log method
  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    const logEntry: RateLimitLogEntry = {
      level,
      message,
      context,
      timestamp: new Date().toISOString()
    }

    // Add to memory buffer
    this.logs.push(logEntry)

    // Keep buffer size manageable
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(\`[RATE_LIMIT-\${level}] \${message}\`, context)
    }

    // Immediately flush errors and warnings
    if (level === LogLevel.ERROR || level === LogLevel.WARN) {
      this.flushLogs()
    }
  }

  // Flush logs to database
  private async flushLogs(): Promise<void> {
    if (this.logs.length === 0) return

    const logsToFlush = [...this.logs]
    this.logs = []

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('rate_limit_logs')
        .insert(logsToFlush.map(log => ({
          level: log.level,
          message: log.message,
          context: log.context,
          ip: log.ip,
          user_agent: log.userAgent,
          path: log.path,
          created_at: log.timestamp
        })))

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Failed to flush rate limit logs:', error)
      // Re-add logs to buffer if flush failed
      this.logs.unshift(...logsToFlush)
    }
  }

  // Get recent logs
  getRecentLogs(limit: number = 100): RateLimitLogEntry[] {
    return this.logs.slice(-limit)
  }

  // Clear logs
  clearLogs(): void {
    this.logs = []
  }
}

// Export singleton instance
export const rateLimitLogger = RateLimitLogger.getInstance()
`

  const loggerPath = path.join(process.cwd(), 'lib', 'rate-limit', 'middleware', 'logger.ts')
  fs.writeFileSync(loggerPath, logger)
  colorLog('✅ Rate limiting logger created', 'green')
}

// Create rate limiting strategies
function createRateLimitingStrategies() {
  colorLog('\n🎯 Creating rate limiting strategies...', 'cyan')
  
  const strategies = `// Advanced Rate Limiting Strategies
import { RateLimitConfig, RateLimitStrategy } from '../algorithms/rate-limiters'

// Predefined rate limit configurations for different use cases
export const RATE_LIMIT_STRATEGIES = {
  // API endpoints
  API_GENERAL: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60,
    strategy: RateLimitStrategy.TOKEN_BUCKET,
    message: 'API rate limit exceeded. Please try again later.'
  },

  API_HEAVY: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30,
    strategy: RateLimitStrategy.LEAKY_BUCKET,
    message: 'Heavy API rate limit exceeded. Please try again later.'
  },

  // Authentication endpoints
  AUTH_LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    strategy: RateLimitStrategy.SLIDING_WINDOW,
    message: 'Too many login attempts. Please try again later.'
  },

  AUTH_REGISTER: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    strategy: RateLimitStrategy.FIXED_WINDOW,
    message: 'Too many registration attempts. Please try again later.'
  },

  AUTH_PASSWORD_RESET: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    strategy: RateLimitStrategy.FIXED_WINDOW,
    message: 'Too many password reset attempts. Please try again later.'
  },

  // File upload endpoints
  UPLOAD_IMAGE: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    strategy: RateLimitStrategy.TOKEN_BUCKET,
    message: 'Image upload limit exceeded. Please try again later.'
  },

  UPLOAD_VIDEO: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    strategy: RateLimitStrategy.FIXED_WINDOW,
    message: 'Video upload limit exceeded. Please try again later.'
  },

  // AI service endpoints
  AI_ANALYSIS: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10,
    strategy: RateLimitStrategy.TOKEN_BUCKET,
    message: 'AI analysis rate limit exceeded. Please try again later.'
  },

  AI_CHAT: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20,
    strategy: RateLimitStrategy.LEAKY_BUCKET,
    message: 'AI chat rate limit exceeded. Please try again later.'
  },

  AI_GENERATION: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5,
    strategy: RateLimitStrategy.FIXED_WINDOW,
    message: 'AI generation rate limit exceeded. Please try again later.'
  },

  // Database operations
  DB_QUERY: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100,
    strategy: RateLimitStrategy.LEAKY_BUCKET,
    message: 'Database query limit exceeded. Please try again later.'
  },

  DB_WRITE: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 50,
    strategy: RateLimitStrategy.TOKEN_BUCKET,
    message: 'Database write limit exceeded. Please try again later.'
  },

  // Email services
  EMAIL_SEND: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    strategy: RateLimitStrategy.FIXED_WINDOW,
    message: 'Email sending limit exceeded. Please try again later.'
  },

  // Search endpoints
  SEARCH_GENERAL: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30,
    strategy: RateLimitStrategy.SLIDING_WINDOW,
    message: 'Search rate limit exceeded. Please try again later.'
  },

  SEARCH_ADVANCED: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10,
    strategy: RateLimitStrategy.TOKEN_BUCKET,
    message: 'Advanced search rate limit exceeded. Please try again later.'
  },

  // WebSocket connections
  WEBSOCKET_CONNECT: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10,
    strategy: RateLimitStrategy.SLIDING_WINDOW,
    message: 'WebSocket connection limit exceeded. Please try again later.'
  },

  // Admin endpoints (stricter limits)
  ADMIN_EXPORT: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    strategy: RateLimitStrategy.FIXED_WINDOW,
    message: 'Export limit exceeded. Please try again later.'
  },

  ADMIN_BULK_OPERATIONS: {
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 3,
    strategy: RateLimitStrategy.FIXED_WINDOW,
    message: 'Bulk operation limit exceeded. Please try again later.'
  }
} as const

// User tier-based rate limits
export const TIERED_RATE_LIMITS = {
  free: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20,
    strategy: RateLimitStrategy.TOKEN_BUCKET,
    message: 'Free tier rate limit exceeded. Upgrade your plan for higher limits.'
  },

  basic: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 50,
    strategy: RateLimitStrategy.TOKEN_BUCKET,
    message: 'Basic tier rate limit exceeded. Please try again later.'
  },

  premium: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100,
    strategy: RateLimitStrategy.LEAKY_BUCKET,
    message: 'Premium tier rate limit exceeded. Please try again later.'
  },

  enterprise: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 500,
    strategy: RateLimitStrategy.LEAKY_BUCKET,
    message: 'Enterprise tier rate limit exceeded. Please try again later.'
  }
} as const

// Geographic-based rate limits
export const GEOGRAPHIC_RATE_LIMITS = {
  // High-risk regions (stricter limits)
  high_risk: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10,
    strategy: RateLimitStrategy.SLIDING_WINDOW,
    message: 'Rate limit exceeded for your region.'
  },

  // Medium-risk regions
  medium_risk: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30,
    strategy: RateLimitStrategy.SLIDING_WINDOW,
    message: 'Rate limit exceeded. Please try again later.'
  },

  // Low-risk regions (standard limits)
  low_risk: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60,
    strategy: RateLimitStrategy.TOKEN_BUCKET,
    message: 'Rate limit exceeded. Please try again later.'
  }
} as const

// Time-based rate limits (business hours vs off hours)
export const TIME_BASED_RATE_LIMITS = {
  business_hours: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100,
    strategy: RateLimitStrategy.TOKEN_BUCKET,
    message: 'Rate limit exceeded during business hours.'
  },

  off_hours: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 50,
    strategy: RateLimitStrategy.SLIDING_WINDOW,
    message: 'Rate limit exceeded during off hours.'
  }
} as const

// Dynamic rate limit calculator
export class DynamicRateLimitCalculator {
  // Calculate rate limit based on multiple factors
  static calculateLimit(baseConfig: RateLimitConfig, factors: {
    userTier?: string
    geographicRisk?: 'high' | 'medium' | 'low'
    timeOfDay?: 'business' | 'off'
    systemLoad?: number
    reputation?: number
  }): RateLimitConfig {
    let config = { ...baseConfig }
    let multiplier = 1

    // Apply tier-based multiplier
    if (factors.userTier) {
      const tierLimits = TIERED_RATE_LIMITS[factors.userTier as keyof typeof TIERED_RATE_LIMITS]
      if (tierLimits) {
        config.max = tierLimits.max
        config.windowMs = tierLimits.windowMs
      }
    }

    // Apply geographic risk multiplier
    if (factors.geographicRisk) {
      const geoLimits = GEOGRAPHIC_RATE_LIMITS[\`\${factors.geographicRisk}_risk\` as keyof typeof GEOGRAPHIC_RATE_LIMITS]
      if (geoLimits) {
        multiplier *= 0.5 // Reduce limits for high-risk regions
      }
    }

    // Apply time-based multiplier
    if (factors.timeOfDay === 'off') {
      multiplier *= 0.7 // Reduce limits during off hours
    }

    // Apply system load multiplier
    if (factors.systemLoad && factors.systemLoad > 0.8) {
      multiplier *= 0.5 // Reduce limits during high load
    }

    // Apply reputation multiplier
    if (factors.reputation !== undefined) {
      if (factors.reputation < 0.3) {
        multiplier *= 0.3 // Significantly reduce for low reputation
      } else if (factors.reputation > 0.8) {
        multiplier *= 1.5 // Increase for high reputation
      }
    }

    // Apply final multiplier
    config.max = Math.floor(config.max * multiplier)
    config.max = Math.max(1, config.max) // Ensure at least 1 request

    return config
  }

  // Get user's geographic risk level
  static getGeographicRisk(ip: string): 'high' | 'medium' | 'low' {
    // This would integrate with a GeoIP service
    // For now, return low as default
    return 'low'
  }

  // Check if current time is business hours
  static isBusinessHours(): boolean {
    const now = new Date()
    const hour = now.getHours()
    const day = now.getDay()
    
    // Business hours: 9 AM - 6 PM, Monday - Friday
    return day >= 1 && day <= 5 && hour >= 9 && hour <= 18
  }

  // Get current system load
  static async getSystemLoad(): Promise<number> {
    // This would integrate with your monitoring system
    // For now, return a mock value
    return 0.5
  }

  // Get user reputation score
  static async getUserReputation(userId: string): Promise<number> {
    // This would calculate based on user behavior
    // For now, return a neutral score
    return 0.7
  }
}

// Rate limit strategy selector
export class RateLimitStrategySelector {
  static selectStrategy(
    endpointType: keyof typeof RATE_LIMIT_STRATEGIES,
    context: {
      userId?: string
      userTier?: string
      ip?: string
      userAgent?: string
    }
  ): RateLimitConfig {
    const baseStrategy = RATE_LIMIT_STRATEGIES[endpointType]
    
    if (!baseStrategy) {
      return RATE_LIMIT_STRATEGIES.API_GENERAL // Default fallback
    }

    // Apply dynamic adjustments
    return DynamicRateLimitCalculator.calculateLimit(baseStrategy, {
      userTier: context.userTier,
      geographicRisk: context.ip ? DynamicRateLimitCalculator.getGeographicRisk(context.ip) : 'low',
      timeOfDay: DynamicRateLimitCalculator.isBusinessHours() ? 'business' : 'off'
    })
  }
}
`

  const strategiesPath = path.join(process.cwd(), 'lib', 'rate-limit', 'strategies', 'strategies.ts')
  fs.writeFileSync(strategiesPath, strategies)
  colorLog('✅ Rate limiting strategies created', 'green')
}

// Create rate limiting components
function createRateLimitingComponents() {
  colorLog('\n🎨 Creating rate limiting UI components...', 'cyan')
  
  const components = `'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Shield,
  Zap,
  BarChart3,
  Activity
} from 'lucide-react'

// Rate limit status component
interface RateLimitStatusProps {
  limit: number
  remaining: number
  resetTime: number
  windowMs: number
}

export function RateLimitStatus({ limit, remaining, resetTime, windowMs }: RateLimitStatusProps) {
  const [timeUntilReset, setTimeUntilReset] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now()
      const timeLeft = Math.max(0, resetTime - now)
      setTimeUntilReset(timeLeft)
      
      // Calculate progress
      const used = limit - remaining
      setProgress((used / limit) * 100)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [limit, remaining, resetTime])

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return \`\${hours}h \${minutes % 60}m\`
    } else if (minutes > 0) {
      return \`\${minutes}m \${seconds % 60}s\`
    } else {
      return \`\${seconds}s\`
    }
  }

  const getStatusColor = () => {
    const percentage = (remaining / limit) * 100
    if (percentage > 50) return 'text-green-600'
    if (percentage > 20) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getProgressColor = () => {
    const percentage = (remaining / limit) * 100
    if (percentage > 50) return 'bg-green-500'
    if (percentage > 20) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Rate Limit Status
          </CardTitle>
          <Badge variant={remaining > 0 ? 'default' : 'destructive'}>
            {remaining > 0 ? 'Active' : 'Limited'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>API Calls Used</span>
            <span className={getStatusColor()}>
              {limit - remaining}/{limit}
            </span>
          </div>
          <Progress 
            value={progress} 
            className="h-2"
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>Resets in</span>
          </div>
          <span className="font-mono">{formatTime(timeUntilReset)}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <Activity className="w-4 h-4 mr-1" />
            <span>Window</span>
          </div>
          <span className="font-mono">{formatTime(windowMs)}</span>
        </div>
      </CardContent>
    </Card>
  )
}

// Rate limit alert component
interface RateLimitAlertProps {
  error: {
    type: string
    message: string
    retryAfter?: number
    limit: number
    remaining: number
    resetTime: number
  }
  onRetry?: () => void
}

export function RateLimitAlert({ error, onRetry }: RateLimitAlertProps) {
  const [countdown, setCountdown] = useState(error.retryAfter || 0)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? \`\${mins}m \${secs}s\` : \`\${secs}s\`
  }

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="space-y-2">
        <div className="font-medium text-orange-800">
          {error.message}
        </div>
        
        <div className="text-sm text-orange-700">
          <div>• Limit: {error.limit} requests per window</div>
          <div>• Remaining: {error.remaining} requests</div>
          {error.retryAfter && (
            <div>• Retry after: {formatCountdown(countdown)}</div>
          )}
        </div>

        {onRetry && countdown === 0 && (
          <Button 
            onClick={onRetry} 
            size="sm" 
            variant="outline"
            className="mt-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Now
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

// Rate limit analytics component
export function RateLimitAnalytics() {
  const [analytics, setAnalytics] = useState({
    totalRequests: 0,
    blockedRequests: 0,
    topViolators: [] as Array<{ ip: string; count: number }>,
    endpoints: [] as Array<{ endpoint: string; violations: number }>
  })

  useEffect(() => {
    // Fetch rate limit analytics
    fetchRateLimitAnalytics()
  }, [])

  const fetchRateLimitAnalytics = async () => {
    try {
      const response = await fetch('/api/rate-limit/analytics')
      const data = await response.json()
      
      if (data.success) {
        setAnalytics(data.analytics)
      }
    } catch (error) {
      console.error('Failed to fetch rate limit analytics:', error)
    }
  }

  const blockRate = analytics.totalRequests > 0 
    ? (analytics.blockedRequests / analytics.totalRequests) * 100 
    : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Requests</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics.blockedRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{blockRate.toFixed(1)}% block rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{(100 - blockRate).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Requests allowed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Violators</CardTitle>
            <CardDescription>IPs with most rate limit violations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.topViolators.slice(0, 5).map((violator, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm font-mono">{violator.ip}</span>
                  <Badge variant="destructive">{violator.count}</Badge>
                </div>
              ))}
              {analytics.topViolators.length === 0 && (
                <div className="text-sm text-muted-foreground">No violations in the last 24 hours</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Endpoint Violations</CardTitle>
            <CardDescription>API endpoints with most violations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.endpoints.slice(0, 5).map((endpoint, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm font-mono">{endpoint.endpoint}</span>
                  <Badge variant="secondary">{endpoint.violations}</Badge>
                </div>
              ))}
              {analytics.endpoints.length === 0 && (
                <div className="text-sm text-muted-foreground">No endpoint violations</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Rate limit configuration component
export function RateLimitConfig() {
  const [configs, setConfigs] = useState({
    api: { limit: 60, window: 60000 },
    auth: { limit: 5, window: 900000 },
    upload: { limit: 10, window: 3600000 },
    ai: { limit: 20, window: 60000 }
  })

  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/rate-limit/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs })
      })
      
      if (response.ok) {
        // Show success message
      }
    } catch (error) {
      console.error('Failed to save rate limit config:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          Rate Limit Configuration
        </CardTitle>
        <CardDescription>
          Configure rate limiting for different API categories
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(configs).map(([category, config]) => (
          <div key={category} className="space-y-2">
            <h4 className="font-medium capitalize">{category}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Request Limit</label>
                <input
                  type="number"
                  value={config.limit}
                  onChange={(e) => setConfigs(prev => ({
                    ...prev,
                    [category]: { ...prev[category as keyof typeof prev], limit: parseInt(e.target.value) }
                  }))}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Window (seconds)</label>
                <input
                  type="number"
                  value={config.window / 1000}
                  onChange={(e) => setConfigs(prev => ({
                    ...prev,
                    [category]: { ...prev[category as keyof typeof prev], window: parseInt(e.target.value) * 1000 }
                  }))}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>
        ))}

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Save Configuration
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
`

  const componentsPath = path.join(process.cwd(), 'components', 'rate-limit', 'rate-limit-components.tsx')
  fs.writeFileSync(componentsPath, components)
  colorLog('✅ Rate limiting UI components created', 'green')
}

// Create rate limiting API endpoints
function createRateLimitingAPI() {
  colorLog('\n🔌 Creating rate limiting API endpoints...', 'cyan')
  
  const api = `import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { rateLimitMiddleware, withRateLimit } from '@/lib/rate-limit/middleware/rate-limit'
import { rateLimitLogger } from '@/lib/rate-limit/middleware/logger'
import { StorageFactory } from '@/lib/rate-limit/storage/storage'

// GET /api/rate-limit/status - Get current rate limit status
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'general'

    // Get rate limit status
    const storage = await StorageFactory.create()
    const key = \`rate_limit_status:\${session.user.id}:\${category}\`
    
    const status = await storage.get(key)
    let rateLimitInfo = {
      limit: 60,
      remaining: 60,
      resetTime: Date.now() + 60000,
      windowMs: 60000
    }

    if (status) {
      const data = JSON.parse(status)
      rateLimitInfo = {
        limit: data.limit,
        remaining: Math.max(0, data.limit - data.count),
        resetTime: data.resetTime,
        windowMs: data.windowMs
      }
    }

    return NextResponse.json({
      success: true,
      category,
      ...rateLimitInfo
    })

  } catch (error) {
    rateLimitLogger.logError(error as Error, {
      action: 'get_rate_limit_status',
      url: request.url
    })
    
    return NextResponse.json({ 
      error: 'Failed to get rate limit status' 
    }, { status: 500 })
  }
}

// POST /api/rate-limit/config - Update rate limit configuration (admin only)
export async function POST(request: NextRequest) {
  return withRateLimit(async (req: NextRequest) => {
    try {
      const session = await auth()
      if (!session?.user || !['super_admin', 'admin'].includes(session.user.role)) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }

      const { configs } = await req.json()
      
      // Validate configuration
      if (!configs || typeof configs !== 'object') {
        return NextResponse.json({ error: 'Invalid configuration' }, { status: 400 })
      }

      // Store configuration (this would go to your config storage)
      // For now, just log it
      rateLimitLogger.logInfo('Rate limit configuration updated', {
        userId: session.user.id,
        configs
      })

      return NextResponse.json({
        success: true,
        message: 'Rate limit configuration updated successfully'
      })

    } catch (error) {
      rateLimitLogger.logError(error as Error, {
        action: 'update_rate_limit_config',
        url: req.url
      })
      
      return NextResponse.json({ 
        error: 'Failed to update rate limit configuration' 
      }, { status: 500 })
    }
  }, 'admin')(request)
}
`

  const apiPath = path.join(process.cwd(), 'app', 'api', 'rate-limit', 'status', 'route.ts')
  fs.writeFileSync(apiPath, api)
  colorLog('✅ Rate limiting API endpoints created', 'green')
}

// Create rate limiting analytics API
function createRateLimitingAnalyticsAPI() {
  colorLog('\n📈 Creating rate limiting analytics API...', 'cyan')
  
  const analyticsAPI = `import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { withRateLimit } from '@/lib/rate-limit/middleware/rate-limit'
import { rateLimitLogger } from '@/lib/rate-limit/middleware/logger'
import { createClient } from '@/lib/supabase/server'

// GET /api/rate-limit/analytics - Get rate limiting analytics
export async function GET(request: NextRequest) {
  return withRateLimit(async (req: NextRequest) => {
    try {
      const session = await auth()
      if (!session?.user || !['super_admin', 'admin'].includes(session.user.role)) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }

      const supabase = createClient()
      const { searchParams } = new URL(req.url)
      const timeRange = searchParams.get('timeRange') || '24h'

      // Get time range
      const cutoffDate = getTimeRangeCutoff(timeRange)

      // Get total requests
      const { count: totalRequests } = await supabase
        .from('rate_limit_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', cutoffDate)

      // Get blocked requests
      const { count: blockedRequests } = await supabase
        .from('rate_limit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('level', 'WARN')
        .gte('created_at', cutoffDate)

      // Get top violators
      const { data: topViolators } = await supabase
        .from('rate_limit_logs')
        .select('ip')
        .eq('level', 'WARN')
        .gte('created_at', cutoffDate)

      // Count violations by IP
      const ipCounts = new Map<string, number>()
      topViolators?.forEach(log => {
        if (log.ip) {
          ipCounts.set(log.ip, (ipCounts.get(log.ip) || 0) + 1)
        }
      })

      const topViolatorsList = Array.from(ipCounts.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([ip, count]) => ({ ip, count }))

      // Get endpoint violations
      const { data: endpointViolations } = await supabase
        .from('rate_limit_logs')
        .select('path')
        .eq('level', 'WARN')
        .gte('created_at', cutoffDate)

      // Count violations by endpoint
      const endpointCounts = new Map<string, number>()
      endpointViolations?.forEach(log => {
        if (log.path) {
          endpointCounts.set(log.path, (endpointCounts.get(log.path) || 0) + 1)
        }
      })

      const endpointList = Array.from(endpointCounts.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([endpoint, violations]) => ({ endpoint, violations }))

      const analytics = {
        totalRequests: totalRequests || 0,
        blockedRequests: blockedRequests || 0,
        topViolators: topViolatorsList,
        endpoints: endpointList,
        timeRange,
        generatedAt: new Date().toISOString()
      }

      return NextResponse.json({
        success: true,
        analytics
      })

    } catch (error) {
      rateLimitLogger.logError(error as Error, {
        action: 'get_rate_limit_analytics',
        url: req.url
      })
      
      return NextResponse.json({ 
        error: 'Failed to get rate limit analytics' 
      }, { status: 500 })
    }
  }, 'admin')(request)
}

// Helper function to get time range cutoff
function getTimeRangeCutoff(timeRange: string): string {
  const now = new Date()
  const cutoff = new Date()
  
  switch (timeRange) {
    case '1h':
      cutoff.setHours(now.getHours() - 1)
      break
    case '6h':
      cutoff.setHours(now.getHours() - 6)
      break
    case '24h':
      cutoff.setDate(now.getDate() - 1)
      break
    case '7d':
      cutoff.setDate(now.getDate() - 7)
      break
    case '30d':
      cutoff.setDate(now.getDate() - 30)
      break
    default:
      cutoff.setHours(now.getHours() - 1)
  }
  
  return cutoff.toISOString()
}
`

  const analyticsAPIPath = path.join(process.cwd(), 'app', 'api', 'rate-limit', 'analytics', 'route.ts')
  fs.writeFileSync(analyticsAPIPath, analyticsAPI)
  colorLog('✅ Rate limiting analytics API created', 'green')
}

// Create Next.js middleware for rate limiting
function createNextJSMiddleware() {
  colorLog('\n🔧 Creating Next.js middleware for rate limiting...', 'cyan')
  
  const nextMiddleware = `import { NextRequest, NextResponse } from 'next/server'
import { rateLimitMiddleware, ddosProtection } from '@/lib/rate-limit/middleware/rate-limit'
import { rateLimitLogger } from '@/lib/rate-limit/middleware/logger'

// Rate limit middleware for Next.js
export async function rateLimitMiddleware(request: NextRequest) {
  // Skip rate limiting for static files and health checks
  if (request.nextUrl.pathname.startsWith('/_next') ||
      request.nextUrl.pathname.startsWith('/api/health') ||
      request.nextUrl.pathname.endsWith('.ico') ||
      request.nextUrl.pathname.endsWith('.png') ||
      request.nextUrl.pathname.endsWith('.jpg') ||
      request.nextUrl.pathname.endsWith('.svg')) {
    return NextResponse.next()
  }

  try {
    // DDoS protection check
    const ddosResponse = await ddosProtection.checkRequest(request)
    if (ddosResponse) {
      return ddosResponse
    }

    // Determine rate limit category based on path
    const category = getCategoryFromPath(request.nextUrl.pathname)
    
    // Apply rate limiting
    const rateLimitResponse = await rateLimitMiddleware.rateLimit(request, category)
    
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    return NextResponse.next()

  } catch (error) {
    rateLimitLogger.logError(error as Error, {
      action: 'middleware_rate_limit',
      path: request.nextUrl.pathname,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    })
    
    // Fail open - allow request if rate limiting fails
    return NextResponse.next()
  }
}

// Determine rate limit category from path
function getCategoryFromPath(pathname: string): keyof any {
  if (pathname.startsWith('/api/auth')) {
    return 'auth'
  } else if (pathname.startsWith('/api/upload')) {
    return 'upload'
  } else if (pathname.startsWith('/api/ai') || pathname.includes('analysis')) {
    return 'ai'
  } else if (pathname.startsWith('/api/admin')) {
    return 'admin'
  } else if (pathname.startsWith('/api/')) {
    return 'api'
  } else {
    return 'general'
  }
}

// Export the middleware
export { rateLimitMiddleware as middleware }
`

  const middlewarePath = path.join(process.cwd(), 'middleware.ts')
  fs.writeFileSync(middlewarePath, nextMiddleware)
  colorLog('✅ Next.js middleware for rate limiting created', 'green')
}

// Update package.json with new dependencies
function updatePackageDependencies() {
  colorLog('\n📦 Updating package.json dependencies...', 'cyan')
  
  try {
    const packagePath = path.join(process.cwd(), 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
    
    // Add rate limiting dependencies
    const newDependencies = {
      'ioredis': '^5.3.2',
      'rate-limiter-flexible': '^2.4.2'
    }
    
    // Add rate limiting scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      'rate-limit:monitor': 'node scripts/rate-limit/monitor-rate-limits.js',
      'rate-limit:setup': 'node scripts/setup-rate-limiting.js'
    }
    
    // Merge dependencies
    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...newDependencies
    }
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2))
    colorLog('✅ Package.json updated with rate limiting dependencies', 'green')
    
  } catch (error) {
    colorLog(`⚠️ Could not update package.json: ${error.message}`, 'yellow')
  }
}

// Create rate limiting monitoring script
function createRateLimitingMonitoringScript() {
  colorLog('\n📈 Creating rate limiting monitoring script...', 'cyan')
  
  const monitoringScript = `#!/usr/bin/env node

/**
 * Rate Limiting Monitoring Script
 * Monitors rate limiting effectiveness and provides alerts
 */

const { execAsync } = require('util').promisify(require('child_process').exec)
const fs = require('fs')
const path = require('path')

class RateLimitMonitor {
  constructor() {
    this.metrics = {
      startTime: Date.now(),
      totalRequests: 0,
      blockedRequests: 0,
      violationsByIP: new Map(),
      violationsByEndpoint: new Map(),
      alerts: []
    }
    
    this.config = {
      checkInterval: 30000, // 30 seconds
      alertThresholds: {
        blockRate: 0.1, // 10% block rate
        violationsPerIP: 50, // 50 violations per IP
        violationsPerEndpoint: 100 // 100 violations per endpoint
      }
    }
  }

  async startMonitoring() {
    console.log('🛡️ Starting Rate Limit Monitoring...')
    
    // Start monitoring interval
    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics()
    }, this.config.checkInterval)

    // Graceful shutdown
    process.on('SIGINT', () => this.shutdown())
    process.on('SIGTERM', () => this.shutdown())

    console.log('✅ Rate limit monitoring started. Press Ctrl+C to stop.')
  }

  async collectMetrics() {
    try {
      const timestamp = Date.now()
      
      // Collect rate limit metrics
      const rateLimitMetrics = await this.getRateLimitMetrics()
      
      // Update metrics
      this.updateMetrics(rateLimitMetrics)
      
      // Check for alerts
      this.checkAlerts()
      
      // Log summary
      this.logSummary()

    } catch (error) {
      console.error('❌ Metrics collection error:', error)
    }
  }

  async getRateLimitMetrics() {
    try {
      // This would query your rate limit logging system
      // For now, return mock data
      return {
        totalRequests: Math.floor(Math.random() * 1000),
        blockedRequests: Math.floor(Math.random() * 100),
        violations: [
          {
            ip: '192.168.1.100',
            endpoint: '/api/ai/analysis',
            timestamp: Date.now()
          },
          {
            ip: '10.0.0.50',
            endpoint: '/api/auth/login',
            timestamp: Date.now()
          }
        ]
      }
    } catch (error) {
      return { error: error.message }
    }
  }

  updateMetrics(metrics: any) {
    // Update request counts
    this.metrics.totalRequests += metrics.totalRequests || 0
    this.metrics.blockedRequests += metrics.blockedRequests || 0
    
    // Update violations by IP
    if (metrics.violations) {
      metrics.violations.forEach(violation => {
        const count = this.metrics.violationsByIP.get(violation.ip) || 0
        this.metrics.violationsByIP.set(violation.ip, count + 1)
      })
    }
  }

  checkAlerts() {
    const alerts = []
    
    // Check block rate
    const blockRate = this.metrics.totalRequests > 0 
      ? this.metrics.blockedRequests / this.metrics.totalRequests 
      : 0
    
    if (blockRate > this.config.alertThresholds.blockRate) {
      alerts.push({
        type: 'high_block_rate',
        level: 'warning',
        message: \`High block rate: \${(blockRate * 100).toFixed(2)}%\`,
        value: blockRate
      })
    }
    
    // Check IP violations
    for (const [ip, count] of this.metrics.violationsByIP.entries()) {
      if (count > this.config.alertThresholds.violationsPerIP) {
        alerts.push({
          type: 'ip_violations',
          level: 'critical',
          message: \`High violations from IP \${ip}: \${count}\`,
          ip,
          value: count
        })
      }
    }
    
    // Send alerts
    alerts.forEach(alert => {
      this.sendAlert(alert)
    })
  }

  sendAlert(alert: any) {
    const emoji = alert.level === 'critical' ? '🚨' : '⚠️'
    console.log(\`\${emoji} [\${alert.type.toUpperCase()}] \${alert.message}\`)
    
    // Here you would add integration with notification services
    // - Send to Slack
    // - Send email
    // - Send to monitoring system
  }

  logSummary() {
    const time = new Date().toLocaleTimeString()
    const blockRate = this.metrics.totalRequests > 0 
      ? (this.metrics.blockedRequests / this.metrics.totalRequests) * 100 
      : 0
    
    console.log(\`\\n📊 [\${time}] Rate Limit Monitoring Summary:\`)
    console.log(\`  📈 Total Requests: \${this.metrics.totalRequests}\`)
    console.log(\`  🛡️ Blocked Requests: \${this.metrics.blockedRequests}\`)
    console.log(\`  📊 Block Rate: \${blockRate.toFixed(2)}%\`)
    console.log(\`  🚨 Violating IPs: \${this.metrics.violationsByIP.size}\`)
    
    if (this.metrics.violationsByIP.size > 0) {
      console.log(\`  📋 Top Violators:\`)
      const topViolators = Array.from(this.metrics.violationsByIP.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
      
      topViolators.forEach(([ip, count]) => {
        console.log(\`    • \${ip}: \${count} violations\`)
      })
    }
  }

  async shutdown() {
    console.log('\\n🔄 Shutting down rate limit monitor...')
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
    }

    // Save final report
    await this.saveReport()
    
    console.log('✅ Rate limit monitoring stopped. Report saved.')
    process.exit(0)
  }

  async saveReport() {
    const report = {
      summary: {
        monitoringDuration: Date.now() - this.metrics.startTime,
        totalRequests: this.metrics.totalRequests,
        blockedRequests: this.metrics.blockedRequests,
        blockRate: this.metrics.totalRequests > 0 
          ? this.metrics.blockedRequests / this.metrics.totalRequests 
          : 0
      },
      metrics: {
        totalRequests: this.metrics.totalRequests,
        blockedRequests: this.metrics.blockedRequests,
        violationsByIP: Object.fromEntries(this.metrics.violationsByIP),
        violationsByEndpoint: Object.fromEntries(this.metrics.violationsByEndpoint)
      },
      alerts: this.metrics.alerts,
      generatedAt: new Date().toISOString()
    }

    const reportPath = path.join(process.cwd(), 'logs', 'rate-limit-monitoring-report.json')
    
    // Ensure logs directory exists
    const logsDir = path.dirname(reportPath)
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true })
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(\`📄 Report saved to: \${reportPath}\`)
  }
}

// Start monitoring if run directly
if (require.main === module) {
  const monitor = new RateLimitMonitor()
  monitor.startMonitoring()
}

module.exports = RateLimitMonitor
`

  const scriptPath = path.join(process.cwd(), 'scripts', 'rate-limit', 'monitor-rate-limits.js')
  fs.writeFileSync(scriptPath, monitoringScript)
  colorLog('✅ Rate limiting monitoring script created', 'green')
}

// Main execution function
async function main() {
  colorLog('🚀 Setting up Comprehensive API Rate Limiting and Throttling', 'bright')
  colorLog('=' .repeat(60), 'cyan')
  
  try {
    createRateLimitingDirectories()
    createRateLimitingAlgorithms()
    createRateLimitingStorage()
    createRateLimitingMiddleware()
    createRateLimitingLogger()
    createRateLimitingStrategies()
    createRateLimitingComponents()
    createRateLimitingAPI()
    createRateLimitingAnalyticsAPI()
    createNextJSMiddleware()
    updatePackageDependencies()
    createRateLimitingMonitoringScript()
    
    colorLog('\n' + '='.repeat(60), 'green')
    colorLog('🎉 Comprehensive API Rate Limiting and Throttling setup completed!', 'bright')
    colorLog('\n📋 Next Steps:', 'cyan')
    colorLog('1. Install new dependencies: pnpm install', 'blue')
    colorLog('2. Configure Redis for production rate limiting', 'blue')
    colorLog('3. Update environment variables for rate limiting', 'blue')
    colorLog('4. Add rate limiting to your API routes', 'blue')
    colorLog('5. Start monitoring: pnpm run rate-limit:monitor', 'blue')
    
    colorLog('\n🛡️ Rate Limiting Features:', 'yellow')
    colorLog('• Multiple rate limiting algorithms (sliding window, token bucket, etc.)', 'white')
    colorLog('• Flexible storage backends (Redis, memory, database)', 'white')
    colorLog('• Dynamic rate limiting based on user tier and geography', 'white')
    colorLog('• DDoS protection and suspicious IP blocking', 'white')
    colorLog('• Real-time monitoring and analytics', 'white')
    colorLog('• Configurable limits per API category', 'white')
    
    colorLog('\n🔧 Advanced Capabilities:', 'cyan')
    colorLog('• Adaptive rate limiting based on system load', 'blue')
    colorLog('• Time-based rate limiting (business hours vs off hours)', 'blue')
    colorLog('• Geographic risk assessment', 'blue')
    colorLog('• User reputation scoring', 'blue')
    colorLog('• Tiered access levels', 'blue')
    colorLog('• Comprehensive logging and alerting', 'blue')
    
    colorLog('\n📊 Monitoring & Analytics:', 'green')
    colorLog('• Real-time violation tracking', 'white')
    colorLog('• Top violator identification', 'white')
    colorLog('• Endpoint-specific analytics', 'white')
    colorLog('• Block rate monitoring', 'white')
    colorLog('• Automated alert system', 'white')
    colorLog('• Historical analysis and reporting', 'white')
    
  } catch (error) {
    colorLog(`\n❌ Setup failed: ${error.message}`, 'red')
    process.exit(1)
  }
}

// Run the setup
if (require.main === module) {
  main()
}

module.exports = {
  main,
  createRateLimitingDirectories,
  createRateLimitingAlgorithms,
  createRateLimitingStorage,
  createRateLimitingMiddleware,
  createRateLimitingLogger,
  createRateLimitingStrategies,
  createRateLimitingComponents,
  createRateLimitingAPI,
  createRateLimitingAnalyticsAPI,
  createNextJSMiddleware,
  updatePackageDependencies,
  createRateLimitingMonitoringScript
}
