# 🔑 API Keys Setup Guide - ClinicIQ

**Complete guide:** รับ API keys ทั้งหมดที่จำเป็นสำหรับ production

---

## 🎯 **Priority Levels**

| Priority | Service | Cost | Time Needed |
|----------|---------|------|-------------|
| 🔴 **P1** | Stripe | Free (fee per transaction) | 10 min |
| 🔴 **P1** | Resend | Free (3,000/month) | 5 min |
| 🟡 **P2** | Gemini AI | Free (1,500/day) | 5 min |
| 🟡 **P2** | Twilio SMS | Pay-as-you-go (~฿1/SMS) | 10 min |
| 🟢 **P3** | OpenAI | Paid (~$0.01-0.03/request) | 5 min |
| 🟢 **P3** | Anthropic | Paid (~$0.015/request) | 5 min |

---

## 🔴 **Priority 1 - MUST HAVE**

### **1. Stripe (Payment Gateway)**

**สำหรับ:** รับชำระเงินจากลูกค้า

**Cost:** ฟรี - เก็บ 3.6% + ฿10 per transaction

#### **Setup Steps:**

1. **สมัคร Account:**
   - ไปที่ https://dashboard.stripe.com/register
   - Fill in business information
   - Verify email

2. **Activate Your Account:**
   - Submit business documents
   - Add bank account (for receiving payouts)
   - Wait for approval (1-2 days)

3. **Get API Keys:**
   ```
   Dashboard > Developers > API keys
   ```
   - Switch to **Live mode** (top right toggle)
   - Copy **Publishable key** (pk_live_...)
   - Click **Reveal** and copy **Secret key** (sk_live_...)

4. **Setup Webhook:**
   ```
   Dashboard > Developers > Webhooks
   ```
   - Click **Add endpoint**
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Select events:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copy **Signing secret** (whsec_...)

#### **Environment Variables:**
```env
STRIPE_SECRET_KEY=sk_live_51...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### **Test Payment:**
```
Test card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
```

---

### **2. Resend (Email Service)**

**สำหรับ:** ส่งอีเมล notifications, receipts, etc.

**Cost:** ฟรี 3,000 emails/month (เพียงพอสำหรับเริ่มต้น)

#### **Setup Steps:**

1. **สมัคร Account:**
   - ไปที่ https://resend.com/signup
   - Sign up with GitHub or email
   - Verify email

2. **Get API Key:**
   ```
   Dashboard > API Keys > Create API Key
   ```
   - Name: "Production"
   - Copy key (re_...)

3. **Add Domain (Optional แต่แนะนำ):**
   ```
   Dashboard > Domains > Add Domain
   ```
   - Enter: `yourdomain.com`
   - Add DNS records (TXT, MX, CNAME)
   - Wait for verification (5-30 min)

4. **Without Domain (Quick Start):**
   - ใช้ `onboarding@resend.dev` (limited to 100 emails/day)
   - หรือใช้ verified email address

#### **Environment Variables:**
```env
RESEND_API_KEY=re_123...
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

#### **Test Email:**
```typescript
// Test in app or use Resend playground
const result = await resend.emails.send({
  from: 'noreply@yourdomain.com',
  to: 'your@email.com',
  subject: 'Test Email',
  html: '<p>Testing Resend API</p>'
});
```

---

## 🟡 **Priority 2 - RECOMMENDED**

### **3. Google Gemini AI (FREE)**

**สำหรับ:** AI skin analysis, recommendations

**Cost:** **ฟรี** 1,500 requests/วัน (ไม่ต้องใส่บัตร)

#### **Setup Steps:**

1. **Get API Key:**
   - ไปที่ https://aistudio.google.com/app/apikey
   - Sign in with Google account
   - Click **Create API Key**
   - Copy key

#### **Environment Variables:**
```env
GEMINI_API_KEY=AIza...
```

#### **Usage Limits:**
- Free tier: 1,500 requests/day
- Rate limit: 15 requests/minute
- No credit card required! 🎉

---

### **4. Twilio SMS (Optional)**

**สำหรับ:** SMS notifications, OTP

**Cost:** Pay-as-you-go (~฿1 per SMS to Thailand)

#### **Setup Steps:**

1. **สมัคร Account:**
   - ไปที่ https://www.twilio.com/try-twilio
   - Sign up and verify phone
   - Get free $15 credit for testing

2. **Get Credentials:**
   ```
   Console > Account > Settings
   ```
   - Copy **Account SID** (ACxxxxx...)
   - Copy **Auth Token** (click eye icon)

3. **Get Phone Number:**
   ```
   Console > Phone Numbers > Buy a number
   ```
   - Choose Thailand (+66) number
   - Cost: ~$1-2/month + usage

#### **Environment Variables:**
```env
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=abc123...
TWILIO_PHONE_NUMBER=+66812345678
```

#### **Test SMS:**
```typescript
// Test in app
await twilio.messages.create({
  body: 'Test SMS from ClinicIQ',
  from: '+66812345678',
  to: '+66812345679'
});
```

---

## 🟢 **Priority 3 - OPTIONAL**

### **5. OpenAI (Advanced AI)**

**สำหรับ:** GPT-4 vision for advanced skin analysis

**Cost:** ~$0.01-0.03 per request (credit card required)

#### **Setup Steps:**

1. **สมัคร Account:**
   - ไปที่ https://platform.openai.com/signup
   - Add payment method
   - Set spending limit (e.g., $10/month)

2. **Get API Key:**
   ```
   Account > API Keys > Create new secret key
   ```
   - Copy key (sk-proj-...)

#### **Environment Variables:**
```env
OPENAI_API_KEY=sk-proj-...
```

#### **Pricing:**
- GPT-4 Vision: $0.01 per request
- Recommended budget: $50-100/month for moderate use

---

### **6. Anthropic Claude (Alternative AI)**

**สำหรับ:** Claude 3.5 Sonnet for structured analysis

**Cost:** ~$0.015 per request

#### **Setup Steps:**

1. **สมัคร Account:**
   - ไปที่ https://console.anthropic.com/signup
   - Add payment method
   - Get $5 free credit

2. **Get API Key:**
   ```
   Account > API Keys > Create Key
   ```
   - Copy key (sk-ant-...)

#### **Environment Variables:**
```env
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 🔒 **Security Best Practices**

### **DO:**
- ✅ Store keys in Vercel Environment Variables
- ✅ Use different keys for dev/staging/production
- ✅ Rotate keys every 3-6 months
- ✅ Set spending limits on paid services
- ✅ Monitor usage regularly
- ✅ Use `.env.local` for local development (gitignored)

### **DON'T:**
- ❌ Commit keys to GitHub
- ❌ Share keys in Slack/email
- ❌ Use production keys in development
- ❌ Hardcode keys in code
- ❌ Give keys to third parties

---

## 📊 **Cost Summary**

### **Minimum to Launch (P1 only):**
| Service | Monthly Cost |
|---------|--------------|
| Stripe | ฿0 (3.6% + ฿10 per transaction) |
| Resend | ฿0 (free 3,000 emails) |
| **Total Fixed** | **฿0** |

### **Recommended Setup (P1 + P2):**
| Service | Monthly Cost |
|---------|--------------|
| Stripe | ฿0 + transaction fees |
| Resend | ฿0 (free tier) |
| Gemini AI | ฿0 (free 1,500/day) |
| Twilio SMS | ~฿50-200 (usage based) |
| **Total** | **฿50-200** |

### **Full Setup (P1 + P2 + P3):**
| Service | Monthly Cost |
|---------|--------------|
| Above | ฿50-200 |
| OpenAI | ฿1,500-3,000 |
| Anthropic | ฿750-1,500 |
| **Total** | **฿2,300-4,700** |

**แนะนำ:** เริ่มจาก P1 + P2 (ฟรี - ฿200/เดือน) ก่อน

---

## ✅ **Verification Checklist**

Before going live:
- [ ] Stripe: Live keys copied
- [ ] Stripe: Webhook configured
- [ ] Stripe: Test payment successful
- [ ] Resend: API key copied
- [ ] Resend: Test email sent
- [ ] Gemini: API key copied (if using)
- [ ] Twilio: Credentials copied (if using)
- [ ] All keys added to Vercel env vars
- [ ] Local `.env.local` has dev keys only
- [ ] `.env.local` in `.gitignore` ✅

---

## 🆘 **Need Help?**

### **Stripe Support:**
- Email: support@stripe.com
- Chat: Available 24/7 in dashboard
- Docs: https://stripe.com/docs

### **Resend Support:**
- Email: support@resend.com
- Discord: https://resend.com/discord
- Docs: https://resend.com/docs

### **Gemini Support:**
- Forum: https://ai.google.dev/support
- Docs: https://ai.google.dev/docs

---

**Next Step:** Deploy to Vercel → See `DEPLOYMENT_GUIDE.md`
