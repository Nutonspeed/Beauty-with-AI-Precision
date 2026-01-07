# 📊 Health Monitoring Dashboard - User Guide

**ClinicIQ Database Health Monitoring System**

---

## 🎯 Overview

Health Monitoring Dashboard เป็นระบบตรวจสอบสุขภาพของ database แบบ real-time ช่วยให้คุณ:
- ✅ ตรวจสอบสถานะ database ได้ทันที
- ✅ เห็น metrics สำคัญทั้งหมดในที่เดียว
- ✅ รับการแจ้งเตือนเมื่อมีปัญหา
- ✅ Monitor performance ระยะยาว

---

## 🚀 Quick Start

### เข้าถึง Dashboard

**URL**: `/th/admin/health` หรือ `/en/admin/health`

**สิทธิ์**: Super Admin หรือ Database Administrator เท่านั้น

### ติดตั้ง (ถ้ายังไม่มี)

Dashboard ถูกสร้างไว้ให้แล้ว! แค่เข้า URL ข้างบนได้เลย

---

## 📊 Dashboard Components

### 1. Overall Status Card 🎯

แสดงสถานะโดยรวมของ database:

```
✅ Healthy - ทุกอย่างปกติ
⚠️ Needs Attention - มีปัญหาเล็กน้อย
❌ Critical - มีปัญหาร้ายแรง
```

**Metrics:**
- **Database Size**: ขนาดฐานข้อมูลปัจจุบัน
- **Foreign Keys**: จำนวน FK constraints ทั้งหมด
- **Indexes**: จำนวน indexes สำหรับ performance
- **Status**: สถานะการทำงาน (Active/Inactive)

---

### 2. Health Checks Grid ✅

6 การตรวจสอบหลัก:

#### a) Foreign Keys 🔗
- **ความหมาย**: ความสัมพันธ์ระหว่างตาราง
- **ดี**: มี 180+ FKs
- **ผิดปกติ**: น้อยกว่า 180

#### b) Indexes ⚡
- **ความหมาย**: ดัชนีสำหรับเพิ่มความเร็ว
- **ดี**: มี 430+ indexes
- **ผิดปกติ**: น้อยกว่า 400

#### c) Orphaned Analyses 🔍
- **ความหมาย**: วิเคราะห์ที่ไม่มี user_id ถูกต้อง
- **ดี**: 0 orphaned records
- **ผิดปกติ**: > 0 (ต้องแก้ไข)

#### d) Orphaned Leads 👤
- **ความหมาย**: ลีดที่ไม่มี customer_user_id ถูกต้อง
- **ดี**: 0 orphaned records
- **ผิดปกติ**: > 0 (ต้องแก้ไข)

#### e) Duplicate Invitations 📧
- **ความหมาย**: คำเชิญที่ซ้ำกันในระบบ
- **ดี**: 0 duplicates
- **ผิดปกติ**: > 0 (ควรลบ)

#### f) Invalid User Refs ⚠️
- **ความหมาย**: การอ้างอิง user ที่ไม่ถูกต้อง
- **ดี**: 0 invalid refs
- **ผิดปกติ**: > 0 (ต้องแก้ไข)

---

### 3. Table Counts 📈

จำนวนข้อมูลในตารางสำคัญ:

| ตาราง | ความหมาย |
|-------|----------|
| **Users** | ผู้ใช้ทั้งหมด (รวม customers) |
| **Clinics** | คลินิกในระบบ |
| **Invitations** | คำเชิญที่ส่งไปแล้ว |
| **Sales Leads** | ลีดของฝ่ายขาย |
| **Appointments** | นัดหมายทั้งหมด |
| **Skin Analyses** | การวิเคราะห์ผิว |

---

### 4. Recommendations ⚡

ถ้ามีปัญหา dashboard จะแสดงคำแนะนำ:
- 🟡 ปัญหาที่พบ
- 🔧 วิธีแก้ไข
- 📝 ขั้นตอนดำเนินการ

---

## 🔄 Auto-Refresh

Dashboard รีเฟรชข้อมูลอัตโนมัติทุก **60 วินาที**

**รีเฟรชด้วยตัวเอง:**
กดปุ่ม "รีเฟรช" มุมบนขวา

---

## 🎨 Status Colors

### Green (เขียว) - Healthy ✅
```
สถานะ: ปกติ
การกระทำ: ไม่ต้องทำอะไร
```

### Yellow (เหลือง) - Needs Attention ⚠️
```
สถานะ: มีปัญหาเล็กน้อย
การกระทำ: ตรวจสอบและแก้ไข
```

### Red (แดง) - Critical ❌
```
สถานะ: มีปัญหาร้ายแรง
การกระทำ: แก้ไขทันที!
```

---

## 🔧 API Endpoint

### GET `/api/health/database`

**Response:**
```json
{
  "success": true,
  "timestamp": "2025-12-26T05:00:00Z",
  "health": {
    "health_status": "healthy",
    "database_size": "30 MB",
    "checks": {
      "foreign_keys": {"count": 180, "status": "ok"},
      "indexes": {"count": 434, "status": "ok"},
      "orphaned_analyses": {"count": 0, "status": "ok"},
      "orphaned_leads": {"count": 0, "status": "ok"},
      "duplicate_invitations": {"count": 0, "status": "ok"},
      "invalid_user_refs": {"count": 0, "status": "ok"}
    },
    "table_counts": {
      "users": 13,
      "clinics": 3,
      "invitations": 7,
      "sales_leads": 6,
      "appointments": 0,
      "skin_analyses": 30
    }
  }
}
```

**HTTP Status:**
- `200` - Healthy
- `503` - Needs attention or critical

---

## 🚨 Troubleshooting

### Issue 1: Dashboard ไม่โหลด
**Solution:**
```bash
# ตรวจสอบ API endpoint
curl http://localhost:3000/api/health/database

# ตรวจสอบ logs
npm run dev
```

### Issue 2: Health Status = "needs_attention"
**Solution:**
1. ดูที่ Recommendations card
2. รัน health check script:
   ```sql
   SELECT check_database_health();
   ```
3. แก้ไขตามคำแนะนำ

### Issue 3: Orphaned Records พบแล้ว
**Solution:**
```sql
-- ดู orphaned records
SELECT * FROM skin_analyses sa
LEFT JOIN users u ON sa.user_id = u.id
WHERE u.id IS NULL;

-- แก้ไข (ระวัง!)
-- ควรปรึกษาทีมก่อน
```

---

## 📈 Best Practices

### 1. ตรวจสอบทุกวัน
- เปิด dashboard ทุกเช้า
- ตรวจสอบว่า status = healthy
- ดู table counts ว่าเพิ่มขึ้นปกติไหม

### 2. รีเฟรชเมื่อทำการเปลี่ยนแปลง
- หลัง migration
- หลังลบข้อมูล
- หลังเพิ่ม FK หรือ index

### 3. Alert เมื่อพบปัญหา
- สถานะ needs_attention หรือ critical
- Orphaned records > 0
- Invalid references > 0

### 4. บันทึก metrics
- Screenshot dashboard ทุกสัปดาห์
- เก็บ history ของ table counts
- Track database size growth

---

## 🔐 Security

**Access Control:**
- ต้อง login เป็น Super Admin
- ใช้ service role key สำหรับ API
- ข้อมูล sensitive ถูก hide

**Data Privacy:**
- ไม่แสดงข้อมูลส่วนตัว
- แสดงแค่ metrics และ counts
- RLS policies ทำงานตามปกติ

---

## 🎯 Use Cases

### Use Case 1: Daily Health Check
```
1. เปิด dashboard
2. ตรวจสอบ overall status = healthy
3. ดู table counts ว่าปกติไหม
4. ถ้าเจอ warning → แก้ไขทันที
```

### Use Case 2: After Migration
```
1. รัน migration
2. รีเฟรช dashboard
3. ตรวจสอบ orphaned records = 0
4. ตรวจสอบ foreign keys count
5. ตรวจสอบ table counts
```

### Use Case 3: Performance Monitoring
```
1. บันทึก database size
2. ติดตาม growth rate
3. วางแผน scaling
4. Optimize ถ้าจำเป็น
```

### Use Case 4: Debugging
```
1. User รายงานปัญหา
2. เช็ค health status
3. ดู orphaned records
4. ดู invalid references
5. แก้ไขตาม findings
```

---

## 📚 Related Documentation

- `DATABASE_ERD.md` - ER Diagram ของระบบ
- `DATABASE_SCHEMA_QUICK_REFERENCE.md` - Schema reference
- `API_TEST_RESULTS.md` - ผลการทดสอบ API
- `CUSTOMERS_MIGRATION_REPORT.md` - การ migrate customers
- `check-database-health.sql` - SQL script สำหรับ manual check

---

## 🔄 Automated Monitoring (Advanced)

### Setup Cron Job
```bash
# ทุก 1 ชั่วโมง
0 * * * * curl http://localhost:3000/api/health/database > /var/log/health.log
```

### Setup Alerts (Example)
```typescript
// alert-service.ts
const health = await fetch('/api/health/database');
const data = await health.json();

if (data.health.health_status !== 'healthy') {
  await sendSlackAlert(`⚠️ Database needs attention!`);
}
```

### Integration with Monitoring Tools
- **Grafana**: Import health metrics
- **Datadog**: Send health status
- **PagerDuty**: Alert on critical status

---

## 🎓 FAQ

### Q: Dashboard ต้อง login ไหม?
**A:** ใช่ ต้อง login เป็น Super Admin เท่านั้น

### Q: Refresh ทุกกี่นาที?
**A:** Auto-refresh ทุก 60 วินาที หรือกดปุ่มรีเฟรชได้

### Q: API endpoint เรียกได้โดยตรงไหม?
**A:** ใช่ `/api/health/database` แต่ต้องมี service role key

### Q: ข้อมูล real-time ไหม?
**A:** ใช่ query จาก database โดยตรง ไม่มี cache

### Q: สามารถ export ข้อมูลได้ไหม?
**A:** API response เป็น JSON สามารถ export ได้

---

## ✨ Future Enhancements

**Planned:**
- 📊 Historical graphs
- 📧 Email alerts
- 📱 Mobile app
- 🤖 AI-powered anomaly detection
- 📈 Performance trend analysis

---

**Created**: December 26, 2025  
**Version**: 1.0  
**Maintained By**: Development Team  
**Last Updated**: December 26, 2025 05:00 AM UTC+7
