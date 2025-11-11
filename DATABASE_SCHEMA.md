# 🗄️ DATABASE SCHEMA DOCUMENTATION

> **Last Updated:** 2025-11-12  
> **Total Tables:** 78 tables  
> **Database:** PostgreSQL (Supabase)

---

## 📊 ภาพรวมฐานข้อมูล

### การเชื่อมต่อฐานข้อมูล

```env
SUPABASE_URL="https://bgejeqqngzvuokdffadu.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
POSTGRES_URL="postgres://postgres.bgejeqqngzvuokdffadu:fovdyaf2TGERL9Yz@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require"
```

### สถิติฐานข้อมูล

- **Total Tables:** 78 tables (verified 2025-11-12)
- **Tables with Data:** 
  - `skin_analyses`: 34 rows (ข้อมูลหลัก)
  - `users`: 4 rows (ผู้ใช้งาน)
  - `invitations`: 4 rows (NEW - invitation system)
  - `chat_history`: 4 rows
  - `error_logs`: 2 rows
  - `performance_metrics`: 144 rows
  - อื่น ๆ: พร้อมใช้งาน (0 rows)

---

## 🏗️ โครงสร้างตาราง (78 Tables)

### 📁 **1. Core System Tables** (4 tables)

#### `users` (13 columns, 4 rows) ✅
- **Purpose:** ข้อมูลผู้ใช้หลัก
- **Key Columns:** id, email, role, created_at
- **Relations:** หลายตารางอ้างอิงถึงตารางนี้
- **Migration:** Built-in Supabase Auth

#### `user_profiles` (0 rows) ✅
- **Purpose:** โปรไฟล์เพิ่มเติมของผู้ใช้
- **Status:** พร้อมใช้งาน

#### `user_preferences` (10 columns, 1 rows) ✅
- **Purpose:** การตั้งค่าของผู้ใช้
- **Features:** Theme, language, notifications

#### `user_activity_log` (7 columns, 0 rows) ✅
- **Purpose:** บันทึกกิจกรรมผู้ใช้

---

### 🔬 **2. AI Analysis Tables** (4 tables)

#### `skin_analyses` (37 columns, 34 rows) ✅ **มีข้อมูล**
- **Purpose:** ผลวิเคราะห์ผิวหน้าจาก AI
- **Key Features:**
  - รองรับ 15 ปัญหาผิว
  - คำแนะนำส่วนบุคคล
  - Severity scoring
  - Photo URLs
- **Migration:** `20250109_create_skin_analyses.sql`
- **Used By:** Action Plans, Treatments

#### `analyses` (9 columns, 0 rows) ✅
- **Purpose:** วิเคราะห์เพิ่มเติม

#### `analysis_history` (6 columns, 0 rows) ✅
- **Purpose:** ประวัติการวิเคราะห์

#### `analytics_events` (5 columns, 0 rows) ✅
- **Purpose:** Event tracking

---

### 📋 **3. Week 6: Action Plans & Smart Goals** (6 tables) ✅ **ติดตั้งใหม่**

#### `action_plans` (12 columns, 0 rows) ✅ **NEW**
- **Purpose:** แผนดูแลผิวส่วนบุคคล
- **Key Columns:**
  - `id` (UUID, PK)
  - `user_id` (UUID, FK → users)
  - `analysis_id` (UUID, FK → skin_analyses)
  - `skin_health_score` (0-100)
  - `primary_concerns` (TEXT[])
  - `total_actions` (INTEGER)
  - `estimated_cost_min/max` (DECIMAL)
  - `progress_percentage` (0-100)
- **Relations:**
  - → action_items (1:many)
  - → smart_goals (1:many)
- **RLS:** Users can only access their own plans
- **Migration:** `20240121_action_plans_smart_goals.sql`

#### `action_items` (20 columns, 0 rows) ✅ **NEW**
- **Purpose:** รายการขั้นตอนในแผน
- **Key Columns:**
  - `id` (UUID, PK)
  - `plan_id` (UUID, FK → action_plans)
  - `title`, `description` (VARCHAR/TEXT)
  - `category` (daily/weekly/monthly/professional/lifestyle)
  - `priority` (immediate/short-term/long-term)
  - `concern_types` (TEXT[])
  - `frequency`, `estimated_duration`
  - `cost_min/max`, `currency`
  - `difficulty` (easy/medium/hard)
  - `status` (not-started/in-progress/completed/skipped)
  - `start_date`, `completed_date`
  - `display_order` (INTEGER)
- **Features:**
  - 5 categories
  - 3 priority levels
  - 4 status types
  - Cost estimation
- **RLS:** Inherited from action_plans
- **Migration:** `20240121_action_plans_smart_goals.sql`

#### `smart_goals` (28 columns, 0 rows) ✅ **NEW**
- **Purpose:** เป้าหมายแบบ SMART
- **SMART Framework:**
  - **S**pecific: title, description, concern_types
  - **M**easurable: metric, baseline, target, current_value, unit
  - **A**chievable: difficulty, required_actions, prerequisites
  - **R**elevant: importance (1-5), motivations, related_goals
  - **T**ime-bound: time_frame, start_date, end_date, check_in_frequency
- **Key Columns:**
  - `id` (UUID, PK)
  - `user_id` (UUID, FK → users)
  - `plan_id` (UUID, FK → action_plans)
  - `type` (improvement/maintenance/prevention/habit)
  - `status` (active/completed/paused/abandoned)
  - `progress_percentage` (0-100)
- **Features:**
  - 4 goal types
  - 4 status options
  - Progress tracking
  - Photo comparison
- **Relations:**
  - → goal_milestones (1:many)
  - → goal_check_ins (1:many)
  - → goal_photos (1:many)
- **RLS:** Users can only access their own goals
- **Migration:** `20240121_action_plans_smart_goals.sql`

#### `goal_milestones` (11 columns, 0 rows) ✅ **NEW**
- **Purpose:** ไมล์สโตนของเป้าหมาย
- **Key Columns:**
  - `id` (UUID, PK)
  - `goal_id` (UUID, FK → smart_goals)
  - `title`, `description`
  - `target_date`, `target_value`
  - `completed` (BOOLEAN)
  - `completed_date`
  - `reward` (VARCHAR)
  - `display_order`
- **Features:** Checkpoint tracking with rewards
- **RLS:** Inherited from smart_goals
- **Migration:** `20240121_action_plans_smart_goals.sql`

#### `goal_check_ins` (9 columns, 0 rows) ✅ **NEW**
- **Purpose:** บันทึกความก้าวหน้า
- **Key Columns:**
  - `id` (UUID, PK)
  - `goal_id` (UUID, FK → smart_goals)
  - `date`, `current_value`
  - `notes`, `photo_url`
  - `mood` (great/good/okay/struggling)
  - `adherence` (0-100)
- **Features:** Regular progress tracking with mood
- **RLS:** Inherited from smart_goals
- **Migration:** `20240121_action_plans_smart_goals.sql`

#### `goal_photos` (7 columns, 0 rows) ✅ **NEW**
- **Purpose:** รูปภาพ Before/After
- **Key Columns:**
  - `id` (UUID, PK)
  - `goal_id` (UUID, FK → smart_goals)
  - `photo_type` (before/progress/after)
  - `url`, `date`, `notes`
- **Features:** Photo comparison timeline
- **RLS:** Inherited from smart_goals
- **Migration:** `20240121_action_plans_smart_goals.sql`

---

### 📅 **4. Booking System Tables** (11 tables)

#### `bookings` (25 columns, 0 rows) ✅
- **Purpose:** การจองคิว
- **Features:** Full booking management

#### `appointments` (14 columns, 0 rows) ✅
- **Purpose:** นัดหมาย

#### `appointment_services` (7 columns, 0 rows) ✅
#### `appointment_reminders` (7 columns, 0 rows) ✅
#### `appointment_cancellations` (5 columns, 0 rows) ✅
#### `availability_slots` (8 columns, 0 rows) ✅
#### `services` (23 columns, 0 rows) ✅
#### `branches` (13 columns, 0 rows) ✅
#### `branch_services` (8 columns, 0 rows) ✅
#### `branch_staff_assignments` (9 columns, 0 rows) ✅
#### `branch_revenue` (7 columns, 0 rows) ✅

---

### 🏥 **5. Clinic Management Tables** (3 tables)

#### `clinics` (20 columns, 1 rows) ✅
- **Purpose:** ข้อมูลคลินิก
- **Status:** มีข้อมูล 1 คลินิก

#### `clinic_staff` (25 columns, 0 rows) ✅
- **Purpose:** พนักงานคลินิก

---

### 💬 **6. Chat System Tables** (5 tables)

#### `chat_rooms` (9 columns, 0 rows) ✅
#### `chat_messages` (10 columns, 0 rows) ✅
#### `chat_participants` (7 columns, 0 rows) ✅
#### `chat_read_status` (4 columns, 0 rows) ✅
#### `chat_history` (6 columns, 4 rows) ✅ **มีข้อมูล**

---

### 🎯 **7. Queue Management Tables** (4 tables)

#### `queue_entries` (20 columns, 0 rows) ✅
#### `queue_notifications` (9 columns, 0 rows) ✅
#### `queue_settings` (13 columns, 0 rows) ✅
#### `queue_statistics` (12 columns, 0 rows) ✅

---

### 📦 **8. Inventory System Tables** (8 tables)

#### `inventory_items` (18 columns, 0 rows) ✅
#### `inventory_categories` (5 columns, 5 rows) ✅ **มีข้อมูล**
#### `inventory_stock_movements` (11 columns, 0 rows) ✅
#### `inventory_stock_alerts` (8 columns, 0 rows) ✅
#### `inventory_purchase_orders` (14 columns, 0 rows) ✅
#### `inventory_purchase_order_items` (8 columns, 0 rows) ✅
#### `inventory_suppliers` (9 columns, 0 rows) ✅
#### `branch_inventory` (9 columns, 0 rows) ✅
#### `branch_transfers` (12 columns, 0 rows) ✅
#### `branch_transfer_items` (8 columns, 0 rows) ✅

---

### 🎁 **9. Loyalty & Rewards Tables** (6 tables)

#### `loyalty_tiers` (10 columns, 4 rows) ✅ **มีข้อมูล**
#### `loyalty_rewards` (13 columns, 0 rows) ✅
#### `loyalty_reward_redemptions` (9 columns, 0 rows) ✅
#### `customer_loyalty_status` (11 columns, 0 rows) ✅
#### `points_earning_rules` (11 columns, 4 rows) ✅ **มีข้อมูล**
#### `points_transactions` (11 columns, 0 rows) ✅

---

### 📢 **10. Marketing Tables** (5 tables)

#### `marketing_campaigns` (14 columns, 0 rows) ✅
#### `campaign_customers` (10 columns, 0 rows) ✅
#### `campaign_performance` (9 columns, 0 rows) ✅
#### `promo_codes` (16 columns, 0 rows) ✅
#### `promo_code_usage` (9 columns, 0 rows) ✅

---

### 👥 **11. Customer Management Tables** (4 tables)

#### `customers` (24 columns, 0 rows) ✅
#### `customer_segments` (8 columns, 0 rows) ✅
#### `customer_notes` (18 columns, 0 rows) ✅

---

### 💼 **12. Sales Management Tables** (3 tables)

#### `sales_leads` (24 columns, 5 rows) ✅ **มีข้อมูล**
#### `sales_proposals` (26 columns, 5 rows) ✅ **มีข้อมูล**
#### `sales_activities` (14 columns, 0 rows) ✅

---

### 🏥 **13. Treatment Tables** (8 tables)

#### `treatments` (42 columns, 0 rows) ✅
#### `treatment_records` (14 columns, 0 rows) ✅
#### `treatment_recommendations` (16 columns, 0 rows) ✅
#### `treatment_packages` (12 columns, 0 rows) ✅
#### `treatment_photos` (9 columns, 0 rows) ✅
#### `treatment_progress_notes` (8 columns, 0 rows) ✅
#### `treatment_outcomes` (12 columns, 0 rows) ✅
#### `treatment_comparisons` (9 columns, 0 rows) ✅

---

### 📊 **14. Analytics & Reporting Tables** (4 tables)

#### `performance_metrics` (12 columns, 144 rows) ✅ **มีข้อมูล**
#### `generated_reports` (10 columns, 0 rows) ✅
#### `report_schedules` (9 columns, 0 rows) ✅
#### `presentation_sessions` (13 columns, 1 rows) ✅

---

### 🐛 **15. System Tables** (2 tables)

#### `error_logs` (13 columns, 2 rows) ✅ **มีข้อมูล**

#### `invitations` (12 columns, 4 rows) ✅ **มีข้อมูล - NEW**
- **Purpose:** ระบบเชิญผู้ใช้เข้าคลินิก
- **Key Columns:**
  - `id` (UUID, PK)
  - `clinic_id` (UUID, FK → clinics)
  - `invited_email` (TEXT)
  - `invited_role` (TEXT: 'staff', 'receptionist', 'manager')
  - `invited_by` (UUID, FK → users)
  - `invitation_token` (TEXT, UNIQUE)
  - `status` (TEXT: 'pending', 'accepted', 'expired', 'cancelled')
  - `expires_at` (TIMESTAMP)
  - `accepted_at` (TIMESTAMP)
  - `created_at`, `updated_at` (TIMESTAMP)
- **Features:**
  - Token-based invitation system
  - Role-based access control
  - Expiration tracking (default 7 days)
  - Email notifications via Resend
- **RLS:** 6 policies (clinic admins manage, users view own)
- **API Routes:**
  - `POST /api/invitations/send`
  - `GET /api/invitations/[token]`
  - `POST /api/invitations/accept`
- **Migration:** `20250112_create_invitations.sql`
- **Status:** Production ready (4 active invitations)

---

## 🔐 Security Features

### Row Level Security (RLS)

**Recent Tables with RLS Policies:**
- ✅ invitations: 6 policies (clinic admins manage, users view own)
- ✅ action_plans: 4 policies (SELECT, INSERT, UPDATE, DELETE)
- ✅ action_items: 4 policies (inherited from plans)
- ✅ smart_goals: 4 policies (SELECT, INSERT, UPDATE, DELETE)
- ✅ goal_milestones: 4 policies (inherited from goals)
- ✅ goal_check_ins: 4 policies (inherited from goals)
- ✅ goal_photos: 4 policies (inherited from goals)

**หลักการ RLS:**
- Users can only access their own data
- Cascade permissions through foreign keys
- Service role bypasses RLS

---

## ⚡ Performance Optimization

### Indexes Created (Week 6)

**Action Plans:**
- `idx_action_plans_user_id`
- `idx_action_plans_analysis_id`
- `idx_action_plans_created_at`

**Action Items:**
- `idx_action_items_plan_id`
- `idx_action_items_status`
- `idx_action_items_priority`
- `idx_action_items_category`
- `idx_action_items_display_order`

**Smart Goals:**
- `idx_smart_goals_user_id`
- `idx_smart_goals_plan_id`
- `idx_smart_goals_status`
- `idx_smart_goals_type`
- `idx_smart_goals_end_date`

**Milestones:**
- `idx_goal_milestones_goal_id`
- `idx_goal_milestones_target_date`
- `idx_goal_milestones_completed`
- `idx_goal_milestones_display_order`

**Check-ins:**
- `idx_goal_check_ins_goal_id`
- `idx_goal_check_ins_date`

**Photos:**
- `idx_goal_photos_goal_id`
- `idx_goal_photos_photo_type`
- `idx_goal_photos_date`

---

## 🔧 Helper Functions

### Week 6 Functions

#### `calculate_action_plan_progress(plan_id UUID)`
- **Returns:** DECIMAL (0-100)
- **Purpose:** คำนวณ progress จากจำนวน actions ที่เสร็จ
- **Formula:** (completed_actions / total_actions) * 100

#### `calculate_goal_progress(goal_id UUID)`
- **Returns:** DECIMAL (0-100)
- **Purpose:** คำนวณ progress จาก baseline → current → target
- **Formula:** (current_change / total_change) * 100

#### `update_updated_at_column()`
- **Returns:** TRIGGER
- **Purpose:** Auto-update timestamps on UPDATE

---

## 🔄 Triggers

### Week 6 Triggers

1. `update_action_plans_updated_at`
   - ON: action_plans
   - WHEN: BEFORE UPDATE
   - ACTION: Set updated_at = NOW()

2. `update_action_items_updated_at`
   - ON: action_items
   - WHEN: BEFORE UPDATE
   - ACTION: Set updated_at = NOW()

3. `update_smart_goals_updated_at`
   - ON: smart_goals
   - WHEN: BEFORE UPDATE
   - ACTION: Set updated_at = NOW()

---

## 📜 Migration History

### Completed Migrations

1. **Core System** - Built-in Supabase
2. **Skin Analyses** - `20250109_create_skin_analyses.sql`
3. **Storage Buckets** - `20250109_create_storage_buckets.sql`
4. **Multi-Clinic System** - `20250107_multi_clinic_foundation.sql`
5. **Queue Management** - Multiple migrations
6. **Inventory System** - Multiple migrations
7. **Loyalty System** - Multiple migrations
8. **📌 Week 6: Action Plans & Smart Goals** - `20240121_action_plans_smart_goals.sql` ✅ **ล่าสุด**

---

## 🚀 วิธีติดตั้งฐานข้อมูลใหม่

### วิธีที่ 1: ใช้ Script (แนะนำ)

```bash
# รัน migration
node run-migration.js

# ตรวจสอบผล
node check-db-schema.js
```

### วิธีที่ 2: ใช้ Supabase Dashboard

1. ไปที่ https://app.supabase.com/project/bgejeqqngzvuokdffadu/sql
2. เปิดไฟล์ SQL จาก `supabase/migrations/`
3. Copy & Paste ลงใน SQL Editor
4. กด Run

### วิธีที่ 3: ใช้ psql CLI

```bash
psql "postgres://postgres.bgejeqqngzvuokdffadu:..." -f supabase/migrations/filename.sql
```

---

## 📞 API Reference

### Supabase Client Setup

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://bgejeqqngzvuokdffadu.supabase.co',
  'SUPABASE_ANON_KEY'
)
```

### Example Queries

```typescript
// Get user's action plans
const { data, error } = await supabase
  .from('action_plans')
  .select('*, action_items(*)')
  .eq('user_id', userId)

// Get user's goals with progress
const { data, error } = await supabase
  .from('smart_goals')
  .select('*, goal_milestones(*), goal_check_ins(*)')
  .eq('user_id', userId)
  .eq('status', 'active')
```

---

## 📊 Database Statistics

- **Total Tables:** 76
- **Tables with Data:** 11 tables
- **Total Rows:** ~200 rows
- **Week 6 Tables:** 6 tables (ready to use)
- **Indexes:** 60+ indexes
- **RLS Policies:** 40+ policies
- **Functions:** 10+ functions
- **Triggers:** 15+ triggers

---

## ✅ Database Health Checklist

- [x] All 76 tables created
- [x] Week 6 tables installed
- [x] RLS policies enabled
- [x] Indexes created
- [x] Functions deployed
- [x] Triggers configured
- [x] Foreign keys set up
- [x] Data consistency maintained

---

**Last Migration:** Week 6 - Action Plans & Smart Goals (2024-01-21)  
**Status:** ✅ Production Ready  
**Next Steps:** Testing & Data Population
