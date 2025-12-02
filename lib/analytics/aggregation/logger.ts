/**
 * Logger for analytics aggregation operations
 */

export interface AnalyticsLogEntry {
  timestamp: Date
  operation: string
  userId?: string
  clinicId?: string
  metrics?: Record<string, number>
  error?: string
  duration?: number
}

export class AnalyticsLogger {
  private logs: AnalyticsLogEntry[] = []

  log(entry: Omit<AnalyticsLogEntry, 'timestamp'>): void {
    const logEntry: AnalyticsLogEntry = {
      timestamp: new Date(),
      ...entry
    }
    
    this.logs.push(logEntry)
    
    // In production, you might want to send this to a logging service
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics Logger]', logEntry)
    }
  }

  getLogs(): AnalyticsLogEntry[] {
    return [...this.logs]
  }

  clearLogs(): void {
    this.logs = []
  }

  getMetricsByOperation(operation: string): AnalyticsLogEntry[] {
    return this.logs.filter(log => log.operation === operation)
  }

  getErrorLogs(): AnalyticsLogEntry[] {
    return this.logs.filter(log => log.error)
  }
}

export const analyticsLogger = new AnalyticsLogger()
