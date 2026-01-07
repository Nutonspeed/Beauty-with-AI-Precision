# 🔐 สร้าง Test Users ใน Supabase Auth

## ขั้นตอนการสร้าง Test Users

### 1. เปิด Supabase Dashboard
- URL: https://supabase.com/dashboard/project/bgejeqqngzvuokdffadu
- ไปที่ **Authentication** > **Users**

### 2. สร้าง Users 5 คน

#### **User 1: Super Admin**
- Email: `superadmin@test.com`
- Password: `Test123456!`
- User Metadata: `{"role": "super_admin"}`

#### **User 2: Clinic Owner**
- Email: `clinicowner@test.com`
- Password: `Test123456!`
- User Metadata: `{"role": "clinic_owner"}`

#### **User 3: Sales Staff**
- Email: `sales@test.com`
- Password: `Test123456!`
- User Metadata: `{"role": "sales_staff"}`

#### **User 4: Customer**
- Email: `customer@test.com`
- Password: `Test123456!`
- User Metadata: `{"role": "customer"}`

#### **User 5: Clinic Admin**
- Email: `clinicadmin@test.com`
- Password: `Test123456!`
- User Metadata: `{"role": "clinic_admin"}`

### 3. ตั้งค่า Email Confirmation
- ติ๊ก **Auto-confirm users** เพื่อไม่ต้องยืนยันยีเมล
- หรือรอรับ email และ confirm ตามปกติ

### 4. ตรวจสอบว่า Users ถูกสร้างแล้ว
```sql
-- ตรวจสอบใน SQL Editor
SELECT id, email, created_at 
FROM auth.users 
WHERE email LIKE '%@test.com';
```

## 🧪 ทดสอบการทำงาน

### 1. ตรวจสอบ Database Connection
```bash
pnpm dev --port 3004
```

### 2. ทดสอบ Login
- เปิด: http://localhost:3004/th/login
- ลอง login ด้วย `superadmin@test.com` / `Test123456!`

### 3. ทดสอบ Dashboard Access
- Super Admin: http://localhost:3004/th/super-admin
- Clinic Owner: http://localhost:3004/th/clinic/dashboard
- Sales: http://localhost:3004/th/sales/dashboard
- Customer: http://localhost:3004/th/customer/dashboard

## 🚀 เริ่มทดสอบ E2E

เมื่อ users พร้อมแล้ว:

```bash
# ทดสอบ authentication
pnpm test:e2e:auth

# ทดสอบ dashboard
pnpm test:e2e:dashboard

# รันทั้งหมด
pnpm test:e2e:all
```

## 📝 หมายเหตุ

- **Password ทั้งหมด**: `Test123456!`
- **Email domain**: `@test.com`
- **Roles**: ตรงกับที่กำหนดไว้ใน test files
- **Clinic**: ถูกสร้างไว้แล้วชื่อ `Test Beauty Clinic`

---

**✅ เมื่อสร้าง users เสร็จ ระบบพร้อมสำหรับการทดสอบ E2E แบบครบวงจร!**
