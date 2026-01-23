"use client"

import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations } from "next-intl"

/**
 * Modern Loading Components - Awwwards Inspired
 * Smooth, minimal, and elegant animations
 */

// Gradient Spinner - Apple style
export function GradientSpinner({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-6 h-6", md: "w-10 h-10", lg: "w-16 h-16" }
  
  return (
    <div className={cn("relative", sizes[size], className)}>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: "conic-gradient(from 0deg, transparent, #ff69b4)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute inset-[3px] rounded-full bg-white shadow-inner" />
    </div>
  )
}

// Pulse Dots
export function PulseDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-glow-pink"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

// Progress Bar with Glow
export function GlowProgress({ 
  progress, 
  className,
  showPercentage = true 
}: { 
  progress: number
  className?: string
  showPercentage?: boolean
}) {
  return (
    <div className={cn("w-full", className)}>
      <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 shadow-inner">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 via-blue-500 to-pink-500 bg-[length:200%_auto] rounded-full shadow-glow-pink animate-gradient-x"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      {showPercentage && (
        <motion.p 
          className="mt-3 text-[10px] font-black uppercase tracking-widest italic text-slate-400 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          SYNC_IDX: {Math.round(progress)}%
        </motion.p>
      )}
    </div>
  )
}

// Skeleton with Shimmer Effect
export function ShimmerSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-lg bg-muted", className)}>
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{ translateX: ["100%", "-100%"] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </div>
  )
}

// Card Skeleton for Analysis Results
export function AnalysisCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-6 space-y-4">
      <div className="flex items-center gap-4">
        <ShimmerSkeleton className="w-16 h-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <ShimmerSkeleton className="h-4 w-3/4" />
          <ShimmerSkeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <ShimmerSkeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
      <ShimmerSkeleton className="h-32 rounded-lg" />
    </div>
  )
}

// AI Processing Overlay
export function AIProcessingOverlay({ 
  isVisible, 
  stage,
  progress 
}: { 
  isVisible: boolean
  stage: string
  progress: number
}) {
  const t = useTranslations('ui.modernLoader')
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md mx-4 p-8 rounded-2xl bg-card border border-border/50 shadow-2xl"
          >
            {/* AI Brain Animation */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-cyan-500/20"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/30 to-cyan-500/30"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
              />
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
                <motion.svg
                  viewBox="0 0 24 24"
                  className="w-8 h-8 text-white"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <path
                    fill="currentColor"
                    d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5A2.5 2.5 0 0 0 7.5 18a2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 7.5 13m9 0a2.5 2.5 0 0 0-2.5 2.5a2.5 2.5 0 0 0 2.5 2.5a2.5 2.5 0 0 0 2.5-2.5a2.5 2.5 0 0 0-2.5-2.5Z"
                  />
                </motion.svg>
              </div>
            </div>

            {/* Stage Text */}
            <motion.h3
              key={stage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg font-medium text-center mb-2"
            >
              {stage}
            </motion.h3>
            
            <p className="text-sm text-muted-foreground text-center mb-6">
              {t('aiProcessing')}
            </p>

            {/* Progress */}
            <GlowProgress progress={progress} />

            {/* Processing Steps */}
            <div className="mt-6 space-y-2">
              {[
                { label: "Face Detection", done: progress > 20 },
                { label: "Skin Analysis", done: progress > 50 },
                { label: "AI Evaluation", done: progress > 80 },
                { label: "Generating Report", done: progress >= 100 },
              ].map((step, i) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 text-sm"
                >
                  <motion.div
                    className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center",
                      step.done 
                        ? "bg-emerald-500 text-white" 
                        : "border-2 border-muted-foreground/30"
                    )}
                    animate={step.done ? { scale: [1, 1.2, 1] } : {}}
                  >
                    {step.done && (
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </motion.div>
                  <span className={step.done ? "text-foreground" : "text-muted-foreground"}>
                    {step.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Page Transition
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}

// Number Counter Animation
export function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="tabular-nums"
    >
      {value}{suffix}
    </motion.span>
  )
}

// Score Ring - For showing analysis scores
export function ScoreRing({ 
  score, 
  size = 120,
  label 
}: { 
  score: number
  size?: number
  label?: string
}) {
  const circumference = 2 * Math.PI * 45
  const progress = (score / 100) * circumference
  
  const getColor = (s: number) => {
    if (s >= 80) return "text-emerald-500"
    if (s >= 60) return "text-amber-500"
    return "text-rose-500"
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-muted"
        />
        {/* Progress circle */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          className={getColor(score)}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-2xl font-bold"
        >
          {score}
        </motion.span>
        {label && (
          <span className="text-xs text-muted-foreground">{label}</span>
        )}
      </div>
    </div>
  )
}
