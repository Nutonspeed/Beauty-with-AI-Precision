// Analytics Logger for Real-time Analytics
import { createClient } from '@/lib/supabase/server'

// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

// Log entry interface
export interface AnalyticsLogEntry {
  level: LogLevel
  message: string
  context?: Record<string, any>
  timestamp: string
  userId?: string
  clinicId?: string
  sessionId?: string
}

export class AnalyticsLogger {
  private static instance: AnalyticsLogger
  private logs: AnalyticsLogEntry[] = []
  private maxLogs = 1000

  constructor() {
    // Setup periodic log flushing
    setInterval(() => {
      this.flushLogs()
    }, 30000) // Flush every 30 seconds
  }

  static getInstance(): AnalyticsLogger {
    if (!AnalyticsLogger.instance) {
      AnalyticsLogger.instance = new AnalyticsLogger()
    }
    return AnalyticsLogger.instance
  }

  // Log debug message
  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context)
  }

  // Log info message
  logInfo(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context)
  }

  // Log warning message
  logWarning(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context)
  }

  // Log error message
  logError(error: Error, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, error.message, {
      ...context,
      stack: error.stack,
      name: error.name
    })
  }

  // Main log method
  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    const logEntry: AnalyticsLogEntry = {
      level,
      message,
      context,
      timestamp: new Date().toISOString()
    }

    // Add to memory buffer
    this.logs.push(logEntry)

    // Keep buffer size manageable
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[ANALYTICS-${level}] ${message}`, context)
    }

    // Immediately flush errors
    if (level === LogLevel.ERROR) {
      this.flushLogs()
    }
  }

  // Flush logs to database
  private async flushLogs(): Promise<void> {
    if (this.logs.length === 0) return

    const logsToFlush = [...this.logs]
    this.logs = []

    try {
      const supabase = await createClient()
      
      const { error } = await supabase
        .from('analytics_logs')
        .insert(logsToFlush.map(log => ({
          level: log.level,
          message: log.message,
          context: log.context,
          user_id: log.userId,
          clinic_id: log.clinicId,
          session_id: log.sessionId,
          created_at: log.timestamp
        })))

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Failed to flush analytics logs:', error)
      // Re-add logs to buffer if flush failed
      this.logs.unshift(...logsToFlush)
    }
  }

  // Get recent logs
  getRecentLogs(limit: number = 100): AnalyticsLogEntry[] {
    return this.logs.slice(-limit)
  }

  // Clear logs
  clearLogs(): void {
    this.logs = []
  }
}

// Export singleton instance
export const analyticsLogger = AnalyticsLogger.getInstance()
