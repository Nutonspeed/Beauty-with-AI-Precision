// Advanced Error Logging System for Beauty with AI Precision
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
    const logEntry = this.createLogEntry(error, LogLevel.ERROR, ErrorCategory.BUSINESS_LOGIC, context)
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
    const prefix = `[${timestamp}] [${logEntry.level}] [${logEntry.category}]`
    
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
      const supabase = await createClient()
      
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
        throw new Error(`Remote logging failed: ${response.status}`)
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
  }

  // Get error statistics
  async getErrorStats(timeRange?: { start: string; end: string }): Promise<{
    total: number
    resolved: number
    byLevel: Record<LogLevel, number>
    byCategory: Record<ErrorCategory, number>
    recent: any[]
  }> {
    try {
      const supabase = await createClient()
      
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
      
      const stats: {
        total: number
        resolved: number
        byLevel: Record<LogLevel, number>
        byCategory: Record<ErrorCategory, number>
        recent: any[]
      } = {
        total: data?.length || 0,
        byLevel: {} as Record<LogLevel, number>,
        byCategory: {} as Record<ErrorCategory, number>,
        recent: data?.slice(-10) || [],
        resolved: data?.filter((log: any) => log.resolved).length || 0
      }
      
      // Count by level
      data?.forEach((log: any) => {
        stats.byLevel[log.level as LogLevel] = (stats.byLevel[log.level as LogLevel] || 0) + 1
        stats.byCategory[log.category as ErrorCategory] = (stats.byCategory[log.category as ErrorCategory] || 0) + 1
      })
      
      return stats
    } catch (error) {
      console.error('Failed to get error stats:', error)
      return {
        total: 0,
        byLevel: {} as Record<LogLevel, number>,
        byCategory: {} as Record<ErrorCategory, number>,
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
