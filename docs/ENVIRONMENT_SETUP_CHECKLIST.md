# 🚀 Environment Setup Checklist

## Overview
Complete checklist for setting up all environment variables for production deployment.

---

## ✅ Setup Checklist

### 1. Database (Supabase) - CRITICAL ⚠️
- [ ] Create Supabase project
- [ ] Copy database URL
- [ ] Copy API keys
- [ ] Enable RLS on all tables
- [ ] Run database migrations

**Environment Variables:**
```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..." # Server-side only
```

**Get from:** https://app.supabase.com/project/YOUR_PROJECT/settings/api

---

### 2. Payment Gateway (Stripe) - CRITICAL ⚠️
- [ ] Create Stripe account
- [ ] Complete business verification
- [ ] Enable payment methods
- [ ] Get API keys (test + production)
- [ ] Setup webhook endpoint
- [ ] Configure webhook events

**Environment Variables:**
```bash
# Test Keys (for development)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# Production Keys (for deployment)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."

STRIPE_WEBHOOK_SECRET="whsec_..." # From webhook setup
```

**Setup Steps:**
1. Go to https://dashboard.stripe.com/register
2. Complete business information
3. Navigate to: Developers → API Keys
4. Copy keys
5. Navigate to: Developers → Webhooks
6. Add endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
7. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`
8. Copy webhook signing secret

---

### 3. Email Service (Resend) - CRITICAL ⚠️
- [ ] Create Resend account
- [ ] Verify domain (or use resend.dev)
- [ ] Get API key
- [ ] Test email sending

**Environment Variables:**
```bash
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@yourdomain.com" # or "onboarding@resend.dev"
```

**Setup Steps:**
1. Go to https://resend.com/signup
2. Navigate to: API Keys → Create API Key
3. Copy API key
4. Optional: Add custom domain in Domains section
5. Test: Send test email from dashboard

**Pricing:**
- **Free:** 3,000 emails/month
- **Pro:** $20/month for 50,000 emails

---

### 4. SMS Service (Twilio) - CRITICAL ⚠️
- [ ] Create Twilio account
- [ ] Verify phone number
- [ ] Get phone number (+66 for Thailand)
- [ ] Get API credentials
- [ ] Test SMS sending

**Environment Variables:**
```bash
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_PHONE_NUMBER="+66812345678" # Your Twilio number
```

**Setup Steps:**
1. Go to https://www.twilio.com/try-twilio
2. Sign up and verify your email
3. Navigate to: Console → Account Info
4. Copy Account SID and Auth Token
5. Navigate to: Phone Numbers → Buy a Number
6. Select Thailand (+66) number (~฿250/month)
7. Test: Send test SMS from console

**Pricing:**
- **Phone Number:** ~฿250/month (~$7)
- **SMS:** ~฿1 per SMS (~$0.03)
- **Estimated:** ฿500-1,000/month for 250-750 SMS

---

### 5. AI Service - HIGH ⚠️
- [ ] Deploy Python AI service
- [ ] Get service URL
- [ ] Get Hugging Face token
- [ ] Optional: Get Gemini API key
- [ ] Test analysis endpoint

**Environment Variables:**
```bash
# Next.js app
AI_SERVICE_URL="https://your-service.railway.app"
NEXT_PUBLIC_HUGGINGFACE_TOKEN="hf_..." # Only if using client-side fallback

# Python service (Railway/Render)
HUGGINGFACE_TOKEN="hf_..."
GEMINI_API_KEY="your-gemini-key" # Optional
PORT=8000
```

**Setup Steps:**
1. Get Hugging Face token: https://huggingface.co/settings/tokens
2. Deploy to Railway (see AI_SERVICE_DEPLOYMENT_GUIDE.md)
3. Copy service URL
4. Optional: Get Gemini key: https://aistudio.google.com/app/apikey
5. Test: `curl https://your-service.railway.app/api/health`

**Pricing:**
- **Railway:** $5-10/month
- **Hugging Face:** Free
- **Gemini:** Free (1,500 requests/day)

---

### 6. Error Tracking (Sentry) - MEDIUM
- [ ] Create Sentry account
- [ ] Create project
- [ ] Get DSN
- [ ] Configure source maps

**Environment Variables:**
```bash
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."
SENTRY_AUTH_TOKEN="..." # For source maps upload
```

**Setup Steps:**
1. Go to https://sentry.io/signup/
2. Create new project (Next.js)
3. Copy DSN
4. Install: `pnpm add @sentry/nextjs`
5. Run: `npx @sentry/wizard@latest -i nextjs`
6. Follow setup wizard

**Pricing:**
- **Free:** 5,000 errors/month
- **Team:** $26/month for 50,000 errors

---

### 7. Analytics (Optional) - LOW
- [ ] Setup Google Analytics
- [ ] Or Vercel Analytics
- [ ] Get tracking ID

**Environment Variables:**
```bash
NEXT_PUBLIC_GA_TRACKING_ID="G-..." # Google Analytics
# OR
NEXT_PUBLIC_VERCEL_ANALYTICS=1 # Vercel Analytics
```

**Setup Steps:**
1. **Google Analytics:**
   - Go to https://analytics.google.com/
   - Create property
   - Copy Measurement ID
   
2. **Vercel Analytics:**
   - Already integrated in Vercel dashboard
   - Just enable in project settings

**Pricing:**
- **Google Analytics:** Free
- **Vercel Analytics:** $10/month (included in Pro)

---

### 8. Storage (Supabase Storage) - CRITICAL ⚠️
- [ ] Create storage bucket
- [ ] Configure RLS policies
- [ ] Get bucket URL

**Environment Variables:**
```bash
# Already set from Supabase setup
NEXT_PUBLIC_SUPABASE_URL="..." # Same as database
NEXT_PUBLIC_SUPABASE_ANON_KEY="..." # Same as database
```

**Setup Steps:**
1. In Supabase dashboard: Storage → New Bucket
2. Create bucket: `profile-images` (public)
3. Create bucket: `skin-analysis-images` (public)
4. Create bucket: `documents` (private)
5. Configure RLS policies for each bucket

**Pricing:**
- **Included:** 1GB storage (Free tier)
- **Additional:** $0.021/GB/month

---

### 9. Authentication (Supabase Auth) - CRITICAL ⚠️
- [ ] Configure email templates
- [ ] Setup OAuth providers (optional)
- [ ] Configure redirect URLs

**Environment Variables:**
```bash
# Already set from Supabase setup
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

**Setup Steps:**
1. In Supabase dashboard: Authentication → Email Templates
2. Customize templates (Thai language)
3. Authentication → URL Configuration
4. Add site URL: `https://your-domain.vercel.app`
5. Add redirect URLs: `https://your-domain.vercel.app/**`
6. Optional: Setup OAuth (Google, Facebook)

---

### 10. NextAuth.js (If using) - OPTIONAL
- [ ] Generate secret
- [ ] Configure providers
- [ ] Setup callbacks

**Environment Variables:**
```bash
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="generate-with-openssl" # openssl rand -base64 32
```

---

## 📋 Complete .env Template

Create `.env.local` file:

```bash
# ============================================
# DATABASE (Supabase) - CRITICAL
# ============================================
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."

# ============================================
# PAYMENT (Stripe) - CRITICAL
# ============================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..." # Use pk_live_... in production
STRIPE_SECRET_KEY="sk_test_..." # Use sk_live_... in production
STRIPE_WEBHOOK_SECRET="whsec_..."

# ============================================
# EMAIL (Resend) - CRITICAL
# ============================================
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# ============================================
# SMS (Twilio) - CRITICAL
# ============================================
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+66812345678"

# ============================================
# AI SERVICE - HIGH
# ============================================
AI_SERVICE_URL="https://your-service.railway.app"
NEXT_PUBLIC_HUGGINGFACE_TOKEN="hf_..." # Only if using client fallback

# ============================================
# ERROR TRACKING (Sentry) - MEDIUM
# ============================================
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."
SENTRY_AUTH_TOKEN="..."

# ============================================
# ANALYTICS (Optional) - LOW
# ============================================
NEXT_PUBLIC_GA_TRACKING_ID="G-..."
# OR
NEXT_PUBLIC_VERCEL_ANALYTICS=1

# ============================================
# AUTHENTICATION (NextAuth.js) - OPTIONAL
# ============================================
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="generate-with-openssl"

# ============================================
# APP CONFIG
# ============================================
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
NODE_ENV="production"
```

---

## 🚀 Deployment Steps

### 1. Local Development
1. Copy `.env.example` to `.env.local`
2. Fill in all required values
3. Test locally: `pnpm dev`
4. Verify all features work

### 2. Vercel Deployment
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables (all from `.env.local`)
4. Deploy

### 3. Post-Deployment
1. Test production URL
2. Configure Stripe webhook (use production URL)
3. Test payment flow end-to-end
4. Test email/SMS notifications
5. Monitor Sentry for errors
6. Check analytics

---

## 💰 Cost Summary

| Service | Tier | Monthly Cost | Annual Cost |
|---------|------|--------------|-------------|
| **Supabase** | Free | $0 | $0 |
| **Stripe** | Pay-as-you-go | 2.95% + ฿10 | Variable |
| **Resend** | Free | $0 | $0 |
| **Twilio** | Pay-as-you-go | ฿250-1,000 | ฿3,000-12,000 |
| **Railway** | Starter | ฿180 ($5) | ฿2,160 |
| **Sentry** | Free | $0 | $0 |
| **Vercel** | Hobby | $0 | $0 |
| **Domain** | Namecheap | ฿50 | ฿600 |
| **TOTAL** | | **฿480-1,430** | **฿5,760-14,760** |

**~฿850/month** average (~$25/month)

---

## 🔒 Security Checklist

- [ ] Never commit `.env.local` file
- [ ] Add `.env.local` to `.gitignore`
- [ ] Use environment variables in Vercel (never hardcode)
- [ ] Rotate API keys regularly
- [ ] Use different keys for test/production
- [ ] Enable Stripe webhook signature verification
- [ ] Limit Supabase service role key usage
- [ ] Use RLS policies for all database tables
- [ ] Enable Sentry error tracking
- [ ] Setup alerts for failed payments
- [ ] Monitor API usage and set limits

---

## 📞 Support & Documentation

- **Supabase:** https://supabase.com/docs
- **Stripe:** https://stripe.com/docs
- **Resend:** https://resend.com/docs
- **Twilio:** https://www.twilio.com/docs
- **Railway:** https://docs.railway.app/
- **Sentry:** https://docs.sentry.io/
- **Vercel:** https://vercel.com/docs

---

## ⏭️ Next Steps

After completing this checklist:
1. [ ] Complete PAYMENT_SETUP_GUIDE.md
2. [ ] Complete EMAIL_SMS_SETUP_GUIDE.md
3. [ ] Complete AI_SERVICE_DEPLOYMENT_GUIDE.md
4. [ ] Run E2E tests
5. [ ] Prepare for launch 🚀
