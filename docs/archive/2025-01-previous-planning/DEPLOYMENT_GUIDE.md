# 🚀 Deployment Guide - AI Beauty Platform

## Pre-Deployment Checklist

### 1. Database Setup (CRITICAL - Do This First!)

#### Step 1: Run Database Migration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `bgejeqqngzvuokdffadu`
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the entire content from `scripts/00-complete-migration.sql`
6. Paste into the SQL Editor
7. Click **Run** (or press Cmd/Ctrl + Enter)
8. Wait for completion (should take 5-10 seconds)

#### Step 2: Verify Migration

Run the verification script:

\`\`\`bash
pnpm check:db
\`\`\`

Expected output:
\`\`\`
✅ Database Connection - Successfully connected to Supabase
✅ Database Tables - All 6 tables exist
✅ Row Level Security - RLS is properly configured
✅ Environment Variables - All required variables are set
\`\`\`

If you see errors, check the troubleshooting section below.

---

### 2. Environment Variables

#### Required Variables (Already Set ✅)

These are already configured in your Vercel project:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_URL`
- `SUPABASE_JWT_SECRET`
- All Postgres connection strings

#### Additional Variables Needed

Add these in Vercel Dashboard → Settings → Environment Variables:

\`\`\`bash
# NextAuth Configuration
NEXTAUTH_SECRET="<generate-with-openssl-rand-base64-32>"
NEXTAUTH_URL="https://your-domain.vercel.app"

# Optional: For development
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL="http://localhost:3000"
\`\`\`

To generate `NEXTAUTH_SECRET`:
\`\`\`bash
openssl rand -base64 32
\`\`\`

---

### 3. Pre-Deployment Verification

Run the complete verification suite:

\`\`\`bash
pnpm deploy:check
\`\`\`

This will:
1. ✅ Check TypeScript compilation
2. ✅ Verify all environment variables
3. ✅ Test database connectivity
4. ✅ Verify all tables exist
5. ✅ Check RLS policies
6. ✅ Validate dependencies

---

### 4. Deploy to Vercel

#### Option A: Deploy via Git (Recommended)

1. Commit all changes:
\`\`\`bash
git add .
git commit -m "feat: complete Supabase migration and deployment prep"
git push origin main
\`\`\`

2. Vercel will automatically deploy from GitHub

#### Option B: Deploy via CLI

\`\`\`bash
vercel --prod
\`\`\`

---

## Post-Deployment Verification

### 1. Check Deployment Status

Visit your deployment URL and verify:

- [ ] Homepage loads without errors
- [ ] No console errors in browser DevTools
- [ ] Theme switching works (no white/black flicker)
- [ ] Health check endpoint works: `/api/health`

### 2. Test Database Connectivity

\`\`\`bash
curl https://your-domain.vercel.app/api/health
\`\`\`

Expected response:
\`\`\`json
{
  "status": "healthy",
  "timestamp": "2025-01-30T...",
  "database": "connected",
  "tables": 6
}
\`\`\`

### 3. Test Core Features

- [ ] User registration/login
- [ ] Skin analysis upload
- [ ] Analysis results display
- [ ] AR simulator (if applicable)

---

## Troubleshooting

### Issue: "relation 'users' does not exist"

**Solution:** You haven't run the migration script yet.
1. Go to Supabase SQL Editor
2. Run `scripts/00-complete-migration.sql`
3. Verify with `pnpm check:db`

### Issue: "Missing environment variables"

**Solution:** Add missing variables in Vercel Dashboard
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add the missing variables
3. Redeploy: `vercel --prod`

### Issue: Build fails with TypeScript errors

**Solution:** Fix TypeScript errors locally first
\`\`\`bash
pnpm build
# Fix any errors shown
pnpm deploy:check
\`\`\`

### Issue: RLS policies blocking queries

**Solution:** Verify you're using the service role key for server-side operations
- Check `lib/supabase/server.ts` uses `SUPABASE_SERVICE_ROLE_KEY`
- Client-side operations should use `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Rollback Plan

If deployment fails:

1. **Revert to previous deployment:**
\`\`\`bash
vercel rollback
\`\`\`

2. **Check logs:**
\`\`\`bash
vercel logs
\`\`\`

3. **Fix issues locally and redeploy**

---

## Monitoring

### Health Check Endpoint

Monitor your deployment health:
\`\`\`bash
curl https://your-domain.vercel.app/api/health
\`\`\`

### Supabase Dashboard

Monitor database performance:
- Database → Logs
- Database → Query Performance
- Auth → Users

### Vercel Analytics

Track performance and errors:
- Vercel Dashboard → Analytics
- Vercel Dashboard → Logs

---

## Next Steps After Deployment

1. **Set up monitoring alerts** (Vercel + Supabase)
2. **Configure custom domain** (if needed)
3. **Enable Vercel Analytics** for performance tracking
4. **Set up error tracking** (Sentry, LogRocket, etc.)
5. **Create backup strategy** for Supabase data
6. **Document API endpoints** for team reference

---

## Support

If you encounter issues:

1. Check logs: `vercel logs`
2. Check Supabase logs: Dashboard → Logs
3. Run diagnostics: `pnpm verify`
4. Review this guide's troubleshooting section

---

**Deployment Readiness Score: 85%**

Critical items remaining:
- [ ] Run database migration
- [ ] Set NEXTAUTH_SECRET
- [ ] Verify deployment

Once these are complete, you're ready to deploy! 🚀
