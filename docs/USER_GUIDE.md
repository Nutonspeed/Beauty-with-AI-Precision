# 📖 CenterIQ AI User Guide

## คู่มือการใช้งาน CenterIQ Platform

---

## 🏠 หน้าแรก (Landing Page)

เมื่อเข้าสู่ระบบครั้งแรก คุณจะเห็นหน้า Landing Page ที่แสดง:
- **คุณสมบัติหลัก** ของ CenterIQ
- **แผนราคา** สำหรับศูนย์ความงามต่างๆ
- **ปุ่มทดลองใช้** สำหรับ AI Skin Analysis

### การเปลี่ยนภาษา
- คลิกที่ไอคอน 🌐 บน Header
- เลือกภาษา: ไทย, English, 中文

---

## 🔐 การเข้าสู่ระบบ

### สำหรับ Staff/Admin
1. ไปที่ `/th/auth/login`
2. กรอก Email และ Password
3. คลิก "เข้าสู่ระบบ"

### สำหรับลูกค้า
1. ไปที่ `/onboarding/customer`
2. กรอกข้อมูลส่วนตัว
3. ระบบจะสร้าง account ให้อัตโนมัติ

### ลืมรหัสผ่าน
1. คลิก "ลืมรหัสผ่าน?"
2. กรอก Email
3. ตรวจสอบ Inbox สำหรับ link reset

---

## 🔬 AI Skin Analysis

### วิธีใช้งาน

1. **เข้าหน้า Analysis**
   - ไปที่ `/th/analysis`
   - หรือคลิก "วิเคราะห์ผิว" บน Dashboard

2. **เลือกรูปภาพ**
   - คลิก "อัพโหลดรูป" หรือ "ถ่ายรูป"
   - เลือกรูปหน้าที่ชัดเจน
   - แสงสว่างเพียงพอ, ไม่มีเงา

3. **รอผลวิเคราะห์**
   - ระบบจะวิเคราะห์ใน 5-10 วินาที
   - แสดงผลลัพธ์ 8 ด้าน:
     - จุดด่างดำ (Spots)
     - ริ้วรอย (Wrinkles)
     - รูขุมขน (Pores)
     - เนื้อผิว (Texture)
     - สีผิว (Pigmentation)
     - ความชุ่มชื้น (Hydration)
     - สิว (Acne)
     - UV Damage

4. **ดูคำแนะนำ**
   - ระบบจะแนะนำ Program ที่เหมาะสม
   - แสดง Match Score สำหรับแต่ละ Program

### Tips สำหรับรูปที่ดี
- ✅ แสงธรรมชาติ
- ✅ หน้าตรง ไม่เอียง
- ✅ ไม่มีแต่งหน้า
- ❌ หลีกเลี่ยงแสงแฟลช
- ❌ หลีกเลี่ยงแสงจากด้านหลัง

---

## 🎨 AR Simulator

### Botox/Filler Simulator

1. **เข้าหน้า AR Tools**
   - ไปที่ `/th/sales/ar-tools`

2. **เลือก Simulator**
   - Botox Simulator - จำลองผลโบท็อกซ์
   - Filler Simulator - จำลองผลฟิลเลอร์
   - Body Contouring - จำลองการกระชับสัดส่วน
   - Hair Restoration - จำลองการปลูกผม

3. **ปรับค่า**
   - ใช้ Slider ปรับความเข้มข้น
   - ดู Before/After เปรียบเทียบ

4. **Export ผลลัพธ์**
   - คลิก "Export" เพื่อบันทึกรูป
   - ส่งให้ลูกค้าดูได้

---

## 📊 Sales Dashboard

### หน้า Dashboard หลัก (`/th/sales/dashboard`)

แสดงข้อมูล:
- **Today's Stats** - สถิติวันนี้
- **Recent Leads** - Lead ล่าสุด
- **AR Tools** - เครื่องมือ AR
- **AI Sales Tools** - เครื่องมือ AI

### AI Sales Tools (`/th/sales/tools`)

1. **AI Smart Recommendations**
   - แนะนำ Program อัตโนมัติ
   - คำนวณ Match Score
   - แสดง Conversion Rate

2. **Quick Quote Calculator**
   - คำนวณราคาแบบ Real-time
   - ใส่โค้ดส่วนลด
   - ส่งใบเสนอราคาได้ทันที

3. **Lead Conversion Optimizer**
   - วิเคราะห์โอกาสปิดการขาย
   - แนะนำ Action ที่ควรทำ
   - Script สำเร็จรูป

4. **Messaging Integration**
   - ส่งข้อความผ่าน LINE/WhatsApp
   - Template ข้อความสำเร็จรูป

---

## 👥 Lead Management

### สร้าง Lead ใหม่

1. ไปที่ `/th/sales/leads`
2. คลิก "สร้าง Lead ใหม่"
3. กรอกข้อมูล:
   - ชื่อลูกค้า
   - เบอร์โทร
   - Program ที่สนใจ
   - แหล่งที่มา (Facebook, Walk-in, etc.)

### จัดการ Lead

- **Hot** 🔥 - โอกาสสูง ต้องติดตามทันที
- **Warm** 🟡 - โอกาสปานกลาง
- **Cold** ❄️ - โอกาสต่ำ ต้อง Nurture

### ติดต่อลูกค้า

1. คลิกที่ Lead
2. เลือกช่องทาง:
   - 📞 โทร
   - 💬 Chat
   - 📧 Email
   - 📱 LINE/WhatsApp

---

## 🏥 Center Management

### ตั้งค่าศูนย์ความงาม (`/th/center/settings`)

1. **ข้อมูลศูนย์ความงาม**
   - ชื่อศูนย์ความงาม
   - ที่อยู่
   - เบอร์โทร

2. **เวลาทำการ**
   - กำหนดเวลาเปิด-ปิด
   - วันหยุด

3. **Staff**
   - เพิ่ม/ลบ Staff
   - กำหนด Role

### รายงาน Revenue (`/th/center/revenue`)

แสดง:
- รายได้รายวัน/รายเดือน
- Program ที่ขายดี
- เปรียบเทียบกับเดือนก่อน

---

## 📅 Booking

### สร้างการจอง

1. ไปที่ `/th/booking`
2. เลือกลูกค้า
3. เลือก Program
4. เลือกวันและเวลา
5. ยืนยันการจอง

### จัดการ Queue

- ดู Queue ปัจจุบันที่ `/th/center/reception`
- เรียกคิวถัดไป
- แจ้งเตือนลูกค้าผ่าน LINE

---

## 📱 Mobile App

### การใช้งานบน Mobile

1. เปิด Browser บนมือถือ
2. ไปที่ URL ของ CenterIQ AI
3. คลิก "เพิ่มไปยังหน้าจอหลัก" (Add to Home Screen)
4. ใช้งานเหมือน App ปกติ

### Offline Mode

- ระบบรองรับการใช้งานแบบ Offline บางส่วน
- ข้อมูลจะ Sync เมื่อกลับมา Online

---

## 🔒 ความปลอดภัย

### การรักษาความปลอดภัยข้อมูล

- ข้อมูลทั้งหมดถูกเข้ารหัส
- ใช้ Row Level Security (RLS)
- แยกข้อมูลแต่ละศูนย์ความงามอย่างสมบูรณ์

### Best Practices

- ✅ ใช้รหัสผ่านที่แข็งแกร่ง (8+ ตัวอักษร)
- ✅ ไม่แชร์ Account กับคนอื่น
- ✅ Logout ทุกครั้งหลังใช้งาน
- ✅ ตรวจสอบ Activity Log เป็นประจำ

---

## ❓ FAQ

### Q: ลืมรหัสผ่านทำอย่างไร?
A: คลิก "ลืมรหัสผ่าน" ที่หน้า Login และตรวจสอบ Email

### Q: รูปวิเคราะห์ไม่ชัดทำอย่างไร?
A: ถ่ายรูปใหม่ในที่แสงดี ไม่มีเงา หน้าตรง

### Q: เพิ่ม Staff ใหม่อย่างไร?
A: ไปที่ Center Settings > Staff > เพิ่มสมาชิก

### Q: Export ข้อมูลได้ไหม?
A: ได้ ไปที่ Reports > Export เลือก Format (CSV, PDF)

---

## 📞 Support

- **Email:** support@centeriq.app
- **LINE:** @centeriq
- **โทร:** 02-xxx-xxxx (จ-ศ 9:00-18:00)

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01 | Initial Release |
| 1.1.0 | 2024-02 | Added AR Simulators |
| 1.2.0 | 2024-03 | Added AI Sales Tools |
| 1.3.0 | 2024-04 | Added Messaging Integration |

---

© 2026 CenterIQ AI. All rights reserved.
