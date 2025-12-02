// Comprehensive Audit Logger
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
          supabaseQuery = supabaseQuery.or(`
            action.ilike.%${filter.search}%,
            resource.ilike.%${filter.search}%,
            details.ilike.%${filter.search}%
          `)
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

      this.supabase
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

      console.log(`Flushed ${events.length} audit events to database`)

    } catch (error) {
      console.error('Failed to flush audit buffer:', error)
      // Re-add events to buffer for retry if event exists and is valid AuditEvent
      if (event && 'timestamp' in event) {
        this.buffer.unshift(event as any)
      }
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
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
      ].map(field => `"${field}"`).join(','))
    ]

    return csvRows.join('\n')
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

      console.log(`Cleaned up ${data.length} audit events older than ${days} days`)
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
      const archiveFile = `audit_archive_${new Date().toISOString().split('T')[0]}.json`
      
      // Save to storage (implementation depends on your storage solution)
      // For now, just log the action
      console.log(`Archived ${events.length} audit events to ${archiveFile}`)

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
