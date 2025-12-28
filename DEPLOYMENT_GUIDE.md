# 🚀 Vercel Deployment Guide - ClinicIQ

**Quick Setup:** Deploy to production ใน 15 นาที

---

## 📋 **Pre-requisites**

- [x] GitHub account
- [x] Vercel account (สมัครฟรีที่ https://vercel.com)
- [x] API keys พร้อม (Stripe, Resend)
- [x] Code pushed to GitHub

---

## 🎯 **Step-by-Step Deployment**

### **Step 1: เตรียม GitHub Repository**

```bash
# ตรวจสอบว่า code ล่าสุด committed แล้ว
git status

# Commit ถ้ายังไม่ได้ commit
git add .
git commit -m "Production ready - launch preparation"

# Push to GitHub
git push origin main
```

---

### **Step 2: Connect Vercel**

1. ไปที่ https://vercel.com/new
2. **Import Git Repository**
3. เลือก repository: `Beauty-with-AI-Precision`
4. กด **Import**

---

### **Step 3: Configure Build Settings**

#### **Framework Preset:**
- Framework: `Next.js`
- ✅ Auto-detected

#### **Root Directory:**
- Root: `./` (project root)
- ✅ Keep default

#### **Build Command:**
```bash
pnpm build
```

#### **Install Command:**
```bash
pnpm install
```

#### **Output Directory:**
- `.next` (auto-detected)

---

### **Step 4: Environment Variables (CRITICAL)**

คลิก **Environment Variables** และเพิ่มทั้งหมด:

#### **🔐 Supabase (Required):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://bgejeqqngzvuokdffadu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZWplcXFuZ3p2dW9rZGZmYWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MzM3NTQsImV4cCI6MjA3NzIwOTc1NH0.gJxg9TikqhQ7oVN5GsIP4IOYyfH3R_CLz5S55VwMQEE
SUPABASE_SERVICE_ROLE_KEY=[GET_FROM_SUPABASE_DASHBOARD]
```

#### **💳 Stripe (Required):**
```env
STRIPE_SECRET_KEY=sk_live_[YOUR_LIVE_KEY]
STRIPE_PUBLISHABLE_KEY=pk_live_[YOUR_LIVE_KEY]
STRIPE_WEBHOOK_SECRET=whsec_[YOUR_WEBHOOK_SECRET]
```

**⚠️ Important:** ใช้ **LIVE keys** ไม่ใช่ test keys!

#### **📧 Email - Resend (Required):**
```env
RESEND_API_KEY=re_[YOUR_API_KEY]
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

#### **🤖 AI Services (Optional):**
```env
GEMINI_API_KEY=[YOUR_GEMINI_KEY]
OPENAI_API_KEY=placeholder
ANTHROPIC_API_KEY=placeholder
GOOGLE_CLOUD_PROJECT_ID=placeholder
GOOGLE_APPLICATION_CREDENTIALS=placeholder
```

#### **📱 SMS - Twilio (Optional):**
```env
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=[YOUR_AUTH_TOKEN]
TWILIO_PHONE_NUMBER=+66xxxxxxxxx
```

#### **⚙️ App Configuration:**
```env
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app/api
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NEXT_PUBLIC_DEFAULT_LOCALE=th
```

#### **🚀 Feature Flags:**
```env
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_AI=true
NEXT_PUBLIC_ENABLE_AR=true
NEXT_PUBLIC_ENABLE_AR_FEATURES=true
NEXT_PUBLIC_ENABLE_VIDEO_CALLS=true
NEXT_PUBLIC_ENABLE_LIVE_CHAT=true
NEXT_PUBLIC_ENABLE_LOYALTY_PROGRAM=true
NEXT_PUBLIC_ENABLE_MARKETING_CAMPAIGNS=true
```

#### **🔧 Other Settings:**
```env
NODE_ENV=production
AI_SERVICE_URL=https://ai-service.cliniciq.app
API_RATE_LIMIT=100
MAX_FILE_SIZE_MB=10
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp
```

---

### **Step 5: Deploy! 🎉**

1. กด **Deploy**
2. รอ 3-5 นาที
3. ✅ Deployment สำเร็จ!

---

## 🔄 **After First Deployment**

### **1. Custom Domain Setup**

1. ไปที่ **Project Settings > Domains**
2. เพิ่ม domain: `www.cliniciq.com` (ตัวอย่าง)
3. Update DNS records:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. รอ DNS propagate (5-60 นาที)

### **2. Update Environment Variables**

อัปเดต URLs ให้ตรงกับ domain จริง:
```env
NEXT_PUBLIC_APP_URL=https://www.cliniciq.com
NEXT_PUBLIC_API_URL=https://www.cliniciq.com/api
NEXT_PUBLIC_SITE_URL=https://www.cliniciq.com
```

### **3. Stripe Webhook Setup**

1. ไปที่ https://dashboard.stripe.com/webhooks
2. กด **Add endpoint**
3. URL: `https://www.cliniciq.com/api/webhooks/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy **Webhook Secret** แล้วอัปเดตใน Vercel env vars

---

## ✅ **Post-Deployment Checklist**

### **Immediate (Within 1 hour):**
- [ ] Test homepage: `https://your-domain.vercel.app/th`
- [ ] Test all 3 languages (TH/EN/ZH)
- [ ] Test pricing page
- [ ] Test user registration
- [ ] Test login/logout
- [ ] Verify analytics tracking
- [ ] Check error logs in Vercel dashboard

### **Critical (Within 24 hours):**
- [ ] Test payment flow (small amount)
- [ ] Test email notifications
- [ ] Test SMS (if enabled)
- [ ] Verify Supabase RLS policies
- [ ] Check database backups enabled
- [ ] Monitor performance metrics
- [ ] Setup monitoring alerts

---

## 🚨 **Troubleshooting**

### **Build Failed:**
```bash
# Check build logs in Vercel dashboard
# Common issues:
- Missing environment variables
- TypeScript errors (usually warnings, safe to ignore)
- Out of memory (upgrade Vercel plan or enable FAST_BUILD)
```

**Solution:**
```env
# Add to Environment Variables:
FAST_BUILD=1
```

### **500 Internal Server Error:**
- ตรวจสอบ Supabase connection
- ตรวจสอบ env vars ครบหรือไม่
- ดู logs: Project > Logs > Function Logs

### **Images Not Loading:**
```javascript
// next.config.js - verify images config:
images: {
  domains: ['bgejeqqngzvuokdffadu.supabase.co'],
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**.supabase.co',
    },
  ],
}
```

### **API Routes 404:**
- ตรวจสอบ path: `/api/...` not `api/...`
- Verify API routes in `app/api/` directory
- Check middleware configuration

---

## 📊 **Monitoring & Analytics**

### **Vercel Analytics:**
1. Project Settings > Analytics
2. Enable **Web Analytics**
3. Enable **Speed Insights**

### **Supabase Dashboard:**
- Monitor database usage
- Check API requests
- Review storage usage
- Set up alerts for quota limits

### **Error Tracking (Optional):**
```env
# Add Sentry for error monitoring:
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project
```

---

## 🔄 **Continuous Deployment**

Vercel ตั้งค่า auto-deploy แล้ว:
- ✅ Push to `main` branch → Auto deploy to production
- ✅ Push to other branches → Preview deployments
- ✅ Pull requests → Preview deployments with unique URLs

---

## 🎯 **Performance Optimization**

### **Enable Caching:**
```javascript
// next.config.js
module.exports = {
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
}
```

### **Image Optimization:**
- Already enabled by Next.js Image component
- Vercel CDN serves optimized images

### **Edge Functions:**
- Middleware already optimized
- API routes run on Edge Runtime where possible

---

## 💰 **Cost Estimation**

### **Vercel Free Tier:**
- ✅ 100GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Automatic SSL
- ✅ Edge Network

**Upgrade if:**
- Bandwidth > 100GB/month
- Need team collaboration
- Need advanced analytics

### **Typical Monthly Cost:**
- Vercel: ฿0 (free tier sufficient for start)
- Supabase: ฿0 (free tier)
- Stripe: 3.6% + ฿10 per transaction (เก็บจากลูกค้า)
- Resend: ฿0 (free 3,000 emails)
- Total: **~฿0** fixed cost!

---

## 📞 **Support Resources**

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs
- **Community:** https://github.com/vercel/next.js/discussions

---

## ✅ **Success Criteria**

Your deployment is successful when:
- ✅ Homepage loads in < 3 seconds
- ✅ All 3 languages work
- ✅ User registration works
- ✅ Payment flow works (test transaction)
- ✅ Emails sent successfully
- ✅ No console errors
- ✅ Analytics tracking works
- ✅ Lighthouse score > 90

---

**🎉 Congratulations! Your production app is live!**

**Next:** Monitor logs for first 24 hours และ test ทุก critical features
