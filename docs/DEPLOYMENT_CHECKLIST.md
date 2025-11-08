# 🚀 AI367Bar - Production Deployment Checklist

## Overview
This checklist ensures all components are properly configured and tested before deploying to production.

**Last Updated**: 2025-01-08  
**Version**: 1.0.0

---

## 📋 Pre-Deployment Checklist

### 1. Database Setup ✅
- [ ] Supabase project created
- [ ] Database migrations executed (all 32 files)
- [ ] Tables verified (35+ tables)
- [ ] Indexes verified (50+ indexes)
- [ ] RLS policies verified (100+ policies)
- [ ] Functions and triggers verified (15+ functions)
- [ ] Initial super_admin user created
- [ ] Database backup configured

### 2. Environment Variables 🔐
- [ ] `.env.local` file configured with production values
- [ ] Supabase URL and keys set
- [ ] Google Cloud credentials configured
- [ ] AI API keys configured (Gemini, Hugging Face, OpenAI, Anthropic)
- [ ] Stripe keys configured (if using payments)
- [ ] Sentry DSN configured (optional)
- [ ] Performance monitoring enabled/disabled as needed
- [ ] All secrets rotated from development values
- [ ] Environment variables added to deployment platform (Vercel/other)

**Required Variables**:
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_APPLICATION_CREDENTIALS=
GOOGLE_CLOUD_PROJECT_ID=
GEMINI_API_KEY=
HUGGINGFACE_TOKEN=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_APP_URL=
```

### 3. Error Handling & Monitoring 🛡️
- [ ] Error Boundary integrated in root layout
- [ ] Performance monitoring initialized
- [ ] Error logs table created (`error_logs`)
- [ ] Performance metrics table created (`performance_metrics`)
- [ ] Admin error dashboard accessible (`/admin/errors`)
- [ ] Test error logging works
- [ ] Test performance tracking works
- [ ] Sentry configured (optional but recommended)

### 4. Authentication & Security 🔒
- [ ] Supabase Auth configured
- [ ] Email templates customized
- [ ] Password policies configured
- [ ] RLS policies tested
- [ ] Service role key secured (never exposed to client)
- [ ] CORS configured properly
- [ ] Rate limiting configured
- [ ] File upload size limits set

### 5. Features & Functionality ⚡
- [ ] AI skin analysis working
- [ ] Booking system functional
- [ ] Chat system operational
- [ ] Video calls tested (if enabled)
- [ ] Queue management working
- [ ] Loyalty program functional
- [ ] Marketing campaigns operational
- [ ] Inventory management working
- [ ] Before/after comparison working
- [ ] Progress tracking operational
- [ ] Multi-clinic features working (if applicable)

### 6. UI/UX & Mobile 📱
- [ ] Responsive design tested on mobile
- [ ] PWA manifest configured
- [ ] Service worker registered
- [ ] Offline mode tested
- [ ] Touch gestures working
- [ ] Dark mode functional
- [ ] Internationalization (Thai/English) working
- [ ] Loading states implemented
- [ ] Error states handled
- [ ] Success messages displayed

### 7. Performance Optimization ⚡
- [ ] Images optimized (next/image used)
- [ ] Lazy loading implemented
- [ ] Code splitting configured
- [ ] Bundle size optimized
- [ ] Database queries optimized (indexes used)
- [ ] API response times acceptable (<2s)
- [ ] Web Vitals measured (LCP, FID, CLS)
- [ ] Lighthouse score checked (>90)

### 8. Testing 🧪
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing (Playwright)
- [ ] Manual testing completed
- [ ] Cross-browser testing done (Chrome, Firefox, Safari, Edge)
- [ ] Mobile testing done (iOS, Android)
- [ ] Load testing completed
- [ ] Security testing done

### 9. Documentation 📚
- [ ] README.md updated
- [ ] API documentation complete
- [ ] Database schema documented
- [ ] Deployment guide created
- [ ] User manual prepared
- [ ] Admin manual prepared
- [ ] Troubleshooting guide available

### 10. Deployment Platform 🌐
- [ ] Deployment platform chosen (Vercel recommended)
- [ ] Project connected to Git repository
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] CDN configured
- [ ] Analytics integrated (Vercel Analytics)

---

## 🚀 Deployment Steps

### Step 1: Final Code Review
```bash
# Pull latest changes
git pull origin main

# Check for uncommitted changes
git status

# Review recent commits
git log --oneline -10
```

### Step 2: Run Tests
```bash
# Run all tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Check for TypeScript errors
pnpm typecheck

# Lint code
pnpm lint
```

### Step 3: Build Production Bundle
```bash
# Create production build
pnpm build

# Check build output
ls -lh .next/

# Test production build locally
pnpm start
```

### Step 4: Deploy Database Migrations
```bash
# Option 1: Supabase CLI
supabase db push

# Option 2: Use merged migration file
node scripts/merge-migrations.js
# Then run the merged file via Supabase Dashboard

# Option 3: Manual deployment
# Run each migration file individually via Supabase Dashboard
```

### Step 5: Verify Database
```sql
-- Check tables
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
-- Expected: 35+

-- Check RLS policies
SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';
-- Expected: 100+

-- Check indexes
SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';
-- Expected: 50+
```

### Step 6: Deploy Application

**Option A: Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to production
vercel --prod

# Or use Vercel Dashboard
# 1. Go to https://vercel.com
# 2. Import Git repository
# 3. Configure environment variables
# 4. Deploy
```

**Option B: Docker (Self-Hosted)**
```bash
# Build Docker image
docker build -t ai367bar .

# Run container
docker run -p 3000:3000 --env-file .env.local ai367bar

# Or use Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

### Step 7: Post-Deployment Verification

**1. Check Application Health**
```bash
# Test homepage
curl https://your-domain.com

# Test API health
curl https://your-domain.com/api/health
```

**2. Test Key Features**
- [ ] Homepage loads
- [ ] Authentication works (login/signup)
- [ ] AI analysis can be performed
- [ ] Booking can be created
- [ ] Chat system works
- [ ] Admin dashboard accessible
- [ ] Error logging works
- [ ] Performance monitoring active

**3. Monitor Errors**
- [ ] Check Supabase logs
- [ ] Check Vercel logs
- [ ] Check Sentry dashboard (if configured)
- [ ] Check `/admin/errors` dashboard

**4. Check Performance**
- [ ] Run Lighthouse audit
- [ ] Check Web Vitals
- [ ] Monitor API response times
- [ ] Check database query performance

---

## 📊 Performance Benchmarks

### Expected Metrics
- **Lighthouse Score**: >90 (Mobile & Desktop)
- **LCP (Largest Contentful Paint)**: <2.5s
- **FID (First Input Delay)**: <100ms
- **CLS (Cumulative Layout Shift)**: <0.1
- **TTFB (Time to First Byte)**: <800ms
- **API Response Time**: <2s (average)
- **Database Query Time**: <100ms (average)

### Tools for Monitoring
- Google Lighthouse
- WebPageTest
- Chrome DevTools
- Vercel Analytics
- Supabase Dashboard
- Sentry (if configured)

---

## 🔧 Troubleshooting

### Common Issues

**1. Build Fails**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
pnpm install
pnpm build
```

**2. Database Connection Fails**
- Check Supabase project status
- Verify environment variables
- Check RLS policies
- Review Supabase logs

**3. Authentication Not Working**
- Verify Supabase Auth settings
- Check redirect URLs configured
- Review CORS settings
- Check environment variables

**4. Images Not Loading**
- Verify Supabase Storage configured
- Check bucket permissions (public)
- Review RLS policies on storage
- Check file upload limits

**5. Performance Issues**
- Review database indexes
- Check for N+1 queries
- Optimize images
- Enable caching
- Use CDN

---

## 🔄 Rollback Plan

If deployment fails:

### 1. Revert Application
```bash
# Vercel: Revert to previous deployment
vercel rollback

# Git: Revert commits
git revert HEAD
git push origin main
```

### 2. Restore Database
```bash
# Supabase: Restore from backup
# Go to Dashboard > Database > Backups > Restore

# Or use pg_restore
pg_restore -h db.your-project.supabase.co \
  -U postgres -d postgres \
  --clean --if-exists \
  backup_file.dump
```

---

## 📞 Support & Monitoring

### Monitoring Checklist
- [ ] Uptime monitoring configured (UptimeRobot, Pingdom)
- [ ] Error alerts configured (email, Slack)
- [ ] Performance monitoring active
- [ ] Database monitoring configured
- [ ] Log aggregation set up

### Support Channels
- Supabase Support: https://supabase.com/support
- Vercel Support: https://vercel.com/support
- GitHub Issues: [Your repository]
- Email: [Your support email]

---

## 🎉 Post-Launch Tasks

After successful deployment:

1. **Announce Launch**
   - [ ] Notify stakeholders
   - [ ] Update status page
   - [ ] Social media announcement

2. **Monitor First 24 Hours**
   - [ ] Watch error logs closely
   - [ ] Monitor performance metrics
   - [ ] Check user feedback
   - [ ] Be ready for hotfixes

3. **Gather Feedback**
   - [ ] Set up user feedback form
   - [ ] Monitor support requests
   - [ ] Track feature usage
   - [ ] Plan improvements

4. **Documentation**
   - [ ] Update changelog
   - [ ] Document any issues encountered
   - [ ] Update runbooks
   - [ ] Create incident reports if needed

---

## ✅ Final Sign-Off

**Deployment Lead**: ___________________  
**Date**: ___________________  
**Environment**: [ ] Staging [ ] Production  
**All Checks Passed**: [ ] Yes [ ] No  

**Notes**:
```
[Add any additional notes or observations]
```

---

**Good luck with your deployment! 🚀**

Remember:
- Always backup before major changes
- Test thoroughly in staging first
- Have a rollback plan ready
- Monitor closely after deployment
- Communicate with stakeholders

For questions or issues, refer to the documentation in `/docs` folder.
