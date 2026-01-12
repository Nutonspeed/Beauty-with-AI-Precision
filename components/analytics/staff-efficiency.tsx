"use client"

import { Users, Zap, Clock, Star, Award, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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

interface StaffEfficiencyProps {
  isEnterprise: boolean
}

export function StaffEfficiency({ isEnterprise }: StaffEfficiencyProps) {
  const t = useTranslations()

  const staffData = [
    { name: 'Specialist Sarah', revenue: 450000, efficiency: 94, sessions: 120, rating: 4.9 },
    { name: 'Assistant Joy', revenue: 280000, efficiency: 88, sessions: 145, rating: 4.8 },
    { name: 'Specialist Mike', revenue: 520000, efficiency: 91, sessions: 98, rating: 4.7 },
    { name: 'Therapist Ann', revenue: 150000, efficiency: 82, sessions: 160, rating: 4.6 },
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
      "border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group",
      !isEnterprise && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
      
      {!isEnterprise && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#020617]/60 backdrop-blur-sm p-10 text-center">
          <div className="h-20 w-20 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 shadow-2xl">
            <ShieldCheck className="h-10 w-10 text-purple-500" />
          </div>
          <h3 className="text-2xl font-bold text-white italic mb-4">{t('staffProductivity.title')}</h3>
          <p className="text-slate-400 max-w-sm font-light mb-8">
            {t('staffProductivity.subtitle')}
          </p>
          <div className="px-6 py-2 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest border border-purple-500/30 mb-8">
            {t('staffProductivity.enterpriseCoreModule')}
          </div>
        </div>
      )}

      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-row items-center justify-between">
        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <Users className="h-8 w-8 text-purple-400" />
            {t('staffProductivity.title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('staffProductivity.subtitle')}
          </CardDescription>
        </div>
        {isEnterprise && (
          <Badge className="bg-purple-600 text-white border-none px-4 py-1 text-[9px] font-black tracking-widest uppercase italic">
            {t('staffProductivity.aiProductivitySynced')}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Predictive Staffing Node */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black uppercase tracking-widest text-white italic flex items-center gap-3">
                <Clock className="h-4 w-4 text-purple-500" />
                {t('staffProductivity.predictiveStaffing')}
              </h4>
              <Badge variant="outline" className="text-[8px] border-white/5 text-slate-500">REALTIME_LOAD_CALCULATION</Badge>
            </div>
            
            <div className="h-[300px] w-full bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={forecastLoad}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} axisLine={false} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '24px' }}
                  />
                  <Bar 
                    dataKey="load" 
                    fill="#a855f7" 
                    radius={[12, 12, 0, 0]} 
                    name={t('staffProductivity.forecastLabel')} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-6 bg-purple-500/5 border border-purple-500/10 rounded-3xl flex items-start gap-6">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shrink-0">
                <Zap className="h-5 w-5 text-purple-500" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-white italic">{t('staffProductivity.aiOperationalInsight')}</p>
                <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                  {t('staffProductivity.peakLoadInsight', { range: '13:00 - 15:00', count: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Performance Hierarchy */}
          <div className="lg:col-span-5 space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{t('staffProductivity.topPerformer')}</h4>
            
            <div className="space-y-6">
              {staffData.map((staff, idx) => (
                <div key={idx} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl group/staff hover:bg-white/[0.04] transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                        <Award className={cn("h-5 w-5", idx === 0 ? "text-amber-400" : "text-slate-500")} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white italic">{staff.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Star className="h-2 w-2 text-amber-500 fill-amber-500" />
                          <span className="text-[9px] font-black text-slate-500">{staff.rating} {t('staffProductivity.excellence')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{t('staffProductivity.efficiencyScore')}</p>
                      <p className="text-sm font-black text-emerald-400 italic">{staff.efficiency}%</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                      <span>{t('staffProductivity.revenuePerStaff')}</span>
                      <span className="text-white italic">฿{staff.revenue.toLocaleString()}</span>
                    </div>
                    <Progress value={staff.efficiency} className="h-1 bg-white/5" indicatorClassName="bg-purple-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
