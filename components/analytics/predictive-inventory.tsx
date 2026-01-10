"use client"

import { Package, AlertTriangle, ArrowRight, BarChart3, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import dynamic from 'next/dynamic'

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
    { item: 'Botox Type-A', current: 45, predicted: 82, unit: 'Vials' },
    { item: 'Filler (Lips)', current: 12, predicted: 35, unit: 'Syringes' },
    { item: 'HIFU Cartridge', current: 3, predicted: 8, unit: 'Units' },
    { item: 'Laser Cooling Gel', current: 15, predicted: 40, unit: 'Litres' },
  ]

  return (
    <Card className={cn(
      "border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group animate-neural-pulse",
      !isEnterprise && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
      
      {!isEnterprise && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#020617]/60 backdrop-blur-sm p-10 text-center">
          <div className="h-20 w-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 shadow-2xl">
            <ShieldCheck className="h-10 w-10 text-amber-500" />
          </div>
          <h3 className="text-2xl font-bold text-white italic mb-4">{t('inventoryForecasting.title')}</h3>
          <p className="text-slate-400 max-w-sm font-light mb-8">
            {t('inventoryForecasting.subtitle')}
          </p>
          <Button variant="premium" className="h-14 px-10 rounded-2xl border shadow-xl shadow-amber-500/20 uppercase text-[10px] font-black tracking-widest italic">
            {t('inventoryForecasting.unlockEnterprise')}
          </Button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-row items-center justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/[0.02] to-transparent animate-neural-pulse pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <Package className="h-8 w-8 text-amber-400" />
            {t('inventoryForecasting.title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('inventoryForecasting.subtitle')}
          </CardDescription>
        </div>
        {isEnterprise && (
          <Badge className="bg-amber-600 text-white border-none px-4 py-1 text-[9px] font-black tracking-widest uppercase italic">
            {t('inventoryForecasting.efficiencyBadge')}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Forecast Visualization */}
          <div className="lg:col-span-7 space-y-8">
            <div className="h-[350px] w-full bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={forecastData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="item" 
                    type="category" 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} 
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '24px' }}
                  />
                  <Bar dataKey="current" fill="#475569" radius={[0, 4, 4, 0]} name={t('inventoryForecasting.inStock')} />
                  <Bar dataKey="predicted" fill="#f59e0b" radius={[0, 4, 4, 0]} name={t('inventoryForecasting.predictedUsage30d')} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-6 p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl">
              <AlertTriangle className="h-6 w-6 text-amber-500 animate-pulse" />
              <div>
                <p className="text-sm font-bold text-white italic">{t('inventoryForecasting.reorderAlert')}</p>
                <p className="text-[10px] text-slate-500 font-light mt-1">
                  {t('ui.hud.stockOutAlert', { item: 'Botox Type-A', days: '12' })}
                </p>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="lg:col-span-5 space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{t('ui.hud.inventoryBuffer')}</h4>
            <div className="space-y-6">
              {forecastData.map((item, idx) => (
                <div key={idx} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl group/item hover:bg-white/[0.04] transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                      <BarChart3 className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-bold text-white italic uppercase tracking-tighter">{item.item}</span>
                    </div>
                    <Badge variant="outline" className="text-[8px] font-black tracking-widest border-white/10 text-slate-500">Node_{idx+1}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{t('inventoryForecasting.metrics.predictedUsage')}</p>
                      <p className="text-sm font-black text-amber-500 italic">{item.predicted} {item.unit}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{t('inventoryForecasting.metrics.daysUntilStockout')}</p>
                      <p className={cn(
                        "text-sm font-black italic",
                        item.predicted / item.current > 2 ? "text-rose-500" : "text-emerald-400"
                      )}>
                        {Math.floor((item.current / item.predicted) * 30)} {t('ui.hud.cyclesLeft')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full h-14 rounded-2xl bg-white/[0.03] border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10">
              {t('ui.hud.generateReorder')}
              <ArrowRight className="ml-3 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
