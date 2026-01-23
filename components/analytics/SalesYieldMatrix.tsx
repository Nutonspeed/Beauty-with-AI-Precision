'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { 
  Loader2,
  Binary,
  Award,
  ShieldCheck
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'

// @ts-ignore
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
// @ts-ignore
const ScatterChart = dynamic(() => import('recharts').then(mod => mod.ScatterChart), { ssr: false });
// @ts-ignore
const Scatter = dynamic(() => import('recharts').then(mod => mod.Scatter), { ssr: false });
// @ts-ignore
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
// @ts-ignore
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
// @ts-ignore
const ZAxis = dynamic(() => import('recharts').then(mod => mod.ZAxis), { ssr: false });
// @ts-ignore
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
// @ts-ignore
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
// @ts-ignore
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });

interface YieldData {
  staff_id: string
  name: string
  email: string
  scans: number
  conversions: number
  conversionRate: number
  revenue: number
  quotaEfficiency: number
  avgTicket: number
}

export function SalesYieldMatrix() {
  const t = useTranslations()
  const [data, setData] = useState<YieldData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchYield() {
      try {
        const response = await fetch('/api/analytics/sales-yield?days=30')
        const result = await response.json()
        if (result.success) {
          setData(result.data)
        }
      } catch (error) {
        console.error('Failed to fetch sales yield matrix:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchYield()
  }, [])

  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center py-24 bg-white border border-slate-100 rounded-[3.5rem] shadow-premium">
        <div className="text-center space-y-6">
          <div className="relative h-20 w-20 mx-auto">
            <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full animate-pulse" />
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600 relative" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse italic">Calculating Efficiency Nodes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="grid lg:grid-cols-12 gap-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-8"
        >
          <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-1000 hover:border-blue-500/10">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="p-12 lg:p-16 border-b border-slate-50 bg-slate-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-[0.02] -rotate-12 translate-x-10 -translate-y-10 group-hover:translate-x-5 transition-transform duration-[2000ms]">
                <Binary className="h-40 w-40 text-blue-600" />
              </div>
              <div className="space-y-3 relative z-10">
                <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-700">
                    <Binary className="h-8 w-8 text-blue-600 group-hover:text-white" />
                  </div>
                  {t('salesEfficiency.title' as any) || 'Sales_Yield_Matrix'}
                </CardTitle>
                <CardDescription className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic ml-1">{t('salesEfficiency.subtitle' as any) || 'Multi-dimensional personnel productivity mapping'}</CardDescription>
              </div>
              <Badge variant="outline" className="bg-white border-blue-100 text-blue-600 px-6 py-2 rounded-full text-[10px] font-black italic shadow-sm uppercase tracking-widest animate-pulse relative z-10">
                {t('salesEfficiency.realTimeIntel' as any) || 'REAL_TIME_INTEL_ACTIVE'}
              </Badge>
            </CardHeader>
            <CardContent className="p-12 lg:p-16 relative bg-white">
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01] pointer-events-none" />
              <div className="h-[450px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 30, right: 30, bottom: 30, left: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" vertical={false} />
                    <XAxis 
                      type="number" 
                      dataKey="scans" 
                      name="Scan_Load" 
                      unit=" units" 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900', letterSpacing: '0.1em' }} 
                      axisLine={false}
                      tickLine={false}
                      dy={15}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="revenue" 
                      name="Profit_Result" 
                      unit="฿" 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900', letterSpacing: '0.1em' }} 
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `฿${v/1000}K`}
                      dx={-10}
                    />
                    <ZAxis type="number" dataKey="conversionRate" range={[100, 1500]} name="Conv_Yield" unit="%" />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3', stroke: 'rgba(37,99,235,0.2)' }}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: 'none', 
                        borderRadius: '32px', 
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)',
                        padding: '24px'
                      }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'black', textTransform: 'uppercase', color: '#2563eb', letterSpacing: '0.1em' }}
                    />
                    <Scatter name="Sales Nodes" data={data}>
                      {data.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.conversionRate > 20 ? '#10b981' : entry.conversionRate > 10 ? '#3b82f6' : '#ff69b4'} 
                          className="cursor-pointer transition-all duration-500 hover:opacity-80"
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="lg:col-span-4 space-y-10">
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4 italic flex items-center gap-4">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            {t('salesEfficiency.highYieldNodes' as any) || 'Elite_Yield_Nodes'}
          </h3>
          <div className="space-y-6">
            {data.sort((a, b) => b.revenue - a.revenue).slice(0, 3).map((staff, idx) => (
              <motion.div
                key={staff.staff_id}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] hover:border-pink-500/20 transition-all duration-700 group overflow-hidden relative">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-8 space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-600 shadow-inner group-hover:scale-110 group-hover:bg-blue-50 transition-all duration-700">
                          <Award className={cn("h-8 w-8", idx === 0 ? "text-amber-500" : "text-blue-600")} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xl font-black text-slate-950 italic tracking-tight uppercase leading-none truncate max-w-[140px]">{staff.name}</p>
                          <div className="flex items-center gap-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em] italic">{staff.conversions} {t('salesEfficiency.synchronizations' as any) || 'CYCLES'}</p>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-600 border-none px-4 py-1.5 rounded-full text-[10px] font-black italic shadow-sm uppercase leading-none">
                        {staff.conversionRate}% YIELD
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-10 border-t border-slate-50 pt-8">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] italic leading-none">{t('salesEfficiency.attributedRoi' as any) || 'ATTRIBUTED_ROI'}</p>
                        <p className="text-3xl font-black text-slate-950 italic tracking-tighter leading-none uppercase">฿{(staff.revenue / 1000).toFixed(1)}K</p>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] italic leading-none">{t('salesEfficiency.efficiencyIndex' as any) || 'EFFICIENCY_IDX'}</p>
                        <p className="text-3xl font-black text-blue-600 italic tracking-tighter leading-none uppercase">x{staff.quotaEfficiency}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Node Efficiency Table interface */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-blue-500/10">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="p-10 lg:p-12 border-b border-slate-50 bg-slate-50/30">
            <CardTitle className="text-2xl font-black text-slate-950 italic uppercase tracking-widest">{t('salesEfficiency.nodeIdentifier' as any) || 'Operational_Node_Efficiency_Log'}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/20 border-b border-slate-100">
                    <th className="px-10 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Node_Identity</th>
                    <th className="px-10 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic text-center">{t('salesEfficiency.scanLoad' as any) || 'Scan_Load'}</th>
                    <th className="px-10 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic text-center">{t('salesEfficiency.convYield' as any) || 'Conv_Yield'}</th>
                    <th className="px-10 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic text-center">{t('salesEfficiency.efficiencyIndex' as any) || 'Efficiency_Idx'}</th>
                    <th className="px-10 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic text-right">{t('salesEfficiency.profitResult' as any) || 'Profit_Yield'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((staff, _idx) => (
                    <tr key={staff.staff_id} className="group/row transition-all duration-500 hover:bg-slate-50/50 relative">
                      <td className="px-10 py-10">
                        <div className="flex items-center gap-8">
                          <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-2xl text-slate-200 shadow-inner group-hover/row:scale-110 group-hover/row:bg-white group-hover/row:border-blue-100 group-hover/row:text-blue-600 transition-all duration-700 uppercase italic">
                            {staff.name.charAt(0)}
                          </div>
                          <div className="space-y-1">
                            <p className="text-xl font-black text-slate-950 italic uppercase tracking-tight group-hover/row:text-pink-600 transition-colors leading-none">{staff.name}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{staff.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-10 text-center">
                        <div className="inline-flex flex-col items-center gap-1 group/badge">
                          <span className="text-2xl font-black text-slate-950 italic tracking-tighter uppercase leading-none group-hover/row:scale-110 transition-transform">{staff.scans}</span>
                          <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic">{t('salesEfficiency.units' as any) || 'UNITS'}</span>
                        </div>
                      </td>
                      <td className="px-10 py-10 text-center">
                        <Badge className={cn(
                          "px-6 py-2 rounded-full text-[10px] font-black italic border-none shadow-sm tracking-widest uppercase leading-none",
                          staff.conversionRate > 15 ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                        )}>
                          {staff.conversionRate}%
                        </Badge>
                      </td>
                      <td className="px-10 py-10 text-center">
                        <div className="space-y-3">
                          <p className="text-2xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">x{staff.quotaEfficiency}</p>
                          <div className="h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden mx-auto p-0.5 shadow-inner">
                            <motion.div 
                              initial={{ width: 0 }} 
                              whileInView={{ width: `${Math.min(staff.quotaEfficiency * 20, 100)}%` }} 
                              transition={{ duration: 1.5 }}
                              className="h-full bg-blue-500 rounded-full" 
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-10 text-right">
                        <div className="space-y-1">
                          <p className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none group-hover/row:text-emerald-600 transition-colors">฿{staff.revenue.toLocaleString()}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] italic leading-none">{t('salesEfficiency.nodeRoiAttributed' as any) || 'ROI_ATTRIBUTION'}</p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="p-10 lg:p-12 py-8 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
        <div className="flex items-center gap-6 text-slate-400 group/status cursor-default">
          <ShieldCheck className="h-5 w-5 group-hover:text-emerald-500 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">Node_Integrity_Verified: 2026_PRO</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-1 w-12 bg-white rounded-full overflow-hidden border border-slate-100 shadow-inner">
              <motion.div animate={{ x: [-48, 48] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="h-full w-6 bg-blue-500/40" />
            </div>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Efficiency_Model: BIP-Yield-v4.2</p>
          </div>
        </div>
      </div>
    </div>
  )
}
