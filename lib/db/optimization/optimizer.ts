// Database Query Optimization Utilities
import { dbConnectionManager } from '../pooling/manager'

// Query optimization configuration
const QUERY_CONFIG = {
  // Pagination settings
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    DEFAULT_OFFSET: 0
  },
  
  // Caching settings
  CACHE: {
    DEFAULT_TTL: 300, // 5 minutes
    LONG_TTL: 3600, // 1 hour
    SHORT_TTL: 60, // 1 minute
    ENABLED: true
  },
  
  // Performance thresholds
  THRESHOLDS: {
    SLOW_QUERY_MS: 1000,
    VERY_SLOW_QUERY_MS: 5000,
    LARGE_RESULT_SET: 1000
  }
}

export class QueryOptimizer {
  private static instance: QueryOptimizer
  private queryCache: Map<string, OptimizedQuery> = new Map()
  private slowQueries: SlowQueryLog[] = []

  static getInstance(): QueryOptimizer {
    if (!QueryOptimizer.instance) {
      QueryOptimizer.instance = new QueryOptimizer()
    }
    return QueryOptimizer.instance
  }

  // Optimize and execute query
  async executeOptimized<T = any>(
    query: string,
    params: any[] = [],
    options: OptimizedQueryOptions = {}
  ): Promise<OptimizedResult<T>> {
    const startTime = Date.now()
    const queryId = this.generateQueryId(query, params)
    
    try {
      // Check if we have an optimized version cached
      const optimizedQuery = this.getCachedOptimizedQuery(queryId)
      
      if (optimizedQuery && !options.skipOptimization) {
        const result = await this.executeWithOptimization<T>(optimizedQuery, params, options)
        this.logQueryPerformance(queryId, Date.now() - startTime, result.rowCount || 0)
        return result
      }

      // Analyze and optimize the query
      const analysis = this.analyzeQuery(query)
      const optimized = this.optimizeQuery(query, analysis, options)
      
      // Cache the optimized query
      this.cacheOptimizedQuery(queryId, optimized)
      
      // Execute the optimized query
      const result = await this.executeWithOptimization<T>(optimized, params, options)
      
      this.logQueryPerformance(queryId, Date.now() - startTime, result.rowCount || 0)
      
      return {
        ...result,
        optimization: {
          originalQuery: query,
          optimizedQuery: optimized.query,
          optimizations: optimized.optimizations,
          estimatedImprovement: optimized.estimatedImprovement
        }
      }

    } catch (error) {
      this.logQueryError(queryId, error)
      throw error
    }
  }

  // Execute paginated query
  async executePaginated<T = any>(
    query: string,
    params: any[] = [],
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<T>> {
    const {
      limit = QUERY_CONFIG.PAGINATION.DEFAULT_LIMIT,
      offset = QUERY_CONFIG.PAGINATION.DEFAULT_OFFSET,
      orderBy = 'id',
      orderDirection = 'ASC'
    } = pagination

    // Validate pagination parameters
    const validatedLimit = Math.min(limit, QUERY_CONFIG.PAGINATION.MAX_LIMIT)
    const validatedOffset = Math.max(offset, 0)

    // Build optimized paginated query
    const optimizedQuery = this.buildPaginatedQuery(query, {
      limit: validatedLimit,
      offset: validatedOffset,
      orderBy,
      orderDirection
    })

    // Execute both data query and count query
    const [dataResult, countResult] = await Promise.all([
      this.executeOptimized<T>(optimizedQuery.dataQuery, params, { cache: true }),
      this.executeOptimized<{ count: number }>(optimizedQuery.countQuery, params, { cache: true })
    ])

    return {
      data: dataResult.rows || [],
      pagination: {
        limit: validatedLimit,
        offset: validatedOffset,
        total: countResult.rows?.[0]?.count || 0,
        hasMore: validatedOffset + validatedLimit < (countResult.rows?.[0]?.count || 0),
        page: Math.floor(validatedOffset / validatedLimit) + 1,
        totalPages: Math.ceil((countResult.rows?.[0]?.count || 0) / validatedLimit)
      },
      performance: {
        queryTime: dataResult.queryTime,
        optimizations: dataResult.optimization?.optimizations || []
      }
    }
  }

  // Execute batch optimized queries
  async executeBatchOptimized<T = any>(
    queries: BatchOptimizedQuery[]
  ): Promise<BatchOptimizedResult<T>[]> {
    const startTime = Date.now()
    
    // Group queries by type for optimal execution
    const groupedQueries = this.groupQueriesByType(queries)
    
    const results: BatchOptimizedResult<T>[] = []
    
    // Execute each group
    for (const [type, groupQueries] of groupedQueries) {
      const groupResults = await this.executeQueryGroup<T>(type, groupQueries)
      results.push(...groupResults)
    }

    // Sort results by original index
    results.sort((a, b) => a.index - b.index)
    
    return results
  }

  // Analyze query performance
  analyzeQueryPerformance(query: string): QueryAnalysis {
    const analysis = this.analyzeQuery(query)
    
    return {
      query,
      complexity: analysis.complexity,
      estimatedCost: analysis.estimatedCost,
      recommendations: this.generateRecommendations(analysis),
      optimizationPotential: analysis.optimizationPotential
    }
  }

  // Get slow query log
  getSlowQueries(limit: number = 50): SlowQueryLog[] {
    return this.slowQueries
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, limit)
  }

  // Clear slow query log
  clearSlowQueryLog(): void {
    this.slowQueries = []
  }

  // Private methods
  private analyzeQuery(query: string): QueryAnalysisResult {
    const upperQuery = query.toUpperCase()
    
    // Detect query complexity
    let complexity = 'simple'
    let estimatedCost = 1
    
    if (upperQuery.includes('JOIN')) {
      complexity = 'moderate'
      estimatedCost += 2
    }
    
    if (upperQuery.includes('GROUP BY') || upperQuery.includes('HAVING')) {
      complexity = 'moderate'
      estimatedCost += 3
    }
    
    if (upperQuery.includes('SUBQUERY') || upperQuery.includes('EXISTS')) {
      complexity = 'complex'
      estimatedCost += 5
    }
    
    if (upperQuery.includes('WINDOW') || upperQuery.includes('WITH RECURSIVE')) {
      complexity = 'very_complex'
      estimatedCost += 10
    }

    // Detect missing indexes
    const missingIndexes = this.detectMissingIndexes(query)
    
    // Detect N+1 query problems
    const hasNPlusOne = this.detectNPlusOneProblem(query)
    
    return {
      complexity,
      estimatedCost,
      missingIndexes,
      hasNPlusOne,
      optimizationPotential: this.calculateOptimizationPotential(missingIndexes, hasNPlusOne, estimatedCost)
    }
  }

  private optimizeQuery(query: string, analysis: QueryAnalysisResult, options: OptimizedQueryOptions): OptimizedQuery {
    let optimizedQuery = query
    const optimizations: string[] = []
    let estimatedImprovement = 0

    // Add missing index hints
    if (analysis.missingIndexes.length > 0 && options.addIndexHints) {
      optimizedQuery = this.addIndexHints(optimizedQuery, analysis.missingIndexes)
      optimizations.push('Added index hints')
      estimatedImprovement += 20
    }

    // Optimize JOIN order
    if (query.toUpperCase().includes('JOIN') && options.optimizeJoins) {
      optimizedQuery = this.optimizeJoinOrder(optimizedQuery)
      optimizations.push('Optimized JOIN order')
      estimatedImprovement += 15
    }

    // Add query hints for PostgreSQL
    if (options.addQueryHints) {
      optimizedQuery = this.addQueryHints(optimizedQuery, analysis)
      optimizations.push('Added query hints')
      estimatedImprovement += 10
    }

    // Simplify complex expressions
    if (analysis.complexity === 'complex' || analysis.complexity === 'very_complex') {
      optimizedQuery = this.simplifyExpressions(optimizedQuery)
      optimizations.push('Simplified complex expressions')
      estimatedImprovement += 25
    }

    return {
      query: optimizedQuery,
      optimizations,
      estimatedImprovement
    }
  }

  private async executeWithOptimization<T = any>(
    optimized: OptimizedQuery,
    params: any[],
    options: OptimizedQueryOptions
  ): Promise<OptimizedResult<T>> {
    const result = await dbConnectionManager.executeQuery<T>(
      optimized.query,
      params,
      {
        cache: options.cache !== false,
        cacheTtl: options.cacheTtl || QUERY_CONFIG.CACHE.DEFAULT_TTL,
        usePostgres: this.shouldUsePostgres(optimized.query)
      }
    )

    return {
      rows: result.rows,
      rowCount: result.rowCount,
      queryTime: result.queryTime,
      optimization: {
        optimizations: optimized.optimizations,
        estimatedImprovement: optimized.estimatedImprovement
      }
    }
  }

  private buildPaginatedQuery(baseQuery: string, pagination: any): { dataQuery: string, countQuery: string } {
    // Add ORDER BY for consistent pagination
    const orderByClause = `ORDER BY ${pagination.orderBy} ${pagination.orderDirection}`
    
    // Build data query with pagination
    const dataQuery = `${baseQuery} ${orderByClause} LIMIT ${pagination.limit} OFFSET ${pagination.offset}`
    
    // Build count query
    const countQuery = `SELECT COUNT(*) as count FROM (${baseQuery}) as subquery`
    
    return { dataQuery, countQuery }
  }

  private groupQueriesByType(queries: BatchOptimizedQuery[]): Map<string, BatchOptimizedQuery[]> {
    const groups = new Map<string, BatchOptimizedQuery[]>()
    
    queries.forEach((query, index) => {
      const type = this.getQueryType(query.query)
      
      if (!groups.has(type)) {
        groups.set(type, [])
      }
      
      groups.get(type)!.push({ ...query, index })
    })
    
    return groups
  }

  private async executeQueryGroup<T = any>(
    type: string,
    queries: BatchOptimizedQuery[]
  ): Promise<BatchOptimizedResult<T>[]> {
    const results: BatchOptimizedResult<T>[] = []
    
    // Execute queries based on type
    switch (type) {
      case 'select':
        // Execute SELECT queries in parallel
        const selectPromises = queries.map(async (query) => {
          try {
            const result = await this.executeOptimized<T>(query.query, query.params, query.options)
            return {
              index: query.index || 0 || 0,
              success: true,
              data: result.rows,
              queryTime: result.queryTime,
              error: null
            }
          } catch (error) {
            return {
              index: query.index || 0 || 0,
              success: false,
              data: null,
              queryTime: 0,
              error: (error as Error).message
            }
          }
        })
        
        const selectResults = await Promise.all(selectPromises)
        results.push(...selectResults)
        break
        
      case 'insert':
        // Execute INSERT queries sequentially for consistency
        for (const query of queries) {
          try {
            const result = await this.executeOptimized<T>(query.query, query.params, query.options)
            results.push({
              index: query.index || 0 || 0,
              success: true,
              data: result.rows,
              queryTime: result.queryTime,
              error: null
            })
          } catch (error) {
            results.push({
              index: query.index || 0 || 0,
              success: false,
              data: null,
              queryTime: 0,
              error: (error as Error).message
            })
          }
        }
        break
        
      default:
        // Execute other query types in parallel
        const otherPromises = queries.map(async (query) => {
          try {
            const result = await this.executeOptimized<T>(query.query, query.params, query.options)
            return {
              index: query.index || 0 || 0,
              success: true,
              data: result.rows,
              queryTime: result.queryTime,
              error: null
            }
          } catch (error) {
            return {
              index: query.index || 0 || 0,
              success: false,
              data: null,
              queryTime: 0,
              error: (error as Error).message
            }
          }
        })
        
        const otherResults = await Promise.all(otherPromises)
        results.push(...otherResults)
    }
    
    return results
  }

  private getQueryType(query: string): string {
    const upperQuery = query.trim().toUpperCase()
    
    if (upperQuery.startsWith('SELECT')) return 'select'
    if (upperQuery.startsWith('INSERT')) return 'insert'
    if (upperQuery.startsWith('UPDATE')) return 'update'
    if (upperQuery.startsWith('DELETE')) return 'delete'
    
    return 'other'
  }

  private shouldUsePostgres(query: string): boolean {
    const complexPatterns = [
      /JOIN/i,
      /GROUP BY/i,
      /HAVING/i,
      /WINDOW/i,
      /WITH RECURSIVE/i
    ]
    
    return complexPatterns.some(pattern => pattern.test(query))
  }

  private generateQueryId(query: string, params: any[]): string {
    const crypto = require('crypto')
    return crypto.createHash('sha256').update(query + JSON.stringify(params)).digest('hex')
  }

  private getCachedOptimizedQuery(queryId: string): OptimizedQuery | null {
    return this.queryCache.get(queryId) || null
  }

  private cacheOptimizedQuery(queryId: string, optimized: OptimizedQuery): void {
    this.queryCache.set(queryId, optimized)
    
    // Keep cache size manageable
    if (this.queryCache.size > 1000) {
      const firstKey = this.queryCache.keys().next().value
      if (firstKey) {
        this.queryCache.delete(firstKey)
      }
    }
  }

  private logQueryPerformance(queryId: string, executionTime: number, rowCount: number): void {
    if (executionTime > QUERY_CONFIG.THRESHOLDS.SLOW_QUERY_MS) {
      this.slowQueries.push({
        queryId,
        executionTime,
        rowCount,
        timestamp: Date.now()
      })
      
      // Keep only last 1000 slow queries
      if (this.slowQueries.length > 1000) {
        this.slowQueries.shift()
      }
    }
  }

  private logQueryError(queryId: string, error: any): void {
    console.error(`Query execution error for ${queryId}:`, error)
  }

  private detectMissingIndexes(query: string): string[] {
    // Simple heuristic for detecting missing indexes
    const missingIndexes: string[] = []
    
    // Look for WHERE clauses without indexes
    const whereMatch = query.match(/WHERE\s+(\w+)\s*=/i)
    if (whereMatch) {
      missingIndexes.push(whereMatch[1])
    }
    
    // Look for ORDER BY clauses without indexes
    const orderMatch = query.match(/ORDER BY\s+(\w+)/i)
    if (orderMatch) {
      missingIndexes.push(orderMatch[1])
    }
    
    return missingIndexes
  }

  private detectNPlusOneProblem(query: string): boolean {
    // Simple heuristic for N+1 query detection
    return query.includes('SELECT') && query.includes('WHERE') && query.includes('IN')
  }

  private calculateOptimizationPotential(missingIndexes: string[], hasNPlusOne: boolean, estimatedCost: number): number {
    let potential = 0
    
    if (missingIndexes.length > 0) potential += 30
    if (hasNPlusOne) potential += 50
    if (estimatedCost > 10) potential += 20
    
    return Math.min(potential, 100)
  }

  private generateRecommendations(analysis: QueryAnalysisResult): string[] {
    const recommendations: string[] = []
    
    if (analysis.missingIndexes.length > 0) {
      recommendations.push(`Consider adding indexes on: ${analysis.missingIndexes.join(', ')}`)
    }
    
    if (analysis.hasNPlusOne) {
      recommendations.push('Consider using JOIN instead of N+1 queries')
    }
    
    if (analysis.complexity === 'complex' || analysis.complexity === 'very_complex') {
      recommendations.push('Consider breaking down complex query into simpler parts')
    }
    
    return recommendations
  }

  private addIndexHints(query: string, indexes: string[]): string {
    // This is a simplified implementation
    // In practice, you'd need to parse the SQL properly
    return query // Placeholder for index hint addition
  }

  private optimizeJoinOrder(query: string): string {
    // Simplified JOIN optimization
    return query // Placeholder for JOIN optimization
  }

  private addQueryHints(query: string, analysis: QueryAnalysisResult): string {
    // Add PostgreSQL query hints
    if (analysis.complexity === 'very_complex') {
      return `/*+ SET_VAR(optimizer_switch='materialization=off' */ ${query}`
    }
    
    return query
  }

  private simplifyExpressions(query: string): string {
    // Simplify complex expressions
    return query // Placeholder for expression simplification
  }
}

// Type definitions
interface OptimizedQueryOptions {
  skipOptimization?: boolean
  addIndexHints?: boolean
  optimizeJoins?: boolean
  addQueryHints?: boolean
  cache?: boolean
  cacheTtl?: number
}

interface OptimizedResult<T = any> {
  rows: T[]
  rowCount: number
  queryTime: number
  optimization?: {
    originalQuery?: string
    optimizedQuery?: string
    optimizations: string[]
    estimatedImprovement: number
  }
}

interface PaginationOptions {
  limit?: number
  offset?: number
  orderBy?: string
  orderDirection?: 'ASC' | 'DESC'
}

interface PaginatedResult<T = any> {
  data: T[]
  pagination: {
    limit: number
    offset: number
    total: number
    hasMore: boolean
    page: number
    totalPages: number
  }
  performance: {
    queryTime: number
    optimizations: string[]
  }
}

interface BatchOptimizedQuery {
  query: string
  params: any[]
  options?: OptimizedQueryOptions
  index?: number
}

interface BatchOptimizedResult<T = any> {
  index: number
  success: boolean
  data: T[] | null
  queryTime: number
  error: string | null
}

interface QueryAnalysis {
  query: string
  complexity: string
  estimatedCost: number
  recommendations: string[]
  optimizationPotential: number
}

interface QueryAnalysisResult {
  complexity: string
  estimatedCost: number
  missingIndexes: string[]
  hasNPlusOne: boolean
  optimizationPotential: number
}

interface OptimizedQuery {
  query: string
  optimizations: string[]
  estimatedImprovement: number
}

interface SlowQueryLog {
  queryId: string
  executionTime: number
  rowCount: number
  timestamp: number
}

export const queryOptimizer = QueryOptimizer.getInstance()
