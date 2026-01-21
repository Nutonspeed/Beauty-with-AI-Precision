"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Zap, ArrowRight, ShieldCheck, Activity, Target, Brain } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Recommendation {
  id: string
  title: string
  desc: string
  impact: string
  complexity: 'low' | 'medium' | 'high'
  category: 'revenue' | 'efficiency' | 'expansion'
}

export function StrategicGrowthAdvisor() {
  const t = useTranslations('home.salesWizard')
  const [isExecuting, setIsExecuting] = useState<string | null>(null)

  const recommendations: Recommendation[] = [
    {
      id: 'rec1',
      title: t('strategicGrowthAdvisor.recs.rec1.title'),
      desc: t('strategicGrowthAdvisor.recs.rec1.desc'),
      impact: t('strategicGrowthAdvisor.recs.rec1.impact'),
      complexity: 'medium',
      category: 'revenue'
    },
    {
      id: 'rec2',
      title: t('strategicGrowthAdvisor.recs.rec2.title'),
      desc: t('strategicGrowthAdvisor.recs.rec2.desc'),
      impact: t('strategicGrowthAdvisor.recs.rec2.impact'),
      complexity: 'low',
      category: 'efficiency'
    },
    {
      id: 'rec3',
      title: t('strategicGrowthAdvisor.recs.rec3.title'),
      desc: t('strategicGrowthAdvisor.recs.rec3.desc'),
      impact: t('strategicGrowthAdvisor.recs.rec3.impact'),
      complexity: 'high',
      category: 'expansion'
    }
  ]

  const handleExecute = (id: string) => {
    setIsExecuting(id)
    setTimeout(() => {
      setIsExecuting(null)
      toast.success(t('strategicGrowthAdvisor.actionExecuted'))
    }, 2500)
  }

  const getComplexityLabel = (complexity: string) => {
    switch (complexity) {
      case 'low': return t('strategicGrowthAdvisor.low')
      case 'medium': return t('strategicGrowthAdvisor.medium')
      default: return t('strategicGrowthAdvisor.high')
    }
  }

  return (
    <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group h-full flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
      
      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/[0.02] to-transparent animate-neural-pulse pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <Brain className="h-8 w-8 text-amber-400" />
            {t('strategicGrowthAdvisor.title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('strategicGrowthAdvisor.subtitle')}
          </CardDescription>
        </div>
        <Badge variant="outline" className="px-4 py-1 rounded-full border-amber-500/30 text-amber-400 bg-amber-500/5 font-black italic tracking-widest text-[9px]">
          {t('strategicGrowthAdvisor.activeAdvisory')}
        </Badge>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-10 flex-1">
        <div className="space-y-6">
          {recommendations.map((rec, idx) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group/rec relative overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex items-start gap-6">
                  <div className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner transition-transform group-hover/rec:scale-110 animate-synaptic-fire",
                    rec.category === 'revenue' ? 'bg-emerald-500/10 text-emerald-400' :
                    rec.category === 'efficiency' ? 'bg-cyan-500/10 text-cyan-400' :
                    'bg-purple-500/10 text-purple-400'
                  )}>
                    <Target className="h-7 w-7" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t(`strategicGrowthAdvisor.recommendation`)}</span>
                      <div className="h-1 w-1 rounded-full bg-white/10" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">{rec.category}</span>
                    </div>
                    <h4 className="text-xl font-bold text-white italic tracking-tight">{rec.title}</h4>
                    <p className="text-sm text-slate-400 font-light leading-relaxed italic">{rec.desc}</p>
                  </div>
                </div>

                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-6 min-w-[180px]">
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">{t('strategicGrowthAdvisor.impact')}</p>
                    <p className="text-lg font-black text-emerald-400 italic tracking-tighter">{rec.impact}</p>
                  </div>
                  <Button 
                    onClick={() => handleExecute(rec.id)}
                    disabled={isExecuting !== null}
                    className={cn(
                      "h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[9px] italic transition-all",
                      isExecuting === rec.id ? "bg-amber-500 text-[#020617] animate-pulse" : "bg-white/5 hover:bg-white text-white hover:text-[#020617]"
                    )}
                  >
                    {isExecuting === rec.id ? <Zap className="h-3 w-3 animate-spin mr-2" /> : <Activity className="h-3 w-3 mr-2" />}
                    {t('strategicGrowthAdvisor.executeAction')}
                  </Button>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">{t('strategicGrowthAdvisor.implementation')}:</span>
                  <Badge variant="outline" className={cn(
                    "text-[8px] font-black border-white/10 italic",
                    rec.complexity === 'low' ? "text-emerald-400" :
                    rec.complexity === 'medium' ? "text-amber-400" :
                    "text-rose-400"
                  )}>
                    {getComplexityLabel(rec.complexity)}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" className="text-[9px] font-black text-cyan-400 uppercase tracking-widest italic hover:bg-white/5">
                  {t('strategicGrowthAdvisor.viewRationale')}
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-white/5 bg-white/[0.01]">
        <div className="flex items-center gap-4 text-slate-600">
          <ShieldCheck className="h-5 w-5" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">{t('ui.hud.strategicCertified')}</p>
        </div>
      </CardFooter>
    </Card>
  )
}
