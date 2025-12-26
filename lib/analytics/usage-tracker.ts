'use client';

/**
 * Usage Tracking Utility
 * Tracks user behavior and feature usage for analytics
 */

import { analyticsEngine } from '@/lib/analytics/analytics-engine';

export interface UsageEvent {
  event: string;
  category: 'feature' | 'engagement' | 'performance' | 'error';
  userId?: string;
  tenantId?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface FeatureUsage {
  feature: string;
  action: string;
  duration?: number;
  success: boolean;
  metadata?: Record<string, any>;
}

class UsageTracker {
  private static instance: UsageTracker;
  private events: UsageEvent[] = [];
  private eventBatch: UsageEvent[] = [];
  private sessionStart: Date = new Date();
  private sessionStartTracked = false;
  private unloadBound = false;

  private constructor() {
    // Session start will be tracked lazily on first event
    // Attach flush-on-unload to improve delivery reliability
    if (typeof window !== 'undefined' && !this.unloadBound) {
      this.unloadBound = true;
      const flush = () => this.flushOnUnload();
      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') flush();
      });
      window.addEventListener('pagehide', flush);
      window.addEventListener('beforeunload', flush);
    }
  }

  static getInstance(): UsageTracker {
    if (!UsageTracker.instance) {
      UsageTracker.instance = new UsageTracker();
    }
    return UsageTracker.instance;
  }

  /**
   * Track a usage event
   */
  trackEvent(event: Omit<UsageEvent, 'timestamp'>): void {
    // Track session start on first event
    if (!this.sessionStartTracked) {
      this.sessionStartTracked = true;
      this.events.push({
        event: 'session_start',
        category: 'engagement',
        timestamp: new Date(),
      });
    }

    const fullEvent: UsageEvent = {
      ...event,
      timestamp: new Date(),
    };

    this.events.push(fullEvent);

    // Send to analytics engine
    this.sendToAnalytics(fullEvent);

    // Log for debugging
    if (process.env.NODE_ENV !== 'production') {
      console.log('Usage Event:', fullEvent);
    }
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(featureUsage: FeatureUsage): void {
    this.trackEvent({
      event: `feature_${featureUsage.feature}_${featureUsage.action}`,
      category: 'feature',
      metadata: {
        feature: featureUsage.feature,
        action: featureUsage.action,
        duration: featureUsage.duration,
        success: featureUsage.success,
        ...featureUsage.metadata,
      },
    });
  }

  /**
   * Track page view
   */
  trackPageView(page: string, metadata?: Record<string, any>): void {
    this.trackEvent({
      event: 'page_view',
      category: 'engagement',
      metadata: {
        page,
        ...metadata,
      },
    });
  }

  /**
   * Track user engagement
   */
  trackEngagement(action: string, target: string, metadata?: Record<string, any>): void {
    this.trackEvent({
      event: `engagement_${action}`,
      category: 'engagement',
      metadata: {
        target,
        ...metadata,
      },
    });
  }

  /**
   * Track performance metric
   */
  trackPerformance(metric: string, value: number, metadata?: Record<string, any>): void {
    this.trackEvent({
      event: `performance_${metric}`,
      category: 'performance',
      metadata: {
        value,
        ...metadata,
      },
    });

    // Also send to analytics engine performance tracking
    analyticsEngine.trackPerformance(metric, value, metadata);
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: Record<string, any>): void {
    this.trackEvent({
      event: 'error_occurred',
      category: 'error',
      metadata: {
        error: error.message,
        stack: error.stack,
        ...context,
      },
    });
  }

  /**
   * Track session end
   */
  trackSessionEnd(): void {
    const sessionDuration = Date.now() - this.sessionStart.getTime();

    this.trackEvent({
      event: 'session_end',
      category: 'engagement',
      metadata: {
        duration: sessionDuration,
        eventCount: this.events.length,
      },
    });
  }

  /**
   * Get usage statistics for current session
   */
  getSessionStats() {
    const sessionDuration = Date.now() - this.sessionStart.getTime();

    return {
      sessionDuration,
      totalEvents: this.events.length,
      eventsByCategory: this.events.reduce((acc, event) => {
        acc[event.category] = (acc[event.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      featureUsage: this.events
        .filter(e => e.category === 'feature')
        .reduce((acc, event) => {
          const feature = event.metadata?.feature;
          if (feature) {
            acc[feature] = (acc[feature] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>),
    };
  }

  /**
   * Send event to analytics engine and API
   */
  private async sendToAnalytics(event: UsageEvent): Promise<void> {
    try {
      // Send to analytics engine if it's a performance metric
      if (event.category === 'performance' && event.metadata?.value) {
        await analyticsEngine.trackPerformance(
          event.event.replace('performance_', ''),
          event.metadata.value,
          event.metadata
        );
      }

      // Send to database API (batch events periodically)
      await this.sendToDatabase(event);

    } catch (error) {
      console.error('Failed to send usage event to analytics:', error);
    }
  }

  /**
   * Send events to database API
   */
  private async sendToDatabase(event: UsageEvent): Promise<void> {
    try {
      // Add to batch queue
      this.eventBatch.push(event);

      // Send batch if it reaches threshold or after delay
      if (this.eventBatch.length >= 10) {
        await this.flushEventBatch();
      } else if (this.eventBatch.length === 1) {
        // Start timer for delayed send
        setTimeout(() => this.flushEventBatch(), 30000); // Changed from 5000 to 30000
      }
    } catch (error) {
      console.error('Failed to queue usage event:', error);
    }
  }

  /**
   * Flush batched events to API
   */
  private async flushEventBatch() {
    // Disable analytics for development
    if (process.env.NODE_ENV !== 'production') {
      this.eventBatch = [];
      return;
    }

    if (this.eventBatch.length === 0) return;

    const eventsToSend = [...this.eventBatch];
    this.eventBatch = [];

    try {
      const response = await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventsToSend),
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      if (process.env.NODE_ENV !== 'production') {
        console.log(`Sent ${eventsToSend.length} usage events to database`);
      }
    } catch (error) {
      console.error('Failed to send usage events batch:', error);
      // Re-queue events for retry
      this.eventBatch.unshift(...eventsToSend);
    }
  }

  /**
   * Flush using navigator.sendBeacon during unload when possible.
   * Fall back to fetch with keepalive.
   */
  private flushOnUnload(): void {
    try {
      // Push a session_end marker if not already added
      try {
        this.trackSessionEnd();
      } catch {}

      if (this.eventBatch.length === 0) return;

      const eventsToSend = [...this.eventBatch];
      this.eventBatch = [];

      const payload = JSON.stringify(eventsToSend);
      const url = '/api/analytics/events';

      // Prefer sendBeacon for reliability on unload
      if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
        const blob = new Blob([payload], { type: 'application/json' });
        const ok = (navigator as any).sendBeacon(url, blob);
        if (!ok) {
          // Fallback to keepalive fetch
          fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {
            // Re-queue if failed
            this.eventBatch.unshift(...eventsToSend);
          });
        }
        return;
      }

      // Fallback if sendBeacon not available
      fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {
        this.eventBatch.unshift(...eventsToSend);
      });
    } catch {
      // swallow errors during unload
    }
  }
}

// Export singleton instance
export const usageTracker = UsageTracker.getInstance();

// Helper functions for common tracking
export const trackFeatureUsage = (featureUsage: FeatureUsage) => {
  usageTracker.trackFeatureUsage(featureUsage);
};

export const trackPageView = (page: string, metadata?: Record<string, any>) => {
  usageTracker.trackPageView(page, metadata);
};

export const trackEngagement = (action: string, target: string, metadata?: Record<string, any>) => {
  usageTracker.trackEngagement(action, target, metadata);
};

export const trackPerformance = (metric: string, value: number, metadata?: Record<string, any>) => {
  usageTracker.trackPerformance(metric, value, metadata);
};

export const trackError = (error: Error, context?: Record<string, any>) => {
  usageTracker.trackError(error, context);
};

// React hook for usage tracking
export function useUsageTracking() {
  return {
    trackFeatureUsage,
    trackPageView,
    trackEngagement,
    trackPerformance,
    trackError,
    getSessionStats: () => usageTracker.getSessionStats(),
  };
}