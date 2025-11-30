/**
 * Production-ready Logger
 * 
 * Replaces console.log with structured logging
 * - Development: Full logging with colors
 * - Production: Only errors and warnings
 * - Supports log levels and structured data
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  data?: unknown
  source?: string
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}

// In production, only log warnings and errors
const MIN_LEVEL: LogLevel = process.env.NODE_ENV === 'production' ? 'warn' : 'debug'

const COLORS = {
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m',  // Green
  warn: '\x1b[33m',  // Yellow
  error: '\x1b[31m', // Red
  reset: '\x1b[0m'
}

const ICONS = {
  debug: '🔍',
  info: '✅',
  warn: '⚠️',
  error: '❌'
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LEVEL]
}

function formatMessage(entry: LogEntry): string {
  const { level, message, timestamp, data, source } = entry
  const icon = ICONS[level]
  const sourcePrefix = source ? `[${source}] ` : ''
  
  if (process.env.NODE_ENV === 'production') {
    // JSON format for production (easy to parse by log services)
    const logObj: Record<string, unknown> = {
      level,
      message: `${sourcePrefix}${message}`,
      timestamp
    }
    if (data) logObj.data = data
    return JSON.stringify(logObj)
  }
  
  // Pretty format for development
  const color = COLORS[level]
  const reset = COLORS.reset
  let output = `${color}${icon} [${timestamp}] ${sourcePrefix}${message}${reset}`
  
  if (data) {
    output += `\n${color}   └─ ${JSON.stringify(data, null, 2)}${reset}`
  }
  
  return output
}

function createLogEntry(level: LogLevel, message: string, data?: unknown, source?: string): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    data,
    source
  }
}

/**
 * Logger instance
 */
export const logger = {
  debug: (message: string, data?: unknown, source?: string) => {
    if (shouldLog('debug')) {
      console.log(formatMessage(createLogEntry('debug', message, data, source)))
    }
  },
  
  info: (message: string, data?: unknown, source?: string) => {
    if (shouldLog('info')) {
      console.log(formatMessage(createLogEntry('info', message, data, source)))
    }
  },
  
  warn: (message: string, data?: unknown, source?: string) => {
    if (shouldLog('warn')) {
      console.warn(formatMessage(createLogEntry('warn', message, data, source)))
    }
  },
  
  error: (message: string, data?: unknown, source?: string) => {
    if (shouldLog('error')) {
      console.error(formatMessage(createLogEntry('error', message, data, source)))
    }
  },

  // Create a scoped logger for a specific module
  scope: (source: string) => ({
    debug: (message: string, data?: unknown) => logger.debug(message, data, source),
    info: (message: string, data?: unknown) => logger.info(message, data, source),
    warn: (message: string, data?: unknown) => logger.warn(message, data, source),
    error: (message: string, data?: unknown) => logger.error(message, data, source)
  }),

  // Performance timing
  time: (label: string) => {
    if (shouldLog('debug')) {
      console.time(label)
    }
  },
  
  timeEnd: (label: string) => {
    if (shouldLog('debug')) {
      console.timeEnd(label)
    }
  }
}

/**
 * API Request Logger Middleware Helper
 */
export function logApiRequest(
  method: string,
  path: string,
  status: number,
  duration: number,
  userId?: string
) {
  const level: LogLevel = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info'
  
  logger[level](`${method} ${path} ${status} (${duration}ms)`, {
    method,
    path,
    status,
    duration,
    userId
  }, 'API')
}

/**
 * Error logging with stack trace
 */
export function logError(error: Error, context?: string) {
  logger.error(error.message, {
    name: error.name,
    stack: error.stack,
    context
  }, 'Error')
}

export default logger
