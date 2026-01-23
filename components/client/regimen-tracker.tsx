"use client"

import { useState } from "react"
import { CheckCircle2, Circle, Sun, Moon, Award, Calendar, ChevronRight, Sparkles, TrendingUp, Zap, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface RegimenTrackerProps {
  isPremium: boolean
}

export function RegimenTracker({ isPremium }: RegimenTrackerProps) {
  const t = useTranslations()
  const [morningComplete, setMorningComplete] = useState([true, true, false])
  const [eveningComplete, setEveningComplete] = useState([false, false, false])

  const morningSteps = [
    { id: 1, name: t('regimenTracker.mock.morning1' as any) || 'Neural Hydra-Cleanse', brand: 'HydraClean Core' },
    { id: 2, name: t('regimenTracker.mock.morning2' as any) || 'C-Boost Synchronizer', brand: 'Ascorbic Node' },
    { id: 3, name: t('regimenTracker.mock.morning3' as any) || 'ShieldNode SPF Matrix', brand: 'Uv-Block Spectrum' },
  ]

  const eveningSteps = [
    { id: 1, name: t('regimenTracker.mock.evening1' as any) || 'Molecular Purify-Matrix', brand: 'Deep-Inflow Cleanse' },
    { id: 2, name: t('regimenTracker.mock.evening2' as any) || 'Night-Refine Retinoid', brand: 'Cellular Override' },
    { id: 3, name: t('regimenTracker.mock.evening3' as any) || 'Bio-Restore Lipid Node', brand: 'Dermal Lipid Sync' },
  ]

  const complianceScore = 78
  const streak = 12

  return (
    <Card className={cn(
      "border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-emerald-500/20 flex flex-col min-h-[600px]",
      !isPremium && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {!isPremium && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm p-10 text-center">
          <Badge className="mb-6 bg-emerald-50 text-emerald-600 border-none font-black uppercase tracking-widest italic shadow-sm">PROTOCOL_TRACKING_RESTRICTED</Badge>
          <div className="space-y-4 mb-8">
            <h3 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('regimenTracker.title' as any) || 'Dermal_Regimen_Monitor'}</h3>
            <p className="text-slate-500 max-w-sm font-medium italic leading-relaxed">
              Unlock the ability to track your personalized bio-regimen adherence and synchronize with clinical protocols.
            </p>
          </div>
          <Button variant="premium" size="xl" className="h-18 px-12 rounded-[2rem] shadow-2xl shadow-emerald-500/20 uppercase text-[11px] font-black tracking-widest italic transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white">
            <Zap className="mr-4 h-6 w-6" />
            Activate_Tracking_Node
          </Button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
          <div className="space-y-3">
            <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-700">
                <Sparkles className="h-8 w-8 text-emerald-600 group-hover:text-white" />
              </div>
              {t('regimenTracker.title' as any) || 'Daily_Protocol_Tracker'}
            </CardTitle>
            <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">
              {t('regimenTracker.subtitle' as any) || 'Real-time biological regimen synchronization'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-6 relative z-10 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">{t('regimenTracker.streak' as any || 'Temporal_Streak').replace('{days}', String(streak))}</p>
              <p className="text-lg font-black text-emerald-600 italic tracking-tighter uppercase leading-none mt-1">12 Cycles_Active</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-inner">
              <Award className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-16 space-y-12 bg-white flex-1">
        <div className="grid lg:grid-cols-12 gap-16">
          {/* Tracker Interface interface */}
          <div className="lg:col-span-8 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Morning Sequence interface */}
              <div className="space-y-8 p-10 rounded-[3rem] bg-slate-50/50 border border-slate-100 shadow-inner group/morning">
                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/morning:scale-110 transition-transform duration-700">
                      <Sun className="h-5 w-5 text-amber-500 animate-pulse" />
                    </div>
                    <h4 className="font-black text-xl italic uppercase tracking-tight text-slate-950">{t('regimenTracker.morning' as any) || 'Morning_Sequence'}</h4>
                  </div>
                  <Badge variant="outline" className="bg-white border-slate-100 text-[8px] font-black italic text-slate-400 px-3 py-1 rounded-full uppercase">Baseline_Uplink</Badge>
                </div>
                <div className="space-y-4">
                  {morningSteps.map((step, idx) => (
                    <motion.div 
                      key={step.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => {
                        const newComplete = [...morningComplete]
                        newComplete[idx] = !newComplete[idx]
                        setMorningComplete(newComplete)
                      }}
                      className={cn(
                        "p-6 rounded-[2rem] border transition-all duration-500 cursor-pointer group/step relative overflow-hidden",
                        morningComplete[idx] 
                          ? "bg-white border-emerald-200 shadow-premium" 
                          : "bg-white/50 border-slate-100 hover:bg-white hover:border-emerald-500/20 shadow-sm"
                      )}
                    >
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-100 group-hover/step:bg-emerald-500 transition-all duration-700" />
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-5">
                          <div className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center border transition-all duration-700 group-hover/step:scale-110 shadow-inner",
                            morningComplete[idx] ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-300 border-slate-100"
                          )}>
                            {morningComplete[idx] ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                          </div>
                          <div className="space-y-0.5">
                            <p className={cn("text-base font-black italic uppercase tracking-tight leading-none", morningComplete[idx] ? "text-slate-950" : "text-slate-400")}>{step.name}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{step.brand}</p>
                          </div>
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-300 italic">SYNC_{idx+1}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Evening Sequence interface */}
              <div className="space-y-8 p-10 rounded-[3rem] bg-slate-50/50 border border-slate-100 shadow-inner group/evening">
                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/evening:scale-110 transition-transform duration-700">
                      <Moon className="h-5 w-5 text-blue-600 animate-pulse" />
                    </div>
                    <h4 className="font-black text-xl italic uppercase tracking-tight text-slate-950">{t('regimenTracker.evening' as any) || 'Evening_Sequence'}</h4>
                  </div>
                  <Badge variant="outline" className="bg-white border-slate-100 text-[8px] font-black italic text-slate-400 px-3 py-1 rounded-full uppercase">Restoration_Node</Badge>
                </div>
                <div className="space-y-4">
                  {eveningSteps.map((step, idx) => (
                    <motion.div 
                      key={step.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => {
                        const newComplete = [...eveningComplete]
                        newComplete[idx] = !newComplete[idx]
                        setEveningComplete(newComplete)
                      }}
                      className={cn(
                        "p-6 rounded-[2rem] border transition-all duration-500 cursor-pointer group/step relative overflow-hidden",
                        eveningComplete[idx] 
                          ? "bg-white border-blue-200 shadow-premium" 
                          : "bg-white/50 border-slate-100 hover:bg-white hover:border-blue-500/20 shadow-sm"
                      )}
                    >
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-100 group-hover/step:bg-blue-600 transition-all duration-700" />
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-5">
                          <div className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center border transition-all duration-700 group-hover/step:scale-110 shadow-inner",
                            eveningComplete[idx] ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-slate-50 text-slate-300 border-slate-100"
                          )}>
                            {eveningComplete[idx] ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                          </div>
                          <div className="space-y-0.5">
                            <p className={cn("text-base font-black italic uppercase tracking-tight leading-none", eveningComplete[idx] ? "text-slate-950" : "text-slate-400")}>{step.name}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{step.brand}</p>
                          </div>
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-300 italic">SYNC_{idx+1}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Adherence Intelligence interface */}
          <div className="lg:col-span-4 space-y-10">
            <div className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-premium space-y-10 group/stats transition-all duration-700 hover:border-emerald-500/20">
              <div className="space-y-4">
                <div className="flex justify-between items-end px-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic leading-none">{t('regimenTracker.complianceScore' as any) || 'Protocol_Adherence_Yield'}</p>
                  <p className="text-4xl font-black text-slate-950 italic tracking-tighter uppercase leading-none group-hover/stats:text-emerald-600 transition-colors">{complianceScore}%</p>
                </div>
                <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner p-1 relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${complianceScore}%` }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-glow-emerald/30 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-shimmer" />
                  </motion.div>
                </div>
              </div>

              <div className="space-y-8">
                <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4 italic">{t('ui.labels.aestheticAdherenceInsights' as any) || 'Synthesis_Insights'}</h5>
                <div className="space-y-6">
                  <div className="flex gap-6 group/item">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 shadow-sm group-hover/item:scale-110 transition-transform duration-700">
                      <TrendingUp className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div className="space-y-1 pt-1">
                      <p className="text-sm text-slate-600 font-medium italic leading-relaxed tracking-tight">
                        {t('ui.labels.adherenceIncrease' as any || 'Adherence index improved by {percent} since last node cycle.').replace('{percent}', '12%')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-6 group/item">
                    <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 shadow-sm group-hover/item:scale-110 transition-transform duration-700">
                      <Calendar className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="space-y-1 pt-1">
                      <p className="text-sm text-slate-600 font-medium italic leading-relaxed tracking-tight">
                        {t('ui.labels.nextNodeScan' as any || 'Next neural node scan scheduled in {days} temporal days.').replace('{days}', '4')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Button variant="outline" size="xl" className="w-full h-18 rounded-[2rem] border-slate-200 bg-white text-slate-950 font-black uppercase tracking-[0.2em] text-[10px] italic shadow-sm hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 group/btn">
                {t('ui.labels.viewProtocolAnalysis' as any) || 'Inference_Log'}
                <ChevronRight className="ml-3 h-5 w-5 text-slate-300 group-hover/btn:text-pink-600 group-hover/btn:translate-x-1 transition-all" />
              </Button>
            </div>

            <div className="p-10 rounded-[3.5rem] bg-slate-950 text-white relative overflow-hidden group/box shadow-2xl">
              <div className="absolute top-0 right-0 p-10 opacity-[0.05] group-hover/box:rotate-12 group-hover/box:scale-110 transition-transform duration-1000">
                <ShieldCheck className="w-32 h-32 text-white" />
              </div>
              <div className="flex items-center gap-6 relative z-10 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-pink-500 shadow-lg">
                  <Activity className="h-6 w-6 animate-pulse" />
                </div>
                <h5 className="text-[11px] font-black uppercase tracking-[0.4em] text-pink-500 italic">Adherence_Guard</h5>
              </div>
              <p className="text-sm text-slate-400 font-medium italic leading-relaxed relative z-10 tracking-tight">
                Maintaining a high adherence coefficient is critical for realizing projected biological outcomes. Protocol synchronization verified.
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <div className="p-10 lg:p-12 py-8 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
        <div className="flex items-center gap-5 text-slate-400 group/status cursor-default">
          <ShieldCheck className="h-5 w-5 group-hover:text-emerald-500 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">Protocol_Integrity_Verified: NOMINAL</p>
        </div>
        <p className="text-[10px] font-black text-pink-600/60 uppercase tracking-widest italic bg-white px-6 py-2 rounded-full shadow-sm border border-slate-100">BIP-Regimen-v4.8 // Active_Sync</p>
      </div>
    </Card>
  )
}
