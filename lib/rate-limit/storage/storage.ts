// Rate Limiting Storage Implementation
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
      for (const member of toRemove) {
        await this.redis.lrem(key, 1, member)
      }
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

  async increment(key: string, value: number, ttl: number): Promise<number> {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('increment_rate_limit', {
      p_key: key,
      p_value: value,
      p_ttl_seconds: Math.ceil(ttl / 1000)
    })

    if (error) throw error
    return data || 0
  }

  async get(key: string): Promise<string | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('rate_limits')
      .select('value')
      .eq('key', key)
      .single()

    if (error || !data) return null
    return data.value.toString()
  }

  async set(key: string, value: string, ttl: number): Promise<void> {
    const supabase = await createClient()
    const expiry = new Date(Date.now() + ttl)
    
    const { error } = await supabase
      .from('rate_limits')
      .upsert({
        key,
        value: parseInt(value),
        expires_at: expiry
      })

    if (error) throw error
  }

  async delete(key: string): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('rate_limits')
      .delete()
      .eq('key', key)

    if (error) throw error
  }

  async addToList(key: string, value: string, ttl: number): Promise<void> {
    const supabase = await createClient()
    const expiry = new Date(Date.now() + ttl)
    
    const { error } = await supabase
      .from('rate_limit_lists')
      .insert({
        list_key: key,
        value: parseInt(value),
        expires_at: expiry
      })

    if (error) throw error
  }

  async removeOldFromList(key: string, cutoff: number): Promise<void> {
    const supabase = await createClient()
    const cutoffDate = new Date(cutoff)
    
    const { error } = await supabase
      .from('rate_limit_lists')
      .delete()
      .eq('list_key', key)
      .lt('value', cutoffDate.getTime())

    if (error) throw error
  }

  async getListLength(key: string): Promise<number> {
    const supabase = await createClient()
    const { count, error } = await supabase
      .from('rate_limit_lists')
      .select('*', { count: 'exact', head: true })
      .eq('list_key', key)

    if (error) throw error
    return count || 0
  }

  async getBucket(key: string): Promise<BucketState> {
    const supabase = await createClient()
    const { data, error } = await supabase
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
    const supabase = await createClient()
    const expiry = new Date(Date.now() + ttl)
    
    const { error } = await supabase
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
            try {
              this.redisInstance = new Redis(process.env.REDIS_URL, {
                lazyConnect: true,
                enableOfflineQueue: false,
                maxRetriesPerRequest: 3
              })

              // Avoid unhandled error events bubbling up during build/test runs
              this.redisInstance.on('error', (err) => {
                console.warn('Redis client error (rate-limit):', err && err.message ? err.message : err)
              })

              // Try to connect; if it fails, fall back to memory storage
              await this.redisInstance.connect()
            } catch (err) {
              console.warn('Redis connection failed, falling back to memory storage:', err)
              this.redisInstance = null
              return this.create('memory')
            }
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
