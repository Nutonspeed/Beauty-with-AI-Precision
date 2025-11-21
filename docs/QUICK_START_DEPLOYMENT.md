# 🚀 Quick Start Deployment Guide (2-3 Hours)

## Goal
Get the application deployed to production in **2-3 hours** with all critical features working.

---

## Phase 1: Immediate Setup (30 minutes)

### 1. Create Accounts (15 minutes)
Do these in parallel (open multiple tabs):

#### ✅ Stripe (Payment)
1. Go to https://dashboard.stripe.com/register
2. Sign up with email
3. **Important:** Complete business verification (required for production)
4. Get test API keys: Developers → API Keys
5. **Bookmark:** We'll setup webhooks later

#### ✅ Resend (Email)
1. Go to https://resend.com/signup
2. Sign up with GitHub
3. Create API key: API Keys → Create API Key
4. Copy key immediately
5. **Use onboarding@resend.dev** for from email (no domain setup needed)

#### ✅ Twilio (SMS)
1. Go to https://www.twilio.com/try-twilio
2. Sign up and verify email
3. Get Account SID & Auth Token: Console → Account Info
4. Buy Thailand number: Phone Numbers → Buy a Number → +66
5. **Cost:** ~฿250/month for number

#### ✅ Railway (AI Service)
1. Go to https://railway.app/
2. Sign up with GitHub
3. Don't deploy yet - we'll do this in Phase 2

#### ✅ Vercel (Hosting)
1. Go to https://vercel.com/signup
2. Sign up with GitHub
3. Don't deploy yet - we'll do this in Phase 3

### 2. Get Hugging Face Token (5 minutes)
1. Go to https://huggingface.co/settings/tokens
2. Sign up if needed
3. Create new token (read access)
4. Copy token (starts with `hf_`)

### 3. Prepare Environment Variables (10 minutes)
Create `DEPLOYMENT_VARS.txt` file with:
```bash
# STRIPE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..." # Leave empty for now

# RESEND
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="onboarding@resend.dev"

# TWILIO
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+66..."

# HUGGINGFACE
HUGGINGFACE_TOKEN="hf_..."

# SUPABASE (you should already have these)
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
```

---

## Phase 2: Deploy AI Service (30 minutes)

### Option A: Railway (Recommended) ⭐

#### 1. Prepare AI Service
```powershell
cd ai-service/

# Verify files exist
ls Dockerfile, requirements.txt, main.py
```

#### 2. Push to GitHub
```powershell
# Make sure ai-service is committed
git add ai-service/
git commit -m "Add AI service for deployment"
git push origin main
```

#### 3. Deploy to Railway
1. Open Railway dashboard: https://railway.app/dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway auto-detects `Dockerfile` in `ai-service/`
6. **Important:** Set root directory to `ai-service`
7. Click "Deploy"

#### 4. Add Environment Variables in Railway
In Railway dashboard:
1. Click your service
2. Variables tab
3. Add:
   ```bash
   HUGGINGFACE_TOKEN=hf_your-token
   PORT=8000
   ```
4. Save → Service will auto-restart

#### 5. Get Service URL
1. In Railway dashboard: Settings → Domains
2. Click "Generate Domain"
3. Copy URL (e.g., `https://your-service.up.railway.app`)
4. Test: Open URL in browser → should see API docs

#### 6. Verify Health
```powershell
curl https://your-service.up.railway.app/api/health
# Expected: {"status":"healthy","models_loaded":true}
```

#### 7. Update DEPLOYMENT_VARS.txt
Add:
```bash
AI_SERVICE_URL="https://your-service.up.railway.app"
```

### Option B: Client-Side Fallback (10 minutes) ⚡

If Railway takes too long or has issues:

#### 1. Install Package
```powershell
pnpm add @huggingface/inference
```

#### 2. Update DEPLOYMENT_VARS.txt
Add:
```bash
NEXT_PUBLIC_HUGGINGFACE_TOKEN="hf_..."
```

#### 3. Use Client-Side Analyzer
The app will automatically fallback to client-side analysis if AI_SERVICE_URL is not set.

---

## Phase 3: Deploy to Vercel (30 minutes)

### 1. Push Final Code
```powershell
# Commit everything
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### 2. Import Project to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** ./
   - **Build Command:** `pnpm build`
   - **Install Command:** `pnpm install`

### 3. Add Environment Variables
In Vercel project settings → Environment Variables:

**Copy-paste from DEPLOYMENT_VARS.txt:**
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
STRIPE_SECRET_KEY=...
RESEND_API_KEY=...
RESEND_FROM_EMAIL=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
AI_SERVICE_URL=...
```

**Important:** Select "Production, Preview, Development" for all variables

### 4. Deploy
1. Click "Deploy"
2. Wait 3-5 minutes
3. Copy production URL (e.g., `https://your-app.vercel.app`)

---

## Phase 4: Configure Webhooks (15 minutes)

### 1. Setup Stripe Webhook
1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. **Endpoint URL:** `https://your-app.vercel.app/api/webhooks/stripe`
4. **Events to send:**
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
5. Click "Add endpoint"
6. **Copy webhook signing secret** (starts with `whsec_`)

### 2. Update Vercel Environment Variables
1. Go to Vercel dashboard → Settings → Environment Variables
2. Find `STRIPE_WEBHOOK_SECRET`
3. Update value with the secret from Stripe
4. Save

### 3. Redeploy
1. In Vercel dashboard: Deployments
2. Find latest deployment
3. Click "..." → Redeploy

---

## Phase 5: Testing (30 minutes)

### 1. Test Authentication (5 minutes)
1. Visit your production URL
2. Click "Sign Up"
3. Create account with email
4. Check email for verification
5. Login

### 2. Test Booking Flow (10 minutes)
1. Login as user
2. Navigate to booking page
3. Select service (e.g., "Acne Treatment")
4. Select date/time
5. Upload skin image (optional)
6. Proceed to payment

### 3. Test Payment (10 minutes)
1. Use Stripe test card:
   ```
   Card: 4242 4242 4242 4242
   Expiry: 12/34
   CVC: 123
   ```
2. Complete payment
3. **Verify:**
   - ✅ Booking created in database
   - ✅ Email received (check spam)
   - ✅ SMS received

### 4. Test AI Analysis (5 minutes)
1. Navigate to AI analysis page
2. Upload test image (`test-images/face-sample.jpg`)
3. Wait for analysis
4. **Verify:**
   - ✅ Analysis results displayed
   - ✅ Recommendations shown
   - ✅ No errors in console

---

## Phase 6: Monitoring Setup (15 minutes)

### 1. Setup Sentry (Optional but Recommended)
1. Go to https://sentry.io/signup/
2. Create new project → Next.js
3. Copy DSN
4. Add to Vercel env: `NEXT_PUBLIC_SENTRY_DSN`
5. Redeploy

### 2. Vercel Analytics
1. In Vercel dashboard → Analytics
2. Enable Analytics (free with Hobby plan)
3. Monitor page views and performance

### 3. Setup Alerts
In Railway dashboard:
1. Settings → Notifications
2. Add email for:
   - Service crashes
   - High memory usage
   - Deployment failures

---

## ✅ Launch Checklist

Before announcing launch:

### Critical
- [ ] ✅ Authentication works (signup, login, reset password)
- [ ] ✅ Booking flow complete (select service → payment → confirmation)
- [ ] ✅ Payment processing works (test card)
- [ ] ✅ Email notifications sent
- [ ] ✅ SMS notifications sent
- [ ] ✅ AI analysis works (upload → analyze → results)
- [ ] ✅ All pages load without errors
- [ ] ✅ Mobile responsive (test on phone)

### Important
- [ ] ✅ Stripe webhook configured
- [ ] ✅ Custom domain configured (optional but recommended)
- [ ] ✅ Error tracking enabled (Sentry)
- [ ] ✅ Monitoring alerts setup
- [ ] ✅ Test all user roles (user, beautician, admin)

### Nice to Have
- [ ] Analytics enabled
- [ ] Custom email domain (instead of onboarding@resend.dev)
- [ ] Social login (Google, Facebook)
- [ ] SSL certificate (automatic with Vercel)

---

## 🚨 Common Issues & Fixes

### Issue: "Stripe webhook verification failed"
**Fix:**
1. Check `STRIPE_WEBHOOK_SECRET` is correct
2. Redeploy after updating env var
3. Test webhook in Stripe dashboard

### Issue: "Email not received"
**Fix:**
1. Check spam folder
2. Verify `RESEND_API_KEY` is correct
3. Check Resend dashboard for logs

### Issue: "SMS not received"
**Fix:**
1. Verify phone number format: `+66812345678`
2. Check Twilio dashboard for delivery status
3. Ensure phone number is verified (test mode)

### Issue: "AI analysis failed"
**Fix:**
1. Check `AI_SERVICE_URL` is correct
2. Test health endpoint: `curl $AI_SERVICE_URL/api/health`
3. Check Railway logs for errors
4. Fallback: Use client-side analyzer

### Issue: "Database error"
**Fix:**
1. Check Supabase dashboard → Database → Logs
2. Verify RLS policies enabled
3. Check `SUPABASE_SERVICE_ROLE_KEY` for server operations

---

## 💰 First Month Costs

| Service | Cost |
|---------|------|
| Vercel Hobby | Free |
| Supabase Free | Free |
| Railway Starter | ฿180 ($5) |
| Stripe (2.95% + ฿10/transaction) | Variable |
| Resend Free (3,000 emails) | Free |
| Twilio Phone | ฿250 |
| Twilio SMS (~50 SMS) | ฿50 |
| **Total** | **~฿480/month** |

**Assuming:**
- 20 bookings/month
- 50 SMS sent
- 100 emails sent
- No additional services

---

## 📈 Scaling Recommendations

### When you reach 100 users/month:
- [ ] Upgrade Railway to Pro ($10/month for better performance)
- [ ] Consider Resend Pro if emails > 3,000/month
- [ ] Setup CloudFlare for CDN & DDoS protection
- [ ] Enable Vercel Pro for better analytics

### When you reach 500 users/month:
- [ ] Upgrade Supabase to Pro ($25/month)
- [ ] Setup Redis for caching (Upstash - $10/month)
- [ ] Consider dedicated AI server (Railway Pro $20/month)
- [ ] Setup load testing (k6.io)

---

## 🎉 Post-Launch

After successful deployment:

### Day 1
- [ ] Monitor Sentry for errors
- [ ] Check all webhooks firing correctly
- [ ] Test on multiple devices
- [ ] Announce soft launch to friends/family

### Week 1
- [ ] Gather user feedback
- [ ] Fix urgent bugs
- [ ] Monitor costs (Stripe, Twilio, Railway)
- [ ] Optimize slow pages (Vercel Analytics)

### Month 1
- [ ] Review analytics data
- [ ] A/B test key flows
- [ ] Plan feature updates
- [ ] Scale infrastructure if needed

---

## 🆘 Emergency Contacts

**Urgent Issues:**
- Stripe: https://support.stripe.com/
- Vercel: https://vercel.com/support
- Supabase: https://supabase.com/support
- Railway: https://railway.app/help

**Community Support:**
- Next.js Discord: https://discord.gg/nextjs
- Supabase Discord: https://discord.supabase.com/
- Stripe Discord: https://discord.gg/stripe

---

## ✅ Success!

If all tests pass, you're ready to launch! 🚀

**Production URL:** `https://your-app.vercel.app`

**Admin Panel:** `https://your-app.vercel.app/admin`

**API Health:** `https://your-app.vercel.app/api/health`

---

## Next Steps After Launch

1. **Marketing:**
   - Create social media accounts
   - Setup Google My Business
   - Create promotional materials
   - Plan launch campaign

2. **Analytics:**
   - Monitor user behavior
   - Track conversion rates
   - Identify drop-off points
   - Optimize user flow

3. **Feature Development:**
   - Collect user feedback
   - Prioritize feature requests
   - Plan Q1 roadmap
   - Iterate quickly

**Good luck with your launch! 🎊**
