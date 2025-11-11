# Production Deployment Runbook
**Project:** Beauty with AI Precision  
**Platform:** Vercel  
**Production URL:** https://vercel.com/nuttapongs-projects-6ab11a57/beauty-with-ai-precision  
**Last Updated:** November 12, 2025

---

## Table of Contents
1. [Deployment Overview](#deployment-overview)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Deployment Process](#deployment-process)
4. [Post-Deployment Verification](#post-deployment-verification)
5. [Rollback Procedures](#rollback-procedures)
6. [Environment Variables](#environment-variables)
7. [Troubleshooting](#troubleshooting)
8. [Monitoring & Alerts](#monitoring--alerts)

---

## Deployment Overview

### Current Setup
- **Hosting:** Vercel (Automatic deployments from GitHub)
- **Database:** Supabase (PostgreSQL with RLS)
- **Domain:** Custom domain (if configured)
- **Framework:** Next.js 15.0.3
- **Node Version:** 20.x (recommended)

### Deployment Types
1. **Automatic Deployment** (Default)
   - Triggered by: `git push` to `main` branch
   - Build time: ~3-5 minutes
   - Zero-downtime deployment

2. **Preview Deployments**
   - Triggered by: Pull requests
   - Unique URL for each PR
   - Auto-cleanup after merge

---

## Pre-Deployment Checklist

### 1. Code Quality ✅
```bash
# Run all checks before pushing
pnpm lint          # ESLint check
pnpm tsc --noEmit  # TypeScript check
pnpm test          # Run tests (if available)
pnpm build         # Production build test
```

### 2. Database Migrations ⚠️
- [ ] Review any schema changes
- [ ] Run migrations on staging first (if available)
- [ ] Backup production database before major changes
- [ ] Document migration steps in commit message

### 3. Environment Variables 🔐
- [ ] Verify all required env vars are set in Vercel
- [ ] No secrets in code (check with `git grep`)
- [ ] Environment-specific configs correct

### 4. Feature Verification 🧪
- [ ] Test locally with production build (`pnpm build && pnpm start`)
- [ ] Verify new features work as expected
- [ ] Check mobile responsiveness
- [ ] Test on different browsers

### 5. Breaking Changes ⚠️
- [ ] Review API changes that might affect mobile apps
- [ ] Check backward compatibility
- [ ] Plan maintenance window if needed
- [ ] Notify users of downtime (if any)

---

## Deployment Process

### Standard Deployment (Git Push)

#### Step 1: Prepare Code
```bash
# Ensure you're on main branch
git checkout main
git pull origin main

# Verify no uncommitted changes
git status

# Review recent changes
git log --oneline -5
```

#### Step 2: Create Commit
```bash
# Stage all changes
git add .

# Create descriptive commit message
git commit -m "feat: Add new feature description

- Detail 1
- Detail 2
- Detail 3

BREAKING CHANGE: (if applicable)
Related issues: #123"
```

#### Step 3: Push to GitHub
```bash
# Push to main (triggers Vercel deployment)
git push origin main
```

#### Step 4: Monitor Deployment
1. Go to https://vercel.com/nuttapongs-projects-6ab11a57/beauty-with-ai-precision
2. Click on "Deployments" tab
3. Watch build logs in real-time
4. Wait for "Ready" status (usually 3-5 minutes)

### Emergency Hotfix Deployment

For critical production fixes:

```bash
# Create hotfix branch
git checkout -b hotfix/critical-bug-fix

# Make minimal changes
# ... edit files ...

# Commit and push
git add .
git commit -m "hotfix: Fix critical bug description"
git push origin hotfix/critical-bug-fix

# Create PR or merge directly to main (for emergencies)
git checkout main
git merge hotfix/critical-bug-fix
git push origin main
```

---

## Post-Deployment Verification

### 1. Deployment Status Check ✅
- [ ] Vercel deployment shows "Ready" status
- [ ] No build errors in logs
- [ ] Deployment URL is accessible

### 2. Health Check Endpoints 🏥
Test critical paths:

```bash
# Replace with your production URL
PROD_URL="https://your-production-url.vercel.app"

# Test homepage
curl -I $PROD_URL

# Test API health (if available)
curl $PROD_URL/api/health

# Test authentication endpoint
curl $PROD_URL/api/auth/user
```

### 3. Feature Verification 🧪

#### Super Admin Dashboard (Phase 3)
- [ ] Login as super admin
- [ ] Navigate to `/super-admin`
- [ ] Check **Subscriptions** page loads
- [ ] Check **Usage Monitoring** page loads
- [ ] Check **Billing** page loads
- [ ] Check **Analytics** page loads
- [ ] Test creating an invoice
- [ ] Test downloading PDF invoice
- [ ] Verify data is accurate

#### Critical User Flows
- [ ] User registration works
- [ ] Login/logout works
- [ ] Customer can book appointment
- [ ] Staff can view schedule
- [ ] Clinic admin can manage users
- [ ] AI analysis runs successfully

### 4. Performance Check 🚀
- [ ] Page load time < 3 seconds (Lighthouse)
- [ ] No console errors in browser
- [ ] Images loading correctly
- [ ] API response time < 500ms

### 5. Database Verification 🗄️
```sql
-- Run in Supabase SQL Editor
-- Check recent data
SELECT COUNT(*) FROM clinics;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM invoices;
SELECT COUNT(*) FROM audit_logs;

-- Check latest deployments don't break data
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;
```

---

## Rollback Procedures

### Immediate Rollback (Vercel UI)

#### Step 1: Access Vercel Dashboard
1. Go to https://vercel.com/nuttapongs-projects-6ab11a57/beauty-with-ai-precision
2. Click "Deployments" tab
3. Find the last working deployment (marked with ✅)

#### Step 2: Promote Previous Deployment
1. Click on the working deployment
2. Click "Promote to Production" button
3. Confirm promotion
4. Wait ~30 seconds for DNS propagation

**Rollback Time:** ~1 minute

### Git Revert (For Persistent Issues)

#### Option 1: Revert Last Commit
```bash
# Identify commit to revert
git log --oneline -5

# Revert the bad commit (creates new commit)
git revert <commit-hash>

# Push to trigger new deployment
git push origin main
```

#### Option 2: Hard Reset (Use with Caution)
```bash
# Find last good commit
git log --oneline -10

# Create backup branch
git branch backup-before-reset

# Reset to last good commit
git reset --hard <last-good-commit-hash>

# Force push (will trigger deployment)
git push origin main --force

# Notify team about force push
```

### Database Rollback

⚠️ **Only if schema changes were made**

```bash
# Restore from Supabase backup
# 1. Go to Supabase Dashboard
# 2. Navigate to Database > Backups
# 3. Select backup before deployment
# 4. Click "Restore"
# 5. Confirm restoration (takes 5-10 minutes)
```

---

## Environment Variables

### Required Variables on Vercel

#### Public Variables (Client-side accessible)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

#### Private Variables (Server-side only)
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
DATABASE_URL=postgresql://...
```

#### Optional Variables
```bash
# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Error Tracking
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASSWORD=xxx
```

### How to Update Environment Variables

#### Via Vercel Dashboard
1. Go to Project Settings
2. Click "Environment Variables"
3. Add/Edit/Delete variables
4. Select environments (Production, Preview, Development)
5. Click "Save"
6. **Important:** Redeploy for changes to take effect

#### Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Set environment variable
vercel env add VARIABLE_NAME production

# Pull environment variables
vercel env pull .env.local
```

---

## Troubleshooting

### Common Issues

#### 1. Build Fails on Vercel ❌

**Symptoms:** Deployment fails during build step

**Solutions:**
```bash
# Run build locally to reproduce
pnpm build

# Check TypeScript errors
pnpm tsc --noEmit

# Check for missing dependencies
pnpm install

# Clear cache and rebuild
rm -rf .next node_modules
pnpm install
pnpm build
```

#### 2. Environment Variable Issues 🔐

**Symptoms:** App works locally but not on Vercel

**Check:**
- [ ] All required env vars set in Vercel
- [ ] Variable names match exactly (case-sensitive)
- [ ] No extra spaces in values
- [ ] Redeploy after changing env vars

#### 3. Database Connection Errors 🗄️

**Symptoms:** "Failed to connect to database"

**Solutions:**
- [ ] Check Supabase service status
- [ ] Verify DATABASE_URL is correct
- [ ] Check Supabase IP whitelist (if enabled)
- [ ] Verify RLS policies aren't blocking queries

#### 4. 404 on New Routes 🔍

**Symptoms:** New pages return 404

**Solutions:**
- [ ] Ensure file is in correct directory (`app/` for Next.js 15)
- [ ] Check file naming convention (`page.tsx`, `route.ts`)
- [ ] Verify dynamic routes use correct syntax `[param]`
- [ ] Clear Vercel build cache

#### 5. API Route Timeouts ⏱️

**Symptoms:** API requests take too long

**Solutions:**
- [ ] Optimize database queries (add indexes)
- [ ] Reduce payload size
- [ ] Implement pagination
- [ ] Use Vercel Edge Functions for faster responses
- [ ] Check Supabase query performance

---

## Monitoring & Alerts

### Vercel Analytics

**Enable in Dashboard:**
1. Project Settings → Analytics
2. Enable "Web Analytics"
3. View metrics: Response time, Status codes, Traffic

**Key Metrics to Monitor:**
- 📊 Requests per minute
- ⏱️ Average response time
- ❌ Error rate (4xx, 5xx)
- 🌍 Geographic distribution

### Supabase Monitoring

**Database Metrics:**
1. Go to Supabase Dashboard
2. Navigate to "Reports"
3. Monitor:
   - Active connections
   - Query performance
   - Storage usage
   - API requests

### Error Tracking

#### Option 1: Vercel Logs
```bash
# Install Vercel CLI
vercel logs --follow

# View recent errors
vercel logs --since=1h
```

#### Option 2: Sentry (Recommended)
```bash
# Install Sentry
pnpm add @sentry/nextjs

# Configure in next.config.mjs
# Add SENTRY_DSN to environment variables
```

### Uptime Monitoring

**Recommended Tools:**
- **UptimeRobot** (Free) - Ping every 5 minutes
- **Better Uptime** (Paid) - Advanced monitoring
- **Vercel Pro** - Built-in monitoring

**Setup:**
1. Create account
2. Add URL: https://your-app.vercel.app
3. Set check interval: 5 minutes
4. Configure alerts (email, SMS, Slack)

---

## Performance Optimization

### Pre-Deployment Checklist

#### Image Optimization ✅
```tsx
// Use Next.js Image component
import Image from 'next/image'

<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority // For LCP images
  placeholder="blur" // Optional
/>
```

#### Code Splitting ✅
```tsx
// Dynamic imports for large components
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Loader />,
  ssr: false // Client-side only
})
```

#### API Route Optimization ✅
```typescript
// Add caching headers
export async function GET(request: Request) {
  // ... fetch data ...
  
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
    }
  })
}
```

---

## Maintenance Windows

### Planned Maintenance

**Before Maintenance:**
1. Announce 48 hours in advance
2. Post notice on dashboard
3. Send email to clinic admins
4. Schedule during low-traffic hours (2-4 AM local time)

**During Maintenance:**
```bash
# Create maintenance branch
git checkout -b maintenance/scheduled-update

# Enable maintenance mode (if implemented)
# Update environment variable: MAINTENANCE_MODE=true

# Perform updates
# ... make changes ...

# Test thoroughly
pnpm build
pnpm start

# Deploy
git push origin maintenance/scheduled-update
# Merge to main when ready
```

**After Maintenance:**
1. Disable maintenance mode
2. Verify all systems operational
3. Post completion notice
4. Monitor for issues (2 hours)

---

## Emergency Contacts

### Team Roles
- **Project Owner:** Nuttapong
- **Vercel Account:** nuttapongs-projects-6ab11a57
- **GitHub Repo:** Nutonspeed/Beauty-with-AI-Precision

### Support Contacts
- **Vercel Support:** https://vercel.com/help
- **Supabase Support:** https://supabase.com/support
- **Next.js Issues:** https://github.com/vercel/next.js/issues

---

## Deployment History Template

Keep a log of major deployments:

| Date | Version | Changes | Status | Rollback |
|------|---------|---------|--------|----------|
| 2025-11-12 | v3.4 | Phase 3: Billing & Analytics | ✅ Success | N/A |
| 2025-11-12 | v3.2 | Phase 3: Subscriptions & Usage | ✅ Success | N/A |
| YYYY-MM-DD | vX.X | Description | Status | Action |

---

## Quick Reference Commands

```bash
# Local Development
pnpm dev                    # Start dev server
pnpm build                  # Production build
pnpm start                  # Production server
pnpm lint                   # Lint check
pnpm tsc --noEmit          # Type check

# Git Operations
git status                  # Check status
git add .                   # Stage all
git commit -m "message"    # Commit
git push origin main       # Deploy to production
git log --oneline -10      # View history

# Vercel CLI
vercel                      # Deploy preview
vercel --prod              # Deploy to production
vercel logs                # View logs
vercel env pull            # Pull env vars
vercel rollback            # Rollback last deployment

# Database (Supabase)
# Use Supabase Studio: https://app.supabase.com
```

---

## Checklist: Pre-Launch Final Steps

Before launching Phase 3 features to production:

### Code Quality
- [x] All TypeScript errors fixed
- [x] Production build successful
- [x] ESLint warnings reviewed
- [ ] Security audit completed
- [ ] Code review by team

### Testing
- [ ] All new features tested locally
- [ ] Super admin dashboard tested
- [ ] Billing system tested (create, update, cancel, PDF)
- [ ] Analytics dashboard tested
- [ ] Mobile responsive tested
- [ ] Cross-browser tested (Chrome, Safari, Firefox)

### Database
- [ ] RLS policies verified
- [ ] Database backup created
- [ ] Migration scripts ready (if needed)
- [ ] Test data cleaned up

### Documentation
- [x] Security audit report created
- [x] Deployment runbook created
- [ ] API documentation updated
- [ ] User guide updated (if applicable)

### Vercel Configuration
- [ ] Environment variables verified
- [ ] Domain configured correctly
- [ ] SSL certificate active
- [ ] Analytics enabled

### Monitoring
- [ ] Error tracking configured (Sentry)
- [ ] Uptime monitoring enabled
- [ ] Performance monitoring enabled
- [ ] Alert notifications configured

### Communication
- [ ] Announce new features to users
- [ ] Update changelog
- [ ] Post on social media (if applicable)
- [ ] Notify stakeholders

---

## Success Criteria

✅ **Deployment is successful if:**
1. Build completes without errors
2. Vercel shows "Ready" status
3. All health checks pass
4. No increase in error rate
5. Response time within acceptable range (<500ms)
6. All critical features work correctly
7. No database connection issues
8. Mobile experience is smooth

❌ **Rollback if:**
1. Build fails repeatedly
2. Critical feature broken
3. Database errors
4. Error rate > 5%
5. Response time > 2 seconds
6. Security vulnerability detected

---

**Document Version:** 1.0  
**Last Reviewed:** November 12, 2025  
**Next Review:** December 12, 2025
