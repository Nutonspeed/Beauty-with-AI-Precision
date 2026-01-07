# Phase 7: Database Migration & RLS Testing Checklist

**วันที่:** 3 พฤศจิกายน 2025  
**เป้าหมาย:** ตรวจสอบ database พร้อม production และทดสอบ RLS policies

---

## ✅ Task 1: Review Database Tables

### การตรวจสอบ Supabase Dashboard

1. **Login to Supabase**
   - URL: https://supabase.com/dashboard
   - Project: [Your Project Name]

2. **ตรวจสอบ Tables (Table Editor)**

**Core Tables (ต้องมี):**
- [ ] `users` - User accounts
- [ ] `user_profiles` - Extended profile info
- [ ] `clinics` - Clinic information
- [ ] `customers` - Customer records
- [ ] `bookings` - Appointment bookings
- [ ] `services` - Treatment services
- [ ] `skin_analyses` - AI analysis results
- [ ] `chat_history` - AI chat conversations ✅ (Phase 6)
- [ ] `user_preferences` - User settings

**Check Columns:**
- [ ] All tables have `id` (UUID primary key)
- [ ] All tables have `created_at` timestamp
- [ ] Foreign keys properly set (user_id, clinic_id, etc.)

3. **Screenshot หน้า Table Editor** → บันทึกไว้เป็นหลักฐาน

---

## ✅ Task 2: Run Missing Migrations

### Migration Files ที่ต้องรัน

**ตรวจสอบแต่ละไฟล์:**

1. **SUPABASE_MIGRATION_clinics.sql**
   - [ ] อ่านไฟล์ตรวจสอบ SQL
   - [ ] Copy SQL code
   - [ ] ไป Supabase → SQL Editor → New Query
   - [ ] Paste และ Run
   - [ ] ตรวจสอบ Success / Error

2. **SUPABASE_MIGRATION_customers.sql**
   - [ ] Run SQL in Supabase
   - [ ] Verify table created

3. **SUPABASE_MIGRATION_bookings.sql**
   - [ ] Run SQL in Supabase
   - [ ] Verify table created

4. **SUPABASE_MIGRATION_services.sql**
   - [ ] Run SQL in Supabase
   - [ ] Verify table created

5. **SUPABASE_MIGRATION_user_preferences.sql**
   - [ ] Run SQL in Supabase
   - [ ] Verify table created

6. **SUPABASE_MIGRATION_foreign_keys.sql**
   - [ ] Run SQL in Supabase (รันหลังสุด!)
   - [ ] Verify foreign keys created

**Expected Results:**
- ✅ All 6 migrations completed
- ✅ No SQL errors
- ✅ All tables visible in Table Editor

---

## ✅ Task 3 & 4: Test RLS Policies

### RLS Testing Scenarios

**Scenario 1: Super Admin Access**
\`\`\`sql
-- Login as: super_admin@test.com
-- Should see ALL data from all clinics

-- Test query:
SELECT * FROM clinics; -- Should return all clinics
SELECT * FROM users; -- Should return all users
SELECT * FROM skin_analyses; -- Should return all analyses
\`\`\`
- [ ] ทดสอบ super_admin เห็นข้อมูลทุก clinic
- [ ] Screenshot ผลลัพธ์

**Scenario 2: Clinic Owner Access**
\`\`\`sql
-- Login as: clinic_owner@test.com (clinic_id = 'xxx')
-- Should see ONLY own clinic data

SELECT * FROM clinics WHERE id = auth.uid()::text; -- Own clinic only
SELECT * FROM users WHERE clinic_id = (SELECT clinic_id FROM user_profiles WHERE user_id = auth.uid());
\`\`\`
- [ ] ทดสอบ clinic_owner เห็นแค่ clinic ตัวเอง
- [ ] ทดสอบ clinic_owner ไม่เห็น clinic อื่น
- [ ] Screenshot ผลลัพธ์

**Scenario 3: Staff Access**
\`\`\`sql
-- Login as: staff@test.com (clinic_id = 'xxx')
-- Should see ONLY own clinic data

SELECT * FROM customers WHERE clinic_id = (SELECT clinic_id FROM user_profiles WHERE user_id = auth.uid());
\`\`\`
- [ ] ทดสอบ staff เห็นแค่ customer ใน clinic ตัวเอง
- [ ] Screenshot ผลลัพธ์

**Scenario 4: Customer Access**
\`\`\`sql
-- Login as: customer@test.com
-- Should see ONLY own data

SELECT * FROM skin_analyses WHERE user_id = auth.uid(); -- Own analyses only
SELECT * FROM chat_history WHERE user_id = auth.uid(); -- Own chats only
\`\`\`
- [ ] ทดสอบ customer เห็นแค่ข้อมูลตัวเอง
- [ ] Screenshot ผลลัพธ์

---

## ✅ Task 5: Create Database Indexes

### Performance Indexes

**คำสั่ง SQL:**

\`\`\`sql
-- Index for skin_analyses
CREATE INDEX IF NOT EXISTS idx_skin_analyses_user_id ON skin_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_skin_analyses_created_at ON skin_analyses(created_at DESC);

-- Index for chat_history (already created in Phase 6)
-- CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);

-- Index for bookings
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_clinic_id ON bookings(clinic_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);

-- Index for customers
CREATE INDEX IF NOT EXISTS idx_customers_clinic_id ON customers(clinic_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Index for user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_clinic_id ON user_profiles(clinic_id);
\`\`\`

**Tasks:**
- [ ] Copy SQL to Supabase SQL Editor
- [ ] Run และตรวจสอบ Success
- [ ] Verify indexes ใน Table Editor → Indexes tab

---

## ✅ Task 6: Setup Database Backups

### Supabase Backup Configuration

1. **Go to Supabase Dashboard → Database → Backups**

2. **Check Current Backup Settings:**
   - [ ] Daily backups enabled? (default: Yes)
   - [ ] Retention period? (default: 7 days)
   - [ ] Point-in-time recovery enabled? (paid plan)

3. **Enable if not active:**
   - [ ] Enable automatic daily backups
   - [ ] Set retention to 7 days minimum

4. **Manual Backup (optional):**
   - [ ] Click "Create backup now"
   - [ ] Wait for completion
   - [ ] Verify backup in list

**Expected:**
- ✅ Automatic backups: Enabled
- ✅ Retention: 7+ days
- ✅ Last backup: < 24 hours ago

---

## ✅ Task 7: Fix RLS Infinite Recursion Bug

### Issue: users table RLS causes recursion

**Problem:**
\`\`\`
RLS infinite recursion error on users table
\`\`\`

**Solution SQL:**

\`\`\`sql
-- Drop problematic policies
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;

-- Create simple, non-recursive policies
CREATE POLICY "users_select_policy" 
ON public.users 
FOR SELECT 
USING (
  auth.uid() = id -- Users can see their own record
  OR 
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.role = 'super_admin'
  ) -- Super admins see all
);

CREATE POLICY "users_update_policy" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id); -- Users can update their own record
\`\`\`

**Tasks:**
- [ ] Run SQL in Supabase
- [ ] Test query: `SELECT * FROM users;`
- [ ] Verify no recursion error
- [ ] Test login flow still works

---

## 📊 Success Criteria

**Phase 7 Complete When:**
- ✅ All 9 tables exist in Supabase
- ✅ All migrations run successfully
- ✅ RLS policies working correctly:
  - Super admin sees all data ✅
  - Clinic owner sees own clinic only ✅
  - Staff sees own clinic only ✅
  - Customer sees own data only ✅
- ✅ Performance indexes created
- ✅ Database backups enabled
- ✅ No RLS recursion errors

---

## 📝 Next Steps (Phase 8)

After completing Phase 7:
- [ ] Document database schema
- [ ] Create user guide for database
- [ ] Prepare API documentation
- [ ] Update README.md

---

## 🐛 Common Issues & Solutions

### Issue 1: Migration fails - "relation already exists"
**Solution:** Table already created, skip this migration

### Issue 2: RLS policy blocks own data
**Solution:** Check policy logic, ensure `auth.uid()` comparison

### Issue 3: Foreign key constraint fails
**Solution:** Ensure parent tables exist before running foreign_keys.sql

### Issue 4: Index creation slow
**Solution:** Normal for large tables, wait 30-60 seconds

---

**ผู้รับผิดชอบ:** [Your Name]  
**วันที่เริ่ม:** ___________  
**วันที่เสร็จ:** ___________
