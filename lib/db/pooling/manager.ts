// Advanced Connection Pooling for Supabase/PostgreSQL
import { createClient } from '@supabase/supabase-js'
import { Pool, PoolClient } from 'pg'
import Redis from 'ioredis'

// Connection pool configuration
const POOL_CONFIG = {
  // Supabase connection pooling
  SUPABASE: {
    min: 2,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    maxUses: 7500, // Close connections after 7500 uses
    allowExitOnIdle: true
  },
  
  // Direct PostgreSQL pool (for complex queries)
  POSTGRES: {
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DATABASE,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    min: 5,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    maxLifetime: 300000, // 5 minutes
    acquireTimeoutMillis: 10000
  },
  
  // Redis for connection state caching
  REDIS: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100
  }
}

export class DatabaseConnectionManager {
  private static instance: DatabaseConnectionManager
  private supabasePool: any
  private postgresPool!: Pool
  private redis!: Redis
  private metrics: ConnectionMetrics

  constructor() {
    this.metrics = new ConnectionMetrics()
    this.initializePools()
  }

  static getInstance(): DatabaseConnectionManager {
    if (!DatabaseConnectionManager.instance) {
      DatabaseConnectionManager.instance = new DatabaseConnectionManager()
    }
    return DatabaseConnectionManager.instance
  }

  private async initializePools(): Promise<void> {
    try {
      // Initialize Redis for connection caching
      this.redis = new Redis(POOL_CONFIG.REDIS)
      
      // Initialize PostgreSQL pool for complex queries
      if (process.env.POSTGRES_HOST) {
        this.postgresPool = new Pool(POOL_CONFIG.POSTGRES)
        
        this.postgresPool.on('connect', () => {
          this.metrics.recordConnection('postgres')
        })
        
        this.postgresPool.on('error', (err) => {
          this.metrics.recordError('postgres', err)
        })
      }
      
      console.log('✅ Database connection pools initialized')
    } catch (error) {
      console.error('❌ Failed to initialize connection pools:', error)
    }
  }

  // Get optimized Supabase client
  async getSupabaseClient(options: SupabaseClientOptions = {}): Promise<any> {
    const startTime = Date.now()
    
    try {
      // Check connection cache
      const cacheKey = this.generateCacheKey('supabase', options)
      const cached = await this.redis?.get(cacheKey)
      
      if (cached && !options.forceNew) {
        this.metrics.recordCacheHit('supabase')
        return JSON.parse(cached)
      }

      // Create new client with pooling options
      const client = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            persistSession: options.persistSession !== false,
            autoRefreshToken: options.autoRefreshToken !== false
          }
        }
      )

      // Cache the client configuration
      if (this.redis && options.cacheClient !== false) {
        await this.redis.setex(cacheKey, 300, JSON.stringify(client)) // 5 minutes cache
      }

      this.metrics.recordConnection('supabase')
      this.metrics.recordResponseTime('supabase', Date.now() - startTime)
      
      return client
    } catch (error) {
      this.metrics.recordError('supabase', error)
      throw error
    }
  }

  // Get PostgreSQL pool connection
  async getPostgresConnection(): Promise<PoolClient> {
    const startTime = Date.now()
    
    try {
      if (!this.postgresPool) {
        throw new Error('PostgreSQL pool not initialized')
      }

      const connection = await this.postgresPool.connect()
      
      this.metrics.recordConnection('postgres')
      this.metrics.recordResponseTime('postgres', Date.now() - startTime)
      
      return connection
    } catch (error) {
      this.metrics.recordError('postgres', error)
      throw error
    }
  }

  // Execute optimized query
  async executeQuery<T = any>(
    query: string, 
    params: any[] = [], 
    options: QueryOptions = {}
  ): Promise<QueryResult<T>> {
    const startTime = Date.now()
    const queryHash = this.hashQuery(query, params)
    
    try {
      // Check query cache
      if (options.cache !== false) {
        const cached = await this.getQueryCache(queryHash)
        if (cached) {
          this.metrics.recordCacheHit('query')
          return cached
        }
      }

      let result: QueryResult<T>
      
      if (options.usePostgres || this.shouldUsePostgres(query)) {
        // Use PostgreSQL pool for complex queries
        const connection = await this.getPostgresConnection()
        
        try {
          const queryResult = await connection.query(query, params)
          result = {
            rows: queryResult.rows,
            rowCount: queryResult.rowCount || 0,
            fields: queryResult.fields,
            queryTime: Date.now() - startTime
          }
        } finally {
          connection.release()
        }
      } else {
        // Use Supabase for simple queries
        const supabase = await this.getSupabaseClient()
        const { data, error, count } = await supabase
          .from(this.extractTableName(query))
          .select('*', { count: 'exact' })
          .range(options.offset || 0, (options.offset || 0) + (options.limit || 10) - 1)
        
        if (error) throw error
        
        result = {
          rows: data || [],
          rowCount: count || 0,
          fields: [],
          queryTime: Date.now() - startTime
        }
      }

      // Cache successful queries
      if (options.cache !== false && result.rows.length > 0) {
        await this.setQueryCache(queryHash, result, options.cacheTtl || 300)
      }

      this.metrics.recordQuery(query, Date.now() - startTime, result.rowCount || 0)
      
      return result
    } catch (error) {
      this.metrics.recordError('query', error)
      throw error
    }
  }

  // Batch query execution
  async executeBatch<T = any>(
    queries: BatchQuery[]
  ): Promise<BatchResult<T>[]> {
    const startTime = Date.now()
    const results: BatchResult<T>[] = []
    
    try {
      // Execute queries in parallel where possible
      const promises = queries.map(async (batchQuery, index) => {
        try {
          const result = await this.executeQuery<T>(
            batchQuery.query,
            batchQuery.params,
            batchQuery.options
          )
          
          return {
            index,
            success: true,
            data: result,
            error: null
          }
        } catch (error) {
          return {
            index,
            success: false,
            data: null,
            error: (error as Error).message
          }
        }
      })
      
      const batchResults = await Promise.all(promises)
      results.push(...batchResults)
      
      this.metrics.recordBatch(queries.length, Date.now() - startTime)
      
      return results
    } catch (error) {
      this.metrics.recordError('batch', error)
      throw error
    }
  }

  // Connection pool health check
  async healthCheck(): Promise<PoolHealthStatus> {
    try {
      const supabaseHealth = await this.checkSupabaseHealth()
      const postgresHealth = await this.checkPostgresHealth()
      const redisHealth = await this.checkRedisHealth()
      
      return {
        supabase: supabaseHealth,
        postgres: postgresHealth,
        redis: redisHealth,
        overall: supabaseHealth.healthy && postgresHealth.healthy && redisHealth.healthy
      }
    } catch (error) {
      return {
        supabase: { healthy: false, error: (error as Error).message },
        postgres: { healthy: false, error: (error as Error).message },
        redis: { healthy: false, error: (error as Error).message },
        overall: false
      }
    }
  }

  // Get connection metrics
  getMetrics(): any {
    return this.metrics.getSnapshot()
  }

  // Warm up connection pools
  async warmUpPools(): Promise<void> {
    try {
      console.log('🔥 Warming up database connection pools...')
      
      // Warm up Supabase connections
      for (let i = 0; i < POOL_CONFIG.SUPABASE.min; i++) {
        await this.getSupabaseClient({ cacheClient: false })
      }
      
      // Warm up PostgreSQL connections
      if (this.postgresPool) {
        const warmupQueries = [
          'SELECT 1',
          'SELECT version()',
          'SELECT current_database(), current_user'
        ]
        
        for (const query of warmupQueries) {
          const connection = await this.getPostgresConnection()
          try {
            await connection.query(query)
          } finally {
            connection.release()
          }
        }
      }
      
      console.log('✅ Connection pools warmed up')
    } catch (error) {
      console.error('❌ Failed to warm up connection pools:', error)
    }
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    console.log('🔄 Shutting down database connection pools...')
    
    if (this.postgresPool) {
      await this.postgresPool.end()
    }
    
    if (this.redis) {
      await this.redis.quit()
    }
    
    console.log('✅ Database connection pools shut down')
  }

  // Private helper methods
  private generateCacheKey(type: string, options: any): string {
    return `db:connection:${type}:${JSON.stringify(options)}`
  }

  private hashQuery(query: string, params: any[]): string {
    const crypto = require('crypto')
    return crypto.createHash('sha256').update(query + JSON.stringify(params)).digest('hex')
  }

  private shouldUsePostgres(query: string): boolean {
    // Use PostgreSQL for complex queries
    const complexPatterns = [
      /JOIN/i,
      /GROUP BY/i,
      /HAVING/i,
      /WINDOW/i,
      /WITH RECURSIVE/i,
      /EXISTS|NOT EXISTS/i,
      /CASE.*WHEN/i
    ]
    
    return complexPatterns.some(pattern => pattern.test(query))
  }

  private extractTableName(query: string): string {
    const match = query.match(/FROM\s+(\w+)/i)
    return match ? match[1] : 'unknown'
  }

  private async getQueryCache(hash: string): Promise<QueryResult<any> | null> {
    if (!this.redis) return null
    
    try {
      const cached = await this.redis.get(`db:query:${hash}`)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      return null
    }
  }

  private async setQueryCache(hash: string, result: QueryResult<any>, ttl: number): Promise<void> {
    if (!this.redis) return
    
    try {
      await this.redis.setex(`db:query:${hash}`, ttl, JSON.stringify(result))
    } catch (error) {
      // Cache failure shouldn't break the query
    }
  }

  private async checkSupabaseHealth(): Promise<{ healthy: boolean, error?: string }> {
    try {
      const client = await this.getSupabaseClient()
      const { data, error } = await client.from('users').select('id').limit(1)
      
      return { healthy: !error, error: error?.message }
    } catch (error) {
      return { healthy: false, error: (error as Error).message }
    }
  }

  private async checkPostgresHealth(): Promise<{ healthy: boolean, error?: string }> {
    try {
      if (!this.postgresPool) {
        return { healthy: false, error: 'PostgreSQL pool not initialized' }
      }
      
      const connection = await this.getPostgresConnection()
      try {
        await connection.query('SELECT 1')
        return { healthy: true }
      } finally {
        connection.release()
      }
    } catch (error) {
      return { healthy: false, error: (error as Error).message }
    }
  }

  private async checkRedisHealth(): Promise<{ healthy: boolean, error?: string }> {
    try {
      if (!this.redis) {
        return { healthy: false, error: 'Redis not initialized' }
      }
      
      await this.redis.ping()
      return { healthy: true }
    } catch (error) {
      return { healthy: false, error: (error as Error).message }
    }
  }
}

// Metrics collection
class ConnectionMetrics {
  private metrics = {
    connections: { supabase: 0, postgres: 0 },
    errors: { supabase: 0, postgres: 0, query: 0, batch: 0 },
    cacheHits: { supabase: 0, query: 0 },
    queries: [] as QueryMetric[],
    responseTime: { supabase: [] as number[], postgres: [] as number[] },
    batches: [] as BatchMetric[]
  }

  recordConnection(type: 'supabase' | 'postgres'): void {
    this.metrics.connections[type]++
  }

  recordError(type: 'supabase' | 'postgres' | 'query' | 'batch', error: any): void {
    this.metrics.errors[type]++
    console.error(`Database error (${type}):`, error)
  }

  recordCacheHit(type: 'supabase' | 'query'): void {
    this.metrics.cacheHits[type]++
  }

  recordQuery(query: string, responseTime: number, rowCount: number): void {
    this.metrics.queries.push({
      query: query.substring(0, 100),
      responseTime,
      rowCount,
      timestamp: Date.now()
    })
    
    // Keep only last 1000 queries
    if (this.metrics.queries.length > 1000) {
      this.metrics.queries.shift()
    }
  }

  recordResponseTime(type: 'supabase' | 'postgres', time: number): void {
    this.metrics.responseTime[type].push(time)
    
    // Keep only last 100 measurements
    if (this.metrics.responseTime[type].length > 100) {
      this.metrics.responseTime[type].shift()
    }
  }

  recordBatch(queryCount: number, totalTime: number): void {
    this.metrics.batches.push({
      queryCount,
      totalTime,
      avgTime: totalTime / queryCount,
      timestamp: Date.now()
    })
    
    // Keep only last 100 batches
    if (this.metrics.batches.length > 100) {
      this.metrics.batches.shift()
    }
  }

  getSnapshot() {
    return {
      ...this.metrics,
      avgResponseTime: {
        supabase: this.calculateAverage(this.metrics.responseTime.supabase),
        postgres: this.calculateAverage(this.metrics.responseTime.postgres)
      },
      cacheHitRate: {
        supabase: this.metrics.connections.supabase > 0 
          ? this.metrics.cacheHits.supabase / this.metrics.connections.supabase 
          : 0,
        query: this.metrics.queries.length > 0
          ? this.metrics.cacheHits.query / this.metrics.queries.length
          : 0
      }
    }
  }

  private calculateAverage(numbers: number[]): number {
    return numbers.length > 0 ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0
  }
}

// Type definitions
interface SupabaseClientOptions {
  poolSize?: number
  persistSession?: boolean
  autoRefreshToken?: boolean
  forceNew?: boolean
  cacheClient?: boolean
}

interface QueryOptions {
  usePostgres?: boolean
  cache?: boolean
  cacheTtl?: number
  offset?: number
  limit?: number
}

interface QueryResult<T = any> {
  rows: T[]
  rowCount: number
  fields: any[]
  queryTime: number
}

interface BatchQuery {
  query: string
  params: any[]
  options?: QueryOptions
}

interface BatchResult<T = any> {
  index: number
  success: boolean
  data: QueryResult<T> | null
  error: string | null
}

interface PoolHealthStatus {
  supabase: { healthy: boolean, error?: string }
  postgres: { healthy: boolean, error?: string }
  redis: { healthy: boolean, error?: string }
  overall: boolean
}

interface QueryMetric {
  query: string
  responseTime: number
  rowCount: number
  timestamp: number
}

interface BatchMetric {
  queryCount: number
  totalTime: number
  avgTime: number
  timestamp: number
}

export const dbConnectionManager = DatabaseConnectionManager.getInstance()
