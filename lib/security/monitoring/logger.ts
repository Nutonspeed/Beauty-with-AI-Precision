// Security Monitoring and Logging
import { createClient } from '@/lib/supabase/server'

// Security event types
export enum SecurityEventType {
  LOGIN_ATTEMPT = 'LOGIN_ATTEMPT',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PRIVILEGE_ESCALATION = 'PRIVILEGE_ESCALATION',
  DATA_ACCESS = 'DATA_ACCESS',
  API_CALL = 'API_CALL',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  SECURITY_VIOLATION = 'SECURITY_VIOLATION',
  VULNERABILITY_FOUND = 'VULNERABILITY_FOUND'
}

// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

// Security event interface
export interface SecurityEvent {
  id: string
  type: SecurityEventType
  level: LogLevel
  message: string
  userId?: string
  ip?: string
  userAgent?: string
  endpoint?: string
  method?: string
  statusCode?: number
  context?: Record<string, any>
  timestamp: Date
  source: string
}

// Security monitoring configuration
export interface SecurityMonitoringConfig {
  enableRealTimeAlerts: boolean
  alertThresholds: {
    failedLoginsPerMinute: number
    suspiciousAPIcallsPerMinute: number
    dataAccessEventsPerMinute: number
  }
  retentionDays: number
  enableAnomalyDetection: boolean
}

export class SecurityLogger {
  private static instance: SecurityLogger
  private config: SecurityMonitoringConfig
  private eventBuffer: SecurityEvent[] = []
  private bufferSize = 100

  constructor(config?: Partial<SecurityMonitoringConfig>) {
    this.config = {
      enableRealTimeAlerts: true,
      alertThresholds: {
        failedLoginsPerMinute: 5,
        suspiciousAPIcallsPerMinute: 20,
        dataAccessEventsPerMinute: 10
      },
      retentionDays: 90,
      enableAnomalyDetection: true,
      ...config
    }

    // Setup periodic flush
    setInterval(() => {
      this.flushEvents()
    }, 30000) // Flush every 30 seconds
  }

  static getInstance(config?: Partial<SecurityMonitoringConfig>): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger(config)
    }
    return SecurityLogger.instance
  }

  // Log security event
  logEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...event
    }

    // Add to buffer
    this.eventBuffer.push(securityEvent)

    // Keep buffer size manageable
    if (this.eventBuffer.length > this.bufferSize) {
      this.eventBuffer = this.eventBuffer.slice(-this.bufferSize)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[SECURITY-${event.level}] ${event.message}`, event)
    }

    // Immediate processing for critical events
    if (event.level === LogLevel.CRITICAL || event.level === LogLevel.ERROR) {
      this.processEvent(securityEvent)
    }
  }

  // Convenience methods
  logInfo(message: string, context?: Record<string, any>): void {
    this.logEvent({
      type: SecurityEventType.SUSPICIOUS_ACTIVITY,
      level: LogLevel.INFO,
      message,
      context,
      source: 'application'
    })
  }

  logWarning(message: string, context?: Record<string, any>): void {
    this.logEvent({
      type: SecurityEventType.SUSPICIOUS_ACTIVITY,
      level: LogLevel.WARN,
      message,
      context,
      source: 'application'
    })
  }

  logError(error: Error, context?: Record<string, any>): void {
    this.logEvent({
      type: SecurityEventType.SECURITY_VIOLATION,
      level: LogLevel.ERROR,
      message: error.message,
      context: {
        ...context,
        stack: error.stack,
        name: error.name
      },
      source: 'application'
    })
  }

  logCritical(message: string, context?: Record<string, any>): void {
    this.logEvent({
      type: SecurityEventType.SECURITY_VIOLATION,
      level: LogLevel.CRITICAL,
      message,
      context,
      source: 'application'
    })
  }

  // Authentication events
  logLoginAttempt(userId: string, ip: string, success: boolean, userAgent?: string): void {
    this.logEvent({
      type: success ? SecurityEventType.LOGIN_SUCCESS : SecurityEventType.LOGIN_FAILURE,
      level: success ? LogLevel.INFO : LogLevel.WARN,
      message: `Login ${success ? 'success' : 'failure'} for user ${userId}`,
      userId,
      ip,
      userAgent,
      source: 'auth'
    })
  }

  logPasswordChange(userId: string, ip: string): void {
    this.logEvent({
      type: SecurityEventType.PASSWORD_CHANGE,
      level: LogLevel.INFO,
      message: `Password changed for user ${userId}`,
      userId,
      ip,
      source: 'auth'
    })
  }

  // API events
  logAPICall(userId: string, endpoint: string, method: string, statusCode: number, ip: string): void {
    const level = statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO
    
    this.logEvent({
      type: SecurityEventType.API_CALL,
      level,
      message: `API ${method} ${endpoint} - ${statusCode}`,
      userId,
      endpoint,
      method,
      statusCode,
      ip,
      source: 'api'
    })
  }

  // Data access events
  logDataAccess(userId: string, resource: string, action: string, ip: string): void {
    this.logEvent({
      type: SecurityEventType.DATA_ACCESS,
      level: LogLevel.INFO,
      message: `User ${userId} ${action} resource ${resource}`,
      userId,
      context: { resource, action },
      ip,
      source: 'data'
    })
  }

  // Security violations
  logSecurityViolation(message: string, context?: Record<string, any>): void {
    this.logEvent({
      type: SecurityEventType.SECURITY_VIOLATION,
      level: LogLevel.ERROR,
      message,
      context,
      source: 'security'
    })
  }

  // Process individual event
  private async processEvent(event: SecurityEvent): Promise<void> {
    try {
      // Check for alert conditions
      if (this.config.enableRealTimeAlerts) {
        await this.checkAlertConditions(event)
      }

      // Anomaly detection
      if (this.config.enableAnomalyDetection) {
        await this.detectAnomalies(event)
      }

    } catch (error) {
      console.error('Error processing security event:', error)
    }
  }

  // Check alert conditions
  private async checkAlertConditions(event: SecurityEvent): Promise<void> {
    const now = Date.now()
    const oneMinuteAgo = now - 60000

    // Count recent events of same type
    const recentEvents = this.eventBuffer.filter(e => 
      e.type === event.type && 
      e.timestamp.getTime() > oneMinuteAgo
    )

    // Check thresholds
    switch (event.type) {
      case SecurityEventType.LOGIN_FAILURE:
        if (recentEvents.length >= this.config.alertThresholds.failedLoginsPerMinute) {
          await this.sendAlert('BRUTE_FORCE_ATTACK', `Multiple failed login attempts detected`, {
            count: recentEvents.length,
            timeWindow: '1 minute'
          })
        }
        break

      case SecurityEventType.API_CALL:
        if (recentEvents.length >= this.config.alertThresholds.suspiciousAPIcallsPerMinute) {
          await this.sendAlert('API_ABUSE', `High volume API calls detected`, {
            count: recentEvents.length,
            timeWindow: '1 minute'
          })
        }
        break

      case SecurityEventType.DATA_ACCESS:
        if (recentEvents.length >= this.config.alertThresholds.dataAccessEventsPerMinute) {
          await this.sendAlert('DATA_EXFILTRATION', `Unusual data access pattern detected`, {
            count: recentEvents.length,
            timeWindow: '1 minute'
          })
        }
        break
    }
  }

  // Detect anomalies
  private async detectAnomalies(event: SecurityEvent): Promise<void> {
    // This would implement ML-based anomaly detection
    // For now, implement simple rule-based detection

    // Detect unusual access patterns
    if (event.type === SecurityEventType.DATA_ACCESS) {
      const userRecentEvents = this.eventBuffer.filter(e => 
        e.userId === event.userId && 
        e.type === SecurityEventType.DATA_ACCESS &&
        e.timestamp.getTime() > (Date.now() - 300000) // Last 5 minutes
      )

      if (userRecentEvents.length > 50) {
        await this.sendAlert('UNUSUAL_ACCESS', `Unusual data access pattern for user ${event.userId}`, {
          userId: event.userId,
          accessCount: userRecentEvents.length,
          timeWindow: '5 minutes'
        })
      }
    }

    // Detect geographic anomalies
    if (event.ip && event.userId) {
      const userLocations = this.eventBuffer
        .filter(e => e.userId === event.userId && e.ip)
        .map(e => e.ip)
        .filter((ip, index, arr) => arr.indexOf(ip) === index) // Unique IPs

      if (userLocations.length > 3) {
        await this.sendAlert('GEOGRAPHIC_ANOMALY', `User ${event.userId} accessing from multiple locations`, {
          userId: event.userId,
          locations: userLocations.length
        })
      }
    }
  }

  // Send alert
  private async sendAlert(type: string, message: string, context?: Record<string, any>): Promise<void> {
    const alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      context,
      timestamp: new Date().toISOString(),
      severity: 'HIGH'
    }

    // Log alert
    console.log(`🚨 SECURITY ALERT [${type}]: ${message}`, context)

    // Here you would integrate with alert systems:
    // - Send to Slack
    // - Send email
    // - Send to SIEM
    // - Create incident in ticketing system

    // Store alert in database
    try {
      const supabase = await createClient()
      await supabase
        .from('security_alerts')
        .insert(alert)
    } catch (error) {
      console.error('Failed to store security alert:', error)
    }
  }

  // Flush events to database
  private async flushEvents(): Promise<void> {
    if (this.eventBuffer.length === 0) return

    const eventsToFlush = [...this.eventBuffer]
    this.eventBuffer = []

    try {
      const supabase = await createClient()
      
      const { error } = await supabase
        .from('security_events')
        .insert(eventsToFlush.map(event => ({
          id: event.id,
          type: event.type,
          level: event.level,
          message: event.message,
          user_id: event.userId,
          ip: event.ip,
          user_agent: event.userAgent,
          endpoint: event.endpoint,
          method: event.method,
          status_code: event.statusCode,
          context: event.context,
          source: event.source,
          created_at: event.timestamp.toISOString()
        })))

      if (error) {
        throw error
      }

    } catch (error) {
      console.error('Failed to flush security events:', error)
      // Re-add events to buffer if flush failed
      this.eventBuffer.unshift(...eventsToFlush)
    }
  }

  // Get recent events
  async getRecentEvents(limit: number = 100): Promise<SecurityEvent[]> {
    try {
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data?.map(event => ({
        id: event.id,
        type: event.type,
        level: event.level,
        message: event.message,
        userId: event.user_id,
        ip: event.ip,
        userAgent: event.user_agent,
        endpoint: event.endpoint,
        method: event.method,
        statusCode: event.status_code,
        context: event.context,
        timestamp: new Date(event.created_at),
        source: event.source
      })) || []

    } catch (error) {
      console.error('Failed to get recent events:', error)
      return []
    }
  }

  // Get security metrics
  async getSecurityMetrics(timeRange: string = '24h'): Promise<any> {
    try {
      const supabase = await createClient()
      const cutoffDate = this.getCutoffDate(timeRange)

      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .gte('created_at', cutoffDate)

      if (error) throw error

      const events = data || []
      
      return {
        totalEvents: events.length,
        eventsByType: this.groupBy(events, 'type'),
        eventsByLevel: this.groupBy(events, 'level'),
        uniqueUsers: new Set(events.filter(e => e.user_id).map(e => e.user_id)).size,
        uniqueIPs: new Set(events.filter(e => e.ip).map(e => e.ip)).size,
        timeRange,
        generatedAt: new Date().toISOString()
      }

    } catch (error) {
      console.error('Failed to get security metrics:', error)
      return {}
    }
  }

  private groupBy(array: any[], key: string): Record<string, number> {
    return array.reduce((groups, item) => {
      const group = item[key]
      groups[group] = (groups[group] || 0) + 1
      return groups
    }, {})
  }

  private getCutoffDate(timeRange: string): string {
    const now = new Date()
    const cutoff = new Date()
    
    switch (timeRange) {
      case '1h':
        cutoff.setHours(now.getHours() - 1)
        break
      case '6h':
        cutoff.setHours(now.getHours() - 6)
        break
      case '24h':
        cutoff.setDate(now.getDate() - 1)
        break
      case '7d':
        cutoff.setDate(now.getDate() - 7)
        break
      case '30d':
        cutoff.setDate(now.getDate() - 30)
        break
      default:
        cutoff.setHours(now.getHours() - 1)
    }
    
    return cutoff.toISOString()
  }
}

// Export singleton instance
export const securityLogger = SecurityLogger.getInstance()
