// Development Environment Configuration
export const developmentConfig = {
  // Application
  NODE_ENV: 'development',
  PORT: 3000,
  HOST: 'localhost',
  
  // Database
  DATABASE_URL: process.env.DEV_DATABASE_URL || 'postgresql://dev_user:dev_pass@localhost:5432/beauty_ai_dev',
  SUPABASE_URL: process.env.DEV_SUPABASE_URL || 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: process.env.DEV_SUPABASE_ANON_KEY || 'your-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: process.env.DEV_SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key',
  
  // Authentication
  NEXTAUTH_URL: 'http://localhost:3000',
  NEXTAUTH_SECRET: process.env.DEV_NEXTAUTH_SECRET || 'development-secret-key',
  
  // AI Services
  OPENAI_API_KEY: process.env.DEV_OPENAI_API_KEY,
  ANTHROPIC_API_KEY: process.env.DEV_ANTHROPIC_API_KEY,
  GOOGLE_CLOUD_VISION_KEY: process.env.DEV_GOOGLE_CLOUD_VISION_KEY,
  
  // External Services
  REDIS_URL: process.env.DEV_REDIS_URL || 'redis://localhost:6379',
  ELASTICSEARCH_URL: process.env.DEV_ELASTICSEARCH_URL || 'http://localhost:9200',
  
  // Email
  RESEND_API_KEY: process.env.DEV_RESEND_API_KEY,
  EMAIL_FROM: 'dev@beauty-with-ai-precision.com',
  
  // Analytics & Monitoring
  SENTRY_DSN: process.env.DEV_SENTRY_DSN,
  VERCEL_ANALYTICS_ID: process.env.DEV_VERCEL_ANALYTICS_ID,
  
  // Rate Limiting
  RATE_LIMIT_REDIS_URL: process.env.DEV_REDIS_URL,
  RATE_LIMIT_WINDOW_MS: 60000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 100,
  
  // File Storage
  AWS_ACCESS_KEY_ID: process.env.DEV_AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.DEV_AWS_SECRET_ACCESS_KEY,
  AWS_REGION: 'us-east-1',
  S3_BUCKET_NAME: 'beauty-ai-dev-uploads',
  
  // Features
  ENABLE_ANALYTICS: true,
  ENABLE_SECURITY_MONITORING: true,
  ENABLE_RATE_LIMITING: true,
  ENABLE_CACHING: true,
  ENABLE_AI_FEATURES: true,
  
  // Logging
  LOG_LEVEL: 'debug',
  LOG_FORMAT: 'dev',
  
  // Development specific
  ENABLE_SWAGGER: true,
  ENABLE_DEBUG_MODE: true,
  ENABLE_MOCK_DATA: false,
  
  // Security
  CORS_ORIGINS: ['http://localhost:3000', 'http://localhost:3001'],
  ALLOWED_HOSTS: ['localhost', '127.0.0.1']
}

export default developmentConfig
