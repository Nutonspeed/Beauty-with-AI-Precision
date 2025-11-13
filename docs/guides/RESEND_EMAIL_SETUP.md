# Resend Email Setup Guide

## 🚀 Quick Start

### 1. Create Resend Account
1. Go to [resend.com](https://resend.com)
2. Sign up for free account
3. Verify your email

### 2. Get API Key
1. Go to [resend.com/api-keys](https://resend.com/api-keys)
2. Click "Create API Key"
3. Name it (e.g., "Beauty Clinic - Production")
4. Copy the API key (starts with `re_`)

### 3. Add Domain (Production)
1. Go to [resend.com/domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter your domain (e.g., `yourdomain.com`)
4. Add DNS records to your domain provider:
   - SPF record
   - DKIM record
5. Verify domain (takes a few minutes)

### 4. Configure Environment Variables

Update `.env.local`:

```bash
# Resend Email Configuration
RESEND_API_KEY=re_your_actual_api_key_here
RESEND_FROM_EMAIL=Beauty Clinic <noreply@yourdomain.com>

# Application URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**For Development (Testing):**
```bash
RESEND_FROM_EMAIL=Beauty Clinic <onboarding@resend.dev>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

⚠️ **Note:** `onboarding@resend.dev` works for testing but has limitations.

---

## 📧 Email Features

### ✅ What's Included:

1. **Professional HTML Template**
   - Gradient header
   - Role badge with color coding
   - Clinic information (if applicable)
   - CTA button with invitation link
   - Expiry date warning
   - Alternative plain-text link
   - Responsive design

2. **Plain Text Fallback**
   - Full content in plain text
   - Works when HTML is disabled

3. **Automatic Sending**
   - Triggered on `POST /api/invitations`
   - Error handling (doesn't fail invitation creation)
   - Logs success/failure

4. **Dynamic Content**
   - Inviter name and email
   - Role-specific messaging
   - Clinic name (for non-owner roles)
   - Thai language support
   - Expiry date in Thai format

---

## 🧪 Testing

### Test Email Sending (Development):

```bash
# 1. Update .env.local with RESEND_API_KEY
# 2. Restart dev server
pnpm dev

# 3. Create invitation via API:
curl -X POST http://localhost:3000/api/invitations \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "email": "test@example.com",
    "invited_role": "customer"
  }'

# 4. Check your email inbox
```

### Debug Email Logs:

Check terminal for:
- ✅ Email sent successfully: [message-id]
- ⚠️ Failed to send invitation email: [error]

---

## 📊 Resend Dashboard

Monitor emails at: [resend.com/emails](https://resend.com/emails)

**You can see:**
- ✅ Sent emails
- ❌ Failed emails
- 📈 Delivery stats
- 🔍 Email content preview
- 📧 Open/click tracking (if enabled)

---

## 💰 Pricing

**Free Tier:**
- 100 emails/day
- 1 domain
- Perfect for testing

**Pro Plan (if needed):**
- $20/month
- 50,000 emails/month
- Multiple domains
- Advanced analytics

---

## 🎨 Email Preview

**Subject:** คำเชิญเข้าใช้งานระบบ Beauty Clinic - [Role Name]

**Body includes:**
- 🎉 Welcome header with gradient
- 👤 Inviter information
- 🏢 Clinic name (if applicable)
- 🎫 Role badge with Thai translation
- 🔗 Prominent CTA button
- ⏰ Expiry date warning
- 📋 Alternative link for copy-paste
- 📞 Help text

---

## 🔧 Troubleshooting

### Email not sending?

1. **Check API Key**
   ```bash
   # Verify in .env.local
   echo $RESEND_API_KEY
   ```

2. **Check Logs**
   - Look for errors in terminal
   - Check Resend dashboard

3. **Test API Key**
   ```bash
   curl https://api.resend.com/domains \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

4. **Verify From Email**
   - Use `onboarding@resend.dev` for testing
   - Use verified domain for production

### Email in spam?

- Add SPF and DKIM records
- Verify domain in Resend
- Ask recipients to whitelist your domain

---

## 🚀 Production Checklist

- [ ] Create Resend account
- [ ] Get API key
- [ ] Add and verify domain
- [ ] Update `RESEND_API_KEY` in production env
- [ ] Update `RESEND_FROM_EMAIL` with verified domain
- [ ] Update `NEXT_PUBLIC_APP_URL` with production URL
- [ ] Test email sending
- [ ] Monitor Resend dashboard

---

## 📝 Next Steps

After email setup:
1. Test invitation flow end-to-end
2. Add Super Admin UI for clinic creation
3. Test multi-role invitation chain
4. Add email resend functionality (optional)
5. Add email templates for other notifications (optional)

---

## 🔗 Useful Links

- [Resend Documentation](https://resend.com/docs)
- [Resend Node.js SDK](https://github.com/resendlabs/resend-node)
- [Email Best Practices](https://resend.com/docs/send-with-nodejs)
- [Domain Setup Guide](https://resend.com/docs/dashboard/domains/introduction)
