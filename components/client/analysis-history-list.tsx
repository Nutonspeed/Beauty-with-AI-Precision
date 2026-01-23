"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { Sparkles, Loader2, Eye, Activity, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

interface Analysis {
  id: string
  created_at: string
  image_url?: string
  thumbnail_url?: string
  concerns: Array<{ type: string; confidence: number }>
  metrics?: {
    totalTime: number
    detectionCount: number
  }
}

export function AnalysisHistoryList({ userId }: { userId: string }) {
  const t = useTranslations()
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalyses() {
      try {
        const response = await fetch("/api/customer/analyses")
        const data = await response.json()
        if (data.success) {
          setAnalyses(data.analyses)
        }
      } catch (error) {
        console.error("Error fetching analyses:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalyses()
  }, [userId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-6">
          <div className="relative h-16 w-16 mx-auto">
            <div className="absolute inset-0 bg-pink-500/10 blur-2xl rounded-full animate-pulse" />
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-pink-600 relative" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse italic">Synchronizing Analysis Registry...</p>
        </div>
      </div>
    )
  }

  if (analyses.length === 0) {
    return (
      <Card className="border-slate-100 bg-slate-50/30 rounded-[3rem] p-20 text-center space-y-8 italic shadow-inner">
        <div className="mx-auto h-24 w-24 rounded-[2.5rem] bg-white border border-slate-100 flex items-center justify-center text-slate-200 animate-pulse">
          <Sparkles className="h-12 w-12" />
        </div>
        <div className="space-y-4">
          <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tighter leading-none">{t('analysisHistory.noAnalyses' as any) || 'REGISTRY_EMPTY'}</h3>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">{t('analysisHistory.startFirst' as any) || 'Initialize your first biometric scan node'}</p>
        </div>
        <Button variant="premium" className="h-14 px-10 rounded-2xl bg-slate-950 text-white font-black uppercase tracking-widest text-[10px] italic shadow-2xl transition-all hover:scale-105 active:scale-95 border-none">
          <Sparkles className="mr-3 h-4 w-4" />
          {t('analysisHistory.startAnalysis' as any) || 'INITIALIZE_SCAN'}
        </Button>
      </Card>
    )
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {analyses.map((analysis, index) => (
        <motion.div
          key={analysis.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden group transition-all duration-700 hover:border-pink-500/20 relative flex flex-col h-full">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {analysis.thumbnail_url && (
              <div className="relative aspect-video overflow-hidden bg-slate-50 shadow-inner group-hover:shadow-none transition-all duration-700">
                <Image src={analysis.thumbnail_url || "/placeholder.svg"} alt="Analysis" fill className="object-cover transition-transform duration-[3000ms] group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
                <div className="absolute top-6 left-6">
                  <Badge className="bg-white/80 backdrop-blur-md text-slate-950 border-none px-4 py-1.5 rounded-full text-[9px] font-black italic shadow-sm uppercase tracking-widest">
                    SYNC_NODE_{index + 1}
                  </Badge>
                </div>
              </div>
            )}
            
            <CardContent className="p-8 space-y-8 flex-1 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{tCommon('atTime' as any) || 'TEMPORAL_STAMP'}</p>
                    <p className="text-xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">
                      {format(new Date(analysis.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 shadow-sm group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
                    <Activity className="h-5 w-5" />
                  </div>
                </div>

                {analysis.concerns && analysis.concerns.length > 0 && (
                  <div className="space-y-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 italic ml-1 leading-none">Variance_Identified</p>
                    <div className="flex flex-wrap gap-3">
                      {analysis.concerns.slice(0, 3).map((concern, idx) => (
                        <Badge key={idx} variant="outline" className="px-4 py-1 rounded-full border-slate-100 bg-slate-50 text-slate-500 text-[8px] font-black italic uppercase shadow-sm group-hover:border-pink-500/20 group-hover:text-pink-600 transition-all cursor-default">
                          {concern.type}
                        </Badge>
                      ))}
                      {analysis.concerns.length > 3 && (
                        <Badge className="bg-slate-950 text-white text-[8px] font-black italic rounded-full px-3 py-1 shadow-lg border-none uppercase">
                          +{analysis.concerns.length - 3} OTHER
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-50">
                <Button size="xl" variant="outline" className="w-full h-14 rounded-2xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] italic shadow-sm hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 group/btn">
                  <Eye className="mr-3 h-4 w-4 text-pink-600" />
                  {t('analysisHistory.viewResults' as any) || 'INSPECT_NODE'}
                  <ChevronRight className="ml-2 h-4 w-4 text-slate-300 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

function tCommon(_key: string) {
  // Mock for missing translation
  return null;
}
