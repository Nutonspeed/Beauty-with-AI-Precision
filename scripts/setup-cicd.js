#!/usr/bin/env node

/**
 * CI/CD Pipeline Setup Script
 * 
 * Configures GitHub Actions, Vercel, and deployment automation
 */

const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 CI/CD Pipeline Setup\n')

// Required secrets for CI/CD
const REQUIRED_SECRETS = [
  // Supabase
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY',
  'TEST_DATABASE_URL',
  'STAGING_SUPABASE_URL',
  'STAGING_SUPABASE_ANON_KEY',
  'PRODUCTION_SUPABASE_URL',
  'PRODUCTION_SUPABASE_ANON_KEY',
  'PRODUCTION_SUPABASE_SERVICE_KEY',
  'PRODUCTION_DATABASE_URL',
  
  // Authentication
  'NEXTAUTH_SECRET',
  'STAGING_NEXTAUTH_SECRET',
  'PRODUCTION_NEXTAUTH_SECRET',
  
  // Vercel
  'VERCEL_TOKEN',
  'ORG_ID',
  'PROJECT_ID',
  
  // Monitoring
  'PRODUCTION_SENTRY_DSN',
  'LHCI_GITHUB_APP_TOKEN',
  
  // Notifications
  'SLACK_WEBHOOK',
  'DEPLOYMENT_WEBHOOK',
  'EMAIL_USERNAME',
  'EMAIL_PASSWORD',
  'NOTIFICATION_EMAIL',
  
  // Docker
  'DOCKER_REGISTRY'
]

// Create environment-specific configuration files
function createEnvironmentConfigs() {
  console.log('📝 Creating environment configuration files...')
  
  // Staging environment
  const stagingEnv = `# Staging Environment Configuration
NODE_ENV=staging
NEXT_PUBLIC_APP_NAME="Beauty with AI Precision - Staging"
NEXT_PUBLIC_APP_VERSION="staging"

# Supabase - Staging
NEXT_PUBLIC_SUPABASE_URL="${process.env.STAGING_SUPABASE_URL || 'https://staging-project.supabase.co'}"
NEXT_PUBLIC_SUPABASE_ANON_KEY="${process.env.STAGING_SUPABASE_ANON_KEY || 'staging-anon-key'}"
SUPABASE_SERVICE_ROLE_KEY="${process.env.STAGING_SUPABASE_SERVICE_KEY || 'staging-service-key'}"

# Authentication
NEXTAUTH_SECRET="${process.env.STAGING_NEXTAUTH_SECRET || 'staging-secret-key'}"
NEXTAUTH_URL="${process.env.STAGING_NEXTAUTH_URL || 'https://staging.beauty-ai.com'}"

# AI Services (Test keys)
OPENAI_API_KEY="${process.env.STAGING_OPENAI_API_KEY || 'sk-test-staging'}"
ANTHROPIC_API_KEY="${process.env.STAGING_ANTHROPIC_API_KEY || 'sk-ant-test-staging'}"
GEMINI_API_KEY="${process.env.STAGING_GEMINI_API_KEY || 'test-staging-key'}"

# Monitoring
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
NEXT_PUBLIC_SENTRY_DSN="${process.env.STAGING_SENTRY_DSN || ''}"

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG_MODE=true
`

  // Production environment
  const productionEnv = `# Production Environment Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_NAME="Beauty with AI Precision"
NEXT_PUBLIC_APP_VERSION="1.0.0"

# Supabase - Production
NEXT_PUBLIC_SUPABASE_URL="${process.env.PRODUCTION_SUPABASE_URL || 'https://production-project.supabase.co'}"
NEXT_PUBLIC_SUPABASE_ANON_KEY="${process.env.PRODUCTION_SUPABASE_ANON_KEY || 'production-anon-key'}"
SUPABASE_SERVICE_ROLE_KEY="${process.env.PRODUCTION_SUPABASE_SERVICE_KEY || 'production-service-key'}"

# Authentication
NEXTAUTH_SECRET="${process.env.PRODUCTION_NEXTAUTH_SECRET || 'production-secret-key'}"
NEXTAUTH_URL="${process.env.PRODUCTION_NEXTAUTH_URL || 'https://beauty-ai.com'}"

# AI Services (Real keys)
OPENAI_API_KEY="${process.env.PRODUCTION_OPENAI_API_KEY || ''}"
ANTHROPIC_API_KEY="${process.env.PRODUCTION_ANTHROPIC_API_KEY || ''}"
GEMINI_API_KEY="${process.env.PRODUCTION_GEMINI_API_KEY || ''}"
HUGGINGFACE_TOKEN="${process.env.PRODUCTION_HUGGINGFACE_TOKEN || ''}"

# Monitoring
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
NEXT_PUBLIC_SENTRY_DSN="${process.env.PRODUCTION_SENTRY_DSN || ''}"

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG_MODE=false

# Security
NEXT_PUBLIC_ENFORCE_HTTPS=true
NEXT_PUBLIC_SECURITY_HEADERS=true
`

  // Write environment files
  fs.writeFileSync(path.join(process.cwd(), '.env.staging'), stagingEnv)
  fs.writeFileSync(path.join(process.cwd(), '.env.production'), productionEnv)
  
  console.log('✅ Environment configuration files created')
}

// Create deployment scripts
function createDeploymentScripts() {
  console.log('\n📜 Creating deployment scripts...')
  
  // Scripts are now in scripts/deploy/
  console.log('✅ Pre-deployment script at scripts/deploy/pre-deploy.sh')
  console.log('✅ Post-deployment script at scripts/deploy/post-deploy.sh')
  console.log('✅ Rollback script at scripts/deploy/rollback.sh')
}

// Create Lighthouse CI configuration
function createLighthouseConfig() {
  console.log('\n📊 Creating Lighthouse CI configuration...')
  
  const lighthouseConfig = {
    ci: {
      collect: {
        url: [
          'https://beauty-ai.com',
          'https://beauty-ai.com/analysis',
          'https://beauty-ai.com/auth/login',
          'https://beauty-ai.com/pricing'
        ],
        numberOfRuns: 3,
        settings: {
          chromeFlags: '--no-sandbox --headless'
        }
      },
      assert: {
        assertions: {
          'categories:performance': ['warn', { minScore: 0.8 }],
          'categories:accessibility': ['error', { minScore: 0.9 }],
          'categories:best-practices': ['warn', { minScore: 0.8 }],
          'categories:seo': ['warn', { minScore: 0.8 }],
          'categories:pwa': 'off'
        }
      },
      upload: {
        target: 'temporary-public-storage'
      }
    }
  }
  
  fs.writeFileSync(
    path.join(process.cwd(), 'lighthouserc.json'),
    JSON.stringify(lighthouseConfig, null, 2)
  )
  
  console.log('✅ Lighthouse CI configuration created')
}

// Create Docker configuration for CI/CD
function createDockerConfig() {
  console.log('\n🐳 Creating Docker configuration for CI/CD...')
  
  const dockerfile = `# Multi-stage Dockerfile for CI/CD

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN pnpm run db:generate

# Build application
RUN pnpm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Install production dependencies only
RUN pnpm install --frozen-lockfile --production

# Set correct permissions
RUN mkdir .next/cache
RUN chown -R nextjs:nodejs .next
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["pnpm", "start"]
`
  
  const dockerCompose = `version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=\${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=\${SUPABASE_ANON_KEY}
    depends_on:
      - deepface
    restart: unless-stopped

  deepface:
    build:
      context: .
      dockerfile: docker/deepface.Dockerfile
    ports:
      - "5000:5000"
    restart: unless-stopped
    resources:
      limits:
        memory: 2G
        cpus: '1.0'

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
`
  
  fs.writeFileSync(path.join(process.cwd(), 'Dockerfile'), dockerfile)
  fs.writeFileSync(path.join(process.cwd(), 'docker-compose.yml'), dockerCompose)
  
  console.log('✅ Docker configuration created')
}

// Create branch protection rules
function createBranchProtection() {
  console.log('\n🔒 Creating branch protection configuration...')
  
  const protectionConfig = {
    required_status_checks: {
      strict: true,
      contexts: [
        '🔍 Code Quality & Security',
        '🧪 Unit Tests',
        '🎭 E2E Tests',
        '🏗️ Build & Analysis',
        '🔒 Security Scan'
      ]
    },
    enforce_admins: true,
    required_pull_request_reviews: {
      required_approving_review_count: 2,
      dismiss_stale_reviews: true,
      require_code_owner_reviews: true
    },
    restrictions: null,
    allow_force_pushes: false,
    allow_deletions: false
  }
  
  fs.writeFileSync(
    path.join(process.cwd(), '.github', 'branch-protection.json'),
    JSON.stringify(protectionConfig, null, 2)
  )
  
  console.log('✅ Branch protection configuration created')
}

// Create deployment documentation
function createCICDDocumentation() {
  console.log('\n📖 Creating CI/CD documentation...')
  
  const docs = `# CI/CD Pipeline Documentation

## 🚀 Overview

Beauty with AI Precision uses a comprehensive CI/CD pipeline with:

- **GitHub Actions**: Automated testing and deployment
- **Vercel**: Hosting and preview deployments  
- **Docker**: Containerization for services
- **Lighthouse CI**: Performance monitoring
- **Security scanning**: Automated vulnerability detection

## 📋 Pipeline Stages

### 1. Code Quality & Security
- TypeScript compilation
- ESLint and Prettier checks
- Security audit (pnpm audit)
- Dependency verification

### 2. Testing
- **Unit Tests**: Jest/Vitest with coverage
- **E2E Tests**: Playwright end-to-end testing
- **Integration Tests**: API and database testing

### 3. Build & Analysis
- Production build optimization
- Bundle size analysis
- Performance audit (Lighthouse)
- Artifact creation

### 4. Security Scan
- Trivy vulnerability scanning
- CodeQL static analysis
- Dependency security check

### 5. Deployment
- **Staging**: Automatic on develop branch
- **Production**: Manual approval on main branch
- Health checks and verification

## 🔧 Setup Instructions

### 1. GitHub Secrets

Configure these secrets in GitHub repository settings:

\`\`\`bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
PRODUCTION_SUPABASE_URL=https://prod-project.supabase.co
PRODUCTION_SUPABASE_ANON_KEY=prod-anon-key
PRODUCTION_SUPABASE_SERVICE_KEY=prod-service-key

# Authentication
NEXTAUTH_SECRET=your-super-secret
PRODUCTION_NEXTAUTH_SECRET=prod-secret

# Vercel Deployment
VERCEL_TOKEN=your-vercel-token
ORG_ID=your-org-id
PROJECT_ID=your-project-id

# Monitoring
PRODUCTION_SENTRY_DSN=https://your-sentry-dsn
LHCI_GITHUB_APP_TOKEN=your-lhci-token

# Notifications
SLACK_WEBHOOK=https://hooks.slack.com/your-webhook
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
NOTIFICATION_EMAIL=team@beauty-ai.com
\`\`\`

### 2. Vercel Configuration

1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Set up custom domains
4. Enable preview deployments

### 3. Branch Protection

Enable branch protection for main branch:
- Require PR reviews (2 reviewers)
- Require status checks to pass
- Include code owner reviews
- Restrict force pushes

## 🚀 Deployment Process

### Staging Deployment
1. Push to \`develop\` branch
2. Automated CI/CD pipeline runs
3. Deploy to staging environment
4. Run smoke tests
5. Notify team on Slack

### Production Deployment
1. Create PR from \`develop\` to \`main\`
2. Code review and approval
3. Merge to \`main\` branch
4. Automated CI/CD pipeline runs
5. Deploy to production
6. Health checks and verification
7. Notify stakeholders

## 🧪 Testing Strategy

### Unit Tests
- Component testing with React Testing Library
- Utility function testing
- API endpoint testing
- Database service testing

### E2E Tests
- Critical user flows
- Authentication flows
- AI analysis workflow
- Cross-browser compatibility

### Performance Tests
- Lighthouse CI audits
- Bundle size monitoring
- Core Web Vitals tracking
- API response time testing

## 📊 Monitoring & Alerts

### Performance Monitoring
- Lighthouse scores in CI/CD
- Bundle size tracking
- Performance regression detection
- Core Web Vitals monitoring

### Error Monitoring
- Sentry integration
- Error tracking in production
- Performance issue detection
- Real-user monitoring

### Deployment Alerts
- Slack notifications for deployments
- Email notifications for failures
- Rollback automation on failure
- Health check monitoring

## 🔒 Security Features

### Automated Security Scanning
- Trivy vulnerability scanner
- CodeQL static analysis
- Dependency security audit
- SAST/DAST integration

### Security Best Practices
- Secret management
- Environment isolation
- Access control
- Audit logging

## 🔄 Rollback Procedures

### Automatic Rollback
- Health check failures trigger rollback
- Performance score below threshold
- Critical errors detected
- Manual trigger via Slack

### Manual Rollback
\`\`\`bash
# Rollback to previous deployment
vercel rollback <project-id>

# Or use script
./scripts/deploy/rollback.sh production
\`\`\`

## 📈 Performance Optimization

### Build Optimization
- Code splitting
- Tree shaking
- Image optimization
- Bundle analysis

### Deployment Optimization
- CDN configuration
- Edge caching
- Compression enabled
- HTTP/2 support

## 🔧 Local Development

### Run CI/CD Locally
\`\`\`bash
# Install dependencies
pnpm install

# Run quality checks
pnpm run type-check
pnpm run lint
pnpm run format:check

# Run tests
pnpm run test:unit
pnpm run test:e2e

# Build and analyze
pnpm run build
ANALYZE=true pnpm run build

# Performance audit
npx lighthouse http://localhost:3000
\`\`\`

### Pre-commit Hooks
\`\`\`bash
# Install husky
pnpm add -D husky

# Setup hooks
npx husky install
npx husky add .husky/pre-commit "pnpm run type-check && pnpm run lint"
npx husky add .husky/pre-push "pnpm run test:unit"
\`\`\`

## 📞 Troubleshooting

### Common Issues

1. **Build failures**
   - Check Node.js version (>=20.19)
   - Verify environment variables
   - Review error logs in GitHub Actions

2. **Test failures**
   - Check test environment setup
   - Verify database connection
   - Review test configuration

3. **Deployment failures**
   - Check Vercel configuration
   - Verify domain settings
   - Review deployment logs

4. **Performance regressions**
   - Check bundle size changes
   - Review Lighthouse audit
   - Analyze performance metrics

### Debug Commands
\`\`\`bash
# Debug build locally
pnpm run build:debug

# Debug tests
pnpm run test:unit --debug

# Check environment
pnpm run check:env

# Verify deployment
curl https://your-app.com/api/health
\`\`\`

## 📊 Metrics & KPIs

### Deployment Metrics
- Deployment frequency
- Lead time for changes
- Change failure rate
- Mean time to recovery

### Performance Metrics
- Lighthouse scores
- Bundle size trends
- API response times
- Error rates

### Quality Metrics
- Test coverage percentage
- Code quality score
- Security vulnerabilities
- Technical debt ratio

---

**🚀 This CI/CD pipeline ensures reliable, secure, and performant deployments!**
`
  
  const docsPath = path.join(process.cwd(), 'docs', 'CICD_SETUP.md')
  fs.writeFileSync(docsPath, docs)
  console.log('✅ CI/CD documentation created')
}

// Main setup function
async function setup() {
  try {
    console.log('🚀 Setting up CI/CD pipeline...\n')
    
    // Create all configurations
    createEnvironmentConfigs()
    createDeploymentScripts()
    createLighthouseConfig()
    createDockerConfig()
    createBranchProtection()
    createCICDDocumentation()
    
    console.log('\n✅ CI/CD pipeline setup complete!')
    console.log('\n📋 Next steps:')
    console.log('1. Configure GitHub secrets in repository settings')
    console.log('2. Set up Vercel project and connect repository')
    console.log('3. Enable branch protection for main branch')
    console.log('4. Configure Slack webhook for notifications')
    console.log('5. Test pipeline by pushing to develop branch')
    console.log('6. Review and adjust pipeline configuration')
    
    console.log('\n🔧 Required secrets:')
    REQUIRED_SECRETS.forEach(secret => {
      console.log(`  - ${secret}`)
    })
    
    console.log('\n📖 Documentation: docs/CICD_SETUP.md')
    console.log('🚀 Pipeline: .github/workflows/ci-cd.yml')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
  }
}

// Run setup
setup()
