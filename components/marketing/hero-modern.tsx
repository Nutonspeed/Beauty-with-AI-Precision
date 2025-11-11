"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HeroModern() {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:py-28">
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }}
        className="max-w-2xl"
      >
        <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur dark:bg-neutral-900/60">
          ใช้ AI ยกระดับคลินิกความงาม
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          ผลลัพธ์ที่จับต้องได้ ไม่ใช่แค่หน้าสวย
        </h1>
        <p className="mt-3 max-w-xl text-base text-muted-foreground">
          จองคิวอัจฉริยะ วิเคราะห์ก่อน–หลัง และรายงานรายได้แบบเรียลไทม์ ทั้งหมดในที่เดียว
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <motion.div whileHover={prefersReducedMotion ? undefined : { y: -1 }} whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}>
            <Button size="lg">เริ่มใช้งานฟรี</Button>
          </motion.div>
          <motion.div whileHover={prefersReducedMotion ? undefined : { y: -1 }} whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}>
            <Link href="/demo/before-after">
              <Button asChild variant="outline" size="lg">
                <span>ดูเดโม</span>
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* proof/metrics */}
        <div className="mt-8 grid grid-cols-3 gap-4 max-w-md text-sm">
          <div className="rounded-xl border bg-background/60 p-3">
            <p className="font-semibold">12K+</p>
            <p className="text-muted-foreground">การนัดต่อเดือน</p>
          </div>
          <div className="rounded-xl border bg-background/60 p-3">
            <p className="font-semibold">98%</p>
            <p className="text-muted-foreground">ความพึงพอใจ</p>
          </div>
          <div className="rounded-xl border bg-background/60 p-3">
            <p className="font-semibold">3.2x</p>
            <p className="text-muted-foreground">อัตรากลับมาใช้ซ้ำ</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
