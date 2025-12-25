# Migration Validation Guide
## การตรวจสอบ Database Migration สำหรับ Payment & Tax Receipt Systems

## 📋 ภาพรวม

เนื่องจากไม่สามารถรัน Docker ในเครื่อง local ได้ จึงต้องใช้วิธีอื่นในการตรวจสอบว่า migration ที่สร้างขึ้นทำงานได้ถูกต้อง

## 🧪 วิธีที่ 1: ใช้ SQL Validation Script

### ขั้นตอน:
1. เปิด Supabase Dashboard
2. ไปที่ SQL Editor
3. คัดลอกและวาง script จาก `scripts/validate-payment-tax-migrations.sql`
4. รัน script

### ผลลัพธ์:
- ✅ แสดงข้อความ "VALIDATION COMPLETE" ถ้าทุกอย่างถูกต้อง
- ❌ แสดง error message ถ้าพบปัญหา

## 🧪 วิธีที่ 2: ทดสอบแต่ละส่วน

### 1. ตรวจสอบตาราง Payment System
```sql
-- ตรวจสอบว่ามีตารางที่จำเป็น
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('payments', 'payment_methods', 'refunds', 'invoices', 'invoice_line_items');
```

### 2. ตรวจสอบตาราง Tax Receipt System
```sql
-- ตรวจสอบว่ามีตารางที่จำเป็น
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('tax_receipts', 'tax_receipt_line_items');
```

### 3. ตรวจสอบ Functions
```sql
-- ตรวจสอบ functions ที่เกี่ยวข้อง
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%tax_receipt%';
```

### 4. ตรวจสอบ RLS Policies
```sql
-- ตรวจสอบ policies สำหรับตารางใหม่
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('payments', 'tax_receipts');
```

## 🚨 ปัญหาที่อาจพบ

### 1. Table ไม่ถูกสร้าง
- ตรวจสอบว่า migration file ถูกเรียกใช้งานแล้ว
- ตรวจสอบว่ามี syntax error ใน SQL

### 2. Function ไม่ทำงาน
- ตรวจสอบว่า function ถูกสร้างหลังตารางที่เกี่ยวข้อง
- ตรวจสอบว่ามี permission ในการสร้าง function

### 3. RLS Policy ไม่ทำงาน
- ตรวจสอบว่าเปิดใช้งาน RLS บนตารางแล้ว
- ตรวจสอบว่า function ที่ใช้ใน policy มีอยู่

## ✅ หลังจากตรวจสอบผ่าน

### 1. ทดสอบ Core Functionality
1. Start dev server: `pnpm dev`
2. ทดสอบการจองนัดหมาย
3. ทดสอบการสร้าง invoice
4. ทดสอบการชำระเงิน
5. ทดสอบการสร้างใบเสร็จรับเงิน

### 2. ตรวจสอบ API Endpoints
- `POST /api/payments` - สร้าง payment
- `POST /api/invoices` - สร้าง invoice
- `POST /api/tax-receipts` - สร้าง tax receipt
- `POST /api/stripe/webhooks` - Stripe webhook

### 3. ตรวจสอบ UI Pages
- `/clinic/payments` - Payment dashboard
- `/clinic/payments/invoices` - Invoice management
- `/clinic/payments/tax-receipts` - Tax receipt management
- `/customer/booking` - Customer self-booking
- `/customer/payments` - Customer payments

## 📝 Checklist ก่อน Deploy

- [ ] Migration validation ผ่าน
- [ ] Build ไม่มี error
- [ ] Core functionality ทำงาน
- [ ] API endpoints ตอบสนอง
- [ ] UI pages แสดงผลถูกต้อง
- [ ] RLS policies ทำงาน
- [ ] Stripe integration ทำงาน
- [ ] Email notifications ส่งได้

## 🔧 การแก้ไขปัญหา

### ถ้าพบ Error ใน Migration
1. แก้ไข migration file
2. สร้าง migration file ใหม่เพื่อแก้ไข
3. ทดสอบใหม่ใน SQL editor

### ถ้า API ไม่ทำงาน
1. ตรวจสอบ environment variables
2. ตรวจสอบ API route implementation
3. ตรวจสอ Supabase client configuration

### ถ้า UI ไม่แสดงผล
1. ตรวจสอบ browser console สำหรับ errors
2. ตรวจสอบ API calls ใน Network tab
3. ตรวจสอบ authentication state
