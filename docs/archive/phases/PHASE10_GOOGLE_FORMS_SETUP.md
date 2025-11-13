# 📝 Google Forms Setup Guide - Beta Testing Application

**Form URL เมื่อสร้างเสร็จ:** จะได้ URL แบบ `https://forms.gle/XXXXX`

---

## วิธีสร้าง Google Form

1. ไป [forms.google.com](https://forms.google.com)
2. คลิก "+ Blank" (สร้างฟอร์มใหม่)
3. ตั้งชื่อ: **"AI367 Beta Testing Application"**
4. คลิก Settings (⚙️) → ตั้งค่าตามด้านล่าง
5. Copy-paste คำถามจากด้านล่าง

---

## Form Settings (⚙️ Settings)

### General
- [x] Collect email addresses
- [x] Limit to 1 response
- [ ] Allow response editing (ไม่เปิด - ป้องกันแก้ไข)
- [x] Send respondent a copy of responses

### Presentation
- [x] Show progress bar
- Confirmation message: (ดูด้านล่าง)

### Quizzes
- [ ] Make this a quiz (ไม่เปิด)

---

## Confirmation Message

\`\`\`
🎉 ขอบคุณที่สมัครเข้าร่วม AI367 Beta Testing!

📧 เราได้รับใบสมัครของคุณเรียบร้อยแล้ว

📅 กำหนดการ:
- 5 พฤศจิกายน 2025: ประกาศผล
- 5-10 พฤศจิกายน: ทดสอบระบบ (6 วัน)

📬 ติดตามข่าวสารได้ที่:
- Email: beta@ai367bar.com
- Discord: discord.gg/ai367bar
- Line: @ai367bar

หมายเหตุ: เราจะพิจารณาจากคุณสมบัติและความพร้อม ไม่ใช่ first-come-first-served

ขอบคุณอีกครั้ง!
AI367 Team
\`\`\`

---

## คำถาม (Copy-Paste ทีละข้อ)

### Section 1: ข้อมูลพื้นฐาน

**Question 1:** ชื่อ-นามสกุล
- Type: Short answer
- Required: ✅ Yes

**Question 2:** Email
- Type: Short answer
- Required: ✅ Yes
- Validation: Text → Email address

**Question 3:** เบอร์โทรศัพท์
- Type: Short answer
- Required: ✅ Yes
- Description: "เช่น 081-234-5678"

**Question 4:** อายุ
- Type: Short answer
- Required: ✅ Yes
- Validation: Number → Greater than or equal to → 18

**Question 5:** อาชีพ
- Type: Short answer
- Required: ✅ Yes
- Description: "เช่น เจ้าของคลินิก, Beautician, พนักงานออฟฟิศ"

---

### Section 2: ประเภทผู้สมัคร

**Question 6:** คุณต้องการสมัครในฐานะ?
- Type: Multiple choice
- Required: ✅ Yes
- Options:
  - Clinic Owner (เจ้าของคลินิกความงาม)
  - Beauty Professional (Dermatologist/Beautician/Esthetician)
  - End Customer (ผู้ใช้ทั่วไป สนใจ skincare)

---

### Section 3A: คำถามสำหรับ Clinic Owners
**(แสดงเฉพาะเมื่อเลือก "Clinic Owner" ใน Question 6)**

**Question 7:** ชื่อคลินิก
- Type: Short answer
- Required: ✅ Yes (if Clinic Owner)
- Show based on: Question 6 → is "Clinic Owner"

**Question 8:** จำนวนลูกค้าต่อเดือน
- Type: Multiple choice
- Required: ✅ Yes (if Clinic Owner)
- Show based on: Question 6 → is "Clinic Owner"
- Options:
  - น้อยกว่า 50 คน
  - 50-100 คน
  - 100-500 คน
  - มากกว่า 500 คน

**Question 9:** ปัจจุบันใช้ระบบอะไรจัดการคลินิก?
- Type: Short answer
- Required: No
- Show based on: Question 6 → is "Clinic Owner"
- Description: "CRM, software, Excel, หรืออื่นๆ (ถ้าไม่มีพิมพ์ 'ไม่มี')"

**Question 10:** ทำไมคุณสนใจใช้ AI ในธุรกิจ?
- Type: Paragraph
- Required: ✅ Yes (if Clinic Owner)
- Show based on: Question 6 → is "Clinic Owner"
- Description: "บอกเล่าความต้องการหรือปัญหาที่อยากให้ AI ช่วยแก้"

---

### Section 3B: คำถามสำหรับ Beauty Professionals
**(แสดงเฉพาะเมื่อเลือก "Beauty Professional" ใน Question 6)**

**Question 11:** อาชีพของคุณ
- Type: Multiple choice
- Required: ✅ Yes (if Beauty Professional)
- Show based on: Question 6 → is "Beauty Professional"
- Options:
  - Dermatologist (แพทย์ผิวหนัง)
  - Beautician
  - Esthetician
  - อื่นๆ (ระบุ):

**Question 12:** ประสบการณ์ทำงาน
- Type: Multiple choice
- Required: ✅ Yes (if Beauty Professional)
- Show based on: Question 6 → is "Beauty Professional"
- Options:
  - น้อยกว่า 1 ปี
  - 1-2 ปี
  - 2-5 ปี
  - มากกว่า 5 ปี

**Question 13:** คุณเคยใช้ skin analyzer อะไรบ้าง?
- Type: Short answer
- Required: No
- Show based on: Question 6 → is "Beauty Professional"
- Description: "เช่น VISIA, Observ 520, หรืออื่นๆ (ถ้าไม่เคยพิมพ์ 'ไม่เคยใช้')"

**Question 14:** คุณประเมิน AI skin analysis อย่างไร?
- Type: Paragraph
- Required: ✅ Yes (if Beauty Professional)
- Show based on: Question 6 → is "Beauty Professional"
- Description: "คุณคิดว่า AI วิเคราะห์ผิวหน้าได้แม่นยำหรือไม่? มีข้อดี-ข้อเสียอะไร?"

---

### Section 3C: คำถามสำหรับ End Customers
**(แสดงเฉพาะเมื่อเลือก "End Customer" ใน Question 6)**

**Question 15:** คุณสนใจ skincare/beauty แค่ไหน?
- Type: Multiple choice
- Required: ✅ Yes (if End Customer)
- Show based on: Question 6 → is "End Customer"
- Options:
  - มาก (ใช้ผลิตภัณฑ์ทุกวัน, ติดตาม trends)
  - ปานกลาง (ใช้บ้าง ไม่ค่อยลงลึก)
  - น้อย (สนใจเพราะอยากลอง AI)

**Question 16:** คุณเคยใช้ beauty app อะไรบ้าง?
- Type: Short answer
- Required: No
- Show based on: Question 6 → is "End Customer"
- Description: "เช่น YouCam Makeup, Perfect365, SkinVision (ถ้าไม่เคยพิมพ์ 'ไม่เคยใช้')"

**Question 17:** อุปกรณ์ที่จะใช้ทดสอบ
- Type: Checkboxes
- Required: ✅ Yes (if End Customer)
- Show based on: Question 6 → is "End Customer"
- Options:
  - iPhone (iOS)
  - Android
  - Desktop/Laptop (Windows/Mac)
  - Tablet (iPad/Android)

---

### Section 4: ความพร้อม

**Question 18:** คุณมีเวลาทดสอบ 3-5 ชั่วโมง/สัปดาห์ไหม?
- Type: Multiple choice
- Required: ✅ Yes
- Options:
  - ใช่ มีเวลา
  - ไม่แน่ใจ
  - ไม่มีเวลา

**Question 19:** คุณพร้อมให้ feedback รายละเอียดไหม?
- Type: Multiple choice
- Required: ✅ Yes
- Description: "เช่น report bugs ละเอียด, แนะนำวิธีปรับปรุง"
- Options:
  - ใช่ พร้อม (report bugs, แนะนำปรับปรุง)
  - ไม่แน่ใจ
  - ไม่พร้อม (แค่ทดลองใช้)

**Question 20:** ช่องทางที่สะดวกติดต่อ
- Type: Checkboxes
- Required: ✅ Yes
- Options:
  - Discord (recommended - ตอบเร็วที่สุด)
  - Line
  - Email

---

### Section 5: Motivation & Commitment

**Question 21:** ทำไมคุณถึงอยากเข้าร่วม beta testing?
- Type: Paragraph
- Required: ✅ Yes
- Description: "บอกเล่าเหตุผลจริงๆ ที่สนใจ (ช่วยให้เราเข้าใจและคัดเลือกผู้สมัครที่เหมาะสม)"
- Placeholder text: 
\`\`\`
ตัวอย่างคำตอบที่ดี:
"ผมเป็นเจ้าของคลินิกเล็กๆ เคยใช้ skin analyzer แบบเครื่อง ราคาแพง (200,000 บาท) อยากลองแบบ AI ที่ถูกกว่าและสะดวกกว่า และอยากให้ feedback เพื่อปรับให้เหมาะกับธุรกิจจริงๆ ในไทย"

หรือ

"ผมเป็น beautician มี 5 ปีประสบการณ์ เคยใช้ VISIA มาก่อน อยากเปรียบเทียบว่า AI วิเคราะห์ได้แม่นยำแค่ไหน และพร้อมให้ feedback เพื่อปรับปรุงให้ดีขึ้น"
\`\`\`

**Question 22:** ฉันยืนยันว่าจะทดสอบจริงจังและให้ feedback รายละเอียด
- Type: Checkboxes
- Required: ✅ Yes
- Options:
  - ✅ ฉันยืนยัน (ต้อง check ถึงจะส่งได้)

---

## Response Spreadsheet Columns

เมื่อสร้างเสร็จ ใน Google Sheets จะมี columns:

| Column | Data |
|--------|------|
| Timestamp | วันเวลาที่ส่ง |
| Email | Email address |
| ชื่อ-นามสกุล | - |
| เบอร์โทรศัพท์ | - |
| อายุ | - |
| อาชีพ | - |
| ประเภทผู้สมัคร | Clinic Owner / Beauty Professional / End Customer |
| ... | (คำถามอื่นๆ ตามประเภท) |
| Motivation | ทำไมอยากเข้าร่วม |
| Commitment | Checkbox confirmation |

---

## Notification Setup

1. คลิก Responses tab
2. คลิก "..." (More) → "Get email notifications for new responses"
3. ตั้งค่าให้ส่งไปที่: `beta@ai367bar.com`

---

## URL Shortener

หลังสร้างเสร็จ:

1. คลิก "Send" (ส่ง)
2. Copy link
3. ไป [bitly.com](https://bitly.com) → สร้าง short link
4. Custom name: `ai367-beta-signup`
5. ได้ URL: `bit.ly/ai367-beta-signup`

---

## เสร็จแล้ว!

✅ Google Form พร้อมใช้
✅ Short URL: `bit.ly/ai367-beta-signup`
✅ Email notifications เปิดแล้ว
✅ Responses จะเก็บใน Google Sheets อัตโนมัติ

**Next Step:** 
- Update URL ใน `app/beta-signup/page.tsx` → `GOOGLE_FORM_URL`
- แชร์ link ใน social media, email outreach
