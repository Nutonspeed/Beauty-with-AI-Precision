"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Cpu, Activity, Layers } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface Operation {
  id: string
  type: 'inventory' | 'marketing' | 'security' | 'aesthetic'
  action: string
  impact: string
  timestamp: string
  status: 'executing' | 'completed' | 'optimized'
}

export function AutonomousOpsLog() {
  const t = useTranslations('home.salesWizard')
  const [ops, setOps] = useState<Operation[]>([
    {
      id: 'op1',
      type: 'inventory',
      action: t('autonomousOps.actions.autoReorder'),
      impact: t('autonomousOps.actions.avoidedStockout'),
      timestamp: t('autonomousOps.justNow'),
      status: 'completed'
    },
    {
      id: 'op2',
      type: 'marketing',
      action: t('autonomousOps.actions.campaignSynthesis'),
      impact: t('autonomousOps.actions.leadVolume'),
      timestamp: '2 mins ago',
      status: 'optimized'
    },
    {
      id: 'op3',
      type: 'security',
      action: t('autonomousOps.actions.neuralAudit'),
      impact: t('autonomousOps.actions.protocolMatch'),
      timestamp: '5 mins ago',
      status: 'completed'
    }
  ])

  useEffect(() => {
    const actions = [
      { type: 'inventory', action: t('autonomousOps.actions.optimizingStock'), impact: t('autonomousOps.actions.reducedWaste') },
      { type: 'aesthetic', action: t('autonomousOps.actions.synthesizingMDSS'), impact: t('autonomousOps.actions.confidenceScore') },
      { type: 'marketing', action: t('autonomousOps.actions.hyperPersonalizing'), impact: t('autonomousOps.actions.highPropensity') },
      { type: 'security', action: t('autonomousOps.actions.quantumHandshake'), impact: t('autonomousOps.actions.meshNodeSync') }
    ]

    const interval = setInterval(() => {
      const newAction = actions[Math.floor(Math.random() * actions.length)]
      const newOp: Operation = {
        id: Math.random().toString(36).substring(7),
        type: newAction.type as any,
        action: newAction.action,
        impact: newAction.impact,
        timestamp: t('autonomousOps.justNow'),
        status: 'executing'
      }
      setOps(prev => [newOp, ...prev].slice(0, 5))
    }, 5000)

    return () => clearInterval(interval)
  }, [t])

  return (
    <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/20">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
      
      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <CardTitle className="text-3xl font-black text-slate-950 tracking-tight italic flex items-center gap-5 uppercase leading-none">
            <div className="p-3 bg-pink-50 rounded-2xl shadow-sm group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
              <Cpu className="h-8 w-8 text-pink-600 group-hover:text-white" />
            </div>
            {t('autonomousOps.title')}
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">
            {t('autonomousOps.subtitle')}
          </CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-pink-50 text-pink-600 border-none px-5 py-1.5 text-[10px] font-black tracking-widest uppercase italic shadow-sm">
            {t('autonomousOps.engineMode')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 bg-slate-50/30">
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {ops.map((op) => (
              <motion.div
                key={op.id}
                layout
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:border-pink-500/20 transition-all duration-700 group/op shadow-sm hover:shadow-premium"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex items-start gap-6">
                    <div className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center border transition-all duration-700 shadow-inner group-hover/op:scale-110",
                      op.type === 'inventory' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      op.type === 'marketing' ? 'bg-pink-50 text-pink-600 border-pink-100' :
                      op.type === 'security' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      'bg-blue-50 text-blue-600 border-blue-100'
                    )}>
                      <Activity className="h-7 w-7" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{op.type}</span>
                        <h5 className="text-lg font-black text-slate-950 italic uppercase leading-none group-hover:text-pink-600 transition-colors">{op.action}</h5>
                      </div>
                      <p className="text-[13px] text-slate-500 font-light leading-relaxed italic tracking-tight">
                        {t('autonomousOps.impact')}: <span className="text-emerald-600 font-black uppercase">{op.impact}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-4 min-w-[140px]">
                    <Badge variant="outline" className={cn(
                      "px-5 py-1.5 text-[10px] font-black tracking-widest border-none italic shadow-sm rounded-full",
                      op.status === 'executing' ? "text-pink-600 bg-pink-50 animate-pulse" : "text-slate-400 bg-slate-50"
                    )}>
                      {op.status === 'executing' ? t('autonomousOps.executingNode') : t('autonomousOps.operationSynced')}
                    </Badge>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">{op.timestamp}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>

      <div className="px-10 lg:p-12 py-8 border-t border-slate-50 bg-white flex items-center justify-between">
        <div className="flex items-center gap-5 text-slate-400">
          <Layers className="h-5 w-5" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">{t('ui.status.activeDecisionMatrix')}</p>
        </div>
        <p className="text-[10px] font-black text-pink-500/60 uppercase tracking-widest italic bg-pink-50 px-6 py-2 rounded-full shadow-sm">{t('ui.status.liveNeuralStream')}</p>
      </div>
    </Card>
  )
}
