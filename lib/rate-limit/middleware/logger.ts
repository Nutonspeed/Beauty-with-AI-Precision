// Rate Limiting Logger
import { createClient } from '@/lib/supabase/server'

// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

// Log entry interface
export interface RateLimitLogEntry {
  level: LogLevel
  message: string
  context?: Record<string, any>
  timestamp: string
  ip?: string
  userAgent?: string
  path?: string
}

export class RateLimitLogger {
  private static instance: RateLimitLogger
  private logs: RateLimitLogEntry[] = []
  private maxLogs = 1000

  constructor() {
    // Setup periodic log flushing
    setInterval(() => {
      this.flushLogs()
    }, 30000) // Flush every 30 seconds
  }

  static getInstance(): RateLimitLogger {
    if (!RateLimitLogger.instance) {
      RateLimitLogger.instance = new RateLimitLogger()
    }
    return RateLimitLogger.instance
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
    const logEntry: RateLimitLogEntry = {
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
      console.log(`[RATE_LIMIT-${level}] ${message}`, context)
    }

    // Immediately flush errors and warnings
    if (level === LogLevel.ERROR || level === LogLevel.WARN) {
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
        .from('rate_limit_logs')
        .insert(logsToFlush.map(log => ({
          level: log.level,
          message: log.message,
          context: log.context,
          ip: log.ip,
          user_agent: log.userAgent,
          path: log.path,
          created_at: log.timestamp
        })))

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Failed to flush rate limit logs:', error)
      // Re-add logs to buffer if flush failed
      this.logs.unshift(...logsToFlush)
    }
  }

  // Get recent logs
  getRecentLogs(limit: number = 100): RateLimitLogEntry[] {
    return this.logs.slice(-limit)
  }

  // Clear logs
  clearLogs(): void {
    this.logs = []
  }
}

// Export singleton instance
export const rateLimitLogger = RateLimitLogger.getInstance()
