# ✅ Checklist: รัน Migrations

ใช้ checklist นี้ขณะรัน migrations เพื่อให้แน่ใจว่าทำครบทุกขั้นตอน

---

## 📋 Pre-Migration Checklist

- [ ] เปิด Supabase Dashboard แล้ว
- [ ] Login เข้า Project ที่ถูกต้อง
- [ ] Backup database เรียบร้อยแล้ว
- [ ] เปิด SQL Editor พร้อมแล้ว
- [ ] เตรียมไฟล์ migration files ทั้ง 4 batch

---

## 📦 Batch 1: Queue + Appointments + Reports

- [ ] เปิดไฟล์ `batch_1_queue_appointment_reports.sql`
- [ ] Copy ทั้งหมด
- [ ] Paste ใน SQL Editor (New Query)
- [ ] คลิก Run
- [ ] เห็นข้อความ: "12 tables created in this batch" ✅
- [ ] ไม่มี error messages ❌

**ถ้ามี Error:**
- [ ] Screenshot error
- [ ] บันทึก error message
- [ ] หยุดไว้ก่อน - ไม่รัน batch ถัดไป

---

## 📦 Batch 2: Chat + Branch

- [ ] เปิดไฟล์ `batch_2_chat_branch.sql`
- [ ] Copy ทั้งหมด
- [ ] Paste ใน SQL Editor (New Query)
- [ ] คลิก Run
- [ ] เห็นข้อความ: "11 tables created in this batch" ✅
- [ ] ไม่มี error messages ❌

**ถ้ามี Error:**
- [ ] Screenshot error
- [ ] บันทึก error message
- [ ] หยุดไว้ก่อน

---

## 📦 Batch 3: Marketing + Loyalty

- [ ] เปิดไฟล์ `batch_3_marketing_loyalty.sql`
- [ ] Copy ทั้งหมด
- [ ] Paste ใน SQL Editor (New Query)
- [ ] คลิก Run
- [ ] เห็นข้อความยืนยันการสร้าง tables ✅
- [ ] ไม่มี error messages ❌

---

## 📦 Batch 4: Inventory + Treatment

- [ ] เปิดไฟล์ `batch_4_inventory_treatment.sql`
- [ ] Copy ทั้งหมด
- [ ] Paste ใน SQL Editor (New Query)
- [ ] คลิก Run
- [ ] เห็นข้อความยืนยันการสร้าง tables ✅
- [ ] ไม่มี error messages ❌

---

## ✅ Post-Migration Verification

### เช็ค Tables ใน Dashboard

- [ ] ไปที่ Database → Tables
- [ ] เห็น tables ใหม่ทั้งหมด (~45 tables)

**Batch 1 Tables (12):**
- [ ] queue_entries
- [ ] queue_settings
- [ ] queue_notifications
- [ ] queue_statistics
- [ ] appointments
- [ ] appointment_services
- [ ] appointment_reminders
- [ ] appointment_cancellations
- [ ] availability_slots
- [ ] generated_reports
- [ ] report_schedules
- [ ] analytics_events

**Batch 2 Tables (11):**
- [ ] chat_rooms
- [ ] chat_messages
- [ ] chat_participants
- [ ] chat_read_status
- [ ] branches
- [ ] branch_staff_assignments
- [ ] branch_inventory
- [ ] branch_transfers
- [ ] branch_transfer_items
- [ ] branch_services
- [ ] branch_revenue

**Batch 3 Tables (10-12):**
- [ ] marketing_campaigns
- [ ] promo_codes
- [ ] promo_code_usage
- [ ] customer_segments
- [ ] campaign_customers
- [ ] loyalty_tiers
- [ ] customer_loyalty_status
- [ ] points_earning_rules
- [ ] points_transactions
- [ ] loyalty_rewards
- [ ] loyalty_reward_redemptions

**Batch 4 Tables (12):**
- [ ] inventory_categories
- [ ] inventory_suppliers
- [ ] inventory_items
- [ ] inventory_stock_movements
- [ ] inventory_purchase_orders
- [ ] inventory_purchase_order_items
- [ ] inventory_stock_alerts
- [ ] treatment_records
- [ ] treatment_photos
- [ ] treatment_progress_notes
- [ ] treatment_outcomes
- [ ] treatment_comparisons

### เช็คด้วย SQL

- [ ] รัน query นับ tables: `SELECT COUNT(*) FROM pg_tables WHERE schemaname='public';`
- [ ] จำนวน tables เพิ่มขึ้น ~45 tables ✅

### เช็ค RLS Policies

- [ ] รัน query: `SELECT tablename, COUNT(*) FROM pg_policies GROUP BY tablename;`
- [ ] ทุก table ใหม่มี RLS policy ✅

### เช็ค Functions

- [ ] ไปที่ Database → Functions
- [ ] เห็น functions ใหม่ (ถ้ามี)

---

## 🧪 Testing

### Test API Endpoints

- [ ] ทดสอบ GET /api/queue/entries
- [ ] ทดสอบ GET /api/appointments
- [ ] ทดสอบ GET /api/chat/rooms
- [ ] ทดสอบ GET /api/branches
- [ ] ทดสอบ GET /api/marketing/campaigns
- [ ] ทดสอบ GET /api/loyalty/tiers
- [ ] ทดสอบ GET /api/inventory/items
- [ ] ทดสอบ GET /api/treatment-history/records

### Test Data Insert

- [ ] ลองสร้าง queue entry ใหม่
- [ ] ลองสร้าง appointment ใหม่
- [ ] ลองสร้าง chat room ใหม่
- [ ] ทุกอย่างทำงานปกติ ✅

---

## 📝 Final Checklist

- [ ] **Migration สำเร็จทั้ง 4 batches** ✅
- [ ] **Tables ครบทั้งหมด** ✅
- [ ] **RLS policies ทำงาน** ✅
- [ ] **API endpoints ทำงาน** ✅
- [ ] **Test insert data สำเร็จ** ✅
- [ ] **Backup database หลัง migration** ✅ (แนะนำ)

---

## 🎉 สำเร็จแล้ว!

- [ ] ระบบ Beauty Clinic Management พร้อมใช้งาน 100%
- [ ] API endpoints ทั้งหมดพร้อมใช้งาน
- [ ] Database schema complete
- [ ] สามารถเริ่มพัฒนา frontend ได้เลย

**ยินดีด้วย!** 🎊

---

## ⚠️ ถ้ามีปัญหา

บันทึกข้อมูลเหล่านี้:

- [ ] Batch ที่เกิด error: _________________
- [ ] Error message: _________________
- [ ] Screenshot error (ถ้ามี)
- [ ] Tables ที่สร้างสำเร็จก่อน error: _________________

**อย่าลืม:** มี backup ไว้แล้ว สามารถ rollback ได้ตลอดเวลา!
