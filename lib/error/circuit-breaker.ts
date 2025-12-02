// Circuit Breaker Pattern Implementation

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export interface CircuitBreakerConfig {
  failureThreshold: number
  resetTimeout: number
  monitoringPeriod: number
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED
  private failureCount: number = 0
  private lastFailureTime: number = 0
  private successCount: number = 0

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime >= this.config.resetTimeout) {
        this.state = CircuitState.HALF_OPEN
        this.successCount = 0
      } else {
        throw new Error('Circuit breaker is OPEN')
      }
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.failureCount = 0
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++
      if (this.successCount >= 3) {
        this.state = CircuitState.CLOSED
      }
    }
  }

  private onFailure(): void {
    this.failureCount++
    this.lastFailureTime = Date.now()

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN
    }
  }

  getState(): CircuitState {
    return this.state
  }

  reset(): void {
    this.state = CircuitState.CLOSED
    this.failureCount = 0
    this.lastFailureTime = 0
    this.successCount = 0
  }
}

// Default circuit breaker instance
export const circuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 60000, // 1 minute
  monitoringPeriod: 30000 // 30 seconds
})
