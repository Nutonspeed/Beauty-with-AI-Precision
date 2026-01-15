"use client"

import { useState } from "react"
import { ClipboardCheck, Syringe, Stethoscope, ArrowRight, Zap, RefreshCw, CheckCircle2, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

interface VisionToOrderProps {
  _analysisId: string
  recommendations: any
}

export function VisionToOrderPanel({ _analysisId, recommendations }: VisionToOrderProps) {
  const t = useTranslations('visionToOrder');
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSynced, setIsSynced] = useState(false)

  // Simulated mapping of programs to medical supplies
  const medicalSuppliesMapping: Record<string, string[]> = {
    'Botox': t.raw('supplies.botox') as string[],
    'Filler': t.raw('supplies.filler') as string[],
    'HIFU': t.raw('supplies.hifu') as string[],
    'Laser': t.raw('supplies.laser') as string[]
  }

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setIsSynced(true)
      toast.success(t('draftStatus'))
    }, 2000)
  }

  const programs = recommendations?.programs || []
  const allSupplies: string[] = Array.from(new Set(programs.flatMap((p: any) => {
    const key = Object.keys(medicalSuppliesMapping).find(k => p.name.includes(k))
    return key ? medicalSuppliesMapping[key] : (t.raw('supplies.standard') as string[])
  })))

  return (
    <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      
      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-row items-center justify-between">
        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <Zap className="h-8 w-8 text-cyan-400" />
            {t('title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('subtitle')}
          </CardDescription>
        </div>
        <Badge variant="outline" className="px-4 py-1 rounded-full border-cyan-500/30 text-cyan-400 bg-cyan-500/5 font-black italic tracking-widest text-[9px]">
          {t('efficiencyBadge')}
        </Badge>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Program Selection Node */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                <Stethoscope className="h-5 w-5 text-cyan-500" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-widest text-white italic">{t('recommendedItems')}</h4>
            </div>
            <div className="space-y-4">
              {programs.map((program: any, idx: number) => (
                <div key={idx} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group/item hover:bg-white/[0.04] transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                    <p className="text-sm font-bold text-white italic">{program.name}</p>
                  </div>
                  <Badge variant="outline" className="text-[8px] font-black tracking-widest border-white/10 text-slate-500">Node_{idx+1}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Medical Supplies Auto-Draft */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
                <Syringe className="h-5 w-5 text-pink-500" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-widest text-white italic">{t('medicalSupplies')}</h4>
            </div>
            <div className="p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
              <div className="grid grid-cols-1 gap-3">
                {allSupplies.map((supply: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 text-xs text-slate-400 font-light">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/60" />
                    <span>{supply}</span>
                  </div>
                ))}
              </div>
              {isSynced && (
                <div className="pt-4 border-t border-white/5 flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{t('validatedByAesthetic')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-white/5 bg-white/[0.01] flex flex-col sm:flex-row gap-4">
        {!isSynced ? (
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full sm:w-auto h-16 px-10 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-[#020617] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-cyan-600/20 italic"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="mr-3 h-4 w-4 animate-spin" />
                {t('synchronizing')}
              </>
            ) : (
              <>
                {t('generateButton')}
                <ArrowRight className="ml-3 h-4 w-4" />
              </>
            )}
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button variant="outline" className="flex-1 h-16 rounded-2xl border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 italic text-cyan-400">
              <RefreshCw className="mr-3 h-4 w-4" />
              {t('syncToPharmacy')}
            </Button>
            <Button variant="premium" className="flex-1 h-16 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-[0.2em] italic border">
              <ClipboardCheck className="mr-3 h-4 w-4" />
              {t('syncToSpecialist')}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
