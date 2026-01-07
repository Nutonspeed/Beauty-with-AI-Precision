---
title: Seed Test Users (local E2E)
---

วัตถุประสงค์
- ให้คำแนะนำและตัวอย่าง SQL /ขั้นตอนสำหรับการสร้างบัญชีทดสอบ (admin, clinic-owner) ในฐานข้อมูล PostgreSQL/Supabase เพื่อให้ Playwright E2E tests ที่ต้องการผู้ใช้จริงสามารถรันได้ในสภาพแวดล้อมโลคอล

คำเตือน
- ห้ามรันสคริปต์นี้บน production
- ใช้ฐานข้อมูลทดสอบหรือ snapshot ที่แยกจาก production เท่านั้น

ตัวอย่าง (PostgreSQL)

1) เปิดการเชื่อมต่อไปยังฐานข้อมูลทดสอบ (ตัวอย่างใช้ `psql`):

```powershell
# ตัวอย่าง (PowerShell)
# กำหนด env vars: PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE
# psql "host=$env:PGHOST port=$env:PGPORT user=$env:PGUSER password=$env:PGPASSWORD dbname=$env:PGDATABASE"
```

2) ถ้า pgcrypto ยังไม่ติดตั้งบนฐานข้อมูลทดสอบ ให้รัน (ต้องเป็น superuser):

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

3) ตัวอย่าง SQL สำหรับสร้างผู้ใช้ทดสอบ (สมมติ schema `public.users` ด้วยฟิลด์ `email`, `password_hash`, `role`, `created_at`):

```sql
-- Super-admin
INSERT INTO public.users (email, password_hash, role, created_at)
VALUES (
  'admin@local.test',
  crypt('password123', gen_salt('bf')),
  'super-admin',
  now()
);

-- Clinic owner
INSERT INTO public.users (email, password_hash, role, created_at)
VALUES (
  'clinic-owner@example.com',
  crypt('password123', gen_salt('bf')),
  'clinic-owner',
  now()
);
```

หมายเหตุการล็อกอิน
- หากระบบใช้ Supabase Auth หรือการเก็บรหัสผ่านที่ไม่ใช่ `crypt()` ให้ใช้เครื่องมือของระบบ (Supabase CLI หรือ Admin UI) เพื่อสร้างผู้ใช้และตั้งรหัสผ่าน

คำแนะนำสำหรับ Supabase (CLI / SQL editor)
- ใช้ SQL editor ใน Supabase project หรือเรียก `supabase db connect` แล้วรัน SQL ข้างต้น (ปรับชื่อตาราง/คอลัมน์ให้ตรงกับ schema ของโปรเจค)

ตรวจสอบ
- หลังจากรัน SQL ให้ทดสอบล็อกอินผ่าน UI หรือ curl ไปยัง endpoint `/api/auth/login` (ถ้ามี) เพื่อยืนยันว่าบัญชีที่สร้างสามารถล็อกอินได้

ตัวเลือกเพิ่มเติม (script แบบ Node)
- ถ้าต้องการ ผมสามารถสร้างสคริปต์ `scripts/seed-test-users.ts` ที่เชื่อมต่อผ่าน `pg` และรันคำสั่งด้านบนโดยอ่านค่า credential จาก env vars (ผมจะสร้างให้ถ้าต้องการ)

ถ้าต้องการผมจะ:
- (A) สร้างไฟล์สคริปต์ Node เพื่อ seed อัตโนมัติ
- (B) สร้างคำสั่ง `pnpm run db:seed:test` ใน `package.json`

ติดต่อผมว่าต้องการตัวเลือกไหน ผมจะทำให้เรียบร้อยและรันให้ตรวจสอบผล
