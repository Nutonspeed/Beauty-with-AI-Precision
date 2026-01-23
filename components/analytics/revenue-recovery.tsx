"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ShieldAlert, Zap, RefreshCw, Target, Activity, CheckCircle2, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface AtRiskNode {
  id: string
  name: string
  lastVisit: string
  potentialValue: number
  churnProbability: number
  recoveryRationale: string
}

export function AIRevenueRecovery() {
  const t = useTranslations()
  const [isRecovering, setIsRecovering] = useState<string | null>(null)

  const atRiskNodes: AtRiskNode[] = [
    {
      id: 'node1',
      name: t('revenueRecovery.nodes.node1.name' as any) || 'Sarah Johnson',
      lastVisit: '45 days ago',
      potentialValue: 125000,
      churnProbability: 72,
      recoveryRationale: t('revenueRecovery.nodes.node1.rationale' as any) || 'Bio-cycle gap detected. High probability of node drift.'
    },
    {
      id: 'node2',
      name: t('revenueRecovery.nodes.node2.name' as any) || 'Emma Wilson',
      lastVisit: '60 days ago',
      potentialValue: 45000,
      churnProbability: 85,
      recoveryRationale: t('revenueRecovery.nodes.node2.rationale' as any) || 'Missed follow-up sync. Protocol adherence failure.'
    },
    {
      id: 'node3',
      name: t('revenueRecovery.nodes.node3.name' as any) || 'Michael Chen',
      lastVisit: '30 days ago',
      potentialValue: 15000,
      churnProbability: 45,
      recoveryRationale: t('revenueRecovery.nodes.node3.rationale' as any) || 'Declined recent up-sell vector. Requires re-engagement.'
    }
  ]

  const handleRecovery = (id: string) => {
    setIsRecovering(id)
    setTimeout(() => {
      setIsRecovering(null)
      toast.success(t('revenueRecovery.recoverySuccess' as any) || 'Recovery Sequence Authorized')
    }, 2500)
  }

  return (
    <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-rose-500/20 h-full flex flex-col min-h-[700px]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 shadow-sm group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all duration-700">
              <ShieldAlert className="h-8 w-8 text-rose-600 group-hover:text-white" />
            </div>
            {t('revenueRecovery.title' as any) || 'Yield_Recovery_Engine'}
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">
            {t('revenueRecovery.subtitle' as any) || 'Predictive churn mitigation and biological cycle re-engagement'}
          </CardDescription>
        </div>
        <Badge className="bg-rose-600 text-white border-none px-6 py-2 rounded-full text-[10px] font-black italic shadow-lg shadow-rose-600/30 uppercase tracking-widest animate-pulse">
          {t('revenueRecovery.engineActive' as any) || 'RECOVERY_NODE_LIVE'}
        </Badge>
      </CardHeader>

      <CardContent className="p-10 lg:p-16 space-y-10 flex-1 bg-white">
        <div className="space-y-6">
          {atRiskNodes.map((node, idx) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-rose-500/20 transition-all duration-700 group/node relative overflow-hidden shadow-inner hover:shadow-premium"
            >
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-100 group-hover/node:bg-rose-600 transition-all duration-700" />
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative z-10">
                <div className="flex items-start gap-8">
                  <div className={cn(
                    "h-16 w-16 rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm transition-transform group-hover/node:scale-110 bg-white text-rose-600"
                  )}>
                    <Target className="h-8 w-8" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-6">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic leading-none">{t('revenueRecovery.atRiskRevenue' as any) || 'RISK_DELTA'}</span>
                      <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 italic leading-none">{t('revenueRecovery.churnProb' as any || 'CHURN: {val}%').replace('{val}', String(node.churnProbability))}</span>
                    </div>
                    <h4 className="text-2xl font-black text-slate-950 italic uppercase group-hover/node:text-rose-600 transition-colors tracking-tighter leading-none">{node.name}</h4>
                    <p className="text-sm text-slate-500 font-medium italic leading-relaxed tracking-tight">"{node.recoveryRationale}"</p>
                  </div>
                </div>

                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-8 min-w-[220px]">
                  <div className="text-right space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">{t('revenueRecovery.recoveredYield' as any) || 'POTENTIAL_INFLOW'}</p>
                    <p className="text-3xl font-black text-emerald-600 italic tracking-tighter uppercase leading-none">฿{node.potentialValue.toLocaleString()}</p>
                  </div>
                  <Button 
                    onClick={() => handleRecovery(node.id)}
                    disabled={isRecovering !== null}
                    className={cn(
                      "h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-[10px] italic transition-all shadow-xl group/btn",
                      isRecovering === node.id ? "bg-rose-600 text-white animate-pulse" : "bg-slate-950 text-white hover:bg-rose-600 border-none hover:scale-105 active:scale-95"
                    )}
                  >
                    {isRecovering === node.id ? <RefreshCw className="h-4 w-4 animate-spin mr-3" /> : <Zap className="h-4 w-4 mr-3 group-hover/btn:scale-125 transition-transform" />}
                    {t('revenueRecovery.executeRecovery' as any) || 'Initialize_Recovery'}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="p-10 rounded-[3rem] bg-rose-50/50 border border-rose-100 space-y-8 relative overflow-hidden group/audit shadow-inner transition-all duration-700 hover:bg-white hover:border-rose-300">
          <Activity className="absolute bottom-[-20px] right-[-20px] h-48 w-48 text-rose-500/[0.03] rotate-12 transition-transform duration-[3000ms] group-hover/audit:rotate-90 group-hover/audit:scale-110" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="h-14 w-14 rounded-[1.5rem] bg-white border border-rose-100 flex items-center justify-center shadow-sm group-hover/audit:scale-110 group-hover/audit:bg-rose-50 transition-all duration-700">
              <ShieldAlert className="h-7 w-7 text-rose-600 animate-pulse" />
            </div>
            <h5 className="text-xl font-black text-slate-950 uppercase italic tracking-tighter leading-none">{t('revenueRecovery.leakageAuditTitle' as any) || 'Global_Leakage_Audit'}</h5>
          </div>
          <p className="text-sm text-slate-500 font-medium italic leading-relaxed relative z-10 tracking-tight">
            {t('revenueRecovery.leakageAuditDesc' as any || 'Calculated revenue variance across current node registry: ฿185,000 total potential leakage. RESTORABLE_DELTA: ฿148,000 (80% yield probability).').replace('{total}', '฿185,000').replace('{restorable}', '฿148,000').replace('{yield}', '80%')}
          </p>
          <div className="pt-4 relative z-10">
            <Button variant="ghost" className="h-auto p-0 text-[10px] font-black uppercase tracking-[0.4em] text-rose-600 hover:bg-transparent hover:translate-x-3 transition-all italic group/btn">
              Download_Strategic_Audit <ChevronRight className="ml-3 h-4 w-4 group-hover/btn:translate-x-2 transition-transform" />
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
        <div className="flex items-center gap-6 text-slate-400 group/status cursor-default">
          <CheckCircle2 className="h-5 w-5 group-hover:text-emerald-500 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">
            {t('ui.hud.leakageAudit' as any) || 'Leakage_Matrix_Integrity: NOMINAL'}
          </p>
        </div>
        <Badge variant="outline" className="bg-white border-slate-100 text-slate-300 text-[8px] font-black italic uppercase tracking-widest px-4 py-1.5 rounded-full">
          BIP-RECOVERY-v4.8 // Multi-Thread_Active
        </Badge>
      </CardFooter>
    </Card>
  )
}
