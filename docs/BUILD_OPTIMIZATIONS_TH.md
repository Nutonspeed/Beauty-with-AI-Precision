# คู่มือเร่งความเร็วการ Build (Next.js 16)

อัปเดต: 2025-11-13

## ปัญหาหลักที่ทำให้ Build ช้า

- บังคับใช้ Webpack (`next build --webpack`) ทำให้ช้ากว่า Turbopack อย่างมีนัยสำคัญ
- ตั้งค่า `experimental.cpus: 1` และ `workerThreads: false` ลดการขนานงานระหว่าง build
- กฎ `splitChunks` แบบคัสตอมใน `webpack()` เพิ่มเวลา optimize ในโปรดักชัน
- ไลบรารีหนัก (เช่น `tensorflow`, `three`, `pixi.js`, `react-native`, `expo`) ทำให้กราฟการพึ่งพาขนาดใหญ่และเวลา resolve เพิ่มขึ้น
- Windows I/O และ Antivirus สแกนไฟล์ระหว่าง build ทำให้ช้ากว่า Linux/WSL2
- Build ใน Docker โดยไม่ใช้ cache หรือใช้ layer ที่ invalidated ง่าย

## โหมด Build ที่แนะนำ (เร็วขึ้นทันที)

- ใช้ Turbopack (ไม่บังคับ Webpack อีกต่อไป)

```powershell
pnpm build:turbo
```

- โหมด Fast Build (ข้ามบาง optimization ที่หนัก + ปลดล็อก multi-core)

```powershell
$env:FAST_BUILD = 1
pnpm build:turbo
```

> หมายเหตุ: โหมด `FAST_BUILD` จะปิดบาง optimization (เช่น splitChunks และ optimizePackageImports) เพื่อให้ build เร็วขึ้น เหมาะกับ QA/CI ที่ต้องการ feedback ไว ก่อน build โปรดักชันค่อยปิด `FAST_BUILD` เพื่อได้ bundle ที่เหมาะสม

## การเปลี่ยนแปลงที่รองรับแล้ว

- เพิ่มสคริปต์ `build:turbo` (ใช้ Turbopack)
- เพิ่มตัวแปร `FAST_BUILD` ใน `next.config.mjs` เพื่อ:
  - ข้าม `splitChunks` ที่กินเวลามาก
  - ไม่ตั้ง `experimental.cpus: 1` (เปิดทางให้ใช้ CPU หลายคอร์)
  - ปิด `optimizePackageImports/optimizeCss` ในโปรดักชันเมื่อเป็น fast build

## แนวทางปรับแต่งเพิ่มเติม (เลือกทำตามสถานการณ์)

- ใช้ WSL2 หรือ Linux runner ใน CI เพื่อลด I/O overhead บน Windows
- ยกเว้นโฟลเดอร์ `.next`, `node_modules`, `pnpm-store` จากการสแกนของ Antivirus
- ตรวจสอบว่ามีการ cache ของ `pnpm` และ `.next/cache` ใน CI/CD (เช่น Vercel, GitHub Actions)
- ลด dependency หนักฝั่ง client: แยก import แบบ on-demand, ใช้ dynamic import, หรือย้ายเป็น server-only เมื่อทำได้
- สำหรับ Docker build:
  - แยก layer ของ `pnpm install` ให้คง cache ได้
  - ใช้ `--mount=type=cache` กับ pnpm store (BuildKit) เพื่อลดเวลา install

## เช็คลิสต์ก่อนสรุปผล

- [ ] Turbopack build ผ่าน (`pnpm build:turbo`)
- [ ] Fast build สำหรับ QA/CI (`$env:FAST_BUILD=1; pnpm build:turbo`)
- [ ] เวลา build ลดลงเหลือ ~2-6 นาที (ขึ้นกับสเปกเครื่อง)
- [ ] โปรดักชัน build (ไม่ตั้ง `FAST_BUILD`) ก่อน release จริง

## คำถามที่พบบ่อย

- ถ้าเปิด multi-core แล้วเจอ DataCloneError?
  - ให้กลับไปตั้ง `FAST_BUILD` เป็นค่าว่าง หรือตั้ง `experimental.cpus: 1` เฉพาะเคสที่เจอปัญหา
- ถ้าใช้ Turbopack แล้วต้องพึ่ง `webpack()` customization?
  - ให้คงสคริปต์เดิม `pnpm build` สำหรับ build ที่ต้องใช้ Webpack เท่านั้น และใช้ `pnpm build:turbo` ในสถานการณ์ที่ไม่มีข้อผูกมัดกับ `webpack()`
