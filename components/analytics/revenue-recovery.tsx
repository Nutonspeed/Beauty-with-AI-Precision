"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ShieldAlert, Zap, RefreshCw, Target, Activity, CheckCircle2 } from "lucide-react"
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
      name: t('revenueRecovery.nodes.node1.name'),
      lastVisit: '45 days ago',
      potentialValue: 125000,
      churnProbability: 72,
      recoveryRationale: t('revenueRecovery.nodes.node1.rationale')
    },
    {
      id: 'node2',
      name: t('revenueRecovery.nodes.node2.name'),
      lastVisit: '60 days ago',
      potentialValue: 45000,
      churnProbability: 85,
      recoveryRationale: t('revenueRecovery.nodes.node2.rationale')
    },
    {
      id: 'node3',
      name: t('revenueRecovery.nodes.node3.name'),
      lastVisit: '30 days ago',
      potentialValue: 15000,
      churnProbability: 45,
      recoveryRationale: t('revenueRecovery.nodes.node3.rationale')
    }
  ]

  const handleRecovery = (id: string) => {
    setIsRecovering(id)
    setTimeout(() => {
      setIsRecovering(null)
      toast.success(t('revenueRecovery.recoverySuccess'))
    }, 2500)
  }

  return (
    <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group h-full flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />
      
      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/[0.02] to-transparent animate-neural-pulse pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <ShieldAlert className="h-8 w-8 text-rose-400" />
            {t('revenueRecovery.title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('revenueRecovery.subtitle')}
          </CardDescription>
        </div>
        <Badge className="bg-rose-600 text-white border-none px-4 py-1 text-[9px] font-black tracking-widest uppercase italic">
          {t('revenueRecovery.engineActive')}
        </Badge>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-10 flex-1">
        <div className="space-y-6">
          {atRiskNodes.map((node, idx) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group/node relative overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex items-start gap-6">
                  <div className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner transition-transform group-hover/node:scale-110 bg-rose-500/10 text-rose-400 animate-synaptic-fire"
                  )}>
                    <Target className="h-7 w-7" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('revenueRecovery.atRiskRevenue')}</span>
                      <div className="h-1 w-1 rounded-full bg-white/10" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">{t('revenueRecovery.churnProb', { val: node.churnProbability })}</span>
                    </div>
                    <h4 className="text-xl font-bold text-white italic tracking-tight">{node.name}</h4>
                    <p className="text-sm text-slate-400 font-light leading-relaxed italic">{node.recoveryRationale}</p>
                  </div>
                </div>

                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-6 min-w-[200px]">
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">{t('revenueRecovery.recoveredYield')}</p>
                    <p className="text-lg font-black text-emerald-400 italic tracking-tighter">฿{node.potentialValue.toLocaleString()}</p>
                  </div>
                  <Button 
                    onClick={() => handleRecovery(node.id)}
                    disabled={isRecovering !== null}
                    className={cn(
                      "h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[9px] italic transition-all shadow-lg",
                      isRecovering === node.id ? "bg-rose-500 text-[#020617] animate-pulse" : "bg-white/5 hover:bg-white text-white hover:text-[#020617]"
                    )}
                  >
                    {isRecovering === node.id ? <RefreshCw className="h-3 w-3 animate-spin mr-2" /> : <Zap className="h-3 w-3 mr-2" />}
                    {t('revenueRecovery.executeRecovery')}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="p-8 rounded-[3rem] bg-gradient-to-br from-rose-600/10 via-transparent to-transparent border border-rose-500/20 space-y-6 relative overflow-hidden">
          <Activity className="absolute bottom-[-20px] right-[-20px] h-32 w-32 text-rose-500/5 rotate-12" />
          <div className="flex items-center gap-4 relative z-10">
            <ShieldAlert className="h-5 w-5 text-rose-400" />
            <h5 className="text-xs font-black text-white uppercase tracking-widest">{t('revenueRecovery.leakageAuditTitle')}</h5>
          </div>
          <p className="text-[11px] text-slate-400 font-light leading-relaxed italic relative z-10">
            {t('revenueRecovery.leakageAuditDesc', { total: '฿185,000', restorable: '฿148,000', yield: '80%' })}
          </p>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-white/5 bg-white/[0.01]">
        <div className="flex items-center gap-4 text-slate-600">
          <CheckCircle2 className="h-5 w-5" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">{t('ui.hud.leakageAudit')}</p>
        </div>
      </CardFooter>
    </Card>
  )
}
