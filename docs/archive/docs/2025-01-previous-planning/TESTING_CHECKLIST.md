# 🎯 Testing Checklist - AI367 Platform

## ✅ Pre-deployment Testing

**Date**: October 29, 2025  
**Version**: 2.0  
**Status**: Ready for Testing

---

## 🧪 Phase 2 Features Testing

### ✅ Feature 1: Loading States & Skeleton Loaders
**Test Steps**:
1. [ ] เปิด `/sales/dashboard`
2. [ ] Refresh (Ctrl+R) หรือ Hard Refresh (Ctrl+Shift+R)
3. [ ] สังเกต skeleton loaders แสดงก่อนข้อมูลโหลด

**Expected Results**:
- ✅ เห็น skeleton animations สำหรับ metrics cards
- ✅ เห็น skeleton animations สำหรับ lead cards
- ✅ ไม่มีหน้าจอว่างเปล่าหรือกระพริบ
- ✅ Animation ลื่นไหล (animate-pulse)

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### ✅ Feature 2: Optimistic UI Updates (Chat)
**Test Steps**:
1. [ ] คลิกปุ่ม "💬 Chat" ที่ lead card ใดก็ได้
2. [ ] พิมพ์ข้อความในช่อง chat: "สวัสดีครับ"
3. [ ] กดปุ่ม Send
4. [ ] สังเกตข้อความแสดงทันที (opacity 70%)

**Expected Results**:
- ✅ ข้อความปรากฏในหน้าจอทันที
- ✅ ข้อความมี opacity 70% (สีจาง) ขณะรอ API
- ✅ หลัง API success → opacity กลับเป็น 100%
- ✅ ถ้า API fail → ข้อความหายไป + แสดง error toast

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### ✅ Feature 3: Debounced Search
**Test Steps**:
1. [ ] ที่ Sales Dashboard, หา search box ด้านบน
2. [ ] พิมพ์ชื่อ lead เช่น "สมชาย" หรือ "Sarah"
3. [ ] สังเกตข้อความ "Searching..." แสดงขณะพิมพ์
4. [ ] หยุดพิมพ์ 500ms
5. [ ] ดูผลลัพธ์แสดง "X found"

**Expected Results**:
- ✅ แสดง "Searching..." ขณะพิมพ์
- ✅ หยุดพิมพ์ 500ms → แสดงผลลัพธ์
- ✅ ไม่มีการกระตุกหรือ lag
- ✅ Result count ถูกต้อง (เช่น "3 found")
- ✅ ผลลัพธ์ตรงกับคำค้นหา

**Test Cases**:
- [ ] ค้นหาด้วยชื่อ: "Sarah" → ควรเจอ Sarah Wilson
- [ ] ค้นหาด้วย concern: "acne" → ควรเจอคนที่มี acne concern
- [ ] ค้นหาด้วยเบอร์: "081" → ควรเจอคนที่มี 081 ในเบอร์
- [ ] ค้นหาไม่เจอ: "zzz" → แสดง "0 found" + empty state

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### ✅ Feature 4: Debounced Search - Priority Filter
**Test Steps**:
1. [ ] คลิกที่ Priority Filter dropdown
2. [ ] เลือก "🔴 Critical"
3. [ ] ดูว่าแสดงแค่ Critical leads
4. [ ] เลือก "All Priorities"
5. [ ] ดูว่ากลับมาแสดงทุก lead

**Expected Results**:
- ✅ Filter ทำงานถูกต้อง
- ✅ Result count อัพเดทตามที่กรอง
- ✅ Combine ได้กับ search (เช่น search "Sarah" + filter "High")

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### ✅ Feature 5: Infinite Scroll
**Test Steps**:
1. [ ] ที่ Sales Dashboard, scroll ลงมาดู lead list
2. [ ] Scroll ลงไปจนถึงใกล้ล่างสุด
3. [ ] สังเกตการโหลดเพิ่มอัตโนมัติ
4. [ ] ดู loading spinner "กำลังโหลดเพิ่มเติม..."
5. [ ] Scroll จนหมด leads

**Expected Results**:
- ✅ เริ่มต้นแสดง 5 leads
- ✅ Scroll ใกล้ล่าง → โหลดเพิ่ม 5 leads อัตโนมัติ
- ✅ Loading spinner แสดงขณะโหลด
- ✅ ไม่มีการกระตุกหรือ jump
- ✅ เมื่อ scroll จนหมด → แสดง "แสดงครบทั้งหมด X รายการแล้ว"

**Edge Cases**:
- [ ] Search แล้ว scroll → Reset to 5 items
- [ ] Filter แล้ว scroll → Reset to 5 items
- [ ] Clear search → กลับไปแสดง 5 items แรก

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

## 🧪 Phase 3 Features Testing

### ✅ Feature 6: Toast Notifications (Error Handling)
**Test Steps**:
1. [ ] คลิกปุ่ม "📞 Call" ที่ lead card
2. [ ] สังเกต toast notification มุมขวาล่าง
3. [ ] คลิกปุ่ม "📧 Email"
4. [ ] คลิกปุ่ม "🎥 AR Demo"

**Expected Results**:
- ✅ ไม่มี `alert()` popups
- ✅ Toast notifications แสดงที่มุมขวาล่าง
- ✅ Toast มีไอคอน (📞, 📧, 🎥) ที่เหมาะสม
- ✅ ข้อความเป็นภาษาไทย
- ✅ Toast หายไปเองหลัง 3-5 วินาที
- ✅ สามารถปิดด้วยการคลิก X ได้

**Toast Messages to Check**:
- [ ] Call: "📞 กำลังโทรหา [ชื่อ]..."
- [ ] Email: "📧 เปิดแม่แบบอีเมลสำหรับ [ชื่อ]"
- [ ] AR Demo: "🎥 ส่งลิงก์ AR Demo ให้ [ชื่อ] แล้ว!"

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### ✅ Feature 7: Error Handling - Null Checks
**Test Steps**:
1. [ ] ลอง trigger action กับ lead ที่ไม่มีข้อมูล (edge case)
2. [ ] สังเกต error toast: "ไม่พบข้อมูล Lead"

**Expected Results**:
- ✅ ไม่ crash
- ✅ แสดง error toast เป็นภาษาไทย
- ✅ User สามารถใช้งานต่อได้

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

## 🧪 Phase 1 Core Features Testing

### ✅ Feature 8: AI Lead Scoring
**Test Steps**:
1. [ ] ดู lead cards ที่ dashboard
2. [ ] สังเกต priority badges (🔴 Critical, 🟠 High, 🟡 Medium)
3. [ ] คลิกที่ priority badge
4. [ ] ดู PriorityScoreCard modal เปิดขึ้น

**Expected Results**:
- ✅ Lead cards เรียงตาม priority (Critical อยู่บนสุด)
- ✅ Priority badges แสดงถูกต้อง
- ✅ คลิก badge → เปิด score detail modal
- ✅ Score breakdown แสดงครบ (budget, urgency, engagement, concerns)
- ✅ Total score ถูกต้อง (0-100)

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### ✅ Feature 9: Real-time Chat
**Test Steps**:
1. [ ] เปิด chat drawer (คลิก 💬 Chat)
2. [ ] ส่งข้อความ
3. [ ] ใช้ quick reply
4. [ ] ใช้ voice input (ถ้ามี microphone)

**Expected Results**:
- ✅ Chat drawer เปิด/ปิดได้ smooth
- ✅ ส่งข้อความสำเร็จ
- ✅ Quick replies ทำงาน
- ✅ Voice input ทำงาน (ถ้าเปิดใช้)
- ✅ Message history แสดงถูกต้อง

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### ✅ Feature 10: Quick Proposal
**Test Steps**:
1. [ ] คลิกปุ่ม "⚡ Quick Proposal" ที่ lead card
2. [ ] ดู modal เปิดขึ้น
3. [ ] เลือก treatments
4. [ ] Generate proposal

**Expected Results**:
- ✅ Modal เปิดถูกต้อง
- ✅ Treatment selection ทำงาน
- ✅ AI proposal generation ทำงาน
- ✅ Proposal summary แสดงครบถ้วน

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

## 🧪 UI/UX Testing

### ✅ Responsive Design
**Test Breakpoints**:
- [ ] Mobile (375px) - iPhone SE
- [ ] Tablet (768px) - iPad
- [ ] Desktop (1024px+)

**Expected Results**:
- ✅ Layout responsive ทุกขนาดหน้าจอ
- ✅ Floating bottom nav แสดงบน mobile
- ✅ Search/filter stack บน mobile
- ✅ Lead cards เรียงเป็น column บน mobile
- ✅ ไม่มี horizontal scroll

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### ✅ Dark Mode
**Test Steps**:
1. [ ] คลิกปุ่ม theme toggle (ถ้ามี)
2. [ ] สังเกต dark mode เปิด/ปิด
3. [ ] ตรวจสอบ colors และ contrast

**Expected Results**:
- ✅ Dark mode toggle ทำงาน
- ✅ Colors เหมาะสมในทุก mode
- ✅ Text readable ในทุก mode
- ✅ Theme persistent (reload ยังคงเป็น dark/light)

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

## 🧪 Performance Testing

### ✅ Page Load Time
**Test Steps**:
1. [ ] เปิด Chrome DevTools (F12)
2. [ ] Network tab → Hard Reload (Ctrl+Shift+R)
3. [ ] สังเกต DOMContentLoaded และ Load time

**Expected Results**:
- ✅ DOMContentLoaded < 2 seconds
- ✅ Full page load < 4 seconds
- ✅ Time to Interactive < 3 seconds

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### ✅ Search Performance
**Test Steps**:
1. [ ] พิมพ์ในช่อง search
2. [ ] สังเกต debounce delay (~500ms)
3. [ ] ดูว่า UI responsive ไม่ lag

**Expected Results**:
- ✅ ไม่มี input lag
- ✅ Debounce ทำงาน (~500ms)
- ✅ Results แสดงเร็ว (< 200ms)

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

## 🧪 Browser Compatibility

**Browsers to Test**:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Expected Results**:
- ✅ ทำงานถูกต้องในทุก browser
- ✅ Styles เหมือนกันทุก browser
- ✅ No console errors

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

## 🧪 PWA Features (Optional)

### ✅ Service Worker
**Test Steps**:
1. [ ] เปิด DevTools → Application → Service Workers
2. [ ] สังเกต service worker registered
3. [ ] ลอง offline mode

**Expected Results**:
- ✅ Service worker registered successfully
- ✅ Offline indicator แสดงเมื่อ offline
- ✅ Cached pages accessible offline

**Status**: ⬜ Not Tested | ✅ Passed | ❌ Failed

---

## 📊 Testing Summary

### Overall Test Results
- Total Features: 10
- Features Tested: ___/10
- Features Passed: ___/10
- Features Failed: ___/10
- Pass Rate: ___%

### Critical Issues Found
1. 
2. 
3. 

### Minor Issues Found
1. 
2. 
3. 

### Recommendations
1. 
2. 
3. 

---

## ✅ Sign-off

**Tested By**: _____________  
**Date**: _____________  
**Status**: ⬜ Ready for Deployment | ⬜ Needs Fixes  

**Notes**:
___________________________________________
___________________________________________
___________________________________________
