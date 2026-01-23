"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
      name: t('leadPrioritization.mock.name1' as any) || 'Sarah Johnson',
      lastVisit: '2025-11-15',
      program: t('programComparison.concerns.anti_aging' as any) || 'Anti-Aging Sequence',
      dueInDays: 5,
      affinityScore: 92,
      recommendedOffer: t('predictiveReengagement.mock.offer1' as any) || 'Complimentary Collagen Booster'
    },
    {
      id: 'rl2',
      name: t('leadPrioritization.mock.name2' as any) || 'Emma Wilson',
      lastVisit: '2025-12-01',
      program: t('programComparison.concerns.lifting' as any) || 'Volumetric Lifting',
      dueInDays: 12,
      affinityScore: 85,
      recommendedOffer: t('predictiveReengagement.mock.offer2' as any) || '10% Retention Discount'
    },
    {
      id: 'rl3',
      name: t('leadPrioritization.mock.name3' as any) || 'Michael Chen',
      lastVisit: '2025-10-20',
      program: t('programComparison.concerns.pigmentation' as any) || 'Dermal Synthesis',
      dueInDays: -2,
      affinityScore: 78,
      recommendedOffer: t('predictiveReengagement.mock.offer3' as any) || 'Express Recovery Session'
    }
  ]

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success(t('predictiveReengagement.success' as any) || 'Registry Synchronized')
    }, 1500)
  }

  return (
    <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden relative group h-full flex flex-col transition-all duration-700 hover:border-pink-500/20">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
          <div className="space-y-3">
            <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
              <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
                <RefreshCw className={cn("h-8 w-8 text-pink-600 group-hover:text-white", isRefreshing && "animate-spin")} />
              </div>
              {t('predictiveReengagement.title' as any) || 'Re-Engagement_Index'}
            </CardTitle>
            <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">
              {t('predictiveReengagement.subtitle' as any) || 'Predictive biological cycle re-authorization'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRefreshing} className="h-14 w-14 rounded-[1.25rem] bg-white border border-slate-100 text-slate-300 hover:text-pink-600 transition-all shadow-inner">
            <RefreshCw className={cn("h-6 w-6", isRefreshing && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-10 flex-1 bg-white">
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {reengagementLeads.map((lead, idx) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 bg-slate-50/50 border border-slate-100 rounded-[2.5rem] hover:bg-white hover:border-pink-500/20 transition-all duration-700 group/item relative overflow-hidden shadow-sm hover:shadow-premium"
              >
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-slate-100 group-hover/item:bg-pink-600 transition-all duration-700" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
                  <div className="flex items-center gap-8">
                    <div className="h-16 w-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-inner group-hover/item:scale-110 transition-transform duration-700">
                      <User className="h-8 w-8 text-slate-300 group-hover/item:text-pink-600 transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-6">
                        <h4 className="text-2xl font-black text-slate-950 italic uppercase group-hover/item:text-pink-600 transition-colors tracking-tighter leading-none">{lead.name}</h4>
                        <Badge className={cn(
                          "px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest italic leading-none border-none shadow-sm",
                          lead.dueInDays <= 5 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                        )}>
                          {lead.dueInDays <= 0 ? (t('predictiveReengagement.overdue' as any) || 'OVERDUE') : (t('predictiveReengagement.dueIn' as any) || `SYNC_IN_${lead.dueInDays}_DAYS`).replace('{days}', String(lead.dueInDays))}
                        </Badge>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{lead.program}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-12 lg:gap-16">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">{t('predictiveReengagement.affinityScore' as any) || 'Affinity_Index'}</p>
                      <div className="flex items-center gap-3">
                        <p className="text-xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{lead.affinityScore}%</p>
                        <Heart className="h-4 w-4 text-pink-500 fill-pink-500/20 group-hover/item:scale-125 transition-transform" />
                      </div>
                    </div>
                    <div className="space-y-1 text-right md:text-left">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">{t('predictiveReengagement.targetOffer' as any) || 'Offer_Node'}</p>
                      <p className="text-[11px] text-pink-600 font-black italic uppercase tracking-widest truncate max-w-[150px] pt-1">{lead.recommendedOffer}</p>
                    </div>
                  </div>

                  <Button variant="ghost" size="icon" className="h-14 w-14 rounded-[1.25rem] bg-slate-50 text-slate-300 hover:bg-pink-50 hover:text-pink-600 transition-all duration-500 shadow-inner border border-transparent hover:border-pink-500/20">
                    <ArrowRight className="h-7 w-7" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="p-10 rounded-[3rem] bg-pink-50/50 border border-pink-100 flex items-start gap-8 relative overflow-hidden group/insight shadow-inner">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover/insight:scale-110 transition-transform duration-1000">
            <Zap className="w-32 h-32 text-pink-600" />
          </div>
          <div className="h-14 w-14 rounded-2xl bg-white border border-pink-100 flex items-center justify-center shrink-0 shadow-sm group-hover/insight:scale-110 transition-transform duration-700">
            <Zap className="h-7 w-7 text-pink-600 animate-pulse" />
          </div>
          <div className="space-y-3 relative z-10">
            <p className="text-xl font-black text-slate-950 italic uppercase tracking-tight leading-none">{t('predictiveReengagement.retentionInsight' as any) || 'Retention_Logic_Node'}</p>
            <p className="text-sm text-slate-500 font-medium italic leading-relaxed tracking-tight">
              {t('predictiveReengagement.retentionDesc' as any) || 'Predictive models suggest a high probability of churn for 3 units within the next 48 temporal hours. Immediate re-authorization protocols recommended.'}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-slate-50 bg-slate-50/30">
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-8">
          <div className="flex items-center gap-4 text-slate-400">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{t('predictiveReengagement.auditOk' as any) || 'Audit_Protocols_Operational'}</span>
          </div>
          <Button variant="premium" className="h-16 px-10 rounded-2xl bg-slate-950 hover:bg-pink-600 text-white font-black uppercase tracking-[0.3em] text-[10px] italic transition-all duration-500 shadow-2xl hover:shadow-pink-500/20 border-none">
            {t('predictiveReengagement.massOutreach' as any) || 'Broadcast_Global_Sequence'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
