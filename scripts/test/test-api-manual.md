# 🧪 Manual API Testing Guide

**Purpose**: ทดสอบ critical endpoints หลัง customers → users migration  
**Date**: December 26, 2025

---

## 🚀 Quick Start

### Option 1: Automated Tests (แนะนำ)
```bash
# ติดตั้ง dependencies (ถ้ายังไม่มี)
npm install

# รัน test script
npx ts-node scripts/test-api-endpoints.ts
```

### Option 2: Manual Testing (ใช้ Supabase Dashboard)

---

## ✅ Test Checklist

### 1. Database Health Check ⚡
**Location**: Supabase SQL Editor

```sql
-- ควรได้ health_status: "healthy"
SELECT check_database_health();
```

**Expected Result:**
```json
{
  "health_status": "healthy",
  "foreign_keys": 181,
  "indexes": 434,
  "duplicate_invitations": 0,
  "orphaned_analyses": 0
}
```

✅ Pass criteria: `health_status = "healthy"`

---

### 2. Users Table Query (แทน customers) 👥
**Location**: Supabase SQL Editor

```sql
-- ดึงข้อมูล customers จาก users table
SELECT 
  id,
  email,
  full_name,
  role,
  clinic_id,
  created_at
FROM users
WHERE role IN ('customer', 'customer_free', 'customer_premium')
ORDER BY created_at DESC
LIMIT 10;
```

**Expected Result:**
- ✅ ควรเห็น 6+ customer records
- ✅ ทุก record มี valid UUID id
- ✅ มี email และ full_name

---

### 3. Skin Analyses with Users FK 🔬
**Location**: Supabase SQL Editor

```sql
-- ทดสอบ FK relationship: skin_analyses → users
SELECT 
  sa.id,
  sa.user_id,
  u.email,
  u.full_name,
  sa.created_at
FROM skin_analyses sa
JOIN users u ON sa.user_id = u.id
ORDER BY sa.created_at DESC
LIMIT 10;
```

**Expected Result:**
- ✅ Query สำเร็จ (ไม่มี error)
- ✅ ทุก record มี user data
- ✅ ไม่มี NULL user_id

**Performance Check:**
```sql
EXPLAIN ANALYZE
SELECT * FROM skin_analyses WHERE user_id = '00000000-0000-0000-0000-000000000002';
```
- ✅ ควรใช้ Index Scan (ไม่ใช่ Seq Scan)
- ✅ Execution time < 5ms

---

### 4. Appointments FK to Users ✅
**Location**: Supabase SQL Editor

```sql
-- ตรวจสอบ FK constraint
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'appointments'
  AND kcu.column_name = 'customer_id';
```

**Expected Result:**
- ✅ `foreign_table_name = 'users'` (ไม่ใช่ 'customers')
- ✅ มี constraint_name เช่น `fk_appointments_customer_id`

---

### 5. Invitation Flow 📧
**Location**: Supabase Dashboard → Invitations Table

**Test A: Create Invitation**
```sql
-- สร้าง invitation ใหม่
INSERT INTO invitations (email, clinic_id, invited_by, role, expires_at)
VALUES (
  'test-manual@example.com',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  'customer',
  NOW() + INTERVAL '7 days'
)
RETURNING *;
```

**Expected Result:**
- ✅ Invitation created
- ✅ `token` auto-generated
- ✅ `status = 'pending'`

**Test B: Duplicate Prevention**
```sql
-- พยายามสร้างซ้ำ (ควร fail)
INSERT INTO invitations (email, clinic_id, invited_by, role, expires_at)
VALUES (
  'test-manual@example.com',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  'customer',
  NOW() + INTERVAL '7 days'
);
```

**Expected Result:**
- ❌ ควร error: "duplicate invitation exists"
- ✅ Trigger ทำงานถูกต้อง

**Cleanup:**
```sql
-- ลบ test invitation
DELETE FROM invitations WHERE email = 'test-manual@example.com';
```

---

### 6. Sales Leads Query 💼
**Location**: Supabase SQL Editor

```sql
-- ทดสอบ sales_leads → users relationship
SELECT 
  sl.id,
  sl.customer_user_id,
  u.email,
  u.full_name,
  sl.lead_status,
  sl.created_at
FROM sales_leads sl
LEFT JOIN users u ON sl.customer_user_id = u.id
WHERE sl.customer_user_id IS NOT NULL
LIMIT 10;
```

**Expected Result:**
- ✅ Query สำเร็จ
- ✅ ทุก lead มี user data (ไม่ NULL)
- ✅ ไม่มี orphaned leads

---

### 7. Performance Check ⚡
**Location**: Supabase SQL Editor

```sql
-- Test 1: User by ID (ควรเร็ว < 5ms)
EXPLAIN ANALYZE
SELECT * FROM users WHERE id = '00000000-0000-0000-0000-000000000002';

-- Test 2: Analyses by user (ควรใช้ index)
EXPLAIN ANALYZE
SELECT * FROM skin_analyses WHERE user_id = '00000000-0000-0000-0000-000000000002';

-- Test 3: Users by clinic (ควรใช้ index)
EXPLAIN ANALYZE
SELECT * FROM users WHERE clinic_id = '00000000-0000-0000-0000-000000000001';
```

**Expected Result:**
- ✅ ทุก query ใช้ "Index Scan" (ไม่ใช่ Seq Scan)
- ✅ Execution time < 5ms
- ✅ Cost < 10

---

### 8. No Orphaned Records 🧹
**Location**: Supabase SQL Editor

```sql
-- ตรวจสอบ orphaned skin_analyses
SELECT COUNT(*) as orphaned_analyses
FROM skin_analyses sa
LEFT JOIN users u ON sa.user_id = u.id
WHERE u.id IS NULL;

-- ตรวจสอบ orphaned sales_leads
SELECT COUNT(*) as orphaned_leads
FROM sales_leads sl
LEFT JOIN users u ON sl.customer_user_id = u.id
WHERE sl.customer_user_id IS NOT NULL AND u.id IS NULL;

-- ตรวจสอบ orphaned appointments
SELECT COUNT(*) as orphaned_appointments
FROM appointments a
LEFT JOIN users u ON a.customer_id = u.id
WHERE u.id IS NULL;
```

**Expected Result:**
- ✅ `orphaned_analyses = 0`
- ✅ `orphaned_leads = 0`
- ✅ `orphaned_appointments = 0`

---

## 🎯 API Endpoints Testing (Browser/Postman)

### Test 1: Sales Dashboard API
**Endpoint**: `GET /api/sales/overview`

**Setup:**
1. Login as sales staff
2. Get auth token from browser DevTools (Application → Cookies)

**Request:**
```bash
curl -X GET 'http://localhost:3000/api/sales/overview' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

**Expected Response:**
```json
{
  "totalCustomers": 6,
  "activeLeads": 5,
  "conversionRate": 0.83
}
```

✅ Pass criteria: No errors, valid numbers

---

### Test 2: Customer Notes API
**Endpoint**: `GET /api/customer-notes?user_id=XXX`

**Request:**
```bash
curl -X GET 'http://localhost:3000/api/customer-notes?user_id=USER_UUID' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

**Expected Response:**
```json
{
  "notes": [...],
  "total": 5
}
```

✅ Pass criteria: Returns customer notes successfully

---

### Test 3: Skin Analysis History
**Endpoint**: `GET /api/customer/analyses?user_id=XXX`

**Request:**
```bash
curl -X GET 'http://localhost:3000/api/customer/analyses?user_id=USER_UUID' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

**Expected Response:**
```json
{
  "analyses": [...],
  "count": 10
}
```

✅ Pass criteria: Returns analysis history

---

## 📊 Final Checklist

### Database ✅
- [ ] Health status: "healthy"
- [ ] Foreign keys: 181
- [ ] Indexes: 434
- [ ] No duplicates
- [ ] No orphaned records

### Queries ✅
- [ ] Users table works (replaces customers)
- [ ] Skin analyses FK works
- [ ] Appointments FK works
- [ ] Sales leads FK works
- [ ] All queries < 5ms

### API Endpoints ✅
- [ ] Sales dashboard works
- [ ] Customer notes works
- [ ] Skin analysis history works
- [ ] Invitation creation works
- [ ] No 500 errors

### Performance ✅
- [ ] All queries use indexes
- [ ] No sequential scans
- [ ] Response time < 100ms
- [ ] No slow queries

---

## 🎉 Success Criteria

**All tests pass if:**
1. ✅ Database health = "healthy"
2. ✅ No orphaned records
3. ✅ All FK point to users (not customers)
4. ✅ Performance < 5ms per query
5. ✅ API endpoints return valid data
6. ✅ No errors in console

**Status after all tests:**
```
🎉 System is PRODUCTION READY!
```

---

## 🚨 Troubleshooting

### Issue: Slow Queries
**Solution:**
```sql
-- Check missing indexes
SELECT * FROM pg_stat_user_indexes WHERE idx_scan = 0;

-- Analyze table statistics
ANALYZE users;
ANALYZE skin_analyses;
ANALYZE sales_leads;
```

### Issue: FK Errors
**Solution:**
```sql
-- Verify FK constraints
SELECT * FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
  AND table_name IN ('appointments', 'bookings', 'treatment_records');
```

### Issue: Orphaned Records
**Solution:**
```sql
-- Run health check
SELECT check_database_health();

-- Clean up if needed (carefully!)
-- DELETE FROM ... WHERE ...
```

---

**Last Updated**: December 26, 2025 04:52 AM UTC+7
