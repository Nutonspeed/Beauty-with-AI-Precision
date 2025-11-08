export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map()

  static recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)!.push(value)

    // Keep only last 100 measurements
    if (this.metrics.get(name)!.length > 100) {
      this.metrics.get(name)!.shift()
    }
  }

  static getAverage(name: string): number {
    const values = this.metrics.get(name) || []
    if (values.length === 0) return 0
    return values.reduce((a, b) => a + b, 0) / values.length
  }

  static getMetrics() {
    const result: Record<string, any> = {}
    this.metrics.forEach((values, name) => {
      result[name] = {
        average: this.getAverage(name),
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length,
      }
    })
    return result
  }
}

export function measurePerformance<T>(name: string, fn: () => T): T {
  const start = performance.now()
  try {
    return fn()
  } finally {
    const duration = performance.now() - start
    PerformanceMonitor.recordMetric(name, duration)
  }
}

export async function measurePerformanceAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now()
  try {
    return await fn()
  } finally {
    const duration = performance.now() - start
    PerformanceMonitor.recordMetric(name, duration)
  }
}
