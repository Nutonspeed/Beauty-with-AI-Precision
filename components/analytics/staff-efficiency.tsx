"use client"

import { Users, Zap, Clock, Star, Award, ShieldCheck, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import dynamic from 'next/dynamic'
import { motion } from "framer-motion"

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
const _Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });

interface StaffEfficiencyProps {
  isEnterprise: boolean
}

export function StaffEfficiency({ isEnterprise }: StaffEfficiencyProps) {
  const t = useTranslations()

  const staffData = [
    { name: 'Specialist Sarah', revenue: 450000, efficiency: 94, sessions: 120, rating: 4.9, color: '#ec4899' },
    { name: 'Assistant Joy', revenue: 280000, efficiency: 88, sessions: 145, rating: 4.8, color: '#3b82f6' },
    { name: 'Specialist Mike', revenue: 520000, efficiency: 91, sessions: 98, rating: 4.7, color: '#8b5cf6' },
    { name: 'Therapist Ann', revenue: 150000, efficiency: 82, sessions: 160, rating: 4.6, color: '#f59e0b' },
  ]

  const forecastLoad = [
    { hour: '10:00', load: 40 },
    { hour: '12:00', load: 85 },
    { hour: '14:00', load: 95 },
    { hour: '16:00', load: 70 },
    { hour: '18:00', load: 30 },
  ]

  return (
    <Card className={cn(
      "border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-purple-500/20 flex flex-col min-h-[700px]",
      !isEnterprise && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {!isEnterprise && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm p-12 text-center">
          <Badge className="mb-6 bg-purple-50 text-purple-600 border-none font-black uppercase tracking-[0.3em] italic shadow-sm animate-pulse">
            STAFF_AI_RESTRICTED
          </Badge>
          <div className="space-y-4 mb-10">
            <h3 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('staffProductivity.title' as any) || 'Personnel_Yield_Matrix'}</h3>
            <p className="text-slate-500 max-w-sm font-medium italic leading-relaxed text-base">
              Unlock predictive staffing algorithms and individual operator efficiency tracking derived from clinical output nodes.
            </p>
          </div>
          <Button variant="premium" size="xl" className="h-18 px-12 rounded-[2rem] shadow-2xl shadow-purple-500/20 uppercase text-[11px] font-black tracking-[0.4em] italic border-none bg-slate-950 text-white hover:scale-105 active:scale-95 transition-all">
            <Zap className="mr-4 h-6 w-6" />
            Authorize_Personnel_AI
          </Button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 shadow-sm group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all duration-700">
              <Users className="h-8 w-8 text-purple-600 group-hover:text-white" />
            </div>
            {t('staffProductivity.title' as any) || 'Staff_Efficiency'}
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">
            {t('staffProductivity.subtitle' as any) || 'Real-time personnel node productivity and load synchronization'}
          </CardDescription>
        </div>
        {isEnterprise && (
          <Badge className="bg-purple-600 text-white border-none px-6 py-2 rounded-full text-[10px] font-black italic shadow-lg shadow-purple-600/30 uppercase tracking-widest animate-pulse">
            {t('staffProductivity.aiProductivitySynced' as any) || 'AI_PRODUCTIVITY_ON'}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-10 lg:p-16 space-y-12 bg-white flex-1 relative overflow-hidden">
        <div className="grid lg:grid-cols-12 gap-16 h-full">
          {/* Predictive Staffing Node interface */}
          <div className="lg:col-span-7 space-y-10">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-5">
                <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-purple-600" />
                </div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">{t('staffProductivity.predictiveStaffing' as any) || 'Temporal_Load_Matrix'}</h4>
              </div>
              <Badge variant="outline" className="px-4 py-1 rounded-full border-purple-50 text-purple-600 bg-white font-black italic tracking-widest text-[9px] uppercase shadow-sm">
                REALTIME_SYNC
              </Badge>
            </div>
            
            <div className="h-[350px] w-full bg-slate-50/50 border border-slate-100 rounded-[3.5rem] p-10 overflow-hidden relative shadow-inner group/chart">
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01] pointer-events-none" />
              <div className="h-full w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={forecastLoad}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" vertical={false} />
                    <XAxis 
                      dataKey="hour" 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }} 
                      axisLine={false} 
                      tickLine={false}
                      dy={15}
                    />
                    <YAxis 
                      hide 
                      domain={[0, 100]} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(168,85,247,0.02)' }}
                      contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)' }} 
                      itemStyle={{ fontSize: '12px', fontWeight: 'black', textTransform: 'uppercase', color: '#a855f7', letterSpacing: '0.1em' }}
                    />
                    <Bar 
                      dataKey="load" 
                      fill="#a855f7" 
                      radius={[12, 12, 0, 0]}
                      barSize={48}
                      className="shadow-glow-purple"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-10 rounded-[3rem] bg-purple-50/50 border border-purple-100 flex items-start gap-8 relative overflow-hidden group/insight shadow-inner">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover/insight:scale-110 transition-transform duration-1000">
                <Zap className="w-32 h-32 text-purple-600" />
              </div>
              <div className="h-14 w-14 rounded-2xl bg-white border border-purple-100 flex items-center justify-center shrink-0 shadow-sm group-hover/insight:scale-110 transition-transform duration-700">
                <Zap className="h-7 w-7 text-purple-600 animate-pulse" />
              </div>
              <div className="space-y-2 relative z-10 pt-1">
                <p className="text-lg font-black text-slate-950 italic uppercase tracking-tight leading-none">{t('staffProductivity.aiOperationalInsight' as any) || 'Personnel_Efficiency_Signal'}</p>
                <p className="text-sm text-slate-500 font-medium italic leading-relaxed tracking-tight">
                  {t('staffProductivity.peakLoadInsight' as any || 'Peak biological cycle demand detected between {range}. Recommendation: Allocate {count} additional technical nodes.').replace('{range}', '13:00 - 15:00').replace('{count}', '2')}
                </p>
              </div>
            </div>
          </div>

          {/* Performance Hierarchy interface */}
          <div className="lg:col-span-5 space-y-10">
            <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4 italic flex items-center gap-4">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
              {t('staffProductivity.topPerformer' as any) || 'Operator_Yield_Registry'}
            </h4>
            
            <div className="space-y-6">
              {staffData.map((staff, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 group/staff hover:bg-white hover:border-purple-500/20 transition-all duration-700 shadow-inner hover:shadow-premium relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-100 group-hover/staff:bg-purple-600 transition-all duration-700" />
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/staff:scale-110 transition-transform duration-700">
                        <Award className={cn("h-7 w-7", idx === 0 ? "text-amber-500" : "text-slate-300")} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xl font-black text-slate-950 italic uppercase tracking-tighter group-hover/staff:text-purple-600 transition-colors leading-none">{staff.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{staff.rating} {t('staffProductivity.excellence' as any) || 'EXCELLENCE'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{t('staffProductivity.efficiencyScore' as any) || 'YIELD_IDX'}</p>
                      <p className="text-2xl font-black text-emerald-600 italic tracking-tighter uppercase leading-none">{staff.efficiency}%</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-end px-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{t('staffProductivity.revenuePerStaff' as any) || 'INDIVIDUAL_INFLOW'}</span>
                      <span className="text-lg font-black text-slate-950 italic tracking-tighter uppercase leading-none">฿{staff.revenue.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50 p-0.5 shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }} 
                        whileInView={{ width: `${staff.efficiency}%` }} 
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-purple-500 shadow-glow-purple/20 rounded-full" 
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <Button variant="outline" size="xl" className="w-full h-18 rounded-[2.5rem] border-slate-200 bg-white text-slate-950 font-black uppercase tracking-[0.3em] text-[10px] italic shadow-sm hover:bg-slate-50 transition-all group/btn">
              Authorise_Detailed_Audit
              <ChevronRight className="ml-3 h-5 w-5 text-slate-300 group-hover/btn:translate-x-1 group-hover/btn:text-purple-600 transition-all" />
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 py-8 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
        <div className="flex items-center gap-6 text-slate-400 group/status cursor-default">
          <ShieldCheck className="h-5 w-5 group-hover:text-emerald-500 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">Personnel_Integrity_Verified: NOMINAL</p>
        </div>
        <p className="text-[10px] font-black text-purple-600/60 uppercase tracking-widest italic bg-white px-6 py-2 rounded-full shadow-sm border border-slate-100">Staff_Logic_v4.8 // Active_Sync</p>
      </CardFooter>
    </Card>
  )
}
