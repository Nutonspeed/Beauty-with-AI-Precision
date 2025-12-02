// Staging Environment Configuration
export const stagingConfig = {
  // Application
  NODE_ENV: 'staging',
  PORT: 3000,
  HOST: '0.0.0.0',
  
  // Database
  DATABASE_URL: process.env.STAGING_DATABASE_URL || 'postgresql://staging_user:staging_pass@localhost:5432/beauty_ai_staging',
  SUPABASE_URL: process.env.STAGING_SUPABASE_URL || 'https://your-staging-project.supabase.co',
  SUPABASE_ANON_KEY: process.env.STAGING_SUPABASE_ANON_KEY || 'your-staging-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: process.env.STAGING_SUPABASE_SERVICE_ROLE_KEY || 'your-staging-service-role-key',
  
  // Authentication
  NEXTAUTH_URL: 'https://staging.beauty-with-ai-precision.com',
  NEXTAUTH_SECRET: process.env.STAGING_NEXTAUTH_SECRET || 'staging-secret-key',
  
  // AI Services
  OPENAI_API_KEY: process.env.STAGING_OPENAI_API_KEY,
  ANTHROPIC_API_KEY: process.env.STAGING_ANTHROPIC_API_KEY,
  GOOGLE_CLOUD_VISION_KEY: process.env.STAGING_GOOGLE_CLOUD_VISION_KEY,
  
  // External Services
  REDIS_URL: process.env.STAGING_REDIS_URL,
  ELASTICSEARCH_URL: process.env.STAGING_ELASTICSEARCH_URL,
  
  // Email
  RESEND_API_KEY: process.env.STAGING_RESEND_API_KEY,
  EMAIL_FROM: 'staging@beauty-with-ai-precision.com',
  
  // Analytics & Monitoring
  SENTRY_DSN: process.env.STAGING_SENTRY_DSN,
  VERCEL_ANALYTICS_ID: process.env.STAGING_VERCEL_ANALYTICS_ID,
  
  // Rate Limiting
  RATE_LIMIT_REDIS_URL: process.env.STAGING_REDIS_URL,
  RATE_LIMIT_WINDOW_MS: 60000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 200,
  
  // File Storage
  AWS_ACCESS_KEY_ID: process.env.STAGING_AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.STAGING_AWS_SECRET_ACCESS_KEY,
  AWS_REGION: 'us-east-1',
  S3_BUCKET_NAME: 'beauty-ai-staging-uploads',
  
  // Features
  ENABLE_ANALYTICS: true,
  ENABLE_SECURITY_MONITORING: true,
  ENABLE_RATE_LIMITING: true,
  ENABLE_CACHING: true,
  ENABLE_AI_FEATURES: true,
  
  // Logging
  LOG_LEVEL: 'info',
  LOG_FORMAT: 'json',
  
  // Staging specific
  ENABLE_SWAGGER: true,
  ENABLE_DEBUG_MODE: false,
  ENABLE_MOCK_DATA: false,
  
  // Security
  CORS_ORIGINS: ['https://staging.beauty-with-ai-precision.com'],
  ALLOWED_HOSTS: ['staging.beauty-with-ai-precision.com'],
  
  // Performance
  ENABLE_BUNDLE_ANALYZER: false,
  ENABLE_PERFORMANCE_MONITORING: true,
  
  // Testing
  ENABLE_E2E_TESTS: true,
  TEST_DATABASE_URL: process.env.STAGING_TEST_DATABASE_URL
}

export default stagingConfig
