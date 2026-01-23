"use client"

import { motion } from "framer-motion"
import { LayoutGrid, ArrowUpRight, Zap, MapPin, ShieldCheck, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
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
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });

interface BranchBenchmarkingProps {
  isEnterprise: boolean
}

export function BranchBenchmarking({ isEnterprise }: BranchBenchmarkingProps) {
  const t = useTranslations()

  const branchData = [
    { name: 'Siam Square', revenue: 1250000, efficiency: 92, utilization: 88, color: '#ec4899' },
    { name: 'Sukhumvit 24', revenue: 980000, efficiency: 85, utilization: 72, color: '#3b82f6' },
    { name: 'Ari Node', revenue: 750000, efficiency: 94, utilization: 91, color: '#8b5cf6' },
    { name: 'Central World', revenue: 1450000, efficiency: 89, utilization: 95, color: '#f59e0b' },
  ]

  return (
    <Card className={cn(
      "border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/20 flex flex-col min-h-[700px]",
      !isEnterprise && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {!isEnterprise && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm p-12 text-center">
          <Badge className="mb-6 bg-cyan-50 text-cyan-600 border-none font-black uppercase tracking-[0.3em] italic shadow-sm animate-pulse">
            MULTI_CENTER_INTEL_LOCKED
          </Badge>
          <div className="space-y-4 mb-10">
            <h3 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('branchBenchmarking.title' as any) || 'Network_Benchmarking_Matrix'}</h3>
            <p className="text-slate-500 max-w-sm font-medium italic leading-relaxed text-base">
              Unlock global node comparison and multi-center efficiency analytics across your entire precision aesthetic network.
            </p>
          </div>
          <Button variant="premium" size="xl" className="h-18 px-12 rounded-[2rem] shadow-2xl shadow-cyan-500/20 uppercase text-[11px] font-black tracking-[0.4em] italic border-none bg-slate-950 text-white hover:scale-105 active:scale-95 transition-all">
            <Zap className="mr-4 h-6 w-6" />
            Authorize_Network_Intel
          </Button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
            <div className="p-4 bg-cyan-50 rounded-2xl border border-cyan-100 shadow-sm group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-700">
              <LayoutGrid className="h-8 w-8 text-cyan-600 group-hover:text-white" />
            </div>
            {t('branchBenchmarking.title' as any) || 'Branch_Benchmarking'}
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">
            {t('branchBenchmarking.subtitle' as any) || 'Comparative clinical node performance and utilization analytics'}
          </CardDescription>
        </div>
        {isEnterprise && (
          <Badge className="bg-cyan-600 text-white border-none px-6 py-2 rounded-full text-[10px] font-black italic shadow-lg shadow-cyan-600/30 uppercase tracking-widest animate-pulse">
            {t('branchBenchmarking.globalNetworkSynced' as any) || 'NETWORK_SYNCHRONISED'}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-10 lg:p-16 space-y-12 bg-white flex-1 relative overflow-hidden">
        <div className="grid lg:grid-cols-12 gap-16 h-full">
          {/* Revenue Comparison interface */}
          <div className="lg:col-span-7 space-y-10">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-5">
                <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-cyan-600" />
                </div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">{t('branchBenchmarking.revenueComparison' as any) || 'Revenue_Delta_Mesh'}</h4>
              </div>
              <Badge variant="outline" className="px-4 py-1 rounded-full border-slate-100 bg-slate-50 text-slate-400 text-[9px] font-black italic uppercase shadow-sm">AGGREGATE_YIELD_MATRIX</Badge>
            </div>
            
            <div className="h-[400px] w-full bg-slate-50/50 border border-slate-100 rounded-[3.5rem] p-10 overflow-hidden relative shadow-inner group/chart">
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01] pointer-events-none" />
              <div className="h-full w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={branchData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900', letterSpacing: '0.1em' }} 
                      axisLine={false} 
                      tickLine={false}
                      dy={15} 
                    />
                    <YAxis 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900', letterSpacing: '0.1em' }} 
                      axisLine={false} 
                      tickLine={false}
                      tickFormatter={(v) => `฿${v/1000}K`} 
                      dx={-10} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(6,182,212,0.02)' }}
                      contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)' }} 
                      itemStyle={{ fontSize: '12px', fontWeight: 'black', textTransform: 'uppercase', color: '#06b6d4', letterSpacing: '0.1em' }}
                    />
                    <Bar 
                      dataKey="revenue" 
                      fill="#06b6d4" 
                      radius={[12, 12, 0, 0]}
                      barSize={48}
                      className="shadow-glow-blue"
                    >
                      {branchData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-10 rounded-[3rem] bg-cyan-50/50 border border-cyan-100 flex items-start gap-8 relative overflow-hidden group/insight shadow-inner">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover/insight:scale-110 transition-transform duration-1000">
                <Zap className="w-32 h-32 text-cyan-600" />
              </div>
              <div className="h-14 w-14 rounded-2xl bg-white border border-cyan-100 flex items-center justify-center shrink-0 shadow-sm group-hover/insight:scale-110 transition-transform duration-700">
                <Zap className="h-7 w-7 text-cyan-600 animate-pulse" />
              </div>
              <div className="space-y-2 relative z-10 pt-1">
                <p className="text-lg font-black text-slate-950 italic uppercase tracking-tight leading-none">{t('branchBenchmarking.networkOptimizationInsight' as any) || 'Network_Optimization_Signal'}</p>
                <p className="text-sm text-slate-500 font-medium italic leading-relaxed tracking-tight">
                  {t('branchBenchmarking.optimizationDesc' as any || 'Top node identified at {branch}. Resource re-allocation recommended to normalize global network load.').replace('{branch}', 'CENTRAL WORLD')}
                </p>
              </div>
            </div>
          </div>

          {/* Branch Matrix interface */}
          <div className="lg:col-span-5 space-y-10">
            <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4 italic flex items-center gap-4">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
              {t('branchBenchmarking.branchMatrix' as any) || 'Global_Node_Registry'}
            </h4>
            
            <div className="space-y-6">
              {branchData.map((branch, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 group/item hover:bg-white hover:border-cyan-500/20 transition-all duration-700 shadow-inner hover:shadow-premium relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-100 group-hover/item:bg-cyan-600 transition-all duration-700" />
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/item:scale-110 transition-transform duration-700">
                        <MapPin className="h-7 w-7 text-cyan-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xl font-black text-slate-950 italic uppercase tracking-tighter group-hover/item:text-cyan-600 transition-colors leading-none">{branch.name}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{t('branchBenchmarking.globalRank' as any) || 'NETWORK_RANK'}: #{idx + 1}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">{t('branchBenchmarking.utilizationRate' as any) || 'UTIL_IDX'}</p>
                      <p className="text-2xl font-black text-emerald-600 italic tracking-tighter uppercase leading-none">{branch.utilization}%</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-12 relative z-10">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">{t('branchBenchmarking.efficiencyIndex' as any) || 'EFFICIENCY'}</p>
                      <p className="text-xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{branch.efficiency}%</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">{t('branchBenchmarking.yieldAllocation' as any) || 'ALLOCATED_YIELD'}</p>
                      <p className="text-xl font-black text-pink-600 italic tracking-tighter uppercase leading-none">฿{(branch.revenue / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <Button variant="premium" size="xl" className="w-full h-20 rounded-[2.5rem] bg-slate-950 hover:bg-cyan-600 text-white font-black uppercase tracking-[0.3em] text-[11px] italic transition-all hover:scale-105 active:scale-95 shadow-2xl hover:shadow-cyan-500/20 border-none group/btn">
              {t('branchBenchmarking.synchronizeNetworkData' as any) || 'Initialize_Global_Sync'}
              <ArrowUpRight className="ml-4 h-6 w-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
        <div className="flex items-center gap-6 text-slate-400 group/status cursor-default">
          <ShieldCheck className="h-5 w-5 group-hover:text-emerald-500 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">Infrastructure_Oversight_Verified: NOMINAL</p>
        </div>
        <p className="text-[10px] font-black text-cyan-600/60 uppercase tracking-widest italic bg-white px-6 py-2 rounded-full shadow-sm border border-slate-100">BIP-Branch-v4.8 // Global_Mesh_Active</p>
      </CardFooter>
    </Card>
  )
}
