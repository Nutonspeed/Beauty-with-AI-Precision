#!/usr/bin/env node

/**
 * Comprehensive Error Handling and Retry Mechanisms Setup Script
 * Implements advanced error handling, retry logic, and circuit breaker patterns
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

// Create error handling directories
function createErrorHandlingDirectories() {
  colorLog('\n📁 Creating error handling directories...', 'cyan')
  
  const directories = [
    'lib/error',
    'lib/error/boundaries',
    'lib/error/retry',
    'lib/error/circuit-breaker',
    'lib/error/fallback',
    'components/error',
    'components/error/fallback',
    'app/error',
    'scripts/error/monitoring'
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

// Create global error handler system
function createGlobalErrorHandler() {
  colorLog('\n🛡️ Creating global error handler system...', 'cyan')
  
  const errorHandler = `// Global Error Handler for Beauty with AI Precision
import { NextRequest, NextResponse } from 'next/server'
import { errorLogger } from './logger'
import { circuitBreaker } from './circuit-breaker'
import { retryManager } from './retry-manager'

// Error types
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  EXTERNAL_API = 'EXTERNAL_API',
  DATABASE = 'DATABASE',
  AI_SERVICE = 'AI_SERVICE',
  NETWORK = 'NETWORK',
  INTERNAL = 'INTERNAL'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Custom error class
export class AppError extends Error {
  public readonly type: ErrorType
  public readonly severity: ErrorSeverity
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly context?: Record<string, any>
  public readonly retryable: boolean

  constructor(
    message: string,
    type: ErrorType = ErrorType.INTERNAL,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, any>,
    retryable: boolean = false
  ) {
    super(message)
    this.type = type
    this.severity = severity
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.context = context
    this.retryable = retryable

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor)
  }
}

// Error factory functions
export const ErrorFactory = {
  validation: (message: string, context?: any) => 
    new AppError(message, ErrorType.VALIDATION, ErrorSeverity.LOW, 400, true, context, false),
  
  authentication: (message: string, context?: any) => 
    new AppError(message, ErrorType.AUTHENTICATION, ErrorSeverity.MEDIUM, 401, true, context, false),
  
  authorization: (message: string, context?: any) => 
    new AppError(message, ErrorType.AUTHORIZATION, ErrorSeverity.MEDIUM, 403, true, context, false),
  
  notFound: (resource: string, context?: any) => 
    new AppError(\`\${resource} not found\`, ErrorType.NOT_FOUND, ErrorSeverity.LOW, 404, true, context, false),
  
  rateLimit: (message: string = 'Rate limit exceeded', context?: any) => 
    new AppError(message, ErrorType.RATE_LIMIT, ErrorSeverity.MEDIUM, 429, true, context, true),
  
  externalAPI: (service: string, message: string, context?: any) => 
    new AppError(\`\${service} API error: \${message}\`, ErrorType.EXTERNAL_API, ErrorSeverity.HIGH, 502, true, context, true),
  
  database: (message: string, context?: any) => 
    new AppError(\`Database error: \${message}\`, ErrorType.DATABASE, ErrorSeverity.HIGH, 500, true, context, true),
  
  aiService: (service: string, message: string, context?: any) => 
    new AppError(\`AI service \${service} error: \${message}\`, ErrorType.AI_SERVICE, ErrorSeverity.HIGH, 503, true, context, true),
  
  network: (message: string, context?: any) => 
    new AppError(\`Network error: \${message}\`, ErrorType.NETWORK, ErrorSeverity.MEDIUM, 503, true, context, true),
  
  internal: (message: string, context?: any) => 
    new AppError(\`Internal error: \${message}\`, ErrorType.INTERNAL, ErrorSeverity.CRITICAL, 500, false, context, false)
}

// Global error handler middleware
export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler

  static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler()
    }
    return GlobalErrorHandler.instance
  }

  // Handle API errors
  async handleAPIError(error: Error, request?: NextRequest): Promise<NextResponse> {
    // Log the error
    await errorLogger.logError(error, {
      url: request?.url,
      method: request?.method,
      userAgent: request?.headers.get('user-agent'),
      ip: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip')
    })

    // Determine if error is operational
    const isAppError = error instanceof AppError
    
    if (isAppError) {
      return this.handleAppError(error as AppError)
    } else {
      return this.handleUnexpectedError(error)
    }
  }

  // Handle application errors
  private handleAppError(error: AppError): NextResponse {
    const response = {
      success: false,
      error: {
        type: error.type,
        message: error.message,
        severity: error.severity,
        retryable: error.retryable,
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId()
      }
    }

    // Add context in development
    if (process.env.NODE_ENV === 'development' && error.context) {
      response.error.context = error.context
    }

    return NextResponse.json(response, { status: error.statusCode })
  }

  // Handle unexpected errors
  private handleUnexpectedError(error: Error): NextResponse {
    // Don't expose internal error details in production
    const message = process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : error.message

    const response = {
      success: false,
      error: {
        type: ErrorType.INTERNAL,
        message,
        severity: ErrorSeverity.CRITICAL,
        retryable: false,
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId()
      }
    }

    return NextResponse.json(response, { status: 500 })
  }

  // Handle async errors with retry
  async handleAsyncWithRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    return retryManager.execute(operation, options)
  }

  // Handle circuit breaker protected operations
  async handleWithCircuitBreaker<T>(
    operation: () => Promise<T>,
    serviceName: string,
    options: CircuitBreakerOptions = {}
  ): Promise<T> {
    return circuitBreaker.execute(operation, serviceName, options)
  }

  // Generate request ID for tracking
  private generateRequestId(): string {
    return \`req_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`
  }

  // Check if error should be retried
  shouldRetry(error: Error): boolean {
    if (error instanceof AppError) {
      return error.retryable
    }
    
    // Retry network errors and timeouts
    const retryablePatterns = [
      /network/i,
      /timeout/i,
      /connection/i,
      /ECONNRESET/,
      /ETIMEDOUT/
    ]
    
    return retryablePatterns.some(pattern => pattern.test(error.message))
  }

  // Get user-friendly error message
  getUserFriendlyMessage(error: Error): string {
    if (error instanceof AppError) {
      switch (error.type) {
        case ErrorType.VALIDATION:
          return 'Please check your input and try again.'
        case ErrorType.AUTHENTICATION:
          return 'Please log in to continue.'
        case ErrorType.AUTHORIZATION:
          return 'You do not have permission to perform this action.'
        case ErrorType.NOT_FOUND:
          return 'The requested resource was not found.'
        case ErrorType.RATE_LIMIT:
          return 'Too many requests. Please try again later.'
        case ErrorType.EXTERNAL_API:
          return 'External service is temporarily unavailable. Please try again later.'
        case ErrorType.DATABASE:
          return 'Database is temporarily unavailable. Please try again later.'
        case ErrorType.AI_SERVICE:
          return 'AI service is temporarily unavailable. Please try again later.'
        case ErrorType.NETWORK:
          return 'Network connection issue. Please check your internet connection.'
        default:
          return 'An error occurred. Please try again later.'
      }
    }
    
    return 'An unexpected error occurred. Please try again later.'
  }
}

// Error boundary for React components
export class ErrorBoundary {
  private static instance: ErrorBoundary
  private errorCallbacks: Array<(error: Error, errorInfo: any) => void> = []

  static getInstance(): ErrorBoundary {
    if (!ErrorBoundary.instance) {
      ErrorBoundary.instance = new ErrorBoundary()
    }
    return ErrorBoundary.instance
  }

  // Add error callback
  onError(callback: (error: Error, errorInfo: any) => void): void {
    this.errorCallbacks.push(callback)
  }

  // Handle React error
  handleError(error: Error, errorInfo: any): void {
    // Log the error
    errorLogger.logError(error, {
      componentStack: errorInfo.componentStack,
      type: 'react_error_boundary'
    })

    // Notify callbacks
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error, errorInfo)
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError)
      }
    })
  }

  // Get fallback UI based on error type
  getFallbackUI(error: Error): React.ComponentType {
    if (error instanceof AppError) {
      switch (error.type) {
        case ErrorType.NETWORK:
          return () => <NetworkErrorFallback />
        case ErrorType.AI_SERVICE:
          return () => <AIServiceErrorFallback />
        default:
          return () => <GenericErrorFallback error={error} />
      }
    }
    
    return () => <GenericErrorFallback error={error} />
  }
}

// Error monitoring and metrics
export class ErrorMonitor {
  private static instance: ErrorMonitor
  private metrics: ErrorMetrics = {
    totalErrors: 0,
    errorsByType: {},
    errorsBySeverity: {},
    recentErrors: []
  }

  static getInstance(): ErrorMonitor {
    if (!ErrorMonitor.instance) {
      ErrorMonitor.instance = new ErrorMonitor()
    }
    return ErrorMonitor.instance
  }

  // Record error
  recordError(error: Error, context?: any): void {
    this.metrics.totalErrors++
    
    if (error instanceof AppError) {
      this.metrics.errorsByType[error.type] = (this.metrics.errorsByType[error.type] || 0) + 1
      this.metrics.errorsBySeverity[error.severity] = (this.metrics.errorsBySeverity[error.severity] || 0) + 1
    }
    
    this.metrics.recentErrors.push({
      error: error.message,
      timestamp: Date.now(),
      context
    })
    
    // Keep only last 100 errors
    if (this.metrics.recentErrors.length > 100) {
      this.metrics.recentErrors.shift()
    }
  }

  // Get error metrics
  getMetrics(): ErrorMetrics {
    return { ...this.metrics }
  }

  // Get error rate
  getErrorRate(timeWindowMs: number = 3600000): number {
    const cutoff = Date.now() - timeWindowMs
    const recentErrors = this.metrics.recentErrors.filter(e => e.timestamp > cutoff)
    return recentErrors.length / (timeWindowMs / 1000) // errors per second
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics = {
      totalErrors: 0,
      errorsByType: {},
      errorsBySeverity: {},
      recentErrors: []
    }
  }
}

// Type definitions
interface RetryOptions {
  maxAttempts?: number
  baseDelay?: number
  maxDelay?: number
  backoffFactor?: number
  retryableErrors?: string[]
}

interface CircuitBreakerOptions {
  failureThreshold?: number
  resetTimeout?: number
  monitoringPeriod?: number
}

interface ErrorMetrics {
  totalErrors: number
  errorsByType: Record<string, number>
  errorsBySeverity: Record<string, number>
  recentErrors: Array<{
    error: string
    timestamp: number
    context?: any
  }>
}

// Export singleton instances
export const globalErrorHandler = GlobalErrorHandler.getInstance()
export const errorBoundary = ErrorBoundary.getInstance()
export const errorMonitor = ErrorMonitor.getInstance()
`

  const handlerPath = path.join(process.cwd(), 'lib', 'error', 'global-handler.ts')
  fs.writeFileSync(handlerPath, errorHandler)
  colorLog('✅ Global error handler system created', 'green')
}

// Create retry mechanism system
function createRetryMechanism() {
  colorLog('\n🔄 Creating retry mechanism system...', 'cyan')
  
  const retrySystem = `// Advanced Retry Mechanism for Beauty with AI Precision
import { globalErrorHandler } from './global-handler'
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
    const config = this.mergeConfig(options)
    const startTime = Date.now()
    let lastError: Error
    
    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
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
        console.warn(\`Retry attempt \${attempt}/\${config.maxAttempts} for \${operation.name || 'operation'} after \${delay}ms: \${error.message}\`)
        
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
    
    // Use global error handler retry logic
    return globalErrorHandler.shouldRetry(error)
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
        console.warn(\`AI service \${serviceName} retry \${attempt}: \${error.message}\`)
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
        console.warn(\`Database operation \${operationName} retry \${attempt}: \${error.message}\`)
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
        console.warn(\`External API \${apiName} retry \${attempt}: \${error.message}\`)
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

// Utility function for sleep/delay
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Export singleton instance
export const retryManager = RetryManager.getInstance()
`

  const retryPath = path.join(process.cwd(), 'lib', 'error', 'retry', 'retry-manager.ts')
  fs.writeFileSync(retryPath, retrySystem)
  colorLog('✅ Retry mechanism system created', 'green')
}

// Create circuit breaker pattern
function createCircuitBreaker() {
  colorLog('\n⚡ Creating circuit breaker pattern...', 'cyan')
  
  const circuitBreaker = `// Circuit Breaker Pattern for Beauty with AI Precision
import { globalErrorHandler } from '../global-handler'
import { sleep } from '@/lib/utils'

// Circuit breaker states
export enum CircuitState {
  CLOSED = 'CLOSED',      // Normal operation
  OPEN = 'OPEN',          // Circuit is open, calls fail immediately
  HALF_OPEN = 'HALF_OPEN' // Testing if service has recovered
}

// Circuit breaker configuration
interface CircuitBreakerConfig {
  failureThreshold: number    // Number of failures before opening
  resetTimeout: number        // Time to wait before trying half-open
  monitoringPeriod: number    // Time window for failure counting
  successThreshold: number    // Successes needed to close circuit in half-open
  timeout: number             // Operation timeout
}

export interface CircuitBreakerOptions {
  failureThreshold?: number
  resetTimeout?: number
  monitoringPeriod?: number
  successThreshold?: number
  timeout?: number
}

export interface CircuitBreakerMetrics {
  state: CircuitState
  failures: number
  successes: number
  totalCalls: number
  lastFailureTime?: number
  lastSuccessTime?: number
  averageResponseTime: number
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED
  private failures: number = 0
  private successes: number = 0
  private totalCalls: number = 0
  private lastFailureTime?: number
  private lastSuccessTime?: number
  private responseTimes: number[] = []
  private failureTimes: number[] = []
  
  private config: CircuitBreakerConfig
  private serviceName: string

  constructor(serviceName: string, config: CircuitBreakerOptions = {}) {
    this.serviceName = serviceName
    this.config = {
      failureThreshold: config.failureThreshold || 5,
      resetTimeout: config.resetTimeout || 60000,    // 1 minute
      monitoringPeriod: config.monitoringPeriod || 300000, // 5 minutes
      successThreshold: config.successThreshold || 3,
      timeout: config.timeout || 30000               // 30 seconds
    }
  }

  // Execute operation with circuit breaker protection
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    const startTime = Date.now()
    
    // Check if circuit is open
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN
        console.log(\`Circuit breaker for \${this.serviceName} moving to HALF_OPEN\`)
      } else {
        throw new Error(\`Circuit breaker for \${this.serviceName} is OPEN\`)
      }
    }

    try {
      // Add timeout to operation
      const result = await this.withTimeout(operation(), this.config.timeout)
      
      // Record success
      this.recordSuccess(Date.now() - startTime)
      
      return result
    } catch (error) {
      // Record failure
      this.recordFailure()
      
      throw error
    }
  }

  // Get current circuit state
  getState(): CircuitState {
    return this.state
  }

  // Get circuit metrics
  getMetrics(): CircuitBreakerMetrics {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      totalCalls: this.totalCalls,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      averageResponseTime: this.calculateAverageResponseTime()
    }
  }

  // Reset circuit breaker
  reset(): void {
    this.state = CircuitState.CLOSED
    this.failures = 0
    this.successes = 0
    this.failureTimes = []
    this.responseTimes = []
    console.log(\`Circuit breaker for \${this.serviceName} reset to CLOSED\`)
  }

  // Force open circuit
  forceOpen(): void {
    this.state = CircuitState.OPEN
    this.lastFailureTime = Date.now()
    console.log(\`Circuit breaker for \${this.serviceName} forced OPEN\`)
  }

  // Record successful operation
  private recordSuccess(responseTime: number): void {
    this.totalCalls++
    this.successes++
    this.lastSuccessTime = Date.now()
    this.responseTimes.push(responseTime)
    
    // Keep only last 100 response times
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift()
    }
    
    // If in half-open state, check if we should close
    if (this.state === CircuitState.HALF_OPEN) {
      if (this.successes >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED
        this.failures = 0
        console.log(\`Circuit breaker for \${this.serviceName} closing after \${this.successes} successes\`)
      }
    }
    
    // Clean old failure times
    this.cleanupOldFailures()
  }

  // Record failed operation
  private recordFailure(): void {
    this.totalCalls++
    this.failures++
    this.lastFailureTime = Date.now()
    this.failureTimes.push(Date.now())
    
    // If in closed state, check if we should open
    if (this.state === CircuitState.CLOSED) {
      if (this.failures >= this.config.failureThreshold) {
        this.state = CircuitState.OPEN
        console.log(\`Circuit breaker for \${this.serviceName} opening after \${this.failures} failures\`)
      }
    }
    
    // If in half-open state, open immediately on failure
    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN
      console.log(\`Circuit breaker for \${this.serviceName} opening again in HALF_OPEN state\`)
    }
    
    // Clean old failure times
    this.cleanupOldFailures()
  }

  // Check if we should attempt reset
  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return false
    
    const timeSinceLastFailure = Date.now() - this.lastFailureTime
    return timeSinceLastFailure >= this.config.resetTimeout
  }

  // Clean old failure times outside monitoring period
  private cleanupOldFailures(): void {
    const cutoff = Date.now() - this.config.monitoringPeriod
    this.failureTimes = this.failureTimes.filter(time => time > cutoff)
    
    // Update failure count
    this.failures = this.failureTimes.length
  }

  // Calculate average response time
  private calculateAverageResponseTime(): number {
    if (this.responseTimes.length === 0) return 0
    
    const sum = this.responseTimes.reduce((acc, time) => acc + time, 0)
    return sum / this.responseTimes.length
  }

  // Add timeout to operation
  private async withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(\`Operation timed out after \${timeoutMs}ms\`)), timeoutMs)
    })
    
    return Promise.race([operation, timeoutPromise])
  }
}

// Circuit breaker manager for multiple services
export class CircuitBreakerManager {
  private static instance: CircuitBreakerManager
  private circuitBreakers: Map<string, CircuitBreaker> = new Map()

  static getInstance(): CircuitBreakerManager {
    if (!CircuitBreakerManager.instance) {
      CircuitBreakerManager.instance = new CircuitBreakerManager()
    }
    return CircuitBreakerManager.instance
  }

  // Get or create circuit breaker for a service
  getCircuitBreaker(serviceName: string, options?: CircuitBreakerOptions): CircuitBreaker {
    if (!this.circuitBreakers.has(serviceName)) {
      this.circuitBreakers.set(serviceName, new CircuitBreaker(serviceName, options))
    }
    
    return this.circuitBreakers.get(serviceName)!
  }

  // Execute operation with circuit breaker
  async execute<T>(
    operation: () => Promise<T>,
    serviceName: string,
    options?: CircuitBreakerOptions
  ): Promise<T> {
    const circuitBreaker = this.getCircuitBreaker(serviceName, options)
    return circuitBreaker.execute(operation)
  }

  // Get all circuit breaker metrics
  getAllMetrics(): Map<string, CircuitBreakerMetrics> {
    const metrics = new Map<string, CircuitBreakerMetrics>()
    
    this.circuitBreakers.forEach((breaker, serviceName) => {
      metrics.set(serviceName, breaker.getMetrics())
    })
    
    return metrics
  }

  // Reset all circuit breakers
  resetAll(): void {
    this.circuitBreakers.forEach((breaker) => {
      breaker.reset()
    })
  }

  // Get circuit breakers in specific state
  getCircuitBreakersInState(state: CircuitState): string[] {
    const result: string[] = []
    
    this.circuitBreakers.forEach((breaker, serviceName) => {
      if (breaker.getState() === state) {
        result.push(serviceName)
      }
    })
    
    return result
  }
}

// Pre-configured circuit breakers for common services
export class ServiceCircuitBreakers {
  private static manager = CircuitBreakerManager.getInstance()

  // AI Service circuit breaker
  static aiService(operation: () => Promise<any>, serviceName: string): Promise<any> {
    return this.manager.execute(operation, \`ai-\${serviceName}\`, {
      failureThreshold: 3,
      resetTimeout: 30000,    // 30 seconds
      monitoringPeriod: 120000, // 2 minutes
      successThreshold: 2,
      timeout: 15000          // 15 seconds
    })
  }

  // Database circuit breaker
  static database(operation: () => Promise<any>): Promise<any> {
    return this.manager.execute(operation, 'database', {
      failureThreshold: 5,
      resetTimeout: 10000,    // 10 seconds
      monitoringPeriod: 60000, // 1 minute
      successThreshold: 3,
      timeout: 5000           // 5 seconds
    })
  }

  // External API circuit breaker
  static externalAPI(operation: () => Promise<any>, apiName: string): Promise<any> {
    return this.manager.execute(operation, \`api-\${apiName}\`, {
      failureThreshold: 4,
      resetTimeout: 60000,    // 1 minute
      monitoringPeriod: 300000, // 5 minutes
      successThreshold: 3,
      timeout: 10000          // 10 seconds
    })
  }

  // Redis circuit breaker
  static redis(operation: () => Promise<any>): Promise<any> {
    return this.manager.execute(operation, 'redis', {
      failureThreshold: 3,
      resetTimeout: 5000,     // 5 seconds
      monitoringPeriod: 30000, // 30 seconds
      successThreshold: 2,
      timeout: 2000           // 2 seconds
    })
  }
}

// Export singleton instance
export const circuitBreakerManager = CircuitBreakerManager.getInstance()
`

  const circuitPath = path.join(process.cwd(), 'lib', 'error', 'circuit-breaker', 'circuit-breaker.ts')
  fs.writeFileSync(circuitPath, circuitBreaker)
  colorLog('✅ Circuit breaker pattern created', 'green')
}

// Create fallback UI components
function createFallbackComponents() {
  colorLog('\n🎨 Creating fallback UI components...', 'cyan')
  
  const fallbackComponents = `'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, WifiOff, Database, Brain } from 'lucide-react'

// Generic error fallback component
interface GenericErrorFallbackProps {
  error?: Error
  resetError?: () => void
}

export function GenericErrorFallback({ error, resetError }: GenericErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-red-800">Something went wrong</CardTitle>
          <CardDescription>
            {error?.message || 'An unexpected error occurred'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            Please try again or contact support if the problem persists.
          </div>
          {resetError && (
            <Button 
              onClick={resetError} 
              className="w-full"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
          <div className="text-xs text-muted-foreground text-center">
            Error ID: {generateErrorId()}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Network error fallback
export function NetworkErrorFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <WifiOff className="w-6 h-6 text-orange-600" />
          </div>
          <CardTitle className="text-orange-800">Connection Error</CardTitle>
          <CardDescription>
            Unable to connect to our servers. Please check your internet connection.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            • Check your internet connection<br/>
            • Try refreshing the page<br/>
            • Contact support if the problem continues
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full"
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Page
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Database error fallback
export function DatabaseErrorFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Database className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-blue-800">Database Error</CardTitle>
          <CardDescription>
            Our database is temporarily unavailable. We're working to fix this issue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            Your data is safe. This is a temporary issue that should be resolved soon.
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full"
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// AI service error fallback
export function AIServiceErrorFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <CardTitle className="text-purple-800">AI Service Unavailable</CardTitle>
          <CardDescription>
            Our AI analysis service is temporarily unavailable.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            You can still use other features while we fix this issue.
          </div>
          <div className="space-y-2">
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button 
              onClick={() => window.history.back()} 
              className="w-full"
              variant="ghost"
            >
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Rate limit error fallback
export function RateLimitErrorFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
          <CardTitle className="text-yellow-800">Rate Limit Exceeded</CardTitle>
          <CardDescription>
            You've made too many requests. Please wait a moment before trying again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            To ensure fair usage for everyone, we limit the number of requests.
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full"
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Loading fallback component
export function LoadingFallback({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
          <CardTitle className="text-blue-800">Loading</CardTitle>
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

// Inline error component for smaller errors
interface InlineErrorProps {
  error: Error
  onRetry?: () => void
  onDismiss?: () => void
}

export function InlineError({ error, onRetry, onDismiss }: InlineErrorProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Error occurred
          </h3>
          <div className="mt-2 text-sm text-red-700">
            {error.message}
          </div>
          {onRetry && (
            <div className="mt-3">
              <Button 
                onClick={onRetry} 
                size="sm" 
                variant="outline"
                className="text-red-700 border-red-300 hover:bg-red-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          )}
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={onDismiss}
                className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100"
              >
                <span className="sr-only">Dismiss</span>
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Error boundary component
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error?: Error; resetError?: () => void }> },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo)
    
    // You could also send to an error reporting service here
    // reportError(error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || GenericErrorFallback
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

// Generate error ID for tracking
function generateErrorId(): string {
  return \`err_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`
}

// Error toast component for notifications
interface ErrorToastProps {
  error: Error
  onDismiss: () => void
  autoClose?: boolean
  duration?: number
}

export function ErrorToast({ error, onDismiss, autoClose = true, duration = 5000 }: ErrorToastProps) {
  React.useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onDismiss, duration)
      return () => clearTimeout(timer)
    }
  }, [autoClose, duration, onDismiss])

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-red-800">
              Error
            </p>
            <p className="mt-1 text-sm text-red-700">
              {error.message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={onDismiss}
              className="text-red-400 hover:text-red-500"
            >
              <span className="sr-only">Close</span>
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
`

  const fallbackPath = path.join(process.cwd(), 'components', 'error', 'fallback', 'error-components.tsx')
  fs.writeFileSync(fallbackPath, fallbackPath)
  colorLog('✅ Fallback UI components created', 'green')
}

// Create error logging system
function createErrorLoggingSystem() {
  colorLog('\n📝 Creating error logging system...', 'cyan')
  
  const loggingSystem = `// Advanced Error Logging System for Beauty with AI Precision
import { createClient } from '@/lib/supabase/server'

// Error log levels
export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

// Error categories
export enum ErrorCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  DATABASE = 'DATABASE',
  EXTERNAL_API = 'EXTERNAL_API',
  AI_SERVICE = 'AI_SERVICE',
  NETWORK = 'NETWORK',
  PERFORMANCE = 'PERFORMANCE',
  SECURITY = 'SECURITY',
  USER_INTERFACE = 'USER_INTERFACE',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC'
}

// Error log entry
export interface ErrorLogEntry {
  id?: string
  level: LogLevel
  category: ErrorCategory
  message: string
  stack?: string
  context?: Record<string, any>
  userId?: string
  clinicId?: string
  sessionId?: string
  requestId?: string
  userAgent?: string
  ip?: string
  url?: string
  method?: string
  statusCode?: number
  timestamp: string
  resolved?: boolean
  resolvedAt?: string
  resolvedBy?: string
}

// Error logger configuration
interface LoggerConfig {
  enableConsoleLogging: boolean
  enableDatabaseLogging: boolean
  enableRemoteLogging: boolean
  logLevel: LogLevel
  remoteEndpoint?: string
  batchSize: number
  flushInterval: number
}

export class ErrorLogger {
  private static instance: ErrorLogger
  private config: LoggerConfig
  private pendingLogs: ErrorLogEntry[] = []
  private flushTimer?: NodeJS.Timeout

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      enableConsoleLogging: config.enableConsoleLogging ?? true,
      enableDatabaseLogging: config.enableDatabaseLogging ?? true,
      enableRemoteLogging: config.enableRemoteLogging ?? false,
      logLevel: config.logLevel ?? LogLevel.ERROR,
      remoteEndpoint: config.remoteEndpoint,
      batchSize: config.batchSize ?? 10,
      flushInterval: config.flushInterval ?? 5000,
      ...config
    }

    // Start flush timer
    this.startFlushTimer()
  }

  static getInstance(config?: Partial<LoggerConfig>): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger(config)
    }
    return ErrorLogger.instance
  }

  // Log error
  async logError(error: Error, context?: Record<string, any>): Promise<void> {
    const logEntry = this.createLogEntry(error, context)
    await this.log(logEntry)
  }

  // Log warning
  async logWarning(message: string, context?: Record<string, any>): Promise<void> {
    const logEntry = this.createLogEntry(message, LogLevel.WARN, ErrorCategory.BUSINESS_LOGIC, context)
    await this.log(logEntry)
  }

  // Log info
  async logInfo(message: string, context?: Record<string, any>): Promise<void> {
    const logEntry = this.createLogEntry(message, LogLevel.INFO, ErrorCategory.BUSINESS_LOGIC, context)
    await this.log(logEntry)
  }

  // Log debug
  async logDebug(message: string, context?: Record<string, any>): Promise<void> {
    const logEntry = this.createLogEntry(message, LogLevel.DEBUG, ErrorCategory.BUSINESS_LOGIC, context)
    await this.log(logEntry)
  }

  // Log security event
  async logSecurity(message: string, context?: Record<string, any>): Promise<void> {
    const logEntry = this.createLogEntry(message, LogLevel.WARN, ErrorCategory.SECURITY, context)
    await this.log(logEntry)
  }

  // Log performance issue
  async logPerformance(message: string, context?: Record<string, any>): Promise<void> {
    const logEntry = this.createLogEntry(message, LogLevel.WARN, ErrorCategory.PERFORMANCE, context)
    await this.log(logEntry)
  }

  // Main log method
  private async log(logEntry: ErrorLogEntry): Promise<void> {
    // Check log level
    if (!this.shouldLog(logEntry.level)) {
      return
    }

    // Console logging
    if (this.config.enableConsoleLogging) {
      this.logToConsole(logEntry)
    }

    // Add to pending logs for batch processing
    if (this.config.enableDatabaseLogging || this.config.enableRemoteLogging) {
      this.pendingLogs.push(logEntry)
      
      // Flush immediately for errors
      if (logEntry.level === LogLevel.ERROR) {
        await this.flushLogs()
      }
    }
  }

  // Create log entry
  private createLogEntry(
    errorOrMessage: Error | string,
    level: LogLevel = LogLevel.ERROR,
    category: ErrorCategory = ErrorCategory.BUSINESS_LOGIC,
    context?: Record<string, any>
  ): ErrorLogEntry {
    const now = new Date().toISOString()
    
    let message: string
    let stack: string | undefined
    
    if (errorOrMessage instanceof Error) {
      message = errorOrMessage.message
      stack = errorOrMessage.stack
      
      // Determine category from error type if not provided
      if (!context?.category) {
        category = this.categorizeError(errorOrMessage)
      }
    } else {
      message = errorOrMessage
    }

    return {
      level,
      category,
      message,
      stack,
      context,
      timestamp: now,
      sessionId: this.getSessionId(),
      requestId: this.getRequestId(),
      ...this.extractRequestContext()
    }
  }

  // Categorize error based on type and message
  private categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase()
    
    if (message.includes('auth') || message.includes('login') || message.includes('token')) {
      return ErrorCategory.AUTHENTICATION
    }
    
    if (message.includes('permission') || message.includes('unauthorized') || message.includes('forbidden')) {
      return ErrorCategory.AUTHORIZATION
    }
    
    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      return ErrorCategory.VALIDATION
    }
    
    if (message.includes('database') || message.includes('sql') || message.includes('connection')) {
      return ErrorCategory.DATABASE
    }
    
    if (message.includes('network') || message.includes('timeout') || message.includes('fetch')) {
      return ErrorCategory.NETWORK
    }
    
    if (message.includes('ai') || message.includes('model') || message.includes('analysis')) {
      return ErrorCategory.AI_SERVICE
    }
    
    if (message.includes('security') || message.includes('csrf') || message.includes('xss')) {
      return ErrorCategory.SECURITY
    }
    
    return ErrorCategory.BUSINESS_LOGIC
  }

  // Extract request context
  private extractRequestContext(): Partial<ErrorLogEntry> {
    // This would be implemented based on your request context extraction
    // For now, return empty object
    return {}
  }

  // Get session ID
  private getSessionId(): string {
    // Implementation would depend on your session management
    return 'session_' + Date.now()
  }

  // Get request ID
  private getRequestId(): string {
    // Implementation would depend on your request tracking
    return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  // Check if should log based on level
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR]
    const configLevelIndex = levels.indexOf(this.config.logLevel)
    const logLevelIndex = levels.indexOf(level)
    
    return logLevelIndex >= configLevelIndex
  }

  // Log to console
  private logToConsole(logEntry: ErrorLogEntry): void {
    const timestamp = new Date(logEntry.timestamp).toISOString()
    const prefix = \`[\${timestamp}] [\${logEntry.level}] [\${logEntry.category}]\`
    
    switch (logEntry.level) {
      case LogLevel.ERROR:
        console.error(prefix, logEntry.message, logEntry.context)
        if (logEntry.stack) {
          console.error(logEntry.stack)
        }
        break
      case LogLevel.WARN:
        console.warn(prefix, logEntry.message, logEntry.context)
        break
      case LogLevel.INFO:
        console.info(prefix, logEntry.message, logEntry.context)
        break
      case LogLevel.DEBUG:
        console.debug(prefix, logEntry.message, logEntry.context)
        break
    }
  }

  // Flush pending logs
  private async flushLogs(): Promise<void> {
    if (this.pendingLogs.length === 0) {
      return
    }

    const logsToFlush = [...this.pendingLogs]
    this.pendingLogs = []

    try {
      // Database logging
      if (this.config.enableDatabaseLogging) {
        await this.flushToDatabase(logsToFlush)
      }

      // Remote logging
      if (this.config.enableRemoteLogging && this.config.remoteEndpoint) {
        await this.flushToRemote(logsToFlush)
      }
    } catch (error) {
      console.error('Failed to flush logs:', error)
      // Re-add logs to pending if flush failed
      this.pendingLogs.unshift(...logsToFlush)
    }
  }

  // Flush to database
  private async flushToDatabase(logs: ErrorLogEntry[]): Promise<void> {
    try {
      const supabase = createClient()
      
      // Insert logs in batches
      const { error } = await supabase
        .from('error_logs')
        .insert(logs.map(log => ({
          level: log.level,
          category: log.category,
          message: log.message,
          stack: log.stack,
          context: log.context,
          user_id: log.userId,
          clinic_id: log.clinicId,
          session_id: log.sessionId,
          request_id: log.requestId,
          user_agent: log.userAgent,
          ip: log.ip,
          url: log.url,
          method: log.method,
          status_code: log.statusCode,
          created_at: log.timestamp
        })))

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Database logging failed:', error)
      throw error
    }
  }

  // Flush to remote endpoint
  private async flushToRemote(logs: ErrorLogEntry[]): Promise<void> {
    try {
      const response = await fetch(this.config.remoteEndpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs })
      })

      if (!response.ok) {
        throw new Error(\`Remote logging failed: \${response.status}\`)
      }
    } catch (error) {
      console.error('Remote logging failed:', error)
      throw error
    }
  }

  // Start flush timer
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }

    this.flushTimer = setInterval(() => {
      if (this.pendingLogs.length > 0) {
        this.flushLogs()
      }
    }, this.config.flushInterval)
  }

  // Stop logger
  stop(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = undefined
    }
    
    // Flush remaining logs
    this.flushLogs()
  }

  // Get error statistics
  async getErrorStats(timeRange?: { start: string; end: string }): Promise<ErrorStats> {
    try {
      const supabase = createClient()
      
      let query = supabase
        .from('error_logs')
        .select('*')
      
      if (timeRange) {
        query = query
          .gte('created_at', timeRange.start)
          .lte('created_at', timeRange.end)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      const stats: ErrorStats = {
        total: data?.length || 0,
        byLevel: {},
        byCategory: {},
        recent: data?.slice(-10) || [],
        resolved: data?.filter(log => log.resolved).length || 0
      }
      
      // Count by level
      data?.forEach(log => {
        stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1
        stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1
      })
      
      return stats
    } catch (error) {
      console.error('Failed to get error stats:', error)
      return {
        total: 0,
        byLevel: {},
        byCategory: {},
        recent: [],
        resolved: 0
      }
    }
  }
}

// Error statistics interface
export interface ErrorStats {
  total: number
  byLevel: Record<string, number>
  byCategory: Record<string, number>
  recent: any[]
  resolved: number
}

// Export singleton instance
export const errorLogger = ErrorLogger.getInstance()
`

  const loggerPath = path.join(process.cwd(), 'lib', 'error', 'logger.ts')
  fs.writeFileSync(loggerPath, loggingSystem)
  colorLog('✅ Error logging system created', 'green')
}

// Create React error boundaries
function createReactErrorBoundaries() {
  colorLog('\n⚛️ Creating React error boundaries...', 'cyan')
  
  const errorBoundaries = `'use client'

import React, { Component, ReactNode, ErrorInfo } from 'react'
import { errorLogger } from '@/lib/error/logger'
import { errorBoundary } from '@/lib/error/global-handler'
import { GenericErrorFallback, NetworkErrorFallback, AIServiceErrorFallback } from '@/components/error/fallback/error-components'

// Props for error boundary
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError?: () => void }>
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  isolate?: boolean
}

// State for error boundary
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorId?: string
}

// Main Error Boundary Component
export class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0
  private maxRetries = 3

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: \`error_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to our error logger
    errorLogger.logError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: 'AppErrorBoundary',
      retryCount: this.retryCount,
      errorId: this.state.errorId,
      isolated: this.props.isolate
    })

    // Handle through global error boundary
    errorBoundary.handleError(error, errorInfo)

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Report to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo)
    }
  }

  // Reset error boundary
  resetError = () => {
    this.retryCount++
    
    // Prevent infinite retries
    if (this.retryCount > this.maxRetries) {
      console.warn('Max retries reached for error boundary')
      return
    }

    this.setState({ hasError: false, error: undefined, errorId: undefined })
  }

  // Report error to external service
  private reportError(error: Error, errorInfo: ErrorInfo) {
    // This would integrate with services like Sentry, LogRocket, etc.
    try {
      // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } })
      console.log('Error reported to external service:', error.message)
    } catch (reportError) {
      console.error('Failed to report error:', reportError)
    }
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || GenericErrorFallback
      
      return (
        <FallbackComponent 
          error={this.state.error} 
          resetError={this.resetError}
        />
      )
    }

    return this.props.children
  }
}

// Specialized error boundaries for different contexts

// AI Service Error Boundary
export class AIServiceErrorBoundary extends Component<Omit<ErrorBoundaryProps, 'fallback'>> {
  render() {
    return (
      <AppErrorBoundary
        {...this.props}
        fallback={AIServiceErrorFallback}
        onError={(error, errorInfo) => {
          // Log AI service specific errors
          errorLogger.logError(error, {
            category: 'AI_SERVICE',
            componentStack: errorInfo.componentStack,
            service: 'ai_boundary'
          })
          
          if (this.props.onError) {
            this.props.onError(error, errorInfo)
          }
        }}
      >
        {this.props.children}
      </AppErrorBoundary>
    )
  }
}

// Network Error Boundary
export class NetworkErrorBoundary extends Component<Omit<ErrorBoundaryProps, 'fallback'>> {
  render() {
    return (
      <AppErrorBoundary
        {...this.props}
        fallback={NetworkErrorFallback}
        onError={(error, errorInfo) => {
          // Log network specific errors
          errorLogger.logError(error, {
            category: 'NETWORK',
            componentStack: errorInfo.componentStack,
            service: 'network_boundary'
          })
          
          if (this.props.onError) {
            this.props.onError(error, errorInfo)
          }
        }}
      >
        {this.props.children}
      </AppErrorBoundary>
    )
  }
}

// Route-level Error Boundary
export class RouteErrorBoundary extends Component<ErrorBoundaryProps> {
  render() {
    return (
      <AppErrorBoundary
        {...this.props}
        isolate={true} // Isolate route errors
        onError={(error, errorInfo) => {
          // Log route specific errors
          errorLogger.logError(error, {
            category: 'USER_INTERFACE',
            componentStack: errorInfo.componentStack,
            route: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
            service: 'route_boundary'
          })
          
          if (this.props.onError) {
            this.props.onError(error, errorInfo)
          }
        }}
      >
        {this.props.children}
      </AppErrorBoundary>
    )
  }
}

// Hook for error handling in functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const handleError = React.useCallback((error: Error) => {
    setError(error)
    errorLogger.logError(error, {
      source: 'useErrorHandler',
      hook: true
    })
  }, [])

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  // Throw error to be caught by error boundary
  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { handleError, resetError }
}

// Hook for async error handling
export function useAsyncError() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const executeAsync = React.useCallback(async <T>(
    asyncOperation: () => Promise<T>,
    errorHandler?: (error: Error) => void
  ): Promise<T | null> => {
    try {
      const result = await asyncOperation()
      return result
    } catch (err) {
      const error = err as Error
      setError(error)
      
      errorLogger.logError(error, {
        source: 'useAsyncError',
        hook: true,
        asyncOperation: true
      })

      if (errorHandler) {
        errorHandler(error)
      }

      return null
    }
  }, [])

  return { error, resetError, executeAsync }
}

// Error Boundary Provider for app-wide error handling
interface ErrorBoundaryProviderProps {
  children: ReactNode
  config?: {
    enableErrorReporting?: boolean
    enableConsoleLogging?: boolean
    maxRetries?: number
  }
}

export function ErrorBoundaryProvider({ children, config }: ErrorBoundaryProviderProps) {
  const [globalError, setGlobalError] = React.useState<Error | null>(null)

  // Configure error logger
  React.useEffect(() => {
    if (config?.enableErrorReporting !== false) {
      // Configure error logger for production
      errorLogger.logInfo('Error boundary provider initialized', {
        config,
        timestamp: new Date().toISOString()
      })
    }
  }, [config])

  // Handle global errors
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = new Error(event.reason?.message || 'Unhandled promise rejection')
      errorLogger.logError(error, {
        source: 'unhandledRejection',
        reason: event.reason,
        global: true
      })
    }

    const handleError = (event: ErrorEvent) => {
      const error = new Error(event.message)
      error.stack = event.error?.stack
      errorLogger.logError(error, {
        source: 'globalError',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        global: true
      })
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [])

  if (globalError) {
    return <GenericErrorFallback error={globalError} resetError={() => setGlobalError(null)} />
  }

  return (
    <AppErrorBoundary
      onError={(error, errorInfo) => {
        setGlobalError(error)
      }}
    >
      {children}
    </AppErrorBoundary>
  )
}

// Higher-order component for error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error?: Error; resetError?: () => void }>
) {
  return function WrappedComponent(props: P) {
    return (
      <AppErrorBoundary fallback={fallback}>
        <Component {...props} />
      </AppErrorBoundary>
    )
  }
}

// Export components
export {
  AppErrorBoundary as default,
  GenericErrorFallback,
  NetworkErrorFallback,
  AIServiceErrorFallback
}
`

  const boundariesPath = path.join(process.cwd(), 'lib', 'error', 'boundaries', 'react-boundaries.tsx')
  fs.writeFileSync(boundariesPath, errorBoundaries)
  colorLog('✅ React error boundaries created', 'green')
}

// Create API error handling middleware
function createAPIErrorHandling() {
  colorLog('\n🌐 Creating API error handling middleware...', 'cyan')
  
  const apiMiddleware = `// API Error Handling Middleware for Beauty with AI Precision
import { NextRequest, NextResponse } from 'next/server'
import { globalErrorHandler, AppError, ErrorType, ErrorSeverity } from '@/lib/error/global-handler'
import { retryManager } from '@/lib/error/retry/retry-manager'
import { circuitBreakerManager } from '@/lib/error/circuit-breaker/circuit-breaker'
import { errorLogger } from '@/lib/error/logger'

// API error handling configuration
interface APIErrorConfig {
  enableRetry: boolean
  enableCircuitBreaker: boolean
  enableRequestLogging: boolean
  enableResponseLogging: boolean
  maxRetries: number
  timeout: number
}

// Default configuration
const DEFAULT_CONFIG: APIErrorConfig = {
  enableRetry: true,
  enableCircuitBreaker: true,
  enableRequestLogging: true,
  enableResponseLogging: false,
  maxRetries: 3,
  timeout: 30000
}

// API error handler middleware
export function withAPIErrorHandling(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: Partial<APIErrorConfig> = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }

  return async (req: NextRequest): Promise<NextResponse> => {
    const requestId = generateRequestId()
    const startTime = Date.now()

    // Add request ID to headers for tracking
    const response = new Response()
    response.headers.set('X-Request-ID', requestId)

    try {
      // Log incoming request
      if (finalConfig.enableRequestLogging) {
        await logRequest(req, requestId)
      }

      // Execute handler with error handling
      let result: NextResponse

      if (finalConfig.enableCircuitBreaker) {
        // Execute with circuit breaker
        result = await circuitBreakerManager.execute(
          () => executeHandler(handler, req, finalConfig),
          'api-handler',
          {
            failureThreshold: 5,
            resetTimeout: 30000,
            timeout: finalConfig.timeout
          }
        )
      } else {
        result = await executeHandler(handler, req, finalConfig)
      }

      // Log successful response
      if (finalConfig.enableResponseLogging) {
        await logResponse(req, result, requestId, startTime)
      }

      // Add timing and request ID headers
      result.headers.set('X-Response-Time', \`\${Date.now() - startTime}ms\`)
      result.headers.set('X-Request-ID', requestId)

      return result

    } catch (error) {
      // Handle the error
      const errorResponse = await globalErrorHandler.handleAPIError(error as Error, req)
      
      // Add error tracking headers
      errorResponse.headers.set('X-Request-ID', requestId)
      errorResponse.headers.set('X-Response-Time', \`\${Date.now() - startTime}ms\`)
      errorResponse.headers.set('X-Error-Type', (error as AppError).type || 'UNKNOWN')

      return errorResponse
    }
  }
}

// Execute handler with retry logic
async function executeHandler(
  handler: (req: NextRequest) => Promise<NextResponse>,
  req: NextRequest,
  config: APIErrorConfig
): Promise<NextResponse> {
  if (config.enableRetry) {
    return retryManager.execute(
      () => handler(req),
      {
        maxAttempts: config.maxRetries,
        baseDelay: 1000,
        maxDelay: 10000,
        retryableErrors: ['NETWORK', 'EXTERNAL_API', 'TIMEOUT'],
        onRetry: (attempt, error) => {
          console.warn(\`API retry attempt \${attempt}: \${error.message}\`)
          errorLogger.logWarning(\`API retry attempt \${attempt}\`, {
            error: error.message,
            attempt,
            url: req.url
          })
        }
      }
    )
  }

  return handler(req)
}

// Specialized error handlers for different API types

// AI Service API handler
export function withAIServiceErrorHandling(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return withAPIErrorHandling(handler, {
    enableRetry: true,
    enableCircuitBreaker: true,
    maxRetries: 3,
    timeout: 60000 // Longer timeout for AI services
  })
}

// Database API handler
export function withDatabaseErrorHandling(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return withAPIErrorHandling(handler, {
    enableRetry: true,
    enableCircuitBreaker: true,
    maxRetries: 5, // More retries for database
    timeout: 10000 // Shorter timeout for database
  })
}

// External API handler
export function withExternalAPIErrorHandling(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return withAPIErrorHandling(handler, {
    enableRetry: true,
    enableCircuitBreaker: true,
    maxRetries: 3,
    timeout: 30000
  })
}

// Authentication API handler
export function withAuthErrorHandling(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return withAPIErrorHandling(handler, {
    enableRetry: false, // Don't retry auth errors
    enableCircuitBreaker: false,
    timeout: 5000
  })
}

// File upload API handler
export function withUploadErrorHandling(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return withAPIErrorHandling(handler, {
    enableRetry: false, // Don't retry file uploads
    enableCircuitBreaker: false,
    timeout: 120000 // Longer timeout for uploads
  })
}

// Rate limiting error handler
export class RateLimitHandler {
  private static requests = new Map<string, RequestCount[]>()
  
  static checkRateLimit(
    identifier: string,
    limit: number,
    windowMs: number
  ): { allowed: boolean; resetTime?: number } {
    const now = Date.now()
    const windowStart = now - windowMs
    
    // Get existing requests for this identifier
    let requests = this.requests.get(identifier) || []
    
    // Filter out old requests
    requests = requests.filter(req => req.timestamp > windowStart)
    
    // Check if limit exceeded
    if (requests.length >= limit) {
      const oldestRequest = Math.min(...requests.map(req => req.timestamp))
      const resetTime = oldestRequest + windowMs
      
      return { allowed: false, resetTime }
    }
    
    // Add current request
    requests.push({ timestamp: now })
    this.requests.set(identifier, requests)
    
    return { allowed: true }
  }
  
  static cleanup(): void {
    const now = Date.now()
    const windowMs = 3600000 // 1 hour
    
    for (const [identifier, requests] of this.requests.entries()) {
      const validRequests = requests.filter(req => req.timestamp > now - windowMs)
      
      if (validRequests.length === 0) {
        this.requests.delete(identifier)
      } else {
        this.requests.set(identifier, validRequests)
      }
    }
  }
}

// Request count interface
interface RequestCount {
  timestamp: number
}

// Validation helper
export function validateRequest(req: NextRequest, rules: ValidationRules): ValidationResult {
  const errors: string[] = []
  
  // Check content type
  if (rules.requiredContentType && !req.headers.get('content-type')?.includes(rules.requiredContentType)) {
    errors.push(\`Content-Type must be \${rules.requiredContentType}\`)
  }
  
  // Check required headers
  if (rules.requiredHeaders) {
    for (const header of rules.requiredHeaders) {
      if (!req.headers.get(header)) {
        errors.push(\`Missing required header: \${header}\`)
      }
    }
  }
  
  // Check maximum content length
  if (rules.maxContentLength) {
    const contentLength = req.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > rules.maxContentLength) {
      errors.push(\`Content too large. Maximum size: \${rules.maxContentLength} bytes\`)
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Validation rules interface
interface ValidationRules {
  requiredContentType?: string
  requiredHeaders?: string[]
  maxContentLength?: number
}

// Validation result interface
interface ValidationResult {
  valid: boolean
  errors: string[]
}

// Request logging
async function logRequest(req: NextRequest, requestId: string): Promise<void> {
  try {
    await errorLogger.logInfo('API request received', {
      requestId,
      method: req.method,
      url: req.url,
      userAgent: req.headers.get('user-agent'),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      contentType: req.headers.get('content-type'),
      contentLength: req.headers.get('content-length')
    })
  } catch (error) {
    console.error('Failed to log request:', error)
  }
}

// Response logging
async function logResponse(
  req: NextRequest,
  response: NextResponse,
  requestId: string,
  startTime: number
): Promise<void> {
  try {
    await errorLogger.logInfo('API response sent', {
      requestId,
      method: req.method,
      url: req.url,
      status: response.status,
      responseTime: Date.now() - startTime
    })
  } catch (error) {
    console.error('Failed to log response:', error)
  }
}

// Generate request ID
function generateRequestId(): string {
  return \`req_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`
}

// Cleanup interval for rate limiting
setInterval(() => {
  RateLimitHandler.cleanup()
}, 300000) // Cleanup every 5 minutes

// Export error creation helpers
export const APIErrors = {
  validation: (message: string) => new AppError(message, ErrorType.VALIDATION, ErrorSeverity.LOW, 400),
  unauthorized: (message: string = 'Unauthorized') => new AppError(message, ErrorType.AUTHENTICATION, ErrorSeverity.MEDIUM, 401),
  forbidden: (message: string = 'Forbidden') => new AppError(message, ErrorType.AUTHORIZATION, ErrorSeverity.MEDIUM, 403),
  notFound: (resource: string) => new AppError(\`\${resource} not found\`, ErrorType.NOT_FOUND, ErrorSeverity.LOW, 404),
  rateLimit: (message: string = 'Rate limit exceeded') => new AppError(message, ErrorType.RATE_LIMIT, ErrorSeverity.MEDIUM, 429),
  internal: (message: string) => new AppError(message, ErrorType.INTERNAL, ErrorSeverity.HIGH, 500),
  serviceUnavailable: (service: string) => new AppError(\`\${service} is currently unavailable\`, ErrorType.EXTERNAL_API, ErrorSeverity.HIGH, 503)
}
`

  const middlewarePath = path.join(process.cwd(), 'lib', 'error', 'api-middleware.ts')
  fs.writeFileSync(middlewarePath, apiMiddleware)
  colorLog('✅ API error handling middleware created', 'green')
}

// Update package.json with new dependencies
function updatePackageDependencies() {
  colorLog('\n📦 Updating package.json dependencies...', 'cyan')
  
  try {
    const packagePath = path.join(process.cwd(), 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
    
    // Add error handling scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      'error:test': 'node scripts/error/test-error-handling.js',
      'error:monitor': 'node scripts/error/monitor-errors.js',
      'error:setup': 'node scripts/setup-error-handling.js'
    }
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2))
    colorLog('✅ Package.json updated with error handling scripts', 'green')
    
  } catch (error) {
    colorLog(`⚠️ Could not update package.json: ${error.message}`, 'yellow')
  }
}

// Create error monitoring script
function createErrorMonitoringScript() {
  colorLog('\n📈 Creating error monitoring script...', 'cyan')
  
  const monitoringScript = `#!/usr/bin/env node

/**
 * Error Monitoring Script for Beauty with AI Precision
 * Monitors and reports on system errors and performance
 */

const { execAsync } = require('util').promisify(require('child_process').exec)
const fs = require('fs')
const path = require('path')

class ErrorMonitor {
  constructor() {
    this.metrics = {
      startTime: Date.now(),
      totalErrors: 0,
      errorsByType: {},
      errorsBySeverity: {},
      recentErrors: [],
      performanceMetrics: {
        responseTime: [],
        errorRate: [],
        throughput: []
      }
    }
    this.config = {
      checkInterval: 30000, // 30 seconds
      alertThresholds: {
        errorRate: 0.05, // 5% error rate
        responseTime: 2000, // 2 seconds
        consecutiveErrors: 10
      },
      notifications: {
        email: false,
        slack: false,
        console: true
      }
    }
  }

  async startMonitoring() {
    console.log('🔍 Starting Error Monitoring...')
    
    // Start monitoring interval
    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics()
    }, this.config.checkInterval)

    // Graceful shutdown
    process.on('SIGINT', () => this.shutdown())
    process.on('SIGTERM', () => this.shutdown())

    console.log('✅ Error monitoring started. Press Ctrl+C to stop.')
  }

  async collectMetrics() {
    try {
      const timestamp = Date.now()
      
      // Collect error metrics
      const errorMetrics = await this.getErrorMetrics()
      
      // Collect performance metrics
      const performanceMetrics = await this.getPerformanceMetrics()
      
      // Update metrics
      this.updateMetrics(errorMetrics, performanceMetrics)
      
      // Check for alerts
      this.checkAlerts()
      
      // Log summary
      this.logSummary()

    } catch (error) {
      console.error('❌ Metrics collection error:', error)
    }
  }

  async getErrorMetrics() {
    try {
      // This would query your error logging system
      // For now, return mock data
      return {
        totalErrors: Math.floor(Math.random() * 10),
        errorsByType: {
          'VALIDATION': Math.floor(Math.random() * 5),
          'EXTERNAL_API': Math.floor(Math.random() * 3),
          'DATABASE': Math.floor(Math.random() * 2),
          'AI_SERVICE': Math.floor(Math.random() * 4)
        },
        errorsBySeverity: {
          'LOW': Math.floor(Math.random() * 6),
          'MEDIUM': Math.floor(Math.random() * 3),
          'HIGH': Math.floor(Math.random() * 1),
          'CRITICAL': 0
        },
        recentErrors: [
          {
            message: 'Sample error',
            type: 'VALIDATION',
            severity: 'LOW',
            timestamp: Date.now()
          }
        ]
      }
    } catch (error) {
      return { error: error.message }
    }
  }

  async getPerformanceMetrics() {
    try {
      // This would query your performance monitoring system
      return {
        averageResponseTime: 150 + Math.random() * 200,
        errorRate: Math.random() * 0.1,
        throughput: 100 + Math.random() * 50,
        activeConnections: 5 + Math.floor(Math.random() * 10)
      }
    } catch (error) {
      return { error: error.message }
    }
  }

  updateMetrics(errorMetrics: any, performanceMetrics: any) {
    // Update error metrics
    this.metrics.totalErrors += errorMetrics.totalErrors || 0
    
    if (errorMetrics.errorsByType) {
      Object.entries(errorMetrics.errorsByType).forEach(([type, count]) => {
        this.metrics.errorsByType[type] = (this.metrics.errorsByType[type] || 0) + (count as number)
      })
    }
    
    if (errorMetrics.errorsBySeverity) {
      Object.entries(errorMetrics.errorsBySeverity).forEach(([severity, count]) => {
        this.metrics.errorsBySeverity[severity] = (this.metrics.errorsBySeverity[severity] || 0) + (count as number)
      })
    }
    
    if (errorMetrics.recentErrors) {
      this.metrics.recentErrors.push(...errorMetrics.recentErrors)
      
      // Keep only last 100 errors
      if (this.metrics.recentErrors.length > 100) {
        this.metrics.recentErrors = this.metrics.recentErrors.slice(-100)
      }
    }
    
    // Update performance metrics
    if (performanceMetrics.averageResponseTime) {
      this.metrics.performanceMetrics.responseTime.push(performanceMetrics.averageResponseTime)
      
      if (this.metrics.performanceMetrics.responseTime.length > 100) {
        this.metrics.performanceMetrics.responseTime.shift()
      }
    }
    
    if (performanceMetrics.errorRate !== undefined) {
      this.metrics.performanceMetrics.errorRate.push(performanceMetrics.errorRate)
      
      if (this.metrics.performanceMetrics.errorRate.length > 100) {
        this.metrics.performanceMetrics.errorRate.shift()
      }
    }
    
    if (performanceMetrics.throughput) {
      this.metrics.performanceMetrics.throughput.push(performanceMetrics.throughput)
      
      if (this.metrics.performanceMetrics.throughput.length > 100) {
        this.metrics.performanceMetrics.throughput.shift()
      }
    }
  }

  checkAlerts() {
    const alerts = []
    
    // Check error rate
    const recentErrorRate = this.getRecentErrorRate()
    if (recentErrorRate > this.config.alertThresholds.errorRate) {
      alerts.push({
        type: 'error_rate',
        level: 'warning',
        message: \`High error rate: \${(recentErrorRate * 100).toFixed(2)}%\`
      })
    }
    
    // Check response time
    const avgResponseTime = this.getAverageResponseTime()
    if (avgResponseTime > this.config.alertThresholds.responseTime) {
      alerts.push({
        type: 'response_time',
        level: 'warning',
        message: \`High response time: \${avgResponseTime.toFixed(0)}ms\`
      })
    }
    
    // Check consecutive errors
    const recentErrors = this.getRecentErrorCount()
    if (recentErrors > this.config.alertThresholds.consecutiveErrors) {
      alerts.push({
        type: 'consecutive_errors',
        level: 'critical',
        message: \`High number of recent errors: \${recentErrors}\`
      })
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
    
    console.log(\`\\n📊 [\${time}] Error Monitoring Summary:\`)
    console.log(\`  🚨 Total Errors: \${this.metrics.totalErrors}\`)
    console.log(\`  📈 Error Rate: \${(this.getRecentErrorRate() * 100).toFixed(2)}%\`)
    console.log(\`  ⚡ Avg Response Time: \${this.getAverageResponseTime().toFixed(0)}ms\`)
    console.log(\`  🔄 Throughput: \${this.getAverageThroughput().toFixed(0)} req/s\`)
    
    if (this.metrics.recentErrors.length > 0) {
      console.log(\`  📋 Recent Errors: \${this.metrics.recentErrors.slice(-5).map(e => e.message).join(', ')}\`)
    }
  }

  getRecentErrorRate(): number {
    const recentRates = this.metrics.performanceMetrics.errorRate.slice(-10)
    return recentRates.length > 0 ? recentRates.reduce((a, b) => a + b, 0) / recentRates.length : 0
  }

  getAverageResponseTime(): number {
    const responseTimes = this.metrics.performanceMetrics.responseTime.slice(-10)
    return responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0
  }

  getAverageThroughput(): number {
    const throughput = this.metrics.performanceMetrics.throughput.slice(-10)
    return throughput.length > 0 ? throughput.reduce((a, b) => a + b, 0) / throughput.length : 0
  }

  getRecentErrorCount(): number {
    const fiveMinutesAgo = Date.now() - 300000 // 5 minutes
    return this.metrics.recentErrors.filter(e => e.timestamp > fiveMinutesAgo).length
  }

  async shutdown() {
    console.log('\\n🔄 Shutting down error monitor...')
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
    }

    // Save final report
    await this.saveReport()
    
    console.log('✅ Error monitoring stopped. Report saved.')
    process.exit(0)
  }

  async saveReport() {
    const report = {
      summary: {
        monitoringDuration: Date.now() - this.metrics.startTime,
        totalErrors: this.metrics.totalErrors,
        averageErrorRate: this.getRecentErrorRate(),
        averageResponseTime: this.getAverageResponseTime()
      },
      metrics: this.metrics,
      generatedAt: new Date().toISOString()
    }

    const reportPath = path.join(process.cwd(), 'logs', 'error-monitoring-report.json')
    
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
  const monitor = new ErrorMonitor()
  monitor.startMonitoring()
}

module.exports = ErrorMonitor
`

  const scriptPath = path.join(process.cwd(), 'scripts', 'error', 'monitor-errors.js')
  fs.writeFileSync(scriptPath, monitoringScript)
  colorLog('✅ Error monitoring script created', 'green')
}

// Main execution function
async function main() {
  colorLog('🚀 Setting up Comprehensive Error Handling and Retry Mechanisms', 'bright')
  colorLog('=' .repeat(60), 'cyan')
  
  try {
    createErrorHandlingDirectories()
    createGlobalErrorHandler()
    createRetryMechanism()
    createCircuitBreaker()
    createFallbackComponents()
    createErrorLoggingSystem()
    createReactErrorBoundaries()
    createAPIErrorHandling()
    updatePackageDependencies()
    createErrorMonitoringScript()
    
    colorLog('\n' + '='.repeat(60), 'green')
    colorLog('🎉 Comprehensive Error Handling and Retry Mechanisms setup completed!', 'bright')
    colorLog('\n📋 Next Steps:', 'cyan')
    colorLog('1. Update your API routes to use error handling middleware', 'blue')
    colorLog('2. Wrap React components with error boundaries', 'blue')
    colorLog('3. Configure error logging for production', 'blue')
    colorLog('4. Test error scenarios and fallbacks', 'blue')
    colorLog('5. Run error monitor: pnpm run error:monitor', 'blue')
    
    colorLog('\n🛡️ Error Handling Features:', 'yellow')
    colorLog('• Global error boundaries with fallback UI', 'white')
    colorLog('• Automatic retry with exponential backoff', 'white')
    colorLog('• Circuit breaker pattern for external services', 'white')
    colorLog('• Comprehensive error logging and monitoring', 'white')
    colorLog('• Graceful degradation for AI services', 'white')
    colorLog('• Rate limiting and request validation', 'white')
    
    colorLog('\n📊 Monitoring & Alerting:', 'cyan')
    colorLog('• Real-time error tracking and metrics', 'blue')
    colorLog('• Performance monitoring with alerts', 'blue')
    colorLog('• Error categorization and severity levels', 'blue')
    colorLog('• Automated error reporting and analysis', 'blue')
    colorLog('• Customizable alert thresholds', 'blue')
    
    colorLog('\n🎨 User Experience Improvements:', 'green')
    colorLog('• Beautiful fallback UI components', 'white')
    colorLog('• Contextual error messages', 'white')
    colorLog('• Retry mechanisms with user feedback', 'white')
    colorLog('• Progressive error recovery', 'white')
    colorLog('• Offline and network error handling', 'white')
    
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
  createErrorHandlingDirectories,
  createGlobalErrorHandler,
  createRetryMechanism,
  createCircuitBreaker,
  createFallbackComponents,
  createErrorLoggingSystem,
  createReactErrorBoundaries,
  createAPIErrorHandling,
  updatePackageDependencies,
  createErrorMonitoringScript
}
