# 🔍 เช็คฐานข้อมูล Supabase - คำสั่ง SQL สำคัญ

## 📍 เปิด SQL Editor ที่นี่
https://supabase.com/dashboard/project/bgejeqqngzvuokdffadu/sql/new

---

## ✅ คำสั่งสำคัญที่ต้องรัน (รันทีละคำสั่ง)

### 1️⃣ เช็คตารางทั้งหมด

\`\`\`sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
\`\`\`

---

### 2️⃣ เช็ค users table

\`\`\`sql
SELECT 
  COUNT(*) as total_users,
  COUNT(DISTINCT clinic_id) as unique_clinics,
  COUNT(CASE WHEN clinic_id IS NOT NULL THEN 1 END) as users_with_clinic
FROM users;
\`\`\`

---

### 3️⃣ ดู clinic_id ทั้งหมด

\`\`\`sql
SELECT 
  clinic_id,
  COUNT(*) as user_count
FROM users
WHERE clinic_id IS NOT NULL
GROUP BY clinic_id
ORDER BY user_count DESC;
\`\`\`

**สิ่งที่ต้องจับตา:** ถ้าเห็น `00000000-0000-0000-0000-000000000001` นี่คือสาเหตุของ error!

---

### 4️⃣ เช็คว่า clinics table มีหรือไม่

\`\`\`sql
SELECT COUNT(*) FROM clinics;
\`\`\`

**ถ้า error:** แสดงว่า clinics table ยังไม่มี → นี่คือปัญหา!

---

### 5️⃣ ดู users sample

\`\`\`sql
SELECT id, email, clinic_id, created_at
FROM users
WHERE clinic_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
\`\`\`

---

## 📊 ผลลัพธ์ที่คาดว่าจะพบ

### สถานการณ์ที่น่าจะเป็น:
- ✅ users table **มี** (พร้อมข้อมูล)
- ❌ clinics table **ไม่มี**
- ⚠️ users มี clinic_id = `00000000-0000-0000-0000-000000000001`
- ❌ ไม่มี clinic record ที่ id นี้

### ทำไม migration ถึง error:
\`\`\`
เพราะพยายามเพิ่ม Foreign Key: users.clinic_id → clinics.id
แต่ clinics table ไม่มี หรือ ไม่มี record id ที่ users อ้างถึง
\`\`\`

---

## 🔧 วิธีแก้ไข

### Option 1: สร้าง default clinic ก่อน
\`\`\`sql
INSERT INTO clinics (
  id, 
  name, 
  slug,
  owner_id
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Default Clinic',
  'default',
  (SELECT id FROM auth.users LIMIT 1)
);
\`\`\`

### Option 2: เคลียร์ invalid clinic_id
\`\`\`sql
UPDATE users 
SET clinic_id = NULL 
WHERE clinic_id = '00000000-0000-0000-0000-000000000001';
\`\`\`

---

## 📋 สรุป: กรุณารันคำสั่งที่ 1-4 และแชร์ผลลัพธ์มา

แล้ว AI จะปรับ migration script ให้เหมาะสมกับสถานการณ์จริง
