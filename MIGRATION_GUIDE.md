# 🚀 คู่มือรัน Migration สำหรับ Week 6: Action Plans & Smart Goals

## 📋 ภาพรวม
Migration นี้จะสร้าง 6 tables ใหม่สำหรับระบบ Action Plans และ Smart Goals:
1. `action_plans` - แผนดูแลผิวส่วนบุคคล
2. `action_items` - รายการขั้นตอนในแผน
3. `smart_goals` - เป้าหมายแบบ SMART
4. `goal_milestones` - ไมล์สโตนของเป้าหมาย
5. `goal_check_ins` - การบันทึกความก้าวหน้า
6. `goal_photos` - รูปภาพ Before/After

---

## วิธีที่ 1: รันผ่าน Node.js Script (แนะนำ) ⭐

### ขั้นตอน:

1. **ตรวจสอบว่าไฟล์พร้อมใช้งาน**
   ```powershell
   # ควรเห็นไฟล์ run-migration.js
   ls run-migration.js
   
   # ควรเห็นไฟล์ migration SQL
   ls supabase\migrations\20240121_action_plans_smart_goals.sql
   ```

2. **รัน Migration**
   ```powershell
   node run-migration.js
   ```

3. **ตรวจสอบผลลัพธ์**
   - ถ้าสำเร็จจะเห็น ✅ สำหรับทุก table
   - ถ้าผิดพลาดจะแสดงข้อความ error พร้อมรายละเอียด

4. **ตรวจสอบว่า tables ถูกสร้างแล้ว**
   ```powershell
   node check-db-schema.js
   ```

### ผลลัพธ์ที่คาดหวัง:
```
✅ Connected successfully!
📄 Migration file loaded
🚀 Executing migration...
✅ Migration executed successfully!

🔍 Verifying tables...
✅ action_plans: Created with 14 columns
✅ action_items: Created with 19 columns
✅ smart_goals: Created with 27 columns
✅ goal_milestones: Created with 9 columns
✅ goal_check_ins: Created with 9 columns
✅ goal_photos: Created with 6 columns

🎉 Week 6 Database Migration Complete!
```

---

## วิธีที่ 2: รันผ่าน Supabase Dashboard

### ขั้นตอน:

1. **เปิด Supabase Dashboard**
   - ไปที่: https://app.supabase.com/project/bgejeqqngzvuokdffadu

2. **ไปยัง SQL Editor**
   - คลิก **SQL Editor** ในเมนูซ้าย
   - หรือไปที่: https://app.supabase.com/project/bgejeqqngzvuokdffadu/sql

3. **สร้าง New Query**
   - คลิกปุ่ม "+ New query"

4. **คัดลอก SQL Migration**
   - เปิดไฟล์: `supabase\migrations\20240121_action_plans_smart_goals.sql`
   - คัดลอกเนื้อหาทั้งหมด (482 บรรทัด)
   - วางใน SQL Editor

5. **รัน SQL**
   - คลิกปุ่ม **Run** (หรือกด Ctrl+Enter)
   - รอจนเสร็จ (อาจใช้เวลา 5-10 วินาที)

6. **ตรวจสอบผลลัพธ์**
   - ควรเห็นข้อความ "Success. No rows returned"
   - ถ้ามี error จะแสดงข้อความสีแดง

7. **ตรวจสอบ Tables**
   - ไปที่ **Table Editor** ในเมนูซ้าย
   - ควรเห็น tables ใหม่ 6 ตัว:
     - action_plans
     - action_items
     - smart_goals
     - goal_milestones
     - goal_check_ins
     - goal_photos

---

## วิธีที่ 3: รันผ่าน psql CLI (สำหรับ Advanced Users)

### ขั้นตอน:

1. **ติดตั้ง PostgreSQL Client** (ถ้ายังไม่มี)
   ```powershell
   # ตรวจสอบว่ามี psql หรือไม่
   psql --version
   ```

2. **เชื่อมต่อฐานข้อมูล**
   ```powershell
   psql "postgres://postgres.bgejeqqngzvuokdffadu:fovdyaf2TGERL9Yz@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres"
   ```

3. **รัน Migration File**
   ```sql
   \i supabase/migrations/20240121_action_plans_smart_goals.sql
   ```

4. **ตรวจสอบ Tables**
   ```sql
   \dt action_*
   \dt *goal*
   ```

5. **ออกจาก psql**
   ```sql
   \q
   ```

---

## 🔍 การตรวจสอบหหลังรัน Migration

### ตรวจสอบผ่าน Node.js Script:
```powershell
node check-db-schema.js
```

### ตรวจสอบว่า Week 6 Tables มีครบหรือไม่:
ควรเห็นผลลัพธ์:
```
=== Checking Week 6 Tables Specifically ===

✅ action_plans: EXISTS with 14 columns
✅ action_items: EXISTS with 19 columns
✅ smart_goals: EXISTS with 27 columns
✅ goal_milestones: EXISTS with 9 columns
✅ goal_check_ins: EXISTS with 9 columns
✅ goal_photos: EXISTS with 6 columns
```

---

## ❓ Troubleshooting

### ปัญหา: Connection timeout
**วิธีแก้:**
- ตรวจสอบ internet connection
- ลองใช้วิธีที่ 2 (Supabase Dashboard) แทน

### ปัญหา: Permission denied
**วิธีแก้:**
- ตรวจสอบว่าใช้ password ถูกต้อง
- ลองใช้วิธีที่ 2 (Supabase Dashboard) แทน

### ปัญหา: Table already exists
**สาเหตุ:** Migration ถูกรันไปแล้วก่อนหน้านี้
**วิธีแก้:**
- ถ้าต้องการรันใหม่ ต้อง drop tables ก่อน:
  ```sql
  DROP TABLE IF EXISTS goal_photos CASCADE;
  DROP TABLE IF EXISTS goal_check_ins CASCADE;
  DROP TABLE IF EXISTS goal_milestones CASCADE;
  DROP TABLE IF EXISTS smart_goals CASCADE;
  DROP TABLE IF EXISTS action_items CASCADE;
  DROP TABLE IF EXISTS action_plans CASCADE;
  ```
- จากนั้นรัน migration ใหม่

### ปัญหา: Function already exists
**วิธีแก้:**
- ไม่ต้องกังวล SQL ใช้ `CREATE OR REPLACE FUNCTION` อยู่แล้ว
- ถ้ายัง error ให้ skip error นี้ไป

---

## 📊 สิ่งที่ Migration จะสร้าง

### Tables (6 ตัว):
- ✅ action_plans (14 columns)
- ✅ action_items (19 columns)
- ✅ smart_goals (27 columns)
- ✅ goal_milestones (9 columns)
- ✅ goal_check_ins (9 columns)
- ✅ goal_photos (6 columns)

### Indexes (20+ ตัว):
- Performance indexes สำหรับ queries ที่ใช้บ่อย
- Foreign key indexes
- Date/timestamp indexes

### RLS Policies (24 policies):
- Users can only access their own data
- Proper security isolation
- Cascade permissions for related data

### Functions (3 functions):
- `update_updated_at_column()` - Auto-update timestamps
- `calculate_action_plan_progress()` - Calculate plan progress
- `calculate_goal_progress()` - Calculate goal progress

### Triggers (3 triggers):
- Auto-update `updated_at` on action_plans
- Auto-update `updated_at` on action_items
- Auto-update `updated_at` on smart_goals

---

## ✅ Checklist หลังรัน Migration

- [ ] รัน migration สำเร็จ (ไม่มี error)
- [ ] Tables ทั้ง 6 ตัวถูกสร้างแล้ว
- [ ] รัน `node check-db-schema.js` แล้วเห็น ✅ ทั้งหมด
- [ ] RLS policies ถูกเปิดใช้งานแล้ว
- [ ] Indexes ถูกสร้างแล้ว
- [ ] Functions และ Triggers ทำงานได้

---

## 🚀 ขั้นตอนต่อไปหลังรัน Migration

1. **ทดสอบ API Endpoints**
   ```powershell
   # Start dev server
   pnpm dev
   
   # ทดสอบ API ด้วย Postman หรือ curl
   ```

2. **ทดสอบ Demo Page**
   - เปิด: http://localhost:3000/action-plan-demo
   - ทดสอบสร้าง action plan
   - ทดสอบสร้าง goal

3. **สร้างข้อมูลทดสอบ** (Optional)
   - ใช้ API endpoints เพื่อสร้าง sample data
   - หรือ insert ด้วย SQL ใน Supabase Dashboard

---

## 📝 หมายเหตุสำคัญ

- ⚠️ Migration นี้ **ปลอดภัย** ในการรัน เพราะใช้ `CREATE TABLE IF NOT EXISTS`
- ⚠️ ถ้ารันซ้ำจะไม่มี error (idempotent)
- ✅ ทุก table มี RLS policies เพื่อความปลอดภัย
- ✅ Foreign keys มี `ON DELETE CASCADE` เพื่อ data consistency
- ✅ Timestamps จะถูก auto-update ด้วย triggers

---

## 📞 ติดต่อสอบถาม

ถ้ามีปัญหาหรือคำถาม:
1. ตรวจสอบ error message ที่แสดง
2. ลองใช้วิธีอื่น (เช่น จาก CLI เปลี่ยนเป็น Dashboard)
3. ส่ง error log มาให้ช่วยแก้ไข

---

**สร้างโดย:** Beauty with AI Precision  
**วันที่:** 2024-01-21  
**เวอร์ชัน:** 1.0  
**ไฟล์ Migration:** supabase/migrations/20240121_action_plans_smart_goals.sql
