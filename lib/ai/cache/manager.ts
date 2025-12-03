// Advanced AI Caching System for Beauty with AI Precision
import Redis from 'ioredis'
import { createHash } from 'crypto'
import { LRUCache } from 'lru-cache'

// Redis client for distributed caching
// Create Redis lazily to avoid attempting connections during `next build`
let redis: Redis | null = null
function getRedisClient(): Redis | null {
  if (redis) return redis
  // Prefer a single URL if provided, otherwise host/port
  const redisUrl = process.env.REDIS_URL
  const hasHost = !!(process.env.REDIS_HOST || process.env.REDIS_HOST === '')
  if (!redisUrl && !process.env.REDIS_HOST && !process.env.REDIS_PORT && !process.env.REDIS_PASSWORD) {
    // No Redis config supplied — do not initialize client during build/runtime where unavailable
    return null
  }

  try {
    redis = redisUrl
      ? new Redis(redisUrl)
      : new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
          maxRetriesPerRequest: 3,
          lazyConnect: true
        })
    return redis
  } catch (err) {
    console.warn('Failed to initialize Redis client:', err)
    redis = null
    return null
  }
}

// In-memory LRU cache for frequently accessed data
const memoryCache = new LRUCache<string, any>({
  max: 1000, // Maximum items in cache
  ttl: 1000 * 60 * 15, // 15 minutes TTL
  updateAgeOnGet: true
})

// Cache configuration
const CACHE_CONFIG = {
  AI_ANALYSIS: {
    ttl: 3600, // 1 hour
    prefix: 'ai:analysis:',
    memory: true
  },
  MODEL_PREDICTIONS: {
    ttl: 1800, // 30 minutes
    prefix: 'ai:model:',
    memory: true
  },
  USER_PREFERENCES: {
    ttl: 86400, // 24 hours
    prefix: 'ai:user:',
    memory: false
  },
  TREATMENT_RECOMMENDATIONS: {
    ttl: 7200, // 2 hours
    prefix: 'ai:treatment:',
    memory: true
  }
}

export class AICacheManager {
  private static instance: AICacheManager
  private redis: Redis | null
  private memoryCache: LRUCache<string, any>

  constructor() {
    this.redis = getRedisClient()
    this.memoryCache = memoryCache
  }

  static getInstance(): AICacheManager {
    if (!AICacheManager.instance) {
      AICacheManager.instance = new AICacheManager()
    }
    return AICacheManager.instance
  }

  // Generate cache key
  private generateKey(type: string, data: any): string {
    const hash = createHash('sha256')
    hash.update(JSON.stringify(data))
    const digest = hash.digest('hex')
    return `${CACHE_CONFIG[type as keyof typeof CACHE_CONFIG].prefix}${digest}`
  }

  // Get cached data
  async get<T>(type: string, data: any): Promise<T | null> {
    try {
      const key = this.generateKey(type, data)
      
      // Try memory cache first
      if (CACHE_CONFIG[type as keyof typeof CACHE_CONFIG].memory) {
        const memoryResult = this.memoryCache.get(key) as T
        if (memoryResult) {
          return memoryResult
        }
      }

      // Try Redis cache (only if client initialized)
      if (this.redis) {
        const redisResult = await this.redis.get(key)
        if (redisResult) {
          const parsed = JSON.parse(redisResult) as T

          // Store in memory cache if enabled
          if (CACHE_CONFIG[type as keyof typeof CACHE_CONFIG].memory) {
            this.memoryCache.set(key, parsed)
          }

          return parsed
        }
      }

      return null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  // Set cached data
  async set<T>(type: string, data: any, value: T): Promise<void> {
    try {
      const key = this.generateKey(type, data)
      const ttl = CACHE_CONFIG[type as keyof typeof CACHE_CONFIG].ttl
      
      // Store in memory cache if enabled
      if (CACHE_CONFIG[type as keyof typeof CACHE_CONFIG].memory) {
        this.memoryCache.set(key, value)
      }

      // Store in Redis (no-op when not configured)
      if (this.redis) {
        await this.redis.setex(key, ttl, JSON.stringify(value))
      }
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  // Delete cached data
  async delete(type: string, data: any): Promise<void> {
    try {
      const key = this.generateKey(type, data)
      
      // Remove from memory cache
      if (CACHE_CONFIG[type as keyof typeof CACHE_CONFIG].memory) {
        this.memoryCache.delete(key)
      }

      // Remove from Redis (no-op when not configured)
      if (this.redis) {
        await this.redis.del(key)
      }
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }

  // Clear all cache for a type
  async clearType(type: string): Promise<void> {
    try {
      const pattern = `${CACHE_CONFIG[type as keyof typeof CACHE_CONFIG].prefix}*`
      if (this.redis) {
        const keys = await this.redis.keys(pattern)
        if (keys.length > 0) {
          await this.redis.del(...keys)
        }
      }

      // Clear memory cache for this type
      if (CACHE_CONFIG[type as keyof typeof CACHE_CONFIG].memory) {
        this.memoryCache.clear()
      }
    } catch (error) {
      console.error('Cache clear error:', error)
    }
  }

  // Cache statistics
  async getStats(): Promise<CacheStats> {
    try {
      const memoryUsage = this.memoryCache.size
      return {
        redisMemoryUsed: this.redis ? this.parseRedisMemory(await this.redis.info('memory')) : 0,
        memoryCacheSize: memoryUsage,
        memoryCacheMax: this.memoryCache.max,
        hitRate: this.redis ? await this.calculateHitRate() : 0
      }
    } catch (error) {
      console.error('Cache stats error:', error)
      return {
        redisMemoryUsed: 0,
        memoryCacheSize: 0,
        memoryCacheMax: 0,
        hitRate: 0
      }
    }
  }

  private parseRedisMemory(info: string): number {
    const match = info.match(/used_memory:(\d+)/)
    return match ? parseInt(match[1]) : 0
  }

  private async calculateHitRate(): Promise<number> {
    try {
      if (!this.redis) return 0
      const stats = await this.redis.info('stats')
      const hits = parseInt(stats.match(/keyspace_hits:(\d+)/)?.[1] || '0')
      const misses = parseInt(stats.match(/keyspace_misses:(\d+)/)?.[1] || '0')
      const total = hits + misses
      
      return total > 0 ? hits / total : 0
    } catch (error) {
      return 0
    }
  }

  // Preload common data
  async preloadCommonData(): Promise<void> {
    try {
      // Preload treatment recommendations
      await this.preloadTreatmentRecommendations()
      
      // Preload common model predictions
      await this.preloadModelPredictions()
      
      console.log('✅ AI cache preloaded with common data')
    } catch (error) {
      console.error('Cache preload error:', error)
    }
  }

  private async preloadTreatmentRecommendations(): Promise<void> {
    // Implementation for preloading treatment recommendations
  }

  private async preloadModelPredictions(): Promise<void> {
    // Implementation for preloading model predictions
  }
}

interface CacheStats {
  redisMemoryUsed: number
  memoryCacheSize: number
  memoryCacheMax: number
  hitRate: number
}

export const aiCache = AICacheManager.getInstance()
