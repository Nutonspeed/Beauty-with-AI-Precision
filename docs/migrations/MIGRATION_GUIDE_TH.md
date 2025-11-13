# 🚀 คู่มือรัน Migrations สำหรับ Beauty Clinic System

## 📋 สิ่งที่ต้องเตรียม

### 1. ติดตั้ง Supabase CLI

\`\`\`powershell
# ติดตั้งผ่าน npm (แนะนำ)
npm install -g supabase

# หรือผ่าน Scoop (Windows)
scoop install supabase
\`\`\`

### 2. Login และ Link กับ Project

\`\`\`powershell
# Login เข้า Supabase
supabase login

# Link กับ project (หา project-ref ใน Supabase Dashboard -> Settings -> General)
supabase link --project-ref YOUR_PROJECT_REF
\`\`\`

### 3. เช็คว่าเชื่อมต่อสำเร็จ

\`\`\`powershell
supabase status
\`\`\`

---

## 🔍 Step 1: ตรวจสอบสถานะ Migrations

รัน script เพื่อดูว่ามี migrations อะไรบ้าง:

\`\`\`powershell
.\scripts\check-migrations.ps1
\`\`\`

**ผลลัพธ์ที่ควรเห็น:**
- ✅ OLD Migrations: 8 ไฟล์ (Base tables - น่าจะรันไปแล้ว)
- ✅ Fix Migrations: 5 ไฟล์ (Schema fixes)
- ✅ NEW Migrations: 13 ไฟล์ (Tasks 11-20 - ยังไม่ได้รัน)
- ⚠️ WARNING: Inventory conflict (ใช้ v2 แทน)

---

## ⚠️ Step 2: Backup Database

**สำคัญมาก!** Backup database ก่อนรัน migrations:

### วิธีที่ 1: ผ่าน Supabase Dashboard
1. ไปที่ Supabase Dashboard
2. Database -> Backups
3. กด "Create backup" หรือ download backup ที่มีอยู่

### วิธีที่ 2: ผ่าน CLI
\`\`\`powershell
# Export schema
supabase db dump --schema public > backup-schema.sql

# Export data
supabase db dump --data-only > backup-data.sql
\`\`\`

---

## 🚀 Step 3: รัน Migrations

### Option A: รันทีเดียวทั้งหมด (แนะนำ)

\`\`\`powershell
# Dry run (ดูว่าจะรันอะไรบ้างโดยไม่รันจริง)
.\scripts\run-migrations-safe.ps1 -DryRun

# รันจริง (จะถามยืนยันก่อน)
.\scripts\run-migrations-safe.ps1

# รันโดยไม่ถามยืนยัน (ระวัง!)
.\scripts\run-migrations-safe.ps1 -Force
\`\`\`

### Option B: รันทีละไฟล์ (ถ้าต้องการควบคุมเอง)

\`\`\`powershell
# Queue System (Task 13)
supabase db execute --file supabase/migrations/20250105_create_queue_system.sql

# Appointment System (Task 14)
supabase db execute --file supabase/migrations/20250105_create_appointment_system.sql

# Reports & Analytics (Task 15)
supabase db execute --file supabase/migrations/20250105_create_reports_analytics_system.sql

# Live Chat (Task 16)
supabase db execute --file supabase/migrations/20250105_create_live_chat_system.sql

# Branch Management (Task 17)
supabase db execute --file supabase/migrations/20250105_create_branch_management_system.sql

# Marketing & Promo (Task 18)
supabase db execute --file supabase/migrations/20250105_create_marketing_promo_system.sql

# Loyalty Points (Task 19)
supabase db execute --file supabase/migrations/20250105_create_loyalty_points_system.sql

# Inventory System v2 (Task 12 - fixed version)
supabase db execute --file supabase/migrations/20250105_create_inventory_system_v2.sql

# Treatment History (Task 20)
supabase db execute --file supabase/migrations/20250106_create_treatment_history_system.sql
\`\`\`

---

## ✅ Step 4: ตรวจสอบว่ารันสำเร็จ

### 1. เช็คใน Supabase Dashboard
- ไปที่ Database -> Tables
- ควรเห็น tables ใหม่ทั้งหมด

### 2. เช็คจาก CLI
\`\`\`powershell
# ดู tables ทั้งหมด
supabase db execute --query "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;"

# นับจำนวน tables
supabase db execute --query "SELECT COUNT(*) FROM pg_tables WHERE schemaname='public';"
\`\`\`

---

## 🔍 Tables ที่ควรมีหลังรัน Migrations

### Task 11: Dashboard (ใช้ existing tables)
- ไม่มี migration เพิ่ม (ใช้ query จาก existing tables)

### Task 12: Inventory System
- ✅ `inventory_categories`
- ✅ `inventory_suppliers`
- ✅ `inventory_items`
- ✅ `inventory_stock_movements`
- ✅ `inventory_purchase_orders`
- ✅ `inventory_purchase_order_items`
- ✅ `inventory_stock_alerts`

### Task 13: Queue Management
- ✅ `queue_entries`
- ✅ `queue_settings`
- ✅ `queue_notifications`
- ✅ `queue_statistics`

### Task 14: Appointment Scheduling
- ✅ `appointments`
- ✅ `appointment_services`
- ✅ `appointment_reminders`
- ✅ `appointment_cancellations`
- ✅ `availability_slots`

### Task 15: Reports & Analytics
- ✅ `generated_reports`
- ✅ `report_schedules`
- ✅ `analytics_events`

### Task 16: Live Chat
- ✅ `chat_rooms`
- ✅ `chat_messages`
- ✅ `chat_participants`
- ✅ `chat_read_status`

### Task 17: Branch Management
- ✅ `branches`
- ✅ `branch_staff_assignments`
- ✅ `branch_inventory`
- ✅ `branch_transfers`
- ✅ `branch_transfer_items`
- ✅ `branch_services`
- ✅ `branch_revenue`

### Task 18: Marketing & Promo
- ✅ `marketing_campaigns`
- ✅ `campaign_segments`
- ✅ `campaign_customers`
- ✅ `promo_codes`
- ✅ `promo_code_usage`
- ✅ `campaign_performance`

### Task 19: Loyalty Points
- ✅ `loyalty_tiers`
- ✅ `customer_loyalty_status`
- ✅ `loyalty_points_earning_rules`
- ✅ `loyalty_points_transactions`
- ✅ `loyalty_rewards`
- ✅ `loyalty_reward_redemptions`

### Task 20: Treatment History
- ✅ `treatment_records`
- ✅ `treatment_photos`
- ✅ `treatment_progress_notes`
- ✅ `treatment_outcomes`
- ✅ `treatment_comparisons`

---

## ❌ การแก้ไขปัญหาที่พบบ่อย

### Problem 1: "relation already exists"

\`\`\`powershell
# ถ้า migration พยายามสร้าง table ที่มีอยู่แล้ว
# แก้ไข: เช็คว่า old migrations รันไปแล้วหรือยัง
# หรือใช้ DROP TABLE IF EXISTS ก่อน CREATE TABLE
\`\`\`

### Problem 2: "cannot execute in a read-only transaction"

\`\`\`powershell
# แก้ไข: ใช้ service_role key แทน anon key
# ตั้งค่าใน .env หรือ Supabase settings
\`\`\`

### Problem 3: Inventory conflict

\`\`\`powershell
# ✅ วิธีแก้: ใช้ inventory_system_v2.sql แทน inventory_system.sql
# v2 จะ DROP old inventory table ก่อนสร้างใหม่
\`\`\`

### Problem 4: Foreign key constraint fails

\`\`\`powershell
# ตรวจสอบว่า base tables (clinics, users, treatments) มีอยู่แล้วหรือยัง
# รัน old migrations ก่อนถ้ายังไม่ได้รัน

supabase db execute --query "SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename IN ('clinics', 'users', 'treatments', 'bookings');"
\`\`\`

---

## 🎯 Checklist ก่อนรัน Production

- [ ] ✅ Backup database แล้ว
- [ ] ✅ ทดสอบใน development environment ก่อน
- [ ] ✅ เช็คว่า old migrations รันเรียบร้อยแล้ว
- [ ] ✅ ตรวจสอบว่าไม่มี conflicts
- [ ] ✅ อ่าน migration files แต่ละไฟล์แล้ว
- [ ] ✅ เตรียม rollback plan
- [ ] ✅ แจ้งทีมก่อนรัน (ถ้ามี)
- [ ] ✅ Monitor logs ระหว่างรัน

---

## 📞 ต้องการความช่วยเหลือ?

### เช็ค Migration History
\`\`\`powershell
supabase db execute --query "SELECT * FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 20;"
\`\`\`

### เช็ค Table Count
\`\`\`powershell
supabase db execute --query "SELECT COUNT(*) as total_tables FROM pg_tables WHERE schemaname='public';"
\`\`\`

### List All Functions
\`\`\`powershell
supabase db execute --query "SELECT routine_name FROM information_schema.routines WHERE routine_schema='public' ORDER BY routine_name;"
\`\`\`

### Check RLS Policies
\`\`\`powershell
supabase db execute --query "SELECT schemaname, tablename, policyname FROM pg_policies ORDER BY tablename, policyname;"
\`\`\`

---

## 🎉 สำเร็จแล้ว!

หลังจากรัน migrations เรียบร้อย:

1. ✅ ตรวจสอบว่า tables ครบทั้งหมด
2. ✅ ทดสอบ API endpoints ว่าทำงาน
3. ✅ เช็ค RLS policies ว่าถูกต้อง
4. ✅ ทดสอบระบบทั้งหมดอีกครั้ง

**ระบบ Beauty Clinic Management พร้อมใช้งานแล้ว!** 🎊
