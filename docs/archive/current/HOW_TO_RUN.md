# ⚡ วิธีรันโปรเจค (อัพเดท 10 พฤศจิกายน 2025)

## 🚀 Quick Start (Working Solution)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. รัน Development Server
```bash
npm run dev
```

**หมายเหตุ:** ใช้ `npm` แทน `pnpm` เพราะ pnpm มี compatibility issues

### 3. เปิดเว็บไซต์
```
http://localhost:3000
```

---

## 📋 Scripts ที่ใช้บ่อย

### Development
```bash
npm run dev          # รัน dev server (แนะนำ)
npm run dev:turbo    # รัน dev server ด้วย Turbopack (ถ้า dev ไม่ได้)
```

### Build & Production
```bash
npm run build        # Build production
npm run start        # รัน production server
npm run prod:build   # Build ด้วย NODE_ENV=production
npm run prod:start   # รัน production ด้วย NODE_ENV=production
```

### Testing
```bash
npm run test         # รัน unit tests (Vitest)
npm run test:e2e     # รัน E2E tests (Playwright)
npm run test:ui      # เปิด Vitest UI
```

### Code Quality
```bash
npm run lint         # ตรวจสอบ code quality
npm run lint:fix     # แก้ไข lint errors อัตโนมัติ
npm run type-check   # ตรวจสอบ TypeScript errors
```

### Database & Verification
```bash
npm run check:db     # ตรวจสอบการเชื่อมต่อ database
npm run verify       # ตรวจสอบความพร้อม deployment
```

---

## 🔧 ปัญหาที่พบบ่อยและวิธีแก้

### 1. Dev Server ไม่รัน
**อาการ:** `pnpm dev` หรือ `npm run dev:turbo` crash

**วิธีแก้:**
```bash
npm run dev
```

### 2. Port 3000 ถูกใช้แล้ว
**วิธีแก้:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# หรือเปลี่ยน port
PORT=3001 npm run dev
```

### 3. Dependencies Conflict
**วิธีแก้:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📦 Package Manager

**ใช้:** npm (แทน pnpm)  
**เหตุผล:** pnpm มี compatibility issues กับ Next.js 16 + Turbopack

---

## 🌍 Environment Variables

สร้างไฟล์ `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# AI Services
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000
HUGGINGFACE_API_KEY=your_hf_key
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🐍 Python AI Service (Optional)

ถ้าต้องการใช้ Python AI service:

```bash
cd ai-service
pip install -r requirements.txt
python main.py
```

AI service จะรันที่: `http://localhost:8000`

---

## ✅ ตรวจสอบว่าทุกอย่างทำงาน

```bash
# 1. ตรวจสอบ TypeScript
npm run type-check

# 2. ตรวจสอบ database
npm run check:db

# 3. รัน tests
npm run test

# 4. ตรวจสอบ deployment readiness
npm run verify
```

---

## 📚 เอกสารเพิ่มเติม

- **สถานะโปรเจค:** `CURRENT_PROJECT_STATUS_REALITY.md`
- **สถาปัตยกรรม:** `SYSTEM_ARCHITECTURE_REALITY.md`
- **API Docs:** `API_DOCUMENTATION_REALITY.md`
- **User Journeys:** `USER_JOURNEYS_INTEGRATION_REALITY.md`
- **Forward Plan:** `FORWARD_PLAN_REALITY.md`

---

**Last Updated:** 10 พฤศจิกายน 2025  
**Status:** ✅ Working (ใช้ npm แทน pnpm)