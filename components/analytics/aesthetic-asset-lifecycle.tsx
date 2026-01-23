"use client"

import { motion } from "framer-motion"
import { Wrench, AlertTriangle, CheckCircle2, History, TrendingUp, Cpu, Gauge, Info } from "lucide-react"
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

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-emerald-50 text-emerald-600 border-none'
      case 'warning': return 'bg-amber-50 text-amber-600 border-none'
      case 'critical': return 'bg-rose-50 text-rose-600 border-none'
      default: return 'bg-slate-50 text-slate-400 border-none'
    }
  }

  const _getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal': return <CheckCircle2 className="h-5 w-5 text-emerald-600" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-600" />
      case 'critical': return <AlertTriangle className="h-5 w-5 text-rose-600" />
      default: return <Info className="h-5 w-5 text-slate-400" />
    }
  }

  return (
    <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group flex flex-col min-h-[700px] transition-all duration-700 hover:border-blue-500/20">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.01] bg-center pointer-events-none" />
      
      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-700">
              <Gauge className="h-8 w-8 text-blue-600 group-hover:text-white" />
            </div>
            {t('assetLifecycle.title' as any) || 'Asset_Lifecycle_Matrix'}
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">
            {t('assetLifecycle.subtitle' as any) || 'Predictive maintenance and node utilization synchronization'}
          </CardDescription>
        </div>
        <Badge variant="outline" className="px-6 py-2 rounded-full border-blue-500/30 text-blue-600 bg-white font-black italic tracking-widest text-[9px] uppercase shadow-sm">
          {t('assetLifecycle.maintenanceBadge' as any) || 'FLEET_STABILITY_ON'}
        </Badge>
      </CardHeader>

      <CardContent className="p-10 lg:p-16 space-y-12 bg-white flex-1 relative overflow-hidden">
        <div className="grid lg:grid-cols-12 gap-16 h-full">
          {/* Active Asset Inventory interface */}
          <div className="lg:col-span-7 space-y-10">
            <div className="flex items-center gap-5 ml-4">
              <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                <Cpu className="h-4 w-4 text-blue-600" />
              </div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">{t('aestheticAssetLifecycle.managedDeviceNodes' as any) || 'Active_Asset_Registry'}</h4>
            </div>
            <div className="space-y-6">
              {assets.map((asset, idx) => (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-8 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-blue-500/20 transition-all duration-700 group/asset relative overflow-hidden shadow-inner hover:shadow-premium"
                >
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-100 group-hover/asset:bg-blue-600 transition-all duration-700" />
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
                    <div className="flex items-start gap-8">
                      <div className={cn(
                        "h-16 w-16 rounded-2xl flex items-center justify-center border transition-all duration-700 group-hover/asset:scale-110 shadow-inner group-hover/asset:bg-white",
                        getStatusStyles(asset.status)
                      )}>
                        <Cpu className="h-8 w-8" />
                      </div>
                      <div className="space-y-3 pt-1">
                        <h5 className="text-2xl font-black text-slate-950 italic uppercase tracking-tight group-hover/asset:text-blue-600 transition-colors leading-none">{asset.name}</h5>
                        <div className="flex flex-wrap gap-4">
                          <Badge variant="outline" className="text-[9px] font-black border-slate-200 bg-white text-slate-400 italic px-4 py-1 rounded-full uppercase">ID: {asset.id}</Badge>
                          <Badge className={cn("px-4 py-1 rounded-full text-[9px] font-black italic border-none shadow-sm uppercase leading-none", getStatusStyles(asset.status))}>
                            {asset.health}% {t('aestheticAssetLifecycle.integrityScore' as any) || 'INTEGRITY'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-12 text-right">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">{t('assetLifecycle.nextMaintenance' as any) || 'NEXT_SYNC'}</p>
                        <p className="text-xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{asset.nextService}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">{t('aestheticAssetLifecycle.utilization' as any) || 'UTIL_IDX'}</p>
                        <p className="text-xl font-black text-cyan-600 italic tracking-tighter uppercase leading-none">{asset.utilization}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50 p-0.5 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }} 
                      whileInView={{ width: `${asset.health}%` }} 
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className={cn("h-full rounded-full transition-all duration-1000", asset.health > 90 ? "bg-emerald-500 shadow-glow-emerald/20" : asset.health > 70 ? "bg-amber-500" : "bg-rose-500 shadow-glow-rose/20")} 
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Predictive Insights Column interface */}
          <div className="lg:col-span-5 space-y-10">
            <div className="p-10 rounded-[3.5rem] bg-slate-50 border border-slate-100 shadow-inner group/stats transition-all duration-700 hover:bg-white hover:border-blue-500/20 hover:shadow-premium flex flex-col h-full">
              <div className="space-y-10 flex-1">
                <div className="flex items-center gap-5 ml-4">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                  <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">{t('assetLifecycle.yieldOptimization' as any) || 'Optimization_Intelligence'}</h4>
                </div>
                
                <div className="space-y-8">
                  <div className="p-8 rounded-[2.5rem] bg-emerald-50/50 border border-emerald-100 space-y-4 group/delta hover:bg-white transition-all duration-500 shadow-sm">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic leading-none">{t('aestheticAssetLifecycle.optimalOperationDelta' as any) || 'ESTIMATED_OPTIMAL_DELTA'}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-4xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{t('aestheticAssetLifecycle.yieldValue' as any) || '฿85K+'}</p>
                      <span className="text-[10px] font-black text-slate-400 uppercase italic">/ Node_Sync</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium italic leading-relaxed tracking-tight">
                      {t('aestheticAssetLifecycle.maintenancePrediction' as any || 'Predictive maintenance for node {node} can recover approximately {saving} in lost potential yield.').replace('{node}', 'AST2').replace('{saving}', '฿85,000')}
                    </p>
                  </div>

                  <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm space-y-6 group/status transition-all duration-500 hover:border-blue-200">
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none">{t('assetLifecycle.serviceStatus' as any) || 'CALIBRATION_TASKS'}</p>
                      <Badge className="bg-blue-50 text-blue-600 border-none text-[8px] font-black italic uppercase shadow-sm animate-pulse">{t('aestheticAssetLifecycle.neuralMonitoringOk' as any) || 'NEURAL_MONITOR_NOMINAL'}</Badge>
                    </div>
                    <div className="space-y-4">
                      {[
                        t('aestheticAssetLifecycle.tasks.calibration' as any) || 'Spectral_Calibration',
                        t('aestheticAssetLifecycle.tasks.alignment' as any) || 'Node_Mesh_Alignment',
                        t('aestheticAssetLifecycle.tasks.sync' as any) || 'BIP_Cloud_Registry_Sync'
                      ].map((task, i) => (
                        <div key={i} className="flex items-center gap-4 group/item">
                          <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-inner group-hover/item:bg-emerald-50 group-hover/item:border-emerald-100 transition-all">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500/60" />
                          </div>
                          <span className="text-sm font-black text-slate-500 italic uppercase group-hover/item:text-slate-950 transition-colors">{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <Button variant="premium" size="xl" className="w-full h-20 rounded-[2.5rem] bg-slate-950 hover:bg-blue-600 text-white border-none shadow-2xl transition-all hover:scale-105 active:scale-95 italic font-black text-[11px] uppercase tracking-[0.3em] group/btn relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                  <Wrench className="mr-4 h-6 w-6 group-hover/btn:rotate-45 transition-transform" />
                  {t('aestheticAssetLifecycle.initMaintenance' as any) || 'Initialize_Maintenance_Sync'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-slate-50 bg-slate-50/30 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6 text-slate-400 group/status cursor-default">
          <History className="h-5 w-5 group-hover:text-blue-600 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">{t('aestheticAssetLifecycle.lastCalibration' as any || 'Last Synchronisation: {date}').replace('{date}', '2026-01-09 04:00 UTC')}</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-1 w-12 bg-white rounded-full overflow-hidden border border-slate-100 shadow-inner">
              <motion.div animate={{ x: [-48, 48] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="h-full w-6 bg-blue-500/40" />
            </div>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">{t('aestheticAssetLifecycle.assetIntegrityLayer' as any) || 'Security_Protocol: BIP-Standard-v4.8'}</p>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
