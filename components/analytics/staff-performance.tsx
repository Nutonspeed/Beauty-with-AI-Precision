"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Users, 
  Star, 
  Trophy, 
  TrendingUp, 
  Activity, 
  DollarSign,
  Info,
  ShieldCheck,
  Loader2
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations, useLocale } from "next-intl"
import { cn } from "@/lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"

interface StaffPerformanceProps {
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
}

export function StaffPerformance({ dateRange }: StaffPerformanceProps) {
  const t = useTranslations()
  const _locale = useLocale()
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

      const response = await fetch(`/api/center/analytics/staff-performance?${params}`)
      if (!response.ok) throw new Error("Failed to fetch staff performance data")

      const result = await response.json()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      console.error("Error fetching staff performance:", err)
    } finally {
      setIsLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const getRoleBadgeStyles = (role: string) => {
    const roleMap: Record<string, string> = {
      specialist: "bg-blue-50 text-blue-600",
      assistant: "bg-emerald-50 text-emerald-600",
      therapist: "bg-purple-50 text-purple-600",
      admin: "bg-orange-50 text-orange-600",
      receptionist: "bg-pink-50 text-pink-600",
    }
    return roleMap[role] || "bg-slate-50 text-slate-400"
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      specialist: t('staffPerformance.roles.specialist' as any) || 'Specialist',
      assistant: t('staffPerformance.roles.assistant' as any) || 'Assistant',
      therapist: t('staffPerformance.roles.therapist' as any) || 'Therapist',
      admin: t('staffPerformance.roles.admin' as any) || 'Admin',
      receptionist: t('staffPerformance.roles.receptionist' as any) || 'Receptionist',
    }
    return labels[role] || role.toUpperCase()
  }

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center py-24 bg-white border border-slate-100 rounded-[3.5rem] shadow-premium">
        <div className="text-center space-y-6">
          <div className="relative h-20 w-20 mx-auto">
            <div className="absolute inset-0 bg-pink-500/10 blur-2xl rounded-full animate-pulse" />
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-pink-600 relative" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse italic">Synchronizing Performance Nodes...</p>
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
            Re-Initialize_Registry
          </Button>
        </Card>
      </div>
    )
  }

  if (!data) return null

  const summaryStats = [
    { label: t('staffPerformance.totalStaff' as any) || 'Active_Personnel', val: data.summary.totalStaff, sub: 'Network Nodes', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t('staffPerformance.totalRevenue' as any) || 'Cumulative_Yield', val: `฿${(data.summary.totalRevenue / 1000).toFixed(1)}k`, sub: 'Financial Inflow', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: t('staffPerformance.totalAppointments' as any) || 'Temporal_Cycles', val: data.summary.totalAppointments, sub: 'Engagement Density', icon: Activity, color: 'text-pink-600', bg: 'bg-pink-50' },
    { label: t('staffPerformance.averageYield' as any) || 'Mean_Yield', val: `฿${(data.summary.averageRevenuePerStaff / 1000).toFixed(1)}k`, sub: 'Per Operator Inflow', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Summary Nodes interface */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map((stat, i) => (
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
        {/* Top Performers Hub interface */}
        <div className="lg:col-span-7">
          <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-1000 hover:border-pink-500/10 h-full">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="p-12 lg:p-16 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-row items-center justify-between">
              <div className="space-y-3">
                <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
                  <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
                    <Trophy className="h-8 w-8 text-pink-600 group-hover:text-white" />
                  </div>
                  {t('staffPerformance.elitePerformers' as any) || 'Elite_Operator_Registry'}
                </CardTitle>
                <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">{t('staffPerformance.productivityDesc' as any) || 'Highest performing personnel nodes based on yield and adherence'}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-10 lg:p-16 space-y-8 bg-white">
              <AnimatePresence>
                {data.topPerformers.map((member: any, index: number) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group/item p-8 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-pink-500/20 transition-all duration-700 relative overflow-hidden shadow-inner hover:shadow-premium"
                  >
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-100 group-hover/item:bg-pink-600 transition-all duration-700" />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
                      <div className="flex items-center gap-8">
                        <div className={cn(
                          "h-16 w-16 rounded-2xl flex items-center justify-center font-black text-2xl italic shadow-inner transition-all duration-700 group-hover/item:scale-110",
                          index === 0 ? "bg-white text-pink-600 border-pink-100" :
                          index === 1 ? "bg-white text-blue-600 border-blue-100" :
                          index === 2 ? "bg-white text-purple-600 border-purple-100" :
                          "bg-slate-50 text-slate-300 border-slate-100"
                        )}>
                          #{index + 1}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-6">
                            <h4 className="text-2xl font-black text-slate-950 italic uppercase group-hover/item:text-pink-600 transition-colors tracking-tighter leading-none">{member.name}</h4>
                            {member.rating > 0 && (
                              <Badge className="bg-amber-50 text-amber-600 border-none px-4 py-1 rounded-full text-[10px] font-black italic shadow-sm flex items-center gap-2">
                                <Star className="h-3 w-3 fill-amber-600" />
                                {member.rating.toFixed(1)}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge className={cn("px-4 py-1 rounded-full text-[9px] font-black uppercase italic border-none shadow-sm leading-none", getRoleBadgeStyles(member.role))}>
                              {getRoleLabel(member.role)}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="text-right space-y-3">
                        <p className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none group-hover/item:text-emerald-600 transition-colors">฿{member.revenue.toLocaleString()}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic leading-none">
                          {member.appointments} Cycles • Mean: ฿{member.averageRevenuePerAppointment.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* Role Dynamics interface */}
        <div className="lg:col-span-5 space-y-10">
          <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-1000 hover:border-blue-500/10 h-full flex flex-col">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="p-12 lg:p-16 pb-8 border-b border-slate-50 bg-slate-50/30">
              <CardTitle className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('staffPerformance.protocolBreakdown' as any) || 'Role_Yield_Dynamics'}</CardTitle>
              <CardDescription className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mt-4 italic">{t('staffPerformance.revenueDistributionDesc' as any) || 'Economic yield distribution across personnel classification nodes'}</CardDescription>
            </CardHeader>
            <CardContent className="p-12 lg:p-16 bg-white flex-1 flex flex-col justify-center">
              <div className="h-[450px] w-full relative group/chart">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01] pointer-events-none" />
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.roleBreakdown} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" vertical={false} />
                    <XAxis 
                      dataKey="role" 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900', letterSpacing: '0.1em' }} 
                      axisLine={false} 
                      tickLine={false}
                      dy={15}
                      tickFormatter={(label) => {
                        const roleMap: Record<string, string> = {
                          specialist: "SPEC",
                          assistant: "AST",
                          therapist: "THR",
                          admin: "MGR",
                          receptionist: "RCP",
                        }
                        return roleMap[label] || label.toUpperCase()
                      }}
                    />
                    <YAxis 
                      hide 
                      domain={[0, 'auto']} 
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(59,130,246,0.02)' }}
                      contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'black', textTransform: 'uppercase', color: '#ff69b4', letterSpacing: '0.1em' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.2em', paddingTop: '40px' }} />
                    <Bar dataKey="totalRevenue" fill="#ec4899" radius={[12, 12, 0, 0]} name="TOTAL_YIELD" barSize={32} className="shadow-glow-pink" />
                    <Bar dataKey="averageRevenuePerStaff" fill="#06b6d4" radius={[12, 12, 0, 0]} name="MEAN_YIELD" barSize={32} className="shadow-glow-blue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Global Personnel Matrix interface */}
      <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-1000 hover:border-pink-500/10">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="p-12 lg:p-16 pb-10 border-b border-slate-50 bg-slate-50/30">
          <div className="space-y-3">
            <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
              <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
                <Users className="h-8 w-8 text-pink-600 group-hover:text-white" />
              </div>
              {t('staffPerformance.globalPersonnelMatrix' as any) || 'Global_Personnel_Efficiency_Matrix'}
            </CardTitle>
            <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">{t('staffPerformance.operatorEfficiencyDesc' as any) || 'Comprehensive personnel node synchronization and productivity analytics'}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-12 py-10 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Identity_Node</th>
                  <th className="px-10 py-10 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Protocol_Access</th>
                  <th className="px-10 py-10 text-right text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Sentiment_Idx</th>
                  <th className="px-10 py-10 text-right text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Sync_Cycles</th>
                  <th className="px-10 py-10 text-right text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Total_Yield</th>
                  <th className="px-12 py-10 text-right text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Efficiency_Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.staffPerformance.map((member: any, index: number) => (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="group/row transition-all duration-500 hover:bg-slate-50 relative"
                  >
                    <td className="px-12 py-10">
                      <div className="flex items-center gap-8">
                        <div className="relative group/avatar">
                          <Avatar className="h-14 w-14 rounded-2xl border-2 border-white shadow-premium transition-transform duration-700 group-hover/avatar:scale-110">
                            <AvatarFallback className="bg-slate-50 text-slate-400 font-black italic uppercase">
                              {member.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-xl font-black text-slate-950 italic group-hover/row:text-pink-600 transition-colors leading-none uppercase tracking-tighter">{member.name}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic leading-none">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-10">
                      <Badge className={cn("px-5 py-1.5 rounded-full text-[10px] font-black uppercase italic shadow-sm border-none leading-none", getRoleBadgeStyles(member.role))}>
                        {getRoleLabel(member.role)}
                      </Badge>
                    </td>
                    <td className="px-10 py-10 text-right">
                      {member.rating > 0 ? (
                        <div className="flex items-center justify-end gap-3">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400 group-hover/row:scale-125 transition-transform" />
                          <span className="text-2xl font-black text-slate-950 italic tracking-tighter leading-none">{member.rating.toFixed(1)}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-slate-200 tracking-widest italic uppercase">NOT_INDEXED</span>
                      )}
                    </td>
                    <td className="px-10 py-10 text-right">
                      <div className="space-y-1">
                        <p className="text-2xl font-black text-slate-950 italic tracking-tighter leading-none group-hover/row:scale-110 transition-transform duration-700">{member.appointments}</p>
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest italic leading-none">{member.totalAppointments} AGGREGATE</p>
                      </div>
                    </td>
                    <td className="px-10 py-10 text-right">
                      <span className="text-2xl font-black text-slate-950 italic tracking-tighter group-hover/row:text-emerald-600 transition-colors leading-none uppercase">฿{member.revenue.toLocaleString()}</span>
                    </td>
                    <td className="px-12 py-10 text-right">
                      <div className="flex flex-col items-end gap-3">
                        <span className="text-lg font-black text-slate-400 group-hover/row:text-pink-600 transition-colors italic tracking-tight uppercase leading-none">฿{member.averageRevenuePerAppointment.toLocaleString()}</span>
                        <div className="w-24 h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner p-0.5">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${(member.revenue / data.summary.totalRevenue) * 500}%` }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                            className="h-full bg-blue-500 shadow-glow-blue/20 rounded-full"
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

      <div className="p-10 lg:p-12 py-8 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
        <div className="flex items-center gap-6 text-slate-400 group/status cursor-default">
          <ShieldCheck className="h-5 w-5 group-hover:text-emerald-500 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">Personnel_Log_Integrity: NOMINAL</p>
        </div>
        <p className="text-[10px] font-black text-blue-600/60 uppercase tracking-widest italic bg-white px-6 py-2 rounded-full shadow-sm border border-slate-100">Staff_Pulse_v4.8 // Active_Stream</p>
      </div>
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
