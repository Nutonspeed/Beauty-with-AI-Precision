# Supabase Storage Setup - Progress Photos

## คำแนะนำการสร้าง Storage Bucket

### 1. เข้า Supabase Dashboard
1. ไปที่ https://supabase.com/dashboard
2. เลือกโปรเจค AI367Bar
3. คลิกเมนู **Storage** ทางซ้ายมือ

### 2. สร้าง Bucket ใหม่
1. คลิกปุ่ม **New bucket**
2. ตั้งค่าดังนี้:
   - **Name**: `progress-photos`
   - **Public bucket**: ✅ (เปิด - เพื่อให้เข้าถึงรูปได้จาก URL)
   - **File size limit**: 10 MB (เพียงพอสำหรับรูปถ่ายคุณภาพสูง)
   - **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`
3. คลิก **Create bucket**

### 3. ตั้งค่า Access Policies (RLS - Row Level Security)

ไปที่แท็บ **Policies** ของ bucket `progress-photos` แล้วเพิ่ม policies ดังนี้:

#### Policy 1: Public Read Access (อ่านได้ทุกคน)
\`\`\`sql
-- ชื่อ Policy: "Public read access for progress photos"
-- Operation: SELECT
CREATE POLICY "Public read access for progress photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'progress-photos');
\`\`\`

#### Policy 2: Authenticated Upload (อัปโหลดได้เฉพาะคนที่ล็อกอิน)
\`\`\`sql
-- ชื่อ Policy: "Authenticated users can upload progress photos"
-- Operation: INSERT
CREATE POLICY "Authenticated users can upload progress photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'progress-photos');
\`\`\`

#### Policy 3: Owner Delete (ลบได้เฉพาะเจ้าของ)
\`\`\`sql
-- ชื่อ Policy: "Users can delete their own progress photos"
-- Operation: DELETE
CREATE POLICY "Users can delete their own progress photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
\`\`\`

### 4. ตรวจสอบว่า Bucket พร้อมใช้งาน

ลองอัปโหลดรูปทดสอบ:
1. คลิกเข้า bucket `progress-photos`
2. คลิก **Upload file**
3. เลือกรูปภาพทดสอบ
4. ตรวจสอบว่ามี URL สาธารณะที่เข้าถึงได้

URL ควรมีรูปแบบ:
\`\`\`
https://[YOUR_PROJECT_ID].supabase.co/storage/v1/object/public/progress-photos/[FILE_PATH]
\`\`\`

### 5. การใช้งานใน Code

API Route สำหรับอัปโหลดรูปอยู่ที่ `app/api/progress/photos/route.ts`:

\`\`\`typescript
// อัปโหลดรูป
const formData = new FormData();
formData.append('file', file);
formData.append('customerId', customerId);
formData.append('type', 'baseline' | 'progress');

const response = await fetch('/api/progress/photos', {
  method: 'POST',
  body: formData
});
\`\`\`

รูปจะถูกเก็บใน path:
\`\`\`
progress-photos/
  └── [customerId]/
      ├── baseline_[timestamp].jpg
      └── progress_[timestamp].jpg
\`\`\`

### 6. ข้อควรระวัง

⚠️ **Security Considerations:**
- Bucket เป็น public เพื่อให้แสดงรูปใน UI ได้
- RLS policies จำกัดการอัปโหลด/ลบให้เฉพาะผู้ใช้ที่ล็อกอินแล้ว
- ควรใช้ `auth.uid()` เช็คว่าเป็นเจ้าของรูปหรือ staff ที่มีสิทธิ์เท่านั้น

⚠️ **File Size & Performance:**
- ควร resize รูปก่อนอัปโหลด (max 1920x1080)
- Compress ด้วย quality 85-90% เพื่อลด storage cost
- MediaPipe landmarks ทำงานได้ดีกับรูป 640x480 ขึ้นไป

## เสร็จแล้ว! 🎉

หลังจากตั้งค่า bucket เสร็จแล้ว สามารถทดสอบฟีเจอร์ Progress Tracking ได้ที่:
- **หน้า UI**: http://localhost:3000/progress
- **Test API**: ใช้ Postman หรือ curl ทดสอบ `/api/progress/photos`

---

**Note:** ถ้ามี error "Bucket not found" ให้ตรวจสอบว่า:
1. ชื่อ bucket เป็น `progress-photos` (lowercase, มี dash)
2. Bucket เปิดเป็น Public
3. RLS policies ถูกต้อง
