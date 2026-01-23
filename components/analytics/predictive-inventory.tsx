"use client"

import { Package, AlertTriangle, ArrowRight, BarChart3, ShieldCheck, Zap, Binary } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import dynamic from 'next/dynamic'
import { motion } from "framer-motion"

// @ts-ignore
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
// @ts-ignore
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
// @ts-ignore
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
// @ts-ignore
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
// @ts-ignore
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
// @ts-ignore
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
// @ts-ignore
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

interface PredictiveInventoryProps {
  isEnterprise: boolean
}

export function PredictiveInventory({ isEnterprise }: PredictiveInventoryProps) {
  const t = useTranslations()

  const forecastData = [
    { item: 'Botox Type-A', current: 45, predicted: 82, unit: 'Vials', color: '#ec4899' },
    { item: 'Filler (Lips)', current: 12, predicted: 35, unit: 'Syringes', color: '#3b82f6' },
    { item: 'HIFU Cartridge', current: 3, predicted: 8, unit: 'Units', color: '#8b5cf6' },
    { item: 'Laser Cooling Gel', current: 15, predicted: 40, unit: 'Litres', color: '#f59e0b' },
  ]

  return (
    <Card className={cn(
      "border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-amber-500/20 flex flex-col min-h-[700px]",
      !isEnterprise && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {!isEnterprise && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm p-12 text-center">
          <Badge className="mb-6 bg-amber-50 text-amber-600 border-none font-black uppercase tracking-[0.3em] italic shadow-sm animate-pulse">
            INVENTORY_AI_RESTRICTED
          </Badge>
          <div className="space-y-4 mb-10">
            <h3 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('inventoryForecasting.title' as any) || 'Predictive_Supply_Chain'}</h3>
            <p className="text-slate-500 max-w-sm font-medium italic leading-relaxed text-base">
              Unlock autonomous inventory forecasting and reorder point optimization derived from biological load patterns.
            </p>
          </div>
          <Button variant="premium" size="xl" className="h-18 px-12 rounded-[2rem] shadow-2xl shadow-amber-500/20 uppercase text-[11px] font-black tracking-[0.4em] italic border-none bg-slate-950 text-white hover:scale-105 active:scale-95 transition-all">
            <Zap className="mr-4 h-6 w-6" />
            {t('inventoryForecasting.unlockEnterprise' as any) || 'Authorize_Supply_Chain_AI'}
          </Button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 shadow-sm group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-700">
              <Package className="h-8 w-8 text-amber-600 group-hover:text-white" />
            </div>
            {t('inventoryForecasting.title' as any) || 'Predictive_Inventory'}
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">
            {t('inventoryForecasting.subtitle' as any) || 'Autonomous stock depletion forecasting and node replenishment'}
          </CardDescription>
        </div>
        {isEnterprise && (
          <Badge className="bg-emerald-50 text-emerald-600 border-none px-6 py-2 rounded-full text-[10px] font-black italic shadow-sm uppercase tracking-widest animate-pulse">
            {t('inventoryForecasting.efficiencyBadge' as any) || 'LOGISTICS_OPTIMAL'}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-10 lg:p-16 space-y-12 bg-white flex-1 relative overflow-hidden">
        <div className="grid lg:grid-cols-12 gap-16 h-full">
          {/* Forecast Visualization interface */}
          <div className="lg:col-span-7 space-y-10">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-5">
                <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <Binary className="h-4 w-4 text-amber-600" />
                </div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">Consumption_Forecast_Mesh</h4>
              </div>
              <div className="flex items-center gap-4 bg-slate-50 px-5 py-2 rounded-full border border-slate-100 shadow-inner">
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shadow-glow-amber" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Predictive_Tracking_Active</span>
              </div>
            </div>
            
            <div className="h-[400px] w-full bg-slate-50/50 border border-slate-100 rounded-[3.5rem] p-10 overflow-hidden relative shadow-inner group/chart">
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01] pointer-events-none" />
              <div className="h-full w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={forecastData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="item" 
                      type="category" 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }} 
                      axisLine={false}
                      tickLine={false}
                      width={140}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(245,158,11,0.02)' }}
                      contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)' }} 
                      itemStyle={{ fontSize: '12px', fontWeight: 'black', textTransform: 'uppercase', color: '#f59e0b', letterSpacing: '0.1em' }}
                    />
                    <Bar dataKey="current" fill="#e2e8f0" radius={[0, 12, 12, 0]} name="CURRENT_STOCK" barSize={24} />
                    <Bar dataKey="predicted" fill="#f59e0b" radius={[0, 12, 12, 0]} name="PROJECTED_USAGE" barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-10 rounded-[3rem] bg-amber-50/50 border border-amber-100 flex items-start gap-8 relative overflow-hidden group/insight shadow-inner">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover/insight:scale-110 transition-transform duration-1000">
                <AlertTriangle className="w-32 h-32 text-amber-600" />
              </div>
              <div className="h-14 w-14 rounded-2xl bg-white border border-amber-100 flex items-center justify-center shrink-0 shadow-sm group-hover/insight:scale-110 transition-transform duration-700">
                <AlertTriangle className="h-7 w-7 text-amber-600 animate-pulse" />
              </div>
              <div className="space-y-2 relative z-10 pt-1">
                <p className="text-lg font-black text-slate-950 italic uppercase tracking-tight leading-none">{t('inventoryForecasting.reorderAlert' as any) || 'Critical_Depletion_Threshold'}</p>
                <p className="text-sm text-slate-500 font-medium italic leading-relaxed tracking-tight">
                  {t('ui.hud.stockOutAlert' as any || 'Stock-out node detected for {item} in approximately {days} temporal days.').replace('{item}', 'Botox Type-A').replace('{days}', '12')}
                </p>
              </div>
            </div>
          </div>

          {/* Metrics Grid interface */}
          <div className="lg:col-span-5 space-y-10">
            <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4 italic flex items-center gap-4">
              <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              Inventory_Buffer_Log
            </h4>
            <div className="space-y-6">
              {forecastData.map((item, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 group/item hover:bg-white hover:border-amber-500/20 transition-all duration-700 shadow-inner hover:shadow-premium relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-100 group-hover/item:bg-amber-500 transition-all duration-700" />
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="flex items-center gap-5">
                      <div className="h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/item:scale-110 transition-transform duration-700">
                        <BarChart3 className="h-6 w-6 text-amber-600" />
                      </div>
                      <span className="text-xl font-black text-slate-950 italic uppercase tracking-tighter group-hover/item:text-amber-600 transition-colors leading-none">{item.item}</span>
                    </div>
                    <Badge variant="outline" className="px-4 py-1 rounded-full border-slate-200 bg-white text-slate-400 text-[9px] font-black italic uppercase shadow-sm">NODE_{idx+1}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-8 relative z-10">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic group-hover/item:text-slate-950 transition-colors">{t('inventoryForecasting.metrics.predictedUsage' as any) || 'PROJECTED_CYCLE'}</p>
                      <p className="text-2xl font-black text-amber-600 italic tracking-tighter uppercase leading-none">{item.predicted} {item.unit}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic group-hover/item:text-slate-950 transition-colors">{t('inventoryForecasting.metrics.daysUntilStockout' as any) || 'REMAINING_FLUX'}</p>
                      <p className={cn(
                        "text-2xl font-black italic tracking-tighter uppercase leading-none",
                        item.predicted / item.current > 2 ? "text-rose-600" : "text-emerald-600"
                      )}>
                        {Math.floor((item.current / item.predicted) * 30)} {t('ui.hud.cyclesLeft' as any) || 'CYCLES'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <Button variant="premium" size="xl" className="w-full h-20 rounded-[2.5rem] bg-slate-950 hover:bg-amber-600 text-white font-black uppercase tracking-[0.3em] text-[11px] italic transition-all hover:scale-105 active:scale-95 shadow-2xl hover:shadow-amber-500/20 border-none group/btn">
              {t('ui.hud.generateReorder' as any) || 'INITIALIZE_REPLENISHMENT'}
              <ArrowRight className="ml-4 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 py-8 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
        <div className="flex items-center gap-6 text-slate-400 group/status cursor-default">
          <ShieldCheck className="h-5 w-5 group-hover:text-emerald-500 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">Logistics_Integrity_Verified: NOMINAL</p>
        </div>
        <p className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest italic bg-white px-6 py-2 rounded-full shadow-sm border border-slate-100">Supply_Chain_v4.8 // Multi-Node_Active</p>
      </CardFooter>
    </Card>
  )
}
