# Environment Variables Configuration

## Overview
This file documents all environment variables required for the Beauty with AI Precision platform.

---

## Required Variables

### Public Variables (Client-Side Accessible)

#### Supabase Configuration
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Application Configuration
```bash
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Private Variables (Server-Side Only)

#### Supabase Service Role
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Database Connection (Optional)
```bash
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

---

## Optional Variables

### Analytics & Monitoring
```bash
# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Sentry Error Tracking
SENTRY_DSN=https://xxx@o123456.ingest.sentry.io/123456
SENTRY_AUTH_TOKEN=your_sentry_auth_token
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project

# Vercel Analytics (automatically enabled on Vercel)
```

### Email Service (If using custom SMTP)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@yourapp.com
SMTP_PASSWORD=your_smtp_password
```

### AI Service (Python Backend)
```bash
AI_SERVICE_URL=http://localhost:8000
# or production: https://ai-service.yourapp.com
```

### Feature Flags
```bash
# Maintenance Mode
MAINTENANCE_MODE=false

# Feature Toggles
ENABLE_AI_ANALYSIS=true
ENABLE_BILLING=true
ENABLE_ANALYTICS=true
```

---

## Environment-Specific Configuration

### Development (.env.local)
```bash
# Supabase (Development Project)
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ_dev_key...
SUPABASE_SERVICE_ROLE_KEY=eyJ_dev_service_role...

# Local Development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Development AI Service
AI_SERVICE_URL=http://localhost:8000

# Debug Flags
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true
```

### Production (Vercel Environment Variables)
```bash
# Supabase (Production Project)
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ_prod_key...
SUPABASE_SERVICE_ROLE_KEY=eyJ_prod_service_role...

# Production URL
NEXT_PUBLIC_APP_URL=https://your-production-domain.com

# Production AI Service
AI_SERVICE_URL=https://ai-service.yourapp.com

# Production Settings
NODE_ENV=production
NEXT_PUBLIC_DEBUG=false
```

### Staging (Optional)
```bash
# Supabase (Staging Project)
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ_staging_key...
SUPABASE_SERVICE_ROLE_KEY=eyJ_staging_service_role...

# Staging URL
NEXT_PUBLIC_APP_URL=https://staging.your-app.vercel.app

# Staging Settings
NODE_ENV=production
NEXT_PUBLIC_DEBUG=false
```

---

## How to Set Up

### 1. Local Development

Create `.env.local` in project root:

```bash
# Copy the template
cp .env.example .env.local

# Edit with your values
nano .env.local
```

⚠️ **Important:** `.env.local` is in `.gitignore` - never commit it!

### 2. Vercel Production

#### Via Vercel Dashboard:
1. Go to https://vercel.com/your-project
2. Settings → Environment Variables
3. Add each variable:
   - **Name:** Variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - **Value:** Your secret value
   - **Environment:** Select Production, Preview, Development
4. Click "Save"
5. **Redeploy** for changes to take effect

#### Via Vercel CLI:
```bash
# Login to Vercel
vercel login

# Link project
vercel link

# Add environment variable
vercel env add VARIABLE_NAME production

# Pull all environment variables
vercel env pull .env.local
```

---

## Security Best Practices

### DO ✅
- ✅ Use different values for dev/staging/prod
- ✅ Rotate secrets regularly (every 90 days)
- ✅ Use Vercel's encrypted storage
- ✅ Limit access to environment variables
- ✅ Use service role key only on server-side
- ✅ Document all variables in this file

### DON'T ❌
- ❌ Commit `.env.local` to git
- ❌ Share secrets via email/chat
- ❌ Use production credentials in development
- ❌ Expose service role key to client
- ❌ Hardcode secrets in source code
- ❌ Log sensitive environment variables

---

## Getting Credentials

### Supabase Keys

1. Go to https://app.supabase.com
2. Select your project
3. Settings → API
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** (secret!) → `SUPABASE_SERVICE_ROLE_KEY`

### Database URL

From Supabase:
1. Settings → Database
2. Connection string → URI
3. Copy connection pooler URL
4. Replace `[YOUR-PASSWORD]` with your database password

### Google Analytics ID

1. Go to https://analytics.google.com
2. Admin → Property → Data Streams
3. Copy Measurement ID (G-XXXXXXXXXX)

### Sentry DSN

1. Go to https://sentry.io
2. Create project
3. Settings → Client Keys (DSN)
4. Copy DSN URL

---

## Validation Script

Check if all required variables are set:

```bash
# Run this script to validate environment
node scripts/validate-env.js
```

Create `scripts/validate-env.js`:

```javascript
const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
]

const missing = required.filter(key => !process.env[key])

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:')
  missing.forEach(key => console.error(`  - ${key}`))
  process.exit(1)
}

console.log('✅ All required environment variables are set')
```

---

## Troubleshooting

### Issue: "Invalid API key"
**Solution:** Check that `NEXT_PUBLIC_SUPABASE_ANON_KEY` matches your Supabase project

### Issue: "Service role key required"
**Solution:** Verify `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel environment variables

### Issue: Environment variables not updating
**Solution:** 
1. Update variables in Vercel dashboard
2. **Trigger new deployment** (variables aren't hot-reloaded)
3. Use `vercel env pull` to sync locally

### Issue: Different behavior on Vercel vs Local
**Solution:**
1. Check environment-specific values
2. Use `vercel env pull` to get production values locally
3. Verify all variables are set for "Production" environment in Vercel

---

## Environment Variable Checklist

Before deploying to production:

### Required Variables ✅
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Set in Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Set in Vercel
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Set in Vercel (server-only)
- [ ] `NEXT_PUBLIC_APP_URL` - Set to production domain

### Optional but Recommended ⚠️
- [ ] `SENTRY_DSN` - For error tracking
- [ ] `NEXT_PUBLIC_GA_ID` - For analytics
- [ ] `AI_SERVICE_URL` - If using AI service

### Security Checks 🔒
- [ ] No secrets in git history
- [ ] Different keys for dev/prod
- [ ] Service role key is secret (not public)
- [ ] `.env.local` in `.gitignore`

---

## Contact

For questions about environment variables:
- **Vercel Support:** https://vercel.com/help
- **Supabase Support:** https://supabase.com/support
- **Project Owner:** Nuttapong

---

**Last Updated:** November 12, 2025  
**Next Review:** December 12, 2025
