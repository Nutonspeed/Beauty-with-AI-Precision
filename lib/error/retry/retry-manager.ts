// Advanced Retry Mechanism for Beauty with AI Precision
import { sleep } from '@/lib/utils'

// Retry configuration
const RETRY_CONFIG = {
  DEFAULT_MAX_ATTEMPTS: 3,
  DEFAULT_BASE_DELAY: 1000, // 1 second
  DEFAULT_MAX_DELAY: 30000, // 30 seconds
  DEFAULT_BACKOFF_FACTOR: 2,
  JITTER_FACTOR: 0.1 // Add randomness to prevent thundering herd
}

// Retry strategies
export enum RetryStrategy {
  EXPONENTIAL_BACKOFF = 'EXPONENTIAL_BACKOFF',
  LINEAR_BACKOFF = 'LINEAR_BACKOFF',
  FIXED_DELAY = 'FIXED_DELAY',
  IMMEDIATE = 'IMMEDIATE'
}

// Retry result types
export enum RetryResultType {
  SUCCESS = 'SUCCESS',
  FAILED_PERMANENT = 'FAILED_PERMANENT',
  FAILED_RETRYABLE = 'FAILED_RETRYABLE',
  MAX_ATTEMPTS_REACHED = 'MAX_ATTEMPTS_REACHED'
}

export interface RetryOptions {
  maxAttempts?: number
  baseDelay?: number
  maxDelay?: number
  backoffFactor?: number
  strategy?: RetryStrategy
  jitter?: boolean
  retryableErrors?: string[]
  onRetry?: (attempt: number, error: Error) => void
  shouldRetry?: (error: Error, attempt: number) => boolean
}

export interface RetryResult<T> {
  type: RetryResultType
  data?: T
  error?: Error
  attempts: number
  totalTime: number
}

export class RetryManager {
  private static instance: RetryManager
  private retryMetrics: Map<string, RetryMetrics> = new Map()
  private defaultConfig: RetryOptions = {
    maxAttempts: RETRY_CONFIG.DEFAULT_MAX_ATTEMPTS,
    baseDelay: RETRY_CONFIG.DEFAULT_BASE_DELAY,
    maxDelay: RETRY_CONFIG.DEFAULT_MAX_DELAY,
    backoffFactor: RETRY_CONFIG.DEFAULT_BACKOFF_FACTOR,
    strategy: RetryStrategy.EXPONENTIAL_BACKOFF
  }

  static getInstance(): RetryManager {
    if (!RetryManager.instance) {
      RetryManager.instance = new RetryManager()
    }
    return RetryManager.instance
  }

  // Execute operation with retry
  async execute<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const config = { ...this.defaultConfig, ...options }
    let lastError: Error | null = null
    const startTime = Date.now()

    for (let attempt = 1; attempt <= (config.maxAttempts || 3); attempt++) {
      try {
        const result = await operation()
        
        // Record successful retry
        if (attempt > 1) {
          this.recordRetryMetrics(operation.name || 'anonymous', {
            attempts: attempt,
            success: true,
            totalTime: Date.now() - startTime
          })
        }
        
        return result
      } catch (error) {
        lastError = error as Error
        
        // Check if we should retry
        if (attempt === config.maxAttempts || !this.shouldRetry(error as Error, attempt, config)) {
          break
        }
        
        // Calculate delay
        const delay = this.calculateDelay(attempt, config)
        
        // Call retry callback
        if (config.onRetry) {
          config.onRetry(attempt, error as Error)
        }
        
        // Log retry attempt
        console.warn(`Retry attempt ${attempt}/${config.maxAttempts} for ${operation.name || 'operation'} after ${delay}ms: ${(error as Error).message}`)
        
        // Wait before retry
        await sleep(delay)
      }
    }
    
    // Record failed retry
    this.recordRetryMetrics(operation.name || 'anonymous', {
      attempts: config.maxAttempts,
      success: false,
      totalTime: Date.now() - startTime,
      finalError: lastError?.message
    })
    
    throw lastError!
  }

  // Execute with detailed result
  async executeWithResult<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<RetryResult<T>> {
    try {
      const data = await this.execute(operation, options)
      return {
        type: RetryResultType.SUCCESS,
        data,
        attempts: 1,
        totalTime: 0
      }
    } catch (error) {
      const err = error as Error
      return {
        type: this.shouldRetry(err, options.maxAttempts || RETRY_CONFIG.DEFAULT_MAX_ATTEMPTS, this.mergeConfig(options))
          ? RetryResultType.MAX_ATTEMPTS_REACHED
          : RetryResultType.FAILED_PERMANENT,
        error: err,
        attempts: options.maxAttempts || RETRY_CONFIG.DEFAULT_MAX_ATTEMPTS,
        totalTime: 0
      }
    }
  }

  // Execute multiple operations with retry
  async executeBatch<T>(
    operations: Array<() => Promise<T>>,
    options: RetryOptions = {}
  ): Promise<Array<RetryResult<T>>> {
    const results: Array<RetryResult<T>> = []
    
    // Execute operations in parallel with individual retry logic
    const promises = operations.map(async (operation, index) => {
      try {
        const data = await this.execute(operation, options)
        return {
          index,
          type: RetryResultType.SUCCESS,
          data,
          attempts: 1,
          totalTime: 0
        } as RetryResult<T>
      } catch (error) {
        return {
          index,
          type: RetryResultType.FAILED_PERMANENT,
          error: error as Error,
          attempts: options.maxAttempts || RETRY_CONFIG.DEFAULT_MAX_ATTEMPTS,
          totalTime: 0
        } as RetryResult<T>
      }
    })
    
    const batchResults = await Promise.all(promises)
    results.push(...batchResults)
    
    return results
  }

  // Execute with circuit breaker
  async executeWithCircuitBreaker<T>(
    operation: () => Promise<T>,
    serviceName: string,
    retryOptions: RetryOptions = {},
    circuitBreakerOptions: any = {}
  ): Promise<T> {
    // This would integrate with the circuit breaker
    return this.execute(operation, retryOptions)
  }

  // Check if error is retryable
  private shouldRetry(error: Error, attempt: number, config: any): boolean {
    // Use custom retry logic if provided
    if (config.shouldRetry) {
      return config.shouldRetry(error, attempt)
    }
    
    // Default retry logic - retry for network and timeout errors
    const retryableErrors = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED']
    return retryableErrors.some(code => error.message.includes(code))
  }

  // Calculate retry delay
  private calculateDelay(attempt: number, config: any): number {
    let delay: number
    
    switch (config.strategy) {
      case RetryStrategy.LINEAR_BACKOFF:
        delay = config.baseDelay * attempt
        break
      case RetryStrategy.FIXED_DELAY:
        delay = config.baseDelay
        break
      case RetryStrategy.IMMEDIATE:
        delay = 0
        break
      case RetryStrategy.EXPONENTIAL_BACKOFF:
      default:
        delay = config.baseDelay * Math.pow(config.backoffFactor, attempt - 1)
        break
    }
    
    // Apply maximum delay limit
    delay = Math.min(delay, config.maxDelay)
    
    // Add jitter to prevent thundering herd
    if (config.jitter) {
      const jitterAmount = delay * RETRY_CONFIG.JITTER_FACTOR
      delay += Math.random() * jitterAmount * 2 - jitterAmount
    }
    
    return Math.max(0, Math.floor(delay))
  }

  // Merge configuration with defaults
  private mergeConfig(options: RetryOptions): any {
    return {
      maxAttempts: options.maxAttempts || RETRY_CONFIG.DEFAULT_MAX_ATTEMPTS,
      baseDelay: options.baseDelay || RETRY_CONFIG.DEFAULT_BASE_DELAY,
      maxDelay: options.maxDelay || RETRY_CONFIG.DEFAULT_MAX_DELAY,
      backoffFactor: options.backoffFactor || RETRY_CONFIG.DEFAULT_BACKOFF_FACTOR,
      strategy: options.strategy || RetryStrategy.EXPONENTIAL_BACKOFF,
      jitter: options.jitter !== false,
      retryableErrors: options.retryableErrors || [],
      onRetry: options.onRetry,
      shouldRetry: options.shouldRetry
    }
  }

  // Record retry metrics
  private recordRetryMetrics(operationName: string, metrics: any): void {
    if (!this.retryMetrics.has(operationName)) {
      this.retryMetrics.set(operationName, {
        totalRetries: 0,
        successfulRetries: 0,
        failedRetries: 0,
        averageAttempts: 0,
        totalOperations: 0
      })
    }
    
    const operationMetrics = this.retryMetrics.get(operationName)!
    operationMetrics.totalRetries += metrics.attempts - 1
    operationMetrics.totalOperations++
    
    if (metrics.success) {
      operationMetrics.successfulRetries++
    } else {
      operationMetrics.failedRetries++
    }
    
    operationMetrics.averageAttempts = operationMetrics.totalRetries / operationMetrics.totalOperations
  }

  // Get retry metrics
  getRetryMetrics(): Map<string, RetryMetrics> {
    return new Map(this.retryMetrics)
  }

  // Clear retry metrics
  clearRetryMetrics(): void {
    this.retryMetrics.clear()
  }
}

// Specialized retry handlers for different services
export class ServiceRetryHandlers {
  // Retry handler for AI services
  static async retryAIService<T>(
    operation: () => Promise<T>,
    serviceName: string
  ): Promise<T> {
    const retryManager = RetryManager.getInstance()
    
    return retryManager.execute(operation, {
      maxAttempts: 3,
      baseDelay: 2000, // 2 seconds for AI services
      maxDelay: 10000, // 10 seconds max
      strategy: RetryStrategy.EXPONENTIAL_BACKOFF,
      jitter: true,
      retryableErrors: ['timeout', 'network', 'connection', '503', '502'],
      onRetry: (attempt, error) => {
        console.warn(`AI service ${serviceName} retry ${attempt}: ${error.message}`)
      }
    })
  }

  // Retry handler for database operations
  static async retryDatabase<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    const retryManager = RetryManager.getInstance()
    
    return retryManager.execute(operation, {
      maxAttempts: 5, // More retries for database
      baseDelay: 500, // Faster initial retry
      maxDelay: 5000,
      strategy: RetryStrategy.EXPONENTIAL_BACKOFF,
      jitter: true,
      retryableErrors: ['connection', 'timeout', 'deadlock', 'connection reset'],
      onRetry: (attempt, error) => {
        console.warn(`Database operation ${operationName} retry ${attempt}: ${error.message}`)
      }
    })
  }

  // Retry handler for external APIs
  static async retryExternalAPI<T>(
    operation: () => Promise<T>,
    apiName: string
  ): Promise<T> {
    const retryManager = RetryManager.getInstance()
    
    return retryManager.execute(operation, {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      strategy: RetryStrategy.EXPONENTIAL_BACKOFF,
      jitter: true,
      retryableErrors: ['429', '502', '503', '504', 'timeout', 'network'],
      onRetry: (attempt, error) => {
        console.warn(`External API ${apiName} retry ${attempt}: ${error.message}`)
      }
    })
  }
}

// Type definitions
interface RetryMetrics {
  totalRetries: number
  successfulRetries: number
  failedRetries: number
  averageAttempts: number
  totalOperations: number
}

// Export singleton instance
export const retryManager = RetryManager.getInstance()
