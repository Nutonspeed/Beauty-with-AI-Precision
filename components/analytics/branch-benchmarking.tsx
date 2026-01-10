"use client"

import { LayoutGrid, TrendingUp, ArrowUpRight, Zap, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import dynamic from 'next/dynamic'

// @ts-ignore
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
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
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false });

interface BranchBenchmarkingProps {
  isEnterprise: boolean
}

export function BranchBenchmarking({ isEnterprise }: BranchBenchmarkingProps) {
  const t = useTranslations()

  const branchData = [
    { name: 'Siam Square', revenue: 1250000, efficiency: 92, utilization: 88 },
    { name: 'Sukhumvit 24', revenue: 980000, efficiency: 85, utilization: 72 },
    { name: 'Ari Node', revenue: 750000, efficiency: 94, utilization: 91 },
    { name: 'Central World', revenue: 1450000, efficiency: 89, utilization: 95 },
  ]

  return (
    <Card className={cn(
      "border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group",
      !isEnterprise && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      
      {!isEnterprise && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#020617]/60 backdrop-blur-sm p-10 text-center">
          <Badge className="mb-4 bg-cyan-500/20 text-cyan-400 border-cyan-500/30 uppercase tracking-widest font-black">{t('branchBenchmarking.multiClinicIntelligence')}</Badge>
          <h3 className="text-2xl font-bold text-white italic mb-4">{t('branchBenchmarking.title')}</h3>
          <p className="text-slate-400 max-w-sm font-light mb-8">
            {t('branchBenchmarking.subtitle')}
          </p>
          <Button variant="premium" className="h-14 px-10 rounded-2xl border shadow-xl shadow-cyan-500/20 uppercase text-[10px] font-black tracking-widest italic">
            {t('branchBenchmarking.unlockMultiBranchDashboard')}
          </Button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-row items-center justify-between">
        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <LayoutGrid className="h-8 w-8 text-cyan-400" />
            {t('branchBenchmarking.title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('branchBenchmarking.subtitle')}
          </CardDescription>
        </div>
        {isEnterprise && (
          <Badge className="bg-cyan-600 text-white border-none px-4 py-1 text-[9px] font-black tracking-widest uppercase italic">
            {t('branchBenchmarking.globalNetworkSynced')}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Revenue Comparison Chart */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black uppercase tracking-widest text-white italic flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-cyan-500" />
                {t('branchBenchmarking.revenueComparison')}
              </h4>
              <Badge variant="outline" className="text-[8px] border-white/5 text-slate-500 italic">{t('branchBenchmarking.aggregateYieldMatrix')}</Badge>
            </div>
            
            <div className="h-[350px] w-full bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} axisLine={false} />
                  <YAxis tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickFormatter={(v) => `฿${v/1000}k`} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '24px' }}
                  />
                  <Bar dataKey="revenue" fill="#ec4899" radius={[12, 12, 0, 0]} name={t('branchBenchmarking.inflowVector')} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-6 bg-cyan-500/5 border border-cyan-500/10 rounded-3xl flex items-start gap-6">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shrink-0">
                <Zap className="h-5 w-5 text-cyan-500" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-white italic">{t('branchBenchmarking.networkOptimizationInsight')}</p>
                <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                  {t('branchBenchmarking.optimizationDesc', { branch: 'Central World' })}
                </p>
              </div>
            </div>
          </div>

          {/* Branch Performance Matrix */}
          <div className="lg:col-span-5 space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{t('branchBenchmarking.branchMatrix')}</h4>
            
            <div className="space-y-6">
              {branchData.map((branch, idx) => (
                <div key={idx} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl group/branch hover:bg-white/[0.04] transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-cyan-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white italic">{branch.name}</p>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t('branchBenchmarking.globalRank')}: #{idx + 1}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{t('branchBenchmarking.utilizationRate')}</p>
                      <p className="text-sm font-black text-emerald-400 italic">{branch.utilization}%</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{t('branchBenchmarking.efficiencyIndex')}</p>
                      <p className="text-sm font-black text-white italic">{branch.efficiency}%</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{t('branchBenchmarking.yieldAllocation')}</p>
                      <p className="text-sm font-black text-pink-500 italic">฿{(branch.revenue / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Button variant="outline" className="w-full h-16 rounded-2xl border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 italic">
              {t('branchBenchmarking.synchronizeNetworkData')}
              <ArrowUpRight className="ml-3 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
