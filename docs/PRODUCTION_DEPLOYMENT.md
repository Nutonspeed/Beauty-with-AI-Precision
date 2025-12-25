# 🚀 Production Deployment Guide
## Beauty with AI Precision - B2B SaaS Platform

> **Version**: 1.0 Production Ready  
> **Last Updated**: December 24, 2025  
> **Target**: Vercel Deployment

---

## 📋 Prerequisites

### Required Accounts & Services
- [x] **Vercel Account** (Pro/Enterprise recommended)
- [x] **Supabase Project** (PostgreSQL 15)
- [x] **Domain** (custom domain for production)
- [x] **Email Service** (Resend for transactional emails)
- [x] **AI Gateway** (Vercel AI Gateway configured)

### Environment Variables
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_JWT_SECRET="your-jwt-secret"

# Database
DATABASE_URL="postgresql://..."

# AI Services
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
VERCEL_AI_GATEWAY_SECRET="your-gateway-secret"

# Email (Resend)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# Auth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="https://yourdomain.com"

# Monitoring
SENTRY_DSN="https://your-sentry-dsn"
```

---

## 🚀 Deployment Steps

### 1️⃣ Database Setup (Supabase)

```sql
-- Run all migrations in order
-- 1. supabase/migrations/20250101_*.sql
-- 2. supabase/migrations/20250102_*.sql
-- ...
-- Latest: 202512240001_fix_features_th_type.sql

-- Verify tables
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';
-- Expected: 78 tables

-- Verify RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
-- All should show rowsecurity = true
```

### 2️⃣ Vercel Configuration

#### vercel.json (Production)
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["sin1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 60
    }
  },
  "env": {
    "FAST_BUILD": "true",
    "VERCEL": "true"
  }
}
```

#### next.config.mjs (Production)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  swcMinify: true,
  experimental: {
    optimizePackageImports: [],
    optimizeCss: false,
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  env: {
    FAST_BUILD: process.env.VERCEL ? 'true' : 'false',
  },
  images: {
    domains: ['your-project.supabase.co'],
  },
}

module.exports = nextConfig
```

### 3️⃣ Build & Deploy

```bash
# Install dependencies
pnpm install

# Build locally first
FAST_BUILD=1 pnpm build

# Deploy to Vercel
vercel --prod

# Or via Vercel Dashboard
# 1. Connect GitHub repo
# 2. Configure environment variables
# 3. Deploy
```

### 4️⃣ Post-Deployment Checklist

#### Database Verification
```bash
# Test connection
curl https://yourdomain.com/api/health
# Expected: {"status": "ok", "database": "connected"}

# Test authentication
curl -X POST https://yourdomain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

#### Feature Verification
- [ ] Login page loads: `https://yourdomain.com/auth/login`
- [ ] Sales Dashboard: `https://yourdomain.com/th/sales/dashboard`
- [ ] AI Analysis: `https://yourdomain.com/th/analysis`
- [ ] Mobile responsive (test on mobile)
- [ ] All APIs return 401 for unauthenticated (security)

---

## 🔧 Monitoring & Logging

### Sentry Integration
```typescript
// Already configured in instrumentation.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
})
```

### Vercel Analytics
- Enabled by default
- Monitor: Page views, Web Vitals, Routes
- Check: https://vercel.com/analytics

### Custom Monitoring
```bash
# Health check endpoint
GET /api/health

# Performance metrics
GET /api/admin/clinics/performance (requires auth)
```

---

## 🛡️ Security Checklist

### ✅ Authentication & Authorization
- [ ] JWT tokens configured
- [ ] RLS policies enabled on all tables
- [ ] Service role key secured (server-only)
- [ ] Rate limiting configured

### ✅ API Security
- [ ] CORS configured for production domain
- [ ] All routes require authentication
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (RLS)

### ✅ Data Protection
- [ ] HTTPS enforced
- [ ] Environment variables encrypted
- [ ] Database backups enabled
- [ ] GDPR compliance ready

---

## 📊 Performance Optimization

### Build Optimizations
- ✅ FAST_BUILD mode enabled
- ✅ Static generation disabled for dynamic pages
- ✅ Image optimization configured
- ✅ Bundle size optimized

### Runtime Performance
- ✅ Edge functions for APIs
- ✅ Database pooling (Supabase)
- ✅ CDN for static assets
- ✅ Caching headers configured

---

## 🚨 Troubleshooting

### Common Issues

#### Build Timeout
```bash
# Enable FAST_BUILD
export FAST_BUILD=1
pnpm build
```

#### Database Connection
```bash
# Check connection string
echo $DATABASE_URL

# Test with psql
psql $DATABASE_URL -c "SELECT 1"
```

#### Authentication Issues
```bash
# Verify JWT secret
echo $SUPABASE_JWT_SECRET

# Check service role key
echo $SUPABASE_SERVICE_ROLE_KEY
```

#### API 404 Errors
- Check `vercel.json` functions configuration
- Verify file paths: `app/api/.../route.ts`
- Check build logs for missing files

---

## 📞 Support Contacts

### Technical Support
- **Lead Engineer**: [Contact Info]
- **Database Admin**: [Contact Info]
- **DevOps**: [Contact Info]

### Emergency Contacts
- **Production Down**: [Pager]
- **Security Incident**: [Security Team]
- **Data Issues**: [DBA Team]

---

## 🔄 Maintenance Schedule

### Daily
- [ ] Monitor error rates (Sentry)
- [ ] Check performance metrics
- [ ] Verify backups

### Weekly
- [ ] Review security logs
- [ ] Update dependencies
- [ ] Clean up old data

### Monthly
- [ ] Security audit
- [ ] Performance review
- [ ] Capacity planning

---

## 📝 Deployment History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-12-24 | 1.0.0 | Initial Production Release | Lead Engineer |
| 2025-12-25 | 1.0.1 | Security & Permission Fixes | AI Assistant |
| | | - Fixed user creation permissions (clinic_owner, sales_staff) | |
| | | - Added sales_staff + clinic_admin to UserRole types | |
| | | - Fixed Stripe webhook to sync clinic_subscriptions | |
| | | - Closed security holes in /api/auth/register | |
| | | - Deprecated /api/admin/users direct creation | |
| | | - Sales staff can now access customer management UI | |

---

**Next Review**: January 24, 2026  
**Document Owner**: Lead Engineer  
**Approval**: CTO
