"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { useTranslations } from "next-intl"
import { 
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Activity,
  Zap,
  Target,
  Layers,
  Clock,
  Droplets,
  Box,
  Sparkles
} from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnalysisRecord {
  id: string
  date: Date
  imageUrl: string
  scores: {
    wrinkles: number
    spots: number
    pores: number
    texture: number
    elasticity: number
    hydration: number
    uvDamage: number
  }
  skinAge: number
  overallScore: number
}

interface SkinComparisonTimelineProps {
  records: AnalysisRecord[]
  locale?: 'th' | 'en'
  className?: string
}

export function SkinComparisonTimeline({ 
  records, 
  locale = 'th',
  className = ''
}: SkinComparisonTimelineProps) {
  const t = useTranslations('skinComparisonTimeline')
  const [beforeIndex, setBeforeIndex] = useState(0)
  const [afterIndex, setAfterIndex] = useState(records.length - 1)
  const [sliderPosition, setSliderPosition] = useState(50)

  if (records.length < 2) {
    return (
      <Card className={cn("border-slate-100 bg-white shadow-premium rounded-[3rem] p-20 text-center space-y-8 italic shadow-inner", className)}>
        <div className="mx-auto h-24 w-24 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200 animate-pulse">
          <Calendar className="h-12 w-12" />
        </div>
        <div className="space-y-4">
          <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tighter leading-none">{t('noRecords' as any) || 'INSUFFICIENT_NODES'}</h3>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Establish at least two temporal records for delta synchronization</p>
        </div>
      </Card>
    )
  }

  const beforeRecord = records[beforeIndex]
  const afterRecord = records[afterIndex]

  const calculateChange = (before: number, after: number, inverse = false) => {
    const diff = inverse ? before - after : after - before
    return {
      value: Math.abs(diff),
      direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same'
    }
  }

  const getChangeIcon = (direction: string, inverse = false) => {
    if (direction === 'same') return <Minus className="h-4 w-4 text-slate-400" />
    if ((direction === 'up' && !inverse) || (direction === 'down' && inverse)) {
      return <TrendingUp className="h-4 w-4 text-emerald-600" />
    }
    return <TrendingDown className="h-4 w-4 text-rose-600" />
  }

  const getChangeStyles = (direction: string, inverse = false) => {
    if (direction === 'same') return 'bg-slate-50 text-slate-400'
    if ((direction === 'up' && !inverse) || (direction === 'down' && inverse)) {
      return 'bg-emerald-50 text-emerald-600'
    }
    return 'bg-rose-50 text-rose-600'
  }

  const metrics = [
    { key: 'wrinkles', label: t('wrinkles' as any) || 'Wrinkles', inverse: true, icon: Activity, color: 'text-emerald-600' },
    { key: 'spots', label: t('spots' as any) || 'Spots', inverse: true, icon: Target, color: 'text-amber-600' },
    { key: 'pores', label: t('pores' as any) || 'Pores', inverse: true, icon: Box, color: 'text-blue-600' },
    { key: 'texture', label: t('texture' as any) || 'Texture', inverse: false, icon: Sparkles, color: 'text-pink-600' },
    { key: 'elasticity', label: t('elasticity' as any) || 'Elasticity', inverse: false, icon: Activity, color: 'text-purple-600' },
    { key: 'hydration', label: t('hydration' as any) || 'Hydration', inverse: false, icon: Droplets, color: 'text-cyan-600' },
    { key: 'uvDamage', label: t('uvDamage' as any) || 'UV_Damage', inverse: true, icon: Zap, color: 'text-amber-500' }
  ]

  const overallChange = calculateChange(beforeRecord.overallScore, afterRecord.overallScore)
  const skinAgeChange = calculateChange(beforeRecord.skinAge, afterRecord.skinAge, true)

  return (
    <div className={cn("space-y-12 animate-in fade-in duration-700", className)}>
      {/* Header interface */}
      <div className="text-center space-y-6 max-w-2xl mx-auto">
        <Badge variant="outline" className="px-6 py-2 rounded-full border-blue-500/30 text-blue-600 bg-blue-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-sm animate-pulse italic">
          <Clock className="mr-3 h-3.5 w-3.5" />
          Longitudinal_Temporal_Sync
        </Badge>
        <h2 className="text-4xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">
          {t('title' as any) || 'Biological_Evolution_Log'}
        </h2>
        <p className="text-lg text-slate-500 font-medium italic leading-relaxed tracking-tight">
          {t('subtitle' as any) || 'Long-term biological transformation tracking across established diagnostic nodes.'}
        </p>
      </div>

      {/* Temporal Node Selector architecture interface */}
      <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden group transition-all duration-1000 hover:border-pink-500/10">
        <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div className="flex-1 space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4 italic leading-none">{t('before' as any) || 'BASELINE_NODE'}</label>
              <div className="relative group/sel">
                <select
                  value={beforeIndex}
                  onChange={(e) => setBeforeIndex(parseInt(e.target.value))}
                  className="h-16 w-full rounded-2xl border border-slate-100 bg-white px-8 text-sm font-black italic text-slate-950 focus:outline-none focus:ring-2 focus:ring-pink-500/10 focus:border-pink-500/30 appearance-none transition-all cursor-pointer shadow-sm uppercase tracking-tight"
                >
                  {records.map((record, i) => (
                    <option key={record.id} value={i} disabled={i >= afterIndex}>
                      NODE_{String(i + 1).padStart(2, '0')} // {record.date.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US')}
                    </option>
                  ))}
                </select>
                <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-hover/sel:text-pink-600 transition-colors">
                  <ChevronRight className="h-5 w-5 transform rotate-90" />
                </div>
              </div>
            </div>
            
            <div className="h-16 w-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-6 shadow-inner">
              <ArrowRight className="h-8 w-8 text-slate-200 animate-pulse" />
            </div>

            <div className="flex-1 space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-600 ml-4 italic leading-none">{t('after' as any) || 'TARGET_NODE'}</label>
              <div className="relative group/sel">
                <select
                  value={afterIndex}
                  onChange={(e) => setAfterIndex(parseInt(e.target.value))}
                  className="h-16 w-full rounded-2xl border border-pink-100 bg-white px-8 text-sm font-black italic text-slate-950 focus:outline-none focus:ring-2 focus:ring-pink-500/10 focus:border-pink-500/30 appearance-none transition-all cursor-pointer shadow-sm uppercase tracking-tight"
                >
                  {records.map((record, i) => (
                    <option key={record.id} value={i} disabled={i <= beforeIndex}>
                      NODE_{String(i + 1).padStart(2, '0')} // {record.date.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US')}
                    </option>
                  ))}
                </select>
                <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-pink-300 group-hover/sel:text-pink-600 transition-colors">
                  <ChevronRight className="h-5 w-5 transform rotate-90" />
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 bg-white">
          <div className="relative aspect-[4/3] bg-slate-950 group/viewport overflow-hidden">
            {/* Before Image Asset interface */}
            <div className="absolute inset-0">
              {beforeRecord.imageUrl ? (
                <Image
                  src={beforeRecord.imageUrl}
                  alt="Baseline"
                  fill
                  className="object-contain opacity-90 transition-opacity duration-1000"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-900 italic opacity-40">
                  <span className="text-white font-black uppercase tracking-[0.5em]">{t('before' as any) || 'BASELINE_ASSET_OFFLINE'}</span>
                </div>
              )}
            </div>

            {/* After Image Asset with Neural Clip interface */}
            <div 
              className="absolute inset-0 overflow-hidden z-10"
              style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
            >
              {afterRecord.imageUrl ? (
                <Image
                  src={afterRecord.imageUrl}
                  alt="Synthesized"
                  fill
                  className="object-contain transition-opacity duration-1000"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-900/80 italic opacity-40">
                  <span className="text-white font-black uppercase tracking-[0.5em]">{t('after' as any) || 'SYNC_ASSET_OFFLINE'}</span>
                </div>
              )}
            </div>

            {/* Neural Slider Axis interface interface */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl cursor-ew-resize z-20 transition-colors"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center group-hover/viewport:scale-110 transition-transform duration-500 border-4 border-pink-100">
                <ChevronLeft className="h-6 w-6 text-pink-600" />
                <ChevronRight className="h-6 w-6 text-pink-600" />
              </div>
              <div className="absolute top-0 bottom-0 w-40 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            </div>

            {/* Dynamic Labels interface */}
            <div className="absolute top-10 left-10 z-30 pointer-events-none">
              <Badge className="bg-slate-950/80 backdrop-blur-md text-white border-none px-6 py-2 rounded-full text-[10px] font-black italic shadow-2xl uppercase tracking-widest">
                {t('before' as any) || 'BASELINE'} // NODE_{String(beforeIndex + 1).padStart(2, '0')}
              </Badge>
            </div>
            <div className="absolute top-10 right-10 z-30 pointer-events-none">
              <Badge className="bg-pink-600 text-white border-none px-6 py-2 rounded-full text-[10px] font-black italic shadow-2xl uppercase tracking-widest animate-pulse">
                {t('after' as any) || 'SYNCHRONIZED'} // NODE_{String(afterIndex + 1).padStart(2, '0')}
              </Badge>
            </div>
          </div>

          {/* Slider Control Matrix interface */}
          <div className="p-10 bg-slate-50/50 border-t border-slate-100 shadow-inner space-y-6">
            <div className="flex justify-between items-end px-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none">Parallel_Synchronisation_Axis</p>
              <span className="text-xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{sliderPosition}% Delta</span>
            </div>
            <Slider
              value={[sliderPosition]}
              onValueChange={([v]) => setSliderPosition(v)}
              min={0}
              max={100}
              step={1}
              className="py-4"
            />
            <p className="text-center text-[11px] font-black text-pink-600 uppercase tracking-widest italic animate-pulse">
              {t('dragToCompare' as any) || 'DRAG_TO_SYNCHRONIZE_BIOMETRIC_DATA'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Delta Analysis Matrix interface */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { 
            label: t('overallScore' as any) || 'INTEGRITY_DELTA', 
            before: beforeRecord.overallScore, 
            after: afterRecord.overallScore,
            change: overallChange,
            color: 'text-pink-600',
            bg: 'bg-pink-50'
          },
          { 
            label: t('skinAge' as any) || 'TEMPORAL_DELTA', 
            before: beforeRecord.skinAge, 
            after: afterRecord.skinAge,
            change: skinAgeChange,
            inverse: true,
            unit: 'YRS',
            color: 'text-blue-600',
            bg: 'bg-blue-50'
          }
        ].map((node, i) => (
          <Card key={i} className={cn("border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden group transition-all duration-700 hover:border-blue-500/20", node.change.direction === 'up' && !node.inverse ? 'border-emerald-100 bg-emerald-50/10' : node.change.direction === 'down' && !node.inverse ? 'border-rose-100 bg-rose-50/10' : '')}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-10 text-center space-y-8">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic group-hover:text-slate-950 transition-colors leading-none">{node.label}</p>
              <div className="flex items-center justify-center gap-12 group/flux">
                <div className="space-y-2">
                  <p className="text-4xl font-black text-slate-300 italic tracking-tighter uppercase leading-none">{node.before}</p>
                  <p className="text-[8px] font-black text-slate-200 uppercase tracking-widest italic">INIT</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover/flux:scale-110 transition-transform">
                  <ArrowRight className="h-6 w-6 text-slate-200" />
                </div>
                <div className="space-y-2">
                  <p className={cn("text-6xl font-black italic tracking-tighter uppercase leading-none transition-colors", getChangeColor(node.change.direction, node.inverse))}>
                    {node.after}
                  </p>
                  <p className="text-[8px] font-black text-slate-200 uppercase tracking-widest italic">SYNC</p>
                </div>
              </div>
              <div className="flex justify-center">
                <Badge className={cn("px-6 py-2 rounded-full border-none font-black italic uppercase tracking-widest shadow-lg leading-none gap-3", getChangeStyles(node.change.direction, node.inverse))}>
                  {getChangeIcon(node.change.direction, node.inverse)}
                  <span>
                    {node.change.direction === 'up' ? '+' : node.change.direction === 'down' ? '-' : ''}
                    {node.change.value}{node.unit === 'YRS' ? ' YRS' : '%'} DELTA
                  </span>
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Voxel Metrics interface interface */}
      <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-1000 hover:border-emerald-500/10">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="p-12 lg:p-16 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-row items-center justify-between">
          <div className="space-y-3">
            <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm group-hover:scale-110 transition-transform duration-700">
                <Layers className="h-8 w-8 text-emerald-600" />
              </div>
              {t('metrics' as any) || 'Full_Diagnostic_Delta_Log'}
            </CardTitle>
            <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">Individual spectrum node variance analysis</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-10 lg:p-16 space-y-8 bg-white">
          <div className="grid gap-6">
            {metrics.map((metric, mIdx) => {
              const beforeValue = beforeRecord.scores[metric.key as keyof typeof beforeRecord.scores]
              const afterValue = afterRecord.scores[metric.key as keyof typeof afterRecord.scores]
              const change = calculateChange(beforeValue, afterValue, metric.inverse)
              
              return (
                <motion.div 
                  key={metric.key} 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: mIdx * 0.05 }}
                  className="group/metric flex flex-col md:flex-row md:items-center justify-between p-8 rounded-[3rem] bg-slate-50 border border-slate-100 hover:bg-white hover:border-emerald-500/20 transition-all duration-700 shadow-inner hover:shadow-premium relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-100 group-hover/metric:bg-emerald-600 transition-all duration-700" />
                  <div className="flex items-center gap-10 relative z-10 flex-1">
                    <div className={cn("h-16 w-16 rounded-[1.5rem] bg-white border border-slate-100 flex items-center justify-center shadow-sm transition-transform group-hover/metric:scale-110 duration-700 shadow-inner", metric.color)}>
                      <metric.icon className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-2xl font-black text-slate-950 italic uppercase tracking-tighter leading-none group-hover/metric:text-emerald-600 transition-colors">{metric.label}</span>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Diagnostic_Voxel_Path</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-12 relative z-10 shrink-0 mt-8 md:mt-0 px-8 py-4 bg-white/50 rounded-2xl border border-slate-100 group-hover/metric:bg-white transition-all">
                    <div className="text-center space-y-1 min-w-[80px]">
                      <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic leading-none">INIT</p>
                      <p className="text-xl font-black text-slate-400 italic tracking-tighter leading-none uppercase">{beforeValue}%</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-slate-200 group-hover/metric:text-emerald-600 transition-colors" />
                    </div>
                    <div className="text-center space-y-1 min-w-[80px]">
                      <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic leading-none">SYNC</p>
                      <p className={cn("text-xl font-black italic tracking-tighter leading-none uppercase", getChangeColor(change.direction, metric.inverse))}>{afterValue}%</p>
                    </div>
                    <div className="h-10 w-px bg-slate-100" />
                    <Badge className={cn("px-5 py-1.5 rounded-full border-none font-black italic uppercase tracking-widest shadow-sm leading-none gap-3", getChangeStyles(change.direction, metric.inverse))}>
                      {getChangeIcon(change.direction, metric.inverse)}
                      <span>
                        {change.direction === 'up' ? '+' : change.direction === 'down' ? '-' : ''}
                        {change.value}%
                      </span>
                    </Badge>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Hub interface interface */}
      <div className="flex flex-col md:flex-row gap-8 pb-20">
        <Button variant="outline" size="xl" className="flex-1 h-20 rounded-[2.5rem] border-slate-200 bg-white text-slate-950 font-black uppercase tracking-[0.3em] text-[11px] italic shadow-premium hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 group/btn">
          <Download className="mr-4 h-6 w-6 text-blue-600 group-hover/btn:translate-y-1 transition-transform" />
          {t('download' as any) || 'Export_Comparison_Log'}
        </Button>
        <Button variant="premium" size="xl" className="flex-1 h-20 rounded-[2.5rem] bg-slate-950 text-white border-none shadow-2xl transition-all hover:scale-105 active:scale-95 italic font-black text-[11px] uppercase tracking-[0.3em] group/btn relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
          <Share2 className="mr-4 h-6 w-6 text-pink-500 group-hover/btn:scale-110 transition-transform" />
          {t('share' as any) || 'Authorize_Secure_Share'}
        </Button>
      </div>
    </div>
  );
}

function getChangeColor(direction: string, inverse = false) {
  if (direction === 'same') return 'text-slate-400'
  if ((direction === 'up' && !inverse) || (direction === 'down' && inverse)) {
    return 'text-emerald-600'
  }
  return 'text-rose-600'
}
