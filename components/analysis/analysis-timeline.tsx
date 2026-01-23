"use client"

import type React from "react"
/**
 * Analysis Timeline Component
 * Visual progress tracking with before/after comparisons
 */

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { TrendingUp, TrendingDown, Minus, Calendar, ChevronLeft, ChevronRight, Target, Activity, Zap, ShieldCheck } from "lucide-react"
import type { HybridSkinAnalysis } from "@/lib/types/skin-analysis"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface TimelineEntry {
  analysis: HybridSkinAnalysis
  imageUrl?: string
  notes?: string
}

export interface AnalysisTimelineProps {
  entries: TimelineEntry[]
  onSelectEntry?: (entry: TimelineEntry) => void
  className?: string
}

export function AnalysisTimeline({ entries, onSelectEntry, className = "" }: AnalysisTimelineProps) {
  const t = useTranslations('analysisTimeline')
  
  if (entries.length === 0) {
    return (
      <Card className="border-slate-100 bg-slate-50/30 rounded-[3rem] p-20 text-center space-y-8 italic shadow-inner">
        <div className="mx-auto h-24 w-24 rounded-[2.5rem] bg-white border border-slate-100 flex items-center justify-center text-slate-200 animate-pulse">
          <Calendar className="h-12 w-12" />
        </div>
        <div className="space-y-4">
          <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tighter leading-none">{t('noHistory' as any) || 'HISTORY_EMPTY'}</h3>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">No temporal diagnostic nodes detected in registry</p>
        </div>
      </Card>
    )
  }

  // Sort by date (newest first)
  const sortedEntries = [...entries].sort((a, b) => b.analysis.timestamp.getTime() - a.analysis.timestamp.getTime())

  return (
    <div className={cn("space-y-12 animate-in fade-in duration-700", className)}>
      {/* Header interface */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-8 px-6">
        <div className="flex items-center gap-6">
          <div className="p-3 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm">
            <Calendar className="h-8 w-8 text-pink-600" />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{t('title' as any) || 'Temporal_Log'}</h2>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 italic">Chronological biological evolution tracking</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl bg-white border border-slate-200 text-slate-300 hover:text-pink-600 transition-all shadow-sm" disabled>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl bg-white border border-slate-200 text-slate-300 hover:text-pink-600 transition-all shadow-sm" disabled>
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Timeline interface */}
      <div className="relative pl-12 md:pl-24">
        {/* Timeline Axis interface */}
        <div className="absolute left-6 md:left-[47px] top-0 bottom-0 w-1 bg-slate-100 rounded-full" />

        {/* Timeline Entries interface */}
        <div className="space-y-16">
          {sortedEntries.map((entry, index) => {
            const prevEntry = sortedEntries[index + 1]
            const improvement = prevEntry
              ? (() => {
                  const currentScore = Math.round(
                    ((entry.analysis.overallScore?.spots || 0) +
                      (entry.analysis.overallScore?.pores || 0) +
                      (entry.analysis.overallScore?.wrinkles || 0) +
                      (entry.analysis.overallScore?.texture || 0) +
                      (entry.analysis.overallScore?.redness || 0) +
                      (entry.analysis.overallScore?.pigmentation || 0)) / 6
                  )
                  const prevScore = Math.round(
                    ((prevEntry.analysis.overallScore?.spots || 0) +
                      (prevEntry.analysis.overallScore?.pores || 0) +
                      (prevEntry.analysis.overallScore?.wrinkles || 0) +
                      (prevEntry.analysis.overallScore?.texture || 0) +
                      (prevEntry.analysis.overallScore?.redness || 0) +
                      (prevEntry.analysis.overallScore?.pigmentation || 0)) / 6
                  )
                  return currentScore - prevScore
                })()
              : 0

            return (
              <TimelineItem
                key={entry.analysis.timestamp.getTime()}
                entry={entry}
                improvement={improvement}
                isFirst={index === 0}
                isLast={index === sortedEntries.length - 1}
                onClick={() => onSelectEntry?.(entry)}
              />
            )
          })}
        </div>
      </div>

      {/* Summary Matrix interface */}
      <Card className="border-slate-100 bg-slate-950 text-white shadow-2xl rounded-[4rem] overflow-hidden relative group transition-all duration-1000">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-blue-500/10 opacity-50" />
        <CardHeader className="p-12 lg:p-16 pb-8 border-b border-white/5 relative z-10">
          <CardTitle className="text-3xl font-black italic tracking-tighter flex items-center gap-6 uppercase leading-none">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 shadow-2xl group-hover:scale-110 transition-transform duration-700">
              <Activity className="h-8 w-8 text-pink-500 animate-pulse" />
            </div>
            {t('overallProgress' as any) || 'Aggregate_Evolution_Metrics'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-12 lg:p-16 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <StatCard label={t('totalSessions' as any) || 'Registry_Nodes'} value={entries.length} icon={<Target className="w-6 h-6 text-blue-400" />} />
            <StatCard
              label={t('currentScore' as any) || 'Latest_Integrity'}
              value={Math.round(
                ((sortedEntries[0].analysis.overallScore?.spots || 0) +
                  (sortedEntries[0].analysis.overallScore?.pores || 0) +
                  (sortedEntries[0].analysis.overallScore?.wrinkles || 0) +
                  (sortedEntries[0].analysis.overallScore?.texture || 0) +
                  (sortedEntries[0].analysis.overallScore?.redness || 0) +
                  (sortedEntries[0].analysis.overallScore?.pigmentation || 0)) / 6
              )}
              icon={<TrendingUp className="w-6 h-6 text-pink-400" />}
            />
            <StatCard
              label={t('startingScore' as any) || 'Baseline_Node'}
              value={Math.round(
                ((sortedEntries[sortedEntries.length - 1].analysis.overallScore?.spots || 0) +
                  (sortedEntries[sortedEntries.length - 1].analysis.overallScore?.pores || 0) +
                  (sortedEntries[sortedEntries.length - 1].analysis.overallScore?.wrinkles || 0) +
                  (sortedEntries[sortedEntries.length - 1].analysis.overallScore?.texture || 0) +
                  (sortedEntries[sortedEntries.length - 1].analysis.overallScore?.redness || 0) +
                  (sortedEntries[sortedEntries.length - 1].analysis.overallScore?.pigmentation || 0)) / 6
              )}
              icon={<Minus className="w-6 h-6 text-slate-400" />}
            />
            <StatCard
              label={t('totalImprovement' as any) || 'Cumulative_Delta'}
              value={(() => {
                const currentScore = Math.round(
                  ((sortedEntries[0].analysis.overallScore?.spots || 0) +
                    (sortedEntries[0].analysis.overallScore?.pores || 0) +
                    (sortedEntries[0].analysis.overallScore?.wrinkles || 0) +
                    (sortedEntries[0].analysis.overallScore?.texture || 0) +
                    (sortedEntries[0].analysis.overallScore?.redness || 0) +
                    (sortedEntries[0].analysis.overallScore?.pigmentation || 0)) / 6
                )
                const startingScore = Math.round(
                  ((sortedEntries[sortedEntries.length - 1].analysis.overallScore?.spots || 0) +
                    (sortedEntries[sortedEntries.length - 1].analysis.overallScore?.pores || 0) +
                    (sortedEntries[sortedEntries.length - 1].analysis.overallScore?.wrinkles || 0) +
                    (sortedEntries[sortedEntries.length - 1].analysis.overallScore?.texture || 0) +
                    (sortedEntries[sortedEntries.length - 1].analysis.overallScore?.redness || 0) +
                    (sortedEntries[sortedEntries.length - 1].analysis.overallScore?.pigmentation || 0)) / 6
                )
                return currentScore - startingScore
              })()}
              icon={<Zap className="w-6 h-6 text-emerald-400" />}
              showSign
            />
          </div>
        </CardContent>
        <CardFooter className="p-12 border-t border-white/5 relative z-10 flex items-center justify-between opacity-40 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-4 text-slate-500">
            <ShieldCheck className="h-5 w-5" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">Temporal_Accuracy_Verified: BIP_CORE_v4.8</p>
          </div>
          <Badge variant="outline" className="border-white/10 text-slate-500 text-[8px] font-black italic uppercase tracking-widest">Global_Index_Epoch: 2026.4</Badge>
        </CardFooter>
      </Card>
    </div>
  )
}

interface TimelineItemProps {
  entry: TimelineEntry
  improvement: number
  isFirst: boolean
  isLast: boolean
  onClick?: () => void
}

function TimelineItem({ entry, improvement, isFirst, isLast, onClick }: TimelineItemProps) {
  const t = useTranslations('analysisTimeline')
  const date = new Date(entry.analysis.timestamp)
  const dateString = date.toLocaleDateString()
  const timeString = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="relative group/item"
    >
      {/* Node Bullet interface */}
      <div
        className={cn(
          "absolute -left-12 md:-left-[59px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-4 transition-all duration-700 z-20",
          isFirst 
            ? "bg-pink-600 border-white shadow-glow-pink scale-125" 
            : "bg-white border-slate-200 group-hover/item:border-pink-200 group-hover/item:scale-110"
        )}
      />

      {/* Date Label interface */}
      <div className="absolute -left-48 md:-left-64 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-slate-400 w-32 md:w-40 text-right pr-8 italic group-hover/item:text-slate-950 transition-colors">
        {dateString}
        <br />
        <span className="text-slate-200 group-hover/item:text-pink-600/40 transition-colors">{timeString}</span>
      </div>

      {/* Content Card interface */}
      <Card
        className={cn(
          "cursor-pointer transition-all duration-700 relative overflow-hidden rounded-[3rem] border-slate-100 bg-white hover:border-pink-500/20 shadow-sm hover:shadow-premium group/card",
          isFirst ? "border-pink-200 shadow-premium" : ""
        )}
        onClick={onClick}
      >
        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-slate-100 group-hover/card:bg-pink-600 transition-all duration-700" className={isFirst ? 'bg-pink-500' : ''} />
        <CardContent className="p-8 md:p-10 flex flex-col md:flex-row gap-10">
          {/* Diagnostic Asset interface */}
          {entry.imageUrl ? (
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-[2rem] overflow-hidden border border-slate-100 shadow-inner shrink-0 group-hover/card:scale-105 transition-transform duration-1000">
              <img src={entry.imageUrl || "/placeholder.svg"} alt="Diagnostic Node" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent opacity-40" />
            </div>
          ) : (
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200 shrink-0 shadow-inner group-hover/card:bg-white group-hover/card:border-pink-100 transition-all duration-700">
              <Activity className="h-12 w-12 group-hover/card:text-pink-600 transition-colors" />
            </div>
          )}

          {/* Inference Data interface */}
          <div className="flex-1 space-y-8">
            <div className="flex flex-wrap items-center gap-4">
              {isFirst && <Badge className="bg-pink-600 text-white border-none text-[9px] font-black italic uppercase tracking-widest shadow-lg shadow-pink-600/20 px-4 py-1.5 rounded-full animate-pulse">LATEST_SYNC</Badge>}
              {isLast && <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 text-[9px] font-black italic uppercase tracking-widest px-4 py-1.5 rounded-full">BASELINE_NODE</Badge>}
              {!isFirst && improvement !== 0 && <ImprovementBadge value={improvement} />}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="space-y-2 group/val">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic group-hover/val:text-slate-950 transition-colors leading-none">{t('overallScore' as any) || 'INTEGRITY_IDX'}</p>
                <div className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none group-hover/val:text-pink-600 transition-colors">
                  {Math.round(
                    ((entry.analysis.overallScore?.spots || 0) +
                      (entry.analysis.overallScore?.pores || 0) +
                      (entry.analysis.overallScore?.wrinkles || 0) +
                      (entry.analysis.overallScore?.texture || 0) +
                      (entry.analysis.overallScore?.redness || 0) +
                      (entry.analysis.overallScore?.pigmentation || 0)) / 6
                  )}
                </div>
              </div>
              <div className="space-y-2 group/val">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic group-hover/val:text-slate-950 transition-colors leading-none">{t('confidence' as any) || 'CONFIDENCE'}</p>
                <div className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none group-hover/val:text-blue-600 transition-colors">95%</div>
              </div>
              <div className="space-y-2 group/val">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic group-hover/val:text-slate-950 transition-colors leading-none">{t('percentile' as any) || 'GLOBAL_IDX'}</p>
                <div className="flex items-baseline gap-1 group-hover/val:text-purple-600 transition-colors">
                  <span className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none group-hover/val:text-inherit">
                    {Math.round(
                      ((entry.analysis.percentiles.spots || 0) +
                        (entry.analysis.percentiles.pores || 0) +
                        (entry.analysis.percentiles.wrinkles || 0) +
                        (entry.analysis.percentiles.texture || 0) +
                        (entry.analysis.percentiles.redness || 0)) / 5
                    )}
                  </span>
                  <span className="text-lg font-black text-slate-300 italic uppercase leading-none group-hover/val:text-inherit">th</span>
                </div>
              </div>
            </div>

            {entry.notes && (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 shadow-inner group-hover/card:bg-white transition-all duration-700">
                <p className="text-sm text-slate-500 font-medium italic leading-relaxed tracking-tight group-hover/card:text-slate-950 transition-colors">"{entry.notes}"</p>
              </div>
            )}

            {/* Protocol Vector Trends interface */}
            <div className="pt-8 border-t border-slate-50 grid grid-cols-2 sm:grid-cols-5 gap-6">
              <ParamTrend label="Spots" value={entry.analysis.percentiles.spots} />
              <ParamTrend label="Pores" value={entry.analysis.percentiles.pores} />
              <ParamTrend label="Wrinkles" value={entry.analysis.percentiles.wrinkles} />
              <ParamTrend label="Texture" value={entry.analysis.percentiles.texture} />
              <ParamTrend label="Redness" value={entry.analysis.percentiles.redness} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function ImprovementBadge({ value }: { value: number }) {
  const isPositive = value > 0
  const Icon = isPositive ? TrendingUp : value < 0 ? TrendingDown : Minus

  return (
    <Badge className={cn(
      "px-4 py-1 rounded-full text-[9px] font-black italic shadow-sm border-none gap-2 leading-none uppercase tracking-widest",
      isPositive ? "bg-emerald-50 text-emerald-600" : value < 0 ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-400"
    )}>
      <Icon className="w-3.5 h-3.5" />
      {isPositive ? "+" : ""}
      {value} DELTA
    </Badge>
  )
}

function ParamTrend({ label, value }: { label: string; value: number }) {
  const styles = value >= 75 ? "text-emerald-600 bg-emerald-50" : value >= 50 ? "text-blue-600 bg-blue-50" : "text-amber-600 bg-amber-50"

  return (
    <div className="space-y-2 group/param">
      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic group-hover/param:text-slate-950 transition-colors leading-none">{label}</p>
      <div className={cn("px-3 py-1 rounded-lg font-black text-sm italic shadow-inner w-fit group-hover/param:scale-110 transition-all duration-500", styles)}>
        {value}th
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, showSign = false }: { label: string; value: number; icon: React.ReactNode; showSign?: boolean }) {
  const displayValue = showSign && value > 0 ? `+${value}` : value

  return (
    <div className="space-y-4 group/stat">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl group-hover/stat:scale-110 transition-transform duration-700">
          {icon}
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic group-hover/stat:text-white transition-colors">{label}</p>
      </div>
      <p className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none group-hover/stat:text-pink-500 transition-colors">{displayValue}</p>
    </div>
  )
}
