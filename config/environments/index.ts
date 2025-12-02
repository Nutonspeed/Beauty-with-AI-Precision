// Environment Configuration Loader
import developmentConfig from './development'
import stagingConfig from './staging'
import productionConfig from './production'

export type Environment = 'development' | 'staging' | 'production'

export interface Config {
  // Application
  NODE_ENV: string
  PORT: number
  HOST: string
  
  // Database
  DATABASE_URL: string
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  
  // Authentication
  NEXTAUTH_URL: string
  NEXTAUTH_SECRET: string
  
  // AI Services
  OPENAI_API_KEY?: string
  ANTHROPIC_API_KEY?: string
  GOOGLE_CLOUD_VISION_KEY?: string
  
  // External Services
  REDIS_URL?: string
  ELASTICSEARCH_URL?: string
  
  // Email
  RESEND_API_KEY?: string
  EMAIL_FROM: string
  
  // Analytics & Monitoring
  SENTRY_DSN?: string
  VERCEL_ANALYTICS_ID?: string
  
  // Rate Limiting
  RATE_LIMIT_REDIS_URL?: string
  RATE_LIMIT_WINDOW_MS: number
  RATE_LIMIT_MAX_REQUESTS: number
  
  // File Storage
  AWS_ACCESS_KEY_ID?: string
  AWS_SECRET_ACCESS_KEY?: string
  AWS_REGION: string
  S3_BUCKET_NAME: string
  
  // Features
  ENABLE_ANALYTICS: boolean
  ENABLE_SECURITY_MONITORING: boolean
  ENABLE_RATE_LIMITING: boolean
  ENABLE_CACHING: boolean
  ENABLE_AI_FEATURES: boolean
  
  // Logging
  LOG_LEVEL: string
  LOG_FORMAT: string
  
  // Development specific
  ENABLE_SWAGGER: boolean
  ENABLE_DEBUG_MODE: boolean
  ENABLE_MOCK_DATA: boolean
  
  // Security
  CORS_ORIGINS: string[]
  ALLOWED_HOSTS: string[]
  
  // Performance
  ENABLE_BUNDLE_ANALYZER?: boolean
  ENABLE_PERFORMANCE_MONITORING?: boolean
  
  // Production specific
  ENABLE_CLUSTER_MODE?: boolean
  ENABLE_LOAD_BALANCER?: boolean
  ENABLE_AUTO_BACKUP?: boolean
  BACKUP_RETENTION_DAYS?: number
  ENABLE_GDPR_COMPLIANCE?: boolean
  ENABLE_AUDIT_LOGGING?: boolean
  ENABLE_BILLING?: boolean
  ENABLE_SUBSCRIPTION_MANAGEMENT?: boolean
}

function getConfig(): Config {
  const env = process.env.NODE_ENV as Environment || 'development'
  
  switch (env) {
    case 'development':
      return developmentConfig
    case 'staging':
      return stagingConfig
    case 'production':
      return productionConfig
    default:
      throw new Error(`Unknown environment: ${env}`)
  }
}

export const config = getConfig()

// Environment validation
export function validateConfig(): void {
  const requiredFields = [
    'NODE_ENV',
    'DATABASE_URL',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET'
  ]
  
  const missing = requiredFields.filter(field => !config[field as keyof Config])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

// Environment helpers
export function isDevelopment(): boolean {
  return config.NODE_ENV === 'development'
}

export function isStaging(): boolean {
  return config.NODE_ENV === 'staging'
}

export function isProduction(): boolean {
  return config.NODE_ENV === 'production'
}

export function isTest(): boolean {
  return config.NODE_ENV === 'test'
}

export function getEnvironment(): Environment {
  return config.NODE_ENV as Environment
}

export function getEnvironmentUrl(): string {
  return config.NEXTAUTH_URL
}

export function getDatabaseUrl(): string {
  return config.DATABASE_URL
}

export function getSupabaseConfig() {
  return {
    url: config.SUPABASE_URL,
    anonKey: config.SUPABASE_ANON_KEY,
    serviceRoleKey: config.SUPABASE_SERVICE_ROLE_KEY
  }
}

export function getRedisConfig() {
  return config.REDIS_URL ? {
    url: config.REDIS_URL,
    enabled: true
  } : {
    enabled: false
  }
}

export function getRateLimitConfig() {
  return {
    enabled: config.ENABLE_RATE_LIMITING,
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    maxRequests: config.RATE_LIMIT_MAX_REQUESTS,
    redisUrl: config.RATE_LIMIT_REDIS_URL
  }
}

export function getFeatureFlags() {
  return {
    analytics: config.ENABLE_ANALYTICS,
    securityMonitoring: config.ENABLE_SECURITY_MONITORING,
    rateLimiting: config.ENABLE_RATE_LIMITING,
    caching: config.ENABLE_CACHING,
    aiFeatures: config.ENABLE_AI_FEATURES,
    swagger: config.ENABLE_SWAGGER,
    debugMode: config.ENABLE_DEBUG_MODE,
    mockData: config.ENABLE_MOCK_DATA
  }
}

export default config
