// Advanced Rate Limiting Strategies
import { RateLimitConfig, RateLimitStrategy } from '../algorithms/rate-limiters'

// Predefined rate limit configurations for different use cases
export const RATE_LIMIT_STRATEGIES = {
  // API endpoints
  API_GENERAL: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60,
    strategy: RateLimitStrategy.TOKEN_BUCKET,
    message: 'API rate limit exceeded. Please try again later.'
  },

  API_HEAVY: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30,
    strategy: RateLimitStrategy.LEAKY_BUCKET,
    message: 'Heavy API rate limit exceeded. Please try again later.'
  },

  // Authentication endpoints
  AUTH_LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    strategy: RateLimitStrategy.SLIDING_WINDOW,
    message: 'Too many login attempts. Please try again later.'
  },

  AUTH_REGISTER: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    strategy: RateLimitStrategy.FIXED_WINDOW,
    message: 'Too many registration attempts. Please try again later.'
  },

  AUTH_PASSWORD_RESET: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    strategy: RateLimitStrategy.FIXED_WINDOW,
    message: 'Too many password reset attempts. Please try again later.'
  },

  // File upload endpoints
  UPLOAD_IMAGE: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    strategy: RateLimitStrategy.TOKEN_BUCKET,
    message: 'Image upload limit exceeded. Please try again later.'
  },

  UPLOAD_VIDEO: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    strategy: RateLimitStrategy.FIXED_WINDOW,
    message: 'Video upload limit exceeded. Please try again later.'
  },

  // AI service endpoints
  AI_ANALYSIS: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10,
    strategy: RateLimitStrategy.TOKEN_BUCKET,
    message: 'AI analysis rate limit exceeded. Please try again later.'
  },

  AI_CHAT: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20,
    strategy: RateLimitStrategy.LEAKY_BUCKET,
    message: 'AI chat rate limit exceeded. Please try again later.'
  },

  AI_GENERATION: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5,
    strategy: RateLimitStrategy.FIXED_WINDOW,
    message: 'AI generation rate limit exceeded. Please try again later.'
  },

  // Database operations
  DB_QUERY: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100,
    strategy: RateLimitStrategy.LEAKY_BUCKET,
    message: 'Database query limit exceeded. Please try again later.'
  },

  DB_WRITE: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 50,
    strategy: RateLimitStrategy.TOKEN_BUCKET,
    message: 'Database write limit exceeded. Please try again later.'
  },

  // Email services
  EMAIL_SEND: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    strategy: RateLimitStrategy.FIXED_WINDOW,
    message: 'Email sending limit exceeded. Please try again later.'
  },

  // Search endpoints
  SEARCH_GENERAL: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30,
    strategy: RateLimitStrategy.SLIDING_WINDOW,
    message: 'Search rate limit exceeded. Please try again later.'
  },

  SEARCH_ADVANCED: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10,
    strategy: RateLimitStrategy.TOKEN_BUCKET,
    message: 'Advanced search rate limit exceeded. Please try again later.'
  },

  // WebSocket connections
  WEBSOCKET_CONNECT: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10,
    strategy: RateLimitStrategy.SLIDING_WINDOW,
    message: 'WebSocket connection limit exceeded. Please try again later.'
  },

  // Admin endpoints (stricter limits)
  ADMIN_EXPORT: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    strategy: RateLimitStrategy.FIXED_WINDOW,
    message: 'Export limit exceeded. Please try again later.'
  },

  ADMIN_BULK_OPERATIONS: {
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 3,
    strategy: RateLimitStrategy.FIXED_WINDOW,
    message: 'Bulk operation limit exceeded. Please try again later.'
  }
} as const

// User tier-based rate limits
export const TIERED_RATE_LIMITS = {
  free: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20,
    strategy: RateLimitStrategy.TOKEN_BUCKET,
    message: 'Free tier rate limit exceeded. Upgrade your plan for higher limits.'
  },

  basic: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 50,
    strategy: RateLimitStrategy.TOKEN_BUCKET,
    message: 'Basic tier rate limit exceeded. Please try again later.'
  },

  premium: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100,
    strategy: RateLimitStrategy.LEAKY_BUCKET,
    message: 'Premium tier rate limit exceeded. Please try again later.'
  },

  enterprise: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 500,
    strategy: RateLimitStrategy.LEAKY_BUCKET,
    message: 'Enterprise tier rate limit exceeded. Please try again later.'
  }
} as const

// Geographic-based rate limits
export const GEOGRAPHIC_RATE_LIMITS = {
  // High-risk regions (stricter limits)
  high_risk: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10,
    strategy: RateLimitStrategy.SLIDING_WINDOW,
    message: 'Rate limit exceeded for your region.'
  },

  // Medium-risk regions
  medium_risk: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30,
    strategy: RateLimitStrategy.SLIDING_WINDOW,
    message: 'Rate limit exceeded. Please try again later.'
  },

  // Low-risk regions (standard limits)
  low_risk: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60,
    strategy: RateLimitStrategy.TOKEN_BUCKET,
    message: 'Rate limit exceeded. Please try again later.'
  }
} as const

// Time-based rate limits (business hours vs off hours)
export const TIME_BASED_RATE_LIMITS = {
  business_hours: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100,
    strategy: RateLimitStrategy.TOKEN_BUCKET,
    message: 'Rate limit exceeded during business hours.'
  },

  off_hours: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 50,
    strategy: RateLimitStrategy.SLIDING_WINDOW,
    message: 'Rate limit exceeded during off hours.'
  }
} as const

// Dynamic rate limit calculator
export class DynamicRateLimitCalculator {
  // Calculate rate limit based on multiple factors
  static calculateLimit(baseConfig: RateLimitConfig, factors: {
    userTier?: string
    geographicRisk?: 'high' | 'medium' | 'low'
    timeOfDay?: 'business' | 'off'
    systemLoad?: number
    reputation?: number
  }): RateLimitConfig {
    let config = { ...baseConfig }
    let multiplier = 1

    // Apply tier-based multiplier
    if (factors.userTier) {
      const tierLimits = TIERED_RATE_LIMITS[factors.userTier as keyof typeof TIERED_RATE_LIMITS]
      if (tierLimits) {
        config.max = tierLimits.max
        config.windowMs = tierLimits.windowMs
      }
    }

    // Apply geographic risk multiplier
    if (factors.geographicRisk) {
      const geoLimits = GEOGRAPHIC_RATE_LIMITS[`${factors.geographicRisk}_risk` as keyof typeof GEOGRAPHIC_RATE_LIMITS]
      if (geoLimits) {
        multiplier *= 0.5 // Reduce limits for high-risk regions
      }
    }

    // Apply time-based multiplier
    if (factors.timeOfDay === 'off') {
      multiplier *= 0.7 // Reduce limits during off hours
    }

    // Apply system load multiplier
    if (factors.systemLoad && factors.systemLoad > 0.8) {
      multiplier *= 0.5 // Reduce limits during high load
    }

    // Apply reputation multiplier
    if (factors.reputation !== undefined) {
      if (factors.reputation < 0.3) {
        multiplier *= 0.3 // Significantly reduce for low reputation
      } else if (factors.reputation > 0.8) {
        multiplier *= 1.5 // Increase for high reputation
      }
    }

    // Apply final multiplier
    config.max = Math.floor(config.max * multiplier)
    config.max = Math.max(1, config.max) // Ensure at least 1 request

    return config
  }

  // Get user's geographic risk level
  static getGeographicRisk(ip: string): 'high' | 'medium' | 'low' {
    // This would integrate with a GeoIP service
    // For now, return low as default
    return 'low'
  }

  // Check if current time is business hours
  static isBusinessHours(): boolean {
    const now = new Date()
    const hour = now.getHours()
    const day = now.getDay()
    
    // Business hours: 9 AM - 6 PM, Monday - Friday
    return day >= 1 && day <= 5 && hour >= 9 && hour <= 18
  }

  // Get current system load
  static async getSystemLoad(): Promise<number> {
    // This would integrate with your monitoring system
    // For now, return a mock value
    return 0.5
  }

  // Get user reputation score
  static async getUserReputation(userId: string): Promise<number> {
    // This would calculate based on user behavior
    // For now, return a neutral score
    return 0.7
  }
}

// Rate limit strategy selector
export class RateLimitStrategySelector {
  static selectStrategy(
    endpointType: keyof typeof RATE_LIMIT_STRATEGIES,
    context: {
      userId?: string
      userTier?: string
      ip?: string
      userAgent?: string
    }
  ): RateLimitConfig {
    const baseStrategy = RATE_LIMIT_STRATEGIES[endpointType]
    
    if (!baseStrategy) {
      return RATE_LIMIT_STRATEGIES.API_GENERAL // Default fallback
    }

    // Apply dynamic adjustments
    return DynamicRateLimitCalculator.calculateLimit(baseStrategy, {
      userTier: context.userTier,
      geographicRisk: context.ip ? DynamicRateLimitCalculator.getGeographicRisk(context.ip) : 'low',
      timeOfDay: DynamicRateLimitCalculator.isBusinessHours() ? 'business' : 'off'
    })
  }
}
