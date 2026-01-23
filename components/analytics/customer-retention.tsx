"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Heart, 
  Activity, 
  Target, 
  RotateCcw,
  PieChart as PieIcon,
  ShieldCheck
} from "lucide-react"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import dynamic from 'next/dynamic'

// @ts-ignore
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
// @ts-ignore
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
// @ts-ignore
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
// @ts-ignore
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });
// @ts-ignore
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });

interface CustomerRetentionProps {
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
}

const COLORS = ["#ff69b4", "#3b82f6", "#8b5cf6", "#f59e0b", "#10b981"]

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

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center py-24 bg-white border border-slate-100 rounded-[3.5rem] shadow-premium">
        <div className="text-center space-y-6">
          <div className="relative h-20 w-20 mx-auto">
            <div className="absolute inset-0 bg-pink-500/10 blur-2xl rounded-full animate-pulse" />
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-pink-600 relative" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse italic">Synchronizing Retention Nodes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full border-rose-100 bg-rose-50/50 rounded-[3rem] p-10 text-center space-y-6 shadow-premium">
          <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-rose-100">
            <XCircle className="h-10 w-10 text-rose-600" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">Telemetry_Failure</CardTitle>
            <p className="text-sm text-slate-500 font-light italic leading-relaxed">{error}</p>
          </div>
          <Button variant="outline" className="w-full h-14 rounded-xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] italic shadow-sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-3" />
            Re-Initialize_Registry
          </Button>
        </Card>
      </div>
    )
  }

  if (!data) return null

  const segmentData = [
    { name: t('customerRetention.segments.oneTime' as any) || 'New_Node', value: data.segments.oneTime, fill: COLORS[0] },
    { name: t('customerRetention.segments.twoToFive' as any) || 'Loyal_Cycle', value: data.segments.twoToFive, fill: COLORS[1] },
    { name: t('customerRetention.segments.moreThanFive' as any) || 'Elite_Unit', value: data.segments.moreThanFive, fill: COLORS[2] },
  ]

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Summary Nodes interface */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t('customerRetention.totalCustomers' as any) || 'Total_Identities', val: data.summary.totalCustomers, sub: t('customerRetention.activeNodes' as any || '{count} Active Cycles').replace('{count}', String(data.summary.customersWithBookings)), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: t('customerRetention.retentionRate' as any) || 'Retention_Yield', val: `${data.summary.retentionRate.toFixed(1)}%`, sub: t('customerRetention.legacyUnits' as any || '{count} Repeat Units').replace('{count}', String(data.summary.repeatCustomers)), icon: RotateCcw, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: t('customerRetention.averageClv' as any) || 'Average_LTV', val: `฿${data.summary.averageLifetimeValue.toLocaleString()}`, sub: t('customerRetention.lifetimeYieldIndex' as any) || 'Lifetime Node Yield', icon: Target, color: 'text-pink-600', bg: 'bg-pink-50' },
          { label: t('customerRetention.churnRate' as any) || 'Churn_Delta', val: `${data.summary.churnRate.toFixed(1)}%`, sub: t('customerRetention.offlineUnits' as any || '{count} Node Drift').replace('{count}', String(data.summary.churnedCustomers)), icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50' }
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Segmentation architecture interface */}
        <div className="lg:col-span-7">
          <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-1000 hover:border-pink-500/10 h-full">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="p-12 lg:p-16 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-row items-center justify-between">
              <div className="space-y-3">
                <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
                  <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
                    <PieIcon className="h-8 w-8 text-pink-600 group-hover:text-white" />
                  </div>
                  {t('customerRetention.clientSegmentation' as any) || 'Identity_Segmentation_Matrix'}
                </CardTitle>
                <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">{t('customerRetention.engagementCycleDesc' as any) || 'Biological engagement cycle distribution nodes'}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-12 lg:p-16 bg-white relative">
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01] pointer-events-none" />
              <div className="h-[350px] w-full mb-12 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={segmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${(entry.percent * 100).toFixed(0)}%`}
                      innerRadius={100}
                      outerRadius={140}
                      paddingAngle={10}
                      dataKey="value"
                    >
                      {segmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} stroke="white" strokeWidth={4} className="shadow-lg hover:opacity-80 transition-all duration-500 cursor-pointer" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)' }} 
                      itemStyle={{ fontSize: '12px', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative z-10">
                {[
                  { label: t('customerRetention.segments.oneTime' as any) || 'New_Node', sub: 'Retention_Priority', val: data.segments.oneTime, color: "text-pink-600", bg: "bg-pink-50" },
                  { label: t('customerRetention.segments.twoToFive' as any) || 'Loyal_Cycle', sub: 'Operational_Stable', val: data.segments.twoToFive, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: t('customerRetention.segments.moreThanFive' as any) || 'Elite_Unit', sub: 'High_Yield_Cluster', val: data.segments.moreThanFive, color: "text-purple-600", bg: "bg-purple-50" }
                ].map((seg, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + (i * 0.1) }}
                    className="p-8 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 space-y-4 group/seg hover:bg-white hover:border-pink-500/20 transition-all duration-700 shadow-inner hover:shadow-premium"
                  >
                    <div className="flex items-center justify-between">
                      <div className={cn("h-2 w-2 rounded-full shadow-sm animate-pulse", seg.color.replace('text', 'bg'))} />
                      <Badge className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest italic shadow-sm border-none leading-none", seg.bg, seg.color)}>{seg.val} Units</Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xl font-black text-slate-950 italic group-hover/seg:text-pink-600 transition-colors leading-none uppercase tracking-tighter">{seg.label}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic group-hover/seg:text-slate-600 transition-colors">{seg.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acquisition Dynamics interface */}
        <div className="lg:col-span-5 space-y-10">
          <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-1000 hover:border-blue-500/10 h-full flex flex-col">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="p-12 lg:p-16 pb-8 border-b border-slate-50 bg-slate-50/30">
              <CardTitle className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('customerRetention.acquisitionVector' as any) || 'Entity_Acquisition_Yield'}</CardTitle>
              <CardDescription className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mt-4 italic">{t('customerRetention.newUnitIngestion' as any) || 'New biological node integration nominals'}</CardDescription>
            </CardHeader>
            <CardContent className="p-12 lg:p-16 space-y-12 bg-white flex-1 flex flex-col justify-center">
              <div className="text-center p-12 rounded-[4rem] bg-slate-50 border border-slate-100 shadow-inner relative overflow-hidden group/ingest transition-all duration-700 hover:bg-white hover:border-blue-500/20">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover/ingest:scale-110 group-hover/ingest:rotate-12 transition-transform duration-1000">
                  <Users className="w-48 h-48 text-slate-950" />
                </div>
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6 italic leading-none group-hover/ingest:text-blue-600 transition-colors">{t('customerRetention.periodNodeAcquisition' as any) || 'TEMPORAL_INGESTION_TOTAL'}</p>
                <div className="text-[10rem] font-black text-slate-950 tracking-tighter italic leading-none group-hover/ingest:scale-110 transition-transform duration-1000">{data.summary.newCustomersInPeriod}</div>
                <Badge className="bg-slate-950 text-white border-none px-8 py-2 rounded-full text-[11px] font-black italic shadow-2xl tracking-[0.2em] uppercase mt-10 animate-pulse">AUTHORIZED_NODES</Badge>
              </div>

              <div className="grid grid-cols-2 gap-8">
                {[
                  { label: t('customerRetention.cycleConversion' as any) || 'Cycle_Efficiency', val: `${data.summary.totalCustomers > 0 ? ((data.summary.customersWithBookings / data.summary.totalCustomers) * 100).toFixed(1) : 0}%`, color: "text-emerald-600", bg: "bg-emerald-50" },
                  { label: t('customerRetention.retentionYield' as any) || 'Retention_Flux', val: `${data.summary.retentionRate.toFixed(1)}%`, color: "text-blue-600", bg: "bg-blue-50" }
                ].map((node, i) => (
                  <div key={i} className="p-8 rounded-[2.5rem] border border-slate-100 bg-slate-50/50 shadow-inner space-y-3 group/stat hover:bg-white hover:border-pink-500/20 transition-all duration-700">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic group-hover/stat:text-slate-950 transition-colors leading-none">{node.label}</p>
                    <p className={cn("text-3xl font-black italic tracking-tighter uppercase leading-none", node.color)}>{node.val}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Global VIP Matrix interface */}
      <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-1000 hover:border-pink-500/10">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="p-12 lg:p-16 pb-10 border-b border-slate-50 bg-slate-50/30 flex flex-row items-center justify-between">
          <div className="space-y-3">
            <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
              <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
                <Heart className="h-8 w-8 text-pink-600 group-hover:text-white animate-pulse" />
              </div>
              {t('customerRetention.eliteClientMatrix' as any) || 'Elite_Entity_Yield_Registry'}
            </CardTitle>
            <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">{t('customerRetention.aggregateYieldDesc' as any) || 'Synchronized registry of highest biological yield identity nodes'}</CardDescription>
          </div>
          <Badge variant="outline" className="px-8 py-2.5 rounded-full border-pink-100 bg-white text-pink-600 font-black italic text-[10px] shadow-sm uppercase tracking-widest animate-pulse">ELITE_TIER_LOG</Badge>
        </CardHeader>
        <CardContent className="p-0 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-12 py-10 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('customerRetention.identityRank' as any) || 'Node_Rank'}</th>
                  <th className="px-10 py-10 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('customerRetention.clientEntity' as any) || 'Entity_Node'}</th>
                  <th className="px-10 py-10 text-right text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('customerRetention.lifetimeYield' as any) || 'Lifetime_Inflow'}</th>
                  <th className="px-10 py-10 text-right text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('customerRetention.cycleCount' as any) || 'Sync_Cycles'}</th>
                  <th className="px-10 py-10 text-right text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('customerRetention.averageYield' as any) || 'Mean_Cycle_Value'}</th>
                  <th className="px-12 py-10 text-right text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('customerRetention.initializationNode' as any) || 'Registry_Init'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.topCustomers.map((customer: any, index: number) => (
                  <motion.tr
                    key={customer.customerId}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="group/row transition-all duration-500 hover:bg-slate-50 relative"
                  >
                    <td className="px-12 py-10">
                      <div className={cn(
                        "h-14 w-14 rounded-2xl flex items-center justify-center font-black text-2xl italic shadow-inner transition-all duration-700 group-hover/row:scale-110",
                        index === 0 ? "bg-pink-50 text-pink-600 border border-pink-100" :
                        index === 1 ? "bg-blue-50 text-blue-600 border border-blue-100" :
                        index === 2 ? "bg-purple-50 text-purple-600 border border-purple-100" :
                        "bg-slate-50 text-slate-300 border border-slate-100"
                      )}>
                        #{index + 1}
                      </div>
                    </td>
                    <td className="px-10 py-10">
                      <div className="space-y-1.5">
                        <p className="text-2xl font-black text-slate-950 italic tracking-tighter group-hover/row:text-pink-600 transition-colors leading-none uppercase">{customer.customerName}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic leading-none">NODE_ID: {customer.customerId.slice(0, 12).toUpperCase()}...</p>
                      </div>
                    </td>
                    <td className="px-10 py-10 text-right">
                      <span className="text-3xl font-black text-slate-950 italic tracking-tighter group-hover/row:text-emerald-600 transition-colors leading-none">฿{customer.totalValue.toLocaleString()}</span>
                    </td>
                    <td className="px-10 py-10 text-right">
                      <div className="space-y-1">
                        <p className="text-2xl font-black text-slate-950 italic tracking-tighter leading-none">{customer.totalBookings}</p>
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest italic leading-none">{customer.paidBookings} {t('customerRetention.verified' as any) || 'AUTHORISED'}</p>
                      </div>
                    </td>
                    <td className="px-10 py-10 text-right">
                      <span className="text-xl font-black text-slate-400 group-hover/row:text-slate-950 transition-colors italic tracking-tight">฿{customer.averageOrderValue.toLocaleString()}</span>
                    </td>
                    <td className="px-12 py-10 text-right">
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
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

      <div className="p-10 lg:p-12 py-8 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
        <div className="flex items-center gap-6 text-slate-400 group/status cursor-default">
          <ShieldCheck className="h-5 w-5 group-hover:text-emerald-500 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">Retention_Log_Integrity: NOMINAL</p>
        </div>
        <div className="flex items-center gap-6">
          <Badge variant="outline" className="bg-white border-slate-100 text-slate-300 text-[8px] font-black italic uppercase tracking-widest px-4 py-1.5 rounded-full">BIP-RETENTION-v4.8</Badge>
          <div className="h-4 w-px bg-slate-200" />
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Temporal_Epoch: 2026.4</p>
        </div>
      </div>
    </div>
  )
}

function Loader2(props: any) {
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
      <path d="M12 2v4" />
      <path d="m16.2 7.8 2.9-2.9" />
      <path d="M18 12h4" />
      <path d="m16.2 16.2 2.9 2.9" />
      <path d="M12 18v4" />
      <path d="m4.9 19.1 2.9-2.9" />
      <path d="M2 12h4" />
      <path d="m4.9 4.9 2.9 2.9" />
    </svg>
  )
}

function XCircle(props: any) {
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
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
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
