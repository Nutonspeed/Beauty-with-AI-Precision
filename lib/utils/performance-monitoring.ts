/**
 * Performance Monitoring Utilities
 * Track and report performance metrics
 */

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

interface PerformanceReport {
  metrics: PerformanceMetric[];
  url: string;
  userAgent: string;
  timestamp: string;
  userId?: string;
}

/**
 * Core Web Vitals thresholds
 */
const THRESHOLDS = {
  // Largest Contentful Paint (LCP)
  LCP: {
    good: 2500,
    poor: 4000,
  },
  // First Input Delay (FID)
  FID: {
    good: 100,
    poor: 300,
  },
  // Cumulative Layout Shift (CLS)
  CLS: {
    good: 0.1,
    poor: 0.25,
  },
  // First Contentful Paint (FCP)
  FCP: {
    good: 1800,
    poor: 3000,
  },
  // Time to First Byte (TTFB)
  TTFB: {
    good: 800,
    poor: 1800,
  },
  // Interaction to Next Paint (INP)
  INP: {
    good: 200,
    poor: 500,
  },
};

/**
 * Get performance rating based on value and thresholds
 */
function getRating(
  value: number,
  thresholds: { good: number; poor: number }
): 'good' | 'needs-improvement' | 'poor' {
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Report performance metrics to analytics endpoint
 */
async function reportMetrics(metrics: PerformanceMetric[]): Promise<void> {
  try {
    const report: PerformanceReport = {
      metrics,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    await fetch('/api/analytics/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(report),
      // Use keepalive to ensure the request completes even if the page is closing
      keepalive: true,
    });
  } catch (error) {
    console.error('Failed to report performance metrics:', error);
  }
}

/**
 * Observe Web Vitals using PerformanceObserver
 */
export function observeWebVitals(): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }

  const reportedMetrics: PerformanceMetric[] = [];

  // Observe Largest Contentful Paint (LCP)
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
      const value = lastEntry.renderTime || lastEntry.loadTime || 0;

      reportedMetrics.push({
        name: 'LCP',
        value,
        rating: getRating(value, THRESHOLDS.LCP),
        timestamp: Date.now(),
      });
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {
    console.warn('LCP observation not supported');
  }

  // Observe First Input Delay (FID)
  try {
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        const value = entry.processingStart - entry.startTime;

        reportedMetrics.push({
          name: 'FID',
          value,
          rating: getRating(value, THRESHOLDS.FID),
          timestamp: Date.now(),
        });
      });
    });
    fidObserver.observe({ type: 'first-input', buffered: true });
  } catch {
    console.warn('FID observation not supported');
  }

  // Observe Cumulative Layout Shift (CLS)
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });

    // Report CLS on page unload
    window.addEventListener('pagehide', () => {
      reportedMetrics.push({
        name: 'CLS',
        value: clsValue,
        rating: getRating(clsValue, THRESHOLDS.CLS),
        timestamp: Date.now(),
      });
    });
  } catch {
    console.warn('CLS observation not supported');
  }

  // Observe First Contentful Paint (FCP)
  try {
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        reportedMetrics.push({
          name: 'FCP',
          value: entry.startTime,
          rating: getRating(entry.startTime, THRESHOLDS.FCP),
          timestamp: Date.now(),
        });
      });
    });
    fcpObserver.observe({ type: 'paint', buffered: true });
  } catch {
    console.warn('FCP observation not supported');
  }

  // Report metrics periodically and on page unload
  const reportInterval = setInterval(() => {
    if (reportedMetrics.length > 0) {
      reportMetrics([...reportedMetrics]);
      reportedMetrics.length = 0;
    }
  }, 10000); // Report every 10 seconds

  // Report on page unload
  window.addEventListener('pagehide', () => {
    clearInterval(reportInterval);
    if (reportedMetrics.length > 0) {
      reportMetrics(reportedMetrics);
    }
  });
}

/**
 * Measure custom performance metric
 */
export function measurePerformance(name: string, startMark?: string, endMark?: string): number | null {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return null;
  }

  try {
    if (startMark && endMark) {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      return measure?.duration || null;
    }

    // If no marks provided, just return current timestamp
    return performance.now();
  } catch (error) {
    console.warn('Failed to measure performance:', error);
    return null;
  }
}

/**
 * Mark a performance point
 */
export function markPerformance(name: string): void {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return;
  }

  try {
    performance.mark(name);
  } catch (error) {
    console.warn('Failed to mark performance:', error);
  }
}

/**
 * Get navigation timing metrics
 */
export function getNavigationMetrics(): Record<string, number> | null {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return null;
  }

  try {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (!navigation) {
      return null;
    }

    return {
      // DNS lookup time
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      // TCP connection time
      tcp: navigation.connectEnd - navigation.connectStart,
      // SSL/TLS time
      ssl: navigation.secureConnectionStart > 0 
        ? navigation.connectEnd - navigation.secureConnectionStart 
        : 0,
      // Time to First Byte
      ttfb: navigation.responseStart - navigation.requestStart,
      // Response time
      response: navigation.responseEnd - navigation.responseStart,
      // DOM processing time
      domProcessing: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      // Total load time
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      // Total page load time
      total: navigation.loadEventEnd - navigation.fetchStart,
    };
  } catch (error) {
    console.warn('Failed to get navigation metrics:', error);
    return null;
  }
}

/**
 * Get resource timing metrics
 */
export function getResourceMetrics(): Array<{
  name: string;
  type: string;
  duration: number;
  size: number;
}> | null {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return null;
  }

  try {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    return resources.map((resource) => ({
      name: resource.name,
      type: resource.initiatorType,
      duration: resource.duration,
      size: resource.transferSize || 0,
    }));
  } catch (error) {
    console.warn('Failed to get resource metrics:', error);
    return null;
  }
}

/**
 * Monitor long tasks (tasks that block the main thread for >50ms)
 */
export function observeLongTasks(callback: (duration: number) => void): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.duration > 50) {
          callback(entry.duration);
          console.warn('Long task detected:', entry.duration, 'ms');
        }
      });
    });

    observer.observe({ type: 'longtask', buffered: true });
  } catch {
    console.warn('Long task observation not supported');
  }
}

/**
 * Get memory usage (if available)
 */
export function getMemoryUsage(): Record<string, number> | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const performance = (window.performance as any);
  
  if (!performance.memory) {
    return null;
  }

  try {
    return {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      usagePercentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100,
    };
  } catch (error) {
    console.warn('Failed to get memory usage:', error);
    return null;
  }
}

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Observe Web Vitals
  observeWebVitals();

  // Log navigation metrics after load
  window.addEventListener('load', () => {
    setTimeout(() => {
      const navMetrics = getNavigationMetrics();
      if (navMetrics) {
        console.log('Navigation Metrics:', navMetrics);
      }

      const memoryUsage = getMemoryUsage();
      if (memoryUsage) {
        console.log('Memory Usage:', memoryUsage);
      }
    }, 0);
  });

  // Observe long tasks
  observeLongTasks((duration) => {
    // Report long tasks that might affect user experience
    if (duration > 100) {
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'long-task',
          duration,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        }),
        keepalive: true,
      }).catch(console.error);
    }
  });

  console.log('Performance monitoring initialized');
}
