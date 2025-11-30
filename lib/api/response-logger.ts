/**
 * API Response Logger
 * Logs API response times and errors for monitoring
 */

import { NextResponse } from 'next/server'

interface LogEntry {
  endpoint: string
  method: string
  duration: number
  status: number
  timestamp: string
  error?: string
}

// In-memory log buffer (last 100 entries)
const logBuffer: LogEntry[] = []
const MAX_LOG_SIZE = 100

/**
 * Log API response
 */
export function logApiResponse(entry: Omit<LogEntry, 'timestamp'>) {
  const logEntry: LogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  }
  
  logBuffer.push(logEntry)
  if (logBuffer.length > MAX_LOG_SIZE) {
    logBuffer.shift()
  }

  // Console log for slow APIs
  if (entry.duration > 1000) {
    console.warn(`⚠️ Slow API: ${entry.endpoint} took ${entry.duration}ms`)
  }
  
  // Console log for errors
  if (entry.status >= 400) {
    console.error(`❌ API Error: ${entry.endpoint} returned ${entry.status}`)
  }
}

/**
 * Get recent logs
 */
export function getRecentLogs(limit = 50): LogEntry[] {
  return logBuffer.slice(-limit)
}

/**
 * Get API stats
 */
export function getApiStats() {
  if (logBuffer.length === 0) {
    return { avgDuration: 0, errorRate: 0, totalRequests: 0 }
  }

  const durations = logBuffer.map(l => l.duration)
  const errors = logBuffer.filter(l => l.status >= 400)
  
  return {
    avgDuration: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
    errorRate: Math.round((errors.length / logBuffer.length) * 100),
    totalRequests: logBuffer.length,
    slowRequests: logBuffer.filter(l => l.duration > 1000).length,
  }
}

/**
 * Wrapper to measure API response time
 */
export async function withResponseTime<T>(
  endpoint: string,
  method: string,
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T>> {
  const start = Date.now()
  
  try {
    const response = await handler()
    const duration = Date.now() - start
    
    logApiResponse({
      endpoint,
      method,
      duration,
      status: response.status,
    })
    
    // Add timing header
    response.headers.set('X-Response-Time', `${duration}ms`)
    
    return response
  } catch (error) {
    const duration = Date.now() - start
    
    logApiResponse({
      endpoint,
      method,
      duration,
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    
    throw error
  }
}

/**
 * Example usage in API route:
 * 
 * export async function GET(request: NextRequest) {
 *   return withResponseTime('/api/example', 'GET', async () => {
 *     // Your handler code
 *     return NextResponse.json({ data })
 *   })
 * }
 */
