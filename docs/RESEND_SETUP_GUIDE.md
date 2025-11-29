# 📧 Resend API Setup Guide

## ⚡ Quick Setup (10 นาที)

### Step 1: สมัคร Resend (ฟรี!)

1. **ไปที่**: https://resend.com/
2. Click **"Start Building for Free"**
3. Sign up with GitHub หรือ Email
4. Verify email

**Free Tier**:
- ✅ 3,000 emails/month
- ✅ 100 emails/day
- ✅ No credit card required

### Step 2: สร้าง API Key

1. **Login**: https://resend.com/login
2. **ไปที่ API Keys**: https://resend.com/api-keys
3. Click **"Create API Key"**
4. Name: `Beauty-AI-Production`
5. Permission: **"Full Access"** (เลือกตัวเลือกแรก)
6. Click **"Create"**
7. **Copy API Key** (ขึ้นต้นด้วย `re_`)
   - ⚠️ Copy ทันที! จะแสดงครั้งเดียว

### Step 3: เพิ่มใน Environment Variables

**Option A: .env.local (Development)**

สร้างหรือแก้ไข `.env.local`:

```env
# ========================================
# EMAIL SERVICE (Resend)
# ========================================
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxx"
EMAIL_FROM="noreply@yourdomain.com"
```

**Option B: Vercel (Production)**

1. ไปที่: https://vercel.com/your-project/settings/environment-variables
2. Add new variable:
   - Name: `RESEND_API_KEY`
   - Value: `re_xxxxx...`
   - Environment: Production, Preview, Development
3. Add another:
   - Name: `EMAIL_FROM`
   - Value: `noreply@yourdomain.com`

### Step 4: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
pnpm run dev
```

### Step 5: ทดสอบส่งอีเมล

**Method 1: ผ่าน UI**

1. เปิด: http://localhost:3004/sales/dashboard
2. คลิก Lead ใดก็ได้
3. คลิกปุ่ม **"Send Email"** หรือ **"ส่งอีเมล"**
4. เลือก Template หรือเขียนเอง:
   - Subject: Test Email from Beauty AI
   - Content: This is a test email
5. Recipient: ใส่อีเมลของคุณเอง
6. คลิก **"Send"** / **"ส่ง"**
7. ✅ ควรเห็น Toast: "ส่งอีเมลสำเร็จ!"
8. 📬 **Check inbox!**

**Method 2: ผ่าน API (ถ้าต้องการ)**

```bash
# ใช้ curl หรือ Postman
curl -X POST http://localhost:3004/api/sales/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com",
    "subject": "Test Email",
    "html": "<p>Hello from Beauty AI!</p>",
    "lead_id": "test-lead-id"
  }'
```

### ✅ Verify

**1. Check Resend Dashboard**
- URL: https://resend.com/emails
- ควรเห็น email ที่ส่งไป
- Status: Delivered ✅

**2. Check Database**

```sql
-- Check sent emails
SELECT 
  recipient_email,
  subject,
  status,
  sent_at,
  created_at
FROM sales_email_tracking 
WHERE status = 'sent'
ORDER BY sent_at DESC 
LIMIT 5;
```

**3. Check Sales Activities**

```sql
-- Check logged activities
SELECT 
  type,
  subject,
  description,
  created_at
FROM sales_activities 
WHERE type = 'email'
ORDER BY created_at DESC 
LIMIT 5;
```

## 🎯 Optional: Verify Domain (แนะนำสำหรับ Production)

### Why?
- ✅ Better deliverability
- ✅ Professional email address
- ✅ Avoid spam folder
- ✅ Custom from address (your@yourdomain.com)

### How?

1. **Add Domain in Resend**:
   - URL: https://resend.com/domains
   - Click **"Add Domain"**
   - Enter: `yourdomain.com`

2. **Add DNS Records**:

Resend will show you 3 records to add:

**DKIM Record (Authentication)**:
```
Type: TXT
Name: resend._domainkey
Value: p=MIGfMA0GCSqGSIb3... (จาก Resend)
```

**SPF Record (Anti-spam)**:
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all
```

**DMARC Record (Policy)**:
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:admin@yourdomain.com
```

3. **Wait for Verification**:
   - Usually 5-30 minutes
   - Resend will auto-verify
   - ✅ Status: "Verified"

4. **Update EMAIL_FROM**:
```env
EMAIL_FROM="support@yourdomain.com"
```

## 🚨 Troubleshooting

### Error: "RESEND_API_KEY not configured"
- ✅ Check `.env.local` has `RESEND_API_KEY`
- ✅ Restart dev server
- ✅ Make sure no typos

### Error: "Failed to send email"
- ✅ Check API key is valid
- ✅ Check Resend dashboard for errors
- ✅ Check email format is correct
- ✅ Check you haven't exceeded daily limit (100 emails)

### Email goes to Spam
- ✅ Verify domain (see above)
- ✅ Add SPF, DKIM, DMARC records
- ✅ Use professional content (avoid spam words)
- ✅ Warm up domain (send gradually)

## 📊 Resend Limits

### Free Tier:
- ✅ 3,000 emails/month
- ✅ 100 emails/day
- ⚠️ No custom domain verification (ใช้ได้แต่ไม่ verify)

### Pro Tier ($20/month):
- ✅ 50,000 emails/month
- ✅ Custom domain verification
- ✅ Priority support
- ✅ Analytics

## ✅ Success Checklist

- [ ] สมัคร Resend account
- [ ] สร้าง API key
- [ ] เพิ่ม `RESEND_API_KEY` ใน `.env.local`
- [ ] เพิ่ม `EMAIL_FROM`
- [ ] Restart dev server
- [ ] ส่งอีเมลทดสอบผ่าน UI
- [ ] Check inbox - ได้รับอีเมล ✅
- [ ] Check Resend dashboard - status Delivered
- [ ] Check database - มี record ใน sales_email_tracking

## 🎉 Done!

Email system พร้อมใช้งาน 100%!

**Next**: Task 4 - Enable Supabase Realtime (ง่ายกว่า Task 3)
