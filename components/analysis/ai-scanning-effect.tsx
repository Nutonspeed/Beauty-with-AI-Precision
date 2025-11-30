'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Brain, Sparkles, Scan, Eye, Zap } from 'lucide-react'

interface AIScanningEffectProps {
  isScanning: boolean
  progress?: number
  className?: string
  stage?: string
}

/**
 * AI Scanning Effect - Visual feedback during AI analysis
 * Shows scanning lines, particles, and stage indicators
 */
export function AIScanningEffect({ 
  isScanning, 
  progress = 0, 
  className,
  stage = 'กำลังวิเคราะห์...'
}: AIScanningEffectProps) {
  const [scanPosition, setScanPosition] = useState(0)

  useEffect(() => {
    if (!isScanning) return
    
    const interval = setInterval(() => {
      setScanPosition(prev => (prev + 1) % 100)
    }, 30)
    
    return () => clearInterval(interval)
  }, [isScanning])

  if (!isScanning) return null

  return (
    <div className={cn('absolute inset-0 pointer-events-none overflow-hidden', className)}>
      {/* Scanning line */}
      <motion.div
        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
        animate={{
          top: ['0%', '100%', '0%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Vertical scanning line */}
      <motion.div
        className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-purple-500 to-transparent"
        animate={{
          left: ['0%', '100%', '0%'],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Corner brackets */}
      <div className="absolute inset-4">
        <motion.div
          className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-cyan-500"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-cyan-500"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.25 }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-cyan-500"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-cyan-500"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.75 }}
        />
      </div>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-cyan-400"
          initial={{
            x: Math.random() * 100 + '%',
            y: Math.random() * 100 + '%',
            opacity: 0,
          }}
          animate={{
            x: Math.random() * 100 + '%',
            y: Math.random() * 100 + '%',
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}

      {/* Center AI indicator */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="p-4 rounded-full bg-background/80 backdrop-blur-sm shadow-2xl"
          animate={{
            scale: [1, 1.1, 1],
            boxShadow: [
              '0 0 20px rgba(6, 182, 212, 0.3)',
              '0 0 40px rgba(6, 182, 212, 0.5)',
              '0 0 20px rgba(6, 182, 212, 0.3)',
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <Brain className="w-8 h-8 text-cyan-500" />
          </motion.div>
        </motion.div>
      </div>

      {/* Status bar at bottom */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-background/80 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Scan className="w-5 h-5 text-cyan-500" />
            </motion.div>
            <div className="flex-1">
              <p className="text-sm font-medium">{stage}</p>
              <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
            <span className="text-sm font-mono text-cyan-500">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Analysis Stage Indicator - Shows current analysis stage with icons
 */
export function AnalysisStageIndicator({ stage, total, current }: { stage: string; total: number; current: number }) {
  const stages = [
    { icon: Scan, label: 'สแกนใบหน้า' },
    { icon: Eye, label: 'วิเคราะห์ผิว' },
    { icon: Brain, label: 'AI ประมวลผล' },
    { icon: Sparkles, label: 'สรุปผลลัพธ์' },
  ]

  return (
    <div className="flex items-center justify-center gap-2 p-4">
      {stages.slice(0, total).map((s, i) => {
        const Icon = s.icon
        const isActive = i === current
        const isComplete = i < current

        return (
          <motion.div
            key={i}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm',
              isActive && 'bg-cyan-500/20 text-cyan-500',
              isComplete && 'bg-emerald-500/20 text-emerald-500',
              !isActive && !isComplete && 'bg-muted text-muted-foreground'
            )}
            animate={isActive ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{s.label}</span>
          </motion.div>
        )
      })}
    </div>
  )
}

/**
 * Face Detection Overlay - Shows detected face region
 */
export function FaceDetectionOverlay({ detected, bounds }: { detected: boolean; bounds?: { x: number; y: number; width: number; height: number } }) {
  if (!detected || !bounds) return null

  return (
    <motion.div
      className="absolute border-2 border-cyan-500 rounded-lg"
      style={{
        left: bounds.x,
        top: bounds.y,
        width: bounds.width,
        height: bounds.height,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      {/* Corner indicators */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-500" />
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-500" />
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-500" />
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-500" />
      
      {/* Label */}
      <motion.div
        className="absolute -top-6 left-0 text-xs text-cyan-500 bg-background/80 px-2 py-0.5 rounded"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Face Detected ✓
      </motion.div>
    </motion.div>
  )
}
