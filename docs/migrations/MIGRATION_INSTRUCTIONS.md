# 🚀 Migration Instructions - Phase 1 Quality Metrics

## วิธีรัน Migration (เลือก 1 วิธี)

### ✅ วิธีที่ 1: ใช้ Supabase Dashboard (แนะนำ)

1. เปิด Supabase Dashboard: https://supabase.com/dashboard/project/bgejeqqngzvuokdffadu
2. ไปที่ **SQL Editor** (เมนูซ้าย)
3. คลิก **New Query**
4. Copy-paste คำสั่ง SQL ด้านล่าง:

\`\`\`sql
-- Phase 1 Enhancement: Add image quality metrics columns
ALTER TABLE public.skin_analyses
ADD COLUMN IF NOT EXISTS quality_lighting NUMERIC(5,2) CHECK (quality_lighting >= 0 AND quality_lighting <= 100),
ADD COLUMN IF NOT EXISTS quality_blur NUMERIC(5,2) CHECK (quality_blur >= 0 AND quality_blur <= 100),
ADD COLUMN IF NOT EXISTS quality_face_size NUMERIC(4,3) CHECK (quality_face_size >= 0 AND quality_face_size <= 1),
ADD COLUMN IF NOT EXISTS quality_overall NUMERIC(5,2) CHECK (quality_overall >= 0 AND quality_overall <= 100);

-- Add index for querying by quality
CREATE INDEX IF NOT EXISTS idx_skin_analyses_quality_overall ON public.skin_analyses(quality_overall DESC);

-- Add comments for documentation
COMMENT ON COLUMN public.skin_analyses.quality_lighting IS 'Image lighting quality score (0-100), higher is better';
COMMENT ON COLUMN public.skin_analyses.quality_blur IS 'Image sharpness score (0-100), higher is sharper';
COMMENT ON COLUMN public.skin_analyses.quality_face_size IS 'Face coverage ratio (0-1), optimal 0.15-0.45';
COMMENT ON COLUMN public.skin_analyses.quality_overall IS 'Composite quality score (0-100), >= 70 is excellent';
\`\`\`

5. คลิก **Run** (Ctrl+Enter)
6. ตรวจสอบว่ามีข้อความ "Success. No rows returned" หรือ "Success"

---

### 🔧 วิธีที่ 2: ใช้ Supabase CLI (ถ้า Dashboard ไม่ทำงาน)

**ปัญหา:** Migration files เก่ามี syntax errors ทำให้ `supabase db push --include-all` fail

**วิธีแก้:** ใช้ Custom SQL Command

\`\`\`powershell
# ติดตั้ง psql (ถ้ายังไม่มี)
winget install PostgreSQL.PostgreSQL

# รัน migration
psql "postgresql://postgres.bgejeqqngzvuokdffadu:[YOUR_PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres" -f "supabase/migrations/20250102_add_quality_metrics.sql"
\`\`\`

**หา Database Password:**
1. Supabase Dashboard → Settings → Database
2. คัดลอก Password (หรือ reset ใหม่)

---

## ✅ ตรวจสอบว่า Migration สำเร็จ

รันคำสั่งนี้ใน SQL Editor:

\`\`\`sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'skin_analyses' 
  AND column_name LIKE 'quality_%'
ORDER BY column_name;
\`\`\`

**ผลลัพธ์ที่คาดหวัง:**
\`\`\`
quality_blur         | numeric(5,2)
quality_face_size    | numeric(4,3)
quality_lighting     | numeric(5,2)
quality_overall      | numeric(5,2)
\`\`\`

---

## 🧪 ทดสอบหลัง Migration

1. ไปที่แอป: http://localhost:3000/analysis
2. อัปโหลดภาพ
3. ตรวจสอบ Console Logs ว่ามี "📊 Image Quality Metrics"
4. ตรวจสอบ Database:

\`\`\`sql
SELECT id, quality_lighting, quality_blur, quality_face_size, quality_overall
FROM skin_analyses
ORDER BY created_at DESC
LIMIT 5;
\`\`\`

---

## 📊 Phase 1 Complete Checklist

- [x] Task 1: Camera positioning guide
- [x] Task 2: MediaPipe face detection
- [x] Task 3: Image quality validator
- [x] Task 4: Quality metrics logging
- [ ] **Task 5: Run migration** ← คุณอยู่ที่นี่
- [ ] Task 6: Test 20 images for +8-13% accuracy improvement
