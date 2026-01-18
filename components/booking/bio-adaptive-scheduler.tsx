"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Clock, Zap, Activity, ShieldCheck, RefreshCw, Sparkles, Heart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface BioAdaptiveSchedulerProps {
  _selectedDate?: Date
  onTimeSelect: (time: string) => void
  selectedTime: string
}

export function BioAdaptiveScheduler({ selectedTime, onTimeSelect, _selectedDate }: BioAdaptiveSchedulerProps) {
  const t = useTranslations()
  const [isSyncing, setIsSyncing] = useState(false)
  const [readinessScore, setReadinessScore] = useState(88)

  const _unusedDate = _selectedDate;

  const timeRecommendations = [
    { time: '09:30', score: 94, label: t('bioAdaptiveScheduler.peakTime'), color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { time: '14:30', score: 82, label: t('bioAdaptiveScheduler.lowRiskTime'), color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { time: '17:00', score: 65, label: t('ui.labels.standardNode'), color: 'text-slate-400', bg: 'bg-white/5' },
  ]

  const handleSync = () => {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
      setReadinessScore(Math.floor(Math.random() * 15) + 85)
    }, 2000)
  }

  return (
    <Card className={cn(
      "border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group animate-neural-pulse",
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      
      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.02] to-transparent animate-neural-pulse pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <Clock className="h-8 w-8 text-cyan-400" />
            {t('bioAdaptiveScheduler.title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('bioAdaptiveScheduler.subtitle')}
          </CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{t('bioAdaptiveScheduler.readinessScore')}</p>
            <p className="text-xl font-black text-emerald-400 italic tracking-tighter">{readinessScore}%</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleSync}
            disabled={isSyncing}
            className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <RefreshCw className={cn("h-5 w-5 text-cyan-400", isSyncing && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Recommendation Node */}
          <div className="lg:col-span-7 space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{t('bioAdaptiveScheduler.recommendation')}</h4>
            <div className="grid grid-cols-1 gap-4">
              {timeRecommendations.map((rec, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.02, x: 10 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onTimeSelect(rec.time)}
                  className={cn(
                    "p-6 rounded-[2rem] border transition-all duration-500 flex items-center justify-between group/rec",
                    selectedTime === rec.time 
                      ? "bg-pink-600/10 border-pink-500/40 shadow-xl" 
                      : "bg-white/[0.02] border-white/5 hover:border-white/10"
                  )}
                >
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "h-12 w-12 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner transition-transform group-hover/rec:scale-110 animate-synaptic-fire",
                      rec.bg, rec.color
                    )}>
                      <Zap className="h-6 w-6" />
                    </div>
                    <div className="text-left space-y-0.5">
                      <p className="text-xl font-black text-white italic tracking-tighter">{rec.time}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{rec.label}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={cn("text-[8px] font-black border-white/5 italic", rec.color)}>
                      {rec.score}% {t('ui.labels.aptitude')}
                    </Badge>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Bio-Insight Sidebar */}
          <div className="lg:col-span-5 space-y-8">
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-cyan-600/10 via-transparent to-transparent border border-cyan-500/20 space-y-6 relative overflow-hidden group/insight">
              <Heart className="absolute bottom-[-20px] right-[-20px] h-32 w-32 text-cyan-500/5 rotate-12" />
              <div className="flex items-center gap-4 relative z-10">
                <Activity className="h-5 w-5 text-cyan-400" />
                <h5 className="text-xs font-black text-white uppercase tracking-widest">{t('bioAdaptiveScheduler.optimalWindow')}</h5>
              </div>
              <p className="text-[11px] text-slate-400 font-light leading-relaxed italic relative z-10">
                {t('ui.labels.circadianRhythmDesc')}
              </p>
              <div className="pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{t('ui.labels.protocolAlignment')}</span>
                <span className="text-[8px] font-black text-emerald-400 italic">{t('ui.status.nodeSync')}</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center gap-4">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <p className="text-[10px] text-slate-500 font-light leading-relaxed italic">
                {t('bioAdaptiveScheduler.verified')}: {t('bioAdaptiveScheduler.verifiedDesc')}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-white/5 bg-white/[0.01]">
        <div className="w-full flex items-center justify-between">
          <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] italic">{t('ui.labels.temporalOrchestrationActive')}</p>
          <div className="flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-pink-500 animate-pulse" />
            <span className="text-[8px] font-black text-pink-500/60 uppercase tracking-widest italic">{t('ui.labels.aiPoweredScheduling')}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
