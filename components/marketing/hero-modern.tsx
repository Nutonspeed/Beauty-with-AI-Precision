"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function HeroModern() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:py-28">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
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
          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
            <Button size="lg">เริ่มใช้งานฟรี</Button>
          </motion.div>
          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
            <Button variant="outline" size="lg">ดูเดโม</Button>
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
