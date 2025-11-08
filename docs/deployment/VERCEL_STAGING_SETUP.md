# Vercel Staging Environment Setup Guide

## 📋 Prerequisites

Before deploying to Vercel staging, ensure you have:

- ✅ Vercel account (free tier works for staging)
- ✅ GitHub repository connected
- ✅ Supabase project (staging database)
- ✅ Required API keys (Gemini, Hugging Face)
- ✅ Domain access (for staging.ai367bar.com)

---

## 🚀 Step-by-Step Deployment

### Step 1: Install Vercel CLI (Optional)

\`\`\`bash
npm i -g vercel
\`\`\`

Or use Vercel Dashboard (recommended for first deployment).

---

### Step 2: Create Vercel Project

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Click "Import Project"
3. Connect your GitHub account
4. Select repository: `Nutonspeed/ai367bar`
5. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./`
   - **Build Command:** `pnpm build`
   - **Install Command:** `pnpm install`
   - **Output Directory:** `.next` (auto-detected)
6. Click "Deploy" (will fail without env vars - that's OK)

#### Option B: Via CLI

\`\`\`bash
cd d:/127995803/ai367bar
vercel
\`\`\`

Follow prompts:
- Link to existing project? **No**
- What's your project's name? **ai367bar-staging**
- In which directory? **./`
- Auto-detected settings? **Yes**

---

### Step 3: Configure Environment Variables

#### Via Vercel Dashboard:

1. Go to your project settings: `https://vercel.com/[your-username]/ai367bar/settings/environment-variables`
2. Add the following variables for **Preview** environment:

**Required Variables:**

\`\`\`
NEXT_PUBLIC_APP_URL=https://ai367bar-staging.vercel.app
NODE_ENV=production

NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

NEXTAUTH_URL=https://ai367bar-staging.vercel.app
NEXTAUTH_SECRET=generate_32_char_secret_for_staging_here

GEMINI_API_KEY=your_gemini_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
\`\`\`

**Optional Variables:**

\`\`\`
GOOGLE_CLOUD_PROJECT_ID=your_project_id
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
SENTRY_DSN=https://...@sentry.io/...

NEXT_PUBLIC_ENABLE_AR_SIMULATOR=true
NEXT_PUBLIC_ENABLE_CHAT=true
NEXT_PUBLIC_ENABLE_BOOKING=true
NEXT_PUBLIC_ENABLE_PAYMENT=false
\`\`\`

#### Via CLI:

\`\`\`bash
# Set each variable
vercel env add NEXT_PUBLIC_APP_URL preview
# Enter value when prompted: https://ai367bar-staging.vercel.app

vercel env add NEXT_PUBLIC_SUPABASE_URL preview
# Enter value: https://[your-project].supabase.co

# Repeat for all required variables...
\`\`\`

---

### Step 4: Setup Staging Database (Supabase)

#### Option A: Create New Staging Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Configure:
   - **Name:** ai367bar-staging
   - **Database Password:** (save securely)
   - **Region:** Singapore (ap-southeast-1)
   - **Pricing Plan:** Free (for staging)
4. Wait for project creation (~2 minutes)

#### Option B: Use Same Production Project (Not Recommended)

- Use different schemas or table prefixes to separate staging/prod data
- Risk: Staging bugs could affect production data

#### Run Migrations:

\`\`\`bash
# Copy migrations to Supabase SQL Editor
# Run each migration in order:
# 1. SUPABASE_MIGRATION_clinics.sql
# 2. SUPABASE_MIGRATION_customers.sql
# 3. SUPABASE_MIGRATION_services.sql
# 4. SUPABASE_MIGRATION_bookings.sql
# 5. SUPABASE_MIGRATION_user_preferences.sql
# 6. SUPABASE_MIGRATION_foreign_keys.sql
\`\`\`

Or use Supabase CLI:

\`\`\`bash
npx supabase db push
\`\`\`

---

### Step 5: Configure Custom Domain (Optional)

#### Add Domain in Vercel:

1. Go to Project Settings → Domains
2. Add domain: `staging.ai367bar.com`
3. Copy DNS records shown (CNAME)

#### Update DNS (at your domain registrar):

\`\`\`
Type: CNAME
Name: staging
Value: cname.vercel-dns.com
TTL: 3600
\`\`\`

**Note:** DNS propagation can take 24-48 hours. Use `ai367bar-staging.vercel.app` in the meantime.

---

### Step 6: Deploy to Staging

#### Via Dashboard:

1. Go to your project's Deployments tab
2. Click "Redeploy" on the latest failed deployment
3. Or push to GitHub (triggers auto-deploy)

#### Via CLI:

\`\`\`bash
vercel --prod
\`\`\`

**Note:** Use `--prod` flag to deploy to production environment. Without it, deploys to preview.

For staging (preview environment):

\`\`\`bash
vercel
\`\`\`

---

### Step 7: Monitor Deployment

1. **Build Logs:** Watch in real-time in Vercel Dashboard
2. **Common Issues:**
   - Missing env vars → Add in project settings
   - Build timeout → Optimize build process
   - Out of memory → Upgrade Vercel plan or optimize bundle size

Expected build time: **2-5 minutes**

---

### Step 8: Smoke Test Staging

Once deployed, test critical flows:

#### 1. Homepage Load

\`\`\`
✅ Visit: https://ai367bar-staging.vercel.app
✅ Check: Page loads without errors
✅ Check: All images/assets load
\`\`\`

#### 2. Authentication

\`\`\`
✅ Register new account
✅ Verify email (if enabled)
✅ Login with credentials
✅ Check user session persists
\`\`\`

#### 3. Skin Analysis

\`\`\`
✅ Upload test image
✅ Wait for AI analysis (should complete in <30s)
✅ Check results display correctly
✅ Verify heatmap renders
✅ Export PDF report
\`\`\`

#### 4. AR Simulator

\`\`\`
✅ Load 3D model
✅ Test touch controls (rotate, zoom)
✅ Adjust treatment intensity
✅ Check before/after slider
\`\`\`

#### 5. Booking Flow

\`\`\`
✅ Select service
✅ Choose date/time
✅ Submit booking
✅ Verify database entry (check Supabase)
\`\`\`

#### 6. Database Connectivity

\`\`\`bash
# Check Supabase Dashboard
✅ Tables exist (clinics, customers, services, bookings)
✅ RLS policies enabled
✅ Test data inserted correctly
\`\`\`

---

## 🔍 Verify Deployment Checklist

Use this checklist to ensure staging is production-ready:

\`\`\`bash
# Run locally before deploying
pnpm type-check          # ✅ No TypeScript errors
pnpm lint                # ✅ No linting errors
pnpm test                # ✅ All tests pass
pnpm build               # ✅ Build succeeds
\`\`\`

After deployment:

- [ ] Homepage loads (no 500 errors)
- [ ] User registration works
- [ ] Login/logout works
- [ ] Image upload works
- [ ] AI analysis completes
- [ ] PDF export works
- [ ] AR simulator loads
- [ ] Database queries work
- [ ] API endpoints respond
- [ ] Error logging works (Sentry)
- [ ] Performance is acceptable (<3s page load)

---

## 📊 Monitoring & Debugging

### Vercel Analytics

Access at: `https://vercel.com/[username]/ai367bar/analytics`

**Metrics to watch:**
- **Page Views:** Should increase with beta users
- **Page Load Time:** Target <3s on 4G
- **Errors:** Target <2% error rate
- **Top Pages:** /analysis, /ar-simulator, /booking

### Vercel Logs

Access at: `https://vercel.com/[username]/ai367bar/logs`

**Filter by:**
- Status: 500 (server errors)
- Status: 404 (missing pages)
- Function: api/* (API errors)

### Supabase Logs

Access at: `https://supabase.com/dashboard/project/[id]/logs/explorer`

**Query examples:**

\`\`\`sql
-- Failed database queries
SELECT * FROM postgres_logs 
WHERE error_severity = 'ERROR' 
ORDER BY timestamp DESC 
LIMIT 100;

-- Slow queries (>1s)
SELECT * FROM postgres_logs 
WHERE query_duration > 1000 
ORDER BY timestamp DESC;
\`\`\`

---

## 🐛 Common Issues & Solutions

### 1. Build Fails - Missing Dependencies

**Error:** `Cannot find module 'xyz'`

**Solution:**
\`\`\`bash
# Locally
pnpm install xyz

# Commit package.json changes
git add package.json pnpm-lock.yaml
git commit -m "Add missing dependency xyz"
git push
\`\`\`

### 2. Runtime Error - Missing Environment Variable

**Error:** `process.env.SUPABASE_URL is undefined`

**Solution:**
- Add variable in Vercel Dashboard → Settings → Environment Variables
- Redeploy

### 3. Database Connection Fails

**Error:** `Connection to database failed`

**Solution:**
- Verify Supabase URL and keys are correct
- Check Supabase project is active (not paused)
- Verify database migrations ran successfully

### 4. API Timeout

**Error:** `Function execution timed out after 10s`

**Solution:**
- Increase timeout in `vercel.json`:
  \`\`\`json
  {
    "functions": {
      "app/api/**/*.ts": {
        "maxDuration": 30
      }
    }
  }
  \`\`\`

### 5. Image Upload Fails

**Error:** `File too large` or `Unsupported format`

**Solution:**
- Check Vercel file size limits (4.5MB for Hobby plan)
- Implement client-side image compression
- Use Supabase Storage for large files

---

## 📞 Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **AI367 Support:** support@ai367bar.com

---

## ✅ Success Criteria

Phase 9 is complete when:

- ✅ Vercel project created (staging)
- ✅ Environment variables configured
- ✅ Staging domain setup (or using Vercel subdomain)
- ✅ Deployment successful (green status)
- ✅ Smoke tests pass (5 critical flows tested)
- ✅ No critical errors in logs (first 24h)
- ✅ Performance acceptable (<3s page load)
- ✅ Ready for beta user testing (Phase 10)

**Estimated Time:** 4-6 hours (including DNS propagation)

---

**Next Phase:** Phase 10 - Beta User Recruitment (recruit 10-15 beta users)
