# 🎯 Sales Demo Guide - Beauty with AI Precision

## 📱 Demo Flow สำหรับลูกค้า B2B

### 1️⃣ Login (30 วินาที)
- URL: `http://localhost:3005/auth/login`
- บัญชี Demo: `sales_demo@clinic.com` / `demo123`
- Role: Sales Staff

### 2️⃣ Sales Dashboard (1 นาที)
- URL: `http://localhost:3005/th/sales/dashboard`
- แสดง: Metrics, Leads, Conversion Rate
- Mobile: Responsive ทำงานได้

### 3️⃣ AI Skin Analysis (2 นาที)
- URL: `http://localhost:3005/th/analysis`
- ทดสอบ: Upload รูปหรือถ่าย selfie
- ผลลัพธ์: 8-mode analysis, heatmap, recommendations

### 4️⃣ Lead Management (1 นาที)
- URL: `http://localhost:3005/th/sales/leads`
- สร้าง Lead ใหม่จากผล AI Analysis
- ข้อมูล: ชื่อ, อายุ, ปัญหาผิว, ผลการวิเคราะห์

### 5️⃣ Generate Proposal (1 นาที)
- จากหน้า Lead → คลิก "Create Proposal"
- ระบบสร้าง auto จาก AI results
- สามารถแก้ไขราคา/แพ็คเกจได้

### 6️⃣ Mobile Test (1 นาที)
- เปิดบนมือถือจริง
- ทดสอบ responsive ทุกหน้า
- ทดสอบ AI camera integration

---

## 🎯 Key Selling Points

### ✨ **Value Proposition**
- **ไม่ต้องนัดคลินิก** - Sales ไปหาลูกค้าได้ที่ไหนก็ได้
- **ปิดการขายเร็วขึ้น** - AI วิเคราะห์ทันที พร้อม treatment plan
- **Professional** - 468 landmark detection, 8-mode analysis
- **Mobile First** - ใช้งานบนมือถือได้เต็มที่

### 💰 **ROI Example**
- คลินิกขนาดเล็ก (200 ลูกค้า/เดือน)
- เพิ่ม revenue 60% (฿2M → ฿3.2M/เดือน)
- คืนทุนใน 0.8 เดือน

---

## 📋 Technical Checklist

### ✅ **สถานะระบบ**
- [x] Authentication & Authorization
- [x] Sales Dashboard (Mobile Responsive)
- [x] AI Skin Analysis (Rate Limited)
- [x] Lead Management API
- [x] Proposal Generation
- [x] Mobile PWA Support

### 🔧 **Environment**
- URL: `http://localhost:3005`
- Database: Supabase (78 tables)
- Auth: JWT + RLS
- AI: Gemini via Vercel Gateway

---

## 🚨 ข้อควรทราบ

1. **Rate Limiting**: AI API มี rate limiting (429 หาก request เร็วเกินไป)
2. **Authentication**: ต้อง login ก่อนใช้งาน features หลัก
3. **Mobile**: แนะนำใช้บน Chrome/Safari mobile เพื่อ performance ดีที่สุด
4. **Data**: Demo data มีอยู่แล้วใน database (leads, proposals, analyses)

---

## 📞 ติดต่อ

Lead Engineer: [Your Name]
Date: December 24, 2025
Version: 1.0 (Production Ready)
