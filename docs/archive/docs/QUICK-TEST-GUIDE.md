# 🧪 Quick Testing Guide - AI Service Integration

## เริ่มต้นใช้งานภายใน 2 นาที

### ✅ Prerequisites Check

ทั้งสองบริการต้องรันอยู่:

```bash
# Terminal 1 - AI Service
cd ai-service
python main.py
# ✅ Should see: "Application startup complete" on port 8000

# Terminal 2 - Next.js
npm run dev
# ✅ Should see: "Ready in X seconds" on port 3000
```

---

## 🎯 Test Scenario 1: Mock Data (Default)

**Steps:**
1. เปิด http://localhost:3000/th/analysis-multi-mode
2. ⬜ ปล่อย checkbox "Use Real AI Analysis" ไว้แบบไม่ check
3. กด "Choose Image" → เลือกรูปใบหน้า
4. ✅ ดูผล: MultiModeViewer แสดง mock data (47 spots, 23 wrinkles, 89 pores)

**Expected Result:**
- Image preview แสดงทันที
- Statistics cards แสดงเลขจาก MOCK_DETECTION_DATA
- ไม่มีการเรียก API
- ไม่มี loading spinner

---

## 🚀 Test Scenario 2: Real AI Analysis

**Steps:**
1. เปิด http://localhost:3000/th/analysis-multi-mode
2. ✅ **Check** checkbox "Use Real AI Analysis (Python FastAPI)"
3. กด "Choose Image" → เลือกรูปใบหน้า (JPG, PNG)
4. 🔄 เห็น loading: "🔬 AI is analyzing your image..."
5. ⏳ รอ 2-5 วินาที
6. ✅ ดูผล: MultiModeViewer อัพเดทด้วยข้อมูลจริงจาก AI

**Expected Result:**
- Image preview แสดงทันที
- Loading spinner ปรากฏ + message "Analyzing..."
- Statistics cards อัพเดทด้วยตัวเลขจาก API response
- Detection data อัพเดทใน MultiModeViewer
- Console.log แสดง detailed results

**Console Output Example:**
```
✅ Analysis complete: {
  spots: 42,
  wrinkles: 18,
  pores: 76,
  texture: 0.73,
  overall_score: 0.78,
  processing_time: "456ms"
}
```

---

## ⚠️ Test Scenario 3: Error Handling

**Test A: Service Not Running**

1. Stop AI service (Ctrl+C ใน Terminal 1)
2. ✅ Check "Use Real AI Analysis"
3. Upload image

**Expected:**
- Red alert box: "Failed to fetch - AI service may be down"
- No crash
- Mock data ยังแสดงอยู่

**Test B: Invalid Image**

1. Upload non-image file (e.g., .txt, .pdf)
2. ✅ Check "Use Real AI Analysis"

**Expected:**
- Red alert box with error message
- No crash

---

## 🔍 Verification Checklist

### Frontend (Next.js)
- [ ] Toggle checkbox ทำงาน (เปลี่ยน state ได้)
- [ ] File input เปิดได้ + preview รูปใหม่
- [ ] Loading spinner แสดงขณะ analyzing
- [ ] Error alert แสดงเมื่อมีปัญหา
- [ ] Statistics cards อัพเดทหลัง analysis
- [ ] MultiModeViewer แสดง detections

### Backend (Python API)
- [ ] Service รันได้โดยไม่ crash
- [ ] Health endpoint ตอบกลับ: http://localhost:8000/health
- [ ] Swagger UI เปิดได้: http://localhost:8000/docs
- [ ] Console แสดง "INFO: POST /analyze/multi-mode"
- [ ] Response time < 5 วินาที

### Integration
- [ ] File upload → API call → Response → UI update (ไม่มี error)
- [ ] Network tab (F12) แสดง POST request to `http://localhost:8000/analyze/multi-mode`
- [ ] Response status: 200 OK
- [ ] Response body มี JSON structure ที่ถูกต้อง
- [ ] Console.log แสดง detailed results

---

## 🐛 Common Issues

### 1. "Failed to fetch"
**Cause:** AI service ไม่ได้รัน  
**Fix:**
```bash
cd ai-service
python main.py
```

### 2. CORS Error
**Symptom:** Console แสดง "blocked by CORS policy"  
**Fix:** ตรวจสอบ `ALLOWED_ORIGINS` ใน `ai-service/.env`
```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

### 3. Port Already in Use
**Symptom:** "Address already in use"  
**Fix:**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### 4. Upload Button Disabled
**Cause:** กำลัง analyzing อยู่  
**Fix:** รอให้ analysis เสร็จก่อน หรือ refresh page

---

## 📊 Test Data Suggestions

**Good Test Images:**
- Face photos (JPG, PNG)
- Size: 500KB - 2MB
- Resolution: 640x480 - 1920x1080
- Clear, front-facing
- Good lighting

**Bad Test Images (for error testing):**
- Very large files (> 10MB)
- Non-image files (.txt, .pdf)
- Corrupted images
- Non-face images (landscape, objects)

---

## 📸 Quick Test with Sample Image

ใช้ภาพตัวอย่างที่มีอยู่แล้ว:

```
public/test-face.jpg  → Default image in UI
```

หรือ download test image:
```bash
# Windows PowerShell
Invoke-WebRequest -Uri "https://i.pravatar.cc/500" -OutFile "test-face.jpg"
```

---

## ✅ Success Criteria

**Phase 1 Integration Complete When:**

1. ✅ Toggle switch เปลี่ยน mode ได้ (mock vs. real)
2. ✅ Upload image → API call → Response ใน < 5 วินาที
3. ✅ UI แสดง loading state ขณะ processing
4. ✅ Error handling ทำงาน (alert แสดงเมื่อมีปัญหา)
5. ✅ Results อัพเดท UI (statistics + detections)
6. ✅ Console แสดง detailed logs
7. ✅ No crashes, no console errors (ยกเว้น expected errors)

---

## 🎯 Next: Advanced Testing

เมื่อ basic integration ทำงานได้แล้ว ทดสอบเพิ่มเติม:

**Performance Testing:**
- [ ] Upload 10 images ติดกัน → Check response time
- [ ] Large image (5MB) → Should handle gracefully
- [ ] Concurrent requests → No queue overflow

**UI/UX Testing:**
- [ ] Toggle ON/OFF หลาย ๆ ครั้ง → State consistent
- [ ] Upload → Cancel → Upload again → Works
- [ ] Multiple mode switches → No memory leaks

**Edge Cases:**
- [ ] Empty file
- [ ] 1x1 pixel image
- [ ] Black image (all black pixels)
- [ ] Non-human face (animal, object)

---

## 📞 Need Help?

**Check These First:**
1. Both services running? (port 8000 + 3000)
2. `.env.local` มี `NEXT_PUBLIC_AI_SERVICE_URL`?
3. Console errors? (F12 → Console tab)
4. Network requests? (F12 → Network tab)
5. AI service logs? (check Terminal 1)

**Swagger UI Testing:**
- http://localhost:8000/docs
- Try `/analyze/multi-mode` endpoint directly
- Upload test image via Swagger UI

---

## 🎉 Summary

ถ้าทุกอย่างทำงาน:
- ✅ **Frontend:** Toggle, upload, loading, error, results
- ✅ **Backend:** API responding, models loaded
- ✅ **Integration:** Request → Response → UI update

**คุณพร้อมสำหรับ Production Deployment!** 🚀

Next steps:
1. Train real ML models (replace mock)
2. Implement 4 missing modes
3. Deploy to cloud
4. Add monitoring
