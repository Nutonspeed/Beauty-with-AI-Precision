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
    <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden relative group h-full flex flex-col transition-all duration-700 hover:border-pink-500/20">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
      
      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <CardTitle className="text-3xl font-black text-slate-950 tracking-tight italic flex items-center gap-5 uppercase leading-none">
            <div className="p-3 bg-amber-50 rounded-2xl shadow-sm group-hover:bg-amber-500 group-hover:text-white transition-all duration-500">
              <Brain className="h-8 w-8 text-amber-600 group-hover:text-white" />
            </div>
            {t('strategicGrowthAdvisor.title')}
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">
            {t('strategicGrowthAdvisor.subtitle')}
          </CardDescription>
        </div>
        <Badge variant="outline" className="px-5 py-1.5 rounded-full border-none text-amber-600 bg-amber-50 font-black italic tracking-widest text-[10px] shadow-sm uppercase">
          {t('strategicGrowthAdvisor.activeAdvisory')}
        </Badge>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-10 flex-1 bg-slate-50/30">
        <div className="space-y-6">
          {recommendations.map((rec, idx) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 rounded-[2.5rem] bg-white border border-slate-100 hover:border-amber-500/20 transition-all duration-700 group/rec relative overflow-hidden shadow-sm hover:shadow-premium"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex items-start gap-6">
                  <div className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner transition-transform group-hover/rec:scale-110 duration-700",
                    rec.category === 'revenue' ? 'bg-emerald-50 text-emerald-600' :
                    rec.category === 'efficiency' ? 'bg-blue-50 text-blue-600' :
                    'bg-purple-50 text-purple-600'
                  )}>
                    <Target className="h-7 w-7" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{t(`strategicGrowthAdvisor.recommendation`)}</span>
                      <div className="h-1 w-1 rounded-full bg-slate-200" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 italic">{rec.category}</span>
                    </div>
                    <h4 className="text-xl font-black text-slate-950 italic tracking-tight uppercase group-hover:text-amber-600 transition-colors leading-none">{rec.title}</h4>
                    <p className="text-[13px] text-slate-500 font-light leading-relaxed italic tracking-tight">{rec.desc}</p>
                  </div>
                </div>

                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-6 min-w-[180px]">
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{t('strategicGrowthAdvisor.impact')}</p>
                    <p className="text-2xl font-black text-emerald-600 italic tracking-tighter uppercase">{rec.impact}</p>
                  </div>
                  <Button 
                    onClick={() => handleExecute(rec.id)}
                    disabled={isExecuting !== null}
                    className={cn(
                      "h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] italic transition-all shadow-sm",
                      isExecuting === rec.id ? "bg-amber-500 text-white animate-pulse" : "bg-slate-50 hover:bg-amber-500 text-slate-400 hover:text-white"
                    )}
                  >
                    {isExecuting === rec.id ? <Zap className="h-3.5 w-3.5 animate-spin mr-2" /> : <Activity className="h-3.5 w-3.5 mr-2" />}
                    {t('strategicGrowthAdvisor.executeAction')}
                  </Button>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{t('strategicGrowthAdvisor.implementation')}:</span>
                  <Badge variant="outline" className={cn(
                    "text-[9px] font-black border-none italic px-4 py-1 rounded-full shadow-sm uppercase",
                    rec.complexity === 'low' ? "text-emerald-600 bg-emerald-50" :
                    rec.complexity === 'medium' ? "text-amber-600 bg-amber-50" :
                    "text-rose-600 bg-rose-50"
                  )}>
                    {getComplexityLabel(rec.complexity)}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" className="text-[10px] font-black text-blue-600 uppercase tracking-widest italic hover:bg-blue-50 rounded-xl px-4">
                  {t('strategicGrowthAdvisor.viewRationale')}
                  <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-slate-50 bg-white">
        <div className="flex items-center gap-5">
          <ShieldCheck className="h-5 w-5 text-emerald-500" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">{t('ui.hud.strategicCertified')}</p>
        </div>
      </CardFooter>
    </Card>
  )
}
