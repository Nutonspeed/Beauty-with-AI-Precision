"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Heart, 
  Activity, 
  Target, 
  RotateCcw,
  PieChart as PieIcon
} from "lucide-react"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface CustomerRetentionProps {
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
}

const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"]

export function CustomerRetention({ dateRange }: CustomerRetentionProps) {
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

      const response = await fetch(`/api/center/analytics/customer-retention?${params}`)
      if (!response.ok) throw new Error("Failed to fetch customer retention data")

      const result = await response.json()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      console.error("Error fetching customer retention:", err)
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

  // Prepare segment data for chart
  const segmentData = [
    { name: t('customerRetention.segments.oneTime'), value: data.segments.oneTime, fill: COLORS[0] },
    { name: t('customerRetention.segments.twoToFive'), value: data.segments.twoToFive, fill: COLORS[1] },
    { name: t('customerRetention.segments.moreThanFive'), value: data.segments.moreThanFive, fill: COLORS[2] },
  ]

  return (
    <div className="space-y-12">
      {/* Summary Nodes - Operational Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t('customerRetention.totalCustomers'), val: data.summary.totalCustomers, sub: t('customerRetention.activeNodes', { count: data.summary.customersWithBookings }), icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: t('customerRetention.retentionRate'), val: `${data.summary.retentionRate.toFixed(1)}%`, sub: t('customerRetention.legacyUnits', { count: data.summary.repeatCustomers }), icon: RotateCcw, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: t('customerRetention.averageClv'), val: `฿${data.summary.averageLifetimeValue.toLocaleString()}`, sub: t('customerRetention.lifetimeYieldIndex'), icon: Target, color: 'text-pink-400', bg: 'bg-pink-500/10' },
          { label: t('customerRetention.churnRate'), val: `${data.summary.churnRate.toFixed(1)}%`, sub: t('customerRetention.offlineUnits', { count: data.summary.churnedCustomers }), icon: Activity, color: 'text-rose-400', bg: 'bg-rose-500/10' }
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Segmentation Architecture Node */}
        <div className="lg:col-span-7">
          <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group h-full">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
            <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-row items-center justify-between">
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
                  <PieIcon className="h-8 w-8 text-pink-500" />
                  {t('customerRetention.clientSegmentation')}
                </CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{t('customerRetention.engagementCycleDesc')}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-10 lg:p-12">
              <div className="h-[300px] w-full mb-10">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={segmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${(entry.percent * 100).toFixed(0)}%`}
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={10}
                      dataKey="value"
                    >
                      {segmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} stroke="rgba(255,255,255,0.05)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { label: t('customerRetention.segments.oneTime'), sub: t('customerRetention.segments.retentionPriority'), val: data.segments.oneTime, color: "text-rose-400", bg: "bg-rose-500/10" },
                  { label: t('customerRetention.segments.twoToFive'), sub: t('customerRetention.segments.operationalStable'), val: data.segments.twoToFive, color: "text-teal-400", bg: "bg-teal-500/10" },
                  { label: t('customerRetention.segments.moreThanFive'), sub: t('customerRetention.segments.eliteTier'), val: data.segments.moreThanFive, color: "text-blue-400", bg: "bg-blue-500/10" }
                ].map((seg, i) => (
                  <div key={i} className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-3 group/seg hover:border-white/10 transition-all duration-500">
                    <div className="flex items-center justify-between">
                      <div className={cn("h-2 w-2 rounded-full", seg.color.replace('text-', 'bg-'))} />
                      <Badge className={cn("bg-white/[0.03] border-none text-[9px] font-black uppercase tracking-widest italic shadow-inner", seg.color)}>{seg.val} Units</Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white italic group-hover/seg:text-pink-400 transition-colors">{seg.label}</p>
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-600">{seg.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acquisition Dynamics Column */}
        <div className="lg:col-span-5 space-y-10">
          <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative h-full group">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
            <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
              <CardTitle className="text-2xl font-bold text-white tracking-tight italic">{t('customerRetention.acquisitionVector')}</CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{t('customerRetention.newUnitIngestion')}</CardDescription>
            </CardHeader>
            <CardContent className="p-10 lg:p-12 space-y-10">
              <div className="text-center p-10 rounded-[2.5rem] bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-white/5 shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                  <Users className="w-32 h-32 text-white" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-4 italic">{t('customerRetention.periodNodeAcquisition')}</p>
                <div className="text-7xl font-black text-white tracking-tighter italic">{data.summary.newCustomersInPeriod}</div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mt-4">{t('customerRetention.authorizedUnits')}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: t('customerRetention.cycleConversion'), val: `${data.summary.totalCustomers > 0 ? ((data.summary.customersWithBookings / data.summary.totalCustomers) * 100).toFixed(1) : 0}%`, color: "text-emerald-400" },
                  { label: t('customerRetention.retentionYield'), val: `${data.summary.retentionRate.toFixed(1)}%`, color: "text-blue-400" }
                ].map((node, i) => (
                  <div key={i} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] space-y-2">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-600 italic">{node.label}</p>
                    <p className={cn("text-2xl font-black italic tracking-tighter", node.color)}>{node.val}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Global VIP Matrix */}
      <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
        <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-row items-center justify-between">
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
              <Heart className="h-8 w-8 text-pink-500" />
              {t('customerRetention.eliteClientMatrix')}
            </CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('customerRetention.aggregateYieldDesc')}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('customerRetention.identityRank')}</th>
                  <th className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('customerRetention.clientEntity')}</th>
                  <th className="px-8 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('customerRetention.lifetimeYield')}</th>
                  <th className="px-8 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('customerRetention.cycleCount')}</th>
                  <th className="px-8 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('customerRetention.averageYield')}</th>
                  <th className="px-10 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('customerRetention.initializationNode')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.topCustomers.map((customer: any, index: number) => (
                  <motion.tr
                    key={customer.customerId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="group transition-all duration-500 hover:bg-white/[0.03]"
                  >
                    <td className="px-10 py-8">
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center font-black italic shadow-inner group-hover:scale-110 transition-all duration-700",
                        index === 0 ? "bg-yellow-500 text-white" :
                        index === 1 ? "bg-slate-400 text-white" :
                        index === 2 ? "bg-orange-600 text-white" :
                        "bg-white/[0.03] text-slate-500 border border-white/10"
                      )}>
                        #{index + 1}
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-white tracking-tight italic group-hover:text-pink-400 transition-colors">{customer.customerName}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">NODE_ID: {customer.customerId.slice(0, 8)}</p>
                      </div>
                    </td>
                    <td className="px-8 py-8 text-right">
                      <span className="text-xl font-black text-white italic tracking-tighter group-hover:text-emerald-400 transition-colors">฿{customer.totalValue.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-8 text-right">
                      <div className="text-lg font-black text-white italic tracking-tighter">{customer.totalBookings}</div>
                      <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest italic">{customer.paidBookings} {t('customerRetention.verified')}</p>
                    </td>
                    <td className="px-8 py-8 text-right">
                      <span className="text-sm font-bold text-slate-400 italic">฿{customer.averageOrderValue.toLocaleString()}</span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                        {customer.firstBookingDate ? new Date(customer.firstBookingDate).toLocaleDateString() : 'N/A'}
                      </span>
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
