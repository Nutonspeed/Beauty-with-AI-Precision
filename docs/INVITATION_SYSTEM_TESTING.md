# 🧪 คู่มือการทดสอบระบบ Invitation

## ✅ สิ่งที่พร้อมแล้ว

จากการทดสอบอัตโนมัติ:
- ✅ **Invitations table** - สร้างสำเร็จ
- ✅ **Create invitation** - สามารถสร้างคำเชิญได้
- ✅ **Token generation** - Token สร้างอัตโนมัติ
- ✅ **List invitations** - ดึงรายการคำเชิญได้
- ✅ **Email configuration** - Resend API configured

## 📝 ขั้นตอนการทดสอบแบบ Manual

### 🚀 1. เริ่มต้น Development Server

```powershell
pnpm dev
```

เปิดเบราว์เซอร์ที่: http://localhost:3000

---

### 👤 2. ทดสอบ Login Super Admin

#### ขั้นตอน:
1. ไปที่ http://localhost:3000/auth/login
2. Login ด้วย Super Admin account:
   - Email: `admin@ai367bar.com` (หรืออีเมล super admin ของคุณ)
   - Password: รหัสผ่านของคุณ
3. ตรวจสอบว่าเข้าสู่ระบบสำเร็จ

#### ผลลัพธ์ที่คาดหวัง:
- ✅ Login สำเร็จ
- ✅ Redirect ไป `/super-admin` หรือ `/customer/dashboard`

---

### 🏥 3. ทดสอบสร้าง Clinic + Auto-Invite Owner

#### ขั้นตอน:
1. ไปที่ http://localhost:3000/super-admin
2. คลิกปุ่ม "Create New Tenant"
3. กรอกข้อมูล:
   ```
   Clinic Name: Test Beauty Clinic
   Slug: test-beauty-clinic
   Owner Email: testowner@example.com
   Phone: 0812345678
   Plan: starter
   Primary Color: #8B5CF6 (default)
   Secondary Color: #EC4899 (default)
   ```
4. คลิก "Create Tenant"

#### ผลลัพธ์ที่คาดหวัง:
- ✅ Clinic สร้างสำเร็จ
- ✅ แสดง Alert: "✅ Clinic created and invitation sent to testowner@example.com"
- ✅ Alert มี invitation link
- ✅ คลินิกแสดงในรายการ Tenant List

---

### 📧 4. ทดสอบ Email Invitation (Optional)

#### หมายเหตุ:
อีเมลจะส่งไปที่ testowner@example.com ผ่าน Resend API

#### ตรวจสอบ:
1. ไปที่ Resend Dashboard: https://resend.com/emails
2. ดูว่ามีอีเมลส่งออกไปหรือไม่
3. เช็คสถานะ: Delivered / Bounced

#### ผลลัพธ์ที่คาดหวัง:
- ✅ อีเมลส่งสำเร็จ
- ✅ Subject: "คำเชิญเข้าใช้งานระบบ Beauty Clinic - เจ้าของคลินิก"
- ✅ มี invitation link ในอีเมล

---

### 📋 5. ทดสอบ Invitation Management

#### ขั้นตอน:
1. เลื่อนลงไปส่วน "Invitation Management" ในหน้า /super-admin
2. ตรวจสอบรายการคำเชิญ

#### ผลลัพธ์ที่คาดหวัง:
- ✅ แสดงคำเชิญที่เพิ่งสร้าง (testowner@example.com)
- ✅ แสดง Badge: "Clinic Owner" และ "PENDING"
- ✅ แสดงชื่อคลินิก: "Test Beauty Clinic"
- ✅ แสดงวันที่ส่ง และ วันหมดอายุ
- ✅ มีปุ่ม "Resend" และ "Revoke"

---

### 🔄 6. ทดสอบ Resend Invitation

#### ขั้นตอน:
1. คลิกปุ่ม "Resend" ที่คำเชิญ
2. รอ Alert แสดงผล

#### ผลลัพธ์ที่คาดหวัง:
- ✅ แสดง Alert: "✅ Invitation email resent successfully!"
- ✅ วันหมดอายุเปลี่ยนเป็น +7 วันจากวันนี้
- ✅ Status ยังเป็น "PENDING"
- ✅ อีเมลส่งซ้ำ (ดูใน Resend Dashboard)

---

### ❌ 7. ทดสอบ Revoke Invitation

#### ขั้นตอน:
1. คลิกปุ่ม "Revoke" (สีแดง)
2. คลิก "OK" ใน Confirmation dialog

#### ผลลัพธ์ที่คาดหวัง:
- ✅ แสดง Alert: "✅ Invitation revoked successfully!"
- ✅ Status เปลี่ยนเป็น "REVOKED"
- ✅ ปุ่ม "Resend" และ "Revoke" หายไป

---

### 🎫 8. ทดสอบ Accept Invitation

#### ขั้นตอน:
1. คัดลอก invitation link จาก Alert หรืออีเมล
   - Format: `http://localhost:3000/invite/[token]`
2. เปิด Incognito/Private window
3. วาง URL และกด Enter
4. กรอกข้อมูล:
   ```
   Full Name: Test Owner
   Password: password123
   Confirm Password: password123
   ```
5. คลิก "รับคำเชิญและสร้างบัญชี"

#### ผลลัพธ์ที่คาดหวัง:
- ✅ แสดงข้อมูลคำเชิญ (อีเมล, บทบาท, คลินิก)
- ✅ สร้างบัญชีสำเร็จ
- ✅ Auto-login สำเร็จ
- ✅ Redirect ไป `/admin` (เพราะเป็น clinic_owner)
- ✅ Status เปลี่ยนเป็น "ACCEPTED" ในหน้า Super Admin

---

### 🔍 9. ทดสอบ Filter Invitations

#### ขั้นตอน:
1. กลับไปหน้า /super-admin
2. คลิก dropdown "Filter by status"
3. ลองเลือก: All / Pending / Accepted / Expired / Revoked

#### ผลลัพธ์ที่คาดหวัง:
- ✅ แสดงเฉพาะคำเชิญที่ตรงกับ filter
- ✅ การเปลี่ยน filter ทำงานแบบ real-time

---

### 🎭 10. ทดสอบ Multi-Role Invitations

#### สร้างคำเชิญหลายบทบาท:

**A. Clinic Owner invites Manager:**
1. Logout Super Admin
2. Login ด้วย Clinic Owner account (ที่เพิ่งสร้าง)
3. สร้าง invitation สำหรับ clinic_manager
   - ใช้ POST /api/invitations ผ่าน Postman หรือ
   - สร้าง UI สำหรับ Clinic Owner (ถ้ามี)

**B. Clinic Manager invites Staff:**
1. Accept invitation สำหรับ manager
2. Login ด้วย Manager
3. สร้าง invitation สำหรับ clinic_staff

**C. Sales Staff invites Customer:**
1. สร้าง Sales Staff
2. Login ด้วย Sales Staff
3. สร้าง invitation สำหรับ customer

#### ผลลัพธ์ที่คาดหวัง:
- ✅ แต่ละ role สามารถเชิญได้ตามสิทธิ์
- ✅ Permission ถูกบังคับใช้ (ไม่สามารถเชิญเกินสิทธิ์)

---

## 🐛 กรณีพบปัญหา

### ❌ Email ไม่ส่ง
**สาเหตุที่เป็นไปได้:**
- Resend API key ไม่ถูกต้อง
- Rate limit (free tier: 100/day)
- Email ถูกบล็อก

**แก้ไข:**
1. ตรวจสอบ `.env.local`:
   ```
   RESEND_API_KEY=re_LzAXFnRL_GJJ2sRDFAn6squw28xEX3YcM
   RESEND_FROM_EMAIL=Beauty Clinic <onboarding@resend.dev>
   ```
2. ดู Console logs ในเทอร์มินัล
3. ตรวจสอบ Resend Dashboard

### ❌ Token ไม่ valid
**สาเหตุ:**
- Token หมดอายุ (7 วัน)
- Token ถูก revoke
- Token ถูกใช้ไปแล้ว (accepted)

**แก้ไข:**
- สร้าง invitation ใหม่
- ใช้ Resend เพื่อต่ออายุ

### ❌ Permission denied
**สาเหตุ:**
- ไม่มีสิทธิ์เชิญ role นี้
- clinic_id ไม่ตรงกัน

**แก้ไข:**
- ตรวจสอบ role ของผู้ใช้
- ตรวจสอบ clinic_id

---

## 📊 Checklist การทดสอบ

```
Phase 1: Database
✅ Invitations table exists
✅ Token generation works
✅ RLS policies active

Phase 2: API Routes
✅ POST /api/invitations - Create
✅ GET /api/invitations - List
✅ GET /api/invitations/[token] - Validate
✅ POST /api/invitations/[token]/accept - Accept
✅ POST /api/invitations/[id]/resend - Resend
✅ POST /api/invitations/[id]/revoke - Revoke

Phase 3: UI
✅ Super Admin Dashboard
✅ Create Clinic + Auto-invite
✅ Invitation Management (List/Filter)
✅ Resend/Revoke buttons work
✅ Accept Invitation Page
✅ Auto-login after accept
✅ Role-based redirect

Phase 4: Email
✅ Email sent via Resend
✅ Email template correct
✅ Thai language
✅ Invitation link works
✅ Expiry date shown

Phase 5: Security
✅ RLS enforced
✅ Permission checks work
✅ Token validation
✅ Expired tokens rejected
✅ Revoked tokens rejected
```

---

## 🎯 Next Steps After Testing

1. **ถ้าทุกอย่างทำงานได้:**
   - ✅ ระบบพร้อมใช้งานจริง!
   - สร้าง clinics จริง
   - เชิญ owners จริง
   - เปิดให้บริการ

2. **ถ้าพบบั๊ก:**
   - บันทึกปัญหาที่พบ
   - ตรวจสอบ Console logs
   - ตรวจสอบ Supabase logs
   - แก้ไขและทดสอบใหม่

3. **Production Checklist:**
   - ตั้ง Resend verified domain
   - เปลี่ยน RESEND_FROM_EMAIL
   - อัปเดต NEXT_PUBLIC_APP_URL
   - เพิ่ม rate limiting
   - ตั้ง monitoring

---

## 📞 Support

พบปัญหา? ตรวจสอบ:
- Console logs (F12 → Console)
- Network tab (F12 → Network)
- Terminal logs (pnpm dev output)
- Supabase Dashboard → Logs
- Resend Dashboard → Emails

---

**สร้างเมื่อ:** November 11, 2025  
**Version:** 1.0  
**Status:** ✅ Ready for Testing
