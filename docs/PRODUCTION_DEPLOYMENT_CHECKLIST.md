# 🚀 Production Deployment Checklist

**Date**: December 26, 2025  
**Target**: Vercel  
**Pilot Launch**: 9 วันจากนี้

---

## ✅ Pre-Deployment Checklist

### 1. Code Ready
- [x] All features complete (Day 1-6)
- [x] Mock data removed
- [x] APIs tested
- [x] Database optimized
- [x] Documentation complete
- [ ] Git commit all changes
- [ ] Push to GitHub

### 2. Environment Variables Prepared
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `GEMINI_API_KEY` (optional - for AI analysis)
- [ ] `RESEND_API_KEY` (optional - for emails)

### 3. Vercel Account
- [ ] Account created/logged in
- [ ] Payment method added (if needed)
- [ ] Team created (if needed)

---

## 📋 Step-by-Step Deployment

### Step 1: Commit & Push Code (5 นาที)

```bash
# Check status
git status

# Add all changes
git add .

# Commit
git commit -m "feat: complete bulk onboarding and beautician API for pilot launch"

# Push to main branch
git push origin main
```

**Verify:**
- ✅ All files pushed to GitHub
- ✅ No uncommitted changes

---

### Step 2: Create Vercel Project (10 นาที)

#### 2.1 Login to Vercel
1. Go to https://vercel.com
2. Login with GitHub account
3. Import project

#### 2.2 Import from GitHub
1. Click "Add New" → "Project"
2. Select repository: `Beauty-with-AI-Precision`
3. Configure project:
   ```
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: pnpm build
   Output Directory: .next
   Install Command: pnpm install
   ```

#### 2.3 Set Environment Variables
Go to "Environment Variables" และเพิ่ม:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://bgejeqqngzvuokdffadu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# AI Services (Optional)
GEMINI_API_KEY=your_gemini_key
GOOGLE_CLOUD_VISION_API_KEY=your_vision_key

# Email (Optional)
RESEND_API_KEY=your_resend_key

# Build Optimization
FAST_BUILD=1
```

**Important:** Set all variables for:
- ✅ Production
- ✅ Preview
- ✅ Development

---

### Step 3: Deploy (15 นาที)

#### 3.1 Start Deployment
1. Click "Deploy"
2. Wait for build (5-10 minutes)
3. Watch build logs

#### 3.2 Expected Build Time
```
Installing dependencies... (~2 min)
Building application... (~5-7 min with FAST_BUILD)
Uploading... (~1 min)
Total: ~8-10 minutes
```

#### 3.3 Build Success Indicators
- ✅ "Building..." → "Completed"
- ✅ "Deployed to production"
- ✅ URL generated: `https://your-app.vercel.app`

---

### Step 4: Verify Deployment (30 นาที)

#### 4.1 Basic Health Check
```bash
# Check if site is live
curl https://your-app.vercel.app

# Check health endpoint
curl https://your-app.vercel.app/api/health/database
```

**Expected Response:**
```json
{
  "success": true,
  "health": {
    "health_status": "healthy",
    "foreign_keys": 180,
    "indexes": 434
  }
}
```

#### 4.2 Test Critical APIs
```bash
# 1. Admin Clinics (should return 403 without auth)
curl https://your-app.vercel.app/api/admin/clinics

# 2. Sales Dashboard
curl https://your-app.vercel.app/th/sales/dashboard

# 3. Health Monitor
curl https://your-app.vercel.app/th/admin/health
```

#### 4.3 Test Pages Load
Open in browser:
1. ✅ Homepage: `https://your-app.vercel.app`
2. ✅ Sales Dashboard: `https://your-app.vercel.app/th/sales/dashboard`
3. ✅ Admin Health: `https://your-app.vercel.app/th/admin/health`
4. ✅ Clinic Team: `https://your-app.vercel.app/th/clinic/team`

---

### Step 5: Run Production Load Test (30 นาที)

```bash
# Update URL in load test
TEST_URL=https://your-app.vercel.app node scripts/load-test.js

# Or export environment variable
export TEST_URL=https://your-app.vercel.app
node scripts/load-test.js
```

**Expected Results:**
- Avg response: < 500ms
- Success rate: > 95%
- Rating: 🟢 Excellent

**If not meeting criteria:**
1. Check Vercel logs for errors
2. Check Supabase performance
3. Optimize slow queries
4. Add caching if needed

---

### Step 6: Setup Monitoring (30 นาที)

#### 6.1 Vercel Analytics
1. Go to project settings
2. Enable "Analytics"
3. Enable "Speed Insights"

#### 6.2 Error Tracking (Optional)
If using Sentry:
1. Add `SENTRY_DSN` to environment variables
2. Redeploy
3. Verify errors are tracked

#### 6.3 Uptime Monitoring
Setup external monitoring:
- UptimeRobot (free)
- Pingdom
- StatusCake

Monitor these endpoints:
- `https://your-app.vercel.app/api/health/database`
- `https://your-app.vercel.app/th/sales/dashboard`

---

## ✅ Post-Deployment Checklist

### Immediate (First Hour)
- [ ] All pages load correctly
- [ ] No 500 errors in logs
- [ ] Database connections working
- [ ] Health check returns "healthy"
- [ ] Load test passed

### First Day
- [ ] Monitor error logs (every 2 hours)
- [ ] Check performance metrics
- [ ] Test all critical user flows
- [ ] Verify bulk operations work
- [ ] Document any issues

### First Week
- [ ] Daily health checks
- [ ] Performance monitoring
- [ ] User feedback collection
- [ ] Bug fixes deployed
- [ ] Optimization iterations

---

## 🐛 Common Issues & Solutions

### Issue 1: Build Timeout
**Problem**: Build takes > 45 minutes  
**Solution:**
```bash
# Add to environment variables
FAST_BUILD=1

# Or modify package.json
"build": "FAST_BUILD=1 next build"
```

### Issue 2: API 500 Errors
**Problem**: APIs returning 500  
**Solution:**
1. Check Vercel logs: Project → Deployments → Logs
2. Verify environment variables are set
3. Check Supabase connection
4. Review API error messages

### Issue 3: Database Connection Failed
**Problem**: Cannot connect to Supabase  
**Solution:**
1. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Verify `SUPABASE_SERVICE_ROLE_KEY` has correct permissions
3. Check Supabase project is not paused
4. Test connection manually

### Issue 4: Pages Not Loading
**Problem**: 404 or routing errors  
**Solution:**
1. Check build logs for errors
2. Verify all pages are in correct directories
3. Clear Vercel cache and redeploy
4. Check middleware configuration

### Issue 5: Slow Performance
**Problem**: Response times > 1000ms  
**Solution:**
1. Enable Vercel Edge Network
2. Add caching headers
3. Optimize database queries
4. Use Vercel Edge Functions
5. Enable ISR (Incremental Static Regeneration)

---

## 📊 Success Metrics

### Day 1 (After Deploy)
- ✅ Uptime: 99.9%
- ✅ Avg response time: < 500ms
- ✅ Error rate: < 1%
- ✅ All APIs working

### Week 1 (After Pilot)
- ✅ 5 clinics onboarded
- ✅ 50 sales staff active
- ✅ 750 customers invited
- ✅ No critical bugs
- ✅ User satisfaction > 4/5

---

## 🔄 Rollback Plan

### If Critical Issues Found:

#### Quick Rollback (5 minutes)
1. Go to Vercel Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"
4. Verify rollback successful

#### Fix and Redeploy (30 minutes)
1. Fix issue locally
2. Test thoroughly
3. Commit and push
4. Vercel auto-deploys
5. Verify fix

---

## 📞 Support Contacts

### Vercel Support
- Dashboard: https://vercel.com/support
- Docs: https://vercel.com/docs
- Discord: https://vercel.com/discord

### Supabase Support
- Dashboard: https://supabase.com/dashboard
- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com

---

## 🎯 Next Steps After Deployment

### Immediate (Day 8)
1. Monitor for 24 hours
2. Fix any critical bugs
3. Optimize slow queries
4. Update documentation

### Day 9-12: Onboard Clinics
1. Clinic #1 (Day 9) - Test run
2. Fix issues from Clinic #1
3. Clinic #2-3 (Day 11)
4. Clinic #4-5 (Day 12)

### Day 13-14: Final Testing
1. Full system stress test
2. Performance optimization
3. Bug fixes
4. Documentation updates

### Day 15: Pilot Launch! 🚀
1. All 5 clinics live
2. Support team ready
3. Monitoring active
4. Success! 🎉

---

## 📝 Deployment Log Template

```markdown
## Deployment Log - [Date]

### Pre-Deployment
- [ ] Code committed: [commit hash]
- [ ] Environment variables: Set
- [ ] Tests passed: Yes/No

### Deployment
- Start time: [time]
- Build duration: [minutes]
- Deploy URL: [url]
- Status: Success/Failed

### Post-Deployment
- [ ] Health check: Passed
- [ ] Load test: [results]
- [ ] Pages tested: [list]
- [ ] Issues found: [list]

### Notes
[Any important notes]
```

---

## ✅ Deployment Complete Criteria

### Must Have (Critical)
- [x] All code deployed
- [ ] All APIs working
- [ ] Database connected
- [ ] Health check passing
- [ ] No 500 errors
- [ ] Load test > 90% success

### Should Have (Important)
- [ ] Monitoring setup
- [ ] Error tracking active
- [ ] Performance < 500ms avg
- [ ] Documentation updated
- [ ] Team notified

### Nice to Have (Optional)
- [ ] Custom domain configured
- [ ] CDN optimized
- [ ] Caching enabled
- [ ] SEO optimized

---

**Created**: December 26, 2025 06:07 AM UTC+7  
**Status**: Ready for deployment  
**Est. Time**: 2 hours total

---

**🚀 DEPLOY NOW!**
