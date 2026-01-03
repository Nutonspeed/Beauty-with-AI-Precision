# 🧪 Test Suite - Beauty-with-AI-Precision

## 📁 Test Structure

### ✅ **Active Tests (ใช้งานจริง)**
```
__tests__/
├── e2e/                          # E2E Tests ใหม่ (ครอบคลุมทั้งระบบ)
│   ├── dashboard/                # Dashboard Tests
│   │   ├── super-admin.spec.ts
│   │   ├── clinic-owner.spec.ts
│   │   ├── sales-dashboard.spec.ts
│   │   └── customer-dashboard.spec.ts
│   ├── features/                 # Feature Tests
│   │   ├── auth-authorization.spec.ts
│   │   ├── ai-skin-analysis.spec.ts
│   │   ├── ar-simulator.spec.ts
│   │   ├── multi-language.spec.ts
│   │   ├── realtime-features.spec.ts
│   │   └── mobile-responsiveness.spec.ts
│   ├── test-setup.ts            # Test configuration
│   ├── test-runner.ts            # Test runner script
│   ├── fixtures/                 # Test data
│   ├── assets/                   # Test images
│   └── utils/                    # Test utilities
├── unit/                         # Unit Tests
├── helpers/                      # Helper functions
└── utils/                        # Utility functions
```

### 📦 **Archived Tests (เก่า/ไม่ใช้)**
```
__tests__/archive/                # Test เก่า ๆ ทั้งหมด (51 ไฟล์)
├── *.test.ts                     # Unit tests เก่า
├── *.spec.ts                     # E2E tests เก่า
├── comprehensive/                # Comprehensive tests เก่า
└── pages/                        # Page tests เก่า
```

## 🚀 **วิธีการรัน Tests**

### **E2E Tests (ใหม่ - ครอบคลุมทั้งระบบ)**
```bash
# รันทุก test suite พร้อมรายงาน
pnpm test:e2e:all

# รัน test แยกตามประเภท
pnpm test:e2e:auth          # Authentication & Authorization
pnpm test:e2e:dashboard     # All Dashboards
pnpm test:e2e:ai            # AI Skin Analysis
pnpm test:e2e:ar            # AR Simulator
pnpm test:e2e:mobile        # Mobile Responsiveness
pnpm test:e2e:lang          # Multi-language Support
pnpm test:e2e:realtime      # Real-time Features

# รันแบบ debug/UI
pnpm test:e2e:debug
pnpm test:e2e:ui

# รันแบบปกติ
pnpm test:e2e
```

### **Unit Tests**
```bash
pnpm test                    # รัน unit tests
pnpm test:run              # รันครั้งเดียว
pnpm test:coverage         # รันพร้อม coverage
```

## 📊 **Coverage ของ Test Suite ใหม่**

### ✅ **ครอบคลุมทั้งระบบ:**
- **ทุก Dashboard** (Super Admin, Clinic Owner, Sales, Customer)
- **ทุก Role** (Authentication & Authorization)
- **ทุก Device** (Mobile, Tablet, Desktop)
- **ทุกภาษา** (ไทย, อังกฤษ, จีน)
- **AI Features** (Skin Analysis, AR Simulator)
- **Real-time** (Chat, Video, Notifications)
- **User Flows** ทั้งหมด

### 🎯 **Test Suites ทั้งหมด (10 ชุด):**
1. **Super Admin Dashboard** - จัดการคลินิก, ผู้ใช้, การตั้งค่า
2. **Clinic Owner Dashboard** - จัดการนัดหมาย, ผู้ป่วย, พนักงาน
3. **Sales Dashboard** - จัดการ leads, quick scan, proposals
4. **Customer Dashboard** - นัดหมาย, skin analysis, treatment history
5. **AI Skin Analysis** - การวิเคราะห์ผิวหนัง, บันทึกผลลัพธ์
6. **AR Simulator 3D** - AR treatment simulator, 3D interaction
7. **Authentication & Authorization** - Login, role-based access
8. **Multi-language Support** - ภาษาไทย/อังกฤษ/จีน
9. **Real-time Features** - Chat, video call, notifications
10. **Mobile Responsiveness** - ทุกขนาดหน้าจอ

## 🗂️ **การจัดการ Test เก่า**

### **ที่เก็บไว้ใน archive:**
- Unit tests ที่ไม่เกี่ยวข้องกับ feature ปัจจุบัน
- E2E tests ที่ซ้ำซ้อนกับ test suite ใหม่
- Integration tests ที่ไม่ได้ใช้แล้ว
- Performance tests ที่ล้าสมัย

### **สามารถกู้คืนได้:**
ถ้าต้องการใช้ test เก่า สามารถย้ายจาก `archive/` กลับมาได้

## 🔧 **การตั้งค่า Environment**

### **ต้องการ:**
- Dev server ทำงานที่ `http://localhost:3004`
- Test users ใน database
- Test images ใน `__tests__/e2e/assets/`

### **Environment Variables:**
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
```

## 📈 **Reporting**

Test runner จะสร้างรายงาน:
- **HTML Report**: `test-results/e2e-test-report.html`
- **JSON Report**: `test-results/test-results.json`
- **JUnit Report**: `test-results/junit-results.xml`

## 🎯 **Best Practices**

1. **รัน test:e2e:all** ก่อน deploy
2. **ตรวจสอบ test results** ใน report
3. **ใช้ test:e2e:debug** สำหรับ debugging
4. **เก็บ test data** ให้เป็นระเบียบ
5. **อัปเดต tests** เมื่อมีการเปลี่ยนแปลง features

---

**🎉 Test suite ใหม่พร้อมใช้งานครอบคลุมทั้งระบบแล้ว!**
