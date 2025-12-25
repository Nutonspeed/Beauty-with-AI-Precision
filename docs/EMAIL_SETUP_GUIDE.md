# 📧 Email Setup Guide - Gmail SMTP (ฟรี)

## 🎯 ทำไมเลือก Gmail SMTP?
- ✅ ฟรี 500 emails/วัน
- ✅ ไม่ต้องสมัครใหม่
- ✅ Setup 5 นาที
- ✅ Deliverability ดี

---

## 📋 ขั้นตอน Setup (5 นาที)

### Step 1: เปิด 2-Step Verification
1. ไปที่: https://myaccount.google.com/security
2. หา "2-Step Verification"
3. กด "Get Started"
4. ทำตามขั้นตอน (ใส่เบอร์โทร, ยืนยัน)

### Step 2: สร้าง App Password
1. ที่หน้า Security เดิม
2. หา "App passwords" (อยู่ใต้ 2-Step Verification)
3. กด "App passwords"
4. เลือก:
   - App: Mail
   - Device: Other (Custom name)
   - ใส่ชื่อ: "Beauty AI Production"
5. กด "Generate"
6. **คัดลอก password ที่ได้** (16 ตัวอักษร เช่น: xxxx xxxx xxxx xxxx)

### Step 3: ใส่ค่าใน .env.production.local
```bash
# Email Configuration - Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # App Password จาก Step 2
EMAIL_FROM=your-email@gmail.com
```

### Step 4: Update Code (ถ้ายังไม่มี)
ไฟล์: `lib/notifications/email-service.ts`

```typescript
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendInvitationEmail(
  to: string,
  inviteUrl: string,
  tempPassword: string
) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'เชิญเข้าร่วมระบบ Beauty AI Precision',
    html: `
      <h2>คุณได้รับเชิญให้เข้าใช้งานระบบ</h2>
      <p>คลิกลิงก์เพื่อเข้าสู่ระบบ:</p>
      <a href="${inviteUrl}">${inviteUrl}</a>
      <p><strong>รหัสผ่านชั่วคราว:</strong> ${tempPassword}</p>
      <p>กรุณาเปลี่ยนรหัสผ่านหลังเข้าสู่ระบบครั้งแรก</p>
    `,
  })
}
```

### Step 5: ทดสอบส่ง Email
```bash
# สร้างไฟล์ทดสอบ
node scripts/test-email.js
```

สร้างไฟล์: `scripts/test-email.js`
```javascript
require('dotenv').config({ path: '.env.production.local' })
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

transporter.sendMail({
  from: process.env.EMAIL_FROM,
  to: 'test@example.com', // เปลี่ยนเป็น email ของคุณ
  subject: 'Test Email from Beauty AI',
  text: 'This is a test email. If you receive this, SMTP is working!',
}, (error, info) => {
  if (error) {
    console.error('❌ Error:', error)
  } else {
    console.log('✅ Email sent:', info.response)
  }
})
```

---

## ⚠️ ข้อจำกัด Gmail SMTP

### 1. Daily Limit: 500 emails/วัน
- ถ้าเกิน → ต้องรอ 24 ชม.
- **แก้**: ใช้หลาย Gmail accounts + load balance

### 2. อาจถูกจำกัดถ้า spam
- ส่งเยอะเกินไป
- Recipients รายงานเป็น spam
- **แก้**: ใช้เฉพาะ invitation emails

### 3. ไม่เหมาะกับ Marketing
- Gmail SMTP เหมาะกับ transactional emails
- Marketing campaigns → ใช้ Mailgun/Brevo

---

## 🔄 Migration Plan (ถ้าเกิน 500/วัน)

### Option 1: ใช้หลาย Gmail Accounts
```typescript
const accounts = [
  { user: 'email1@gmail.com', pass: 'xxxx' },
  { user: 'email2@gmail.com', pass: 'yyyy' },
  { user: 'email3@gmail.com', pass: 'zzzz' },
]

// Round-robin หรือ random
const account = accounts[Math.floor(Math.random() * accounts.length)]
```

### Option 2: อัพเกรดเป็น Resend
```bash
RESEND_API_KEY=re_xxxxx
# $20/month for 50,000 emails
```

### Option 3: อัพเกรดเป็น Mailgun
```bash
MAILGUN_API_KEY=xxxxx
MAILGUN_DOMAIN=mg.yourdomain.com
# $35/month for 50,000 emails
```

---

## 🐛 Troubleshooting

### ❌ "Invalid login: 535-5.7.8 Username and Password not accepted"
**สาเหตุ**: App Password ผิด หรือยังไม่ได้เปิด 2FA
**แก้**: 
1. ตรวจสอบ 2-Step Verification เปิดแล้ว
2. สร้าง App Password ใหม่
3. คัดลอกทั้ง 16 ตัวอักษร (รวมเว้นวรรค)

### ❌ "Connection timeout"
**สาเหตุ**: Firewall บล็อก port 587
**แก้**:
1. ลอง port 465 (SSL) แทน
2. ตั้ง `SMTP_SECURE=true`

### ❌ "Daily sending quota exceeded"
**สาเหตุ**: ส่งเกิน 500 emails/วัน
**แก้**:
1. รอ 24 ชม.
2. ใช้หลาย accounts
3. อัพเกรดเป็น Resend/Mailgun

---

## 📊 Monitoring & Logging

### Track Email Status
```typescript
// ใน email-service.ts
export async function sendEmail(options: EmailOptions) {
  try {
    const result = await transporter.sendMail(options)
    
    // Log success
    await supabase.from('email_logs').insert({
      to: options.to,
      subject: options.subject,
      status: 'sent',
      message_id: result.messageId,
      sent_at: new Date(),
    })
    
    return { success: true, messageId: result.messageId }
  } catch (error) {
    // Log error
    await supabase.from('email_logs').insert({
      to: options.to,
      subject: options.subject,
      status: 'failed',
      error_message: error.message,
      sent_at: new Date(),
    })
    
    throw error
  }
}
```

### Dashboard Query
```sql
-- Check email delivery rate
SELECT 
  DATE(sent_at) as date,
  status,
  COUNT(*) as count
FROM email_logs
WHERE sent_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(sent_at), status
ORDER BY date DESC;
```

---

## ✅ Checklist ก่อน Production

- [ ] เปิด 2-Step Verification
- [ ] สร้าง App Password
- [ ] ใส่ค่าใน .env.production.local
- [ ] ทดสอบส่ง test email
- [ ] Verify email ถึงปลายทาง
- [ ] ตรวจสอบ spam folder
- [ ] Test invitation flow end-to-end
- [ ] Setup email logging
- [ ] Monitor daily usage

---

**Setup Time**: 5 นาที  
**Cost**: ฟรี (500 emails/วัน)  
**Next Step**: ถ้าเกิน → Resend ($20/เดือน)
