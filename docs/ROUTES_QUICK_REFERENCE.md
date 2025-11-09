# 🎯 Quick Routes Reference

สรุปเส้นทางหลักๆ แบบเข้าใจง่าย สำหรับดูอ้างอิงรวดเร็ว

---

## 🌐 Public (ไม่ต้อง Login)

```
/                    → หน้าแรก
/features            → ฟีเจอร์ทั้งหมด
/pricing             → ราคา
/contact             → ติดต่อเรา
/analysis            → วิเคราะห์ผิว (Demo)
/ar-simulator        → AR Simulator (Demo)
/auth/login          → Login
```

---

## 👤 Customer (ลูกค้าทั่วไป)

### Main Features
```
/dashboard           → Dashboard ลูกค้า
/profile             → โปรไฟล์
/analysis            → วิเคราะห์ผิวหน้า
/analysis/history    → ประวัติการวิเคราะห์
/analysis/results    → ผลการวิเคราะห์ล่าสุด
/booking             → จองนัดหมาย
/ai-chat             → ปรึกษา AI
/ar-simulator        → ทดลอง AR
```

---

## 🏥 Clinic Owner (เจ้าของคลินิก)

### Main Features
```
/clinic/dashboard    → Dashboard คลินิก
/branches            → จัดการสาขา ⭐ NEW
/customers           → จัดการลูกค้า
/clinic/staff        → จัดการพนักงาน
/analytics           → วิเคราะห์ข้อมูล
/inventory           → จัดการสต็อก
/reports             → รายงาน
/ai-chat             → AI Advisor
```

### Branch Management (สาขา)
```
/branches                    → รายการสาขา
/branches?clinic_id=xxx      → สาขาของคลินิกนี้
```

---

## 💼 Sales Staff (พนักงานขาย)

### Main Features
```
/sales/dashboard             → Dashboard Sales
/sales/leads                 → จัดการ Leads
/sales/proposals             → ใบเสนอราคา
/sales/performance           → ผลงาน
/sales/notes                 → บันทึกลูกค้า
```

### Mobile Sales Tools
```
/sales/wizard/[id]           → Sales Wizard (Mobile)
/sales/quick-scan            → Quick Scan
/sales/presentations         → งานนำเสนอ
/sales/presentation/[id]     → รายละเอียดงานนำเสนอ
```

---

## 🔧 Super Admin

### Main Features

```
/super-admin         → Super Admin Dashboard
/users               → จัดการผู้ใช้ทั้งหมด
/settings            → ตั้งค่าระบบ
```

### Admin Tools (Shared with Clinic Owner)

```
/admin               → Admin Dashboard
/admin/websocket     → WebSocket Monitor
/admin/broadcast     → Broadcast Messages
/admin/fix-rls       → Fix RLS Policies
```

**Note:** `/admin/*` routes accessible by both `super_admin` and `clinic_owner`

---

## 🔌 API Endpoints (สำคัญ)

### Analysis
```
POST /api/analyze                → วิเคราะห์ผิว
GET  /api/analysis/history       → ประวัติ
```

### Branches
```
GET    /api/branches             → รายการสาขา
POST   /api/branches             → สร้างสาขา
GET    /api/branches/[id]        → รายละเอียดสาขา
PATCH  /api/branches/[id]        → แก้ไขสาขา
DELETE /api/branches/[id]        → ลบสาขา
```

### Sales
```
GET  /api/sales/hot-leads        → Hot Leads
GET  /api/sales/metrics          → Sales Metrics
POST /api/sales/proposals        → สร้าง Proposal
```

### Auth
```
GET  /api/auth/check-role        → ตรวจสอบ Role
POST /api/auth/logout            → Logout
```

---

## 🎭 Role-Based Access

| Route | Owner | Admin | Staff | Sales | Customer | Super Admin |
|-------|-------|-------|-------|-------|----------|
| `/clinic/*` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/branches` | ✅ Full | ✅ Full | ✅ View | ❌ | ❌ | ❌ |
| `/sales/*` | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `/admin/*` | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/super-admin` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/dashboard` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/analysis/*` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🚀 Quick Navigation Map

```
Landing (/)
├── Features (/features)
├── Pricing (/pricing)
└── Login (/auth/login)
    │
    ├─── Customer Login
    │    └── Dashboard → Analysis → Booking → Profile
    │
    ├─── Clinic Owner Login
    │    └── Dashboard → Branches → Customers → Analytics → Admin Tools
    │
    ├─── Sales Staff Login
    │    └── Dashboard → Leads → Proposals → Performance
    │
    └─── Super Admin Login
         └── Dashboard → Tenants → Users → Settings → Admin Tools
```

---

## 🔒 Protected Routes (ต้อง Login)

```typescript
// Patterns ที่ Middleware ป้องกัน:
[
  "/clinic",          // clinic_owner, clinic_admin, clinic_staff
  "/branches",        // clinic_owner, clinic_admin, clinic_staff
  "/sales",           // sales_staff only
  "/admin",           // clinic_owner OR super_admin (shared)
  "/super-admin",     // super_admin only
  "/dashboard",       // All authenticated
  "/profile",         // All authenticated
  "/booking",         // All authenticated
  "/analysis/history" // All authenticated
]
```

---

## 🌍 Multi-language Support

```
/en/analysis    → English
/th/analysis    → ไทย
```

Default: Auto-detect or `/th/` (Thai)

---

## 📱 Mobile-Optimized Routes

```
/sales/wizard/[id]              → Sales Wizard
/sales/mobile-presentation/[id] → Mobile Presentation
/sales/quick-scan               → Quick Scan
/mobile-test                    → Mobile Test Page
```

---

## 🎪 Demo Routes

```
/demo                   → General Demo
/demo/ai                → AI Demo
/booking-demo           → Booking Demo
/ai-chat-demo           → AI Chat Demo
/progress-tracking-demo → Progress Tracking Demo
/pwa-demo               → PWA Demo
/i18n-demo              → i18n Demo
```

---

## ⚠️ Common Issues

### 1. **Redirect Loop**
```
Problem: Keeps redirecting to /auth/login
Solution: Check role in database matches required role
```

### 2. **403 Access Denied**
```
Problem: Can't access /clinic or /branches
Solution: User must have role: clinic_owner, clinic_admin, or clinic_staff
```

### 3. **404 Not Found**
```
Problem: Route doesn't exist
Solution: Check if route is under /[locale]/ prefix (e.g., /th/analysis)
```

---

## 📞 Need Help?

1. Check middleware: `lib/supabase/middleware.ts`
2. Check navigation: `components/header.tsx`
3. Check permissions: `hooks/useClinicContext.ts`
4. Full documentation: `docs/ROUTES_STRUCTURE.md`

---

**Last Updated:** November 9, 2025  
**Quick Access:** Keep this file open for fast reference!
