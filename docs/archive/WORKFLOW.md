# 🔄 AI367 Beauty Platform - User Workflow & Journey

**Version:** 1.0  
**Last Updated:** January 5, 2025  
**Status:** Complete Documentation

---

## 📑 Table of Contents

- [Overview](#overview)
- [User Roles & Permissions](#user-roles--permissions)
- [Customer Journey](#customer-journey)
- [Sales Staff Journey](#sales-staff-journey)
- [Clinic Owner Journey](#clinic-owner-journey)
- [Detailed Workflows](#detailed-workflows)
- [Navigation Map](#navigation-map)
- [Decision Trees](#decision-trees)
- [Error Handling Flows](#error-handling-flows)

---

## 🎯 Overview

ระบบ AI367 Beauty Platform มี **3 User Role หลัก**:

1. **ลูกค้า (Customer)** - ผู้ใช้บริการทั่วไป
2. **เซลส์คลินิก (Sales Staff)** - พนักงานขายและปรึกษา
3. **เจ้าของคลินิก (Clinic Owner/Admin)** - ผู้บริหารและจัดการระบบ

### Role Hierarchy (จาก Database)

\`\`\`
user_role ENUM:
├── public             (Level 0) - ผู้เยี่ยมชมทั่วไป
├── free_user          (Level 1) - ลูกค้าฟรี
├── premium_customer   (Level 2) - ลูกค้าพรีเมียม
├── clinic_staff       (Level 3) - พนักงานคลินิก
├── sales_staff        (Level 3) - เซลส์
├── clinic_admin       (Level 4) - เจ้าของคลินิก/แอดมิน
└── super_admin        (Level 5) - ระดับสูงสุด
\`\`\`

---

## 👥 User Roles & Permissions

### 1. ลูกค้า (Customer)

**Role Types:**
- `free_user` - ใช้งานฟรี (จำกัดฟีเจอร์)
- `premium_customer` - ลูกค้าพรีเมียม (ฟีเจอร์เต็ม)

**Permissions:**
- ✅ ลงทะเบียนและเข้าสู่ระบบ
- ✅ อัปโหลดและวิเคราะห์ภาพผิวหน้า
- ✅ ดูผลการวิเคราะห์ AI + Heatmap
- ✅ ทดลอง AR Treatment Simulator
- ✅ จองนัดหมายกับคลินิก
- ✅ ดูประวัติการวิเคราะห์
- ✅ แชทกับเซลส์/คลินิก
- ❌ เข้าถึง Admin Dashboard
- ❌ จัดการข้อมูลผู้ใช้อื่น

**Access Routes:**
- `/` - Homepage
- `/analysis` - Skin Analysis
- `/ar-simulator` - AR Treatment
- `/booking` - Appointment Booking
- `/profile` - User Profile
- `/chat` - Customer Support Chat
- `/treatment-plans` - Treatment History

---

### 2. เซลส์คลินิก (Sales Staff)

**Role Type:**
- `sales_staff` - พนักงานขายและให้คำปรึกษา

**Permissions:**
- ✅ ดูข้อมูลลูกค้าทั้งหมด (อ่านอย่างเดียว)
- ✅ แชทกับลูกค้าแบบ Real-time
- ✅ ดู Hot Leads Dashboard
- ✅ สร้างและส่ง AI Proposal
- ✅ ดูและจัดการนัดหมาย
- ✅ บันทึก Lead Scoring
- ✅ ดูรายงานยอดขาย (ส่วนตัว)
- ❌ แก้ไขข้อมูลลูกค้า
- ❌ เข้าถึง Admin Dashboard เต็มรูปแบบ
- ❌ จัดการพนักงาน/สต็อก

**Access Routes:**
- `/sales/dashboard` - Sales Dashboard
- `/chat` - Customer Chat
- `/booking` - View Appointments
- `/customer` - Customer List (Read-only)
- `/reports` - Sales Reports

---

### 3. เจ้าของคลินิก (Clinic Owner/Admin)

**Role Types:**
- `clinic_admin` - เจ้าของ/ผู้จัดการคลินิก
- `super_admin` - ระดับสูงสุด (ดูแลทั้งระบบ)

**Permissions:**
- ✅ เข้าถึงทุกอย่างของ Customer + Sales Staff
- ✅ ดู Admin Dashboard เต็มรูปแบบ
- ✅ จัดการข้อมูลผู้ป่วย (CRUD)
- ✅ จัดการพนักงาน (CRUD)
- ✅ จัดการสินค้า/อุปกรณ์ (Inventory)
- ✅ ดูรายงานการเงินทั้งหมด
- ✅ ดูและจัดการนัดหมายทั้งหมด
- ✅ ตั้งค่าระบบ (Settings)
- ✅ เข้าถึง Analytics แบบ Real-time

**Access Routes:**
- `/admin` - Admin Dashboard
- `/admin-dashboard` - Full Admin Panel
- `/super-admin` - Super Admin Tools
- All Customer & Sales routes

---

## 🛣️ Customer Journey

### Journey Overview

\`\`\`
Start → Register → Login → Upload Photo → AI Analysis → View Results → 
Try AR → Book Appointment → Treatment → Follow-up
\`\`\`

### Detailed Flow

#### 1️⃣ เข้าสู่ระบบครั้งแรก (First Visit)

\`\`\`mermaid
graph TD
    A[เข้า Homepage /] --> B{มี Account?}
    B -->|ไม่มี| C[กด Sign Up]
    B -->|มีแล้ว| D[กด Login]
    C --> E[กรอกข้อมูล Email/Password]
    E --> F[ยืนยัน Email]
    F --> G[สร้าง Profile]
    G --> H[เข้าสู่ระบบสำเร็จ]
    D --> I[Login ด้วย Supabase Auth]
    I --> H
    H --> J[ไป Dashboard /dashboard]
\`\`\`

**Steps:**
1. เข้า Homepage: `http://localhost:3000/`
2. กดปุ่ม **"เริ่มใช้งาน"** หรือ **"Sign Up"**
3. กรอกข้อมูล:
   - Email
   - Password (อย่างน้อย 6 ตัวอักษร)
   - ชื่อ-นามสกุล (optional)
4. ระบบส่ง Email ยืนยัน
5. กดลิงก์ยืนยันใน Email
6. เข้าสู่ระบบอัตโนมัติ → Role = `free_user`, Tier = `free`

---

#### 2️⃣ วิเคราะห์ผิวหน้าด้วย AI (Skin Analysis)

\`\`\`mermaid
graph TD
    A[เข้า /analysis] --> B[เลือกอัปโหลดภาพ]
    B --> C{ภาพผ่านเกณฑ์?}
    C -->|ไม่ผ่าน| D[แสดงข้อผิดพลาด]
    D --> E[คำแนะนำการถ่ายภาพ]
    E --> B
    C -->|ผ่าน| F[อัปโหลดไป Supabase Storage]
    F --> G[ส่งไปวิเคราะห์ AI]
    G --> H[แสดงผลลัพธ์ Heatmap]
    H --> I[ดูรายละเอียดปัญหาผิว]
    I --> J[ดูคำแนะนำการรักษา]
    J --> K{สนใจทดลอง AR?}
    K -->|ใช่| L[ไป /ar-simulator]
    K -->|ไม่| M[บันทึกประวัติ]
\`\`\`

**Steps:**
1. **เข้าหน้า Analysis**: `/analysis`
2. **อัปโหลดภาพ**:
   - คลิก "Upload Photo" หรือลาก-วางไฟล์
   - รองรับ: JPG, PNG (ขนาด < 10MB)
   - ระบบเช็ค Quality (Lighting, Blur, Angle)
3. **การวิเคราะห์**:
   - ใช้ Hugging Face AI (ฟรี)
   - ตรวจจับ 468 จุดบนใบหน้า
   - วิเคราะห์: Acne, Wrinkles, Dark Spots, Redness
4. **ดูผลลัพธ์**: `/analysis/results`
   - Heatmap แบบ Multi-layer (5 levels)
   - คะแนนสุขภาพผิว (VISIA Metrics)
   - รายงานปัญหาที่พบ
   - คำแนะนำการรักษา (AI-generated)
5. **บันทึกประวัติ**:
   - เก็บใน `analysis_history` table
   - เข้าถึงได้จาก `/profile` → "ประวัติการวิเคราะห์"

---

#### 3️⃣ ทดลอง AR Treatment Simulator

\`\`\`mermaid
graph TD
    A[เข้า /ar-simulator] --> B[เลือกรูปจากประวัติ]
    B --> C[แสดง 3D Face Model]
    C --> D[เลือก Treatment Type]
    D --> E[ปรับ Intensity Slider]
    E --> F[ดู Before/After]
    F --> G{พอใจ?}
    G -->|ใช่| H[บันทึก Simulation]
    G -->|ไม่| D
    H --> I[ดาวน์โหลดรูป Comparison]
    I --> J[ส่งต่อเซลส์ หรือ จองนัดหมาย]
\`\`\`

**Steps:**
1. **เข้า AR Simulator**: `/ar-simulator`
2. **เลือกภาพ**: จากประวัติการวิเคราะห์
3. **ดู 3D Model**: 
   - หมุนได้ 360° (Touch/Mouse)
   - Zoom in/out
4. **เลือกการรักษา**:
   - Acne Treatment
   - Anti-Aging
   - Brightening
   - Dark Spot Removal
   - Skin Tightening
5. **ปรับความเข้ม**: Slider 0-100%
6. **Before/After Comparison**:
   - Drag slider แนวตั้ง
   - Haptic Feedback (mobile)
7. **บันทึก/ดาวน์โหลด**: PDF Report พร้อมภาพเปรียบเทียบ

---

#### 4️⃣ จองนัดหมาย (Booking Appointment)

\`\`\`mermaid
graph TD
    A[เข้า /booking] --> B[เลือกคลินิก]
    B --> C[เลือกบริการ]
    C --> D[เลือกหมอ optional]
    D --> E[เลือกวันที่]
    E --> F[เลือกช่วงเวลา]
    F --> G{มีช่วงว่าง?}
    G -->|ไม่มี| H[แสดงตัวเลือกอื่น]
    H --> E
    G -->|มี| I[กรอกข้อมูลเพิ่มเติม]
    I --> J[ยืนยันนัดหมาย]
    J --> K[เลือกชำระเงิน optional]
    K --> L[รับ Confirmation Email]
    L --> M[บันทึกใน Calendar]
\`\`\`

**Steps:**
1. **เข้าหน้าจองนัดหมาย**: `/booking`
2. **เลือกคลินิก**: (ถ้ามีหลายสาขา)
3. **เลือกบริการ**:
   - Consultation
   - Acne Treatment
   - Anti-Aging Treatment
   - Facial
   - Laser Treatment
4. **เลือกหมอ**: (optional - หรือระบบแนะนำ)
5. **เลือกวันที่และเวลา**:
   - ระบบแสดงช่วงเวลาว่าง (real-time)
   - เช็คจาก `bookings` table
6. **กรอกข้อมูล**:
   - เหตุผลการนัดหมาย
   - อาการเบื้องต้น
   - ประวัติการแพ้ยา (ถ้ามี)
7. **ยืนยัน**:
   - ส่ง Email ยืนยัน
   - SMS reminder (ก่อนนัด 1 วัน)
   - เก็บใน `bookings` table

---

#### 5️⃣ ดูประวัติและติดตาม (Profile & History)

\`\`\`mermaid
graph TD
    A[เข้า /profile] --> B[ดูข้อมูลส่วนตัว]
    B --> C[แก้ไขโปรไฟล์]
    C --> D[ดูประวัติการวิเคราะห์]
    D --> E[ดูนัดหมายที่จอง]
    E --> F[ดู Treatment History]
    F --> G[ดูกราฟความก้าวหน้า]
    G --> H[ดาวน์โหลดรายงาน PDF]
\`\`\`

**Available Data:**
- ข้อมูลส่วนตัว (Edit ได้)
- ประวัติการวิเคราะห์ทั้งหมด
- นัดหมายที่กำลังจะถึง + ที่ผ่านมา
- Treatment Plans (ถ้ามี)
- Progress Photos (Before/After)
- Timeline กราฟความก้าวหน้า

---

## 💼 Sales Staff Journey

### Journey Overview

\`\`\`
Login → View Hot Leads → Contact Customer → Chat → Create Proposal → 
Close Deal → Book Appointment → Follow-up
\`\`\`

### Detailed Flow

#### 1️⃣ Sales Dashboard

\`\`\`mermaid
graph TD
    A[Login as sales_staff] --> B[เข้า /sales/dashboard]
    B --> C[ดู Hot Leads Ranking]
    C --> D{เลือก Lead}
    D --> E[ดูข้อมูลลูกค้า]
    E --> F[ดูประวัติการวิเคราะห์]
    F --> G[Lead Score AI]
    G --> H{ควรติดต่อ?}
    H -->|ใช่| I[เปิดแชท]
    H -->|ไม่| C
\`\`\`

**Features:**
- **Hot Leads Manager**: `/sales/dashboard`
  - แสดงลูกค้าที่มี AI Lead Score สูง
  - เรียงตาม: Engagement, Analysis Count, Last Active
  - แสดงข้อมูล: ชื่อ, อีเมล, ปัญหาผิว, สนใจรักษา
- **Filters**:
  - ตาม Lead Score (0-100)
  - ตามปัญหาผิว
  - ตามช่วงเวลา Last Active

---

#### 2️⃣ Real-time Chat

\`\`\`mermaid
graph TD
    A[เปิดแชทกับลูกค้า] --> B[ดูประวัติการสนทนา]
    B --> C[ใช้ Quick Replies]
    C --> D[หรือพิมพ์ข้อความเอง]
    D --> E[ใช้ Voice Input]
    E --> F[ส่งข้อความ]
    F --> G[Real-time via Socket.IO]
    G --> H[ลูกค้าได้รับทันที]
    H --> I[บันทึกใน chat_history]
\`\`\`

**Chat Features:**
- **Real-time Messaging**: WebSocket
- **Quick Replies**: ข้อความสำเร็จรูป
  - "สวัสดีค่ะ มีอะไรให้ช่วยไหมคะ"
  - "คุณสนใจบริการอะไรคะ"
  - "ส่งรายละเอียดให้แล้วนะคะ"
- **Voice Input**: Speech-to-Text
- **File Sharing**: รูปภาพ, PDF
- **Message Status**: Sent, Delivered, Read

---

#### 3️⃣ AI Proposal Generator

\`\`\`mermaid
graph TD
    A[เปิด AI Proposal] --> B[ระบบดึงข้อมูล]
    B --> C[ผลการวิเคราะห์ผิว]
    C --> D[ปัญหาที่พบ]
    D --> E[AI แนะนำ Treatment]
    E --> F[คำนวณราคา]
    F --> G[สร้าง PDF Proposal]
    G --> H[ส่งให้ลูกค้า]
    H --> I[ติดตามผล]
\`\`\`

**Generated Content:**
- ปัญหาผิวที่ตรวจพบ
- Treatment Plan แนะนำ (3-5 options)
- ราคาแต่ละแพ็กเกจ
- Timeline การรักษา
- Before/After ตัวอย่าง
- Promotion (ถ้ามี)

---

#### 4️⃣ Lead Scoring & Conversion

**AI Lead Scoring Criteria:**
\`\`\`
Lead Score = 
  (Analysis Count × 20) +
  (Last Active Days × -2) +
  (Chat Engagement × 15) +
  (Booking Intent × 30) +
  (Budget Indicator × 10)
\`\`\`

**Score Ranges:**
- 🔥 **80-100**: Hot (ติดต่อทันที)
- 🌡️ **60-79**: Warm (ติดตามใน 24 ชม.)
- ❄️ **40-59**: Cold (ส่งข้อมูลเพิ่มเติม)
- 💤 **0-39**: Inactive (ส่ง Email Campaign)

---

## 🏥 Clinic Owner Journey

### Journey Overview

\`\`\`
Login → Admin Dashboard → Manage Patients/Staff/Inventory → 
View Reports → Analytics → Settings
\`\`\`

### Detailed Flow

#### 1️⃣ Admin Dashboard Overview

\`\`\`mermaid
graph TD
    A[Login as clinic_admin] --> B[/admin-dashboard]
    B --> C[ดูสถิติภาพรวม]
    C --> D[Today's Metrics]
    D --> E[Revenue Chart]
    E --> F[Top Treatments]
    F --> G[Recent Activities]
\`\`\`

**Dashboard Metrics:**
- **Today's Stats**:
  - Total Revenue
  - Appointments (Today)
  - New Patients
  - Conversion Rate
- **Charts**:
  - Revenue Trend (7/30/90 days)
  - Treatment Popularity
  - Patient Growth
- **Quick Actions**:
  - Add New Patient
  - View Bookings
  - Manage Staff
  - Check Inventory

---

#### 2️⃣ Patient Management

\`\`\`mermaid
graph TD
    A[/admin → Patients] --> B[ดูรายชื่อผู้ป่วย]
    B --> C[ค้นหา/กรอง]
    C --> D{เลือก Action}
    D -->|เพิ่ม| E[Add New Patient]
    D -->|ดู| F[View Patient Details]
    D -->|แก้| G[Edit Patient Info]
    D -->|ลบ| H[Delete inactive]
    F --> I[ดูประวัติการรักษา]
    I --> J[ดูนัดหมาย]
    J --> K[ดูยอดค้าง]
\`\`\`

**Patient Data (จาก `patients` table):**
- ข้อมูลส่วนตัว: ชื่อ, อีเมล, เบอร์โทร
- วันเกิด, เพศ, ที่อยู่
- ผู้ติดต่อฉุกเฉิน
- **Medical Info**:
  - Skin Type
  - Allergies
  - Current Medications
  - Medical History
- **Treatment History**:
  - Skin Concerns
  - Previous Treatments
- **Stats**:
  - Total Visits
  - Total Spent
  - Last Visit Date
  - Status (Active/Inactive)

---

#### 3️⃣ Staff Management

\`\`\`mermaid
graph TD
    A[/admin → Staff] --> B[ดูรายชื่อพนักงาน]
    B --> C{Filter by Role}
    C -->|Doctor| D[ดูหมอทั้งหมด]
    C -->|Nurse| E[ดูพยาบาล]
    C -->|Receptionist| F[ดูพนักงานต้อนรับ]
    C -->|Admin| G[ดูแอดมิน]
    D --> H[Manage Schedule]
    H --> I[Working Hours]
    I --> J[Salary Management]
\`\`\`

**Staff Data (จาก `staff` table):**
- ข้อมูลส่วนตัว: ชื่อ, อีเมล, เบอร์โทร
- Role: Doctor, Nurse, Receptionist, Admin
- **Professional Info**:
  - Specialization
  - License Number
  - Hire Date
- **Work Schedule**:
  \`\`\`json
  {
    "monday": {"start": "09:00", "end": "18:00"},
    "tuesday": {"start": "09:00", "end": "18:00"},
    ...
  }
  \`\`\`
- Salary
- Status (Active/Inactive)

---

#### 4️⃣ Inventory Management

\`\`\`mermaid
graph TD
    A[/admin → Inventory] --> B[ดูรายการสินค้า]
    B --> C{Filter by Category}
    C -->|Product| D[เครื่องสำอาง]
    C -->|Equipment| E[อุปกรณ์]
    C -->|Medicine| F[ยา]
    C -->|Supply| G[วัสดุสิ้นเปลือง]
    B --> H{Check Status}
    H -->|Low Stock| I[แจ้งเตือน]
    H -->|Out of Stock| J[Order ด่วน]
    H -->|Expiring Soon| K[ตรวจสอบ]
\`\`\`

**Inventory Data (จาก `inventory` table):**
- ชื่อสินค้า, SKU
- Category: Product, Equipment, Medicine, Supply
- คำอธิบาย
- **Stock Info**:
  - Quantity (ปัจจุบัน)
  - Min Quantity (เตือน)
  - Unit Price
- Supplier
- Expiry Date
- Status:
  - ✅ In Stock
  - ⚠️ Low Stock (< min_quantity)
  - ❌ Out of Stock
- Last Restocked Date
- Location (ตำแหน่งจัดเก็บ)

---

#### 5️⃣ Reports & Analytics

**Available Reports:**

1. **Financial Reports**:
   - Daily/Weekly/Monthly Revenue
   - Revenue by Treatment Type
   - Payment Method Breakdown
   - Outstanding Payments

2. **Patient Reports**:
   - New Patients Trend
   - Patient Retention Rate
   - Most Common Skin Concerns
   - Treatment Success Rate

3. **Staff Reports**:
   - Appointments per Doctor
   - Utilization Rate
   - Performance Metrics

4. **Inventory Reports**:
   - Stock Levels
   - Expiring Items
   - Usage Frequency
   - Reorder Suggestions

**Export Options:**
- PDF
- Excel
- CSV

---

## 🗺️ Navigation Map

### Complete Site Map

\`\`\`
/
├── / (Homepage - Public)
│
├── /[locale]/ (Multi-language)
│   ├── /th (Thai)
│   ├── /en (English)
│   └── /zh (Chinese)
│
├── /auth/
│   ├── /login
│   ├── /register
│   ├── /forgot-password
│   └── /reset-password
│
├── /analysis (Customer)
│   └── /results
│
├── /ar-simulator (Customer)
│
├── /booking (Customer)
│   └── /confirmation
│
├── /profile (Customer)
│
├── /treatment-plans (Customer)
│
├── /chat (Customer + Sales)
│
├── /sales/ (Sales Staff Only)
│   └── /dashboard
│
├── /admin/ (Clinic Admin Only)
│   ├── /patients
│   ├── /staff
│   ├── /inventory
│   └── /reports
│
├── /admin-dashboard/ (Full Admin Panel)
│   ├── /analytics
│   ├── /bookings
│   └── /settings
│
├── /super-admin/ (Super Admin Only)
│
├── /about
├── /pricing
├── /contact
├── /privacy
├── /terms
└── /faq
\`\`\`

---

## 🔀 Decision Trees

### Authentication Flow

\`\`\`
Is User Logged In?
├── No
│   ├── Public Pages (/, /about, /pricing) → Allow
│   ├── Protected Pages → Redirect to /auth/login
│   └── After Login → Redirect to intended page
│
└── Yes
    ├── Role = free_user/premium_customer
    │   ├── Customer Routes → Allow
    │   ├── Sales Routes → Deny (403)
    │   └── Admin Routes → Deny (403)
    │
    ├── Role = sales_staff
    │   ├── Customer Routes → Allow
    │   ├── Sales Routes → Allow
    │   └── Admin Routes → Deny (403)
    │
    └── Role = clinic_admin/super_admin
        ├── Customer Routes → Allow
        ├── Sales Routes → Allow
        └── Admin Routes → Allow
\`\`\`

---

### Booking Availability Logic

\`\`\`
User เลือกวันที่และเวลา
├── Query Database: SELECT * FROM bookings WHERE date = ? AND doctor_id = ?
├── Check Staff Schedule: working_hours JSONB
│
└── Is Time Slot Available?
    ├── Yes
    │   ├── Show "Available" ✅
    │   └── Allow Booking
    │
    └── No
        ├── Show "Booked" ❌
        ├── Suggest Next Available Slot
        └── Allow Waitlist (optional)
\`\`\`

---

### Payment Flow

\`\`\`
User Confirms Booking
├── Payment Required?
│   ├── No (Free Consultation) → Create Booking Immediately
│   │
│   └── Yes
│       ├── Payment Method?
│       │   ├── PromptPay → Generate QR Code
│       │   ├── Credit Card → Stripe Checkout
│       │   └── Bank Transfer → Show Account Details
│       │
│       ├── User Pays
│       │   ├── Success
│       │   │   ├── Webhook → Update booking.payment_status = 'paid'
│       │   │   ├── Send Confirmation Email
│       │   │   └── Create Booking Record
│       │   │
│       │   └── Failed
│       │       ├── Show Error Message
│       │       └── Retry or Cancel
│       │
│       └── Partial Payment?
│           ├── Update payment_status = 'partial'
│           └── Track Outstanding Amount
\`\`\`

---

## ⚠️ Error Handling Flows

### Upload Photo Error Handling

\`\`\`
User อัปโหลดภาพ
├── Validation Checks
│   ├── File Type? (JPG/PNG)
│   │   └── ❌ → "กรุณาอัปโหลดไฟล์ JPG หรือ PNG"
│   │
│   ├── File Size? (< 10MB)
│   │   └── ❌ → "ขนาดไฟล์ใหญ่เกินไป (สูงสุด 10MB)"
│   │
│   └── Image Quality?
│       ├── Too Dark → "แสงน้อยเกินไป กรุณาถ่ายในที่สว่าง"
│       ├── Too Blurry → "ภาพไม่ชัด กรุณาถ่ายใหม่"
│       └── No Face Detected → "ไม่พบใบหน้า กรุณาถ่ายให้เห็นหน้าชัดเจน"
│
├── All Passed ✅ → Proceed to Analysis
│
└── If Analysis Fails
    ├── Retry (Auto - 3 attempts)
    ├── Fallback to Backup AI Provider
    └── Show Manual Review Option
\`\`\`

---

### Database Error Handling

\`\`\`
Database Operation
├── Connection Error
│   ├── Retry Connection (3 times)
│   ├── Show "ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง"
│   └── Log Error → Sentry
│
├── Permission Denied (RLS)
│   ├── Check User Role
│   ├── Show "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้"
│   └── Redirect to Appropriate Page
│
├── Duplicate Entry
│   ├── Show "ข้อมูลซ้ำ กรุณาใช้ค่าอื่น"
│   └── Highlight Conflicting Field
│
└── Constraint Violation
    ├── Show User-Friendly Message
    └── Suggest Valid Options
\`\`\`

---

### Authentication Error Handling

\`\`\`
Login Attempt
├── Invalid Credentials
│   ├── Show "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
│   ├── Limit: 5 attempts
│   └── After 5 fails → Lock for 15 minutes
│
├── Email Not Verified
│   ├── Show "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ"
│   └── Resend Verification Email
│
├── Account Inactive
│   ├── Show "บัญชีถูกระงับ กรุณาติดต่อแอดมิน"
│   └── Provide Contact Info
│
└── Session Expired
    ├── Auto Refresh Token (Background)
    ├── If Refresh Fails → Redirect to Login
    └── Preserve Intended Destination
\`\`\`

---

## 📊 Data Flow Diagrams

### Analysis Data Flow

\`\`\`
[User Device]
    ↓ Upload Photo
[Supabase Storage]
    ↓ Get URL
[Next.js API /api/analyze]
    ↓ Send to AI
[Hugging Face API]
    ↓ Return Results
[Process & Format]
    ↓ Save to DB
[supabase: analysis_history]
    ↓ Fetch Results
[Display to User]
\`\`\`

---

### Real-time Chat Flow

\`\`\`
[Customer] ←→ [Socket.IO Server :3001] ←→ [Sales Staff]
              ↓                     ↓
        [supabase: chat_history]
              ↓
        [Persistent Storage]
\`\`\`

---

### Booking Confirmation Flow

\`\`\`
[User Creates Booking]
    ↓
[Check Availability]
    ↓
[Create Record in bookings table]
    ↓
[Trigger: send_booking_confirmation]
    ↓
[Send Email via Supabase Email]
    ↓
[Send SMS via Twilio optional]
    ↓
[Update Booking Status = 'confirmed']
\`\`\`

---

## 🔐 Security Flows

### Row Level Security (RLS) Example

**Scenario**: User พยายามดูข้อมูล Patient

\`\`\`sql
-- Policy: Users can only view their own patient data
CREATE POLICY "Users view own patient data"
ON patients FOR SELECT
USING (auth.uid()::text = id);

-- Policy: Admin can view all patients
CREATE POLICY "Admin view all patients"
ON patients FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM staff 
    WHERE email = auth.jwt()->>'email' 
    AND role = 'admin' 
    AND is_active = true
  )
);
\`\`\`

**Flow**:
1. User ส่ง Request: `SELECT * FROM patients WHERE id = 'xxx'`
2. Supabase เช็ค RLS Policy
3. ถ้า `auth.uid() = patient.id` → Allow
4. ถ้าไม่ตรง → เช็ค Admin Policy
5. ถ้าไม่ผ่านทั้งคู่ → Return Empty (403 Forbidden)

---

## 🚀 Performance Optimization Flows

### Image Upload Optimization

\`\`\`
User Selects Image
    ↓
[Client-side Resize] (max 1920x1080)
    ↓
[Compress] (quality 85%)
    ↓
[Upload to Supabase Storage]
    ↓
[Generate Thumbnail] (300x300)
    ↓
[Save URLs to Database]
\`\`\`

---

### Caching Strategy

\`\`\`
User Requests Data
    ↓
Check Cache (Browser/CDN)
    ├── Cache Hit ✅ → Return Cached Data
    │
    └── Cache Miss ❌
        ↓
    Fetch from Database
        ↓
    Store in Cache (TTL: 5 minutes)
        ↓
    Return to User
\`\`\`

---

## 📱 Mobile-Specific Workflows

### PWA Installation Flow

\`\`\`
User เข้า Website บน Mobile
    ↓
[Service Worker Registers]
    ↓
After 3 Visits → Show "Install App" Prompt
    ↓
User Taps "Add to Home Screen"
    ↓
[PWA Installed]
    ↓
User Opens from Home Screen
    ↓
[Standalone Mode] (No Browser UI)
    ↓
[Offline Support Available]
\`\`\`

---

### Offline Analysis Flow

\`\`\`
User Opens App (No Internet)
    ↓
[Service Worker Serves Cached Pages]
    ↓
User Uploads Photo
    ↓
[Store in IndexedDB] (Queue)
    ↓
Show "จะอัปโหลดเมื่อมีอินเทอร์เน็ต"
    ↓
[Internet Restored]
    ↓
[Background Sync] → Auto Upload
    ↓
[Notify User: "วิเคราะห์เสร็จแล้ว"]
\`\`\`

---

## 📞 Support & Escalation Flow

\`\`\`
Customer Has Issue
    ↓
[Check FAQ Page]
    ├── Found Answer → Problem Solved
    │
    └── Not Found
        ↓
    [Open Chat with Sales]
        ├── Sales Resolves → Problem Solved
        │
        └── Need Technical Help
            ↓
        [Escalate to Clinic Admin]
            ├── Admin Resolves → Problem Solved
            │
            └── Need Developer
                ↓
            [Create Support Ticket]
                ↓
            [Developer Investigation]
\`\`\`

---

## 🎯 Summary: Key User Paths

### ลูกค้า (Customer) - Top 5 Actions
1. **ลงทะเบียน** → `/auth/register`
2. **วิเคราะห์ผิว** → `/analysis` → `/analysis/results`
3. **ทดลอง AR** → `/ar-simulator`
4. **จองนัดหมาย** → `/booking`
5. **ดูประวัติ** → `/profile`

---

### เซลส์ (Sales Staff) - Top 5 Actions
1. **ดู Hot Leads** → `/sales/dashboard`
2. **แชทกับลูกค้า** → `/chat`
3. **สร้าง Proposal** → AI Proposal Generator
4. **ดูนัดหมาย** → `/booking` (Read-only)
5. **ดูรายงานยอดขาย** → `/reports`

---

### เจ้าของคลินิก (Clinic Owner) - Top 5 Actions
1. **ดู Dashboard** → `/admin-dashboard`
2. **จัดการผู้ป่วย** → `/admin/patients`
3. **จัดการพนักงาน** → `/admin/staff`
4. **ตรวจสต็อก** → `/admin/inventory`
5. **ดูรายงาน** → `/admin/reports`

---

## 📝 Notes & Best Practices

### For Customers
- ✅ ถ่ายภาพในที่สว่าง (Natural Light)
- ✅ หน้าตรง ไม่เอียง
- ✅ เครื่องสำอางออกหมด
- ✅ บันทึกผลการวิเคราะห์ทุกครั้ง

### For Sales Staff
- ✅ ตอบแชทภายใน 5 นาที
- ✅ Use Quick Replies เพื่อความรวดเร็ว
- ✅ สร้าง Proposal ทันทีเมื่อลูกค้าสนใจ
- ✅ Follow-up ภายใน 24 ชั่วโมง

### For Clinic Owners
- ✅ เช็ครายงานทุกวัน
- ✅ Monitor Low Stock Items
- ✅ Review Staff Performance รายสัปดาห์
- ✅ Backup Data รายเดือน

---

**Document Maintained by**: AI Development Team  
**For Questions**: Contact System Admin  
**Last Review**: January 5, 2025

---
