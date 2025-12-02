// API Error Handling Middleware for Beauty with AI Precision
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
      result.headers.set('X-Response-Time', `${Date.now() - startTime}ms`)
      result.headers.set('X-Request-ID', requestId)

      return result

    } catch (error) {
      // Handle the error
      const errorResponse = await globalErrorHandler.handleAPIError(error as Error, req)
      
      // Add error tracking headers
      errorResponse.headers.set('X-Request-ID', requestId)
      errorResponse.headers.set('X-Response-Time', `${Date.now() - startTime}ms`)
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
          console.warn(`API retry attempt ${attempt}: ${error.message}`)
          errorLogger.logWarning(`API retry attempt ${attempt}`, {
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
    errors.push(`Content-Type must be ${rules.requiredContentType}`)
  }
  
  // Check required headers
  if (rules.requiredHeaders) {
    for (const header of rules.requiredHeaders) {
      if (!req.headers.get(header)) {
        errors.push(`Missing required header: ${header}`)
      }
    }
  }
  
  // Check maximum content length
  if (rules.maxContentLength) {
    const contentLength = req.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > rules.maxContentLength) {
      errors.push(`Content too large. Maximum size: ${rules.maxContentLength} bytes`)
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
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
  notFound: (resource: string) => new AppError(`${resource} not found`, ErrorType.NOT_FOUND, ErrorSeverity.LOW, 404),
  rateLimit: (message: string = 'Rate limit exceeded') => new AppError(message, ErrorType.RATE_LIMIT, ErrorSeverity.MEDIUM, 429),
  internal: (message: string) => new AppError(message, ErrorType.INTERNAL, ErrorSeverity.HIGH, 500),
  serviceUnavailable: (service: string) => new AppError(`${service} is currently unavailable`, ErrorType.EXTERNAL_API, ErrorSeverity.HIGH, 503)
}
