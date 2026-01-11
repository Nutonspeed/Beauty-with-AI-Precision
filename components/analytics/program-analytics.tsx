"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  Package, 
  DollarSign,
  Target,
  BarChart3 as BarIcon
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface ProgramAnalyticsProps {
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
}

export function ProgramAnalytics({ dateRange }: ProgramAnalyticsProps) {
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

      const response = await fetch(`/api/center/analytics/programs?${params}`)
      if (!response.ok) throw new Error("Failed to fetch program data")

      const result = await response.json()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      console.error("Error fetching treatment analytics:", err)
    } finally {
      setIsLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">ไม่สามารถโหลดข้อมูลได้: {error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const summaryStats = [
    { label: t('programAnalytics.totalPrograms'), val: data.summary.totalPrograms, sub: t('programAnalytics.activeProtocols'), icon: Package, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: t('programAnalytics.totalBookings'), val: data.summary.totalBookings, sub: t('programAnalytics.temporalCycles'), icon: Activity, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { label: t('programAnalytics.totalRevenue'), val: `฿${data.summary.totalRevenue.toLocaleString()}`, sub: t('programAnalytics.cumulativeYield'), icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: t('programAnalytics.averageYield'), val: `฿${data.summary.averageRevenuePerProgram.toLocaleString()}`, sub: t('programAnalytics.perProtocol'), icon: Target, color: 'text-cyan-400', bg: 'bg-cyan-500/10' }
  ];

  return (
    <div className="space-y-12">
      {/* Summary Nodes - Operational Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map((stat, i) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Top Programs Hub */}
        <div className="lg:col-span-7">
          <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group h-full">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
            <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-row items-center justify-between">
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
                  <Activity className="h-8 w-8 text-pink-500" />
                  {t('programAnalytics.eliteProtocols')}
                </CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('programAnalytics.programYieldDesc')}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-10 lg:p-12 space-y-6">
              <AnimatePresence>
                {data.topPrograms.map((item: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group/item flex items-center justify-between p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-pink-500/20 transition-all duration-500 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-pink-600/20 group-hover/item:bg-pink-600 transition-colors" />
                    
                    <div className="flex items-center gap-8">
                      <div className={cn(
                        "h-14 w-14 rounded-2xl flex items-center justify-center font-black italic shadow-inner group-hover/item:scale-110 transition-all duration-700",
                        index === 0 ? "bg-yellow-500 text-white" :
                        index === 1 ? "bg-slate-400 text-white" :
                        index === 2 ? "bg-orange-600 text-white" :
                        "bg-white/[0.03] text-slate-500 border border-white/10"
                      )}>
                        #{index + 1}
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-2xl font-bold text-white tracking-tight italic group-hover:text-pink-400 transition-colors">{item.program}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">
                          {item.bookings} Cycles • {item.uniqueCustomers} Authorized Units
                        </p>
                      </div>
                    </div>

                    <div className="text-right space-y-2">
                      <p className="text-2xl font-black text-white tracking-tighter italic">฿{item.revenue.toLocaleString()}</p>
                      <div className="flex items-center justify-end gap-2">
                        {item.growthRate > 0 ? (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-none rounded-full px-3 py-0.5 text-[9px] font-black italic">
                            <ArrowUpRight className="h-2.5 w-2.5 mr-1" />
                            {item.growthRate.toFixed(1)}%
                          </Badge>
                        ) : item.growthRate < 0 ? (
                          <Badge className="bg-rose-500/10 text-rose-400 border-none rounded-full px-3 py-0.5 text-[9px] font-black italic">
                            <ArrowDownRight className="h-2.5 w-2.5 mr-1" />
                            {item.growthRate.toFixed(1)}%
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-600 border-white/5 text-[8px] font-black italic">NOMINAL</Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Column */}
        <div className="lg:col-span-5 space-y-10">
          <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative h-full group">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
            <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
              <CardTitle className="text-2xl font-bold text-white tracking-tight italic">{t('programAnalytics.protocolVelocity')}</CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{t('programAnalytics.cycleLoadDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="p-10 lg:p-12">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.programs.slice(0, 10)} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis 
                      dataKey="program" 
                      tick={{ fill: '#475569', fontSize: 9, fontWeight: 'bold' }} 
                      axisLine={false} 
                      dy={15}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fill: '#475569', fontSize: 9, fontStyle: 'bold' }} axisLine={false} dx={-10} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                      itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.6, paddingTop: '30px' }} />
                    <Bar dataKey="bookings" fill="#ec4899" radius={[8, 8, 0, 0]} name={t('programAnalytics.totalCycles')} />
                    <Bar dataKey="paidCount" fill="#06b6d4" radius={[8, 8, 0, 0]} name={t('programAnalytics.verifiedNodes')} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Global Protocol Matrix */}
      <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
        <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-row items-center justify-between">
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
              <BarIcon className="h-8 w-8 text-pink-500" />
              {t('programAnalytics.globalProtocolMatrix')}
            </CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('programAnalytics.programEfficiencyDesc')}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('programAnalytics.protocolIdentifier')}</th>
                  <th className="px-8 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('programAnalytics.cycleDensity')}</th>
                  <th className="px-8 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('programAnalytics.cumulativeYield')}</th>
                  <th className="px-8 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('programAnalytics.averageYield')}</th>
                  <th className="px-8 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('programAnalytics.unitReach')}</th>
                  <th className="px-10 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('programAnalytics.momentumVector')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.programs.map((item: any, index: number) => (
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
                        <p className="text-lg font-bold text-white tracking-tight italic group-hover:text-pink-400 transition-colors">{item.program}</p>
                      </div>
                    </td>
                    <td className="px-8 py-8 text-right">
                      <div className="text-lg font-black text-white italic tracking-tighter">{item.bookings}</div>
                      <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest italic">{item.bookingPercentage.toFixed(1)}% LOAD</p>
                    </td>
                    <td className="px-8 py-8 text-right">
                      <span className="text-xl font-black text-white italic tracking-tighter group-hover:text-emerald-400 transition-colors">฿{item.revenue.toLocaleString()}</span>
                      <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest italic">{item.revenuePercentage.toFixed(1)}% YIELD</p>
                    </td>
                    <td className="px-8 py-8 text-right">
                      <span className="text-sm font-bold text-slate-400 italic">฿{item.averagePrice.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-8 text-right">
                      <span className="text-lg font-black text-white italic tracking-tighter">{item.uniqueCustomers}</span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      {item.growthRate > 0 ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-none rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest italic shadow-inner">
                          <ArrowUpRight className="h-2.5 w-2.5 mr-1.5" />
                          +{item.growthRate.toFixed(0)}%
                        </Badge>
                      ) : item.growthRate < 0 ? (
                        <Badge className="bg-rose-500/10 text-rose-400 border-none rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest italic shadow-inner">
                          <ArrowDownRight className="h-2.5 w-2.5 mr-1.5" />
                          {item.growthRate.toFixed(0)}%
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-white/5 bg-white/[0.02] text-[8px] font-black text-slate-700 italic">0% DELTA</Badge>
                      )}
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
