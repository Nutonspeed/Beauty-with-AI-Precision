# 📧 Email & SMS Setup Guide

## Quick Start (1-2 days)

### Step 1: Resend (Email) Setup (2-3 hours)

#### 1.1 Create Account
1. Go to https://resend.com/signup
2. Sign up (FREE: 3,000 emails/month)
3. Verify your email

#### 1.2 Get API Key
1. Go to https://resend.com/api-keys
2. Click "Create API Key"
3. Copy the key (starts with `re_`)
4. Add to `.env.local`:
```bash
RESEND_API_KEY="re_your-api-key-here"
EMAIL_FROM="noreply@yourdomain.com"
```

#### 1.3 Domain Setup (Recommended for Production)
1. Go to https://resend.com/domains
2. Click "Add Domain"
3. Enter your domain (e.g., `yourdomain.com`)
4. Add DNS records to your domain:
   - **SPF**: `v=spf1 include:_spf.resend.com ~all`
   - **DKIM**: Copy from Resend dashboard
   - **DMARC**: `v=DMARC1; p=none;`
5. Wait for verification (5-30 minutes)
6. Update `EMAIL_FROM` to use your domain:
```bash
EMAIL_FROM="noreply@yourdomain.com"
```

**For Testing (Skip Domain Setup):**
Use Resend's test domain: `onboarding@resend.dev`

---

### Step 2: Twilio (SMS) Setup (2-3 hours)

#### 2.1 Create Account
1. Go to https://www.twilio.com/try-twilio
2. Sign up (Start with trial: ~฿500 credit)
3. Verify your phone number

#### 2.2 Get Phone Number
1. Go to https://www.twilio.com/console/phone-numbers
2. Click "Buy a number"
3. **For Thailand:** Search for numbers with country code `+66`
4. Select a number (฿30-150/month)
5. Purchase the number

#### 2.3 Get API Credentials
1. Go to https://www.twilio.com/console
2. Copy from dashboard:
   - **Account SID** (starts with `AC`)
   - **Auth Token** (click to reveal)
   - **Phone Number** (the one you purchased)
3. Add to `.env.local`:
```bash
TWILIO_ACCOUNT_SID="ACxxxxx"
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_PHONE_NUMBER="+66812345678"
```

#### 2.4 Verify Test Numbers (Trial Only)
If using trial account:
1. Go to https://www.twilio.com/console/phone-numbers/verified
2. Add phone numbers you want to test with
3. Each number receives verification code via SMS

---

### Step 3: Test Notifications (30 minutes)

#### 3.1 Test Email
Create file: `test-email.ts`
```typescript
import { sendBookingConfirmationEmail } from '@/lib/notifications/email-service';

async function testEmail() {
  const result = await sendBookingConfirmationEmail({
    to: 'your-email@example.com',
    customerName: 'Test User',
    bookingDate: '25 ธันวาคม 2567',
    bookingTime: '14:00',
    treatment: 'Botox',
    clinicName: 'Test Clinic',
    bookingId: 'TEST-123',
  });
  console.log('Email result:', result);
}

testEmail();
```

Run: `tsx test-email.ts`

#### 3.2 Test SMS
Create file: `test-sms.ts`
```typescript
import { sendBookingConfirmationSMS } from '@/lib/notifications/sms-service';

async function testSMS() {
  const result = await sendBookingConfirmationSMS({
    to: '+66812345678', // Your phone number
    customerName: 'Test User',
    bookingDate: '25 ธันวาคม 2567',
    bookingTime: '14:00',
    treatment: 'Botox',
    clinicName: 'Test Clinic',
    bookingId: 'TEST-123',
  });
  console.log('SMS result:', result);
}

testSMS();
```

Run: `tsx test-sms.ts`

---

### Step 4: Deploy to Production

#### 4.1 Add Environment Variables to Vercel
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add for **Production**:
```
RESEND_API_KEY=re_your-key
EMAIL_FROM=noreply@yourdomain.com
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+66812345678
```

#### 4.2 Upgrade Twilio (Remove Trial Limits)
1. Go to https://www.twilio.com/console/billing
2. Add payment method
3. Upgrade to paid account
4. Now you can send to any phone number (not just verified)

---

## Features Implemented ✅

### Email Notifications
- ✅ Booking confirmation (with booking details)
- ✅ Booking reminder (24 hours before)
- ✅ Beautiful HTML templates
- ✅ Plain text fallback

### SMS Notifications
- ✅ Booking confirmation
- ✅ Booking reminder
- ✅ Payment success notification
- ✅ OTP verification

### Integration
- ✅ Automatic sending after payment success
- ✅ Error handling and logging
- ✅ Graceful degradation (if service unavailable)

---

## Pricing

### Resend (Email)
- **Free Tier:** 3,000 emails/month
- **Pro ($20/month):** 50,000 emails/month
- **Additional:** $1 per 1,000 emails

### Twilio (SMS)
- **Trial:** ~฿500 credit (to verified numbers only)
- **Standard:** ~฿0.50-1.00 per SMS (Thailand)
- **Phone Number:** ฿30-150/month

**Estimated Monthly Cost (1,000 users):**
- Resend: Free (within 3,000 limit)
- Twilio SMS: ฿1,000-1,500 (1,500 SMS × ฿0.80)
- **Total:** ~฿1,000-1,500/month

---

## Troubleshooting

### Email Issues

**Emails not received?**
- Check spam folder
- Verify `RESEND_API_KEY` is correct
- Check Resend dashboard → Logs for errors
- If using custom domain, verify DNS records

**Emails in spam?**
- Setup SPF, DKIM, DMARC records
- Use verified domain (not `@resend.dev`)
- Avoid spam trigger words in subject

### SMS Issues

**SMS not sent?**
- Verify phone number format: `+66812345678` (no spaces)
- Check Twilio dashboard → Logs
- Ensure phone number can receive SMS
- Check trial account verified numbers

**Trial limitations?**
- Can only send to verified numbers
- Messages include "Sent from Twilio trial account"
- Upgrade to remove limitations

### Code Issues

**Error: "Email service not configured"**
```bash
# Check .env.local has:
RESEND_API_KEY="re_..."
```

**Error: "SMS service not configured"**
```bash
# Check .env.local has all three:
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+66..."
```

---

## Next Steps

1. [ ] Setup Resend account and get API key
2. [ ] Setup Twilio account and get credentials
3. [ ] Test email sending locally
4. [ ] Test SMS sending locally
5. [ ] Verify domain for production emails
6. [ ] Upgrade Twilio account (remove trial limits)
7. [ ] Add environment variables to Vercel
8. [ ] Test booking flow with real notifications
9. [ ] Setup scheduled reminders (24h before booking)

---

## Support
- Resend Docs: https://resend.com/docs
- Resend Support: support@resend.com
- Twilio Docs: https://www.twilio.com/docs
- Twilio Support: https://support.twilio.com/
