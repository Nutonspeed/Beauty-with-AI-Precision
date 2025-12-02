// Circuit Breaker Pattern for Beauty with AI Precision

// Circuit breaker states
export enum CircuitState {
  CLOSED = 'CLOSED',      // Normal operation
  OPEN = 'OPEN',          // Circuit is open, calls fail immediately
  HALF_OPEN = 'HALF_OPEN' // Testing if service has recovered
}

// Circuit breaker configuration
interface CircuitBreakerConfig {
  failureThreshold: number    // Number of failures before opening
  resetTimeout: number        // Time to wait before trying half-open
  monitoringPeriod: number    // Time window for failure counting
  successThreshold: number    // Successes needed to close circuit in half-open
  timeout: number             // Operation timeout
}

export interface CircuitBreakerOptions {
  failureThreshold?: number
  resetTimeout?: number
  monitoringPeriod?: number
  successThreshold?: number
  timeout?: number
}

export interface CircuitBreakerMetrics {
  state: CircuitState
  failures: number
  successes: number
  totalCalls: number
  lastFailureTime?: number
  lastSuccessTime?: number
  averageResponseTime: number
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED
  private failures: number = 0
  private successes: number = 0
  private totalCalls: number = 0
  private lastFailureTime?: number
  private lastSuccessTime?: number
  private responseTimes: number[] = []
  private failureTimes: number[] = []
  
  private config: CircuitBreakerConfig
  private serviceName: string

  constructor(serviceName: string, config: CircuitBreakerOptions = {}) {
    this.serviceName = serviceName
    this.config = {
      failureThreshold: config.failureThreshold || 5,
      resetTimeout: config.resetTimeout || 60000,    // 1 minute
      monitoringPeriod: config.monitoringPeriod || 300000, // 5 minutes
      successThreshold: config.successThreshold || 3,
      timeout: config.timeout || 30000               // 30 seconds
    }
  }

  // Execute operation with circuit breaker protection
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    const startTime = Date.now()
    
    // Check if circuit is open
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN
        console.log(`Circuit breaker for ${this.serviceName} moving to HALF_OPEN`)
      } else {
        throw new Error(`Circuit breaker for ${this.serviceName} is OPEN`)
      }
    }

    try {
      // Add timeout to operation
      const result = await this.withTimeout(operation(), this.config.timeout)
      
      // Record success
      this.recordSuccess(Date.now() - startTime)
      
      return result
    } catch (error) {
      // Record failure
      this.recordFailure()
      
      throw error
    }
  }

  // Get current circuit state
  getState(): CircuitState {
    return this.state
  }

  // Get circuit metrics
  getMetrics(): CircuitBreakerMetrics {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      totalCalls: this.totalCalls,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      averageResponseTime: this.calculateAverageResponseTime()
    }
  }

  // Reset circuit breaker
  reset(): void {
    this.state = CircuitState.CLOSED
    this.failures = 0
    this.successes = 0
    this.failureTimes = []
    this.responseTimes = []
    console.log(`Circuit breaker for ${this.serviceName} reset to CLOSED`)
  }

  // Force open circuit
  forceOpen(): void {
    this.state = CircuitState.OPEN
    this.lastFailureTime = Date.now()
    console.log(`Circuit breaker for ${this.serviceName} forced OPEN`)
  }

  // Record successful operation
  private recordSuccess(responseTime: number): void {
    this.totalCalls++
    this.successes++
    this.lastSuccessTime = Date.now()
    this.responseTimes.push(responseTime)
    
    // Keep only last 100 response times
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift()
    }
    
    // If in half-open state, check if we should close
    if (this.state === CircuitState.HALF_OPEN) {
      if (this.successes >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED
        this.failures = 0
        console.log(`Circuit breaker for ${this.serviceName} closing after ${this.successes} successes`)
      }
    }
    
    // Clean old failure times
    this.cleanupOldFailures()
  }

  // Record failed operation
  private recordFailure(): void {
    this.totalCalls++
    this.failures++
    this.lastFailureTime = Date.now()
    this.failureTimes.push(Date.now())
    
    // If in closed state, check if we should open
    if (this.state === CircuitState.CLOSED) {
      if (this.failures >= this.config.failureThreshold) {
        this.state = CircuitState.OPEN
        console.log(`Circuit breaker for ${this.serviceName} opening after ${this.failures} failures`)
      }
    }
    
    // If in half-open state, open immediately on failure
    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN
      console.log(`Circuit breaker for ${this.serviceName} opening again in HALF_OPEN state`)
    }
    
    // Clean old failure times
    this.cleanupOldFailures()
  }

  // Check if we should attempt reset
  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return false
    
    const timeSinceLastFailure = Date.now() - this.lastFailureTime
    return timeSinceLastFailure >= this.config.resetTimeout
  }

  // Clean old failure times outside monitoring period
  private cleanupOldFailures(): void {
    const cutoff = Date.now() - this.config.monitoringPeriod
    this.failureTimes = this.failureTimes.filter(time => time > cutoff)
    
    // Update failure count
    this.failures = this.failureTimes.length
  }

  // Calculate average response time
  private calculateAverageResponseTime(): number {
    if (this.responseTimes.length === 0) return 0
    
    const sum = this.responseTimes.reduce((acc, time) => acc + time, 0)
    return sum / this.responseTimes.length
  }

  // Add timeout to operation
  private async withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    })
    
    return Promise.race([operation, timeoutPromise])
  }
}

// Circuit breaker manager for multiple services
export class CircuitBreakerManager {
  private static instance: CircuitBreakerManager
  private circuitBreakers: Map<string, CircuitBreaker> = new Map()

  static getInstance(): CircuitBreakerManager {
    if (!CircuitBreakerManager.instance) {
      CircuitBreakerManager.instance = new CircuitBreakerManager()
    }
    return CircuitBreakerManager.instance
  }

  // Get or create circuit breaker for a service
  getCircuitBreaker(serviceName: string, options?: CircuitBreakerOptions): CircuitBreaker {
    if (!this.circuitBreakers.has(serviceName)) {
      this.circuitBreakers.set(serviceName, new CircuitBreaker(serviceName, options))
    }
    
    return this.circuitBreakers.get(serviceName)!
  }

  // Execute operation with circuit breaker
  async execute<T>(
    operation: () => Promise<T>,
    serviceName: string,
    options?: CircuitBreakerOptions
  ): Promise<T> {
    const circuitBreaker = this.getCircuitBreaker(serviceName, options)
    return circuitBreaker.execute(operation)
  }

  // Get all circuit breaker metrics
  getAllMetrics(): Map<string, CircuitBreakerMetrics> {
    const metrics = new Map<string, CircuitBreakerMetrics>()
    
    this.circuitBreakers.forEach((breaker, serviceName) => {
      metrics.set(serviceName, breaker.getMetrics())
    })
    
    return metrics
  }

  // Reset all circuit breakers
  resetAll(): void {
    this.circuitBreakers.forEach((breaker) => {
      breaker.reset()
    })
  }

  // Get circuit breakers in specific state
  getCircuitBreakersInState(state: CircuitState): string[] {
    const result: string[] = []
    
    this.circuitBreakers.forEach((breaker, serviceName) => {
      if (breaker.getState() === state) {
        result.push(serviceName)
      }
    })
    
    return result
  }
}

// Pre-configured circuit breakers for common services
export class ServiceCircuitBreakers {
  private static manager = CircuitBreakerManager.getInstance()

  // AI Service circuit breaker
  static aiService(operation: () => Promise<any>, serviceName: string): Promise<any> {
    return this.manager.execute(operation, `ai-${serviceName}`, {
      failureThreshold: 3,
      resetTimeout: 30000,    // 30 seconds
      monitoringPeriod: 120000, // 2 minutes
      successThreshold: 2,
      timeout: 15000          // 15 seconds
    })
  }

  // Database circuit breaker
  static database(operation: () => Promise<any>): Promise<any> {
    return this.manager.execute(operation, 'database', {
      failureThreshold: 5,
      resetTimeout: 10000,    // 10 seconds
      monitoringPeriod: 60000, // 1 minute
      successThreshold: 3,
      timeout: 5000           // 5 seconds
    })
  }

  // External API circuit breaker
  static externalAPI(operation: () => Promise<any>, apiName: string): Promise<any> {
    return this.manager.execute(operation, `api-${apiName}`, {
      failureThreshold: 4,
      resetTimeout: 60000,    // 1 minute
      monitoringPeriod: 300000, // 5 minutes
      successThreshold: 3,
      timeout: 10000          // 10 seconds
    })
  }

  // Redis circuit breaker
  static redis(operation: () => Promise<any>): Promise<any> {
    return this.manager.execute(operation, 'redis', {
      failureThreshold: 3,
      resetTimeout: 5000,     // 5 seconds
      monitoringPeriod: 30000, // 30 seconds
      successThreshold: 2,
      timeout: 2000           // 2 seconds
    })
  }
}

// Export singleton instance
export const circuitBreakerManager = CircuitBreakerManager.getInstance()
