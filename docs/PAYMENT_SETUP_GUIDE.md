# 🚀 Payment Gateway Setup Guide

## Quick Start (2-3 days)

### Step 1: Create Stripe Account (Day 1)
1. Go to https://dashboard.stripe.com/register
2. Fill in business information
3. **Important:** Verify your business (may take 3-7 days)
4. Complete bank account setup

### Step 2: Get API Keys (Day 1)
1. Navigate to https://dashboard.stripe.com/apikeys
2. Copy **Publishable key** (starts with `pk_test_`)
3. Copy **Secret key** (starts with `sk_test_`)
4. Add to `.env.local`:
```bash
STRIPE_SECRET_KEY="sk_test_your-key-here"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-key-here"
```

### Step 3: Setup Webhook (Day 1)
1. Go to https://dashboard.stripe.com/webhooks
2. Click "+ Add endpoint"
3. Enter URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `payment_intent.canceled`
5. Copy **Signing secret** (starts with `whsec_`)
6. Add to `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET="whsec_your-secret-here"
```

### Step 4: Test Payment (Day 2)
1. Start dev server: `pnpm dev`
2. Go to booking page
3. Use test card: **4242 4242 4242 4242**
   - Any future expiry date
   - Any 3-digit CVC
   - Any postal code
4. Complete payment
5. Check Stripe dashboard for test payment

### Step 5: Deploy to Production (Day 3)
1. **Switch to Live Mode** in Stripe dashboard
2. Get **live API keys** (start with `pk_live_` and `sk_live_`)
3. Update webhook endpoint to production URL
4. Add keys to **Vercel Environment Variables**:
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add for **Production** environment:
     - `STRIPE_SECRET_KEY`
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     - `STRIPE_WEBHOOK_SECRET`

## Features Implemented ✅

- ✅ Payment Intent creation
- ✅ Webhook handling (success/failure/cancel)
- ✅ Database integration (update booking status)
- ✅ Payment logging
- ✅ Error handling

## Test Cards

| Card Number | Behavior |
|------------|----------|
| 4242 4242 4242 4242 | ✅ Success |
| 4000 0000 0000 0002 | ❌ Declined |
| 4000 0000 0000 9995 | ❌ Insufficient funds |
| 4000 0025 0000 3155 | 🔐 Requires authentication |

## Next Steps

1. [ ] Complete Stripe business verification
2. [ ] Test booking flow with real payment
3. [ ] Setup email notifications for payment success
4. [ ] Configure refund handling
5. [ ] Add PromptPay support (Thailand specific)

## Troubleshooting

**Webhook not receiving events?**
- Check webhook URL is publicly accessible
- Verify signing secret matches
- Check Stripe dashboard > Webhooks > Recent deliveries

**Payment fails silently?**
- Check browser console for errors
- Verify API keys are correct
- Check Stripe logs in dashboard

**Local testing?**
- Use Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Get webhook secret from CLI output

## Support
- Stripe Docs: https://stripe.com/docs
- Stripe Support: https://support.stripe.com/
