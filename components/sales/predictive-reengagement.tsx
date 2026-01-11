"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { RefreshCw, ArrowRight, User, Heart, Zap, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ReengagementLead {
  id: string
  name: string
  lastVisit: string
  program: string
  dueInDays: number
  affinityScore: number
  recommendedOffer: string
}

export function PredictiveReengagement() {
  const t = useTranslations()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const reengagementLeads: ReengagementLead[] = [
    {
      id: 'rl1',
      name: t('leadPrioritization.mock.name1'),
      lastVisit: '2025-11-15',
      program: t('treatmentComparison.concerns.anti_aging'),
      dueInDays: 5,
      affinityScore: 92,
      recommendedOffer: t('predictiveReengagement.mock.offer1') || 'Complimentary Collagen Booster'
    },
    {
      id: 'rl2',
      name: t('leadPrioritization.mock.name2'),
      lastVisit: '2025-12-01',
      program: t('treatmentComparison.concerns.lifting'),
      dueInDays: 12,
      affinityScore: 85,
      recommendedOffer: t('predictiveReengagement.mock.offer2') || '10% Retention Discount'
    },
    {
      id: 'rl3',
      name: t('leadPrioritization.mock.name3'),
      lastVisit: '2025-10-20',
      program: t('treatmentComparison.concerns.pigmentation'),
      dueInDays: -2,
      affinityScore: 78,
      recommendedOffer: t('predictiveReengagement.mock.offer3') || 'Express Recovery Session'
    }
  ]

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success(t('predictiveReengagement.success'))
    }, 1500)
  }

  return (
    <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group h-full flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-row items-center justify-between">
        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <RefreshCw className={cn("h-8 w-8 text-pink-500", isRefreshing && "animate-spin")} />
            {t('predictiveReengagement.title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('predictiveReengagement.subtitle')}
          </CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRefreshing} className="h-12 w-12 rounded-xl text-slate-500 hover:bg-white/5 transition-all">
          <RefreshCw className={cn("h-5 w-5", isRefreshing && "animate-spin")} />
        </Button>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-8 flex-1">
        <div className="space-y-6">
          {reengagementLeads.map((lead, idx) => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/[0.04] transition-all group/item relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner group-hover/item:border-pink-500/30 transition-all">
                    <User className="h-6 w-6 text-slate-500 group-hover/item:text-pink-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-bold text-white italic">{lead.name}</h4>
                      <Badge variant="outline" className={cn(
                        "px-3 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest italic",
                        lead.dueInDays <= 5 ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      )}>
                        {lead.dueInDays <= 0 ? t('predictiveReengagement.overdue') : t('predictiveReengagement.dueIn', { days: lead.dueInDays })}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{lead.program}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 md:gap-12">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{t('predictiveReengagement.affinityScore')}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-white italic">{lead.affinityScore}%</p>
                      <Heart className="h-3 w-3 text-pink-500 fill-pink-500/20" />
                    </div>
                  </div>
                  <div className="space-y-1 text-right md:text-left">
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{t('predictiveReengagement.targetOffer')}</p>
                    <p className="text-[10px] text-pink-400 font-bold italic truncate max-w-[120px]">{lead.recommendedOffer}</p>
                  </div>
                </div>

                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-slate-500 hover:text-white hover:bg-pink-500 transition-all group/btn">
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="p-6 bg-pink-500/5 border border-pink-500/10 rounded-3xl flex items-start gap-6">
          <div className="h-10 w-10 rounded-xl bg-pink-500/10 flex items-center justify-center border border-pink-500/20 shrink-0">
            <Zap className="h-5 w-5 text-pink-500 animate-pulse" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-white italic">{t('predictiveReengagement.retentionInsight')}</p>
            <p className="text-[10px] text-slate-500 font-light leading-relaxed">
              {t('predictiveReengagement.retentionDesc', { count: 3, hours: 48 })}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-white/5 bg-white/[0.01]">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">{t('predictiveReengagement.auditOk')}</span>
          </div>
          <Button variant="outline" className="h-12 px-6 rounded-xl border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 italic">
            {t('predictiveReengagement.massOutreach')}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
