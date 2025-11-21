# 🚀 คู่มือการ Deploy Database Migrations

## สถานะปัจจุบัน
- ✅ สร้าง migration files เรียบร้อยแล้ว
- ✅ ทดสอบ SQL syntax แล้ว
- ⏳ รอ deploy ไปยัง production database

## 📝 Migrations ที่ต้อง Deploy (2 ไฟล์)

### 1. Video Call System
**ไฟล์**: `supabase/migrations/20241121_create_video_call_tables.sql`

**สร้างอะไรบ้าง:**
- ✅ ENUM: `video_call_status` (5 สถานะ)
- ✅ Table: `video_call_sessions` (ข้อมูลห้องวิดีโอคอล)
- ✅ Table: `video_call_participants` (ผู้เข้าร่วมการโทร)
- ✅ 10 RLS Policies (ความปลอดภัย)
- ✅ 2 Triggers (auto-calculate duration, log activities)
- ✅ 2 Functions (calculate_video_call_duration, log_video_call_activity)

**ขนาด**: ~325 บรรทัด

---

### 2. Email Tracking & Templates
**ไฟล์**: `supabase/migrations/20241121_create_email_tracking_templates.sql`

**สร้างอะไรบ้าง:**
- ✅ ENUM: `email_status` (8 สถานะ)
- ✅ ENUM: `email_template_category` (7 ประเภท)
- ✅ Table: `sales_email_templates` (เทมเพลตอีเมล)
- ✅ Table: `sales_email_tracking` (ติดตามอีเมล)
- ✅ 12 RLS Policies (ความปลอดภัย)
- ✅ 2 Triggers (increment template usage, log activities)
- ✅ 2 Functions (increment_template_usage, log_email_activity)
- ✅ 4 Pre-seeded Templates (ภาษาไทย)

**ขนาด**: ~327 บรรทัด

---

## 🎯 วิธีการ Deploy (เลือก 1 วิธี)

### วิธีที่ 1: ใช้ Supabase Dashboard (แนะนำ) ⭐

1. **เปิด SQL Editor**
   ```
   https://supabase.com/dashboard/project/bgejeqqngzvuokdffadu/sql/new
   ```

2. **Deploy Migration 1: Video Calls**
   - คัดลอกเนื้อหาทั้งหมดจาก `supabase/migrations/20241121_create_video_call_tables.sql`
   - วางใน SQL Editor
   - กด **RUN** (Ctrl+Enter)
   - รอจนขึ้น ✅ Success

3. **Deploy Migration 2: Email System**
   - คัดลอกเนื้อหาทั้งหมดจาก `supabase/migrations/20241121_create_email_tracking_templates.sql`
   - วางใน SQL Editor (tab ใหม่)
   - กด **RUN** (Ctrl+Enter)
   - รอจนขึ้น ✅ Success

4. **ตรวจสอบผลลัพธ์**
   - ไปที่ Table Editor: https://supabase.com/dashboard/project/bgejeqqngzvuokdffadu/editor
   - ควรเห็นตารางใหม่ 4 ตาราง:
     - ✅ `video_call_sessions`
     - ✅ `video_call_participants`
     - ✅ `sales_email_templates`
     - ✅ `sales_email_tracking`

---

### วิธีที่ 2: ใช้ PowerShell Script

```powershell
cd d:\127995803\Beauty-with-AI-Precision
.\scripts\deploy-migrations.ps1
```

**ข้อควรระวัง:**
- ⚠️ ต้องมี `.env.local` ที่มี `SUPABASE_SERVICE_ROLE_KEY`
- ⚠️ Script จะถามยืนยันก่อน deploy (พิมพ์ `yes`)
- ⚠️ ถ้า error ให้ใช้ Dashboard แทน

---

### วิธีที่ 3: ใช้ Supabase CLI (สำหรับ Local Development)

```powershell
# 1. Start Docker Desktop (ถ้ายังไม่ได้เปิด)
# 2. Start local Supabase
supabase start

# 3. Apply migrations
supabase db reset

# 4. Push to production (optional)
supabase db push
```

**ข้อควรระวัง:**
- ⚠️ ต้องมี Docker Desktop ทำงานอยู่
- ⚠️ `supabase db push` จะส่งไปยัง production ระวังให้ดี!

---

## ✅ การตรวจสอบหลัง Deploy

### 1. ตรวจสอบ Tables
```sql
-- ดูตารางทั้งหมด
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'video_call_sessions',
    'video_call_participants', 
    'sales_email_templates',
    'sales_email_tracking'
  )
ORDER BY table_name;
```

**ผลลัพธ์ที่คาดหวัง**: 4 rows

---

### 2. ตรวจสอบ RLS Policies
```sql
-- ดู policies ทั้งหมด
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN (
  'video_call_sessions',
  'video_call_participants',
  'sales_email_templates', 
  'sales_email_tracking'
)
ORDER BY tablename, policyname;
```

**ผลลัพธ์ที่คาดหวัง**: 22 rows (10 + 12 policies)

---

### 3. ตรวจสอบ Email Templates
```sql
-- ดูเทมเพลตที่ seed ไว้
SELECT id, name, category, is_active
FROM sales_email_templates
ORDER BY created_at;
```

**ผลลัพธ์ที่คาดหวัง**: 4 rows
- ติดตามลูกค้าครั้งแรก (follow_up)
- ส่งใบเสนอราคา (proposal)
- ขอบคุณหลังใช้บริการ (thank_you)
- แจ้งเตือนนัดหมาย (reminder)

---

### 4. ทดสอบ API Endpoints

**Chat Messages:**
```bash
curl "https://bgejeqqngzvuokdffadu.supabase.co/functions/v1/api/sales/chat-messages?lead_id=test-lead-id"
```

**Video Calls:**
```bash
curl "https://bgejeqqngzvuokdffadu.supabase.co/functions/v1/api/sales/video-call?lead_id=test-lead-id"
```

**Email Templates:**
```bash
curl "https://bgejeqqngzvuokdffadu.supabase.co/functions/v1/api/sales/email-templates"
```

---

## 🔄 Rollback (ถ้ามีปัญหา)

### ลบ Video Call Tables
```sql
-- ลบ tables
DROP TABLE IF EXISTS public.video_call_participants CASCADE;
DROP TABLE IF EXISTS public.video_call_sessions CASCADE;

-- ลบ ENUM
DROP TYPE IF EXISTS video_call_status CASCADE;

-- ลบ functions
DROP FUNCTION IF EXISTS calculate_video_call_duration() CASCADE;
DROP FUNCTION IF EXISTS log_video_call_activity() CASCADE;
```

### ลบ Email System Tables
```sql
-- ลบ tables
DROP TABLE IF EXISTS public.sales_email_tracking CASCADE;
DROP TABLE IF EXISTS public.sales_email_templates CASCADE;

-- ลบ ENUMs
DROP TYPE IF EXISTS email_status CASCADE;
DROP TYPE IF EXISTS email_template_category CASCADE;

-- ลบ functions
DROP FUNCTION IF EXISTS increment_template_usage() CASCADE;
DROP FUNCTION IF EXISTS log_email_activity() CASCADE;
```

---

## 📊 สรุปการเปลี่ยนแปลง

| ประเภท | จำนวน | รายละเอียด |
|--------|--------|-----------|
| **Tables** | 4 | video_call_sessions, video_call_participants, sales_email_templates, sales_email_tracking |
| **ENUMs** | 3 | video_call_status, email_status, email_template_category |
| **RLS Policies** | 22 | 10 (video) + 12 (email) |
| **Triggers** | 4 | duration calculation, activity logging, usage tracking |
| **Functions** | 4 | Helper functions สำหรับ triggers |
| **Indexes** | 8+ | Foreign keys และ performance indexes |
| **Seed Data** | 4 | Email templates ภาษาไทย |

---

## 🎉 หลัง Deploy แล้วทำอะไรต่อ?

### 1. ทดสอบ Realtime Features
```typescript
// Test chat subscription
const subscription = new SalesChatSubscription(supabase);
await subscription.subscribeToMessages('room-id', (message) => {
  console.log('New message:', message);
});
```

### 2. อัพเดท UI Components
- ✅ `ChatDrawer` → เชื่อมกับ `/api/sales/chat-messages`
- ✅ `VideoCallModal` → สร้างใหม่ใช้ `/api/sales/video-call`
- ✅ `EmailComposer` → สร้างใหม่ใช้ templates

### 3. ตั้งค่า External Services (ถ้าต้องการ)
- 📧 Email Service: SendGrid, AWS SES, Mailgun
- 📹 TURN Server: Twilio, Metered, Xirsys
- 📊 Analytics: Mixpanel, Amplitude

---

## 🆘 ถ้ามีปัญหา

### Error: "relation already exists"
➡️ ไม่เป็นไร! หมายความว่าตารางมีอยู่แล้ว migration ใช้ `IF NOT EXISTS` อยู่แล้ว

### Error: "permission denied"
➡️ ตรวจสอบว่าใช้ `SERVICE_ROLE_KEY` ไม่ใช่ `ANON_KEY`

### Error: "function does not exist"
➡️ อาจเป็นเพราะ dependency ตาราง `sales_leads` หรือ `users` ยังไม่มี

### ติดปัญหาอื่นๆ
➡️ ดูรายละเอียดเพิ่มเติมใน `SALES_DASHBOARD_IMPLEMENTATION.md`

---

## 📞 Contact

ถ้าต้องการความช่วยเหลือเพิ่มเติม:
- 📝 ดูเอกสารฉบับเต็ม: `SALES_DASHBOARD_IMPLEMENTATION.md`
- 📝 ดูเวอร์ชันภาษาไทย: `SALES_DASHBOARD_IMPLEMENTATION_TH.md`
- 🔗 Supabase Dashboard: https://supabase.com/dashboard/project/bgejeqqngzvuokdffadu

---

**วันที่**: 21 พฤศจิกายน 2025  
**สถานะ**: ✅ Migration files พร้อม deploy  
**ความสำเร็จ**: 95% (รอ deploy แล้วจะเป็น 100%)
