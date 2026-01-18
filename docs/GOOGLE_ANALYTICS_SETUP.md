# Google Analytics 4 Setup Guide

## 1. สร้าง Google Analytics Account

1. ไปที่: https://analytics.google.com/
2. คลิก "Start measuring"
3. สร้าง Account name: "CenterIQ AI"
4. สร้าง Property name: "Beauty AI Platform"
5. เลือก Business information:
   - Industry: Health
   - Business size: Small
6. เลือก Business objectives:
   - Generate leads
   - Analyze user behavior
   - Improve marketing

## 2. รับ Measurement ID

หลังสร้าง property แล้ว:
1. ไปที่ Admin (⚙️) > Data Streams
2. คลิก Web stream ที่สร้างไว้
3. Copy **Measurement ID** (format: G-XXXXXXXXXX)

## 3. เพิ่ม Environment Variable ใน Vercel

1. ไปที่: https://vercel.com/dashboard
2. เลือก Project: beauty-with-ai-precision
3. Settings > Environment Variables
4. เพิ่ม:
   ```
   Name: NEXT_PUBLIC_GA_MEASUREMENT_ID
   Value: G-XXXXXXXXXX (ใส่ ID จริงจาก GA4)
   Environment: Production, Preview, Development
   ```
5. คลิก Save

## 4. Redeploy เพื่อใช้งาน

```bash
vercel --prod
```

## 5. ทดสอบ

1. เปิด Production site
2. เปิด Browser DevTools > Network
3. หา request ไปที่ `googletagmanager.com`
4. ถ้าเจอ = setup สำเร็จ

## Events ที่ track อัตโนมัติ:

- `page_view` - ทุกครั้งที่เปลี่ยนหน้า
- `click_cta` - คลิกปุ่ม CTA
- `watch_video` - ดู video demo
- `submit_form` - ส่งฟอร์ม
- `start_trial` - เริ่มทดลองใช้
- `purchase` - ซื้อ plan
- `scroll` - scroll depth
- `use_feature` - ใช้ฟีเจอร์ต่างๆ

## Dashboard Reports ที่แนะนำ:

1. **Acquisition** - ดูว่า traffic มาจากไหน
2. **Engagement** - ดู page views, session duration
3. **Conversions** - track trial starts, purchases
4. **User Explorer** - ดู individual user journeys

## Tips:

- รอ 24-48 ชั่วโมงเพื่อให้ data เริ่มแสดง
- ใช้ GA4 DebugView เพื่อ real-time testing
- Setup Goals/Conversions สำหรับ business KPIs
- Link กับ Google Ads ถ้าใช้ advertising
