"use client"

import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { CheckCircle2, AlertTriangle, XCircle, Camera, Sun, Focus, Palette } from "lucide-react"
import type { LightingQualityResult } from "@/lib/ai/lighting-quality-checker"

interface QualityIndicatorProps {
  quality: LightingQualityResult | null
  isAnalyzing?: boolean
}

export function QualityIndicator({ quality, isAnalyzing }: QualityIndicatorProps) {
  if (!quality) return null

  const getQualityColor = (q: string) => {
    switch (q) {
      case 'excellent': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30'
      case 'good': return 'text-green-500 bg-green-500/10 border-green-500/30'
      case 'fair': return 'text-amber-500 bg-amber-500/10 border-amber-500/30'
      case 'poor': return 'text-rose-500 bg-rose-500/10 border-rose-500/30'
      default: return 'text-muted-foreground bg-muted border-border'
    }
  }

  const getQualityIcon = (q: string) => {
    switch (q) {
      case 'excellent': return <CheckCircle2 className="w-5 h-5" />
      case 'good': return <CheckCircle2 className="w-5 h-5" />
      case 'fair': return <AlertTriangle className="w-5 h-5" />
      case 'poor': return <XCircle className="w-5 h-5" />
      default: return null
    }
  }

  const getQualityText = (q: string) => {
    switch (q) {
      case 'excellent': return 'คุณภาพดีเยี่ยม'
      case 'good': return 'คุณภาพดี'
      case 'fair': return 'คุณภาพพอใช้'
      case 'poor': return 'คุณภาพต่ำ'
      default: return ''
    }
  }

  const metrics = [
    { 
      icon: Sun, 
      label: 'แสง', 
      value: Math.round(quality.brightness),
      max: 255,
      good: quality.brightness >= 100 && quality.brightness <= 220
    },
    { 
      icon: Focus, 
      label: 'ความคมชัด', 
      value: Math.round(quality.sharpness),
      max: 100,
      good: quality.sharpness >= 40
    },
    { 
      icon: Camera, 
      label: 'ความสม่ำเสมอ', 
      value: Math.round(quality.evenness),
      max: 100,
      good: quality.evenness >= 50
    },
    { 
      icon: Palette, 
      label: 'คอนทราสต์', 
      value: Math.round(quality.contrast),
      max: 100,
      good: quality.contrast >= 20 && quality.contrast <= 80
    },
  ]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-md mx-auto"
      >
        {/* Main Quality Badge */}
        <motion.div
          className={cn(
            "flex items-center justify-between p-4 rounded-xl border backdrop-blur-sm",
            getQualityColor(quality.quality)
          )}
          animate={isAnalyzing ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 1.5, repeat: isAnalyzing ? Infinity : 0 }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              {getQualityIcon(quality.quality)}
            </motion.div>
            <div>
              <p className="font-medium">{getQualityText(quality.quality)}</p>
              <p className="text-xs opacity-70">
                คะแนนรวม {Math.round(quality.score * 100)}%
              </p>
            </div>
          </div>
          
          {/* Circular Progress */}
          <div className="relative w-12 h-12">
            <svg className="transform -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="opacity-20"
              />
              <motion.circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={100}
                initial={{ strokeDashoffset: 100 }}
                animate={{ strokeDashoffset: 100 - quality.score * 100 }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
              {Math.round(quality.score * 100)}
            </span>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div 
          className="grid grid-cols-4 gap-2 mt-3"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.1 } }
          }}
        >
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 }
              }}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg border",
                metric.good 
                  ? "bg-emerald-500/5 border-emerald-500/20" 
                  : "bg-amber-500/5 border-amber-500/20"
              )}
            >
              <metric.icon className={cn(
                "w-4 h-4 mb-1",
                metric.good ? "text-emerald-500" : "text-amber-500"
              )} />
              <span className="text-xs font-medium">{metric.value}</span>
              <span className="text-[10px] text-muted-foreground">{metric.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Recommendations */}
        {quality.recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ delay: 0.5 }}
            className="mt-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20"
          >
            <p className="text-xs font-medium text-amber-600 mb-2">💡 คำแนะนำ</p>
            <ul className="space-y-1">
              {quality.recommendations.map((rec, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="text-xs text-amber-700 flex items-start gap-2"
                >
                  <span className="mt-0.5">•</span>
                  {rec}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Can Proceed Status */}
        {!quality.canProceed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30"
          >
            <p className="text-xs text-rose-600 flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              คุณภาพภาพไม่เพียงพอสำหรับการวิเคราะห์ที่แม่นยำ กรุณาถ่ายใหม่
            </p>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

// Mini version for inline display
export function QualityBadge({ quality }: { quality: LightingQualityResult | null }) {
  if (!quality) return null
  
  const colors: Record<string, string> = {
    excellent: 'bg-emerald-500',
    good: 'bg-green-500',
    fair: 'bg-amber-500',
    poor: 'bg-rose-500'
  }
  
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm border"
    >
      <motion.div 
        className={cn("w-2 h-2 rounded-full", colors[quality.quality])}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <span className="text-xs font-medium">
        {Math.round(quality.score * 100)}%
      </span>
    </motion.div>
  )
}
