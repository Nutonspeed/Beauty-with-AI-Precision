"use client"

import { useEffect, useState, useCallback } from "react"
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard,
  Target,
  BarChart3 as BarIcon,
  Package,
  Info,
  ShieldCheck,
  Loader2
} from "lucide-react"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"

interface RevenueAnalyticsProps {
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
}

const COLORS = ["#ff69b4", "#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#06b6d4"]

export function RevenueAnalytics({ dateRange }: RevenueAnalyticsProps) {
  const t = useTranslations()
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!dateRange.from || !dateRange.to) return

    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        start_date: dateRange.from.toISOString(),
        end_date: dateRange.to.toISOString(),
      })

      const response = await fetch(`/api/center/analytics/revenue?${params}`)
      if (!response.ok) throw new Error("Failed to fetch revenue data")

      const result = await response.json()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      console.error("Error fetching revenue analytics:", err)
    } finally {
      setIsLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center py-24 bg-white border border-slate-100 rounded-[3.5rem] shadow-premium">
        <div className="text-center space-y-6">
          <div className="relative h-20 w-20 mx-auto">
            <div className="absolute inset-0 bg-pink-500/10 blur-2xl rounded-full animate-pulse" />
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-pink-600 relative" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse italic">Synchronizing Revenue Nodes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full border-rose-100 bg-rose-50/50 rounded-[3rem] p-10 text-center space-y-6 shadow-premium">
          <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-rose-100">
            <Info className="h-10 w-10 text-rose-600" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">Telemetry_Failure</CardTitle>
            <p className="text-sm text-slate-500 font-medium italic leading-relaxed">{error}</p>
          </div>
          <Button variant="outline" className="w-full h-14 rounded-xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] italic shadow-sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-3" />
            Re-Initialize_Ledger
          </Button>
        </Card>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Summary Nodes interface */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t('revenueAnalyticsInternal.summary.totalRevenue' as any) || 'Gross_Inflow', val: `฿${data.summary.totalRevenue.toLocaleString()}`, sub: t('revenueAnalyticsInternal.summary.cyclesTotal' as any || '{paid}/{total} Synchronized').replace('{paid}', String(data.summary.paidCount)).replace('{total}', String(data.summary.totalBookings)), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: t('revenueAnalyticsInternal.summary.averageYield' as any) || 'Mean_Cycle_Yield', val: `฿${data.summary.averageOrderValue.toLocaleString()}`, sub: t('revenueAnalyticsInternal.summary.perNodeYield' as any) || 'Average per Unit Sync', icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: t('revenueAnalyticsInternal.summary.conversionYield' as any) || 'Conv_Efficiency', val: `${data.summary.conversionRate.toFixed(1)}%`, sub: t('revenueAnalyticsInternal.summary.verifiedFlow' as any) || 'Verified Revenue Stream', icon: TrendingUp, color: 'text-pink-600', bg: 'bg-pink-50' },
          { label: t('revenueAnalyticsInternal.summary.pendingNodes' as any) || 'Pending_Cycles', val: data.summary.pendingCount, sub: t('revenueAnalyticsInternal.summary.awaitingSync' as any) || 'Authorisation Required', icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-50' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] transition-all duration-700 hover:border-pink-500/20 group relative overflow-hidden h-full">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-10 pb-6">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover:text-slate-950 transition-colors">{stat.label}</CardTitle>
                <div className={cn("p-3 rounded-2xl border border-slate-50 shadow-inner group-hover:scale-110 transition-transform duration-700", stat.bg)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
              </CardHeader>
              <CardContent className="p-10 pt-0 space-y-4">
                <div className="text-5xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">{stat.val}</div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic group-hover:text-slate-600 transition-colors leading-relaxed">
                  {stat.sub}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue Momentum interface */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-1000 hover:border-pink-500/10">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="p-12 lg:p-16 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
            <div className="space-y-3">
              <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
                <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
                  <TrendingUp className="h-8 w-8 text-pink-600 group-hover:text-white" />
                </div>
                {t('revenueAnalyticsInternal.momentum.title' as any) || 'Synthesis_Momentum'}
              </CardTitle>
              <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">{t('revenueAnalyticsInternal.momentum.desc' as any) || 'Temporal financial trajectory and cyclical inflow analysis'}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-12 lg:p-16 bg-white relative">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01] pointer-events-none" />
            <div className="h-[400px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.chartData}>
                  <defs>
                    <linearGradient id="colorRevenueLine" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900', letterSpacing: '0.1em' }}
                    axisLine={false}
                    tickLine={false}
                    dy={15}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return `${date.getDate()}/${date.getMonth() + 1}`
                    }}
                  />
                  <YAxis 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900', letterSpacing: '0.1em' }} 
                    axisLine={false} 
                    tickLine={false}
                    tickFormatter={(v: number) => `฿${v/1000}K`} 
                    dx={-10} 
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'black', textTransform: 'uppercase', color: '#ff69b4', letterSpacing: '0.1em' }}
                    formatter={(value: any) => [`฿${value.toLocaleString()}`, 'GROSS_INFLOW']}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#ff69b4" strokeWidth={6} dot={false} activeDot={{ r: 10, strokeWidth: 0, fill: '#ff69b4' }} className="shadow-glow-pink" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Protocol Yield Node interface */}
        <div className="lg:col-span-7">
          <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-1000 hover:border-blue-500/10 h-full">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="p-12 lg:p-16 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-row items-center justify-between">
              <div className="space-y-3">
                <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-700">
                    <BarIcon className="h-8 w-8 text-blue-600 group-hover:text-white" />
                  </div>
                  {t('revenueAnalyticsInternal.protocol.title' as any) || 'Protocol_Yield_Distribution'}
                </CardTitle>
                <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">{t('revenueAnalyticsInternal.protocol.desc' as any) || 'Aesthetic program performance and financial vector analysis'}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-12 lg:p-16 relative bg-white">
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01] pointer-events-none" />
              <div className="h-[400px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.programBreakdown.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" vertical={false} />
                    <XAxis 
                      dataKey="program" 
                      tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: '900', letterSpacing: '0.1em' }} 
                      axisLine={false} 
                      tickLine={false}
                      dy={15} 
                      angle={-45} 
                      textAnchor="end" 
                      height={80} 
                    />
                    <YAxis 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900', letterSpacing: '0.1em' }} 
                      axisLine={false} 
                      tickLine={false}
                      tickFormatter={(v: number) => `฿${v/1000}K`} 
                      dx={-10} 
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(59,130,246,0.02)' }}
                      contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'black', textTransform: 'uppercase', color: '#3b82f6', letterSpacing: '0.1em' }}
                    />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[12, 12, 0, 0]} name="INFLOW_VECTOR" barSize={48} className="shadow-glow-blue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vector Distribution interface */}
        <div className="lg:col-span-5">
          <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-1000 hover:border-purple-500/10 h-full">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="p-12 lg:p-16 pb-8 border-b border-slate-50 bg-slate-50/30">
              <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter leading-none uppercase">{t('revenueAnalyticsInternal.vector.title' as any) || 'Revenue_Segmentation'}</CardTitle>
              <CardDescription className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mt-4 italic">{t('revenueAnalyticsInternal.vector.desc' as any) || 'Yield distribution across global product and service nodes'}</CardDescription>
            </CardHeader>
            <CardContent className="p-12 lg:p-16 bg-white flex flex-col items-center justify-center">
              <div className="h-[350px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.programBreakdown.slice(0, 6)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${entry.percentage.toFixed(0)}%`}
                      innerRadius={90}
                      outerRadius={130}
                      paddingAngle={10}
                      dataKey="revenue"
                    >
                      {data.programBreakdown.slice(0, 6).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={4} className="hover:opacity-80 transition-opacity cursor-pointer" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Protocol Hierarchy Matrix interface */}
      <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-1000 hover:border-pink-500/10">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="p-12 lg:p-16 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-row items-center justify-between">
          <div className="space-y-3">
            <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
              <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
                <CreditCard className="h-8 w-8 text-pink-600 group-hover:text-white" />
              </div>
              {t('revenueAnalyticsInternal.hierarchy.title' as any) || 'Clinical_Yield_Hierarchy'}
            </CardTitle>
            <CardDescription className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mt-4 italic">{t('revenueAnalyticsInternal.hierarchy.desc' as any) || 'Authorised protocol performance registry and economic flux mapping'}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-12 py-10 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Protocol_Node</th>
                  <th className="px-10 py-10 text-right text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('revenueAnalyticsInternal.hierarchy.inflowVelocity' as any) || 'Inflow_Volume'}</th>
                  <th className="px-10 py-10 text-right text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('revenueAnalyticsInternal.hierarchy.cycleDensity' as any) || 'Cycle_Load'}</th>
                  <th className="px-12 py-10 text-right text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('revenueAnalyticsInternal.hierarchy.yieldAllocation' as any) || 'Yield_Matrix'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.programBreakdown.map((item: any, index: number) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="group/row transition-all duration-500 hover:bg-slate-50 relative"
                  >
                    <td className="px-12 py-10">
                      <div className="flex items-center gap-8">
                        <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover/row:bg-white group-hover/row:border-pink-100 transition-all duration-700">
                          <Package className="h-7 w-7 text-slate-300 group-hover/row:text-pink-600 transition-colors" />
                        </div>
                        <p className="text-xl font-black text-slate-950 italic group-hover/row:text-pink-600 transition-colors uppercase tracking-tight leading-none">{item.program}</p>
                      </div>
                    </td>
                    <td className="px-10 py-10 text-right">
                      <span className="text-3xl font-black text-slate-950 italic tracking-tighter group-hover/row:text-emerald-600 transition-colors leading-none uppercase">฿{item.revenue.toLocaleString()}</span>
                    </td>
                    <td className="px-10 py-10 text-right">
                      <div className="space-y-1">
                        <p className="text-2xl font-black text-slate-950 italic tracking-tighter leading-none">{item.count}</p>
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest italic leading-none">{t('customerRetention.cycleCount' as any || 'CYCLES')}</p>
                      </div>
                    </td>
                    <td className="px-12 py-10 text-right">
                      <div className="flex flex-col items-end gap-3">
                        <span className="text-xl font-black text-slate-950 italic tracking-tight">{item.percentage.toFixed(1)}%</span>
                        <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-50 p-0.5 shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.percentage}%` }}
                            transition={{ duration: 1.5, delay: 0.5 + index * 0.05 }}
                            className="h-full bg-pink-600 rounded-full shadow-glow-pink/30"
                          />
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <CardFooter className="p-10 lg:p-12 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
        <div className="flex items-center gap-6 text-slate-400 group/status cursor-default">
          <ShieldCheck className="h-5 w-5 group-hover:text-emerald-500 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">Financial_Audit_Verified: NOMINAL</p>
        </div>
        <p className="text-[10px] font-black text-pink-600/60 uppercase tracking-widest italic bg-white px-6 py-2 rounded-full shadow-sm border border-slate-100">BIP-Revenue-v4.8 // Ledger_Sync_Active</p>
      </CardFooter>
    </div>
  )
}

function RefreshCw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  )
}
