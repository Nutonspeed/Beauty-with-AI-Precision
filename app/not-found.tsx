'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft, Search, Sparkles } from 'lucide-react'
import { ClinicIQMark } from '@/components/brand/logo'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-6">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center max-w-lg"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="mx-auto mb-8"
        >
          <ClinicIQMark className="h-20 w-20 mx-auto opacity-50" />
        </motion.div>

        {/* 404 Number */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 0.3 }}
          className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4"
        >
          404
        </motion.h1>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-2xl md:text-3xl font-bold mb-4"
        >
          ไม่พบหน้าที่คุณค้นหา
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground mb-8 text-lg"
        >
          หน้านี้อาจถูกย้าย ลบไปแล้ว หรือ URL ไม่ถูกต้อง
          <br />
          กรุณาตรวจสอบที่อยู่อีกครั้ง หรือกลับไปหน้าหลัก
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              กลับหน้าหลัก
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="/analysis">
              <Sparkles className="mr-2 h-4 w-4" />
              วิเคราะห์ผิว
            </Link>
          </Button>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 pt-8 border-t border-border"
        >
          <p className="text-sm text-muted-foreground mb-4">ลิงก์ที่น่าสนใจ</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/features" className="text-primary hover:underline">
              คุณสมบัติ
            </Link>
            <Link href="/pricing" className="text-primary hover:underline">
              ราคา
            </Link>
            <Link href="/contact" className="text-primary hover:underline">
              ติดต่อเรา
            </Link>
            <Link href="/faq" className="text-primary hover:underline">
              FAQ
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
