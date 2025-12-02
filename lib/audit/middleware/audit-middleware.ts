// Audit Middleware for Next.js
import { NextRequest, NextResponse } from 'next/server'
import { auditLogger } from '@/lib/audit/audit-logger'

export interface AuditMiddlewareOptions {
  excludePaths?: string[]
  excludeMethods?: string[]
  logRequestBody?: boolean
  logResponseBody?: boolean
  sanitizeData?: boolean
}

export class AuditMiddleware {
  private options: AuditMiddlewareOptions

  constructor(options: AuditMiddlewareOptions = {}) {
    this.options = {
      excludePaths: ['/health', '/metrics', '/_next', '/api/health'],
      excludeMethods: ['GET', 'HEAD', 'OPTIONS'],
      logRequestBody: false,
      logResponseBody: false,
      sanitizeData: true,
      ...options
    }
  }

  // Middleware function for Next.js
  middleware() {
    return async (request: NextRequest) => {
      const startTime = Date.now()
      const path = request.nextUrl.pathname
      const method = request.method

      // Skip excluded paths
      if (this.shouldExclude(path, method)) {
        return NextResponse.next()
      }

      // Extract user and session info
      const userId = await this.extractUserId(request)
      const clinicId = await this.extractClinicId(request)
      const sessionId = await this.extractSessionId(request)

      // Get request metadata
      const metadata = {
        userAgent: request.headers.get('user-agent') || undefined,
        ipAddress: this.getClientIP(request),
        path,
        method,
        requestId: this.generateRequestId()
      }

      try {
        // Log request start
        const eventId = await auditLogger.log({
          action: method.toLowerCase(),
          resource: 'api_request',
          userId,
          clinicId,
          sessionId,
          details: {
            path,
            method,
            query: Object.fromEntries(request.nextUrl.searchParams)
          },
          metadata,
          severity: 'low',
          category: 'system',
          result: 'success',
          source: 'api-middleware'
        })

        // Continue with request
        const response = NextResponse.next()

        // Add audit headers
        response.headers.set('X-Audit-Event-Id', eventId)
        response.headers.set('X-Request-Id', metadata.requestId)

        // Log request completion
        const responseTime = Date.now() - startTime
        await auditLogger.log({
          action: 'api_response',
          resource: 'api_request',
          userId,
          clinicId,
          sessionId,
          details: {
            path,
            method,
            statusCode: response.status,
            responseTime
          },
          metadata: {
            ...metadata,
            statusCode: response.status,
            responseTime
          },
          severity: response.status >= 400 ? 'medium' : 'low',
          category: 'system',
          result: response.status >= 400 ? 'failure' : 'success',
          source: 'api-middleware'
        })

        return response

      } catch (error) {
        // Log error
        await auditLogger.log({
          action: 'api_error',
          resource: 'api_request',
          userId,
          clinicId,
          sessionId,
          details: {
            path,
            method,
            error: error instanceof Error ? error.message : 'Unknown error'
          },
          metadata,
          severity: 'high',
          category: 'system',
          result: 'error',
          source: 'api-middleware'
        })

        return NextResponse.next()
      }
    }
  }

  // Check if request should be excluded from audit
  private shouldExclude(path: string, method: string): boolean {
    return !!(
      this.options.excludePaths?.some(excludePath => 
        path.startsWith(excludePath)
      ) ||
      this.options.excludeMethods?.includes(method)
    )
  }

  // Extract user ID from request
  private async extractUserId(request: NextRequest): Promise<string | undefined> {
    try {
      // Try to get user from authorization header
      const authHeader = request.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        // Verify JWT token and extract user ID
        // Implementation depends on your auth system
        return undefined // Placeholder
      }

      // Try to get user from session cookie
      const sessionCookie = request.cookies.get('session')
      if (sessionCookie) {
        // Verify session and extract user ID
        return undefined // Placeholder
      }

      return undefined
    } catch (error) {
      return undefined
    }
  }

  // Extract clinic ID from request
  private async extractClinicId(request: NextRequest): Promise<string | undefined> {
    try {
      // Try to get clinic from headers
      const clinicHeader = request.headers.get('x-clinic-id')
      if (clinicHeader) {
        return clinicHeader
      }

      // Try to get clinic from user session
      // Implementation depends on your auth system
      return undefined
    } catch (error) {
      return undefined
    }
  }

  // Extract session ID from request
  private async extractSessionId(request: NextRequest): Promise<string | undefined> {
    try {
      const sessionCookie = request.cookies.get('session')
      return sessionCookie?.value
    } catch (error) {
      return undefined
    }
  }

  // Get client IP address
  private getClientIP(request: NextRequest): string {
    return (
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown'
    )
  }

  // Generate unique request ID
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Sanitize sensitive data
  private sanitizeData(data: any): any {
    if (!this.options.sanitizeData || !data) {
      return data
    }

    const sensitiveFields = [
      'password', 'token', 'secret', 'key', 'auth',
      'creditCard', 'ssn', 'socialSecurityNumber'
    ]

    const sanitize = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(sanitize)
      }

      if (obj && typeof obj === 'object') {
        const sanitized: any = {}
        
        for (const [key, value] of Object.entries(obj)) {
          const lowerKey = key.toLowerCase()
          
          if (sensitiveFields.some(field => lowerKey.includes(field))) {
            sanitized[key] = '[REDACTED]'
          } else if (typeof value === 'object') {
            sanitized[key] = sanitize(value)
          } else {
            sanitized[key] = value
          }
        }
        
        return sanitized
      }

      return obj
    }

    return sanitize(data)
  }
}

// Create global middleware instance
export const auditMiddleware = new AuditMiddleware()

// Export middleware function for Next.js config
export function withAudit(options?: AuditMiddlewareOptions) {
  const middleware = new AuditMiddleware(options)
  return middleware.middleware()
}

export default AuditMiddleware
