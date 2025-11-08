# Customer Notes Migration Guide

## 🚀 วิธีรัน Migration

### Step 1: เข้า Supabase Dashboard
1. ไปที่ [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. เลือก Project ของคุณ
3. ไปที่ **SQL Editor** (เมนูด้านซ้าย)

### Step 2: รัน Migration Script
1. คลิก **New Query**
2. Copy-paste ทั้งหมดจากไฟล์:
   ```
   prisma/migrations/manual/20250108_customer_notes.sql
   ```
3. กด **Run** (หรือ Ctrl/Cmd + Enter)
4. ตรวจสอบว่าไม่มี error (ควรเห็น "Success. No rows returned")

### Step 3: ทดสอบ Migration
1. สร้าง **New Query** ใหม่
2. Copy-paste ทั้งหมดจากไฟล์:
   ```
   prisma/migrations/manual/20250108_test_customer_notes.sql
   ```
3. กด **Run** แล้วดูผลลัพธ์

### Step 4: ตรวจสอบผลลัพธ์

**ควรเห็น:**
- ✅ Table `customer_notes` มี 17 columns
- ✅ มี 5 indexes:
  - `idx_customer_notes_customer`
  - `idx_customer_notes_staff`
  - `idx_customer_notes_clinic`
  - `idx_customer_notes_followup`
  - `idx_customer_notes_pinned`
- ✅ RLS enabled: `rowsecurity = true`
- ✅ มี 4 policies:
  - `customer_notes_select_policy`
  - `customer_notes_insert_policy`
  - `customer_notes_update_policy`
  - `customer_notes_delete_policy`
- ✅ มี 1 trigger: `customer_notes_updated_at`

## 🧪 ทดสอบการทำงาน (Optional)

### ทดสอบ Insert Note

```sql
-- แทนที่ UUIDs ด้วยข้อมูลจริงจาก database ของคุณ
INSERT INTO customer_notes (
  customer_id,
  sales_staff_id, 
  clinic_id,
  content,
  note_type,
  tags,
  created_by_name
) VALUES (
  (SELECT id FROM users WHERE role = 'customer' LIMIT 1),
  (SELECT id FROM users WHERE role = 'sales' LIMIT 1),
  (SELECT id FROM clinics LIMIT 1),
  'โทรติดต่อลูกค้า สนใจ Botox 50 units งบประมาณ 15,000 บาท นัดมาปรึกษา 15 พ.ย. 2025',
  'call',
  ARRAY['ร้อนแรง', 'สนใจ-botox', 'งบ-15k'],
  'ทดสอบระบบ'
) RETURNING *;
```

### ทดสอบ Query Notes

```sql
-- ดู notes ทั้งหมด
SELECT 
  id,
  content,
  note_type,
  tags,
  is_pinned,
  created_by_name,
  created_at
FROM customer_notes
ORDER BY created_at DESC
LIMIT 10;
```

### ทดสอบ Update Note

```sql
-- Pin note
UPDATE customer_notes
SET is_pinned = true
WHERE id = 'YOUR_NOTE_ID'
RETURNING *;
```

### ทดสอบ Delete Note

```sql
-- ลบ note ทดสอบ
DELETE FROM customer_notes
WHERE created_by_name = 'ทดสอบระบบ';
```

## ✅ Checklist

- [ ] รัน migration script สำเร็จ (ไม่มี error)
- [ ] ตรวจสอบ table structure ครบ
- [ ] ตรวจสอบ indexes ครบ 5 indexes
- [ ] ตรวจสอบ RLS enabled
- [ ] ตรวจสอบ policies ครบ 4 policies
- [ ] ตรวจสอบ trigger ทำงาน
- [ ] (Optional) ทดสอบ Insert/Select/Update/Delete

## 🐛 Troubleshooting

### Error: relation "skin_analyses" does not exist
**สาเหตุ:** ตาราง `skin_analyses` ยังไม่มีในระบบ

**แก้ไข:** ลบบรรทัดที่เกี่ยวข้องกับ `related_scan_id` ออก:

```sql
-- แก้จาก
related_scan_id UUID REFERENCES skin_analyses(id) ON DELETE SET NULL,

-- เป็น
related_scan_id UUID,
```

### Error: relation "clinics" does not exist
**สาเหตุ:** ตาราง `clinics` ยังไม่มี

**แก้ไข:** ใช้ `users` แทน หรือสร้างตาราง `clinics` ก่อน

### Error: policy already exists
**สาเหตุ:** รัน migration ซ้ำ

**แก้ไข:** Drop policies ก่อน:

```sql
DROP POLICY IF EXISTS customer_notes_select_policy ON customer_notes;
DROP POLICY IF EXISTS customer_notes_insert_policy ON customer_notes;
DROP POLICY IF EXISTS customer_notes_update_policy ON customer_notes;
DROP POLICY IF EXISTS customer_notes_delete_policy ON customer_notes;
```

แล้วรัน migration ใหม่

## 📊 Production Checklist

ก่อนใช้งานจริง:

- [ ] Backup database
- [ ] ทดสอบใน staging environment ก่อน
- [ ] ตรวจสอบ RLS policies ให้แน่ใจว่าปลอดภัย
- [ ] ทดสอบ performance ด้วย mock data
- [ ] Setup monitoring สำหรับ slow queries
- [ ] เตรียม rollback plan

## 🔄 Rollback (ถ้าต้องการย้อนกลับ)

```sql
-- Drop table (ระวัง: จะลบข้อมูลทั้งหมด!)
DROP TABLE IF EXISTS customer_notes CASCADE;

-- Drop function
DROP FUNCTION IF EXISTS update_customer_notes_updated_at() CASCADE;
```

## 📞 Support

หากมีปัญหา:
1. ตรวจสอบ error message
2. ดู Supabase logs
3. ตรวจสอบ database schema
4. ทดสอบ policies ด้วย SQL queries
