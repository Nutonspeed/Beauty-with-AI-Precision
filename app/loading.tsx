'use client'

import { motion } from 'framer-motion'
import { GradientSpinner } from '@/components/ui/modern-loader'
import { ClinicIQMark } from '@/components/brand/logo'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 text-center"
      >
        {/* Logo with pulse */}
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="mb-8"
        >
          <ClinicIQMark className="h-16 w-16 mx-auto" />
        </motion.div>

        {/* Spinner */}
        <GradientSpinner size="lg" className="mx-auto mb-6" />

        {/* Loading text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-muted-foreground text-lg">กำลังโหลด...</p>
          <p className="text-muted-foreground/60 text-sm mt-1">กรุณารอสักครู่</p>
        </motion.div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mt-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
