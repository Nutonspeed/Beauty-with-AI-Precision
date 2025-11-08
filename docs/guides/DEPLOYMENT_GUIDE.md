# 🚀 AI367 Beauty Platform - Deployment Guide

**Version:** 1.0 (Master Document)  
**Last Updated:** January 2025  
**Target Environment:** Production (Vercel + Supabase)  
**Prerequisites:** All code complete (90-95%), ready to deploy

> ⚠️ **NOTE:** This guide consolidates DEPLOYMENT_FINAL_CHECKLIST.md + MIGRATION_GUIDE.md + HOW_TO_RUN_SQL_MIGRATION.md

---

## 📋 Pre-Deployment Checklist

### System Requirements
- ✅ Next.js 16 application built
- ✅ All tests passing (136/136)
- ✅ Hugging Face API tested and working
- ✅ Git repository clean (no uncommitted changes)

### Accounts Needed
- [ ] **Vercel Account** - Free tier OK for MVP
- [ ] **Supabase Account** - Free tier OK (500MB DB, 1GB storage)
- [ ] **Hugging Face Account** - Free tier (API token ready)
- [ ] **Google Cloud Account** - Optional (if using Vision API)

---

## 🔐 Environment Variables Setup

### Current System (Free Tier)

Create `.env.local` file (already exists, verify values):

\`\`\`bash
# ========================================
# REQUIRED for Current System
# ========================================

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://bgejeqqngzvuokdffadu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Hugging Face API (FREE)
# Get your token from: https://huggingface.co/settings/tokens
HUGGINGFACE_TOKEN=your_huggingface_token_here

# ========================================
# OPTIONAL (Backup/Future)
# ========================================

# Google Cloud Vision API (Backup - Optional)
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json

# Gemini API (Future Upgrade - Optional)
GEMINI_API_KEY=your_gemini_key_here

# OpenAI API (Future Upgrade - Optional)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
\`\`\`

### ⚠️ Important Notes

**Currently Using:**
- ✅ Hugging Face API (free tier, no credit card needed)
- ✅ Supabase (free tier, 500MB DB)
- ⏳ Google Vision (optional backup, ฿9,665 credits available)

**NOT Required for MVP:**
- ❌ OpenAI API Key (mentioned in old docs, but we use Hugging Face instead)
- ❌ Gemini API Key (future upgrade option)

**If Deployment Fails:**
- First check: Hugging Face token valid?
- Second check: Supabase keys correct?
- Don't worry about: OpenAI/Gemini keys (not needed yet)

---

## 🗄️ Database Migration (Supabase)

### Step 1: Verify Supabase Project

1. Go to https://supabase.com/dashboard
2. Login to your account
3. Select project: `ai367bar` (or create new project if needed)
4. Note your project URL (should match `.env.local`)

### Step 2: Check if Migration Already Done

**Quick Check:**
1. In Supabase Dashboard → **Table Editor**
2. Look for table: `skin_analyses`
3. If exists with 35+ columns → **Migration already done, skip to Step 5**

### Step 3: Run Migration SQL (If Not Done)

**Option A: Supabase Dashboard (Recommended)**

1. Navigate to **SQL Editor** in left sidebar
2. Click **"New Query"** button
3. Open file: `supabase/migrations/20250101_skin_analyses.sql` in your project
4. **Copy ALL content** (Ctrl+A → Ctrl+C)
5. **Paste** into SQL Editor (Ctrl+V)
6. Click **"Run"** or press Ctrl+Enter
7. Wait 5-10 seconds

**Expected Output:**
\`\`\`
✅ CREATE TABLE skin_analyses
✅ CREATE INDEX idx_skin_analyses_user_id
✅ CREATE INDEX idx_skin_analyses_created_at
✅ CREATE INDEX idx_skin_analyses_overall_score
✅ CREATE POLICY "Users can view own analyses"
✅ CREATE POLICY "Clinic admins see clinic analyses"
✅ CREATE POLICY "Super admins see all"
✅ CREATE POLICY "Users can insert own analyses"
✅ INSERT INTO storage.buckets (id, name) VALUES ('skin-analysis-images', 'skin-analysis-images')
✅ CREATE POLICY (storage - 4 policies)
✅ CREATE TRIGGER update_skin_analyses_updated_at
\`\`\`

**If See Errors:**
- "already exists" → ✅ OK (means already created before)
- Other errors → Copy error message and debug

**Option B: Supabase CLI (Advanced)**

\`\`\`powershell
# Install Supabase CLI (if not installed)
scoop install supabase

# Login
supabase login

# Link to your project
supabase link --project-ref bgejeqqngzvuokdffadu

# Run migration
supabase db push

# Verify
supabase db diff
\`\`\`

### Step 4: Verify Migration Success

1. Go to **Table Editor** in Supabase Dashboard
2. Find table `skin_analyses`
3. Click to view structure

**Required Columns (35+):**
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key)
- `tenant_id` (uuid, foreign key)
- `image_url` (text)
- `analyzed_image_url` (text)
- `analysis_data` (jsonb)
- `overall_score` (integer 0-100)
- `visia_spots`, `visia_wrinkles`, `visia_texture`, etc. (8 metrics)
- `confidence_level` (text: low/medium/high)
- `processing_time_ms` (integer)
- `created_at`, `updated_at` (timestamp)

4. Check **Policies** tab → Should see 4 RLS policies
5. Check **Storage** → **Buckets** → Should see `skin-analysis-images` bucket

### Step 5: Test Database Connection

Run test script:

\`\`\`powershell
# Option 1: Direct test
pnpm tsx scripts/test-supabase-connection.ts

# Option 2: Via npm script (if configured)
pnpm test:db
\`\`\`

**Expected Output:**
\`\`\`
✅ Supabase connection successful
✅ Tables exist: skin_analyses, user_profiles, bookings
✅ Storage bucket 'skin-analysis-images' accessible
\`\`\`

---

## 🧪 Pre-Deployment Testing (Local)

### 1. Start Development Server

\`\`\`powershell
pnpm dev
\`\`\`

### 2. Test Core Flow

#### A. Upload & Analysis
1. Navigate to http://localhost:3000/analysis
2. Upload a face image (or use camera)
3. Click **"Start AI Analysis"**
4. Verify progress indicators appear
5. Wait 10-15 seconds

**Expected Console Logs:**
\`\`\`
[HYBRID] 🔬 === STARTING HYBRID AI ANALYSIS ===
[HYBRID] 📊 File Info: { name, type, size }
[HYBRID] ✅ Image validated
[HYBRID] 🤖 Analyzing with Hugging Face...
[HYBRID] 🎯 CV Algorithm: Detecting spots...
[HYBRID] 🎯 CV Algorithm: Analyzing pores...
[HYBRID] ✅ Hybrid analysis complete
[HYBRID] 📊 Analysis ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
[HYBRID] 🎯 Overall Score: 75
\`\`\`

6. Should redirect to `/analysis/detail/[id]`

#### B. Results Page
1. Verify **Overall Score** displays (0-100)
2. Check **6 Analysis Cards** show data:
   - Spots (VISIA score + severity)
   - Pores
   - Wrinkles
   - Texture
   - Redness
   - Hydration
3. Verify **3 Tabs** work:
   - Report (VISIA-style)
   - 3D View (Three.js model)
   - Simulator (AR effects)

#### C. Export Features
1. Click **"Export to PDF"** → Downloads PDF
2. Click **"Export to PNG"** → Downloads PNG
3. Click **"Share"** → Opens share dialog
4. Click **"Print"** → Opens print preview

#### D. 3D Viewer
1. Click **"3D View"** tab
2. Drag to rotate model (360°)
3. Scroll to zoom (50-200%)
4. Toggle heatmap layers

#### E. AR Simulator
1. Click **"Simulator"** tab
2. Adjust sliders (6 treatments)
3. Click preset buttons (Mild/Moderate/Intensive)
4. Verify before/after comparison

### 3. Check Console for Errors

**Should NOT see:**
- ❌ `Error: OpenAI API key not found` (we use Hugging Face, not OpenAI)
- ❌ `Error: Table 'skin_analyses' does not exist`
- ❌ `Error: Permission denied`

**OK to see:**
- ⚠️ Warnings about dev server
- ⚠️ React warnings (non-critical)

### 4. Run Automated Tests

\`\`\`powershell
pnpm test
\`\`\`

**Expected:**
- ✅ 136/136 tests passing
- ✅ 0 failures
- ⏭️ 26 skipped
- 📝 16 todo

---

## 🚀 Production Deployment (Vercel)

### Step 1: Prepare Repository

\`\`\`powershell
# Check git status
git status

# Commit any changes
git add .
git commit -m "chore: prepare for production deployment"

# Push to GitHub
git push origin main
\`\`\`

### Step 2: Deploy to Vercel

**Option A: Vercel CLI (Recommended)**

\`\`\`powershell
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod

# Follow prompts:
# - Link to existing project? Yes (if exists) / No (new project)
# - Project name: ai367bar
# - Framework: Next.js
# - Build command: (leave default)
# - Output directory: (leave default)
\`\`\`

**Option B: Vercel Dashboard**

1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Import from **GitHub**
4. Select repository: `ai367bar`
5. Framework Preset: **Next.js** (auto-detected)
6. Click **"Deploy"**

### Step 3: Configure Environment Variables in Vercel

1. In Vercel Dashboard → Select your project
2. Go to **Settings** → **Environment Variables**
3. Add the following variables:

**REQUIRED:**
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://bgejeqqngzvuokdffadu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
HUGGINGFACE_TOKEN=your_huggingface_token_here
\`\`\`

**OPTIONAL (Backup/Future):**
\`\`\`
GOOGLE_APPLICATION_CREDENTIALS=<paste JSON content from google-credentials.json>
GEMINI_API_KEY=your_gemini_key_here
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
\`\`\`

4. Set Environment: **Production, Preview, Development** (all three)
5. Click **"Save"**

### Step 4: Redeploy (If Variables Added After First Deploy)

\`\`\`powershell
vercel --prod
\`\`\`

Or in Vercel Dashboard:
1. Go to **Deployments** tab
2. Click **⋯** on latest deployment
3. Click **"Redeploy"**

### Step 5: Verify Production Deployment

1. Wait for build to complete (5-10 minutes)
2. Visit your production URL: `https://ai367bar.vercel.app`
3. Test same flow as local testing (upload → analyze → results)

**Check Production Logs:**
1. Vercel Dashboard → **Logs** tab
2. Filter: **Errors** only
3. Should be empty or minimal warnings

---

## 🔍 Post-Deployment Verification

### 1. Functional Tests

| Feature | Test | Status |
|---------|------|--------|
| Landing Page | Load homepage, check hero section | [ ] |
| User Login | Create account / login | [ ] |
| Image Upload | Upload image from computer | [ ] |
| Camera Capture | Take photo with camera | [ ] |
| Analysis Processing | Complete analysis in < 20s | [ ] |
| Results Display | See VISIA report with scores | [ ] |
| 3D Viewer | Rotate 3D model | [ ] |
| AR Simulator | Apply treatment effects | [ ] |
| Export PDF | Download PDF report | [ ] |
| Export PNG | Download PNG image | [ ] |
| History | View past analyses | [ ] |
| Profile | Update user profile | [ ] |

### 2. Performance Tests

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Homepage Load | < 2s | ___s | [ ] |
| Analysis Processing | < 20s | ___s | [ ] |
| Results Page Load | < 3s | ___s | [ ] |
| 3D Model Render | < 2s | ___s | [ ] |
| PDF Export | < 5s | ___s | [ ] |

### 3. Mobile Tests

- [ ] Responsive design works on mobile
- [ ] Camera access works on iOS Safari
- [ ] Camera access works on Android Chrome
- [ ] Touch gestures work (3D rotation, slider)
- [ ] Upload from mobile gallery works

### 4. Cross-Browser Tests

- [ ] Chrome (Desktop)
- [ ] Firefox (Desktop)
- [ ] Safari (Desktop)
- [ ] Edge (Desktop)
- [ ] iOS Safari (Mobile)
- [ ] Android Chrome (Mobile)

---

## 🐛 Troubleshooting

### Error: "Hugging Face API rate limited"

**Cause:** Free tier exceeded rate limits

**Solutions:**
1. **Short-term:** Wait 1 hour, try again
2. **Medium-term:** Enable Google Vision API as backup
3. **Long-term:** Consider paid Hugging Face tier (฿300-500/month)

**Code Fix (Auto-failover):**
\`\`\`typescript
// lib/ai/hybrid-skin-analyzer.ts already handles this
try {
  result = await huggingFaceAnalyzer.analyzeSkin(imageData)
} catch (error) {
  console.log('[HYBRID] Hugging Face failed, trying Google Vision...')
  result = await googleVisionAnalyzer.analyzeSkin(imageBuffer)
}
\`\`\`

### Error: "Table 'skin_analyses' does not exist"

**Cause:** Database migration not run

**Solution:** Go back to **Database Migration** section and complete Step 3

### Error: "Permission denied for table skin_analyses"

**Cause:** Row Level Security (RLS) policies not working

**Debug Steps:**
1. Check if user is logged in (JWT token exists)
2. Verify RLS policies in Supabase Dashboard → Policies tab
3. Test with different user roles (customer, clinic_admin, super_admin)

**Quick Fix:**
\`\`\`sql
-- Temporarily disable RLS for testing (NOT for production)
ALTER TABLE skin_analyses DISABLE ROW LEVEL SECURITY;
\`\`\`

### Error: "Image upload failed"

**Cause:** Storage bucket missing or policies wrong

**Solution:**
1. Supabase Dashboard → **Storage** → Buckets
2. Verify `skin-analysis-images` bucket exists
3. Check bucket policies (4 policies should exist)
4. Re-run migration SQL if missing

### Error: "Build failed on Vercel"

**Common Causes:**
- TypeScript errors (check with `pnpm build` locally first)
- Missing environment variables
- Node.js version mismatch

**Solution:**
\`\`\`powershell
# Local build test
pnpm build

# If passes locally but fails on Vercel:
# - Check Vercel Node.js version (Settings → General → Node.js Version)
# - Should be 18.x or 20.x
# - Match with local: node --version
\`\`\`

### Slow Analysis (> 30 seconds)

**Causes:**
- Large image file (> 5MB)
- Slow internet connection
- Hugging Face API slow response

**Solutions:**
1. Compress image before upload (< 2MB recommended)
2. Add loading indicator improvements
3. Implement client-side image resizing:

\`\`\`typescript
// Add to upload component
const resizeImage = async (file: File): Promise<File> => {
  // Resize to max 1920x1080
  // Compress to 80% quality
}
\`\`\`

---

## 📊 Monitoring Setup (Optional)

### Vercel Analytics (Built-in)

1. Vercel Dashboard → **Analytics** tab
2. View:
   - Page views
   - Top pages
   - Top referrers
   - Unique visitors

### Supabase Metrics

1. Supabase Dashboard → **Database** → **Query Performance**
2. Monitor:
   - Slow queries (> 1s)
   - Table sizes
   - Index usage

### Error Tracking (Recommended)

**Option 1: Sentry (Free tier available)**
\`\`\`powershell
npm install @sentry/nextjs

# Follow setup wizard
npx @sentry/wizard -i nextjs
\`\`\`

**Option 2: Vercel Logs**
- Basic logs included (free)
- View in **Logs** tab

---

## 📈 Scaling Considerations

### When to Upgrade Free Tiers

**Vercel:**
- Free: 100GB bandwidth/month
- Upgrade if: > 10,000 visitors/month
- Cost: $20/month (Pro)

**Supabase:**
- Free: 500MB database, 1GB storage
- Upgrade if: > 1,000 analyses stored OR > 5,000 images
- Cost: $25/month (Pro)

**Hugging Face:**
- Free: Rate limited (exact limits unknown)
- Upgrade if: Frequent rate limit errors
- Cost: ฿300-500/month (custom pricing)

### Performance Optimization

**If analysis > 20s consistently:**
1. Consider AI Gateway multi-model (see ROADMAP.md → Path A)
2. Implement client-side image preprocessing
3. Add Web Worker for non-blocking processing

**If 3D viewer slow:**
1. Reduce model complexity (fewer triangles)
2. Use LOD (Level of Detail) for zoom levels
3. Lazy load 3D viewer (only when tab clicked)

---

## ✅ Final Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] Supabase migration completed
- [ ] Production build succeeds (`pnpm build`)
- [ ] All tests passing (`pnpm test`)
- [ ] Manual testing completed (upload → analyze → results)
- [ ] Mobile testing completed (iOS + Android)
- [ ] Cross-browser testing completed
- [ ] Error logging setup (Sentry or Vercel Logs)
- [ ] Analytics enabled (Vercel Analytics)
- [ ] DNS configured (if custom domain)
- [ ] SSL certificate verified (https://)
- [ ] Backup plan ready (if Hugging Face down, use Google Vision)

---

## 🎉 Success Criteria

**Deployment considered successful when:**
- ✅ Production URL accessible (https://ai367bar.vercel.app)
- ✅ User can register/login
- ✅ User can upload image and receive analysis
- ✅ Analysis completes in < 20 seconds
- ✅ Results display correctly with VISIA scores
- ✅ 3D viewer and AR simulator work
- ✅ Export features work (PDF, PNG)
- ✅ No critical errors in production logs
- ✅ Mobile experience acceptable

---

## 📚 Related Documentation

- **PROJECT_STATUS.md** - Current system status
- **ROADMAP.md** - Future development plans
- **ARCHITECTURE.md** - Technical architecture
- **README.md** - Project overview

---

## 🆘 Support & Resources

**Documentation:**
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs

**API References:**
- Hugging Face Inference API: https://huggingface.co/docs/api-inference
- Google Vision API: https://cloud.google.com/vision/docs
- Supabase API: https://supabase.com/docs/reference

**Dashboards:**
- Vercel: https://vercel.com/dashboard
- Supabase: https://supabase.com/dashboard
- Hugging Face: https://huggingface.co/settings/tokens

---

**Deployment Guide Version:** 1.0  
**Maintained by:** DevOps Team  
**Last Deployment:** TBD (pending first production deploy)  
**Next Review:** After first deployment
