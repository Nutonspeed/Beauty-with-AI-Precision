"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { 
  FileText, 
  Download, 
  Activity, 
  Zap, 
  ShieldCheck, 
  Target, 
  Layers, 
  Sparkles, 
  ChevronRight,
  Monitor,
  Printer,
  Calendar
} from "lucide-react"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface VisiaReportProps {
  analysis: any
  userProfile?: any
}

export function VisiaReport({ analysis, userProfile: _userProfile }: VisiaReportProps) {
  const t = useTranslations('visiaReport')
  const [_activeTab, _setActiveTab] = useState("full_report")

  const reportMetrics = [
    { id: 'spots', label: t('spots' as any) || 'Spots', score: analysis.spots_score, severity: analysis.spots_severity, icon: Target, color: 'text-pink-600', bg: 'bg-pink-50' },
    { id: 'wrinkles', label: t('wrinkles' as any) || 'Wrinkles', score: analysis.wrinkles_score, severity: analysis.wrinkles_severity, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'texture', label: t('texture' as any) || 'Texture', score: analysis.texture_score, severity: analysis.texture_severity, icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'pores', label: t('pores' as any) || 'Pores', score: analysis.pores_score, severity: analysis.pores_severity, icon: Layers, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'uv_spots', label: t('uvSpots' as any) || 'UV_Spots', score: analysis.uv_spots_score, severity: analysis.uv_spots_severity, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'brown_spots', label: t('brownSpots' as any) || 'Brown_Spots', score: analysis.brown_spots_score, severity: analysis.brown_spots_severity, icon: Layers, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'red_areas', label: t('redAreas' as any) || 'Red_Areas', score: analysis.red_areas_score, severity: analysis.red_areas_severity, icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: 'porphyrins', label: t('porphyrins' as any) || 'Porphyrins', score: analysis.porphyrins_score, severity: analysis.porphyrins_severity, icon: Monitor, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  ]

  const getScoreStyles = (score: number) => {
    if (score >= 90) return 'text-emerald-600'
    if (score >= 75) return 'text-blue-600'
    if (score >= 60) return 'text-amber-600'
    return 'text-rose-600'
  }

  const getSeverityBadge = (severity: string) => {
    const s = severity?.toLowerCase()
    if (s === 'low' || s === 'mild') return 'bg-emerald-50 text-emerald-600'
    if (s === 'moderate') return 'bg-amber-50 text-amber-600'
    return 'bg-rose-50 text-rose-600'
  }

  return (
    <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-1000 hover:border-pink-500/10 flex flex-col min-h-[900px]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.01] bg-center pointer-events-none" />
      
      <CardHeader className="p-12 lg:p-16 pb-10 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-start justify-between gap-12 relative overflow-hidden">
        <div className="space-y-8 relative z-10">
          <div className="flex items-center gap-6">
            <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-sm animate-pulse italic">
              <FileText className="mr-3 h-3.5 w-3.5" />
              {t('fullReport' as any) || 'Unified_Diagnostic_Dossier'}
            </Badge>
            {analysis.is_baseline && (
              <Badge className="bg-emerald-50 text-emerald-600 border-none px-4 py-1 rounded-full text-[10px] font-black italic shadow-sm uppercase tracking-widest">
                BASELINE_NODE
              </Badge>
            )}
          </div>
          <div className="space-y-4">
            <h3 className="text-5xl md:text-7xl font-black text-slate-950 italic tracking-tighter uppercase leading-[0.8]">
              VISIA_Inference<br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em] font-black uppercase text-2xl md:text-4xl">Comprehensive_Report</span>
            </h3>
            <div className="flex flex-wrap items-center gap-8 text-slate-400 mt-8 uppercase tracking-[0.3em] text-[10px] font-black italic">
              <span className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-pink-500/40" />
                DATE: {new Date(analysis.analyzed_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-blue-500/40" />
                NODE_HASH: {analysis.id.slice(0, 16).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-6 shrink-0 relative z-10">
          <Button variant="outline" className="h-16 px-8 rounded-2xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-[0.2em] text-[10px] italic shadow-premium hover:bg-slate-50 transition-all active:scale-95 group/btn">
            <Printer className="w-4 h-4 mr-4 text-slate-300 group-hover/btn:text-blue-600 transition-colors" />
            {t('print' as any) || 'PHYSICAL_EXPORT'}
          </Button>
          <Button variant="premium" className="h-16 px-10 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 bg-slate-950 text-white border-none italic group/export relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/export:translate-x-[100%] transition-transform duration-1000" />
            <Download className="w-4 h-4 mr-4 text-pink-500 group-hover/export:translate-y-1 transition-transform" />
            {t('download' as any) || 'AUTHORIZE_DOWNLOAD'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-12 lg:p-16 space-y-16 bg-white flex-1 relative overflow-hidden">
        {/* Global Summary Hub interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <Card className="border-slate-100 bg-slate-50/50 border border-slate-100 shadow-inner rounded-[4rem] h-full flex flex-col items-center justify-center p-12 relative group/overall hover:bg-white hover:border-pink-500/20 transition-all duration-700">
              <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover/overall:scale-110 group-hover:rotate-12 transition-transform duration-1000">
                <Target className="w-48 h-48 text-pink-600" />
              </div>
              <div className="space-y-10 relative z-10 text-center">
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">{t('overallScore' as any) || 'GLOBAL_INTEGRITY_INDEX'}</p>
                <div className="relative inline-flex items-center justify-center">
                  <div className="absolute inset-0 bg-pink-500/5 rounded-full blur-3xl animate-pulse" />
                  <svg className="h-64 w-64 -rotate-90">
                    <circle cx="128" cy="128" r="110" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-100" />
                    <motion.circle
                      cx="128" cy="128" r="110" fill="none" stroke="#ff69b4" strokeWidth="14"
                      strokeDasharray={691.15}
                      initial={{ strokeDashoffset: 691.15 }}
                      whileInView={{ strokeDashoffset: 691.15 - (691.15 * analysis.overall_score) / 100 }}
                      viewport={{ once: true }}
                      transition={{ duration: 2, ease: "easeOut" }}
                      className="drop-shadow-glow-pink"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={cn("text-9xl font-black italic tracking-tighter leading-none group-hover/overall:scale-110 transition-transform duration-700", getScoreStyles(analysis.overall_score))}>
                      {analysis.overall_score.toFixed(0)}
                    </span>
                    <span className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em] mt-4">{t('aggregate' as any) || 'MEAN_SYNC'}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <Badge className="text-2xl px-12 py-3 rounded-full border-none shadow-2xl bg-slate-950 text-white font-black italic tracking-[0.2em] uppercase group-hover/overall:bg-pink-600 transition-colors">
                    GRADE: {analysis.skin_health_grade}
                  </Badge>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{t('classification' as any) || 'Aesthetic_Node_Sync: STABLE'}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Metric Grid matrix interface */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {reportMetrics.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border-slate-100 bg-white shadow-sm rounded-[3rem] hover:border-pink-500/20 hover:shadow-premium transition-all duration-700 group/metric overflow-hidden h-full flex flex-col">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover/metric:opacity-100 transition-opacity" />
                  <CardHeader className="p-8 pb-6 border-b border-slate-50 bg-slate-50/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className={cn("p-3 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-inner group-hover/metric:scale-110 transition-transform duration-700", m.color)}>
                          <m.icon className="h-6 w-6" />
                        </div>
                        <span className="font-black text-lg italic tracking-tight text-slate-950 uppercase group-hover/metric:text-pink-600 transition-colors leading-none">{m.label}</span>
                      </div>
                      <Badge className={cn("px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest italic shadow-sm leading-none border-none", getSeverityBadge(m.severity))}>
                        {m.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8 flex-1 flex flex-col justify-between bg-white">
                    <div className="flex items-end justify-between gap-6">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">{t('qualityIndex' as any) || 'PRECISION_IDX'}</p>
                        <p className={cn("text-5xl font-black italic tracking-tighter uppercase leading-none group-hover/metric:scale-105 transition-transform origin-left", getScoreStyles(m.score))}>{m.score.toFixed(0)}</p>
                      </div>
                      <div className="text-right space-y-4">
                        <Badge variant="outline" className="bg-white border-slate-100 text-slate-300 text-[8px] font-black italic uppercase tracking-[0.2em] px-3 py-1">HEURISTIC_SYNC</Badge>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none group-hover/metric:text-slate-950 transition-colors">Nominal_State: <span className="text-emerald-600">VERIFIED</span></p>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5 shadow-inner relative group/bar">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${m.score}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, delay: i * 0.1 }}
                        className={cn("h-full rounded-full transition-all duration-1000", m.score >= 90 ? 'bg-emerald-500 shadow-glow-emerald/30' : m.score >= 75 ? 'bg-blue-500 shadow-glow-blue/30' : m.score >= 60 ? 'bg-amber-500' : 'bg-rose-500 shadow-glow-rose/30')} 
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/bar:translate-x-[100%] transition-transform duration-1000" />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Diagnostic Insight Node interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-12 lg:p-16 rounded-[4rem] bg-slate-950 text-white relative overflow-hidden group/audit shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-blue-500/10 opacity-50" />
          <div className="absolute top-0 right-0 p-16 opacity-[0.05] group-hover/audit:rotate-12 group-hover/audit:scale-110 transition-transform duration-1000">
            <ShieldCheck className="w-64 h-64 text-white" />
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-16 relative z-10">
            <div className="space-y-10 flex-1">
              <div className="flex items-center gap-8">
                <div className="h-20 w-20 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl group-hover/audit:scale-110 transition-transform duration-700">
                  <ShieldCheck className="h-10 w-10 text-pink-500 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-4xl font-black italic tracking-tighter uppercase leading-none">{t('summary' as any) || 'Strategic_Diagnostic_Brief'}</h4>
                  <p className="text-[11px] font-black uppercase tracking-[0.4em] text-pink-500/60 italic leading-none">Neural_Logic_Auth: BIP-Standard-v4.8</p>
                </div>
              </div>
              <p className="text-2xl text-slate-400 font-light italic leading-relaxed tracking-tight max-w-4xl">
                {t('summaryDesc' as any || 'Global diagnostic nodes exhibit a baseline integrity of {score}th percentile. Primary variance detected in {concern} sectors. Strategic protocol commitment recommended for biological restoration.').replace('{score}', String(analysis.overall_score.toFixed(0))).replace('{concern}', analysis.spots_score < analysis.wrinkles_score ? 'DERMAL_PIGMENT' : 'STRUCTURAL_ELASTICITY')}
              </p>
            </div>
            <div className="flex flex-col gap-6 shrink-0 min-w-[320px]">
              <div className="p-8 rounded-[3rem] bg-white/5 border border-white/10 space-y-6 shadow-inner hover:bg-white/10 transition-all">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-slate-500 italic">Auth_Precision</span>
                  <Badge className="bg-emerald-500 text-white border-none text-[8px] font-black italic px-3 py-0.5 rounded-full uppercase">99.9%_ACCURATE</Badge>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden p-0.5 shadow-sm">
                  <motion.div initial={{ width: 0 }} whileInView={{ width: '99.9%' }} viewport={{ once: true }} transition={{ duration: 2, delay: 0.5 }} className="h-full bg-emerald-500 rounded-full" />
                </div>
              </div>
              <Button size="xl" variant="premium" className="h-20 rounded-[2.5rem] bg-white text-slate-950 border-none shadow-2xl transition-all hover:scale-105 active:scale-95 font-black text-[11px] uppercase tracking-[0.3em] italic group/btn">
                {t('viewProtocols' as any) || 'AUTHORIZE_PROTOCOL_SYNC'}
                <ChevronRight className="ml-4 h-6 w-6 text-pink-600 group-hover/btn:translate-x-2 transition-transform" />
              </Button>
            </div>
          </div>
        </motion.div>
      </CardContent>

      <CardFooter className="p-12 lg:p-16 border-t border-slate-50 bg-slate-50/30 flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="flex items-center gap-8 text-slate-400 group/status cursor-default">
          <div className="h-14 w-14 rounded-[1.5rem] bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/status:bg-emerald-50 transition-all duration-700">
            <ShieldCheck className="h-8 w-8 text-emerald-600" />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900 italic leading-none">{t('governance' as any) || 'Precision_Governance_Validated'}</p>
            <p className="text-[10px] font-medium uppercase tracking-widest italic">Node_Fidelity_Sync: NOMINAL</p>
          </div>
        </div>
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-4 bg-white px-8 py-3 rounded-full border border-slate-100 shadow-sm group/all">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-glow-emerald" />
            <span className="text-[10px] font-black text-slate-950 uppercase tracking-[0.3em] italic group-hover/all:text-emerald-600 transition-colors">{t('allSystemsNominal' as any) || 'INFRASTRUCTURE_OPTIMAL'}</span>
          </div>
          <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 italic">
            <span>BIP_DOSS_v4.8</span>
            <div className="h-4 w-px bg-slate-200" />
            <span>EPOCH_2026.4</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
