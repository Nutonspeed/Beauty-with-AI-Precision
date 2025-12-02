// Global Error Handler for Beauty with AI Precision
import { NextRequest, NextResponse } from 'next/server'
import { errorLogger } from './logger'
import { circuitBreaker } from './circuit-breaker'
import { retryManager } from './retry/retry-manager'
import { GenericErrorFallback, NetworkErrorFallback, AIServiceErrorFallback } from '@/components/error/fallback/error-components'

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
    new AppError(`${resource} not found`, ErrorType.NOT_FOUND, ErrorSeverity.LOW, 404, true, context, false),
  
  rateLimit: (message: string = 'Rate limit exceeded', context?: any) => 
    new AppError(message, ErrorType.RATE_LIMIT, ErrorSeverity.MEDIUM, 429, true, context, true),
  
  externalAPI: (service: string, message: string, context?: any) => 
    new AppError(`${service} API error: ${message}`, ErrorType.EXTERNAL_API, ErrorSeverity.HIGH, 502, true, context, true),
  
  database: (message: string, context?: any) => 
    new AppError(`Database error: ${message}`, ErrorType.DATABASE, ErrorSeverity.HIGH, 500, true, context, true),
  
  aiService: (service: string, message: string, context?: any) => 
    new AppError(`AI service ${service} error: ${message}`, ErrorType.AI_SERVICE, ErrorSeverity.HIGH, 503, true, context, true),
  
  network: (message: string, context?: any) => 
    new AppError(`Network error: ${message}`, ErrorType.NETWORK, ErrorSeverity.MEDIUM, 503, true, context, true),
  
  internal: (message: string, context?: any) => 
    new AppError(`Internal error: ${message}`, ErrorType.INTERNAL, ErrorSeverity.CRITICAL, 500, false, context, false)
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
    if (process.env.NODE_ENV === 'development' && (error as any).context) {
      (response.error as any).context = (error as any).context
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
    return circuitBreaker.execute(operation)
  }

  // Generate request ID for tracking
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
