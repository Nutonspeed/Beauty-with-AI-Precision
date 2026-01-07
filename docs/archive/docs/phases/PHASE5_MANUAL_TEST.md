# Phase 5 Manual Testing Checklist

## 🎯 เป้าหมาย
ทดสอบว่า Progress Tracking ทำงานได้ครบทุก feature ภายใน **15 นาทีี**

---

## ✅ Pre-Test Setup (2 นาที)

### 1. เปิด Dev Server
\`\`\`bash
npx next dev --turbopack
\`\`\`
**Expected:** Server รันที่ http://localhost:3000

### 2. เปิด Browser Tools
- เปิด Chrome DevTools (F12)
- เช็ค Console Tab (ดู errors)
- เปิด Network Tab (ดู API calls)

---

## 📋 Test Cases (10-12 นาที)

### Test 1: เข้าหน้า Progress ✅
**Steps:**
1. ไปที่ http://localhost:3000/progress
2. สังเกต UI โหลด

**Expected:**
- ✅ หน้าโหลดได้ไม่ error
- ✅ เห็น "Treatment Progress Tracking"
- ✅ มีปุ่ม "Upload Baseline Photo"
- ✅ Console ไม่มี error สีแดง

**ถ้า Failed:** เช็ค Console errors → แก้ตรงนั้น

---

### Test 2: Upload Baseline Photo ✅
**Steps:**
1. คลิก "Upload Baseline Photo"
2. เลือกรูปภาพหน้าตัวเอง (จาก Phase 1-2 ที่เคยใช้)
3. รอ upload

**Expected:**
- ✅ เห็น loading indicator
- ✅ Network tab เห็น `POST /api/progress/photos` → **201 Created**
- ✅ รูปปรากฏใน UI
- ✅ เห็น metadata (วันที่, คุณภาพภาพ)

**ถ้า Failed:** 
- เช็ค Network tab → response error message
- เช็ค Supabase Storage → bucket มีรูปหรือเปล่า

---

### Test 3: Upload Progress Photo ✅
**Steps:**
1. คลิก "Upload Progress Photo"
2. เลือกรูปภาพอีกรูป (ควรเป็นคนเดียวกัน แต่วันอื่น)
3. รอ upload

**Expected:**
- ✅ `POST /api/progress/photos` → **201 Created**
- ✅ เห็นรูปที่ 2 ใน timeline
- ✅ มีปุ่ม "Compare Photos" ปรากฏ

---

### Test 4: Photo Comparison (Before/After Slider) ✅
**Steps:**
1. คลิก "Compare Photos"
2. เลื่อน slider ซ้าย-ขวา

**Expected:**
- ✅ เห็นรูป Before/After แบบ split view
- ✅ Slider ทำงาน (เลื่อนได้ smooth)
- ✅ เห็น metrics comparison:
  - Improvement %
  - ฝ้า-กระ, รูขุมขน, ริ้วรอย
  - Timeline (X วัน, X สัปดาห์, X เดือน)

**ถ้าไม่เห็น metrics:** อาจเป็นเพราะรูปไม่มี `analysis_results` → ใช้ mock data ก็ได้

---

### Test 5: Treatment Timeline ✅
**Steps:**
1. Scroll ลงไปดู Timeline section
2. สังเกต visualization

**Expected:**
- ✅ เห็น timeline chart (vertical/horizontal)
- ✅ มี dots/markers บอก photo upload dates
- ✅ มีข้อความ "Baseline", "Progress #1", etc.

---

### Test 6: Generate PDF Report ✅
**Steps:**
1. คลิก "Generate PDF Report"
2. รอ processing (2-5 วินาที)

**Expected:**
- ✅ Loading indicator แสดง
- ✅ PDF download ทันที (ชื่อไฟล์: `progress-report-YYYY-MM-DD.pdf`)
- ✅ เปิด PDF ดู:
  - หน้าแรก: ชื่อผู้ป่วย, วันที่
  - Before/After photos
  - Metrics table (% improvement)
  - Timeline
  - Thai font แสดงผลถูกต้อง

**ถ้า PDF ไม่โหลด:** เช็ค Console → jsPDF errors

---

### Test 7: Error Handling ⚠️
**Steps:**
1. ลอง upload ไฟล์ที่ไม่ใช่รูป (.txt, .pdf)
2. ลอง compare โดยยังไม่มีรูปที่ 2

**Expected:**
- ✅ เห็น error message ชัดเจน (ไม่ crash)
- ✅ Console log error แต่ UI ยังใช้ได้

---

## 🔍 Post-Test Verification (3 นาที)

### Database Check (Supabase)
1. ไปที่ https://supabase.com/dashboard
2. Table Editor → `progress_photos`
3. **Expected:** เห็น 2 rows (baseline + progress)

### Storage Check
1. Storage → `progress-photos` bucket
2. **Expected:** เห็น 2 ไฟล์รูป

### Console Logs
1. เช็ค Console สีแดง
2. **Expected:** ไม่มี critical errors (warnings ok)

---

## ✅ Pass Criteria

**Phase 5 ผ่าน** ถ้า:
- ✅ Upload photos ได้ทั้ง 2 รูป
- ✅ Comparison slider ทำงาน
- ✅ PDF download ได้
- ✅ ไม่มี errors ที่ทำให้ระบบ crash

**ถ้า fail บางข้อ:** จด issues → แก้ทีละข้อ → test ใหม่

---

## 🐛 Common Issues & Quick Fixes

### Issue 1: "Cannot upload photo"
**Fix:**
\`\`\`bash
# เช็ค Storage bucket RLS policies
# ไปที่ Supabase → Storage → progress-photos → Policies
# ควรมี 3 policies: read, upload, delete
\`\`\`

### Issue 2: "Comparison shows 0% improvement"
**Fix:**
\`\`\`typescript
// Mock data ถ้ารูปยังไม่มี analysis_results
const mockAnalysis = {
  spots: 100,
  pores: 80,
  wrinkles: 60,
  texture_score: 70,
  redness: 50,
  overall_score: 75
};
\`\`\`

### Issue 3: "PDF Thai text แสดงผล ?????"
**Fix:**
\`\`\`typescript
// jsPDF ไม่ support Thai ตั้งต้น
// ใช้ภาษาอังกฤษก่อน หรือ
// เพิ่ม Thai font: https://github.com/parallax/jsPDF#use-of-unicode-characters--utf-8
\`\`\`

---

## 📊 Test Results Template

\`\`\`
Date: _____________
Tester: ___________

[ ] Test 1: Page loads ✅/❌
[ ] Test 2: Baseline upload ✅/❌
[ ] Test 3: Progress upload ✅/❌
[ ] Test 4: Comparison slider ✅/❌
[ ] Test 5: Timeline ✅/❌
[ ] Test 6: PDF generation ✅/❌
[ ] Test 7: Error handling ✅/❌

Overall: PASS / FAIL / PARTIAL

Notes:
_________________________________
_________________________________
\`\`\`

---

## 🚀 Next Steps After Testing

**ถ้า PASS:**
1. ✅ Mark Phase 5 as tested
2. Move to Phase 6 planning
3. (Optional) เพิ่ม unit tests สำหรับ calculator

**ถ้า FAIL:**
1. จด issues ที่เจอ
2. แก้ทีละข้อ (priority สูงก่อน)
3. Test ใหม่
4. Commit fixes

---

**เวลารวม:** 15-20 นาที  
**ROI:** High (เห็นปัญหาจริง + ได้ลอง UX)
