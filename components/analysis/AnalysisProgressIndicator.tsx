'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useAnalysisProgress, formatTimeElapsed, getEstimatedTimeRemaining } from '@/hooks/useAnalysisProgress'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, 
  Sparkles, 
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
  const t = useTranslations('analysis')
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
  const formattedTimeRemaining = formatTimeElapsed(timeRemaining)
  const formattedTimeElapsed = formatTimeElapsed(timeElapsed)

  return (
    <div className={cn("w-full max-w-xl mx-auto space-y-8 animate-in fade-in duration-700", className)}>
      {/* Main Progress interface interface */}
      <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden group transition-all duration-1000 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardContent className="p-12 lg:p-16 space-y-12">
          {/* Header with neural icon and stage interface */}
          <div className="flex items-center gap-8">
            <motion.div
              key={icon}
              initial={{ scale: 0.8, opacity: 0, rotate: -45 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="h-24 w-24 rounded-[2rem] bg-pink-50 border border-pink-100 flex items-center justify-center text-5xl shadow-inner group-hover:scale-110 transition-transform duration-700 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent animate-neural-pulse" />
              <span className="relative z-10">{icon}</span>
            </motion.div>
            
            <div className="flex-1 space-y-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={stage}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-1"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-600 italic leading-none">NEURAL_STAGE_ACTIVE</p>
                  <h3 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none group-hover:text-pink-600 transition-colors">
                    {stage}
                  </h3>
                </motion.div>
              </AnimatePresence>
              
              {showDescription && (
                <AnimatePresence mode="wait">
                  <motion.p
                    key={description}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-lg text-slate-500 font-medium italic leading-relaxed tracking-tight"
                  >
                    "{description}"
                  </motion.p>
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Progress interface interface */}
          <div className="space-y-8">
            <div className="relative h-4 bg-slate-50 border border-slate-100 rounded-full overflow-hidden shadow-inner p-1">
              <motion.div
                className="h-full bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 rounded-full shadow-glow-pink relative overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{
                  duration: 0.5,
                  ease: 'easeInOut',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-shimmer" />
              </motion.div>
            </div>

            <div className="flex justify-between items-end px-2">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">SYNCHRONISATION_PERCENTILE</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-slate-950 italic tracking-tighter leading-none">
                    {Math.round(progress)}
                  </span>
                  <span className="text-xl font-black text-slate-300 italic uppercase">%</span>
                </div>
              </div>
              
              <div className="text-right space-y-2">
                {showTimeEstimate && !isComplete && (
                  <>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{t('estimatedTimeRemaining' as any) || 'REMAINING_FLUX'}</p>
                    <div className="flex items-center gap-3 justify-end">
                      <Clock className="h-4 w-4 text-blue-500 animate-pulse" />
                      <span className="text-xl font-black text-slate-950 italic uppercase tracking-tight">
                        {progress > 0 && timeRemaining > 0
                          ? formattedTimeRemaining
                          : (t('calculating' as any) || 'CALCULATING...')}
                      </span>
                    </div>
                  </>
                )}
                
                {isComplete && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="space-y-2"
                  >
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest italic">PROCESS_SYNCHRONISED</p>
                    <Badge className="bg-emerald-50 text-emerald-600 border-none px-6 py-2 rounded-full text-[10px] font-black italic shadow-sm uppercase">
                      {t('completedIn' as any || 'Completed in {time}').replace('{time}', formattedTimeElapsed)}
                    </Badge>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Neural Insight interface interface */}
      {!isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="p-8 rounded-[3rem] bg-slate-50 border border-slate-100 flex items-start gap-8 group/insight shadow-inner transition-all duration-700 hover:bg-white hover:border-pink-500/20"
        >
          <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm group-hover/insight:scale-110 transition-transform">
            <Sparkles className="h-7 w-7 text-pink-600" />
          </div>
          <div className="space-y-2 pt-1">
            <p className="text-[10px] font-black text-pink-600 uppercase tracking-[0.3em] italic leading-none">{t('didYouKnow' as any) || 'NEURAL_FACT'}</p>
            <p className="text-lg text-slate-500 font-medium italic leading-relaxed tracking-tight group-hover/insight:text-slate-950 transition-colors">
              {t('aiFact' as any) || 'Our advanced neural core processes over 14 million biometric data nodes to ensure 99.9% diagnostic accuracy.'}
            </p>
          </div>
        </motion.div>
      )}

      {/* Process Success interface interface */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-10 rounded-[4rem] bg-slate-950 text-white relative overflow-hidden group/success shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-blue-500/10 opacity-50" />
            <div className="absolute top-0 right-0 p-12 opacity-[0.05] group-hover/success:scale-110 group-hover/success:rotate-12 transition-transform duration-1000">
              <CheckCircle2 className="w-48 h-48 text-white" />
            </div>
            <div className="flex flex-col items-center text-center space-y-8 relative z-10">
              <div className="h-24 w-24 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center shadow-lg group-hover/success:scale-110 transition-transform duration-700">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-4">
                <h4 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">{t('analysisComplete' as any) || 'Inference_Successful'}</h4>
                <p className="text-lg text-slate-400 font-light italic tracking-tight">{t('resultsReady' as any) || 'Diagnostic nodes have been committed to your permanent biological registry.'}</p>
              </div>
              <Button variant="premium" size="xl" className="h-18 px-12 rounded-[2rem] shadow-2xl shadow-pink-500/30 font-black uppercase tracking-[0.3em] text-[11px] italic border-none bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 text-white hover:scale-105 transition-all">
                Access_Diagnostic_Report
                <ChevronRight className="ml-4 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Status interface */}
      <div className="flex items-center justify-between px-10 pt-4 opacity-40 hover:opacity-100 transition-opacity duration-700">
        <div className="flex items-center gap-5 text-slate-400 group/status cursor-default">
          <ShieldCheck className="h-5 w-5 group-hover:text-emerald-500 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">Neural_Integrity_Verified: 2026_CORE</p>
        </div>
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Engine: BIP-Process-v4.8</p>
      </div>
    </div>
  )
}

/**
 * Compact version interface interface
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
    <div className="flex items-center gap-6 bg-white/90 backdrop-blur-xl border border-white/50 rounded-full pl-4 pr-10 py-3 shadow-premium group/compact transition-all hover:scale-105">
      <motion.div
        key={icon}
        initial={{ rotate: -180, scale: 0.8 }}
        animate={{ rotate: 0, scale: 1 }}
        className="h-14 w-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl shadow-inner group-hover/compact:bg-pink-50 transition-colors"
      >
        {icon}
      </motion.div>
      
      <div className="flex-1 min-w-[200px] space-y-2">
        <div className="flex justify-between items-end px-1">
          <p className="text-[9px] font-black text-slate-950 italic uppercase tracking-tighter truncate max-w-[140px]">{stage}</p>
          <span className="text-[11px] font-black text-pink-600 italic">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner p-0.5">
          <motion.div
            className="h-full bg-pink-600 rounded-full shadow-glow-pink/30"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Full-screen interface overlay interface
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/20 backdrop-blur-xl p-10"
    >
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none" />
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
 * Minimal interface spinner interface
 */
export function MinimalProgressSpinner({
  size = 'md',
  message,
}: {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
  }

  return (
    <div className="flex flex-col items-center gap-6 group/minimal">
      <div className="relative">
        <div className={cn("absolute inset-0 bg-pink-500/10 blur-2xl rounded-full group-hover/minimal:animate-pulse")} />
        <Loader2 className={cn("animate-spin text-pink-600 relative z-10", sizeClasses[size])} />
      </div>
      {message && (
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic animate-pulse">
          {message}
        </p>
      )}
    </div>
  )
}
