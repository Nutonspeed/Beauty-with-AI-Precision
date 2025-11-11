# 🎯 Quick Start - ทดสอบ Invitation System

## ✅ สถานะ: พร้อมทดสอบ 100%

### 🚀 Dev Server กำลังรัน
- Local: http://localhost:3000
- Browser เปิดอยู่ที่: http://localhost:3000/super-admin

---

## 📝 ทดสอบทันที (5 นาที)

### 1. Login Super Admin
**คุณอยู่ที่หน้านี้แล้ว:** http://localhost:3000/super-admin

หาก redirect ไป login:
- Email: `admin@ai367bar.com`
- Password: รหัสผ่าน super admin ของคุณ

---

### 2. สร้าง Clinic + เชิญ Owner (ทดสอบหลัก)

**ขั้นตอน:**
1. คลิกปุ่ม **"Create New Tenant"** (มุมขวาบน)
2. กรอกข้อมูล:
   ```
   Clinic Name: Demo Clinic
   Slug: demo-clinic
   Owner Email: demo@example.com  👈 สำคัญ!
   Phone: 0812345678
   Plan: starter
   ```
3. คลิก **"Create Tenant"**

**ผลลัพธ์ที่ควรเห็น:**
- ✅ Alert แสดง: "Clinic created and invitation sent to demo@example.com"
- ✅ Alert มี **invitation link**
- ✅ คลินิกใหม่แสดงในรายการ

**📋 Copy invitation link จาก Alert!**

---

### 3. ตรวจสอบ Invitation Management

**เลื่อนลงมาในหน้าเดียวกัน:**
- ✅ เห็นหัวข้อ **"Invitation Management"**
- ✅ เห็นคำเชิญ: `demo@example.com`
- ✅ มี Badge: **"Clinic Owner"** และ **"PENDING"**
- ✅ แสดงชื่อคลินิก: "Demo Clinic"
- ✅ แสดงวันหมดอายุ (7 วันจากวันนี้)
- ✅ มีปุ่ม **"Resend"** และ **"Revoke"**

---

### 4. ทดสอบ Resend Email

1. คลิกปุ่ม **"Resend"**
2. รอ 2-3 วินาที

**ผลลัพธ์:**
- ✅ Alert: "Invitation email resent successfully!"
- ✅ วันหมดอายุเปลี่ยนเป็นวันใหม่ (+7 วัน)
- ✅ อีเมลส่งซ้ำ (ตรวจสอบใน Resend Dashboard)

---

### 5. รับคำเชิญ (ทดสอบครบวงจร)

1. **เปิด Incognito/Private Window** (Ctrl+Shift+N)
2. **วาง invitation link** ที่ copy ไว้
3. จะเห็นหน้าต้อนรับพร้อมรายละเอียด:
   - อีเมล: demo@example.com
   - บทบาท: เจ้าของคลินิก
   - คลินิก: Demo Clinic

4. **กรอกข้อมูล:**
   ```
   Full Name: Demo Owner
   Password: DemoPass123
   Confirm Password: DemoPass123
   ```

5. คลิก **"รับคำเชิญและสร้างบัญชี"**

**ผลลัพธ์:**
- ✅ บัญชีสร้างสำเร็จ
- ✅ Auto-login
- ✅ Redirect ไป `/admin` (เพราะเป็น clinic_owner)
- ✅ กลับไปหน้า Super Admin → Status เปลี่ยนเป็น **"ACCEPTED"**

---

### 6. ทดสอบ Filter

กลับหน้า Super Admin:
1. ที่ dropdown "Filter by status"
2. ลองเลือก:
   - **All** → เห็นทุกคำเชิญ
   - **Pending** → เห็นเฉพาะที่รอยอมรับ
   - **Accepted** → เห็นเฉพาะที่ยอมรับแล้ว
   - **Expired** → เห็นเฉพาะที่หมดอายุ
   - **Revoked** → เห็นเฉพาะที่ยกเลิก

---

### 7. ทดสอบ Revoke (Optional)

1. สร้างคำเชิญใหม่อีกรอบ (email อื่น)
2. คลิกปุ่ม **"Revoke"** (สีแดง)
3. ยืนยัน "OK"

**ผลลัพธ์:**
- ✅ Alert: "Invitation revoked successfully!"
- ✅ Status เปลี่ยนเป็น **"REVOKED"**
- ✅ ปุ่ม Resend/Revoke หายไป

---

## 🎯 Checklist การทดสอบ

```
Phase 1: Database
☑ Invitations table tested
☑ Token generation working
☑ Create invitation success

Phase 2: Super Admin UI
☐ Login successful
☐ Create clinic with owner email
☐ Invitation auto-created
☐ Alert shows invitation link
☐ Invitation list displays correctly

Phase 3: Invitation Management
☐ Filter by status works
☐ Resend button works
☐ Revoke button works
☐ Status updates in real-time

Phase 4: Accept Invitation
☐ Invitation link opens
☐ Details displayed correctly
☐ Account creation works
☐ Auto-login successful
☐ Redirect to correct page
☐ Status changes to ACCEPTED

Phase 5: Email (Check Resend Dashboard)
☐ Email sent on creation
☐ Email sent on resend
☐ Template correct (Thai language)
☐ Invitation link in email
```

---

## 📧 ตรวจสอบ Email

### Resend Dashboard:
https://resend.com/emails

Login และดู:
- วันที่ส่ง
- สถานะ: Delivered / Bounced
- Email content
- Recipient: demo@example.com

---

## 🐛 หากพบปัญหา

### Email ไม่ส่ง
**ตรวจสอบ Console logs:**
```
Terminal output หรือ Browser Console (F12)
```

**ตรวจสอบ .env.local:**
```
RESEND_API_KEY=re_LzAXFnRL_GJJ2sRDFAn6squw28xEX3YcM
RESEND_FROM_EMAIL=Beauty Clinic <onboarding@resend.dev>
```

### Token invalid
- สร้างคำเชิญใหม่
- หรือใช้ Resend เพื่อต่ออายุ

### Permission denied
- ตรวจสอบว่า login ด้วย Super Admin
- ตรวจสอบ role ใน database

---

## 🎉 เมื่อทดสอบครบแล้ว

**ระบบพร้อมใช้งานจริง!**

สามารถ:
- ✅ สร้างคลินิกจริง
- ✅ เชิญเจ้าของจริง
- ✅ ให้เจ้าของเชิญพนักงาน
- ✅ เปิดบริการได้เลย

---

## 📁 เอกสารเพิ่มเติม

- `docs/INVITATION_SYSTEM_READY.md` - ภาพรวมระบบ
- `docs/INVITATION_SYSTEM_TESTING.md` - คู่มือทดสอบละเอียด
- `docs/RESEND_EMAIL_SETUP.md` - ตั้งค่าอีเมล

---

**เริ่มทดสอบได้เลย!** 🚀

หน้า Super Admin เปิดอยู่แล้วที่: http://localhost:3000/super-admin
