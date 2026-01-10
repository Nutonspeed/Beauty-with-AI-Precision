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
  const t = useTranslations()

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
    <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
      
      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <Microscope className="h-8 w-8 text-pink-400" />
            {t('neuralHealthMonitor.title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('neuralHealthMonitor.subtitle')}
          </CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-pink-600 text-white border-none px-4 py-1 text-[9px] font-black tracking-widest uppercase italic">
            {t('ui.hud.neuralEngineLive')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Accuracy Chart */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{t('ui.hud.accuracyTelemetry')}</h4>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse" />
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">{t('ui.hud.inferenceStreamingActive')}</span>
              </div>
            </div>
            
            <div className="h-[350px] w-full bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-pink-500/[0.02] to-transparent animate-neural-pulse pointer-events-none" />
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={healthData}>
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }}
                  />
                  <YAxis hide domain={[95, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke="#ec4899" 
                    strokeWidth={4} 
                    dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }} 
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Neural Metrics Column */}
          <div className="lg:col-span-4 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{t('ui.hud.modelVitalityNodes')}</h4>
            <div className="grid grid-cols-1 gap-4">
              {metrics.map((m, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all group/metric"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={cn("h-10 w-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner animate-synaptic-fire", m.color)}>
                        <m.icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">{m.label}</p>
                        <p className="text-xl font-black text-white italic tracking-tighter">{m.value}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[7px] font-black border-white/5 text-slate-600 italic">
                      {m.status}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-8 rounded-[2rem] bg-gradient-to-br from-pink-600/10 via-transparent to-transparent border border-pink-500/20 space-y-6 relative overflow-hidden">
              <Server className="absolute bottom-[-20px] right-[-20px] h-32 w-32 text-pink-500/5 rotate-12" />
              <div className="flex items-center gap-4 relative z-10">
                <ShieldCheck className="h-5 w-5 text-pink-400" />
                <h5 className="text-xs font-black text-white uppercase tracking-widest">{t('ui.hud.integrityGuard')}</h5>
              </div>
              <p className="text-[10px] text-slate-500 font-light leading-relaxed italic relative z-10">
                {t('ui.hud.integrityGuardDesc')}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-white/5 bg-white/[0.01]">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <RefreshCw className="h-4 w-4 text-slate-600 animate-spin-slow" />
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] italic">
              {t('ui.hud.autoCalibration', { val: '300' })}
            </p>
          </div>
          <p className="text-[9px] font-black text-pink-500/60 uppercase tracking-widest italic">
            {t('ui.hud.certifiedArchitecture')}
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
