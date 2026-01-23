"use client"

import { motion } from "framer-motion"
import { Activity, Brain, Zap, ShieldCheck, RefreshCw, Server, Microscope } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import dynamic from 'next/dynamic'

// @ts-ignore
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
// @ts-ignore
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
// @ts-ignore
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
// @ts-ignore
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
// @ts-ignore
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
// @ts-ignore
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });

export function NeuralHealthMonitor() {
  const t = useTranslations('home.salesWizard')

  const healthData = [
    { time: '00:00', accuracy: 98.2, latency: 120 },
    { time: '04:00', accuracy: 98.4, latency: 115 },
    { time: '08:00', accuracy: 97.9, latency: 145 },
    { time: '12:00', accuracy: 98.5, latency: 110 },
    { time: '16:00', accuracy: 98.1, latency: 125 },
    { time: '20:00', accuracy: 98.3, latency: 118 },
  ]

  const metrics = [
    { label: t('neuralHealthMonitor.modelAccuracy'), value: '98.4%', status: 'Optimal', icon: Brain, color: 'text-pink-400' },
    { label: t('neuralHealthMonitor.inferenceLatency'), value: '118ms', status: 'Nominal', icon: Zap, color: 'text-cyan-400' },
    { label: t('neuralHealthMonitor.datasetHealth'), value: '99.9%', status: 'Synchronized', icon: ShieldCheck, color: 'text-emerald-400' },
    { label: t('neuralHealthMonitor.neuralThroughput'), value: '4.2k req/s', status: 'High', icon: Activity, color: 'text-purple-400' },
  ]

  return (
    <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/20">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
      
      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <CardTitle className="text-3xl font-black text-slate-950 tracking-tight italic flex items-center gap-5 uppercase leading-none">
            <div className="p-3 bg-pink-50 rounded-2xl shadow-sm group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
              <Microscope className="h-8 w-8 text-pink-600 group-hover:text-white" />
            </div>
            {t('neuralHealthMonitor.title')}
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">
            {t('neuralHealthMonitor.subtitle')}
          </CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-pink-50 text-pink-600 border-none px-5 py-1.5 text-[10px] font-black tracking-widest uppercase italic shadow-sm animate-pulse">
            {t('ui.hud.neuralEngineLive')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-12 bg-slate-50/30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Accuracy Chart */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">{t('ui.hud.accuracyTelemetry')}</h4>
              <div className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-pink-500 animate-pulse shadow-glow-pink" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{t('ui.hud.inferenceStreamingActive')}</span>
              </div>
            </div>
            
            <div className="h-[350px] w-full bg-white border border-slate-100 rounded-[3rem] p-8 overflow-hidden relative shadow-inner group/chart">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.01] bg-center" />
              <div className="absolute inset-0 bg-gradient-to-b from-pink-500/[0.02] to-transparent animate-neural-pulse pointer-events-none" />
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={healthData}>
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                    dy={15}
                  />
                  <YAxis hide domain={[95, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.05)' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase', color: '#ec4899' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke="#ec4899" 
                    strokeWidth={6} 
                    dot={{ fill: 'white', strokeWidth: 4, r: 6, stroke: '#ec4899' }} 
                    activeDot={{ r: 10, strokeWidth: 0, fill: '#ec4899' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Neural Metrics Column */}
          <div className="lg:col-span-4 space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">{t('ui.hud.modelVitalityNodes')}</h4>
            <div className="grid grid-cols-1 gap-6">
              {metrics.map((m, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:border-pink-500/20 transition-all duration-700 group/metric shadow-sm hover:shadow-premium"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-6">
                      <div className={cn("h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover/metric:scale-110 transition-transform duration-700", m.color.replace('400', '600').replace('text-', 'bg-').replace('600', '50'))}>
                        <m.icon className={cn("h-7 w-7", m.color.replace('400', '600'))} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none">{m.label}</p>
                        <p className="text-2xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{m.value}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-black border-none bg-slate-50 text-slate-400 italic px-4 py-1.5 rounded-full shadow-sm">
                      {m.status}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-10 rounded-[3rem] bg-gradient-to-br from-pink-50 to-white border border-pink-100 space-y-8 relative overflow-hidden group/box shadow-premium">
              <Server className="absolute bottom-[-20px] right-[-20px] h-48 w-48 text-pink-500/5 rotate-12 transition-transform duration-[2000ms] group-hover/box:rotate-90 group-hover/box:scale-110" />
              <div className="flex items-center gap-5 relative z-10">
                <div className="h-14 w-14 rounded-[1.5rem] bg-white flex items-center justify-center shadow-sm group-hover/box:scale-110 transition-all duration-500">
                  <ShieldCheck className="h-7 w-7 text-pink-600 animate-pulse" />
                </div>
                <h5 className="text-sm font-black text-slate-950 uppercase tracking-[0.4em] italic leading-none">{t('ui.hud.integrityGuard')}</h5>
              </div>
              <p className="text-[13px] text-slate-500 font-light leading-relaxed italic relative z-10 tracking-tight">
                {t('ui.hud.integrityGuardDesc')}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-slate-50 bg-white">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <RefreshCw className="h-5 w-5 text-slate-400 animate-spin-slow" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">
              {t('ui.hud.autoCalibration', { val: '300' })}
            </p>
          </div>
          <p className="text-[10px] font-black text-pink-500/60 uppercase tracking-widest italic bg-pink-50 px-6 py-2 rounded-full shadow-sm">
            {t('ui.hud.certifiedArchitecture')}
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
