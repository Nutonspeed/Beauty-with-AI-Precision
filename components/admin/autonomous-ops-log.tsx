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
    <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      
      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.02] to-transparent animate-neural-pulse pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <Cpu className="h-8 w-8 text-cyan-400" />
            {t('autonomousOps.title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('autonomousOps.subtitle')}
          </CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-cyan-600 text-white border-none px-4 py-1 text-[9px] font-black tracking-widest uppercase italic">
            {t('autonomousOps.engineMode')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-12">
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {ops.map((op) => (
              <motion.div
                key={op.id}
                layout
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/[0.04] transition-all group/op"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-6">
                    <div className={cn(
                      "h-12 w-12 rounded-2xl flex items-center justify-center border transition-all duration-500 shadow-inner group-hover/op:scale-110 animate-synaptic-fire",
                      op.type === 'inventory' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      op.type === 'marketing' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' :
                      op.type === 'security' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                    )}>
                      <Activity className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{op.type}</span>
                        <h5 className="text-sm font-bold text-white italic">{op.action}</h5>
                      </div>
                      <p className="text-xs text-slate-400 font-light leading-relaxed italic">
                        {t('autonomousOps.impact')}: <span className="text-emerald-400 font-bold">{op.impact}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-3">
                    <Badge variant="outline" className={cn(
                      "px-4 py-1 text-[9px] font-black tracking-widest border-white/5 italic",
                      op.status === 'executing' ? "text-cyan-400 bg-cyan-500/5 animate-pulse" : "text-slate-500 bg-white/5"
                    )}>
                      {op.status === 'executing' ? t('autonomousOps.executingNode') : t('autonomousOps.operationSynced')}
                    </Badge>
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{op.timestamp}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>

      <div className="px-10 lg:p-12 py-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
        <div className="flex items-center gap-4 text-slate-600">
          <Layers className="h-4 w-4" />
          <p className="text-[9px] font-black uppercase tracking-[0.2em] italic">{t('ui.status.activeDecisionMatrix')}</p>
        </div>
        <p className="text-[9px] font-black text-cyan-500/60 uppercase tracking-widest italic">{t('ui.status.liveNeuralStream')}</p>
      </div>
    </Card>
  )
}
