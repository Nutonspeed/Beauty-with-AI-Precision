/**
 * React Hook for Performance Monitoring
 * Track component render times and performance metrics
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { 
  markPerformance, 
  measurePerformance,
  getMemoryUsage 
} from '@/lib/utils/performance-monitoring';

interface UsePerformanceMonitorOptions {
  componentName: string;
  trackRenders?: boolean;
  trackMemory?: boolean;
  onSlowRender?: (duration: number) => void;
  slowRenderThreshold?: number; // milliseconds
}

interface PerformanceMetrics {
  renderCount: number;
  averageRenderTime: number;
  slowestRender: number;
  fastestRender: number;
  memoryUsage?: ReturnType<typeof getMemoryUsage>;
}

/**
 * Hook to monitor component performance
 */
export function usePerformanceMonitor({
  componentName,
  trackRenders = true,
  trackMemory = false,
  onSlowRender,
  slowRenderThreshold = 16, // 16ms = 60fps
}: UsePerformanceMonitorOptions) {
  const renderCount = useRef(0);
  const renderTimes = useRef<number[]>([]);
  const mountTime = useRef<number>(0);

  useEffect(() => {
    mountTime.current = performance.now();
    
    if (trackRenders) {
      markPerformance(`${componentName}-mount-start`);
    }

    return () => {
      if (trackRenders) {
        markPerformance(`${componentName}-unmount`);
        const mountDuration = measurePerformance(
          `${componentName}-lifecycle`,
          `${componentName}-mount-start`,
          `${componentName}-unmount`
        );

        if (mountDuration) {
          console.log(`${componentName} lifecycle duration:`, mountDuration, 'ms');
        }
      }
    };
  }, [componentName, trackRenders]);

  // Track render performance
  useEffect(() => {
    if (!trackRenders) return;

    const renderStartTime = performance.now();
    renderCount.current += 1;

    // Measure after render completes
    requestIdleCallback(() => {
      const renderDuration = performance.now() - renderStartTime;
      renderTimes.current.push(renderDuration);

      // Keep only last 100 render times
      if (renderTimes.current.length > 100) {
        renderTimes.current.shift();
      }

      // Check for slow renders
      if (onSlowRender && renderDuration > slowRenderThreshold) {
        onSlowRender(renderDuration);
        console.warn(
          `Slow render detected in ${componentName}:`,
          renderDuration.toFixed(2),
          'ms'
        );
      }

      // Log every 10th render
      if (renderCount.current % 10 === 0) {
        const metrics = getMetrics();
        console.log(`${componentName} metrics (${renderCount.current} renders):`, metrics);
      }
    });
  });

  // Track memory usage periodically
  useEffect(() => {
    if (!trackMemory) return;

    const interval = setInterval(() => {
      const memory = getMemoryUsage();
      if (memory && memory.usagePercentage > 80) {
        console.warn(
          `High memory usage in ${componentName}:`,
          memory.usagePercentage.toFixed(2),
          '%'
        );
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [componentName, trackMemory]);

  const getMetrics = useCallback((): PerformanceMetrics => {
    const times = renderTimes.current;
    const avgRenderTime = times.length > 0 
      ? times.reduce((a, b) => a + b, 0) / times.length 
      : 0;

    return {
      renderCount: renderCount.current,
      averageRenderTime: avgRenderTime,
      slowestRender: times.length > 0 ? Math.max(...times) : 0,
      fastestRender: times.length > 0 ? Math.min(...times) : 0,
      memoryUsage: trackMemory ? getMemoryUsage() : undefined,
    };
  }, [trackMemory]);

  const resetMetrics = useCallback(() => {
    renderCount.current = 0;
    renderTimes.current = [];
  }, []);

  return {
    getMetrics,
    resetMetrics,
    renderCount: renderCount.current,
  };
}

/**
 * Hook to measure async operation performance
 */
export function useAsyncPerformance() {
  const measureAsync = useCallback(async <T,>(
    operationName: string,
    operation: () => Promise<T>,
    options?: {
      onSlow?: (duration: number) => void;
      slowThreshold?: number;
    }
  ): Promise<T> => {
    const startMark = `${operationName}-start`;
    const endMark = `${operationName}-end`;

    markPerformance(startMark);
    
    try {
      const result = await operation();
      markPerformance(endMark);
      
      const duration = measurePerformance(operationName, startMark, endMark);
      
      if (duration) {
        console.log(`${operationName} completed in ${duration.toFixed(2)}ms`);
        
        const slowThreshold = options?.slowThreshold || 1000;
        if (duration > slowThreshold && options?.onSlow) {
          options.onSlow(duration);
        }
      }
      
      return result;
    } catch (error) {
      markPerformance(endMark);
      const duration = measurePerformance(operationName, startMark, endMark);
      console.error(`${operationName} failed after ${duration?.toFixed(2)}ms`, error);
      throw error;
    }
  }, []);

  return { measureAsync };
}

/**
 * Hook to track page view performance
 */
export function usePagePerformance(pageName: string) {
  useEffect(() => {
    const markName = `page-${pageName}`;
    markPerformance(`${markName}-view`);

    // Report page view timing
    if (typeof window !== 'undefined' && window.performance) {
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navTiming) {
        const pageLoadTime = navTiming.loadEventEnd - navTiming.fetchStart;
        
        fetch('/api/analytics/performance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'page-view',
            page: pageName,
            loadTime: pageLoadTime,
            url: window.location.href,
            timestamp: new Date().toISOString(),
          }),
          keepalive: true,
        }).catch(console.error);
      }
    }

    return () => {
      markPerformance(`${markName}-leave`);
      const duration = measurePerformance(
        `${markName}-duration`,
        `${markName}-view`,
        `${markName}-leave`
      );
      
      if (duration) {
        console.log(`Time on ${pageName}:`, duration.toFixed(2), 'ms');
      }
    };
  }, [pageName]);
}

/**
 * Hook to track API call performance
 */
export function useApiPerformance() {
  const trackApiCall = useCallback(async <T,>(
    endpoint: string,
    fetchFn: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await fetchFn();
      const duration = performance.now() - startTime;
      
      // Report slow API calls (>2s)
      if (duration > 2000) {
        console.warn(`Slow API call to ${endpoint}:`, duration.toFixed(2), 'ms');
        
        fetch('/api/analytics/performance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'slow-api',
            endpoint,
            duration,
            url: window.location.href,
            timestamp: new Date().toISOString(),
          }),
          keepalive: true,
        }).catch(console.error);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`API call to ${endpoint} failed after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  }, []);

  return { trackApiCall };
}
