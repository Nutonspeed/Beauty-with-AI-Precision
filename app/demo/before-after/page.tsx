"use client";

import AuroraBackground from "@/components/marketing/aurora-background";
import { BeforeAfter } from "@/components/marketing/before-after";

export default function BeforeAfterDemoPage() {
  return (
    <main className="flex-1">
      <section className="w-full py-12 md:py-20 lg:py-24">
        <div className="container px-4 md:px-6">
          <AuroraBackground>
            <div className="mx-auto max-w-4xl px-6 py-10 sm:py-12">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">ก่อน–หลัง (Before/After) Demo</h1>
              <p className="mt-2 text-muted-foreground">
                ตัวอย่างสไลเดอร์เปรียบเทียบผลลัพธ์ก่อน–หลัง (รองรับเมาส์/ทัช/คีย์บอร์ด). หากยังไม่มีรูปจริง ระบบจะแสดง placeholder ชั่วคราว.
              </p>
              <div className="mt-8">
                {/* ใส่พาธรูปจริงเมื่อพร้อม เช่น /cases/case-01-before.jpg และ /cases/case-01-after.jpg */}
                <BeforeAfter />
              </div>
            </div>
          </AuroraBackground>
        </div>
      </section>
    </main>
  );
}
