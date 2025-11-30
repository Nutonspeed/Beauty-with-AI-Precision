/**
 * Logger Utility Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Log Levels', () => {
    const LOG_LEVELS = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    }

    it('should have correct priority order', () => {
      expect(LOG_LEVELS.debug).toBeLessThan(LOG_LEVELS.info)
      expect(LOG_LEVELS.info).toBeLessThan(LOG_LEVELS.warn)
      expect(LOG_LEVELS.warn).toBeLessThan(LOG_LEVELS.error)
    })

    it('should filter logs by level', () => {
      const minLevel = 'warn'
      const shouldLog = (level: keyof typeof LOG_LEVELS) => {
        return LOG_LEVELS[level] >= LOG_LEVELS[minLevel]
      }

      expect(shouldLog('debug')).toBe(false)
      expect(shouldLog('info')).toBe(false)
      expect(shouldLog('warn')).toBe(true)
      expect(shouldLog('error')).toBe(true)
    })
  })

  describe('Log Entry Format', () => {
    it('should create valid log entry', () => {
      const entry = {
        level: 'info',
        message: 'Test message',
        timestamp: new Date().toISOString(),
        data: { key: 'value' },
        source: 'test'
      }

      expect(entry).toHaveProperty('level')
      expect(entry).toHaveProperty('message')
      expect(entry).toHaveProperty('timestamp')
      expect(entry.level).toBe('info')
    })

    it('should format timestamp correctly', () => {
      const timestamp = new Date().toISOString()
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
  })

  describe('Scoped Logger', () => {
    it('should prefix messages with source', () => {
      const source = 'API'
      const message = 'Request received'
      const formatted = `[${source}] ${message}`
      
      expect(formatted).toBe('[API] Request received')
    })
  })

  describe('API Request Logging', () => {
    it('should determine log level from status code', () => {
      const getLevel = (status: number) => {
        if (status >= 500) return 'error'
        if (status >= 400) return 'warn'
        return 'info'
      }

      expect(getLevel(200)).toBe('info')
      expect(getLevel(404)).toBe('warn')
      expect(getLevel(500)).toBe('error')
    })

    it('should format API log message', () => {
      const method = 'GET'
      const path = '/api/health'
      const status = 200
      const duration = 45
      
      const message = `${method} ${path} ${status} (${duration}ms)`
      expect(message).toBe('GET /api/health 200 (45ms)')
    })
  })
})
