'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface PerformanceMetrics {
  fcp: number | null  // First Contentful Paint
  lcp: number | null  // Largest Contentful Paint
  fid: number | null  // First Input Delay
  cls: number | null  // Cumulative Layout Shift
  ttfb: number | null // Time to First Byte
  memory: number | null
}

/**
 * Performance Monitor - Development Only
 * Shows Core Web Vitals in real-time
 */
export function PerformanceMonitor({ 
  show = process.env.NODE_ENV === 'development' 
}: { 
  show?: boolean 
}) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    memory: null,
  })
  const [minimized, setMinimized] = useState(true)

  useEffect(() => {
    if (!show || typeof window === 'undefined') return

    // Observe performance entries
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
          setMetrics(m => ({ ...m, fcp: entry.startTime }))
        }
        if (entry.entryType === 'largest-contentful-paint') {
          setMetrics(m => ({ ...m, lcp: entry.startTime }))
        }
        if (entry.entryType === 'first-input') {
          const fidEntry = entry as PerformanceEventTiming
          setMetrics(m => ({ ...m, fid: fidEntry.processingStart - fidEntry.startTime }))
        }
        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          setMetrics(m => ({ ...m, cls: (m.cls || 0) + (entry as any).value }))
        }
      }
    })

    try {
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] })
    } catch {
      // Some entry types may not be supported in all browsers
    }

    // TTFB
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navEntry) {
      setMetrics(m => ({ ...m, ttfb: navEntry.responseStart - navEntry.requestStart }))
    }

    // Memory (Chrome only)
    const updateMemory = () => {
      if ((performance as any).memory) {
        setMetrics(m => ({ 
          ...m, 
          memory: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)
        }))
      }
    }
    updateMemory()
    const memoryInterval = setInterval(updateMemory, 5000)

    return () => {
      observer.disconnect()
      clearInterval(memoryInterval)
    }
  }, [show])

  if (!show) return null

  const getColor = (value: number | null, good: number, bad: number) => {
    if (value === null) return 'text-muted-foreground'
    if (value <= good) return 'text-green-500'
    if (value <= bad) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div 
      className={cn(
        'fixed bottom-4 right-4 z-50 font-mono text-xs',
        'bg-black/90 text-white rounded-lg shadow-lg',
        'transition-all duration-200',
        minimized ? 'p-2 cursor-pointer' : 'p-3'
      )}
      onClick={() => minimized && setMinimized(false)}
    >
      {minimized ? (
        <span className="text-green-400">⚡ PERF</span>
      ) : (
        <div className="space-y-1">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold">Performance</span>
            <button 
              onClick={(e) => { e.stopPropagation(); setMinimized(true) }}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span>FCP:</span>
            <span className={getColor(metrics.fcp, 1800, 3000)}>
              {metrics.fcp ? `${Math.round(metrics.fcp)}ms` : '...'}
            </span>
            
            <span>LCP:</span>
            <span className={getColor(metrics.lcp, 2500, 4000)}>
              {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : '...'}
            </span>
            
            <span>FID:</span>
            <span className={getColor(metrics.fid, 100, 300)}>
              {metrics.fid ? `${Math.round(metrics.fid)}ms` : '...'}
            </span>
            
            <span>CLS:</span>
            <span className={getColor(metrics.cls ? metrics.cls * 1000 : null, 100, 250)}>
              {metrics.cls !== null ? metrics.cls.toFixed(3) : '...'}
            </span>
            
            <span>TTFB:</span>
            <span className={getColor(metrics.ttfb, 200, 500)}>
              {metrics.ttfb ? `${Math.round(metrics.ttfb)}ms` : '...'}
            </span>
            
            <span>Memory:</span>
            <span className={getColor(metrics.memory, 50, 100)}>
              {metrics.memory ? `${metrics.memory}MB` : 'N/A'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
