"use client"

import { motion } from "framer-motion"
import { 
  Activity, 
  Target, 
  ChevronRight,
  ArrowUpRight,
  Calendar,
  Sparkles,
  Layers,
  Fingerprint
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

interface AnalysisCardProps {
  analysis: any
  onClick?: () => void
  isCompact?: boolean
}

export function AnalysisCard({ analysis, onClick, isCompact = false }: AnalysisCardProps) {
  const t = useTranslations('analysisCard')

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600'
    if (score >= 75) return 'text-blue-600'
    if (score >= 60) return 'text-amber-600'
    return 'text-rose-600'
  }

  const getHealthBg = (score: number) => {
    if (score >= 90) return 'bg-emerald-50'
    if (score >= 75) return 'bg-blue-50'
    if (score >= 60) return 'bg-amber-50'
    return 'bg-rose-50'
  }

  if (isCompact) {
    return (
      <Card 
        onClick={onClick}
        className="border-slate-100 bg-white shadow-sm hover:shadow-premium hover:border-pink-500/20 rounded-[2.5rem] transition-all duration-700 group cursor-pointer overflow-hidden relative"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardContent className="p-8 flex items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-700", getHealthBg(analysis.overall_score))}>
              <Target className={cn("h-8 w-8", getHealthColor(analysis.overall_score))} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none mb-1">SESSION_NODE</p>
              <h4 className="text-xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{new Date(analysis.analyzed_at).toLocaleDateString()}</h4>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="outline" className="text-[8px] font-black italic px-2 py-0 border-slate-100 text-slate-400 uppercase">
                  ID: {analysis.id.slice(0, 8)}
                </Badge>
                {analysis.is_baseline && (
                  <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-black italic px-2 py-0 uppercase">BASELINE</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className={cn("text-4xl font-black italic tracking-tighter leading-none mb-1", getHealthColor(analysis.overall_score))}>
              {analysis.overall_score.toFixed(0)}
            </p>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic leading-none">SCORE</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      onClick={onClick}
      className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] hover:border-pink-500/20 transition-all duration-1000 group cursor-pointer overflow-hidden relative flex flex-col h-full"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.01] bg-center pointer-events-none" />
      
      <CardHeader className="p-10 pb-6 border-b border-slate-50 bg-slate-50/30 flex flex-row items-center justify-between relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-4 py-1 rounded-full border-pink-500/20 text-pink-600 bg-white text-[9px] font-black italic shadow-sm uppercase tracking-widest">
              <Calendar className="mr-2 h-3 w-3" />
              {new Date(analysis.analyzed_at).toLocaleDateString()}
            </Badge>
            {analysis.is_baseline && (
              <Badge className="bg-emerald-50 text-emerald-600 border-none px-4 py-1 rounded-full text-[9px] font-black italic shadow-sm uppercase tracking-widest">
                BASELINE_NODE
              </Badge>
            )}
          </div>
          <CardTitle className="text-2xl font-black text-slate-950 italic tracking-tighter uppercase leading-none mt-2">
            Diagnostic_Session_{analysis.id.slice(0, 4)}
          </CardTitle>
        </div>
        <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-pink-600 group-hover:text-white transition-all duration-700 relative z-10">
          <ArrowUpRight className="h-7 w-7" />
        </div>
      </CardHeader>

      <CardContent className="p-10 space-y-10 flex-1 bg-white relative">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic leading-none">{t('globalScore' as any) || 'GLOBAL_SCORE'}</p>
            <p className={cn("text-7xl font-black italic tracking-tighter leading-none transition-transform group-hover:scale-105 origin-left duration-700", getHealthColor(analysis.overall_score))}>
              {analysis.overall_score.toFixed(0)}
            </p>
          </div>
          <div className="text-right space-y-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 shadow-inner inline-block">
              <Activity className="h-6 w-6 text-slate-300 group-hover:text-pink-600 transition-colors" />
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">STATUS: <span className="text-emerald-600">VERIFIED</span></p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {[
            { label: 'Spots', value: analysis.spots_score, icon: Target, color: 'text-pink-600' },
            { label: 'Wrinkles', value: analysis.wrinkles_score, icon: Activity, color: 'text-blue-600' },
            { label: 'Texture', value: analysis.texture_score, icon: Sparkles, color: 'text-purple-600' },
            { label: 'Pores', value: analysis.pores_score, icon: Layers, color: 'text-emerald-600' }
          ].map((metric, i) => (
            <div key={metric.label} className="space-y-2">
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400 italic">
                <span>{metric.label}</span>
                <span className={getHealthColor(metric.value)}>{metric.value}%</span>
              </div>
              <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden p-[1px] shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${metric.value}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className={cn("h-full rounded-full", metric.value >= 75 ? 'bg-emerald-500' : metric.value >= 50 ? 'bg-blue-500' : 'bg-rose-500')}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="p-10 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm">
            <Fingerprint className="h-4 w-4 text-slate-300" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none">BIP_v4.8_NODE</p>
        </div>
        <Button variant="ghost" className="h-10 px-6 rounded-xl text-slate-900 font-black uppercase tracking-widest text-[9px] italic hover:bg-white hover:shadow-sm transition-all group/view">
          {t('viewDetails' as any) || 'View_Protocol'}
          <ChevronRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  )
}
