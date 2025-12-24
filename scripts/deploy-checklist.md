# Staging Deployment Checklist

## 1. Database Migration
- [ ] เปิด Supabase Dashboard: https://supabase.com/dashboard
- [ ] เลือก project Beauty-with-AI-Precision
- [ ] ไปที่ SQL Editor
- [ ] คัดลอกและรัน migration: `supabase/migrations/20250127_staging_schema_fixes.sql`
- [ ] ตรวจสอบว่า migration รันสำเร็จ (จะขึ้น ✅ ที่ด้านล่าง)

## 2. Vercel Environment Variables
- [ ] เปิด Vercel Dashboard: https://vercel.com/dashboard
- [ ] เลือก project Beauty-with-AI-Precision
- [ ] ไปที่ Settings → Environment Variables
- [ ] ตรวจสอบว่ามีตัวแปรเหล่านี้:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_JWT_SECRET`
  - `DATABASE_URL`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL` (ตั้งเป็น staging URL)

## 3. Deploy Application
- [ ] ใน Vercel Dashboard คลิก "Deployments"
- [ ] คลิก "Redeploy" หรือ "Deploy" ที่ commit ล่าสุด
- [ ] รอให้ build เสร็จ (ประมาณ 5-10 นาที)
- [ ] ตรวจสอบว่า deploy สำเร็จ (สีเขียว)

## 4. Post-Deploy Tests
- [ ] เปิด staging URL
- [ ] ทดสอบล็อกอิน demo accounts:
  - super_admin@beautyclinic.com / password123
  - admin@beautyclinic.com / password123
  - customer@example.com / password123
- [ ] ทดสอบการจองนัด
- [ ] ทดสอบสร้างใบแจ้งหนี้
- [ ] ทดสอบการชำระเงิน

## 5. Final Verification
- [ ] ตรวจสอบ Vercel logs ไม่มี error
- [ ] ตรวจสอบ Supabase logs ไม่มี error
- [ ] ทดสอบ API endpoints ทำงานได้
- [ ] ทดสอบ RLS policies ป้องกันข้อมูล

## 6. Documentation
- [ ] อัปเดต staging URL ใน README
- [ ] บันทึกข้อมูลการทดสอบ
- [ ] สรุปปัญหาที่พบ (ถ้ามี)
