"use client"

import { motion } from "framer-motion"
import { Wrench, AlertTriangle, CheckCircle2, History, TrendingUp, Cpu, Gauge } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface Asset {
  id: string
  name: string
  health: number
  lastService: string
  nextService: string
  status: 'optimal' | 'warning' | 'critical'
  utilization: number
}

export function AestheticAssetLifecycle() {
  const t = useTranslations()

  const assets: Asset[] = [
    { 
      id: 'ast1', 
      name: 'Ultra-Lase 4000', 
      health: 94, 
      lastService: '2025-11-10', 
      nextService: '2026-02-15', 
      status: 'optimal',
      utilization: 82
    },
    { 
      id: 'ast2', 
      name: 'Cryo-Sculpt Pro', 
      health: 68, 
      lastService: '2025-08-20', 
      nextService: '2026-01-25', 
      status: 'warning',
      utilization: 95
    },
    { 
      id: 'ast3', 
      name: 'Neural-Scan X1', 
      health: 98, 
      lastService: '2025-12-05', 
      nextService: '2026-06-05', 
      status: 'optimal',
      utilization: 45
    }
  ]

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'optimal': return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 }
      case 'warning': return { color: 'text-amber-400', bg: 'bg-amber-500/10', icon: AlertTriangle }
      default: return { color: 'text-rose-400', bg: 'bg-rose-500/10', icon: AlertTriangle }
    }
  }

  return (
    <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group flex flex-col min-h-[700px]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      
      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.02] to-transparent animate-neural-pulse pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <Gauge className="h-8 w-8 text-blue-400" />
            {t('assetLifecycle.title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('assetLifecycle.subtitle')}
          </CardDescription>
        </div>
        <Badge className="bg-blue-600 text-white border-none px-4 py-1 text-[9px] font-black tracking-widest uppercase italic">
          {t('assetLifecycle.maintenanceBadge')}
        </Badge>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-12 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Active Asset Inventory */}
          <div className="lg:col-span-7 space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{t('aestheticAssetLifecycle.managedDeviceNodes')}</h4>
            <div className="space-y-6">
              {assets.map((asset, idx) => {
                const config = getStatusConfig(asset.status)
                return (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group/asset relative overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                      <div className="flex items-start gap-6">
                        <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner transition-transform group-hover/asset:scale-110", config.bg, config.color)}>
                          <Cpu className="h-7 w-7" />
                        </div>
                        <div className="space-y-2">
                          <h5 className="text-xl font-bold text-white italic tracking-tight">{asset.name}</h5>
                          <div className="flex flex-wrap gap-3">
                            <Badge variant="outline" className="text-[8px] font-black border-white/10 text-slate-500 italic">ID: {asset.id}</Badge>
                            <Badge variant="outline" className={cn("text-[8px] font-black border-white/10 italic", config.color)}>
                              {asset.health}% {t('aestheticAssetLifecycle.integrityScore')}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8 text-right">
                        <div className="space-y-1">
                          <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">{t('assetLifecycle.nextMaintenance')}</p>
                          <p className="text-sm font-bold text-white italic">{asset.nextService}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">{t('aestheticAssetLifecycle.utilization')}</p>
                          <p className="text-sm font-bold text-cyan-400 italic">{asset.utilization}%</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        whileInView={{ width: `${asset.health}%` }} 
                        className={cn("h-full", asset.health > 90 ? "bg-emerald-500" : asset.health > 70 ? "bg-amber-500" : "bg-rose-500")} 
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Predictive Insights Column */}
          <div className="lg:col-span-5 space-y-10">
            <div className="p-8 rounded-[3rem] bg-white/[0.02] border border-white/5 space-y-8 h-full">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-white italic">{t('assetLifecycle.yieldOptimization')}</h4>
                </div>
                
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-3">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">{t('aestheticAssetLifecycle.optimalOperationDelta')}</p>
                    <p className="text-2xl font-black text-white italic tracking-tighter">{t('aestheticAssetLifecycle.yieldValue')}</p>
                    <p className="text-[10px] text-slate-500 font-light italic leading-relaxed">
                      {t('aestheticAssetLifecycle.maintenancePrediction', { node: 'ast2', saving: '฿85,000' })}
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">{t('assetLifecycle.serviceStatus')}</p>
                      <Badge variant="outline" className="text-[8px] font-black text-blue-400 border-blue-500/20 italic uppercase">{t('aestheticAssetLifecycle.neuralMonitoringOk')}</Badge>
                    </div>
                    <div className="space-y-4">
                      {[
                        t('aestheticAssetLifecycle.tasks.calibration'),
                        t('aestheticAssetLifecycle.tasks.alignment'),
                        t('aestheticAssetLifecycle.tasks.sync')
                      ].map((task, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/60" />
                          <span className="text-[10px] text-slate-400 font-light italic">{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Button className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] italic shadow-2xl shadow-blue-600/20">
                <Wrench className="mr-3 h-4 w-4" />
                {t('aestheticAssetLifecycle.initMaintenance')}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-white/5 bg-white/[0.01]">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-slate-600">
            <History className="h-5 w-5" />
            <p className="text-[9px] font-black uppercase tracking-[0.2em] italic">{t('aestheticAssetLifecycle.lastCalibration', { date: '2026-01-09 04:00 UTC' })}</p>
          </div>
          <p className="text-[9px] font-black text-blue-500/60 uppercase tracking-widest italic">{t('aestheticAssetLifecycle.assetIntegrityLayer')}</p>
        </div>
      </CardFooter>
    </Card>
  )
}
