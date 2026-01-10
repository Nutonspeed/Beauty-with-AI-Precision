"use client"

import { useEffect, useState, useCallback } from "react"
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard,
  Target,
  BarChart3 as BarIcon,
  Package
} from "lucide-react"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
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
  Cell,
} from "recharts"

interface RevenueAnalyticsProps {
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

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

      const response = await fetch(`/api/clinic/analytics/revenue?${params}`)
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">{t('common.error')}: {error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-12">
      {/* Summary Nodes - Operational Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t('revenueAnalyticsInternal.summary.totalRevenue'), val: `฿${data.summary.totalRevenue.toLocaleString()}`, sub: t('revenueAnalyticsInternal.summary.cyclesTotal', { paid: data.summary.paidCount, total: data.summary.totalBookings }), icon: DollarSign, color: 'text-pink-400', bg: 'bg-pink-500/10' },
          { label: t('revenueAnalyticsInternal.summary.averageYield'), val: `฿${data.summary.averageOrderValue.toLocaleString()}`, sub: t('revenueAnalyticsInternal.summary.perNodeYield'), icon: Target, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: t('revenueAnalyticsInternal.summary.conversionYield'), val: `${data.summary.conversionRate.toFixed(1)}%`, sub: t('revenueAnalyticsInternal.summary.verifiedFlow'), icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: t('revenueAnalyticsInternal.summary.pendingNodes'), val: data.summary.pendingCount, sub: t('revenueAnalyticsInternal.summary.awaitingSync'), icon: CreditCard, color: 'text-amber-400', bg: 'bg-amber-500/10' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2rem] hover:bg-white/[0.03] transition-all duration-500 group shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">{stat.label}</CardTitle>
                <div className={cn("p-2 rounded-lg border border-white/5 shadow-inner transition-transform duration-700 group-hover:scale-110", stat.bg)}>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-white tracking-tighter italic">{stat.val}</div>
                <p className="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-500 italic">
                  {stat.sub}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue Momentum Node */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
          <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-row items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
                <TrendingUp className="h-8 w-8 text-pink-500" />
                {t('revenueAnalyticsInternal.momentum.title')}
              </CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('revenueAnalyticsInternal.momentum.desc')}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-10 lg:p-16">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.chartData}>
                  <defs>
                    <linearGradient id="colorRevenueLine" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }}
                    axisLine={false}
                    dy={15}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return `${date.getDate()}/${date.getMonth() + 1}`
                    }}
                  />
                  <YAxis tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickFormatter={(v: number) => `฿${v/1000}k`} dx={-10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    formatter={(value: any) => [`฿${value.toLocaleString()}`, t('revenueAnalyticsInternal.momentum.grossInflow')]}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#ec4899" strokeWidth={4} dot={false} activeDot={{ r: 8, strokeWidth: 0, fill: '#ec4899' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Protocol Yield Node */}
        <div className="lg:col-span-7">
          <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group h-full">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
            <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-row items-center justify-between">
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
                  <BarIcon className="h-8 w-8 text-cyan-400" />
                  {t('revenueAnalyticsInternal.protocol.title')}
                </CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('revenueAnalyticsInternal.protocol.desc')}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-10 lg:p-12">
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.treatmentBreakdown.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="treatment" tick={{ fill: '#475569', fontSize: 9, fontWeight: 'bold' }} axisLine={false} dy={15} angle={-45} textAnchor="end" height={80} />
                    <YAxis tick={{ fill: '#475569', fontSize: 9, fontWeight: 'bold' }} axisLine={false} tickFormatter={(v: number) => `฿${v/1000}k`} dx={-10} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                    />
                    <Bar dataKey="revenue" fill="#06b6d4" radius={[8, 8, 0, 0]} name={t('revenueAnalyticsInternal.protocol.inflowVector')} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vector Distribution Column */}
        <div className="lg:col-span-5">
          <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative h-full group">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
            <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
              <CardTitle className="text-2xl font-bold text-white tracking-tight italic">{t('revenueAnalyticsInternal.vector.title')}</CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{t('revenueAnalyticsInternal.vector.desc')}</CardDescription>
            </CardHeader>
            <CardContent className="p-10 lg:p-12">
              <div className="h-[300px] w-full mb-10">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.treatmentBreakdown.slice(0, 6)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${entry.percentage.toFixed(0)}%`}
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={10}
                      dataKey="revenue"
                    >
                      {data.treatmentBreakdown.slice(0, 6).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.05)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Protocol Hierarchy Matrix */}
      <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-row items-center justify-between">
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
              <CreditCard className="h-8 w-8 text-pink-500" />
              {t('revenueAnalyticsInternal.hierarchy.title')}
            </CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('revenueAnalyticsInternal.hierarchy.desc')}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('revenueAnalyticsInternal.hierarchy.protocolIdentifier')}</th>
                  <th className="px-8 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('revenueAnalyticsInternal.hierarchy.inflowVelocity')}</th>
                  <th className="px-8 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('revenueAnalyticsInternal.hierarchy.cycleDensity')}</th>
                  <th className="px-10 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('revenueAnalyticsInternal.hierarchy.yieldAllocation')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.treatmentBreakdown.map((item: any, index: number) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="group transition-all duration-500 hover:bg-white/[0.03]"
                  >
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 group-hover:border-pink-500/30 transition-all">
                          <Package className="h-5 w-5 text-slate-500 group-hover:text-pink-400 transition-colors" />
                        </div>
                        <p className="text-lg font-bold text-white tracking-tight italic group-hover:text-pink-400 transition-colors">{item.treatment}</p>
                      </div>
                    </td>
                    <td className="px-8 py-8 text-right">
                      <span className="text-xl font-black text-white italic tracking-tighter group-hover:text-emerald-400 transition-colors">฿{item.revenue.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-8 text-right">
                      <div className="text-lg font-black text-white italic tracking-tighter">{item.count}</div>
                      <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest italic">{t('customerRetention.cycleCount')}</p>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-sm font-bold text-slate-400 italic">{item.percentage.toFixed(1)}%</span>
                        <div className="w-24 h-1 bg-white/[0.05] rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${item.percentage}%` }}
                            transition={{ duration: 1, delay: 0.5 + index * 0.05 }}
                            className="h-full bg-pink-600"
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
    </div>
  )
}
