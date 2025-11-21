/**
 * Analysis Progress Indicator Component
 * 
 * Purpose: Beautiful, informative progress display during AI analysis
 * Features:
 * - Smooth progress bar animation
 * - Stage-by-stage status updates
 * - Emoji icons for visual appeal
 * - Estimated time remaining
 * - Responsive design
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useAnalysisProgress, formatTimeElapsed, getEstimatedTimeRemaining } from '@/hooks/useAnalysisProgress'

export interface AnalysisProgressIndicatorProps {
  onComplete?: () => void
  autoStart?: boolean
  showTimeEstimate?: boolean
  showDescription?: boolean
  className?: string
}

export function AnalysisProgressIndicator({
  onComplete,
  autoStart = true,
  showTimeEstimate = true,
  showDescription = true,
  className = '',
}: AnalysisProgressIndicatorProps) {
  const {
    progress,
    stage,
    icon,
    description,
    isComplete,
    timeElapsed,
    start: _start,
  } = useAnalysisProgress({
    onComplete,
    autoStart,
  })

  const timeRemaining = getEstimatedTimeRemaining(progress, timeElapsed)

  return (
    <div className={`w-full max-w-md mx-auto space-y-4 ${className}`}>
      {/* Main Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-4"
      >
        {/* Header with Icon and Stage */}
        <div className="flex items-center gap-4">
          <motion.div
            key={icon}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="text-5xl"
          >
            {icon}
          </motion.div>
          
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.h3
                key={stage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-lg font-semibold text-gray-900 dark:text-white truncate"
              >
                {stage}
              </motion.h3>
            </AnimatePresence>
            
            {showDescription && (
              <AnimatePresence mode="wait">
                <motion.p
                  key={description}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-gray-600 dark:text-gray-400 mt-1"
                >
                  {description}
                </motion.p>
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{
                duration: 0.5,
                ease: 'easeInOut',
              }}
            />
            
            {/* Shimmer Effect */}
            {!isComplete && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            )}
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-gray-900 dark:text-white">
              {Math.round(progress)}%
            </span>
            
            {showTimeEstimate && !isComplete && (
              <span className="text-gray-600 dark:text-gray-400">
                {progress > 0 && timeRemaining > 0
                  ? `ประมาณ ${formatTimeElapsed(timeRemaining)} เหลืออยู่`
                  : 'กำลังคำนวณ...'}
              </span>
            )}
            
            {isComplete && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-green-600 dark:text-green-400 font-medium"
              >
                เสร็จสิ้นใน {formatTimeElapsed(timeElapsed)}
              </motion.span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Fun Facts / Tips (optional) */}
      {!isComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4"
        >
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>คุณรู้หรือไม่?</strong> ระบบใช้ AI 3 ตัวร่วมกันวิเคราะห์ผิวของคุณเพื่อความแม่นยำสูงสุด
          </p>
        </motion.div>
      )}

      {/* Success Animation */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center"
          >
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-green-800 dark:text-green-200 font-medium">
              การวิเคราะห์เสร็จสมบูรณ์!
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              ผลลัพธ์พร้อมแสดงแล้ว
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Compact version for inline display
 */
export function CompactProgressIndicator({
  progress,
  stage,
  icon,
}: {
  progress: number
  stage: string
  icon: string
}) {
  return (
    <div className="flex items-center gap-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
      <motion.span
        key={icon}
        initial={{ rotate: -180, scale: 0 }}
        animate={{ rotate: 0, scale: 1 }}
        className="text-2xl"
      >
        {icon}
      </motion.span>
      
      <div className="flex-1 min-w-0">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={stage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-gray-700 dark:text-gray-300 mt-1 truncate"
          >
            {stage}
          </motion.p>
        </AnimatePresence>
      </div>
      
      <span className="text-sm font-medium text-gray-900 dark:text-white ml-2">
        {Math.round(progress)}%
      </span>
    </div>
  )
}

/**
 * Full-screen overlay version for modal display
 */
export function FullScreenProgressOverlay({
  onComplete,
}: {
  onComplete?: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <AnalysisProgressIndicator
        onComplete={onComplete}
        autoStart={true}
        showTimeEstimate={true}
        showDescription={true}
      />
    </motion.div>
  )
}

/**
 * Minimal spinner for quick actions
 */
export function MinimalProgressSpinner({
  size = 'md',
  message,
}: {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-600 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      {message && (
        <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
          {message}
        </p>
      )}
    </div>
  )
}
