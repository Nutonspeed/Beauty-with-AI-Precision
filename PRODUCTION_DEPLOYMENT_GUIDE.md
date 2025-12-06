# Production Deployment Guide

## 🚀 Beauty-with-AI-Precision Production Launch

Complete production deployment procedure with monitoring, testing, and rollback capabilities.

---

## 📋 Pre-Deployment Checklist

### ✅ Code Quality Verification
- [ ] TypeScript compilation: 0 errors
- [ ] ESLint: 0 errors
- [ ] Test coverage: >80%
- [ ] Security scan: Passed
- [ ] Performance benchmarks: Met targets

### ✅ Infrastructure Ready
- [ ] Production domain: Configured and SSL enabled
- [ ] Database: Supabase production instance ready
- [ ] CDN: Configured for static assets
- [ ] Monitoring: All tools configured and tested
- [ ] Backup: Automated backup system ready

### ✅ Environment Configuration
- [ ] Production environment variables: Set and encrypted
- [ ] API keys: Production keys configured
- [ ] External services: Payment, email, AI services connected
- [ ] Feature flags: Production settings configured

### ✅ Team Readiness
- [ ] Deployment team: Trained and ready
- [ ] Support team: On-call schedule established
- [ ] Customer communication: Go-live announcement prepared
- [ ] Rollback plan: Tested and documented

---

## 🏗️ Production Environment Setup

### 1. Vercel Production Deployment

#### Automatic Deployment (Recommended)
```bash
# 1. Connect to Vercel (already done)
# 2. Push to main branch triggers deployment
# 3. Vercel handles build, deploy, and CDN

# Manual deployment if needed
npm run build
vercel --prod
```

#### Environment Variables for Production
```bash
# Core Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://app.beauty-ai-precision.com

# Supabase Production
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key

# Authentication
NEXTAUTH_SECRET=your-production-nextauth-secret
NEXTAUTH_URL=https://app.beauty-ai-precision.com

# AI Services (Production Keys)
OPENAI_API_KEY=sk-prod-your-openai-key
ANTHROPIC_API_KEY=sk-ant-prod-your-anthropic-key
GEMINI_API_KEY=your-prod-gemini-key

# Email Service
RESEND_API_KEY=re_prod_your-resend-key

# Payment Processing
STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-key
STRIPE_SECRET_KEY=sk_live_your-stripe-secret
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Monitoring & Analytics
SENTRY_DSN=https://your-prod-sentry-dsn@sentry.io/project
NEXT_PUBLIC_GA_ID=GA-YOUR-PROD-ID
DATADOG_API_KEY=your-prod-datadog-key

# Redis (Optional - for caching)
REDIS_URL=redis://your-prod-redis-url

# File Storage
CLOUDINARY_CLOUD_NAME=your-prod-cloudinary
CLOUDINARY_API_KEY=your-prod-cloudinary-key
CLOUDINARY_API_SECRET=your-prod-cloudinary-secret
```

### 2. Database Production Setup

#### Supabase Production Configuration
```sql
-- Enable Row Level Security
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
-- ... enable RLS for all tables

-- Create production policies
-- Clinic isolation
CREATE POLICY "clinic_isolation" ON clinics
FOR ALL USING (auth.jwt() ->> 'clinic_id' = id::text);

-- Customer access for clinic staff
CREATE POLICY "customer_access" ON customers
FOR ALL USING (
  auth.jwt() ->> 'clinic_id' = clinic_id::text
  OR auth.jwt() ->> 'role' = 'admin'
);

-- Similar policies for all tables...
```

#### Database Migration Script
```bash
#!/bin/bash
# scripts/migrate-to-production.sh

echo "🚀 Starting production database migration..."

# Backup current data (if any)
echo "📦 Creating backup..."
supabase db dump --db-url "$PROD_DATABASE_URL" > prod_backup_$(date +%Y%m%d_%H%M%S).sql

# Run migrations
echo "🔄 Running migrations..."
npx supabase db push --db-url "$PROD_DATABASE_URL"

# Seed production data
echo "🌱 Seeding production data..."
npx supabase db seed --db-url "$PROD_DATABASE_URL"

# Verify migration
echo "✅ Verifying migration..."
npx supabase db health --db-url "$PROD_DATABASE_URL"

echo "🎉 Production migration complete!"
```

### 3. Monitoring Production Setup

#### Enable Production Monitoring
```bash
#!/bin/bash
# scripts/setup-production-monitoring.sh

echo "📊 Setting up production monitoring..."

# Configure Sentry for production
export SENTRY_DSN="https://your-prod-sentry-dsn@sentry.io/project"
export SENTRY_ENVIRONMENT="production"

# Configure DataDog
export DD_API_KEY="your-prod-datadog-key"
export DD_APP_KEY="your-prod-datadog-app-key"

# Configure New Relic
export NEW_RELIC_LICENSE_KEY="your-prod-newrelic-key"
export NEW_RELIC_APP_NAME="Beauty-with-AI-Precision-Prod"

# Start monitoring
npm run monitor:start

echo "✅ Production monitoring active!"
```

#### Health Check Verification
```bash
#!/bin/bash
# scripts/verify-production-health.sh

echo "🔍 Verifying production health..."

# Check application health
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://app.beauty-ai-precision.com/api/health)
if [ "$HEALTH_STATUS" -eq 200 ]; then
  echo "✅ Application health: OK"
else
  echo "❌ Application health: FAILED ($HEALTH_STATUS)"
  exit 1
fi

# Check database connectivity
DB_STATUS=$(curl -s https://app.beauty-ai-precision.com/api/health | jq -r '.services.database')
if [ "$DB_STATUS" = "healthy" ]; then
  echo "✅ Database health: OK"
else
  echo "❌ Database health: FAILED"
  exit 1
fi

# Check AI services
AI_STATUS=$(curl -s https://app.beauty-ai-precision.com/api/health | jq -r '.services.ai_services')
if [ "$AI_STATUS" = "healthy" ]; then
  echo "✅ AI services health: OK"
else
  echo "❌ AI services health: FAILED"
  exit 1
fi

echo "🎉 All production health checks passed!"
```

---

## 🚀 Deployment Execution

### Phase 1: Pre-Launch (T-24 hours)

#### 1. Final Testing
```bash
# Run comprehensive QA tests against staging
npm run test:qa:full

# Run performance tests
npm run test:performance

# Run security scan
npm run security:scan

# Manual verification
npm run test:manual-checklist
```

#### 2. Data Migration
```bash
# Migrate data from staging to production
npm run db:migrate:production

# Verify data integrity
npm run db:verify:production
```

#### 3. Configuration Validation
```bash
# Validate all environment variables
npm run config:validate

# Test external integrations
npm run integrations:test
```

### Phase 2: Deployment (T-4 hours)

#### 1. Code Deployment
```bash
# Deploy to production
npm run deploy:production

# Wait for deployment to complete
npm run deploy:wait

# Verify deployment
npm run deploy:verify
```

#### 2. Feature Flag Configuration
```bash
# Enable production features
npm run features:enable:production

# Disable development features
npm run features:disable:staging
```

#### 3. CDN Invalidation
```bash
# Clear CDN cache for updated assets
npm run cdn:invalidate

# Verify CDN updates
npm run cdn:verify
```

### Phase 3: Go-Live (T-0)

#### 1. DNS Switch
```bash
# Update DNS to point to production
# This is typically done by your DNS provider
echo "🔄 Switching DNS to production..."

# Wait for DNS propagation (can take up to 24 hours)
echo "⏳ Waiting for DNS propagation..."
```

#### 2. Final Health Checks
```bash
# Comprehensive production verification
npm run production:final-check

# Load testing
npm run load:test:production

# Monitor for 30 minutes
npm run monitor:initial
```

#### 3. Go-Live Announcement
```bash
# Send customer notifications
npm run notify:customers:go-live

# Update status page
npm run status:update:live

# Notify internal teams
npm run notify:internal:go-live
```

---

## 📊 Post-Launch Monitoring

### Immediate Monitoring (First 24 hours)
```bash
# Enhanced monitoring for first 24 hours
npm run monitor:enhanced:24h

# Real-time alerts for critical issues
npm run alerts:critical:enable

# Customer support monitoring
npm run support:monitor:enable
```

### Performance Monitoring
```bash
# Monitor Core Web Vitals
npm run monitor:performance:core-web-vitals

# Monitor API performance
npm run monitor:api:performance

# Monitor user experience
npm run monitor:ux:metrics
```

### Business Monitoring
```bash
# Monitor key business metrics
npm run monitor:business:kpis

# Monitor user engagement
npm run monitor:user:engagement

# Monitor conversion funnels
npm run monitor:conversion:funnels
```

---

## 🔄 Rollback Procedures

### Emergency Rollback (Critical Issues)
```bash
#!/bin/bash
# scripts/emergency-rollback.sh

echo "🚨 EMERGENCY ROLLBACK INITIATED"

# Immediate rollback to previous version
npm run deploy:rollback -- --immediate

# Restore database from backup
npm run db:restore:latest-backup

# Disable new features
npm run features:rollback

# Update status and notify
npm run status:update:rollback
npm run notify:all:rollback

echo "✅ Emergency rollback complete"
```

### Gradual Rollback (Non-Critical Issues)
```bash
#!/bin/bash
# scripts/gradual-rollback.sh

echo "🔄 Gradual rollback initiated"

# Enable feature flags for old version
npm run features:rollback:partial

# Monitor impact for 1 hour
npm run monitor:rollback-impact -- --duration=1h

# Complete rollback if issues persist
npm run deploy:rollback:complete

echo "✅ Gradual rollback complete"
```

### Database Rollback
```bash
#!/bin/bash
# scripts/database-rollback.sh

echo "💾 Database rollback initiated"

# Create current backup before rollback
npm run db:backup:current

# Restore from pre-deployment backup
npm run db:restore:pre-deployment

# Verify data integrity
npm run db:verify:rollback

echo "✅ Database rollback complete"
```

---

## 📈 Scale Testing & Performance

### Load Testing Setup
```bash
#!/bin/bash
# scripts/load-test-production.sh

echo "🔥 Starting production load testing..."

# Install Artillery if not present
npm install -g artillery

# Run load tests
artillery run config/load-test.yml --target https://app.beauty-ai-precision.com

# Generate reports
artillery report report.json

echo "📊 Load test complete - check reports/"
```

#### Load Test Configuration
```yaml
# config/load-test.yml
config:
  target: 'https://app.beauty-ai-precision.com'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 50
      name: "Load testing"
    - duration: 60
      arrivalRate: 100
      name: "Peak load"
  defaults:
    headers:
      Content-Type: 'application/json'

scenarios:
  - name: 'User journey'
    weight: 70
    flow:
      - get:
          url: '/api/health'
      - post:
          url: '/api/auth/login'
          json:
            email: 'test@example.com'
            password: 'password'
          capture:
            json: '$.token'
            as: 'token'
      - get:
          url: '/api/appointments'
          headers:
            Authorization: 'Bearer {{ token }}'
      - get:
          url: '/api/customers'
          headers:
            Authorization: 'Bearer {{ token }}'

  - name: 'AI Analysis'
    weight: 20
    flow:
      - post:
          url: '/api/analyze'
          headers:
            Authorization: 'Bearer {{ token }}'
            Content-Type: 'application/json'
          json:
            image: 'base64-image-data'
            clinic_id: 'test-clinic'
      - get:
          url: '/api/analyze/{{ analysisId }}'
          headers:
            Authorization: 'Bearer {{ token }}'

  - name: 'Public pages'
    weight: 10
    flow:
      - get:
          url: '/'
      - get:
          url: '/about'
      - get:
          url: '/contact'
```

### Performance Optimization
```bash
#!/bin/bash
# scripts/optimize-production.sh

echo "⚡ Optimizing production performance..."

# Analyze current performance
npm run performance:analyze

# Optimize database queries
npm run db:optimize:queries

# Optimize images and assets
npm run assets:optimize

# Update CDN configuration
npm run cdn:optimize

# Clear unnecessary caches
npm run cache:cleanup

echo "✅ Performance optimization complete"
```

---

## 👥 User Acceptance Testing (UAT)

### UAT Test Plan
```markdown
# User Acceptance Testing Plan

## Test Objectives
- Validate all business requirements are met
- Ensure user workflows function correctly
- Verify data integrity and security
- Confirm performance meets user expectations

## Test Users
- Clinic Owner: Full system access
- Clinic Staff: Daily operations
- Customer: Self-service features

## Test Scenarios

### Clinic Management
1. **Clinic Setup**
   - [ ] Create new clinic profile
   - [ ] Configure services and pricing
   - [ ] Set up staff accounts
   - [ ] Configure working hours

2. **Staff Management**
   - [ ] Add new staff members
   - [ ] Assign roles and permissions
   - [ ] Set up staff schedules
   - [ ] Manage staff access

### Customer Experience
3. **Customer Registration**
   - [ ] Sign up new customer
   - [ ] Complete profile setup
   - [ ] Upload photos for analysis
   - [ ] Set preferences and consents

4. **AI Skin Analysis**
   - [ ] Submit photos for analysis
   - [ ] Review AI recommendations
   - [ ] Schedule follow-up appointments
   - [ ] Track treatment progress

### Appointment Management
5. **Booking Process**
   - [ ] Search available time slots
   - [ ] Book appointments online
   - [ ] Receive confirmation emails
   - [ ] Modify/cancel appointments

6. **Appointment Execution**
   - [ ] Check-in process
   - [ ] Treatment documentation
   - [ ] Payment processing
   - [ ] Follow-up scheduling

### Administrative Functions
7. **Analytics & Reporting**
   - [ ] View dashboard metrics
   - [ ] Generate reports
   - [ ] Export data
   - [ ] Track business performance

8. **Inventory Management**
   - [ ] Manage product inventory
   - [ ] Track stock levels
   - [ ] Process orders
   - [ ] Generate purchase orders

## UAT Success Criteria
- [ ] All critical path scenarios pass
- [ ] No show-stopping bugs identified
- [ ] Performance meets user expectations
- [ ] Security requirements satisfied
- [ ] Data integrity maintained
- [ ] User training materials adequate
```

### UAT Execution Script
```bash
#!/bin/bash
# scripts/run-uat.sh

echo "🧪 Starting User Acceptance Testing..."

# Setup test environment
npm run uat:setup

# Run automated UAT tests
npm run uat:test:automated

# Generate UAT report
npm run uat:report

# Send results to stakeholders
npm run uat:notify:results

echo "✅ UAT complete - results sent to stakeholders"
```

---

## 📋 Go-Live Checklist

### Pre-Launch (T-24h)
- [ ] All code changes deployed to production
- [ ] Database migrations completed
- [ ] Environment variables configured
- [ ] Monitoring and alerting active
- [ ] Backup systems verified
- [ ] Rollback procedures tested
- [ ] Customer communication prepared

### Launch (T-0)
- [ ] Final health checks passed
- [ ] Load testing completed
- [ ] DNS switched to production
- [ ] SSL certificates valid
- [ ] CDN configured correctly
- [ ] External services connected

### Post-Launch (First 24h)
- [ ] Application responding correctly
- [ ] User logins working
- [ ] Core features functional
- [ ] No critical alerts triggered
- [ ] Customer feedback positive
- [ ] Support tickets monitored

### Week 1 Monitoring
- [ ] Performance metrics stable
- [ ] Error rates within acceptable limits
- [ ] User adoption growing
- [ ] Business metrics on track
- [ ] Support requests manageable

---

## 🎯 Success Metrics

### Technical Metrics
- **Uptime**: >99.9%
- **Response Time**: <2 seconds (API), <3 seconds (pages)
- **Error Rate**: <1%
- **AI Processing**: <5 seconds average

### Business Metrics
- **User Registration**: >100 new users/week
- **Appointment Booking**: >50 bookings/week
- **AI Analysis**: >200 analyses/week
- **Customer Satisfaction**: >4.5/5.0

### Performance Targets
- **Page Load**: <3 seconds
- **Time to Interactive**: <4 seconds
- **Core Web Vitals**: All 'Good'
- **Mobile Performance**: >85 Lighthouse score

---

## 🚨 Emergency Contacts

### Technical Team
- **Lead Engineer**: +66-XX-XXX-XXXX
- **DevOps**: +66-XX-XXX-XXXX
- **Database Admin**: +66-XX-XXX-XXXX

### Business Team
- **Product Manager**: +66-XX-XXX-XXXX
- **Customer Success**: +66-XX-XXX-XXXX
- **CEO**: +66-XX-XXX-XXXX

### External Partners
- **Hosting Provider**: Vercel Support
- **Database Provider**: Supabase Support
- **AI Services**: OpenAI/Anthropic Support
- **Payment Processor**: Stripe Support

---

*This production deployment guide ensures a smooth, monitored, and reversible launch of Beauty-with-AI-Precision with comprehensive testing and rollback capabilities.*
