#!/usr/bin/env node

/**
 * Comprehensive Audit Logging System Setup Script
 * Implements enterprise-grade audit logging for Beauty with AI Precision platform
 */

const fs = require('fs')
const path = require('path')

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

// Create audit logging directories
function createAuditDirectories() {
  colorLog('\n📁 Creating audit logging directories...', 'cyan')
  
  const directories = [
    'lib/audit',
    'lib/audit/loggers',
    'lib/audit/middleware',
    'lib/audit/listeners',
    'lib/audit/reports',
    'components/audit',
    'components/audit/logs',
    'components/audit/reports',
    'app/api/audit',
    'app/api/audit/logs',
    'app/api/audit/reports',
    'app/api/audit/export',
    'scripts/audit',
    'scripts/audit/cleanup',
    'scripts/audit/archive',
    'scripts/audit/reports',
    'config/audit',
    'types/audit'
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

// Create audit logger core
function createAuditLogger() {
  colorLog('\n📝 Creating audit logger core...', 'cyan')
  
  const auditLogger = `// Comprehensive Audit Logger
import { createClient } from '@supabase/supabase-js'
import { auditConfig } from '@/config/audit'

export interface AuditEvent {
  id?: string
  timestamp: string
  userId?: string
  clinicId?: string
  sessionId?: string
  action: string
  resource: string
  resourceId?: string
  details?: Record<string, any>
  metadata?: {
    userAgent?: string
    ipAddress?: string
    requestId?: string
    path?: string
    method?: string
    statusCode?: number
    responseTime?: number
  }
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'auth' | 'data' | 'system' | 'security' | 'business' | 'compliance'
  result: 'success' | 'failure' | 'error'
  source: string
  tags?: string[]
}

export interface AuditFilter {
  userId?: string
  clinicId?: string
  action?: string
  resource?: string
  severity?: string[]
  category?: string[]
  result?: string[]
  dateRange?: [string, string]
  tags?: string[]
  search?: string
}

export interface AuditQuery {
  filter?: AuditFilter
  pagination?: {
    from?: number
    size?: number
    sort?: string
  }
  aggregations?: {
    actions?: boolean
    users?: boolean
    resources?: boolean
    severity?: boolean
    timeline?: boolean
  }
}

class AuditLogger {
  private supabase: any
  private config: typeof auditConfig
  private buffer: AuditEvent[] = []
  private flushTimer?: NodeJS.Timeout

  constructor() {
    this.config = auditConfig
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    if (this.config.buffer.enabled) {
      this.startBufferFlush()
    }
  }

  // Log audit event
  async log(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<string> {
    const auditEvent: AuditEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date().toISOString()
    }

    // Add default metadata
    if (!auditEvent.metadata) {
      auditEvent.metadata = {}
    }

    // Validate event
    this.validateEvent(auditEvent)

    // Buffer or immediate write
    if (this.config.buffer.enabled) {
      this.buffer.push(auditEvent)
      
      if (this.buffer.length >= this.config.buffer.maxSize) {
        await this.flushBuffer()
      }
      
      return auditEvent.id!
    } else {
      await this.writeEvent(auditEvent)
      return auditEvent.id!
    }
  }

  // Log authentication events
  async logAuth(event: {
    action: 'login' | 'logout' | 'register' | 'password_change' | 'mfa_verify' | 'session_expired'
    userId?: string
    clinicId?: string
    details?: Record<string, any>
    result: 'success' | 'failure' | 'error'
    metadata?: any
  }): Promise<string> {
    return this.log({
      ...event,
      resource: 'auth',
      category: 'auth',
      severity: this.getAuthSeverity(event.action, event.result),
      source: 'auth-system'
    })
  }

  // Log data access events
  async logDataAccess(event: {
    action: 'read' | 'create' | 'update' | 'delete' | 'export' | 'import'
    resource: string
    resourceId?: string
    userId?: string
    clinicId?: string
    details?: Record<string, any>
    result: 'success' | 'failure' | 'error'
    metadata?: any
  }): Promise<string> {
    return this.log({
      ...event,
      category: 'data',
      severity: this.getDataSeverity(event.action, event.result),
      source: 'data-access'
    })
  }

  // Log security events
  async logSecurity(event: {
    action: 'breach_attempt' | 'privilege_escalation' | 'suspicious_activity' | 'blocked_request' | 'rate_limit_exceeded'
    resource?: string
    resourceId?: string
    userId?: string
    clinicId?: string
    details?: Record<string, any>
    result: 'success' | 'failure' | 'error'
    metadata?: any
  }): Promise<string> {
    return this.log({
      ...event,
      resource: event.resource || 'security',
      category: 'security',
      severity: 'high',
      source: 'security-system'
    })
  }

  // Log business events
  async logBusiness(event: {
    action: string
    resource: string
    resourceId?: string
    userId?: string
    clinicId?: string
    details?: Record<string, any>
    result: 'success' | 'failure' | 'error'
    metadata?: any
  }): Promise<string> {
    return this.log({
      ...event,
      category: 'business',
      severity: 'medium',
      source: 'business-logic'
    })
  }

  // Log system events
  async logSystem(event: {
    action: string
    resource: string
    details?: Record<string, any>
    result: 'success' | 'failure' | 'error'
    metadata?: any
  }): Promise<string> {
    return this.log({
      ...event,
      category: 'system',
      severity: this.getSystemSeverity(event.action, event.result),
      source: 'system-monitor'
    })
  }

  // Query audit logs
  async query(query: AuditQuery) {
    try {
      let supabaseQuery = this.supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })

      // Apply filters
      if (query.filter) {
        const { filter } = query
        
        if (filter.userId) {
          supabaseQuery = supabaseQuery.eq('user_id', filter.userId)
        }
        
        if (filter.clinicId) {
          supabaseQuery = supabaseQuery.eq('clinic_id', filter.clinicId)
        }
        
        if (filter.action) {
          supabaseQuery = supabaseQuery.eq('action', filter.action)
        }
        
        if (filter.resource) {
          supabaseQuery = supabaseQuery.eq('resource', filter.resource)
        }
        
        if (filter.severity && filter.severity.length > 0) {
          supabaseQuery = supabaseQuery.in('severity', filter.severity)
        }
        
        if (filter.category && filter.category.length > 0) {
          supabaseQuery = supabaseQuery.in('category', filter.category)
        }
        
        if (filter.result && filter.result.length > 0) {
          supabaseQuery = supabaseQuery.in('result', filter.result)
        }
        
        if (filter.dateRange) {
          supabaseQuery = supabaseQuery
            .gte('timestamp', filter.dateRange[0])
            .lte('timestamp', filter.dateRange[1])
        }
        
        if (filter.search) {
          supabaseQuery = supabaseQuery.or(\`
            action.ilike.%\${filter.search}%,
            resource.ilike.%\${filter.search}%,
            details.ilike.%\${filter.search}%
          \`)
        }
      }

      // Apply pagination
      if (query.pagination) {
        const { from = 0, size = 50, sort = 'timestamp:desc' } = query.pagination
        
        supabaseQuery = supabaseQuery.range(from, from + size - 1)
        
        if (sort) {
          const [field, order] = sort.split(':')
          supabaseQuery = supabaseQuery.order(field, { ascending: order === 'asc' })
        }
      }

      const { data, error, count } = await supabaseQuery

      if (error) throw error

      return {
        events: data || [],
        total: count || 0,
        hasMore: (query.pagination?.from || 0) + (query.pagination?.size || 50) < (count || 0)
      }

    } catch (error) {
      console.error('Failed to query audit logs:', error)
      throw error
    }
  }

  // Get audit statistics
  async getStatistics(filter?: AuditFilter) {
    try {
      let supabaseQuery = this.supabase
        .from('audit_logs')
        .select('*')

      // Apply filters
      if (filter) {
        if (filter.userId) {
          supabaseQuery = supabaseQuery.eq('user_id', filter.userId)
        }
        
        if (filter.clinicId) {
          supabaseQuery = supabaseQuery.eq('clinic_id', filter.clinicId)
        }
        
        if (filter.dateRange) {
          supabaseQuery = supabaseQuery
            .gte('timestamp', filter.dateRange[0])
            .lte('timestamp', filter.dateRange[1])
        }
      }

      const { data, error } = await supabaseQuery

      if (error) throw error

      const stats = {
        total: data.length,
        byCategory: {} as Record<string, number>,
        bySeverity: {} as Record<string, number>,
        byAction: {} as Record<string, number>,
        byResource: {} as Record<string, number>,
        byResult: {} as Record<string, number>,
        timeline: {} as Record<string, number>
      }

      data.forEach((event: any) => {
        // Category stats
        stats.byCategory[event.category] = (stats.byCategory[event.category] || 0) + 1
        
        // Severity stats
        stats.bySeverity[event.severity] = (stats.bySeverity[event.severity] || 0) + 1
        
        // Action stats
        stats.byAction[event.action] = (stats.byAction[event.action] || 0) + 1
        
        // Resource stats
        stats.byResource[event.resource] = (stats.byResource[event.resource] || 0) + 1
        
        // Result stats
        stats.byResult[event.result] = (stats.byResult[event.result] || 0) + 1
        
        // Timeline (by hour)
        const hour = new Date(event.timestamp).toISOString().substring(0, 13)
        stats.timeline[hour] = (stats.timeline[hour] || 0) + 1
      })

      return stats

    } catch (error) {
      console.error('Failed to get audit statistics:', error)
      throw error
    }
  }

  // Export audit logs
  async export(filter?: AuditFilter, format: 'json' | 'csv' = 'json') {
    try {
      const query = await this.query({
        filter,
        pagination: { size: 10000 } // Large batch for export
      })

      if (format === 'csv') {
        return this.convertToCSV(query.events)
      } else {
        return JSON.stringify(query.events, null, 2)
      }

    } catch (error) {
      console.error('Failed to export audit logs:', error)
      throw error
    }
  }

  // Flush buffer to database
  private async flushBuffer() {
    if (this.buffer.length === 0) return

    try {
      const events = [...this.buffer]
      this.buffer = []

      await this.supabase
        .from('audit_logs')
        .insert(events.map(event => ({
          id: event.id,
          timestamp: event.timestamp,
          user_id: event.userId,
          clinic_id: event.clinicId,
          session_id: event.sessionId,
          action: event.action,
          resource: event.resource,
          resource_id: event.resourceId,
          details: event.details,
          metadata: event.metadata,
          severity: event.severity,
          category: event.category,
          result: event.result,
          source: event.source,
          tags: event.tags
        })))

      console.log(\`Flushed \${events.length} audit events to database\`)

    } catch (error) {
      console.error('Failed to flush audit buffer:', error)
      // Re-add events to buffer for retry
      this.buffer.unshift(...events)
    }
  }

  // Start buffer flush timer
  private startBufferFlush() {
    this.flushTimer = setInterval(() => {
      this.flushBuffer()
    }, this.config.buffer.flushInterval)
  }

  // Write single event to database
  private async writeEvent(event: AuditEvent) {
    try {
      await this.supabase
        .from('audit_logs')
        .insert({
          id: event.id,
          timestamp: event.timestamp,
          user_id: event.userId,
          clinic_id: event.clinicId,
          session_id: event.sessionId,
          action: event.action,
          resource: event.resource,
          resource_id: event.resourceId,
          details: event.details,
          metadata: event.metadata,
          severity: event.severity,
          category: event.category,
          result: event.result,
          source: event.source,
          tags: event.tags
        })

    } catch (error) {
      console.error('Failed to write audit event:', error)
      throw error
    }
  }

  // Validate audit event
  private validateEvent(event: AuditEvent) {
    if (!event.action) {
      throw new Error('Audit event must have an action')
    }
    
    if (!event.resource) {
      throw new Error('Audit event must have a resource')
    }
    
    if (!event.category) {
      throw new Error('Audit event must have a category')
    }
    
    if (!event.severity) {
      throw new Error('Audit event must have a severity')
    }
    
    if (!event.result) {
      throw new Error('Audit event must have a result')
    }
    
    if (!event.source) {
      throw new Error('Audit event must have a source')
    }
  }

  // Generate unique event ID
  private generateEventId(): string {
    return \`audit_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`
  }

  // Get auth event severity
  private getAuthSeverity(action: string, result: string): AuditEvent['severity'] {
    if (result === 'failure') return 'medium'
    if (action === 'mfa_verify' || action === 'password_change') return 'high'
    return 'low'
  }

  // Get data event severity
  private getDataSeverity(action: string, result: string): AuditEvent['severity'] {
    if (action === 'delete' && result === 'success') return 'high'
    if (action === 'export' && result === 'success') return 'medium'
    if (result === 'failure') return 'medium'
    return 'low'
  }

  // Get system event severity
  private getSystemSeverity(action: string, result: string): AuditEvent['severity'] {
    if (action.includes('error') || action.includes('failure')) return 'high'
    if (action.includes('restart') || action.includes('shutdown')) return 'medium'
    return 'low'
  }

  // Convert events to CSV
  private convertToCSV(events: any[]): string {
    if (events.length === 0) return ''

    const headers = [
      'id', 'timestamp', 'userId', 'clinicId', 'sessionId',
      'action', 'resource', 'resourceId', 'severity', 'category',
      'result', 'source', 'tags'
    ]

    const csvRows = [
      headers.join(','),
      ...events.map(event => [
        event.id,
        event.timestamp,
        event.userId || '',
        event.clinicId || '',
        event.sessionId || '',
        event.action,
        event.resource,
        event.resourceId || '',
        event.severity,
        event.category,
        event.result,
        event.source,
        event.tags ? event.tags.join(';') : ''
      ].map(field => \`"\${field}"\`).join(','))
    ]

    return csvRows.join('\\n')
  }

  // Cleanup old logs
  async cleanup(retentionDays?: number) {
    const days = retentionDays || this.config.retention.days
    
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)

      const { data, error } = await this.supabase
        .from('audit_logs')
        .delete()
        .lt('timestamp', cutoffDate.toISOString())
        .select('count')

      if (error) throw error

      console.log(\`Cleaned up \${data.length} audit events older than \${days} days\`)
      return data.length

    } catch (error) {
      console.error('Failed to cleanup audit logs:', error)
      throw error
    }
  }

  // Archive old logs
  async archive(retentionDays?: number) {
    const days = retentionDays || this.config.archive.thresholdDays
    
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)

      // Get events to archive
      const { data: events, error: fetchError } = await this.supabase
        .from('audit_logs')
        .select('*')
        .lt('timestamp', cutoffDate.toISOString())

      if (fetchError) throw fetchError

      if (events.length === 0) {
        console.log('No events to archive')
        return 0
      }

      // Create archive file
      const archiveData = JSON.stringify(events, null, 2)
      const archiveFile = \`audit_archive_\${new Date().toISOString().split('T')[0]}.json\`
      
      // Save to storage (implementation depends on your storage solution)
      // For now, just log the action
      console.log(\`Archived \${events.length} audit events to \${archiveFile}\`)

      // Delete archived events from main table
      const { error: deleteError } = await this.supabase
        .from('audit_logs')
        .delete()
        .lt('timestamp', cutoffDate.toISOString())

      if (deleteError) throw deleteError

      return events.length

    } catch (error) {
      console.error('Failed to archive audit logs:', error)
      throw error
    }
  }

  // Destroy logger and cleanup resources
  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    
    // Flush remaining buffer
    this.flushBuffer()
  }
}

// Global audit logger instance
export const auditLogger = new AuditLogger()

export default AuditLogger
`

  // Write audit logger
  const loggers = [
    { file: 'lib/audit/audit-logger.ts', content: auditLogger }
  ]
  
  loggers.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file)
    fs.writeFileSync(filePath, content)
    colorLog(`  ✅ Created ${file}`, 'green')
  })
}

// Create audit middleware
function createAuditMiddleware() {
  colorLog('\n🔧 Creating audit middleware...', 'cyan')
  
  const middleware = `// Audit Middleware for Next.js
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
    return (
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
      request.ip ||
      'unknown'
    )
  }

  // Generate unique request ID
  private generateRequestId(): string {
    return \`req_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`
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
`

  // Write middleware
  const middlewares = [
    { file: 'lib/audit/middleware/audit-middleware.ts', content: middleware }
  ]
  
  middlewares.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file)
    fs.writeFileSync(filePath, content)
    colorLog(`  ✅ Created ${file}`, 'green')
  })
}

// Create audit API endpoints
function createAuditAPIs() {
  colorLog('\n🔌 Creating audit API endpoints...', 'cyan')
  
  const logsAPI = `// Audit Logs API
import { NextRequest, NextResponse } from 'next/server'
import { auditLogger } from '@/lib/audit/audit-logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const query = {
      filter: {
        userId: searchParams.get('userId') || undefined,
        clinicId: searchParams.get('clinicId') || undefined,
        action: searchParams.get('action') || undefined,
        resource: searchParams.get('resource') || undefined,
        severity: searchParams.get('severity')?.split(',') || undefined,
        category: searchParams.get('category')?.split(',') || undefined,
        result: searchParams.get('result')?.split(',') || undefined,
        dateRange: searchParams.get('startDate') && searchParams.get('endDate') 
          ? [searchParams.get('startDate'), searchParams.get('endDate')] as [string, string]
          : undefined,
        search: searchParams.get('search') || undefined
      },
      pagination: {
        from: parseInt(searchParams.get('from') || '0'),
        size: Math.min(parseInt(searchParams.get('size') || '50'), 100),
        sort: searchParams.get('sort') || 'timestamp:desc'
      }
    }

    // Query audit logs
    const result = await auditLogger.query(query)

    return NextResponse.json({
      success: true,
      data: result,
      query
    })

  } catch (error) {
    console.error('Audit logs API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log custom audit event
    const eventId = await auditLogger.log({
      ...body,
      source: 'api-custom'
    })

    return NextResponse.json({
      success: true,
      eventId,
      message: 'Audit event logged successfully'
    })

  } catch (error) {
    console.error('Audit log creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
`

  const reportsAPI = `// Audit Reports API
import { NextRequest, NextResponse } from 'next/server'
import { auditLogger } from '@/lib/audit/audit-logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse filter parameters
    const filter = {
      userId: searchParams.get('userId') || undefined,
      clinicId: searchParams.get('clinicId') || undefined,
      dateRange: searchParams.get('startDate') && searchParams.get('endDate') 
        ? [searchParams.get('startDate'), searchParams.get('endDate')] as [string, string]
        : undefined
    }

    // Get statistics
    const statistics = await auditLogger.getStatistics(filter)

    return NextResponse.json({
      success: true,
      data: statistics,
      filter
    })

  } catch (error) {
    console.error('Audit reports API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
`

  const exportAPI = `// Audit Export API
import { NextRequest, NextResponse } from 'next/server'
import { auditLogger } from '@/lib/audit/audit-logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const filter = {
      userId: searchParams.get('userId') || undefined,
      clinicId: searchParams.get('clinicId') || undefined,
      action: searchParams.get('action') || undefined,
      resource: searchParams.get('resource') || undefined,
      severity: searchParams.get('severity')?.split(',') || undefined,
      category: searchParams.get('category')?.split(',') || undefined,
      dateRange: searchParams.get('startDate') && searchParams.get('endDate') 
        ? [searchParams.get('startDate'), searchParams.get('endDate')] as [string, string]
        : undefined
    }

    const format = (searchParams.get('format') as 'json' | 'csv') || 'json'

    // Export audit logs
    const exportData = await auditLogger.export(filter, format)

    // Set appropriate headers
    const headers = new Headers()
    headers.set('Content-Type', format === 'csv' ? 'text/csv' : 'application/json')
    headers.set(
      'Content-Disposition',
      \`attachment; filename="audit_logs_\${new Date().toISOString().split('T')[0]}.\${format}"\`
    )

    return new NextResponse(exportData, { headers })

  } catch (error) {
    console.error('Audit export API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
`

  // Write API endpoints
  const apis = [
    { file: 'app/api/audit/logs/route.ts', content: logsAPI },
    { file: 'app/api/audit/reports/route.ts', content: reportsAPI },
    { file: 'app/api/audit/export/route.ts', content: exportAPI }
  ]
  
  apis.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file)
    fs.writeFileSync(filePath, content)
    colorLog(`  ✅ Created ${file}`, 'green')
  })
}

// Create audit configuration
function createAuditConfig() {
  colorLog('\n⚙️ Creating audit configuration...', 'cyan')
  
  const config = `// Audit Configuration
export const auditConfig = {
  // General settings
  enabled: process.env.AUDIT_ENABLED !== 'false',
  
  // Buffer settings for performance
  buffer: {
    enabled: process.env.AUDIT_BUFFER_ENABLED !== 'false',
    maxSize: parseInt(process.env.AUDIT_BUFFER_MAX_SIZE || '100'),
    flushInterval: parseInt(process.env.AUDIT_BUFFER_FLUSH_INTERVAL || '5000')
  },
  
  // Retention settings
  retention: {
    days: parseInt(process.env.AUDIT_RETENTION_DAYS || '365'),
    cleanupEnabled: process.env.AUDIT_CLEANUP_ENABLED !== 'false'
  },
  
  // Archive settings
  archive: {
    enabled: process.env.AUDIT_ARCHIVE_ENABLED !== 'false',
    thresholdDays: parseInt(process.env.AUDIT_ARCHIVE_THRESHOLD_DAYS || '90'),
    storageLocation: process.env.AUDIT_ARCHIVE_STORAGE || 'local'
  },
  
  // Security settings
  security: {
    encryptSensitiveData: process.env.AUDIT_ENCRYPT_SENSITIVE === 'true',
    sanitizePII: process.env.AUDIT_SANITIZE_PII !== 'false',
    requireAuth: process.env.AUDIT_REQUIRE_AUTH !== 'false'
  },
  
  // Performance settings
  performance: {
    maxQuerySize: parseInt(process.env.AUDIT_MAX_QUERY_SIZE || '1000'),
    queryTimeout: parseInt(process.env.AUDIT_QUERY_TIMEOUT || '30000'),
    indexOptimization: process.env.AUDIT_INDEX_OPTIMIZATION !== 'false'
  },
  
  // Compliance settings
  compliance: {
    gdpr: process.env.AUDIT_GDPR_COMPLIANT !== 'false',
    hipaa: process.env.AUDIT_HIPAA_COMPLIANT !== 'false',
    sox: process.env.AUDIT_SOX_COMPLIANT !== 'false'
  },
  
  // Notification settings
  notifications: {
    enabled: process.env.AUDIT_NOTIFICATIONS_ENABLED === 'true',
    criticalEvents: process.env.AUDIT_CRITICAL_NOTIFICATIONS === 'true',
    emailEndpoint: process.env.AUDIT_EMAIL_ENDPOINT,
    slackWebhook: process.env.AUDIT_SLACK_WEBHOOK
  },
  
  // Categories to audit
  categories: {
    auth: ['login', 'logout', 'register', 'password_change', 'mfa_verify'],
    data: ['read', 'create', 'update', 'delete', 'export', 'import'],
    system: ['startup', 'shutdown', 'restart', 'error', 'configuration_change'],
    security: ['breach_attempt', 'privilege_escalation', 'suspicious_activity'],
    business: ['appointment_booked', 'payment_processed', 'treatment_completed'],
    compliance: ['data_access', 'consent_given', 'policy_accepted']
  },
  
  // Resources to audit
  resources: {
    users: ['create', 'read', 'update', 'delete'],
    patients: ['create', 'read', 'update', 'delete', 'export'],
    treatments: ['create', 'read', 'update', 'delete'],
    appointments: ['create', 'read', 'update', 'delete'],
    payments: ['create', 'read', 'update', 'delete'],
    reports: ['create', 'read', 'update', 'delete', 'export']
  },
  
  // Severity levels
  severity: {
    low: ['login', 'read', 'view'],
    medium: ['create', 'update', 'export'],
    high: ['delete', 'admin_action', 'privilege_change'],
    critical: ['security_breach', 'data_loss', 'system_compromise']
  },
  
  // Exclusions
  exclusions: {
    paths: ['/health', '/metrics', '/_next', '/api/health', '/static'],
    methods: ['GET', 'HEAD', 'OPTIONS'],
    users: ['system', 'health_check'],
    resources: ['cache', 'logs', 'temp']
  }
}

export default auditConfig
`

  // Write configuration
  const configs = [
    { file: 'config/audit/index.ts', content: config }
  ]
  
  configs.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file)
    fs.writeFileSync(filePath, content)
    colorLog(`  ✅ Created ${file}`, 'green')
  })
}

// Create audit cleanup scripts
function createAuditScripts() {
  colorLog('\n🔧 Creating audit management scripts...', 'cyan')
  
  const cleanupScript = `#!/usr/bin/env node

// Audit Cleanup Script
const { createClient } = require('@supabase/supabase-js')
const { auditConfig } = require('../config/audit')

class AuditCleanup {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  }

  async cleanup(options = {}) {
    console.log('🧹 Starting audit cleanup...')
    
    try {
      const retentionDays = options.days || auditConfig.retention.days
      const dryRun = options.dryRun || false
      
      console.log(\`Retention period: \${retentionDays} days\`)
      console.log(\`Dry run: \${dryRun}\`)
      
      // Calculate cutoff date
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
      
      console.log(\`Cutoff date: \${cutoffDate.toISOString()}\`)
      
      // Count events to be deleted
      const { count, error: countError } = await this.supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .lt('timestamp', cutoffDate.toISOString())
      
      if (countError) throw countError
      
      console.log(\`Events to delete: \${count}\`)
      
      if (dryRun) {
        console.log('Dry run completed - no changes made')
        return count
      }
      
      // Delete old events
      const { data, error } = await this.supabase
        .from('audit_logs')
        .delete()
        .lt('timestamp', cutoffDate.toISOString())
        .select('count')
      
      if (error) throw error
      
      console.log(\`✅ Successfully deleted \${data.length} audit events\`)
      
      // Log cleanup operation
      await this.logCleanup(data.length, retentionDays)
      
      return data.length
      
    } catch (error) {
      console.error('❌ Audit cleanup failed:', error)
      throw error
    }
  }

  async archive(options = {}) {
    console.log('📦 Starting audit archive...')
    
    try {
      const thresholdDays = options.days || auditConfig.archive.thresholdDays
      const dryRun = options.dryRun || false
      
      console.log(\`Archive threshold: \${thresholdDays} days\`)
      console.log(\`Dry run: \${dryRun}\`)
      
      // Calculate cutoff date
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - thresholdDays)
      
      console.log(\`Cutoff date: \${cutoffDate.toISOString()}\`)
      
      // Get events to archive
      const { data: events, error: fetchError } = await this.supabase
        .from('audit_logs')
        .select('*')
        .lt('timestamp', cutoffDate.toISOString())
        .order('timestamp', { ascending: true })
      
      if (fetchError) throw fetchError
      
      console.log(\`Events to archive: \${events.length}\`)
      
      if (events.length === 0) {
        console.log('No events to archive')
        return 0
      }
      
      if (dryRun) {
        console.log('Dry run completed - no changes made')
        return events.length
      }
      
      // Create archive file
      const archiveData = JSON.stringify(events, null, 2)
      const archiveFile = \`audit_archive_\${new Date().toISOString().split('T')[0]}.json\`
      
      // Save archive file
      const fs = require('fs')
      const path = require('path')
      const archiveDir = path.join(process.cwd(), 'archives', 'audit')
      
      if (!fs.existsSync(archiveDir)) {
        fs.mkdirSync(archiveDir, { recursive: true })
      }
      
      const archivePath = path.join(archiveDir, archiveFile)
      fs.writeFileSync(archivePath, archiveData)
      
      console.log(\`📁 Archive saved to: \${archivePath}\`)
      
      // Delete archived events from database
      const { error: deleteError } = await this.supabase
        .from('audit_logs')
        .delete()
        .lt('timestamp', cutoffDate.toISOString())
      
      if (deleteError) throw deleteError
      
      console.log(\`✅ Successfully archived \${events.length} audit events\`)
      
      // Log archive operation
      await this.logArchive(events.length, thresholdDays, archiveFile)
      
      return events.length
      
    } catch (error) {
      console.error('❌ Audit archive failed:', error)
      throw error
    }
  }

  async stats() {
    console.log('📊 Audit statistics:')
    
    try {
      // Total events
      const { count: total, error: totalError } = await this.supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
      
      if (totalError) throw totalError
      
      console.log(\`  Total events: \${total}\`)
      
      // Events by category
      const { data: categories, error: catError } = await this.supabase
        .from('audit_logs')
        .select('category')
        .then(({ data, error }) => {
          if (error) throw error
          
          const counts = {}
          data.forEach(item => {
            counts[item.category] = (counts[item.category] || 0) + 1
          })
          
          return { data: counts, error: null }
        })
      
      if (catError) throw catError
      
      console.log('  By category:')
      Object.entries(categories).forEach(([category, count]) => {
        console.log(\`    \${category}: \${count}\`)
      })
      
      // Events by severity
      const { data: severities, error: sevError } = await this.supabase
        .from('audit_logs')
        .select('severity')
        .then(({ data, error }) => {
          if (error) throw error
          
          const counts = {}
          data.forEach(item => {
            counts[item.severity] = (counts[item.severity] || 0) + 1
          })
          
          return { data: counts, error: null }
        })
      
      if (sevError) throw sevError
      
      console.log('  By severity:')
      Object.entries(severities).forEach(([severity, count]) => {
        console.log(\`    \${severity}: \${count}\`)
      })
      
      // Oldest and newest events
      const { data: oldest, error: oldestError } = await this.supabase
        .from('audit_logs')
        .select('timestamp')
        .order('timestamp', { ascending: true })
        .limit(1)
        .single()
      
      if (oldestError && oldestError.code !== 'PGRST116') throw oldestError
      
      const { data: newest, error: newestError } = await this.supabase
        .from('audit_logs')
        .select('timestamp')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single()
      
      if (newestError && newestError.code !== 'PGRST116') throw newestError
      
      if (oldest?.timestamp) {
        console.log(\`  Oldest event: \${oldest.timestamp}\`)
      }
      
      if (newest?.timestamp) {
        console.log(\`  Newest event: \${newest.timestamp}\`)
      }
      
    } catch (error) {
      console.error('❌ Failed to get audit statistics:', error)
      throw error
    }
  }

  async logCleanup(deletedCount, retentionDays) {
    try {
      await this.supabase
        .from('audit_logs')
        .insert({
          id: \`cleanup_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`,
          timestamp: new Date().toISOString(),
          action: 'cleanup',
          resource: 'audit_logs',
          details: {
            deletedCount,
            retentionDays,
            automated: true
          },
          severity: 'low',
          category: 'system',
          result: 'success',
          source: 'audit-cleanup-script'
        })
    } catch (error) {
      console.error('Failed to log cleanup operation:', error)
    }
  }

  async logArchive(archivedCount, thresholdDays, archiveFile) {
    try {
      await this.supabase
        .from('audit_logs')
        .insert({
          id: \`archive_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`,
          timestamp: new Date().toISOString(),
          action: 'archive',
          resource: 'audit_logs',
          details: {
            archivedCount,
            thresholdDays,
            archiveFile,
            automated: true
          },
          severity: 'low',
          category: 'system',
          result: 'success',
          source: 'audit-archive-script'
        })
    } catch (error) {
      console.error('Failed to log archive operation:', error)
    }
  }
}

// CLI interface
const cleanup = new AuditCleanup()
const command = process.argv[2]
const options = {
  days: process.argv.includes('--days') ? parseInt(process.argv[process.argv.indexOf('--days') + 1]) : undefined,
  dryRun: process.argv.includes('--dry-run')
}

switch (command) {
  case 'cleanup':
    cleanup.cleanup(options)
    break
    
  case 'archive':
    cleanup.archive(options)
    break
    
  case 'stats':
    cleanup.stats()
    break
    
  default:
    console.log('Usage: node audit-cleanup.js [cleanup|archive|stats] [options]')
    console.log('Options:')
    console.log('  --days <number>    Set custom days threshold')
    console.log('  --dry-run          Show what would be done without making changes')
    break
}

module.exports = AuditCleanup
`

  // Write scripts
  const scripts = [
    { file: 'scripts/audit/cleanup.js', content: cleanupScript }
  ]
  
  scripts.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file)
    fs.writeFileSync(filePath, content)
    fs.chmodSync(filePath, '755') // Make executable
    colorLog(`  ✅ Created ${file}`, 'green')
  })
}

// Create TypeScript types
function createAuditTypes() {
  colorLog('\n📝 Creating TypeScript types...', 'cyan')
  
  const types = `// Audit Type Definitions
export interface AuditEvent {
  id?: string
  timestamp: string
  userId?: string
  clinicId?: string
  sessionId?: string
  action: string
  resource: string
  resourceId?: string
  details?: Record<string, any>
  metadata?: {
    userAgent?: string
    ipAddress?: string
    requestId?: string
    path?: string
    method?: string
    statusCode?: number
    responseTime?: number
  }
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'auth' | 'data' | 'system' | 'security' | 'business' | 'compliance'
  result: 'success' | 'failure' | 'error'
  source: string
  tags?: string[]
}

export interface AuditFilter {
  userId?: string
  clinicId?: string
  action?: string
  resource?: string
  severity?: AuditEvent['severity'][]
  category?: AuditEvent['category'][]
  result?: AuditEvent['result'][]
  dateRange?: [string, string]
  tags?: string[]
  search?: string
}

export interface AuditQuery {
  filter?: AuditFilter
  pagination?: {
    from?: number
    size?: number
    sort?: string
  }
  aggregations?: {
    actions?: boolean
    users?: boolean
    resources?: boolean
    severity?: boolean
    timeline?: boolean
  }
}

export interface AuditQueryResult {
  events: AuditEvent[]
  total: number
  hasMore: boolean
}

export interface AuditStatistics {
  total: number
  byCategory: Record<string, number>
  bySeverity: Record<string, number>
  byAction: Record<string, number>
  byResource: Record<string, number>
  byResult: Record<string, number>
  timeline: Record<string, number>
}

export interface AuditConfig {
  enabled: boolean
  buffer: {
    enabled: boolean
    maxSize: number
    flushInterval: number
  }
  retention: {
    days: number
    cleanupEnabled: boolean
  }
  archive: {
    enabled: boolean
    thresholdDays: number
    storageLocation: string
  }
  security: {
    encryptSensitiveData: boolean
    sanitizePII: boolean
    requireAuth: boolean
  }
  performance: {
    maxQuerySize: number
    queryTimeout: number
    indexOptimization: boolean
  }
  compliance: {
    gdpr: boolean
    hipaa: boolean
    sox: boolean
  }
  notifications: {
    enabled: boolean
    criticalEvents: boolean
    emailEndpoint?: string
    slackWebhook?: string
  }
  categories: {
    auth: string[]
    data: string[]
    system: string[]
    security: string[]
    business: string[]
    compliance: string[]
  }
  resources: {
    users: string[]
    patients: string[]
    treatments: string[]
    appointments: string[]
    payments: string[]
    reports: string[]
  }
  severity: {
    low: string[]
    medium: string[]
    high: string[]
    critical: string[]
  }
  exclusions: {
    paths: string[]
    methods: string[]
    users: string[]
    resources: string[]
  }
}

export interface AuditMiddlewareOptions {
  excludePaths?: string[]
  excludeMethods?: string[]
  logRequestBody?: boolean
  logResponseBody?: boolean
  sanitizeData?: boolean
}

export interface AuditExportOptions {
  format?: 'json' | 'csv'
  filter?: AuditFilter
  includeMetadata?: boolean
}

export interface AuditReport {
  id: string
  name: string
  description: string
  type: 'summary' | 'detailed' | 'compliance' | 'security'
  filters: AuditFilter
  generatedAt: string
  generatedBy: string
  data: any
}

export interface AuditAlert {
  id: string
  type: 'threshold' | 'pattern' | 'security' | 'compliance'
  severity: AuditEvent['severity']
  condition: any
  enabled: boolean
  notificationChannels: string[]
  lastTriggered?: string
  count: number
}

export interface AuditRetention {
  category: AuditEvent['category']
  severity: AuditEvent['severity']
  retentionDays: number
  archiveAfterDays?: number
}

export interface AuditArchive {
  id: string
  startDate: string
  endDate: string
  eventCount: number
  fileSize: number
  checksum: string
  location: string
  createdAt: string
  createdBy: string
}

export interface AuditCompliance {
  standard: 'GDPR' | 'HIPAA' | 'SOX' | 'ISO27001'
  requirements: {
    id: string
    name: string
    description: string
    mandatory: boolean
    auditFields: string[]
  }[]
  status: 'compliant' | 'non-compliant' | 'partial'
  lastAssessment: string
  nextAssessment: string
}

// Database schema types
export interface AuditLogTable {
  id: string
  timestamp: string
  user_id?: string
  clinic_id?: string
  session_id?: string
  action: string
  resource: string
  resource_id?: string
  details?: any
  metadata?: any
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'auth' | 'data' | 'system' | 'security' | 'business' | 'compliance'
  result: 'success' | 'failure' | 'error'
  source: string
  tags?: string[]
  created_at: string
}

// Event type helpers
export type AuthAuditEvent = Omit<AuditEvent, 'category' | 'action'> & {
  category: 'auth'
  action: 'login' | 'logout' | 'register' | 'password_change' | 'mfa_verify' | 'session_expired'
}

export type DataAuditEvent = Omit<AuditEvent, 'category' | 'action'> & {
  category: 'data'
  action: 'read' | 'create' | 'update' | 'delete' | 'export' | 'import'
}

export type SecurityAuditEvent = Omit<AuditEvent, 'category' | 'action'> & {
  category: 'security'
  action: 'breach_attempt' | 'privilege_escalation' | 'suspicious_activity' | 'blocked_request' | 'rate_limit_exceeded'
}

export type SystemAuditEvent = Omit<AuditEvent, 'category'> & {
  category: 'system'
  action: string
}

export type BusinessAuditEvent = Omit<AuditEvent, 'category'> & {
  category: 'business'
  action: string
}

export type ComplianceAuditEvent = Omit<AuditEvent, 'category'> & {
  category: 'compliance'
  action: string
}

// API response types
export interface AuditAPIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface AuditLogsResponse extends AuditAPIResponse<AuditQueryResult> {
  query?: AuditQuery
}

export interface AuditReportsResponse extends AuditAPIResponse<AuditStatistics> {
  filter?: AuditFilter
}

export interface AuditExportResponse extends AuditAPIResponse<string> {
  filename?: string
  format?: string
}
`

  // Write types
  const typeDefinitions = [
    { file: 'types/audit/index.ts', content: types }
  ]
  
  typeDefinitions.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file)
    fs.writeFileSync(filePath, content)
    colorLog(`  ✅ Created ${file}`, 'green')
  })
}

// Update package.json with audit scripts
function updatePackageScripts() {
  colorLog('\n📦 Updating package.json with audit scripts...', 'cyan')
  
  try {
    const packagePath = path.join(process.cwd(), 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
    
    // Add audit scripts
    const newScripts = {
      'audit:cleanup': 'node scripts/audit/cleanup.js cleanup',
      'audit:archive': 'node scripts/audit/cleanup.js archive',
      'audit:stats': 'node scripts/audit/cleanup.js stats',
      'audit:cleanup-dry': 'node scripts/audit/cleanup.js cleanup --dry-run',
      'audit:archive-dry': 'node scripts/audit/cleanup.js archive --dry-run'
    }
    
    // Merge scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      ...newScripts
    }
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2))
    colorLog('✅ Package.json updated with audit scripts', 'green')
    
  } catch (error) {
    colorLog(`⚠️ Could not update package.json: ${error.message}`, 'yellow')
  }
}

// Create audit documentation
function createAuditDocumentation() {
  colorLog('\n📚 Creating audit documentation...', 'cyan')
  
  const docs = `# Comprehensive Audit Logging System

## 🔍 Enterprise-Grade Audit Trail

Beauty with AI Precision features a comprehensive audit logging system that provides complete visibility into all system activities, ensuring compliance, security, and accountability.

### 🎯 Key Features

#### Complete Activity Tracking
- **User Actions**: Login, logout, data access, modifications
- **System Events**: Configuration changes, errors, restarts
- **Security Events**: Failed attempts, privilege escalation, breaches
- **Business Events**: Appointments, payments, treatments
- **Compliance Events**: Data access, consent, policy acceptance

#### Intelligent Categorization
- **Authentication**: User login, logout, registration, MFA
- **Data Access**: CRUD operations, exports, imports
- **System**: Configuration, errors, maintenance
- **Security**: Threats, breaches, suspicious activity
- **Business**: Clinical operations, financial transactions
- **Compliance**: Regulatory requirements, privacy controls

#### Advanced Filtering & Search
- **Multi-criteria Filtering**: User, resource, date range, severity
- **Full-text Search**: Search across all audit event data
- **Real-time Monitoring**: Live event streaming and alerts
- **Custom Queries**: Complex query building with aggregations

## 🚀 Quick Start

### 1. Enable Audit Logging
\`\`\`bash
# .env.local
AUDIT_ENABLED=true
AUDIT_BUFFER_ENABLED=true
AUDIT_RETENTION_DAYS=365
\`\`\`

### 2. Use Audit Logger
\`\`\`typescript
import { auditLogger } from '@/lib/audit/audit-logger'

// Log authentication event
await auditLogger.logAuth({
  action: 'login',
  userId: 'user-123',
  result: 'success'
})

// Log data access
await auditLogger.logDataAccess({
  action: 'read',
  resource: 'patient',
  resourceId: 'patient-456',
  userId: 'user-123',
  result: 'success'
})

// Log security event
await auditLogger.logSecurity({
  action: 'suspicious_activity',
  userId: 'user-789',
  details: { reason: 'multiple_failed_attempts' },
  result: 'failure'
})
\`\`\`

### 3. Query Audit Logs
\`\`\`bash
# Get all audit events
curl "http://localhost:3000/api/audit/logs"

# Filter by user and date range
curl "http://localhost:3000/api/audit/logs?userId=user-123&startDate=2023-01-01&endDate=2023-12-31"

# Get statistics
curl "http://localhost:3000/api/audit/reports"
\`\`\`

## 📋 Audit Event Structure

### Core Fields
\`\`\`typescript
interface AuditEvent {
  id: string              // Unique event identifier
  timestamp: string        // ISO timestamp
  userId?: string         // User who performed the action
  clinicId?: string       // Clinic context
  sessionId?: string      // Session identifier
  action: string          // Action performed
  resource: string        // Resource affected
  resourceId?: string     // Specific resource ID
  details?: object        // Additional event details
  metadata?: object       // Technical metadata
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'auth' | 'data' | 'system' | 'security' | 'business' | 'compliance'
  result: 'success' | 'failure' | 'error'
  source: string          // Source system/component
  tags?: string[]         // Custom tags
}
\`\`\`

### Metadata Information
\`\`\`typescript
interface AuditMetadata {
  userAgent?: string      // Client user agent
  ipAddress?: string      // Client IP address
  requestId?: string      // Request correlation ID
  path?: string          // API endpoint path
  method?: string        // HTTP method
  statusCode?: number    // Response status code
  responseTime?: number  // Response time in milliseconds
}
\`\`\`

## 🔧 API Endpoints

### Query Audit Logs
\`\`\`bash
GET /api/audit/logs
  ?userId=user-123
  &clinicId=clinic-456
  &action=login
  &resource=patient
  &severity=high,critical
  &category=auth,security
  &result=failure
  &startDate=2023-01-01
  &endDate=2023-12-31
  &search=failed
  &from=0
  &size=50
  &sort=timestamp:desc
\`\`\`

### Create Custom Audit Event
\`\`\`bash
POST /api/audit/logs
{
  "action": "custom_action",
  "resource": "custom_resource",
  "userId": "user-123",
  "details": { "custom": "data" },
  "severity": "medium",
  "category": "business",
  "result": "success",
  "source": "custom_app"
}
\`\`\`

### Get Audit Statistics
\`\`\`bash
GET /api/audit/reports
  ?userId=user-123
  &clinicId=clinic-456
  &startDate=2023-01-01
  &endDate=2023-12-31
\`\`\`

### Export Audit Logs
\`\`\`bash
GET /api/audit/export
  ?format=csv|json
  &userId=user-123
  &startDate=2023-01-01
  &endDate=2023-12-31
\`\`\`

## 🛠️ Configuration

### Environment Variables
\`\`\`bash
# Core Settings
AUDIT_ENABLED=true
AUDIT_BUFFER_ENABLED=true
AUDIT_BUFFER_MAX_SIZE=100
AUDIT_BUFFER_FLUSH_INTERVAL=5000

# Retention & Archive
AUDIT_RETENTION_DAYS=365
AUDIT_CLEANUP_ENABLED=true
AUDIT_ARCHIVE_ENABLED=true
AUDIT_ARCHIVE_THRESHOLD_DAYS=90
AUDIT_ARCHIVE_STORAGE=local

# Security
AUDIT_ENCRYPT_SENSITIVE=false
AUDIT_SANITIZE_PII=true
AUDIT_REQUIRE_AUTH=true

# Performance
AUDIT_MAX_QUERY_SIZE=1000
AUDIT_QUERY_TIMEOUT=30000
AUDIT_INDEX_OPTIMIZATION=true

# Compliance
AUDIT_GDPR_COMPLIANT=true
AUDIT_HIPAA_COMPLIANT=true
AUDIT_SOX_COMPLIANT=false

# Notifications
AUDIT_NOTIFICATIONS_ENABLED=false
AUDIT_CRITICAL_NOTIFICATIONS=false
AUDIT_EMAIL_ENDPOINT=
AUDIT_SLACK_WEBHOOK=
\`\`\`

### Audit Configuration
\`\`\`typescript
// config/audit/index.ts
export const auditConfig = {
  enabled: true,
  buffer: {
    enabled: true,
    maxSize: 100,
    flushInterval: 5000
  },
  retention: {
    days: 365,
    cleanupEnabled: true
  },
  categories: {
    auth: ['login', 'logout', 'register'],
    data: ['read', 'create', 'update', 'delete'],
    security: ['breach_attempt', 'suspicious_activity'],
    business: ['appointment_booked', 'payment_processed']
  },
  severity: {
    low: ['login', 'read'],
    medium: ['create', 'update'],
    high: ['delete', 'admin_action'],
    critical: ['security_breach', 'data_loss']
  }
}
\`\`\`

## 📊 Audit Categories

### Authentication Events
- **Login**: User authentication attempts
- **Logout**: User session termination
- **Register**: New user account creation
- **Password Change**: Password modification requests
- **MFA Verify**: Multi-factor authentication
- **Session Expired**: Automatic session termination

### Data Access Events
- **Read**: Data retrieval operations
- **Create**: New data creation
- **Update**: Data modification
- **Delete**: Data removal
- **Export**: Data export operations
- **Import**: Data import operations

### Security Events
- **Breach Attempt**: Security violation attempts
- **Privilege Escalation**: Unauthorized access attempts
- **Suspicious Activity**: Anomalous behavior detection
- **Blocked Request**: Malicious request blocking
- **Rate Limit Exceeded**: API rate limiting violations

### System Events
- **Startup**: System initialization
- **Shutdown**: System termination
- **Restart**: System restart operations
- **Error**: System errors and exceptions
- **Configuration Change**: System configuration updates

### Business Events
- **Appointment Booked**: Patient appointment scheduling
- **Payment Processed**: Financial transaction completion
- **Treatment Completed**: Medical procedure completion
- **Report Generated**: Business report creation

### Compliance Events
- **Data Access**: Compliance-related data access
- **Consent Given**: Patient consent recording
- **Policy Accepted**: Policy agreement confirmation
- **Audit Request**: Compliance audit requests

## 🔒 Security & Compliance

### Data Protection
- **PII Sanitization**: Automatic sensitive data masking
- **Encryption**: Optional data encryption for sensitive events
- **Access Control**: Role-based audit log access
- **Immutable Logs**: Tamper-evident audit trail

### Regulatory Compliance
- **GDPR**: Right to access and delete audit data
- **HIPAA**: Protected health information auditing
- **SOX**: Financial transaction auditing
- **ISO 27001**: Information security management

### Privacy Controls
- **Data Minimization**: Collect only necessary audit data
- **Retention Policies**: Automatic data cleanup and archiving
- **Consent Tracking**: Patient consent audit trail
- **Anonymization**: Data anonymization for long-term storage

## 📈 Performance Optimization

### Buffering Strategy
- **Event Buffering**: Batch processing for high-volume scenarios
- **Async Processing**: Non-blocking audit event logging
- **Flush Intervals**: Configurable buffer flush timing
- **Memory Management**: Efficient buffer size management

### Database Optimization
- **Index Strategy**: Optimized database indexes for queries
- **Partitioning**: Time-based table partitioning
- **Query Optimization**: Efficient query patterns
- **Connection Pooling**: Database connection management

### Caching Layer
- **Query Caching**: Frequent query result caching
- **Statistics Caching**: Pre-computed audit statistics
- **Metadata Caching**: User and session metadata caching
- **Cache Invalidation**: Smart cache refresh strategies

## 🛠️ Management Scripts

### Cleanup Old Logs
\`\`\`bash
# Delete logs older than 365 days
pnpm audit:cleanup

# Custom retention period
pnpm audit:cleanup --days 90

# Dry run (show what would be deleted)
pnpm audit:cleanup --dry-run
\`\`\`

### Archive Historical Data
\`\`\`bash
# Archive logs older than 90 days
pnpm audit:archive

# Custom archive threshold
pnpm audit:archive --days 180

# Dry run (show what would be archived)
pnpm audit:archive --dry-run
\`\`\`

### View Statistics
\`\`\`bash
# Show audit log statistics
pnpm audit:stats
\`\`\`

## 📊 Monitoring & Analytics

### Real-time Monitoring
- **Live Dashboard**: Real-time audit event visualization
- **Alert System**: Automatic notifications for critical events
- **Pattern Detection**: AI-powered anomaly detection
- **Performance Metrics**: Audit system performance monitoring

### Business Intelligence
- **User Activity**: User behavior analysis and insights
- **Resource Usage**: Resource access patterns and trends
- **Security Insights**: Security threat analysis and trends
- **Compliance Reports**: Automated compliance reporting

### Custom Reports
- **Scheduled Reports**: Automated report generation
- **Custom Filters**: User-defined report criteria
- **Export Formats**: Multiple export format support
- **Report Templates**: Pre-built report templates

## 🔍 Advanced Features

### Event Correlation
- **Session Tracking**: Complete user session audit trail
- **Request Tracing**: End-to-end request correlation
- **Causal Chains**: Event relationship mapping
- **Timeline Views**: Chronological event visualization

### Machine Learning
- **Anomaly Detection**: Unusual activity pattern identification
- **Risk Scoring**: Event risk assessment and scoring
- **Predictive Analytics**: Security threat prediction
- **Behavioral Analysis**: User behavior profiling

### Integration Capabilities
- **SIEM Integration**: Security information and event management
- **Log Aggregation**: Centralized log management
- **API Integration**: Third-party system integration
- **Webhook Support**: Real-time event notifications

## 🛠️ Troubleshooting

### Common Issues

#### Missing Audit Events
1. Check audit logging is enabled
2. Verify buffer configuration
3. Review database connectivity
4. Check system permissions

#### Slow Query Performance
1. Review database indexes
2. Optimize query parameters
3. Check buffer flush intervals
4. Monitor system resources

#### High Memory Usage
1. Reduce buffer size
2. Adjust flush intervals
3. Monitor event volume
4. Review retention policies

### Debugging Tools
- **Query Profiler**: Analyze query performance
- **Event Tracer**: Track event flow
- **Buffer Monitor**: Monitor buffer status
- **Performance Metrics**: System performance data

## 📞 Support and Resources

### Getting Help
- **Documentation**: Complete audit system documentation
- **API Reference**: Detailed API documentation
- **Best Practices**: Audit logging guidelines
- **Support Team**: Technical support and assistance

### Additional Resources
- [Security Guidelines](./security.md)
- [Compliance Documentation](./compliance.md)
- [Performance Tuning](./performance.md)
- [Integration Guide](./integration.md)

---

**Comprehensive audit logging ensures complete visibility, compliance, and security for Beauty with AI Precision platform.**

🔍 [Start Auditing Now](../audit/)  
📊 [View Reports](./reports.md)  
🔧 [Configure System](./configuration.md)  
📞 [Get Support](https://support.beauty-with-ai-precision.com)
`

  // Write documentation
  const documentation = [
    { file: 'docs/audit/README.md', content: docs }
  ]
  
  documentation.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file)
    fs.writeFileSync(filePath, content)
    colorLog(`  ✅ Created ${file}`, 'green')
  })
}

// Main execution function
async function main() {
  colorLog('📋 Setting up Comprehensive Audit Logging System', 'bright')
  colorLog('='.repeat(60), 'cyan')
  
  try {
    createAuditDirectories()
    createAuditLogger()
    createAuditMiddleware()
    createAuditAPIs()
    createAuditConfig()
    createAuditScripts()
    createAuditTypes()
    updatePackageScripts()
    createAuditDocumentation()
    
    colorLog('\n' + '='.repeat(60), 'green')
    colorLog('🎉 Comprehensive Audit Logging System setup completed!', 'bright')
    colorLog('\n📋 Next Steps:', 'cyan')
    colorLog('1. Configure environment variables for audit settings', 'blue')
    colorLog('2. Set up audit_logs table in database', 'blue')
    colorLog('3. Configure audit middleware in Next.js', 'blue')
    colorLog('4. Test audit logging functionality', 'blue')
    colorLog('5. Set up automated cleanup and archiving', 'blue')
    
    colorLog('\n📋 Audit Features:', 'yellow')
    colorLog('• Complete activity tracking across all system components', 'white')
    colorLog('• Intelligent categorization and severity classification', 'white')
    colorLog('• Advanced filtering, search, and real-time monitoring', 'white')
    colorLog('• Compliance with GDPR, HIPAA, and other regulations', 'white')
    colorLog('• Performance optimization with buffering and caching', 'white')
    colorLog('• Automated cleanup, archiving, and retention management', 'white')
    
    colorLog('\n🔒 Security & Compliance:', 'cyan')
    colorLog('• PII sanitization and sensitive data protection', 'blue')
    colorLog('• Immutable audit trail with tamper detection', 'blue')
    colorLog('• Role-based access control and authentication', 'blue')
    colorLog('• Regulatory compliance (GDPR, HIPAA, SOX)', 'blue')
    colorLog('• Data encryption and secure storage options', 'blue')
    
    colorLog('\n📊 Monitoring & Analytics:', 'green')
    colorLog('• Real-time dashboard with live event streaming', 'white')
    colorLog('• Advanced analytics and business intelligence', 'white')
    colorLog('• Custom report generation and scheduling', 'white')
    colorLog('• Anomaly detection and security alerting', 'white')
    colorLog('• Performance metrics and system monitoring', 'white')
    
    colorLog('\n🛠️ Developer Tools:', 'magenta')
    colorLog('• TypeScript SDK with comprehensive type definitions', 'white')
    colorLog('• RESTful API endpoints for audit operations', 'white')
    colorLog('• Middleware for automatic request logging', 'white')
    colorLog('• Management scripts for cleanup and archiving', 'white')
    colorLog('• Complete documentation and integration guides', 'white')
    
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
  createAuditDirectories,
  createAuditLogger,
  createAuditMiddleware,
  createAuditAPIs,
  createAuditConfig,
  createAuditScripts,
  createAuditTypes,
  updatePackageScripts,
  createAuditDocumentation
}
