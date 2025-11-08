# System Audit – November 2025

## 1. เส้นทางหลักที่ใช้งานจริง (คงไว้)

| Flow | เส้นทางหลัก | โมดูล/Hook สำคัญ | หมายเหตุ |
| --- | --- | --- | --- |
| Super Admin | `app/super-admin` | `lib/admin/admin-manager.ts`, `hooks/useAdmin.ts` | ดูแลระบบทั้งหมด, ใช้ข้อมูล Supabase โดยตรง |
| Clinic Operations | `app/clinic`, `app/booking`, `app/inventory` | `lib/admin/admin-manager.ts`, `lib/booking/booking-manager.ts`, `hooks/useBooking.ts` | ต้องใช้ข้อมูลลูกค้า/การนัดหมายจริง |
| Sales & CRM | `app/sales`, `app/chat`, `app/notifications` | `components/sales/*`, `hooks/useSales?` (ผ่าน `useChat`/`useNotification`) | เชื่อมต่อรีลไทม์/คิวลูกค้า |
| Customer Portal | `app/dashboard`, `app/profile`, `app/analysis` | `lib/ai/*`, `lib/auth/*`, `hooks/useAI.ts` | ใช้ AI analysis + experience จริง |
| Authentication | `app/auth/login` + Context | `lib/auth/context.tsx`, `providers/*` | มี demo accounts 4 บทบาท |

ข้อควรระวัง: Flow เหล่านี้เป็นแกนของระบบ ควรกันไม่ให้ลบ/ย้ายโดยไม่ทบทวนการบูรณาการกับ Supabase และ context provider เสมอ

---

## 2. ส่วนที่ซ้ำหรือทดลอง (ควรรวม/ย้าย/ลบ)

| กลุ่ม | ไดเรกทอรี/ไฟล์ | สถานะปัจจุบัน | ข้อเสนอ |
| --- | --- | --- | --- |
| AI Playground | `app/ai-chat`, `app/ai-chat-demo`, `app/ai-recommender-demo`, `app/ai-test`, `app/test-ai*`, `components/ai-chat-assistant.tsx` | ใช้ชุดคอมโพเนนต์เดียวกัน ต่างกันเพียง UI | รวมเป็นเพจเดียว (Production + Playground toggle) แล้วลบ route ที่ซ้ำ |
| AR Experiences | `app/ar-3d`, `app/ar-advanced`, `app/ar-live`, `app/ar-simulator`, `components/ar/*`, `components/ar-visualization.tsx` | ฟีเจอร์ซ้ำ (3D viewer, before/after) | รวมเป็น route เดียวที่มีโหมด, ย้าย demo อื่นไป docs/storybook |
| Queue/Presence Demo | `app/queue`, `app/presence`, `app/progress*`, `components/queue/*`, `components/presence/*` | จำลองข้อมูล ไม่ได้เชื่อม Supabase | พิจารณาย้ายไป `demo/` หรือ archive หรือเชื่อมจริงก่อนเก็บ |
| Commerce Demo | `app/shop-demo`, `app/demo`, `components/shopping-cart.tsx`, `components/order-history.tsx` | เนื้อหาไม่สัมพันธ์กับคลินิก | ลบทิ้งหรือย้ายไป docs/archive ถ้ายังต้องเก็บตัวอย่าง |
| Error Boundary | `components/error-boundary.tsx` (เก่า) vs `components/error-boundary/ai-error-boundary.tsx` (ใหม่) | โค้ดสองชุด คงเหลือใช้งานชุดใหม่ | ลบไฟล์เก่าหรือรวม logic เข้าไฟล์เดียว |
| Header/Footer | `components/header.tsx`, `components/header-old.tsx`, `components/footer.tsx`, `components/footer-old.tsx` | มีเวอร์ชันเก่าไม่ได้ใช้ | ตรวจการใช้งานจริง แล้วลบทิ้งเวอร์ชันเก่า |

---

## 3. Hook และ Manager ที่มีความเสี่ยงซ้ำซ้อน

- โฟลเดอร์ `hooks/` มีชื่อซ้ำต่างรูปแบบ เช่น `use-chat.ts` (kebab) และ `useChat.ts` (camel) ควรตรวจว่าใช้อันไหนจริงแล้วลบอีกอันเพื่อป้องกันสับสน
- Hook หลายตัวโยงกับ manager ที่ยังไม่เชื่อมฐานข้อมูลจริง เช่น `useQueue.ts`, `useProgressTracking.ts`; ต้องตัดสินใจว่าจะพัฒนาต่อหรือย้ายไปส่วน demo
- Manager ที่เชื่อม Supabase จริง: `lib/admin/admin-manager.ts`, `lib/booking/booking-manager.ts`, `lib/presence-manager.ts`; ต้องทบทวน schema ให้ตรงกับฐาน (เช่น เปลี่ยนเป็นคำว่าลูกค้าแล้ว)

---

## 4. สคริปต์และ Migration ที่ซ้ำ

- `supabase/inspect-database.sql`, `supabase/check_existing_tables.sql`, `supabase/check-existing-tables.sql` ให้ผลคล้ายกัน → ควรเก็บไฟล์เดียวที่เป็นมาตรฐาน
- โฟลเดอร์ `supabase/migrations/manual/` มีหลายไฟล์ที่ทับกับ migration อัตโนมัติ (เช่น batch_1-4). หาก production ใช้แค่ migration timestamp ให้ archive manual scripts
- โฟลเดอร์ `scripts/` มีไฟล์เก่าหลายตัว (`002_create_enhanced_analysis_tables.sql`, `supabase-migration.sql`) ที่รวมอยู่ใน migration ชุดใหม่แล้ว → ย้ายไป `scripts/archive/`

---

## 5. เอกสารที่ต้องจัดระเบียบ

- เอกสารหลักที่ใหม่: `README.md`, `ROADMAP.md`, `ARCHITECTURE.md`, `DEPLOYMENT_GUIDE.md`, `USER_GUIDE.md`
- เอกสารเก่า/ซ้ำ: `docs/archive/**`, `docs/phases/**`, `docs/WORKFLOW.md` (บางส่วนอัพเดตไม่ทัน) → ให้ใส่ป้าย `Deprecated` ชัดเจนหรือย้ายไป subfolder `legacy`
- ควรเพิ่มไฟล์สรุปเส้นทาง production และรายชื่อ demo หลังจากลดระบบ เพื่อให้ onboarding ทีมง่ายขึ้น

---

## 6. ขั้นตอนถัดไปที่แนะนำ

1. **ยืนยันรายการ flow production**: ล็อกไว้ใน docs ว่าต้องคงอยู่ และกำหนดเจ้าของโมดูล
2. **ลบ/รวมเพจ Playground**: เริ่มจากกลุ่ม AI และ AR → ตรวจการ import → ปรับ redirect/เมนูให้เหลือเส้นทางเดียว
3. **ทำความสะอาด hooks**: ค้นหา import จริง, ลบไฟล์ซ้ำ, ตั้ง naming convention เดียว (kebab หรือ camel)
4. **จัดระเบียบสคริปต์/migration**: สร้างโฟลเดอร์ `scripts/archive/2025-legacy` แล้วย้ายไฟล์ที่ไม่เรียกใช้ใน CI
5. **อัปเดตเอกสาร**: แก้ README/ROADMAP ให้สะท้อนโครงสร้างใหม่, เพิ่มหมวด “Lab/Demo Features” ถ้ายังต้องเก็บ
6. **ทดสอบระบบหลังลบ**: รัน `pnpm test`, `pnpm build`, และ smoke test เส้นทางหลัก 4 บทบาท

---

## 7. หมายเหตุ

- ก่อนลบไฟล์ใด ต้องตรวจ `git grep` หรือ `pnpm lint` เพื่อยืนยันว่าไม่มีการ import
- ให้เก็บ commit ละกลุ่ม (เช่น commit ลบ AI playground, commit รวม AR) เพื่อ review ง่าย
- ถ้าพบเพจที่ยังต้องใช้สำหรับการขาย/ดีโม ควรย้ายไป `app/demo/` แล้วจัดการ routing ให้ไม่ปะปนกับ production
