# 📚 Supabase Migration Guide

## 🎯 Overview

ไฟล์นี้อธิบายวิธีการรัน migration สำหรับสร้าง database tables และ Row Level Security (RLS) policies ใน Supabase

## 🗂️ Migration Files

- `001_create_users_and_rbac.sql` - สร้าง users table, analysis_history table และ RBAC system

## 📋 Prerequisites

1. Supabase account และ project
2. เข้าถึง Supabase SQL Editor ได้
3. มี `.env.local` configured ด้วย:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🚀 How to Run Migration

### วิธีที่ 1: ผ่าน Supabase Dashboard (แนะนำ)

1. **เข้า Supabase Dashboard**
   - ไปที่ https://supabase.com/dashboard
   - เลือก project ของคุณ

2. **เปิด SQL Editor**
   - คลิกที่ "SQL Editor" ในเมนูด้านซ้าย
   - หรือไปที่ https://bgejeqqngzvuokdffadu.supabase.co/project/_/sql

3. **Run Migration Script**
   - คลิก "+ New query"
   - คัดลอกเนื้อหาทั้งหมดจากไฟล์ `001_create_users_and_rbac.sql`
   - วางใน SQL Editor
   - คลิก "Run" (หรือกด Ctrl+Enter)

4. **Verify Migration**
   - Scroll ลงไปด้านล่างสุดของ script
   - Run verification queries เพื่อตรวจสอบว่า migration สำเร็จ

### วิธีที่ 2: ผ่าน Supabase CLI (สำหรับ Advanced Users)

\`\`\`bash
# 1. Install Supabase CLI (ถ้ายังไม่มี)
npm install -g supabase

# 2. Login to Supabase
supabase login

# 3. Link project
supabase link --project-ref bgejeqqngzvuokdffadu

# 4. Run migration
supabase db push

# 5. Verify
supabase db diff
\`\`\`

## ✅ Verification

หลังจาก run migration แล้ว ให้ตรวจสอบว่า:

### 1. Tables Created
\`\`\`sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
\`\`\`

ควรเห็น:
- `users`
- `analysis_history`

### 2. ENUM Types Created
\`\`\`sql
SELECT t.typname, e.enumlabel
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname IN ('user_role', 'analysis_tier')
ORDER BY t.typname, e.enumsortorder;
\`\`\`

ควรเห็น:
- `user_role`: public_visitor, free_user, premium_customer, clinic_staff, clinic_admin, sales_staff, super_admin
- `analysis_tier`: free, premium, clinical

### 3. RLS Policies Enabled
\`\`\`sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('users', 'analysis_history')
ORDER BY tablename, policyname;
\`\`\`

ควรเห็น policies อย่างน้อย:
- Users can view their own data
- Users can update their own data
- Super admin can view all users
- และอื่นๆ

### 4. Triggers Created
\`\`\`sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
\`\`\`

ควรเห็น:
- `on_auth_user_created` on `users`
- `update_users_updated_at` on `users`

## 🧪 Testing

### 1. สร้าง Test User ผ่าน Auth

\`\`\`typescript
// ใน app (หลัง migration แล้ว)
import { useAuth } from '@/lib/auth/context'

const { signUp } = useAuth()
await signUp('test@example.com', 'password123', 'Test User')
\`\`\`

### 2. ตรวจสอบว่า User Profile สร้างอัตโนมัติ

\`\`\`sql
SELECT id, email, role, tier, full_name, created_at 
FROM public.users 
ORDER BY created_at DESC 
LIMIT 5;
\`\`\`

### 3. ทดสอบ RLS Policy

\`\`\`sql
-- ต้อง login เป็น user ก่อน (ผ่าน app)
-- แล้วลอง query:
SELECT * FROM public.users WHERE id = auth.uid();
-- ควรเห็นเฉพาะข้อมูลของตัวเอง
\`\`\`

## 🔄 Migration Workflow

\`\`\`mermaid
graph TD
    A[Run Migration SQL] --> B{Tables Created?}
    B -->|Yes| C[Check ENUMs]
    B -->|No| Z[Check Error Logs]
    C --> D{ENUMs OK?}
    D -->|Yes| E[Check RLS Policies]
    D -->|No| Z
    E --> F{Policies OK?}
    F -->|Yes| G[Check Triggers]
    F -->|No| Z
    G --> H{Triggers OK?}
    H -->|Yes| I[Test User Signup]
    H -->|No| Z
    I --> J{Profile Created?}
    J -->|Yes| K[✅ Migration Complete]
    J -->|No| Z
    Z[❌ Review Error] --> A
\`\`\`

## 📦 What's Created

### Tables

#### `public.users`
- **Purpose**: User profiles with RBAC
- **Columns**:
  - `id` (UUID, FK to auth.users)
  - `email` (TEXT, UNIQUE)
  - `role` (user_role enum)
  - `tier` (analysis_tier enum)
  - `full_name`, `avatar_url`, `phone`
  - `created_at`, `updated_at`, `last_login_at`
  - `email_verified` (BOOLEAN)
  - `metadata` (JSONB)

#### `public.analysis_history`
- **Purpose**: Store analysis results
- **Columns**:
  - `id` (UUID)
  - `user_id` (UUID, FK to users)
  - `tier` (analysis_tier)
  - `image_url` (TEXT)
  - `results` (JSONB)
  - `created_at` (TIMESTAMPTZ)

### Functions

#### `handle_new_user()`
- Auto-creates user profile when auth.users record created
- Sets default role: `free_user`
- Sets default tier: `free`

#### `update_updated_at()`
- Auto-updates `updated_at` timestamp on user profile changes

#### `get_user_role(user_id UUID)`
- Helper function to get user's role

#### `user_has_permission(user_id UUID, required_role user_role)`
- Check if user has sufficient role level

### RLS Policies

**For `users` table**:
- Users can view their own data
- Users can update their own data (except role/tier)
- Super admin can view all users
- Super admin can update all users
- Clinic admin can view clinic staff

**For `analysis_history` table**:
- Users can view their own history
- Users can insert their own analysis
- Super admin can view all analysis

## 🔧 Troubleshooting

### Error: "type 'user_role' already exists"
\`\`\`sql
-- ลบ existing types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS analysis_tier CASCADE;
-- จากนั้น run migration ใหม่
\`\`\`

### Error: "table 'users' already exists"
\`\`\`sql
-- ดู existing schema
\d users
-- ถ้าต้องการ reset (⚠️ จะลบข้อมูล):
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.analysis_history CASCADE;
-- จากนั้น run migration ใหม่
\`\`\`

### Error: "trigger already exists"
\`\`\`sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
-- จากนั้น run migration ใหม่
\`\`\`

### User Profile ไม่ถูกสร้างอัตโนมัติ
1. Check trigger exists:
\`\`\`sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
\`\`\`

2. Check function exists:
\`\`\`sql
SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';
\`\`\`

3. Test manually:
\`\`\`sql
-- สร้าง user ใน auth.users ผ่าน Supabase Dashboard
-- จากนั้น check ว่ามี record ใน public.users หรือไม่
SELECT * FROM public.users WHERE id = '<user_id>';
\`\`\`

## 🗑️ Rollback

หากต้องการลบ migration (⚠️ **ระวัง: จะลบข้อมูลทั้งหมด**):

\`\`\`sql
-- Copy rollback script จากด้านล่าง 001_create_users_and_rbac.sql
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.update_updated_at();
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.get_user_role(UUID);
DROP FUNCTION IF EXISTS public.user_has_permission(UUID, user_role);
DROP TABLE IF EXISTS public.analysis_history;
DROP TABLE IF EXISTS public.users;
DROP TYPE IF EXISTS analysis_tier;
DROP TYPE IF EXISTS user_role;
\`\`\`

## 📚 Next Steps

หลังจาก run migration สำเร็จแล้ว:

1. ✅ ทดสอบ signup ผ่าน app
2. ✅ ตรวจสอบว่า user profile ถูกสร้างใน `public.users`
3. ✅ ทดสอบ login
4. ✅ ตรวจสอบว่า `last_login_at` update
5. ✅ ลองทำ analysis และเช็คว่าบันทึกใน `analysis_history`
6. ✅ Test role-based access control

## 🔗 Useful Links

- [Supabase Dashboard](https://supabase.com/dashboard)
- [SQL Editor](https://bgejeqqngzvuokdffadu.supabase.co/project/_/sql)
- [Table Editor](https://bgejeqqngzvuokdffadu.supabase.co/project/_/editor)
- [Auth Settings](https://bgejeqqngzvuokdffadu.supabase.co/project/_/auth/users)

## 📞 Support

หากมีปัญหา:
1. ตรวจสอบ error logs ใน SQL Editor
2. ดู Supabase logs: Project > Logs > Postgres Logs
3. ทดสอบทีละส่วนของ script
4. ตรวจสอบว่า RLS enabled: Table Editor > Select table > RLS

---

✨ **Happy Migrating!** ✨
