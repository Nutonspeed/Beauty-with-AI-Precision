# Multi-Environment Deployment

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
```bash
# Setup development environment
pnpm env:setup development

# Setup staging environment
pnpm env:setup staging

# Setup production environment
pnpm env:setup production
```

### 2. Local Development
```bash
# Start development environment
pnpm docker:dev

# Or start without Docker
pnpm dev
```

### 3. Deployment
```bash
# Deploy to staging
pnpm deploy:staging

# Deploy to production (requires confirmation)
pnpm deploy:prod
```

## 📋 Environment Configuration

### Environment Variables
Each environment has its own configuration file:
- `.env.development` - Development settings
- `.env.staging` - Staging settings
- `.env.production` - Production settings

### Required Variables
- `DATABASE_URL` - PostgreSQL connection string
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXTAUTH_SECRET` - Authentication secret
- `OPENAI_API_KEY` - OpenAI API key
- `RESEND_API_KEY` - Email service API key

## 🐳 Docker Deployment

### Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Staging
```bash
# Deploy to staging
docker-compose -f docker-compose.staging.yml up -d

# View logs
docker-compose -f docker-compose.staging.yml logs -f
```

### Production
```bash
# Deploy to production
docker-compose -f docker-compose.production.yml up -d

# Scale services
docker-compose -f docker-compose.production.yml up -d --scale app=3
```

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
```bash
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
```

### Environment Switching
```bash
# Switch to development
export NODE_ENV=development

# Switch to staging
export NODE_ENV=staging

# Switch to production
export NODE_ENV=production
```

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
```bash
# Clear build cache
pnpm env:clean

# Reinstall dependencies
rm -rf node_modules && pnpm install
```

#### Database Connection Issues
```bash
# Check database URL
echo $DATABASE_URL

# Test connection
pnpm db:migrate
```

#### Deployment Failures
```bash
# Check environment variables
cat .env.[environment]

# View deployment logs
pnpm env:logs [environment]
```

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
