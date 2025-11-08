# 🗺️ Navigation Map - AI367Bar Beauty Platform

## 📊 สรุปหน้าเว็บทั้งหมด (78 หน้า)

เอกสารนี้รวบรวมหน้าเว็บทั้งหมดในระบบ พร้อมระบุว่า:
- ✅ **หน้าที่มีเส้นทางชัดเจน** (51 หน้า) - มี link จาก Header/Footer/Dashboard
- ⚠️ **หน้าที่ขาดเส้นทางชัดเจน** (5 หน้า) - สร้างแล้วแต่ไม่มี link เข้าถึง
- 🔧 **หน้าทดสอบ/Demo** (22 หน้า) - สำหรับ development
- 🚧 **หน้าที่ยังไม่ได้ใช้** - สร้างไว้แต่ยังไม่เปิดใช้งาน

**อัปเดตล่าสุด:** 5 พฤศจิกายน 2025 - เพิ่ม /sales/leads, /sales/proposals, /clinic/staff

---

## 1. 🏠 PUBLIC PAGES (เข้าถึงได้โดยไม่ต้อง login)

### ✅ มีเส้นทางชัดเจน (มี link จาก Header/Footer)

| หน้า | Path | Link จาก | สถานะ |
|------|------|----------|-------|
| Homepage | `/` หรือ `/[locale]` | Direct URL | ✅ ทำงาน |
| Features | `/features` | Footer | ✅ ทำงาน |
| Pricing | `/pricing` | Footer | ✅ ทำงาน |
| About | `/about` | Footer | ✅ ทำงาน |
| Contact | `/contact` | Footer | ✅ ทำงาน |
| FAQ | `/faq` | - | ✅ ทำงาน |
| Privacy Policy | `/privacy` | Footer | ✅ ทำงาน |
| Terms of Service | `/terms` | Footer | ✅ ทำงาน |
| PDPA | `/pdpa` | Footer | ✅ ทำงาน |
| Analysis (Try Demo) | `/analysis` | Header + Footer | ✅ ทำงาน |
| AR Simulator | `/ar-simulator` | Header | ✅ ทำงาน |
| AI Chat | `/ai-chat` | Header | ✅ ทำงาน |
| Booking | `/booking` | Header | ✅ ทำงาน |

### ⚠️ ขาดเส้นทางชัดเจน (ไม่มี link จาก menu)

| หน้า | Path | ปัญหา | แนะนำ |
|------|------|-------|-------|
| Beta Signup | `/beta-signup` | ไม่มี link ใน Header/Footer | เพิ่มใน Footer หรือ Homepage CTA |
| Demo Page | `/demo` | ไม่มี link (ซ้ำกับ /analysis?) | พิจารณาลบหรือ redirect |
| AR 3D Visualization | `/ar-3d` | ไม่มี link | เพิ่มใน Features หรือ AR Simulator |
| AR Advanced | `/ar-advanced` | ไม่มี link | เพิ่มใน Features หรือ AR Simulator |
| AR Live Try-On | `/ar-live` | ไม่มี link | เพิ่มใน Features หรือ AR Simulator |
| Security Audit Logs | `/security/audit-logs` | ไม่มี link | เพิ่มใน Admin Dashboard |

### 🔧 หน้าทดสอบ/Demo (สำหรับ development)

| หน้า | Path | วัตถุประสงค์ |
|------|------|-------------|
| AI Chat Demo | `/ai-chat-demo` | ทดสอบ AI Chat feature |
| AI Recommender Demo | `/ai-recommender-demo` | ทดสอบ AI Recommendations |
| Booking Demo | `/booking-demo` | ทดสอบระบบจองคิว |
| Progress Tracking Demo | `/progress-tracking-demo` | ทดสอบการติดตาม progress |
| Shop Demo | `/shop-demo` | ทดสอบระบบร้านค้า |
| Video Consultation Demo | `/video-consultation-demo` | ทดสอบ video call |
| I18n Demo | `/[locale]/i18n-demo` | ทดสอบระบบหลายภาษา |
| PWA Demo | `/[locale]/pwa-demo` | ทดสอบ Progressive Web App |
| Queue Demo | `/queue/demo` | ทดสอบระบบคิว |
| Chat Demo | `/chat/demo` | ทดสอบ chat feature |
| Video Call Demo | `/video-call/demo` | ทดสอบ video call |
| Whiteboard Demo | `/whiteboard/demo` | ทดสอบกระดานวาด |
| Presence Demo | `/presence/demo` | ทดสอบ online presence |
| Availability Demo | `/availability/demo` | ทดสอบปฏิทินว่าง |
| Location Demo | `/location/demo` | ทดสอบ location tracking |
| Emergency Alert Demo | `/emergency-alerts/demo` | ทดสอบแจ้งเตือนฉุกเฉิน |
| Notifications Demo | `/notifications/demo` | ทดสอบการแจ้งเตือน |
| Worker Test | `/worker-test` | ทดสอบ service worker |
| Mobile Test | `/mobile-test` | ทดสอบ mobile features |
| Test AI | `/test-ai` | ทดสอบ AI models |
| Test AI HuggingFace | `/test-ai-huggingface` | ทดสอบ HuggingFace integration |
| Test AI Performance | `/test-ai-performance` | ทดสอบ AI performance |
| Phase 1 Validation | `/phase1-validation` | ทดสอบ Phase 1 features |

---

## 2. 🔐 AUTHENTICATION PAGES

### ✅ มีเส้นทางชัดเจน

| หน้า | Path | Link จาก |
|------|------|----------|
| Login | `/auth/login` | Header (Login button) |
| Register | `/auth/register` | Login page |
| Forgot Password | `/auth/forgot-password` | Login page |
| Reset Password | `/auth/reset-password` | Email link |
| Unauthorized | `/unauthorized` | Auto redirect เมื่อไม่มีสิทธิ์ |

---

## 3. 👤 CUSTOMER PAGES (บทบาท: ลูกค้า/คนไข้)

### ✅ มีเส้นทางชัดเจน

| หน้า | Path | Link จาก | สถานะ |
|------|------|----------|-------|
| Customer Dashboard | `/customer/dashboard` | Auto redirect หลัง login | ✅ ทำงาน |
| Profile | `/profile` | User menu dropdown | ✅ ทำงาน |
| Booking | `/booking` | Customer Dashboard "Book Appointment" | ✅ ทำงาน |
| AI Analysis | `/analysis` | Customer Dashboard "AI Analysis" | ✅ ทำงาน |
| Treatment Plans | `/treatment-plans` | Customer Dashboard "Treatment Plans" | ✅ ทำงาน |
| Progress Tracking | `/progress` | Customer Dashboard "My Progress" | ✅ ทำงาน |
| Analysis History | `/analysis/history` | Customer Dashboard button | ✅ ทำงาน |
| Payment | `/payment` | Customer Dashboard + Booking flow | ✅ ทำงาน |
| Payment Success | `/payment/success` | หลัง payment สำเร็จ | ✅ ทำงาน |

### ⚠️ ขาดเส้นทางชัดเจน

| หน้า | Path | แนะนำ |
|------|------|-------|
| Treatment Recommendations | `/treatment-recommendations` | เพิ่มใน Analysis Results |
| Analysis Detail | `/analysis/detail/[id]` | คลิกจาก Analysis History |
| Analysis Progress | `/analysis/progress` | ดู progress real-time |
| Analysis Results | `/analysis/results` | ดูผลการวิเคราะห์ |
| Multi-Angle Analysis | `/analysis/multi-angle` | วิเคราะห์หลายมุม |

### 🚧 หน้าที่ควรมี (ยังไม่ได้สร้าง)

- `/customer/appointments` - ดูประวัติการนัดหมาย
- `/customer/invoices` - ดูใบเสร็จ/ใบแจ้งหนี้
- `/customer/loyalty` - โปรแกรมสะสมคะแนน

---

## 4. 💼 SALES PAGES (บทบาท: พนักงานขาย)

### ✅ มีเส้นทางชัดเจน

| หน้า | Path | Link จาก | สถานะ |
|------|------|----------|-------|
| Sales Dashboard | `/sales/dashboard` | Auto redirect หลัง login | ✅ ทำงาน (dark mode ok) |
| Sales Page (redirect) | `/sales` | → redirect to `/sales/dashboard` | ✅ ทำงาน |
| All Leads | `/sales/leads` | Sales Dashboard "All Leads" button | ✅ ทำงาน |
| Proposals | `/sales/proposals` | Sales Dashboard "Proposals" button | ✅ ทำงาน |

### ⚠️ ขาดเส้นทางชัดเจน (ควรเพิ่ม link ใน Sales Dashboard)

| หน้า | Path | แนะนำ |
|------|------|-------|
| Marketing | `/marketing` | เพิ่มปุ่ม "Marketing Tools" |
| Campaign Automation | `/campaign-automation` | เพิ่มปุ่ม "Campaigns" |
| Loyalty | `/loyalty` | เพิ่มปุ่ม "Loyalty Program" |

### 🚧 หน้าที่ควรมี (ยังไม่ได้สร้าง)

- `/sales/performance` - รายงานยอดขาย

---

## 5. 🏥 CLINIC OWNER PAGES (บทบาท: เจ้าของคลินิก)

### ✅ มีเส้นทางชัดเจน

| หน้า | Path | Link จาก | สถานะ |
|------|------|----------|-------|
| Clinic Dashboard | `/clinic/dashboard` | Auto redirect หลัง login | ✅ ทำงาน (dark mode ok, mock data) |
| Clinic Page (redirect) | `/clinic` | → redirect to `/clinic/dashboard` | ✅ ทำงาน |
| Clinic Queue | `/clinic/[clinicId]/queue` | - | ✅ ทำงาน |
| Analytics | `/analytics` | Header (clinic owner) + Dashboard | ✅ ทำงาน |
| Analytics Realtime | `/analytics/realtime` | Clinic Dashboard | ✅ ทำงาน |
| Schedule | `/schedule` | Clinic Dashboard "Schedule" card | ✅ ทำงาน |
| Queue Patient | `/queue/patient` | Clinic Dashboard "Queue" card | ✅ ทำงาน |
| Reports | `/reports` | Clinic Dashboard "Reports" card | ✅ ทำงาน |
| Inventory | `/inventory` | Clinic Dashboard "Inventory" card | ✅ ทำงาน |
| Staff Management | `/clinic/staff` | Clinic Dashboard "Staff" card | ✅ ทำงาน |
| Branches | `/branches` | Clinic Dashboard "Branches" card | ✅ ทำงาน |
| Chat | `/chat` | Clinic Dashboard "Live Chat" card | ✅ ทำงาน |

### ⚠️ ขาดเส้นทางชัดเจน

_ไม่มี - ทุกหน้าหลักมี navigation แล้ว_

### 🚧 หน้าที่ควรมี (ยังไม่ได้สร้าง)

- `/clinic/settings` - ตั้งค่าคลินิก
- `/clinic/revenue` - รายงานรายได้

---

## 6. 🛡️ ADMIN PAGES (บทบาท: ผู้ดูแลระบบ)

### ✅ มีเส้นทางชัดเจน

| หน้า | Path | Link จาก | สถานะ |
|------|------|----------|-------|
| Admin Dashboard | `/admin` | Auto redirect หลัง login | ✅ ทำงาน |
| Super Admin Dashboard | `/super-admin` | Header (super_admin) | ✅ ทำงาน |
| Admin Dashboard (alt) | `/admin-dashboard` | - | ✅ ทำงาน |

### ⚠️ ขาดเส้นทางชัดเจน (ควรเพิ่ม link ใน Admin Dashboard)

| หน้า | Path | แนะนำ |
|------|------|-------|
| Security | `/security` | เพิ่มปุ่ม "Security Settings" |
| Security Audit Logs | `/security/audit-logs` | เพิ่มปุ่ม "Audit Logs" |
| WebSocket Metrics | `/admin/websocket` | เพิ่มปุ่ม "WebSocket Monitor" |
| Fix RLS | `/admin/fix-rls` | เพิ่มปุ่ม "Fix Database RLS" |
| Broadcast | `/admin/broadcast` | เพิ่มปุ่ม "Send Broadcast" |

### 🚧 หน้าที่ควรมี (ยังไม่ได้สร้าง)

- `/admin/users` - จัดการผู้ใช้ทั้งหมด
- `/admin/clinics` - จัดการคลินิกทั้งหมด
- `/admin/settings` - ตั้งค่าระบบ

---

## 7. 📋 ONBOARDING PAGES

### ⚠️ ขาดเส้นทางชัดเจน

| หน้า | Path | แนะนำ |
|------|------|-------|
| Onboarding | `/onboarding` | เพิ่ม auto redirect หลัง register |
| Customer Onboarding | `/onboarding/customer` | เพิ่ม auto redirect สำหรับ customer ใหม่ |

---

## 📊 สรุปสถิติ

### จำนวนหน้าตามประเภท

| ประเภท | จำนวน | หมายเหตุ |
|--------|-------|----------|
| ✅ มีเส้นทางชัดเจน | 28 หน้า | ใช้งานได้ผ่าน menu |
| ⚠️ ขาดเส้นทางชัดเจน | 28 หน้า | สร้างแล้วแต่ไม่มี link |
| 🔧 หน้าทดสอบ/Demo | 22 หน้า | สำหรับ development |
| 🚧 หน้าที่ควรมี | ~12 หน้า | แนะนำให้สร้าง |

---

## 🎯 แผนการปรับปรุง (Priority)

### 🔴 Priority 1: เพิ่ม Navigation Links ใน Dashboard (สำคัญที่สุด)

#### Customer Dashboard (`/customer/dashboard`)
\`\`\`tsx
// เพิ่ม Quick Actions
<Card>
  <CardTitle>Quick Actions</CardTitle>
  <CardContent>
    <Button href="/booking">📅 Book Appointment</Button>
    <Button href="/analysis">🔍 Start Analysis</Button>
    <Button href="/analysis/history">📊 Analysis History</Button>
    <Button href="/treatment-plans">💊 Treatment Plans</Button>
    <Button href="/progress">📈 My Progress</Button>
  </CardContent>
</Card>
\`\`\`

#### Sales Dashboard (`/sales/dashboard`)
\`\`\`tsx
// เพิ่ม Navigation Menu
<nav>
  <Link href="/sales/leads">📋 All Leads</Link>
  <Link href="/sales/proposals">📄 Proposals</Link>
  <Link href="/marketing">📢 Marketing</Link>
  <Link href="/campaign-automation">🤖 Campaigns</Link>
  <Link href="/loyalty">🎁 Loyalty Program</Link>
</nav>
\`\`\`

#### Clinic Dashboard (`/clinic/dashboard`)
\`\`\`tsx
// เพิ่ม Management Menu
<nav>
  <Link href="/schedule">📅 Schedule</Link>
  <Link href="/queue/patient">👥 Queue</Link>
  <Link href="/reports">📊 Reports</Link>
  <Link href="/inventory">📦 Inventory</Link>
  <Link href="/branches">🏢 Branches</Link>
  <Link href="/chat">💬 Chat</Link>
  <Link href="/analytics">📈 Analytics</Link>
</nav>
\`\`\`

#### Admin Dashboard (`/admin`)
\`\`\`tsx
// เพิ่ม Admin Tools
<nav>
  <Link href="/admin/users">👥 Users</Link>
  <Link href="/admin/clinics">🏥 Clinics</Link>
  <Link href="/security">🔒 Security</Link>
  <Link href="/security/audit-logs">📜 Audit Logs</Link>
  <Link href="/admin/websocket">📡 WebSocket</Link>
  <Link href="/admin/fix-rls">🔧 Fix RLS</Link>
  <Link href="/admin/broadcast">📢 Broadcast</Link>
</nav>
\`\`\`

### 🟠 Priority 2: เพิ่ม Links ใน Header/Footer

#### Header (Public)
\`\`\`tsx
// เพิ่มใน navigation
<Link href="/beta-signup">🚀 Join Beta</Link>
<Link href="/demo">🎬 Watch Demo</Link>
\`\`\`

#### Footer
\`\`\`tsx
// เพิ่มใน Features section
<Link href="/ar-3d">AR 3D Visualization</Link>
<Link href="/ar-advanced">Advanced AR</Link>
<Link href="/ar-live">Live AR Try-On</Link>
<Link href="/product-viewer">Product Viewer</Link>

// เพิ่มใน Resources section
<Link href="/faq">FAQ</Link>
<Link href="/beta-signup">Join Beta</Link>
\`\`\`

### 🟡 Priority 3: จัดการหน้า Demo/Test

#### ควรซ่อน (ไม่ควรมี public link)
- ทุกหน้าที่ลงท้ายด้วย `-demo`
- ทุกหน้า `/test-*`
- `/worker-test`, `/mobile-test`
- `/phase1-validation`

#### ควร Redirect
- `/demo` → `/analysis` (ซ้ำกัน)
- `/dashboard` → role-based dashboard

### 🟢 Priority 4: สร้างหน้าใหม่ที่ขาดหายไป

1. `/sales/leads` - All Leads Management
2. `/sales/proposals` - Proposals Tracking
3. `/sales/performance` - Sales Performance Report
4. `/clinic/staff` - Staff Management
5. `/clinic/settings` - Clinic Settings
6. `/clinic/revenue` - Revenue Dashboard
7. `/customer/appointments` - Appointment History
8. `/customer/invoices` - Payment History
9. `/admin/users` - User Management
10. `/admin/clinics` - Clinic Management
11. `/admin/settings` - System Settings

---

## 🚨 ปัญหาที่พบและแนะนำแก้ไข

### 1. Homepage ไม่มี `/app/page.tsx`
- **ปัญหา**: Homepage อยู่ที่ `/app/[locale]/page.tsx` แต่ไม่มี `/app/page.tsx`
- **แก้ไข**: สร้าง `/app/page.tsx` ที่ redirect ไป `/[locale]` หรือใช้ middleware

### 2. หน้า Redirect ไม่จำเป็น
- `/sales/page.tsx` → redirect to `/sales/dashboard`
- `/clinic/page.tsx` → redirect to `/clinic/dashboard`
- **แนะนำ**: ใช้ middleware แทน ลบ page.tsx เหล่านี้ออก

### 3. หน้า Dashboard ซ้ำ
- มีทั้ง `/admin` และ `/admin-dashboard` ทำงานคล้ายกัน
- **แนะนำ**: เลือกใช้อันเดียว ลบอีกอันออก

### 4. Analysis Pages ไม่มี Link
- มีหน้า analysis เยอะมาก แต่ไม่มี navigation
- **แนะนำ**: สร้าง Analysis Hub Page ที่รวม link ทั้งหมด

### 5. AR Pages กระจัดกระจาย
- มี AR 3 หน้า (`ar-3d`, `ar-advanced`, `ar-live`) แต่ไม่มี link
- **แนะนำ**: สร้าง AR Hub Page หรือเพิ่ม tab ใน `/ar-simulator`

---

## ✅ Next Steps

1. **อ่านเอกสารนี้** ✓
2. **เพิ่ม Links ใน Customer Dashboard** → Priority 1
3. **เพิ่ม Links ใน Sales Dashboard** → Priority 1
4. **เพิ่ม Links ใน Clinic Dashboard** → Priority 1
5. **เพิ่ม Links ใน Admin Dashboard** → Priority 1
6. **อัพเดท Header/Footer** → Priority 2
7. **สร้างหน้าใหม่ที่ขาดหายไป** → Priority 4
8. **ทดสอบทุก Link** → Verify all navigation works

---

## 📎 Related Documents

- [USER_FLOWS.md](./USER_FLOWS.md) - User journeys และ test accounts
- [ROADMAP.md](../ROADMAP.md) - Development roadmap

---

**สร้างเมื่อ**: 5 พฤศจิกายน 2025  
**อัพเดทล่าสุด**: 5 พฤศจิกายน 2025  
**Version**: 1.0
