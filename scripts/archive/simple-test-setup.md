# 🧪 Simple Test Setup for Beauty-with-AI-Precision

## 🚀 Quick Setup (ไม่ต้องใช้ MCP)

### **ขั้นตอนที่ 1: สร้าง Test Users ผ่าน Supabase Dashboard**

1. **เปิด Supabase Dashboard**: https://supabase.com/dashboard/project/bgejeqqngzvuokdffadu
2. **ไปที่ Authentication > Users**
3. **สร้างผู้ใช้ด้วยอีเมลต่อไปนี้**:

```
superadmin@test.com (Password: Test123456!)
clinicowner@test.com (Password: Test123456!) 
sales@test.com (Password: Test123456!)
customer@test.com (Password: Test123456!)
clinicadmin@test.com (Password: Test123456!)
```

### **ขั้นตอนที่ 2: รัน SQL Script**

1. **ไปที่ SQL Editor** ใน Supabase Dashboard
2. **คัดลอกและรัน script จาก `scripts/seed-simple.sql`**
3. **หรือรันคำสั่ง SQL ด้านล่างนี้ทีละส่วน**:

```sql
-- สร้างคลินิกทดสอบ
INSERT INTO clinics (name, email, phone, address, description, created_at, updated_at)
VALUES ('Test Beauty Clinic', 'clinic@test.com', '+6621234567', '123 Test Street, Bangkok', 'Test clinic for E2E testing', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- สร้างผู้ใช้ในตาราง users (ถ้าต้องการ)
-- ใช้ IDs จาก authentication users ที่สร้างไว้แล้ว

-- สร้างบริการทดสอบ
INSERT INTO clinic_services (clinic_id, name, description, price, duration, category, created_at, updated_at)
SELECT 
  c.id,
  unnest(ARRAY['Skin Analysis', 'Botox Treatment', 'Chemical Peel']),
  unnest(ARRAY['AI-powered skin analysis', 'Anti-wrinkle injections', 'Professional peel']),
  unnest(ARRAY[1500, 8000, 3500]),
  unnest(ARRAY[60, 30, 45]),
  unnest(ARRAY['analysis', 'treatment', 'treatment']),
  NOW(),
  NOW()
FROM clinics c
WHERE c.name = 'Test Beauty Clinic';
```

### **ขั้นตอนที่ 3: ตรวจสอบการตั้งค่า**

1. **ตรวจสอบว่า dev server ทำงาน**:
```bash
pnpm dev --port 3004
```

2. **ตรวจสอบว่าเข้าได้ที่**: http://localhost:3004

### **ขั้นตอนที่ 4: ทดสอบ Login**

1. **เปิด**: http://localhost:3004/th/login
2. **ลอง login ด้วย**:
   - Email: `superadmin@test.com`
   - Password: `Test123456!`

## 🧪 ทดสอบ E2E Tests

เมื่อ test users พร้อมแล้ว:

```bash
# ทดสอบ authentication
pnpm test:e2e:auth

# ทดสอบ dashboard
pnpm test:e2e:dashboard

# รันทั้งหมด
pnpm test:e2e:all
```

## 🔧 ถ้า MCP ทำงานได้

เมื่อ MCP connection กลับมาทำงานได้ สามารถใช้คำสั่ง:

```bash
# ดูตารางทั้งหมด
mcp0_list_tables --project_id=bgejeqqngzvuokdffadu

# รัน SQL migration
mcp0_apply_migration --project_id=bgejeqqngzvuokdffadu --name="seed_test_data" --query="..."
```

## 🎯 สิ่งที่ต้องมีก่อนทดสอบ

1. ✅ Dev server ทำงานที่ port 3004
2. ✅ Test users ใน Supabase Auth
3. ✅ Test data ใน database tables
4. ✅ Environment variables ถูกต้อง

## 🚨 ปัญหาที่อาจเจอ

- **Login ไม่ได้**: ตรวจสอบ RLS policies และ user roles
- **Database error**: ตรวจสอบว่า tables มีอยู่จริง
- **Test ล้มเหลว**: ตรวจสอบว่า selectors ถูกต้องใน test files

---

**🎉 เมื่อ setup เสร็จ พร้อมทดสอบ E2E แบบครบวงจร!**
