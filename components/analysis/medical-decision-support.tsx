"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ShieldCheck, Stethoscope, Microscope, BookOpen, AlertCircle, Zap, ArrowRight, Brain } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface MedicalDecisionSupportProps {
  isEnterprise: boolean
  skinData: any
}

export function MedicalDecisionSupport({ isEnterprise, skinData }: MedicalDecisionSupportProps) {
  const t = useTranslations('medicalDecisionSupport');
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleConsultAI = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
      toast.success(t('aestheticRationaleGenerated'))
    }, 2500)
  }

  const aestheticInsights = [
    {
      title: t('differentialDiagnosis'),
      items: [
        { label: t('melasma'), probability: 85, reasoning: t('melasmaReasoning') },
        { label: t('pih'), probability: 12, reasoning: t('pihReasoning') },
      ]
    },
    {
      title: t('programRationale'),
      items: [
        { label: t('yagLaser'), rationale: t('yagRationale') },
        { label: t('tranexamic'), rationale: t('tranexamicRationale') },
      ]
    }
  ]

  return (
    <Card className={cn(
      "border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group h-full flex flex-col",
      !isEnterprise && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      
      {!isEnterprise && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#020617]/60 backdrop-blur-sm p-10 text-center">
          <Badge className="mb-4 bg-cyan-500/20 text-cyan-400 border-cyan-500/30 uppercase tracking-widest font-black">{t('systemLocked')}</Badge>
          <h2 className="text-2xl font-bold text-white italic mb-4">{t('aestheticDecisionSupport')}</h2>
          <p className="text-slate-400 max-w-sm font-light mb-8">
            {t('lockedDescription')}
          </p>
          <Button variant="premium" className="h-14 px-10 rounded-2xl border shadow-xl shadow-cyan-500/20 uppercase text-[10px] font-black tracking-widest italic">
            {t('upgradeEnterprise')}
          </Button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.02] to-transparent animate-neural-pulse pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <Microscope className="h-8 w-8 text-cyan-400" />
            {t('title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('subtitle')}
          </CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="hidden sm:inline-flex px-4 py-1 rounded-full border-cyan-500/30 text-cyan-400 bg-cyan-500/5 font-black italic tracking-widest text-[9px]">
            {t('enterpriseElite')}
          </Badge>
          <Button 
            onClick={handleConsultAI}
            disabled={isAnalyzing || !isEnterprise}
            className="h-14 px-8 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-[#020617] font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-cyan-600/20 italic"
          >
            {isAnalyzing ? <Zap className="h-4 w-4 animate-spin mr-2" /> : <Brain className="h-4 w-4 mr-2" />}
            {t('consultAI')}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-12 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Aesthetic Intelligence Node */}
          {aestheticInsights.map((section, idx) => (
            <div key={idx} className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center animate-synaptic-fire">
                  {idx === 0 ? <Stethoscope className="h-5 w-5 text-cyan-500" /> : <BookOpen className="h-5 w-5 text-pink-500" />}
                </div>
                <h4 className="text-sm font-black uppercase tracking-widest text-white italic">{section.title}</h4>
              </div>
              
              <div className="space-y-6">
                {section.items.map((item: any, itemIdx: number) => (
                  <div key={itemIdx} className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/[0.04] transition-all group/insight relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                      <p className="text-md font-bold text-white italic tracking-tight">{item.label}</p>
                      {item.probability && (
                        <Badge className="bg-cyan-500/10 text-cyan-400 border-none px-3 py-0.5 text-[10px] font-black italic">
                          {item.probability}% MATCH
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-light leading-relaxed italic">
                      {item.reasoning || item.rationale}
                    </p>
                    {item.probability && (
                      <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${item.probability}%` }} className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Global Evidence Base Node */}
        <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                <ShieldCheck className="h-8 w-8 text-cyan-500" />
              </div>
              <h4 className="text-lg font-bold text-white italic">{t('protocolIntegrity', { value: 99.8 })}</h4>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">{t('validatedByAestheticAI')}</p>
            </div>
          </div>
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest italic hover:bg-white/10">
            {t('viewSourceMetaData')}
            <ArrowRight className="ml-3 h-4 w-4" />
          </Button>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-white/5 bg-white/[0.01]">
        <div className="flex items-center gap-4 text-slate-600">
          <AlertCircle className="h-5 w-5" />
          <p className="text-[9px] font-black uppercase tracking-[0.2em] italic">
            {t('specialistConfirmation')}: {t('requiredBeforeAuthorizedProtocol')}
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
