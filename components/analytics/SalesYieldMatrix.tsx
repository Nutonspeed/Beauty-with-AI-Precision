
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { 
  Loader2,
  Binary,
  Award
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
      <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] h-[500px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 mx-auto" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">{t('salesEfficiency.calculating')}</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-10">
      <div className="grid lg:grid-cols-12 gap-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8"
        >
          <Card className="border-white/5 bg-slate-900/20 backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(37,99,235,0.1)] relative group ring-1 ring-white/10">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-50" />
            <CardHeader className="p-10 lg:p-12 border-b border-white/5 flex flex-row items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] -rotate-12 translate-x-10 -translate-y-10 group-hover:translate-x-5 transition-transform duration-[2000ms]">
                <Binary className="h-40 w-40 text-white" />
              </div>
              <div className="space-y-3 relative z-10">
                <CardTitle className="text-4xl font-black text-white tracking-tighter italic flex items-center gap-5 uppercase">
                  <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <Binary className="h-8 w-8 text-blue-400" />
                  </div>
                  {t('salesEfficiency.title')}
                </CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic ml-1">{t('salesEfficiency.subtitle')}</CardDescription>
              </div>
              <Badge variant="outline" className="bg-blue-500/5 text-blue-400 border-blue-500/20 px-5 py-1.5 rounded-full text-[10px] font-black italic shadow-lg ring-1 ring-white/5 uppercase tracking-widest">
                {t('salesEfficiency.realTimeIntel')}
              </Badge>
            </CardHeader>
            <CardContent className="p-10 lg:p-16 relative">
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
              <div className="h-[450px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 30, right: 30, bottom: 30, left: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis 
                      type="number" 
                      dataKey="scans" 
                      name={t('salesEfficiency.scanLoad')} 
                      unit={` ${t('salesEfficiency.units')}`} 
                      tick={{ fill: '#475569', fontSize: 10, fontWeight: 'black', letterSpacing: '0.1em' }} 
                      axisLine={false}
                      tickLine={false}
                      label={{ value: t('salesEfficiency.scanLoad').toUpperCase(), position: 'bottom', fill: '#475569', fontSize: 9, fontWeight: 'black', offset: 0, letterSpacing: '0.3em' }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="revenue" 
                      name={t('salesEfficiency.profitResult')} 
                      unit="฿" 
                      tick={{ fill: '#475569', fontSize: 10, fontWeight: 'black', letterSpacing: '0.1em' }} 
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `฿${v/1000}k`}
                      label={{ value: t('salesEfficiency.attributedRoi').toUpperCase(), angle: -90, position: 'left', fill: '#475569', fontSize: 9, fontWeight: 'black', offset: 10, letterSpacing: '0.3em' }}
                    />
                    <ZAxis type="number" dataKey="conversionRate" range={[100, 1500]} name={t('salesEfficiency.convYield')} unit="%" />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3', stroke: 'rgba(37,99,235,0.2)' }}
                      contentStyle={{ 
                        backgroundColor: 'rgba(2, 6, 23, 0.8)', 
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '32px', 
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
                        padding: '24px'
                      }}
                      itemStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', color: '#2563eb', letterSpacing: '0.2em' }}
                    />
                    <Scatter name="Sales Nodes" data={data} fill="#2563eb">
                      {data.map((entry, index) => (
                        <motion.circle 
                          key={`cell-${index}`} 
                          initial={{ r: 0, opacity: 0 }}
                          animate={{ 
                            r: 10 + (entry.conversionRate / 5),
                            opacity: 0.7 
                          }}
                          transition={{ 
                            delay: index * 0.05,
                            type: "spring",
                            stiffness: 100
                          }}
                          fill={entry.conversionRate > 20 ? '#10b981' : entry.conversionRate > 10 ? '#3b82f6' : '#ec4899'} 
                          stroke="rgba(255,255,255,0.2)"
                          strokeWidth={2}
                          className="cursor-pointer transition-all duration-500 hover:opacity-100 hover:stroke-white"
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="lg:col-span-4 space-y-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 ml-4 italic">{t('salesEfficiency.highYieldNodes')}</h3>
          <div className="space-y-6">
            {data.sort((a, b) => b.revenue - a.revenue).slice(0, 3).map((staff, idx) => (
              <motion.div
                key={staff.staff_id}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: idx * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
              >
                <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] hover:bg-white/[0.04] hover:border-blue-500/20 transition-all duration-500 group overflow-hidden relative shadow-xl ring-1 ring-white/5">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-5">
                        <div className="h-14 w-14 rounded-2xl flex items-center justify-center bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner">
                          <Award className="h-7 w-7" />
                        </div>
                        <div>
                          <p className="text-base font-black text-white italic tracking-tight uppercase truncate max-w-[120px]">{staff.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-[8px] uppercase font-black text-slate-600 tracking-[0.2em]">{staff.conversions} {t('salesEfficiency.synchronizations')}</p>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-1 rounded-lg text-[9px] font-black italic tracking-widest uppercase">
                        {staff.conversionRate}% {t('salesEfficiency.yield')}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-6 border-t border-white/5 pt-8">
                      <div className="space-y-2">
                        <p className="text-[8px] font-black uppercase text-slate-500 tracking-[0.3em] italic">{t('salesEfficiency.attributedRoi')}</p>
                        <p className="text-2xl font-black text-white italic tracking-tighter">฿{(staff.revenue / 1000).toFixed(1)}k</p>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="text-[8px] font-black uppercase text-slate-500 tracking-[0.3em] italic">{t('salesEfficiency.efficiencyIndex')}</p>
                        <p className="text-2xl font-black text-blue-400 italic tracking-tighter">x{staff.quotaEfficiency}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Node Efficiency Table */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Card className="border-white/5 bg-slate-900/20 backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative ring-1 ring-white/10">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-10 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">{t('salesEfficiency.nodeIdentifier')}</th>
                    <th className="px-6 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 text-center italic">{t('salesEfficiency.scanLoad')}</th>
                    <th className="px-6 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 text-center italic">{t('salesEfficiency.convYield')}</th>
                    <th className="px-6 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 text-center italic">{t('salesEfficiency.efficiencyIndex')}</th>
                    <th className="px-10 py-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 text-right italic">{t('salesEfficiency.profitResult')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((staff) => (
                    <tr key={staff.staff_id} className="border-b border-white/5 hover:bg-white/[0.03] transition-all duration-300 group">
                      <td className="px-10 py-10">
                        <div className="flex items-center gap-6">
                          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center font-black text-xl text-white shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                            {staff.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-base font-black text-white italic tracking-tight uppercase">{staff.name}</p>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">{staff.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-10 text-center">
                        <div className="inline-flex items-center gap-3">
                          <span className="text-lg font-black text-white italic tracking-tighter">{staff.scans}</span>
                          <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">{t('salesEfficiency.units')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-10 text-center">
                        <Badge variant="outline" className={cn(
                          "px-4 py-1 rounded-lg text-[10px] font-black italic border-none shadow-inner tracking-widest",
                          staff.conversionRate > 15 ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"
                        )}>
                          {staff.conversionRate}%
                        </Badge>
                      </td>
                      <td className="px-6 py-10 text-center">
                        <div className="space-y-1">
                          <p className="text-lg font-black text-white italic tracking-tighter uppercase">x{staff.quotaEfficiency}</p>
                          <div className="h-1 w-16 bg-white/5 rounded-full overflow-hidden mx-auto">
                            <div 
                              className="h-full bg-blue-500" 
                              style={{ width: `${Math.min(staff.quotaEfficiency * 20, 100)}%` }} 
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-10 text-right">
                        <div className="space-y-1">
                          <p className="text-2xl font-black text-white italic tracking-tighter">฿{staff.revenue.toLocaleString()}</p>
                          <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] italic">{t('salesEfficiency.nodeRoiAttributed')}</p>
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
    </div>
  )
}
