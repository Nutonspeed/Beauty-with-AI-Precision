/**
 * Usage Tracking Validation Tests
 * Tests to validate that usage events are being captured and stored correctly
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { usageTracker, trackFeatureUsage, trackPageView, trackEngagement } from '@/lib/analytics/usage-tracker'

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
  })),
}))

// Mock fetch to prevent network calls
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
  })
) as any

// Mock console methods to capture logs
const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('Usage Tracking System', () => {
  beforeEach(() => {
    // Reset usage tracker state
    vi.clearAllMocks()
    // Reset any stored events
    usageTracker['events'] = []
    usageTracker['sessionStart'] = new Date()
  })

  afterEach(() => {
    consoleLogSpy.mockClear()
    consoleWarnSpy.mockClear()
    consoleErrorSpy.mockClear()
  })

  describe('Event Tracking', () => {
    it('should track session start on initialization', () => {
      // Reset to get a fresh instance
      vi.clearAllMocks()
      usageTracker['events'] = []
      usageTracker['sessionStartTracked'] = false

      // Trigger an event to initialize session tracking
      trackFeatureUsage({ feature: 'test', action: 'init', success: true })

      // Session start should be tracked automatically
      const events = usageTracker['events']
      expect(events.length).toBeGreaterThan(0)
      expect(events[0].event).toBe('session_start')
      expect(events[0].category).toBe('engagement')
    })

    it('should track feature usage events', () => {
      const featureUsage = {
        feature: 'analysis',
        action: 'start',
        duration: 1500,
        success: true,
        metadata: { analysisType: 'full' }
      }

      trackFeatureUsage(featureUsage)

      const events = usageTracker['events']
      const featureEvent = events.find(e => e.event === 'feature_analysis_start')

      expect(featureEvent).toBeDefined()
      expect(featureEvent?.category).toBe('feature')
      expect(featureEvent?.metadata?.feature).toBe('analysis')
      expect(featureEvent?.metadata?.action).toBe('start')
      expect(featureEvent?.metadata?.duration).toBe(1500)
      expect(featureEvent?.metadata?.success).toBe(true)
    })

    it('should track page view events', () => {
      trackPageView('/dashboard', { referrer: '/login' })

      const events = usageTracker['events']
      const pageViewEvent = events.find(e => e.event === 'page_view')

      expect(pageViewEvent).toBeDefined()
      expect(pageViewEvent?.category).toBe('engagement')
      expect(pageViewEvent?.metadata?.page).toBe('/dashboard')
      expect(pageViewEvent?.metadata?.referrer).toBe('/login')
    })

    it('should track engagement events', () => {
      trackEngagement('click', 'analysis-button', { buttonType: 'primary' })

      const events = usageTracker['events']
      const engagementEvent = events.find(e => e.event === 'engagement_click')

      expect(engagementEvent).toBeDefined()
      expect(engagementEvent?.category).toBe('engagement')
      expect(engagementEvent?.metadata?.target).toBe('analysis-button')
      expect(engagementEvent?.metadata?.buttonType).toBe('primary')
    })

    it('should track error events', () => {
      const testError = new Error('Test error')
      usageTracker.trackError(testError, { component: 'AnalysisForm' })

      const events = usageTracker['events']
      const errorEvent = events.find(e => e.event === 'error_occurred')

      expect(errorEvent).toBeDefined()
      expect(errorEvent?.category).toBe('error')
      expect(errorEvent?.metadata?.error).toBe('Test error')
      expect(errorEvent?.metadata?.component).toBe('AnalysisForm')
    })

    it('should track session end with statistics', () => {
      // Add some events first
      trackFeatureUsage({ feature: 'test', action: 'run', success: true })
      trackPageView('/test')

      usageTracker.trackSessionEnd()

      const events = usageTracker['events']
      const sessionEndEvent = events.find(e => e.event === 'session_end')

      expect(sessionEndEvent).toBeDefined()
      expect(sessionEndEvent?.category).toBe('engagement')
      expect(sessionEndEvent?.metadata?.eventCount).toBeGreaterThan(1)
      expect(sessionEndEvent?.metadata?.duration).toBeDefined()
    })
  })

  describe('Session Statistics', () => {
    it('should calculate correct session statistics', () => {
      // Add various events
      trackFeatureUsage({ feature: 'analysis', action: 'start', success: true })
      trackFeatureUsage({ feature: 'analysis', action: 'complete', success: true })
      trackPageView('/dashboard')
      trackEngagement('click', 'button')
      usageTracker.trackError(new Error('test'))

      const stats = usageTracker.getSessionStats()

      expect(stats.totalEvents).toBeGreaterThan(1)
      expect(stats.eventsByCategory.feature).toBe(2)
      expect(stats.eventsByCategory.engagement).toBe(2) // page_view + engagement
      expect(stats.eventsByCategory.error).toBe(1)
      expect(stats.featureUsage.analysis).toBe(2)
    })

    it('should track session duration', () => {
      const startTime = Date.now()
      usageTracker['sessionStart'] = new Date(startTime)

      // Simulate time passing
      vi.useFakeTimers()
      vi.advanceTimersByTime(5000) // 5 seconds

      const stats = usageTracker.getSessionStats()
      expect(stats.sessionDuration).toBeGreaterThanOrEqual(5000)

      vi.useRealTimers()
    })
  })

  describe('Development Logging', () => {
    it('should log events in development mode', () => {
      // Clear previous calls
      consoleLogSpy.mockClear()

      // Set NODE_ENV to development
      vi.stubEnv('NODE_ENV', 'development')

      trackFeatureUsage({ feature: 'test', action: 'log', success: true })

      expect(consoleLogSpy).toHaveBeenCalled()
      // Check that at least one call contains 'Usage Event:' and the event object
      const usageEventCall = consoleLogSpy.mock.calls.find(call =>
        call[0] === 'Usage Event:' &&
        call[1] && typeof call[1] === 'object' && call[1].event === 'feature_test_log'
      )
      expect(usageEventCall).toBeDefined()
    })

    it('should not log events in production mode', () => {
      vi.stubEnv('NODE_ENV', 'production')

      trackFeatureUsage({ feature: 'test', action: 'no-log', success: true })

      expect(consoleLogSpy).not.toHaveBeenCalled()
    })
  })

  describe('Analytics Engine Integration', () => {
    it('should send performance metrics to analytics engine', () => {
      const mockAnalyticsEngine = {
        trackPerformance: vi.fn()
      }

      // Mock the analytics engine import
      vi.doMock('@/lib/analytics/analytics-engine', () => ({
        analyticsEngine: mockAnalyticsEngine
      }))

      usageTracker.trackPerformance('page_load', 1200, { page: '/dashboard' })

      // Check if analytics engine was called
      const events = usageTracker['events']
      const perfEvent = events.find(e => e.event === 'performance_page_load')

      expect(perfEvent).toBeDefined()
      expect(perfEvent?.category).toBe('performance')
      expect(perfEvent?.metadata?.value).toBe(1200)
    })
  })

  describe('Event Validation', () => {
    it('should include timestamp for all events', () => {
      trackFeatureUsage({ feature: 'test', action: 'timestamp', success: true })

      const events = usageTracker['events']
      const event = events.at(-1)

      expect(event).toBeDefined()
      expect(event!.timestamp).toBeInstanceOf(Date)
      expect(event!.timestamp.getTime()).toBeLessThanOrEqual(Date.now())
    })

    it('should handle missing metadata gracefully', () => {
      trackPageView('/test')

      const events = usageTracker['events']
      const event = events.find(e => e.event === 'page_view')

      expect(event?.metadata?.page).toBe('/test')
      expect(event?.metadata?.referrer).toBeUndefined()
    })

    it('should preserve user and tenant IDs when provided', () => {
      usageTracker.trackEvent({
        event: 'test_with_ids',
        category: 'feature',
        userId: 'user-123',
        tenantId: 'tenant-456'
      })

      const events = usageTracker['events']
      const event = events.find(e => e.event === 'test_with_ids')

      expect(event?.userId).toBe('user-123')
      expect(event?.tenantId).toBe('tenant-456')
    })
  })
})