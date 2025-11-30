/**
 * Web Vitals Performance Monitoring
 * 
 * Tracks Core Web Vitals metrics:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay)
 * - CLS (Cumulative Layout Shift)
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 */

export interface WebVitalsMetric {
  id: string
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  navigationType: string
}

// Thresholds for Core Web Vitals
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 }
}

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS]
  if (!threshold) return 'good'
  
  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

/**
 * Report Web Vitals to analytics endpoint
 */
export function reportWebVitals(metric: WebVitalsMetric) {
  const { name, value, rating, id } = metric
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    const color = rating === 'good' ? '🟢' : rating === 'needs-improvement' ? '🟡' : '🔴'
    console.log(`${color} [Web Vitals] ${name}: ${Math.round(value)}ms (${rating})`)
  }
  
  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Use sendBeacon for reliable delivery
    const body = JSON.stringify({
      name,
      value: Math.round(value),
      rating,
      id,
      path: window.location.pathname,
      timestamp: Date.now()
    })
    
    // Navigator.sendBeacon is more reliable for analytics
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/vitals', body)
    } else {
      fetch('/api/analytics/vitals', {
        method: 'POST',
        body,
        keepalive: true
      }).catch(() => {})
    }
  }
}

/**
 * Initialize Web Vitals monitoring
 */
export async function initWebVitals() {
  if (typeof window === 'undefined') return
  
  try {
    // Dynamic import web-vitals (optional dependency)
    const webVitals = await import('web-vitals').catch(() => null)
    
    if (!webVitals) {
      console.log('ℹ️ Web Vitals package not installed, skipping monitoring')
      return
    }
    
    const { onCLS, onLCP, onFCP, onTTFB, onINP } = webVitals
    
    const handleMetric = (name: string) => (metric: WebVitalsMetric) => {
      reportWebVitals({
        ...metric,
        rating: getRating(name, metric.value)
      })
    }
    
    onCLS?.(handleMetric('CLS'))
    onLCP?.(handleMetric('LCP'))
    onFCP?.(handleMetric('FCP'))
    onTTFB?.(handleMetric('TTFB'))
    onINP?.(handleMetric('INP'))
    
    console.log('✅ Web Vitals monitoring initialized')
  } catch {
    console.log('ℹ️ Web Vitals monitoring not available')
  }
}

/**
 * Get performance summary
 */
export function getPerformanceSummary() {
  if (typeof window === 'undefined') return null
  
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  
  if (!navigation) return null
  
  return {
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcp: navigation.connectEnd - navigation.connectStart,
    ttfb: navigation.responseStart - navigation.requestStart,
    download: navigation.responseEnd - navigation.responseStart,
    domParse: navigation.domInteractive - navigation.responseEnd,
    domReady: navigation.domContentLoadedEventEnd - navigation.startTime,
    load: navigation.loadEventEnd - navigation.startTime,
    total: navigation.loadEventEnd - navigation.fetchStart
  }
}
