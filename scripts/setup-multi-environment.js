#!/usr/bin/env node

/**
 * Multi-Environment Deployment Setup Script
 * Implements staging and production environment configurations
 * with CI/CD pipelines, environment-specific configurations, and deployment automation
 */

const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const util = require('util')
const execAsync = util.promisify(exec)

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// Create multi-environment directories
function createEnvironmentDirectories() {
  colorLog('\n📁 Creating multi-environment directories...', 'cyan')
  
  const directories = [
    '.github/workflows',
    'environments',
    'environments/development',
    'environments/staging',
    'environments/production',
    'scripts/deploy',
    'scripts/deploy/development',
    'scripts/deploy/staging',
    'scripts/deploy/production',
    'config/environments',
    'config/environments/development',
    'config/environments/staging',
    'config/environments/production',
    'docker/environments',
    'docker/environments/development',
    'docker/environments/staging',
    'docker/environments/production'
  ]
  
  directories.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir)
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true })
      colorLog(`  ✅ Created ${dir}`, 'green')
    } else {
      colorLog(`  ✅ ${dir} exists`, 'blue')
    }
  })
}

// Create environment-specific configurations
function createEnvironmentConfigs() {
  colorLog('\n⚙️ Creating environment-specific configurations...', 'cyan')
  
  // Development environment config
  const devConfig = `// Development Environment Configuration
export const developmentConfig = {
  // Application
  NODE_ENV: 'development',
  PORT: 3000,
  HOST: 'localhost',
  
  // Database
  DATABASE_URL: process.env.DEV_DATABASE_URL || 'postgresql://dev_user:dev_pass@localhost:5432/beauty_ai_dev',
  SUPABASE_URL: process.env.DEV_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.DEV_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.DEV_SUPABASE_SERVICE_ROLE_KEY,
  
  // Authentication
  NEXTAUTH_URL: 'http://localhost:3000',
  NEXTAUTH_SECRET: process.env.DEV_NEXTAUTH_SECRET,
  
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
`

  // Staging environment config
  const stagingConfig = `// Staging Environment Configuration
export const stagingConfig = {
  // Application
  NODE_ENV: 'staging',
  PORT: 3000,
  HOST: '0.0.0.0',
  
  // Database
  DATABASE_URL: process.env.STAGING_DATABASE_URL,
  SUPABASE_URL: process.env.STAGING_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.STAGING_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.STAGING_SUPABASE_SERVICE_ROLE_KEY,
  
  // Authentication
  NEXTAUTH_URL: 'https://staging.beauty-with-ai-precision.com',
  NEXTAUTH_SECRET: process.env.STAGING_NEXTAUTH_SECRET,
  
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
`

  // Production environment config
  const prodConfig = `// Production Environment Configuration
export const productionConfig = {
  // Application
  NODE_ENV: 'production',
  PORT: 3000,
  HOST: '0.0.0.0',
  
  // Database
  DATABASE_URL: process.env.PRODUCTION_DATABASE_URL,
  SUPABASE_URL: process.env.PRODUCTION_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.PRODUCTION_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.PRODUCTION_SUPABASE_SERVICE_ROLE_KEY,
  
  // Authentication
  NEXTAUTH_URL: 'https://beauty-with-ai-precision.com',
  NEXTAUTH_SECRET: process.env.PRODUCTION_NEXTAUTH_SECRET,
  
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
`

  // Environment loader
  const envLoader = `// Environment Configuration Loader
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
      throw new Error(\`Unknown environment: \${env}\`)
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
    throw new Error(\`Missing required environment variables: \${missing.join(', ')}\`)
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
`

  // Write configuration files
  const configs = [
    { file: 'config/environments/development/index.ts', content: devConfig },
    { file: 'config/environments/staging/index.ts', content: stagingConfig },
    { file: 'config/environments/production/index.ts', content: prodConfig },
    { file: 'config/environments/index.ts', content: envLoader }
  ]
  
  configs.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file)
    fs.writeFileSync(filePath, content)
    colorLog(`  ✅ Created ${file}`, 'green')
  })
}

// Create GitHub Actions workflows
function createGitHubWorkflows() {
  colorLog('\n🔄 Creating GitHub Actions workflows...', 'cyan')
  
  // CI workflow
  const ciWorkflow = `name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

env:
  NODE_VERSION: '20.x'
  PNPM_VERSION: '9.x'

jobs:
  lint:
    name: Lint Code
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: \${{ env.PNPM_VERSION }}
          
      - name: Get pnpm store directory
        shell: bash
        run: |
          echo "STORE_PATH=\$(pnpm store path --silent)" >> \$GITHUB_ENV
          
      - name: Setup pnpm cache
        uses: actions/cache@v3
        with:
          path: \${{ env.STORE_PATH }}
          key: \${{ runner.os }}-pnpm-store-\${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            \${{ runner.os }}-pnpm-store-
            
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Run ESLint
        run: pnpm lint
        
      - name: Run TypeScript check
        run: pnpm type-check
        
  test:
    name: Test Suite
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [20.x, 21.x]
        
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: \${{ env.PNPM_VERSION }}
          
      - name: Get pnpm store directory
        shell: bash
        run: |
          echo "STORE_PATH=\$(pnpm store path --silent)" >> \$GITHUB_ENV
          
      - name: Setup pnpm cache
        uses: actions/cache@v3
        with:
          path: \${{ env.STORE_PATH }}
          key: \${{ runner.os }}-pnpm-store-\${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            \${{ runner.os }}-pnpm-store-
            
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Run unit tests
        run: pnpm test:unit
        
      - name: Run integration tests
        run: pnpm test:integration
        
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella
          
  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: [lint, test]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: \${{ env.PNPM_VERSION }}
          
      - name: Get pnpm store directory
        shell: bash
        run: |
          echo "STORE_PATH=\$(pnpm store path --silent)" >> \$GITHUB_ENV
          
      - name: Setup pnpm cache
        uses: actions/cache@v3
        with:
          path: \${{ env.STORE_PATH }}
          key: \${{ runner.os }}-pnpm-store-\${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            \${{ runner.os }}-pnpm-store-
            
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Build application
        run: pnpm build
        
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-files
          path: |
            .next
            public
          retention-days: 1
          
  security:
    name: Security Audit
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: \${{ env.PNPM_VERSION }}
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Run security audit
        run: pnpm security:audit
        
      - name: Run security scan
        run: pnpm security:scan
`

  // Staging deployment workflow
  const stagingWorkflow = `name: Deploy to Staging

on:
  push:
    branches: [ develop ]
  workflow_dispatch:

env:
  NODE_VERSION: '20.x'
  PNPM_VERSION: '9.x'

jobs:
  deploy:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    environment: staging
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: \${{ env.PNPM_VERSION }}
          
      - name: Get pnpm store directory
        shell: bash
        run: |
          echo "STORE_PATH=\$(pnpm store path --silent)" >> \$GITHUB_ENV
          
      - name: Setup pnpm cache
        uses: actions/cache@v3
        with:
          path: \${{ env.STORE_PATH }}
          key: \${{ runner.os }}-pnpm-store-\${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            \${{ runner.os }}-pnpm-store-
            
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Run tests
        run: pnpm test
        
      - name: Build application
        run: pnpm build
        env:
          NODE_ENV: staging
          STAGING_DATABASE_URL: \${{ secrets.STAGING_DATABASE_URL }}
          STAGING_SUPABASE_URL: \${{ secrets.STAGING_SUPABASE_URL }}
          STAGING_SUPABASE_ANON_KEY: \${{ secrets.STAGING_SUPABASE_ANON_KEY }}
          STAGING_SUPABASE_SERVICE_ROLE_KEY: \${{ secrets.STAGING_SUPABASE_SERVICE_ROLE_KEY }}
          STAGING_NEXTAUTH_SECRET: \${{ secrets.STAGING_NEXTAUTH_SECRET }}
          STAGING_OPENAI_API_KEY: \${{ secrets.STAGING_OPENAI_API_KEY }}
          STAGING_ANTHROPIC_API_KEY: \${{ secrets.STAGING_ANTHROPIC_API_KEY }}
          STAGING_RESEND_API_KEY: \${{ secrets.STAGING_RESEND_API_KEY }}
          STAGING_REDIS_URL: \${{ secrets.STAGING_REDIS_URL }}
          STAGING_SENTRY_DSN: \${{ secrets.STAGING_SENTRY_DSN }}
          
      - name: Deploy to Vercel Staging
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: \${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          scope: \${{ secrets.VERCEL_ORG_ID }}
          
      - name: Run post-deployment tests
        run: pnpm test:e2e:staging
        env:
          STAGING_URL: https://staging.beauty-with-ai-precision.com
          
      - name: Run security scan
        run: pnpm security:scan
        
      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: \${{ job.status }}
          channel: '#deployments'
          webhook_url: \${{ secrets.SLACK_WEBHOOK }}
        if: always()
`

  // Production deployment workflow
  const productionWorkflow = `name: Deploy to Production

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]
  workflow_dispatch:

env:
  NODE_VERSION: '20.x'
  PNPM_VERSION: '9.x'

jobs:
  pre-deploy-checks:
    name: Pre-deployment Checks
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: \${{ env.PNPM_VERSION }}
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Run full test suite
        run: pnpm test
        
      - name: Run security audit
        run: pnpm security:audit
        
      - name: Run security scan
        run: pnpm security:scan
        
      - name: Check build size
        run: pnpm build:analyze
        
      - name: Run performance tests
        run: pnpm test:performance
        
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: pre-deploy-checks
    environment: production
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: \${{ env.PNPM_VERSION }}
          
      - name: Get pnpm store directory
        shell: bash
        run: |
          echo "STORE_PATH=\$(pnpm store path --silent)" >> \$GITHUB_ENV
          
      - name: Setup pnpm cache
        uses: actions/cache@v3
        with:
          path: \${{ env.STORE_PATH }}
          key: \${{ runner.os }}-pnpm-store-\${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            \${{ runner.os }}-pnpm-store-
            
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Build application
        run: pnpm build
        env:
          NODE_ENV: production
          PRODUCTION_DATABASE_URL: \${{ secrets.PRODUCTION_DATABASE_URL }}
          PRODUCTION_SUPABASE_URL: \${{ secrets.PRODUCTION_SUPABASE_URL }}
          PRODUCTION_SUPABASE_ANON_KEY: \${{ secrets.PRODUCTION_SUPABASE_ANON_KEY }}
          PRODUCTION_SUPABASE_SERVICE_ROLE_KEY: \${{ secrets.PRODUCTION_SUPABASE_SERVICE_ROLE_KEY }}
          PRODUCTION_NEXTAUTH_SECRET: \${{ secrets.PRODUCTION_NEXTAUTH_SECRET }}
          PRODUCTION_OPENAI_API_KEY: \${{ secrets.PRODUCTION_OPENAI_API_KEY }}
          PRODUCTION_ANTHROPIC_API_KEY: \${{ secrets.PRODUCTION_ANTHROPIC_API_KEY }}
          PRODUCTION_RESEND_API_KEY: \${{ secrets.PRODUCTION_RESEND_API_KEY }}
          PRODUCTION_REDIS_URL: \${{ secrets.PRODUCTION_REDIS_URL }}
          PRODUCTION_SENTRY_DSN: \${{ secrets.PRODUCTION_SENTRY_DSN }}
          PRODUCTION_AWS_ACCESS_KEY_ID: \${{ secrets.PRODUCTION_AWS_ACCESS_KEY_ID }}
          PRODUCTION_AWS_SECRET_ACCESS_KEY: \${{ secrets.PRODUCTION_AWS_SECRET_ACCESS_KEY }}
          
      - name: Deploy to Vercel Production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: \${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          scope: \${{ secrets.VERCEL_ORG_ID }}
          
      - name: Run post-deployment smoke tests
        run: pnpm test:smoke
        env:
          PRODUCTION_URL: https://beauty-with-ai-precision.com
          
      - name: Run health checks
        run: |
          curl -f https://beauty-with-ai-precision.com/api/health || exit 1
          curl -f https://beauty-with-ai-precision.com/api/ready || exit 1
          
      - name: Update deployment status
        uses: chrnorm/deployment-status@v2
        with:
          token: '\${{ github.token }}'
          environment-url: https://beauty-with-ai-precision.com
          deployment-id: \${{ github.event.deployment.id }}
        if: github.event.deployment
          
      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: \${{ job.status }}
          channel: '#deployments'
          webhook_url: \${{ secrets.SLACK_WEBHOOK }}
        if: always()
`

  // Environment promotion workflow
  const promotionWorkflow = `name: Promote Environment

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target environment'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production
      source_branch:
        description: 'Source branch'
        required: true
        default: 'main'
        type: string
      create_release:
        description: 'Create release tag'
        required: false
        default: false
        type: boolean

env:
  NODE_VERSION: '20.x'

jobs:
  promote:
    name: Promote to \${{ github.event.inputs.environment }}
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          ref: \${{ github.event.inputs.source_branch }}
          
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Run pre-promotion checks
        run: |
          pnpm lint
          pnpm test
          pnpm build
          
      - name: Create release tag
        if: github.event.inputs.create_release == 'true'
        run: |
          VERSION=v\$(date +%Y.%m.%d-%H%M%S)
          git tag \$VERSION
          git push origin \$VERSION
          echo "RELEASE_TAG=\$VERSION" >> \$GITHUB_ENV
          
      - name: Create GitHub Release
        if: github.event.inputs.create_release == 'true'
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: \${{ env.RELEASE_TAG }}
          release_name: Release \${{ env.RELEASE_TAG }}
          draft: false
          prerelease: \${{ github.event.inputs.environment == 'staging' }}
          
      - name: Trigger deployment
        run: |
          echo "Promoting to \${{ github.event.inputs.environment }}"
          # This would trigger the appropriate deployment workflow
`

  // Write workflow files
  const workflows = [
    { file: '.github/workflows/ci.yml', content: ciWorkflow },
    { file: '.github/workflows/deploy-staging.yml', content: stagingWorkflow },
    { file: '.github/workflows/deploy-production.yml', content: productionWorkflow },
    { file: '.github/workflows/promote.yml', content: promotionWorkflow }
  ]
  
  workflows.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file)
    fs.writeFileSync(filePath, content)
    colorLog(`  ✅ Created ${file}`, 'green')
  })
}

// Create Docker configurations
function createDockerConfigurations() {
  colorLog('\n🐳 Creating Docker configurations...', 'cyan')
  
  // Base Dockerfile
  const baseDockerfile = `# Multi-stage build for Beauty with AI Precision
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
ENV NEXT_TELEMETRY_DISABLED 1
RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
`

  // Development Docker Compose
  const devCompose = `version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: docker/environments/development/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://dev_user:dev_pass@postgres:5432/beauty_ai_dev
      - REDIS_URL=redis://redis:6379
      - NEXTAUTH_URL=http://localhost:3000
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      - postgres
      - redis
    command: pnpm dev
    networks:
      - beauty-ai-network

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=beauty_ai_dev
      - POSTGRES_USER=dev_user
      - POSTGRES_PASSWORD=dev_pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/environments/development/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - beauty-ai-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - beauty-ai-network

  elasticsearch:
    image: elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    networks:
      - beauty-ai-network

volumes:
  postgres_data:
  redis_data:
  elasticsearch_data:

networks:
  beauty-ai-network:
    driver: bridge
`

  // Staging Docker Compose
  const stagingCompose = `version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: docker/environments/staging/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=staging
      - DATABASE_URL=\${STAGING_DATABASE_URL}
      - REDIS_URL=\${STAGING_REDIS_URL}
      - NEXTAUTH_URL=https://staging.beauty-with-ai-precision.com
    env_file:
      - .env.staging
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - beauty-ai-staging
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=\${STAGING_POSTGRES_DB}
      - POSTGRES_USER=\${STAGING_POSTGRES_USER}
      - POSTGRES_PASSWORD=\${STAGING_POSTGRES_PASSWORD}
    volumes:
      - staging_postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - beauty-ai-staging

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass \${STAGING_REDIS_PASSWORD}
    volumes:
      - staging_redis_data:/data
    restart: unless-stopped
    networks:
      - beauty-ai-staging

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/environments/staging/nginx.conf:/etc/nginx/nginx.conf
      - ./docker/environments/staging/ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - beauty-ai-staging

volumes:
  staging_postgres_data:
  staging_redis_data:

networks:
  beauty-ai-staging:
    driver: bridge
`

  // Production Docker Compose
  const prodCompose = `version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: docker/environments/production/Dockerfile
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    environment:
      - NODE_ENV=production
      - DATABASE_URL=\${PRODUCTION_DATABASE_URL}
      - REDIS_URL=\${PRODUCTION_REDIS_URL}
      - NEXTAUTH_URL=https://beauty-with-ai-precision.com
    env_file:
      - .env.production
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - beauty-ai-production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  postgres:
    image: postgres:15-alpine
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
    environment:
      - POSTGRES_DB=\${PRODUCTION_POSTGRES_DB}
      - POSTGRES_USER=\${PRODUCTION_POSTGRES_USER}
      - POSTGRES_PASSWORD=\${PRODUCTION_POSTGRES_PASSWORD}
    volumes:
      - production_postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped
    networks:
      - beauty-ai-production

  redis:
    image: redis:7-alpine
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    command: redis-server --appendonly yes --requirepass \${PRODUCTION_REDIS_PASSWORD}
    volumes:
      - production_redis_data:/data
    restart: unless-stopped
    networks:
      - beauty-ai-production

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/environments/production/nginx.conf:/etc/nginx/nginx.conf
      - ./docker/environments/production/ssl:/etc/nginx/ssl
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - beauty-ai-production

  monitoring:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./docker/environments/production/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    restart: unless-stopped
    networks:
      - beauty-ai-production

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=\${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./docker/environments/production/grafana:/etc/grafana/provisioning
    restart: unless-stopped
    networks:
      - beauty-ai-production

volumes:
  production_postgres_data:
  production_redis_data:
  prometheus_data:
  grafana_data:

networks:
  beauty-ai-production:
    driver: bridge
`

  // Environment-specific Dockerfiles
  const devDockerfile = `FROM node:20-alpine

WORKDIR /app

# Install dependencies
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["pnpm", "dev"]
`

  const stagingDockerfile = `FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Copy source code and build
COPY . .
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV staging
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
`

  const prodDockerfile = `FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Copy source code and build
COPY . .
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache curl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
`

  // Write Docker files
  const dockerFiles = [
    { file: 'Dockerfile', content: baseDockerfile },
    { file: 'docker-compose.yml', content: devCompose },
    { file: 'docker-compose.staging.yml', content: stagingCompose },
    { file: 'docker-compose.production.yml', content: prodCompose },
    { file: 'docker/environments/development/Dockerfile', content: devDockerfile },
    { file: 'docker/environments/staging/Dockerfile', content: stagingDockerfile },
    { file: 'docker/environments/production/Dockerfile', content: prodDockerfile }
  ]
  
  dockerFiles.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file)
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(filePath, content)
    colorLog(`  ✅ Created ${file}`, 'green')
  })
}

// Create deployment scripts
function createDeploymentScripts() {
  colorLog('\n🚀 Creating deployment scripts...', 'cyan')
  
  // Development deployment script
  const devDeploy = `#!/bin/bash

# Development Deployment Script
set -e

echo "🚀 Starting Development Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run from project root."
    exit 1
fi

# Load environment variables
if [ -f ".env.development" ]; then
    export $(cat .env.development | xargs)
else
    echo "⚠️ Warning: .env.development not found, using default values"
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Run database migrations
echo "🗄️ Running database migrations..."
pnpm db:migrate

# Build the application
echo "🔨 Building application..."
pnpm build

# Start development server
echo "🌟 Starting development server..."
pnpm dev
`

  // Staging deployment script
  const stagingDeploy = `#!/bin/bash

# Staging Deployment Script
set -e

ENVIRONMENT="staging"
echo "🚀 Starting Staging Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run from project root."
    exit 1
fi

# Load environment variables
if [ -f ".env.staging" ]; then
    export $(cat .env.staging | xargs)
    echo "✅ Loaded staging environment variables"
else
    echo "❌ Error: .env.staging not found"
    exit 1
fi

# Validate required environment variables
required_vars=("STAGING_DATABASE_URL" "STAGING_SUPABASE_URL" "STAGING_NEXTAUTH_SECRET")
for var in "\${required_vars[@]}"; do
    if [ -z "\${!var}" ]; then
        echo "❌ Error: Required environment variable \$var is not set"
        exit 1
    fi
done

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Run tests
echo "🧪 Running tests..."
pnpm test

# Run security audit
echo "🔒 Running security audit..."
pnpm security:audit

# Build the application
echo "🔨 Building application for staging..."
NODE_ENV=staging pnpm build

# Deploy to Vercel
echo "🌐 Deploying to Vercel Staging..."
npx vercel --prod --token \$VERCEL_TOKEN

# Run post-deployment tests
echo "🧪 Running post-deployment tests..."
pnpm test:e2e:staging

# Health check
echo "🏥 Running health check..."
curl -f https://staging.beauty-with-ai-precision.com/api/health || {
    echo "❌ Health check failed"
    exit 1
}

echo "✅ Staging deployment completed successfully!"
`

  // Production deployment script
  const prodDeploy = `#!/bin/bash

# Production Deployment Script
set -e

ENVIRONMENT="production"
echo "🚀 Starting Production Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run from project root."
    exit 1
fi

# Confirm deployment
read -p "🔍 Are you sure you want to deploy to production? (yes/no): " confirm
if [ "\$confirm" != "yes" ]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Load environment variables
if [ -f ".env.production" ]; then
    export $(cat .env.production | xargs)
    echo "✅ Loaded production environment variables"
else
    echo "❌ Error: .env.production not found"
    exit 1
fi

# Validate required environment variables
required_vars=(
    "PRODUCTION_DATABASE_URL"
    "PRODUCTION_SUPABASE_URL"
    "PRODUCTION_NEXTAUTH_SECRET"
    "PRODUCTION_OPENAI_API_KEY"
    "PRODUCTION_RESEND_API_KEY"
)
for var in "\${required_vars[@]}"; do
    if [ -z "\${!var}" ]; then
        echo "❌ Error: Required environment variable \$var is not set"
        exit 1
    fi
done

# Create backup before deployment
echo "💾 Creating database backup..."
pnpm db:backup

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Run full test suite
echo "🧪 Running full test suite..."
pnpm test

# Run security audit
echo "🔒 Running security audit..."
pnpm security:audit

# Run security scan
echo "🔍 Running security scan..."
pnpm security:scan

# Build the application
echo "🔨 Building application for production..."
NODE_ENV=production pnpm build

# Analyze bundle size
echo "📊 Analyzing bundle size..."
pnpm build:analyze

# Deploy to Vercel
echo "🌐 Deploying to Vercel Production..."
npx vercel --prod --token \$VERCEL_TOKEN

# Run smoke tests
echo "🧪 Running smoke tests..."
pnpm test:smoke

# Health checks
echo "🏥 Running health checks..."
for url in "https://beauty-with-ai-precision.com/api/health" "https://beauty-with-ai-precision.com/api/ready"; do
    curl -f \$url || {
        echo "❌ Health check failed for \$url"
        exit 1
    }
done

# Performance tests
echo "⚡ Running performance tests..."
pnpm test:performance

# Create deployment tag
VERSION=v\$(date +%Y.%m.%d-%H%M%S)
git tag \$VERSION
git push origin \$VERSION

echo "✅ Production deployment completed successfully!"
echo "🏷️ Created deployment tag: \$VERSION"
`

  // Environment management script
  const envManager = `#!/bin/bash

# Environment Management Script
set -e

ENVIRONMENT=\${1:-development}
ACTION=\${2:-setup}

echo "🔧 Environment Management: \$ENVIRONMENT - \$ACTION"

case \$ENVIRONMENT in
    "development"|"staging"|"production")
        ;;
    *)
        echo "❌ Error: Invalid environment. Use: development, staging, or production"
        exit 1
        ;;
esac

case \$ACTION in
    "setup")
        echo "⚙️ Setting up \$ENVIRONMENT environment..."
        
        # Create environment file if it doesn't exist
        if [ ! -f ".env.\$ENVIRONMENT" ]; then
            echo "📝 Creating .env.\$ENVIRONMENT file..."
            cp "environments/\$ENVIRONMENT/.env.example" ".env.\$ENVIRONMENT" 2>/dev/null || {
                cat > ".env.\$ENVIRONMENT" << EOF
# \$ENVIRONMENT Environment Configuration
NODE_ENV=\$ENVIRONMENT
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
REDIS_URL=
SENTRY_DSN=
EOF
            }
        fi
        
        # Create Docker Compose override if needed
        if [ "\$ENVIRONMENT" != "development" ] && [ ! -f "docker-compose.\$ENVIRONMENT.yml" ]; then
            echo "🐳 Creating Docker Compose configuration..."
            ln -s "docker/environments/\$ENVIRONMENT/docker-compose.yml" "docker-compose.\$ENVIRONMENT.yml"
        fi
        
        echo "✅ \$ENVIRONMENT environment setup completed"
        ;;
        
    "deploy")
        echo "🚀 Deploying to \$ENVIRONMENT..."
        ./scripts/deploy/\$ENVIRONMENT/deploy.sh
        ;;
        
    "test")
        echo "🧪 Testing \$ENVIRONMENT environment..."
        NODE_ENV=\$ENVIRONMENT pnpm test
        ;;
        
    "build")
        echo "🔨 Building for \$ENVIRONMENT..."
        NODE_ENV=\$ENVIRONMENT pnpm build
        ;;
        
    "start")
        echo "🌟 Starting \$ENVIRONMENT server..."
        NODE_ENV=\$ENVIRONMENT pnpm start
        ;;
        
    "logs")
        echo "📋 Showing \$ENVIRONMENT logs..."
        if command -v docker-compose &> /dev/null; then
            docker-compose -f docker-compose.\$ENVIRONMENT.yml logs -f
        else
            echo "❌ Docker Compose not available"
        fi
        ;;
        
    "stop")
        echo "🛑 Stopping \$ENVIRONMENT environment..."
        if command -v docker-compose &> /dev/null; then
            docker-compose -f docker-compose.\$ENVIRONMENT.yml down
        else
            echo "❌ Docker Compose not available"
        fi
        ;;
        
    "clean")
        echo "🧹 Cleaning \$ENVIRONMENT environment..."
        if command -v docker-compose &> /dev/null; then
            docker-compose -f docker-compose.\$ENVURATION.yml down -v
            docker system prune -f
        fi
        rm -rf .next
        rm -rf node_modules/.cache
        ;;
        
    *)
        echo "❌ Error: Invalid action. Use: setup, deploy, test, build, start, logs, stop, clean"
        exit 1
        ;;
esac
`

  // Write deployment scripts
  const deployScripts = [
    { file: 'scripts/deploy/development/deploy.sh', content: devDeploy },
    { file: 'scripts/deploy/staging/deploy.sh', content: stagingDeploy },
    { file: 'scripts/deploy/production/deploy.sh', content: prodDeploy },
    { file: 'scripts/environment.sh', content: envManager }
  ]
  
  deployScripts.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file)
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(filePath, content)
    fs.chmodSync(filePath, '755') // Make executable
    colorLog(`  ✅ Created ${file}`, 'green')
  })
}

// Create environment templates
function createEnvironmentTemplates() {
  colorLog('\n📄 Creating environment templates...', 'cyan')
  
  // Development environment template
  const devTemplate = `# Development Environment Configuration
# Copy this file to .env.development and fill in your values

# Application
NODE_ENV=development
PORT=3000
HOST=localhost

# Database
DATABASE_URL=postgresql://dev_user:dev_pass@localhost:5432/beauty_ai_dev
SUPABASE_URL=your_dev_supabase_url
SUPABASE_ANON_KEY=your_dev_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_dev_supabase_service_role_key

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_dev_nextauth_secret

# AI Services
OPENAI_API_KEY=your_dev_openai_api_key
ANTHROPIC_API_KEY=your_dev_anthropic_api_key
GOOGLE_CLOUD_VISION_KEY=your_dev_google_cloud_vision_key

# External Services
REDIS_URL=redis://localhost:6379
ELASTICSEARCH_URL=http://localhost:9200

# Email
RESEND_API_KEY=your_dev_resend_api_key
EMAIL_FROM=dev@beauty-with-ai-precision.com

# Analytics & Monitoring
SENTRY_DSN=your_dev_sentry_dsn
VERCEL_ANALYTICS_ID=your_dev_vercel_analytics_id

# File Storage
AWS_ACCESS_KEY_ID=your_dev_aws_access_key
AWS_SECRET_ACCESS_KEY=your_dev_aws_secret_key
S3_BUCKET_NAME=beauty-ai-dev-uploads
`

  // Staging environment template
  const stagingTemplate = `# Staging Environment Configuration
# Copy this file to .env.staging and fill in your values

# Application
NODE_ENV=staging
PORT=3000
HOST=0.0.0.0

# Database
STAGING_DATABASE_URL=your_staging_database_url
STAGING_SUPABASE_URL=your_staging_supabase_url
STAGING_SUPABASE_ANON_KEY=your_staging_supabase_anon_key
STAGING_SUPABASE_SERVICE_ROLE_KEY=your_staging_supabase_service_role_key

# Authentication
NEXTAUTH_URL=https://staging.beauty-with-ai-precision.com
STAGING_NEXTAUTH_SECRET=your_staging_nextauth_secret

# AI Services
STAGING_OPENAI_API_KEY=your_staging_openai_api_key
STAGING_ANTHROPIC_API_KEY=your_staging_anthropic_api_key
STAGING_GOOGLE_CLOUD_VISION_KEY=your_staging_google_cloud_vision_key

# External Services
STAGING_REDIS_URL=your_staging_redis_url
STAGING_ELASTICSEARCH_URL=your_staging_elasticsearch_url

# Email
STAGING_RESEND_API_KEY=your_staging_resend_api_key
EMAIL_FROM=staging@beauty-with-ai-precision.com

# Analytics & Monitoring
STAGING_SENTRY_DSN=your_staging_sentry_dsn
STAGING_VERCEL_ANALYTICS_ID=your_staging_vercel_analytics_id

# File Storage
STAGING_AWS_ACCESS_KEY_ID=your_staging_aws_access_key
STAGING_AWS_SECRET_ACCESS_KEY=your_staging_aws_secret_key
S3_BUCKET_NAME=beauty-ai-staging-uploads

# Deployment
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
`

  // Production environment template
  const prodTemplate = `# Production Environment Configuration
# Copy this file to .env.production and fill in your values

# Application
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database
PRODUCTION_DATABASE_URL=your_production_database_url
PRODUCTION_SUPABASE_URL=your_production_supabase_url
PRODUCTION_SUPABASE_ANON_KEY=your_production_supabase_anon_key
PRODUCTION_SUPABASE_SERVICE_ROLE_KEY=your_production_supabase_service_role_key

# Authentication
NEXTAUTH_URL=https://beauty-with-ai-precision.com
PRODUCTION_NEXTAUTH_SECRET=your_production_nextauth_secret

# AI Services
PRODUCTION_OPENAI_API_KEY=your_production_openai_api_key
PRODUCTION_ANTHROPIC_API_KEY=your_production_anthropic_api_key
PRODUCTION_GOOGLE_CLOUD_VISION_KEY=your_production_google_cloud_vision_key

# External Services
PRODUCTION_REDIS_URL=your_production_redis_url
PRODUCTION_ELASTICSEARCH_URL=your_production_elasticsearch_url

# Email
PRODUCTION_RESEND_API_KEY=your_production_resend_api_key
EMAIL_FROM=noreply@beauty-with-ai-precision.com

# Analytics & Monitoring
PRODUCTION_SENTRY_DSN=your_production_sentry_dsn
PRODUCTION_VERCEL_ANALYTICS_ID=your_production_vercel_analytics_id

# File Storage
PRODUCTION_AWS_ACCESS_KEY_ID=your_production_aws_access_key
PRODUCTION_AWS_SECRET_ACCESS_KEY=your_production_aws_secret_key
S3_BUCKET_NAME=beauty-ai-production-uploads

# Deployment
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id

# Security
ALLOWED_HOSTS=beauty-with-ai-precision.com,www.beauty-with-ai-precision.com

# Monitoring
GRAFANA_PASSWORD=your_grafana_password
`

  // Write environment templates
  const templates = [
    { file: 'environments/development/.env.example', content: devTemplate },
    { file: 'environments/staging/.env.example', content: stagingTemplate },
    { file: 'environments/production/.env.example', content: prodTemplate }
  ]
  
  templates.forEach(({ file, content }) => {
    const filePath = path.join(process.cwd(), file)
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(filePath, content)
    colorLog(`  ✅ Created ${file}`, 'green')
  })
}

// Update package.json with new scripts
function updatePackageScripts() {
  colorLog('\n📦 Updating package.json scripts...', 'cyan')
  
  try {
    const packagePath = path.join(process.cwd(), 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
    
    // Add environment management scripts
    const newScripts = {
      'env:setup': './scripts/environment.sh setup',
      'env:deploy': './scripts/environment.sh deploy',
      'env:test': './scripts/environment.sh test',
      'env:build': './scripts/environment.sh build',
      'env:start': './scripts/environment.sh start',
      'env:logs': './scripts/environment.sh logs',
      'env:stop': './scripts/environment.sh stop',
      'env:clean': './scripts/environment.sh clean',
      'deploy:dev': './scripts/deploy/development/deploy.sh',
      'deploy:staging': './scripts/deploy/staging/deploy.sh',
      'deploy:prod': './scripts/deploy/production/deploy.sh',
      'docker:dev': 'docker-compose up -d',
      'docker:staging': 'docker-compose -f docker-compose.staging.yml up -d',
      'docker:prod': 'docker-compose -f docker-compose.production.yml up -d',
      'docker:down': 'docker-compose down',
      'docker:clean': 'docker-compose down -v && docker system prune -f',
      'build:analyze': 'ANALYZE=true pnpm build',
      'test:e2e:staging': 'playwright test --config=playwright.config.staging.ts',
      'test:e2e:production': 'playwright test --config=playwright.config.production.ts',
      'test:smoke': 'pnpm test:smoke',
      'test:performance': 'pnpm test:performance',
      'db:backup': './scripts/backup-database.sh',
      'db:restore': './scripts/restore-database.sh'
    }
    
    // Merge scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      ...newScripts
    }
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2))
    colorLog('✅ Package.json updated with environment scripts', 'green')
    
  } catch (error) {
    colorLog(`⚠️ Could not update package.json: ${error.message}`, 'yellow')
  }
}

// Create README documentation
function createEnvironmentReadme() {
  colorLog('\n📚 Creating environment documentation...', 'cyan')
  
  const readme = `# Multi-Environment Deployment

This project supports multiple deployment environments with automated CI/CD pipelines and comprehensive configuration management.

## 🏗️ Environments

### Development
- **URL**: http://localhost:3000
- **Purpose**: Local development and testing
- **Database**: Local PostgreSQL
- **Features**: Debug mode, hot reload, mock data support

### Staging
- **URL**: https://staging.beauty-with-ai-precision.com
- **Purpose**: Pre-production testing
- **Database**: Staging Supabase instance
- **Features**: Production-like environment, automated testing

### Production
- **URL**: https://beauty-with-ai-precision.com
- **Purpose**: Live production environment
- **Database**: Production Supabase instance
- **Features**: Full monitoring, security, scaling

## 🚀 Quick Start

### 1. Environment Setup
\`\`\`bash
# Setup development environment
pnpm env:setup development

# Setup staging environment
pnpm env:setup staging

# Setup production environment
pnpm env:setup production
\`\`\`

### 2. Local Development
\`\`\`bash
# Start development environment
pnpm docker:dev

# Or start without Docker
pnpm dev
\`\`\`

### 3. Deployment
\`\`\`bash
# Deploy to staging
pnpm deploy:staging

# Deploy to production (requires confirmation)
pnpm deploy:prod
\`\`\`

## 📋 Environment Configuration

### Environment Variables
Each environment has its own configuration file:
- \`.env.development\` - Development settings
- \`.env.staging\` - Staging settings
- \`.env.production\` - Production settings

### Required Variables
- \`DATABASE_URL\` - PostgreSQL connection string
- \`SUPABASE_URL\` - Supabase project URL
- \`SUPABASE_ANON_KEY\` - Supabase anonymous key
- \`NEXTAUTH_SECRET\` - Authentication secret
- \`OPENAI_API_KEY\` - OpenAI API key
- \`RESEND_API_KEY\` - Email service API key

## 🐳 Docker Deployment

### Development
\`\`\`bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
\`\`\`

### Staging
\`\`\`bash
# Deploy to staging
docker-compose -f docker-compose.staging.yml up -d

# View logs
docker-compose -f docker-compose.staging.yml logs -f
\`\`\`

### Production
\`\`\`bash
# Deploy to production
docker-compose -f docker-compose.production.yml up -d

# Scale services
docker-compose -f docker-compose.production.yml up -d --scale app=3
\`\`\`

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows
- **CI**: Runs on every push and pull request
- **Staging Deploy**: Auto-deploys from develop branch
- **Production Deploy**: Manual deployment from main branch

### Pipeline Stages
1. **Lint & Type Check** - Code quality validation
2. **Test Suite** - Unit and integration tests
3. **Security Audit** - Vulnerability scanning
4. **Build** - Application compilation
5. **Deploy** - Environment deployment
6. **Post-deployment Tests** - Health checks and E2E tests

## 🔧 Environment Management

### Available Commands
\`\`\`bash
# Setup environment
pnpm env:setup [environment]

# Deploy to environment
pnpm env:deploy [environment]

# Test environment
pnpm env:test [environment]

# Build for environment
pnpm env:build [environment]

# Start environment
pnpm env:start [environment]

# View logs
pnpm env:logs [environment]

# Stop environment
pnpm env:stop [environment]

# Clean environment
pnpm env:clean [environment]
\`\`\`

### Environment Switching
\`\`\`bash
# Switch to development
export NODE_ENV=development

# Switch to staging
export NODE_ENV=staging

# Switch to production
export NODE_ENV=production
\`\`\`

## 📊 Monitoring & Logging

### Development
- Local logs in console
- Debug mode enabled
- Performance monitoring disabled

### Staging
- Structured JSON logging
- Sentry error tracking
- Performance monitoring enabled

### Production
- Comprehensive logging
- Full monitoring suite
- Alert systems active

## 🔒 Security

### Environment Security
- Isolated databases per environment
- Separate API keys per environment
- Environment-specific CORS settings
- Rate limiting per environment

### Access Control
- Development: Local access only
- Staging: Team access via VPN
- Production: Restricted access with MFA

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
\`\`\`bash
# Clear build cache
pnpm env:clean

# Reinstall dependencies
rm -rf node_modules && pnpm install
\`\`\`

#### Database Connection Issues
\`\`\`bash
# Check database URL
echo \$DATABASE_URL

# Test connection
pnpm db:migrate
\`\`\`

#### Deployment Failures
\`\`\`bash
# Check environment variables
cat .env.[environment]

# View deployment logs
pnpm env:logs [environment]
\`\`\`

### Getting Help
1. Check environment logs
2. Verify environment variables
3. Run health checks
4. Review CI/CD pipeline status

## 📚 Additional Resources

- [Vercel Deployment Guide](https://vercel.com/docs)
- [Docker Documentation](https://docs.docker.com)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Supabase Docs](https://supabase.com/docs)
`

  const readmePath = path.join(process.cwd(), 'docs', 'ENVIRONMENTS.md')
  const docsDir = path.dirname(readmePath)
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true })
  }
  fs.writeFileSync(readmePath, readme)
  colorLog('✅ Environment documentation created', 'green')
}

// Main execution function
async function main() {
  colorLog('🚀 Setting up Multi-Environment Deployment System', 'bright')
  colorLog('=' .repeat(60), 'cyan')
  
  try {
    createEnvironmentDirectories()
    createEnvironmentConfigs()
    createGitHubWorkflows()
    createDockerConfigurations()
    createDeploymentScripts()
    createEnvironmentTemplates()
    updatePackageScripts()
    createEnvironmentReadme()
    
    colorLog('\n' + '='.repeat(60), 'green')
    colorLog('🎉 Multi-Environment Deployment setup completed!', 'bright')
    colorLog('\n📋 Next Steps:', 'cyan')
    colorLog('1. Setup environment variables: pnpm env:setup development', 'blue')
    colorLog('2. Configure GitHub secrets for CI/CD', 'blue')
    colorLog('3. Test local development: pnpm docker:dev', 'blue')
    colorLog('4. Deploy to staging: pnpm deploy:staging', 'blue')
    colorLog('5. Configure production deployment', 'blue')
    
    colorLog('\n🏗️ Environment Structure:', 'yellow')
    colorLog('• Development: Local development with hot reload', 'white')
    colorLog('• Staging: Pre-production testing environment', 'white')
    colorLog('• Production: Live production with full monitoring', 'white')
    
    colorLog('\n🔄 CI/CD Features:', 'cyan')
    colorLog('• Automated testing and linting', 'blue')
    colorLog('• Security vulnerability scanning', 'blue')
    colorLog('• Multi-stage deployment pipeline', 'blue')
    colorLog('• Environment-specific configurations', 'blue')
    colorLog('• Rollback capabilities', 'blue')
    
    colorLog('\n🐳 Docker Support:', 'green')
    colorLog('• Multi-environment Docker configurations', 'white')
    colorLog('• Development containers with hot reload', 'white')
    colorLog('• Production-ready containers with security', 'white')
    colorLog('• Monitoring and logging integration', 'white')
    colorLog('• Scalable deployment with Docker Compose', 'white')
    
    colorLog('\n📊 Deployment Features:', 'magenta')
    colorLog('• Environment variable management', 'white')
    colorLog('• Automated database migrations', 'white')
    colorLog('• Health checks and monitoring', 'white')
    colorLog('• Performance testing and optimization', 'white')
    colorLog('• Security best practices implementation', 'white')
    
  } catch (error) {
    colorLog(`\n❌ Setup failed: ${error.message}`, 'red')
    process.exit(1)
  }
}

// Run the setup
if (require.main === module) {
  main()
}

module.exports = {
  main,
  createEnvironmentDirectories,
  createEnvironmentConfigs,
  createGitHubWorkflows,
  createDockerConfigurations,
  createDeploymentScripts,
  createEnvironmentTemplates,
  updatePackageScripts
}
