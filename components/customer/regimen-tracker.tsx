"use client"

import { useState } from "react"
import { CheckCircle2, Circle, Sun, Moon, Award, Calendar, ChevronRight, Sparkles, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface RegimenTrackerProps {
  isPremium: boolean
}

export function RegimenTracker({ isPremium }: RegimenTrackerProps) {
  const t = useTranslations()
  const [morningComplete, setMorningComplete] = useState([true, true, false])
  const [eveningComplete, setEveningComplete] = useState([false, false, false])

  const morningSteps = [
    { id: 1, name: t('regimenTracker.mock.morning1'), brand: 'HydraClean' },
    { id: 2, name: t('regimenTracker.mock.morning2'), brand: 'C-Boost Precision' },
    { id: 3, name: t('regimenTracker.mock.morning3'), brand: 'ShieldNode' },
  ]

  const eveningSteps = [
    { id: 1, name: t('regimenTracker.mock.evening1'), brand: 'PurifyMatrix' },
    { id: 2, name: t('regimenTracker.mock.evening2'), brand: 'NightRefine' },
    { id: 3, name: t('regimenTracker.mock.evening3'), brand: 'BioRestore' },
  ]

  const complianceScore = 78
  const streak = 12

  return (
    <Card className={cn(
      "border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group",
      !isPremium && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
      
      {!isPremium && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#020617]/60 backdrop-blur-sm p-10 text-center">
          <Badge className="mb-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">{t('ui.labels.premiumEcosystem')}</Badge>
          <h3 className="text-2xl font-bold text-white italic mb-4">{t('regimenTracker.title')}</h3>
          <p className="text-slate-400 max-w-sm font-light mb-8">
            {t('ui.labels.upgradeToTrack')}
          </p>
          <Button variant="premium" className="h-14 px-10 rounded-2xl border shadow-xl shadow-emerald-500/20 uppercase text-[10px] font-black tracking-widest italic">
            {t('ui.labels.activateEcosystem')}
          </Button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-row items-center justify-between">
        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <Sparkles className="h-8 w-8 text-emerald-400" />
            {t('regimenTracker.title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('regimenTracker.subtitle')}
          </CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{t('regimenTracker.streak', { days: streak })}</p>
            <p className="text-xs font-bold text-emerald-400 italic">{t('regimenTracker.level')}: {t(`regimenTracker.badges.${t('regimenTracker.rewardBadge')}`)}</p>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Award className="h-7 w-7 text-emerald-400" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Tracker Interface */}
          <div className="lg:col-span-8 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Morning Routine */}
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-white">
                  <Sun className="h-5 w-5 text-amber-400" />
                  <h4 className="font-bold italic uppercase tracking-tighter">{t('regimenTracker.morning')}</h4>
                </div>
                <div className="space-y-4">
                  {morningSteps.map((step, idx) => (
                    <div 
                      key={step.id}
                      onClick={() => {
                        const newComplete = [...morningComplete]
                        newComplete[idx] = !newComplete[idx]
                        setMorningComplete(newComplete)
                      }}
                      className={cn(
                        "p-5 rounded-2xl border transition-all cursor-pointer group/step",
                        morningComplete[idx] 
                          ? "bg-emerald-500/10 border-emerald-500/20" 
                          : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {morningComplete[idx] ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-slate-700 group-hover/step:text-slate-500" />
                          )}
                          <div>
                            <p className={cn("text-sm font-bold italic", morningComplete[idx] ? "text-white" : "text-slate-400")}>{step.name}</p>
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{step.brand}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[8px] font-black tracking-widest border-white/5 opacity-40">STEP_{idx+1}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evening Routine */}
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-white">
                  <Moon className="h-5 w-5 text-indigo-400" />
                  <h4 className="font-bold italic uppercase tracking-tighter">{t('regimenTracker.evening')}</h4>
                </div>
                <div className="space-y-4">
                  {eveningSteps.map((step, idx) => (
                    <div 
                      key={step.id}
                      onClick={() => {
                        const newComplete = [...eveningComplete]
                        newComplete[idx] = !newComplete[idx]
                        setEveningComplete(newComplete)
                      }}
                      className={cn(
                        "p-5 rounded-2xl border transition-all cursor-pointer group/step",
                        eveningComplete[idx] 
                          ? "bg-indigo-500/10 border-indigo-500/20" 
                          : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {eveningComplete[idx] ? (
                            <CheckCircle2 className="h-5 w-5 text-indigo-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-slate-700 group-hover/step:text-slate-500" />
                          )}
                          <div>
                            <p className={cn("text-sm font-bold italic", eveningComplete[idx] ? "text-white" : "text-slate-400")}>{step.name}</p>
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{step.brand}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[8px] font-black tracking-widest border-white/5 opacity-40">STEP_{idx+1}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Stats Column */}
          <div className="lg:col-span-4 space-y-8">
            <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-8">
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic">{t('regimenTracker.complianceScore')}</p>
                  <p className="text-3xl font-black text-white italic tracking-tighter">{complianceScore}%</p>
                </div>
                <Progress value={complianceScore} className="h-1.5 bg-white/5" indicatorClassName="bg-gradient-to-r from-emerald-500 to-cyan-500" />
              </div>

              <div className="space-y-6">
                <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2 italic">{t('ui.labels.clinicalAdherenceInsights')}</h5>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                      <TrendingDown className="h-4 w-4 text-emerald-400 rotate-180" />
                    </div>
                    <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                      {t('ui.labels.adherenceIncrease', { percent: '12%' })}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                      <Calendar className="h-4 w-4 text-amber-400" />
                    </div>
                    <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                      {t('ui.labels.nextNodeScan', { days: '4' })}
                    </p>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full h-14 rounded-2xl border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 italic">
                {t('ui.labels.viewProtocolAnalysis')}
                <ChevronRight className="ml-3 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
