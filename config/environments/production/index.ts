// Production Environment Configuration
export const productionConfig = {
  // Application
  NODE_ENV: 'production',
  PORT: 3000,
  HOST: '0.0.0.0',
  
  // Database
  DATABASE_URL: process.env.PRODUCTION_DATABASE_URL || 'postgresql://prod_user:prod_pass@localhost:5432/beauty_ai_prod',
  SUPABASE_URL: process.env.PRODUCTION_SUPABASE_URL || 'https://your-production-project.supabase.co',
  SUPABASE_ANON_KEY: process.env.PRODUCTION_SUPABASE_ANON_KEY || 'your-production-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: process.env.PRODUCTION_SUPABASE_SERVICE_ROLE_KEY || 'your-production-service-role-key',
  
  // Authentication
  NEXTAUTH_URL: 'https://beauty-with-ai-precision.com',
  NEXTAUTH_SECRET: process.env.PRODUCTION_NEXTAUTH_SECRET || 'production-secret-key',
  
  // AI Services
  OPENAI_API_KEY: process.env.PRODUCTION_OPENAI_API_KEY,
  ANTHROPIC_API_KEY: process.env.PRODUCTION_ANTHROPIC_API_KEY,
  GOOGLE_CLOUD_VISION_KEY: process.env.PRODUCTION_GOOGLE_CLOUD_VISION_KEY,
  
  // External Services
  REDIS_URL: process.env.PRODUCTION_REDIS_URL,
  ELASTICSEARCH_URL: process.env.PRODUCTION_ELASTICSEARCH_URL,
  
  // Email
  RESEND_API_KEY: process.env.PRODUCTION_RESEND_API_KEY,
  EMAIL_FROM: 'noreply@beauty-with-ai-precision.com',
  
  // Analytics & Monitoring
  SENTRY_DSN: process.env.PRODUCTION_SENTRY_DSN,
  VERCEL_ANALYTICS_ID: process.env.PRODUCTION_VERCEL_ANALYTICS_ID,
  
  // Rate Limiting
  RATE_LIMIT_REDIS_URL: process.env.PRODUCTION_REDIS_URL,
  RATE_LIMIT_WINDOW_MS: 60000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 500,
  
  // File Storage
  AWS_ACCESS_KEY_ID: process.env.PRODUCTION_AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.PRODUCTION_AWS_SECRET_ACCESS_KEY,
  AWS_REGION: 'us-east-1',
  S3_BUCKET_NAME: 'beauty-ai-production-uploads',
  
  // Features
  ENABLE_ANALYTICS: true,
  ENABLE_SECURITY_MONITORING: true,
  ENABLE_RATE_LIMITING: true,
  ENABLE_CACHING: true,
  ENABLE_AI_FEATURES: true,
  
  // Logging
  LOG_LEVEL: 'warn',
  LOG_FORMAT: 'json',
  
  // Production specific
  ENABLE_SWAGGER: false,
  ENABLE_DEBUG_MODE: false,
  ENABLE_MOCK_DATA: false,
  
  // Security
  CORS_ORIGINS: ['https://beauty-with-ai-precision.com', 'https://www.beauty-with-ai-precision.com'],
  ALLOWED_HOSTS: ['beauty-with-ai-precision.com', 'www.beauty-with-ai-precision.com'],
  
  // Performance
  ENABLE_BUNDLE_ANALYZER: false,
  ENABLE_PERFORMANCE_MONITORING: true,
  
  // Scaling
  ENABLE_CLUSTER_MODE: true,
  ENABLE_LOAD_BALANCER: true,
  
  // Backup & Recovery
  ENABLE_AUTO_BACKUP: true,
  BACKUP_RETENTION_DAYS: 30,
  
  // Compliance
  ENABLE_GDPR_COMPLIANCE: true,
  ENABLE_AUDIT_LOGGING: true,
  
  // Business
  ENABLE_BILLING: true,
  ENABLE_SUBSCRIPTION_MANAGEMENT: true
}

export default productionConfig
