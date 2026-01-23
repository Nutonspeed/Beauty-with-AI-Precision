"use client"

import { motion } from 'framer-motion'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Activity, Clock, LayoutGrid, Award, Zap, TrendingUp } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"
import { cn } from "@/lib/utils"

export default function AnalysisDemoPage() {
  const t = useTranslations()
  const locale = useLocale()
  
  const concerns = [
    { type: 'ริ้วรอย', severity: 65, color: 'text-amber-600', bg: 'bg-amber-50' },
    { type: 'รอยดำ', severity: 45, color: 'text-blue-600', bg: 'bg-blue-50' },
    { type: 'รูขุมขน', severity: 70, color: 'text-pink-600', bg: 'bg-pink-50' },
    { type: 'รอยแดง', severity: 30, color: 'text-rose-600', bg: 'bg-rose-50' },
    { type: 'สิว', severity: 25, color: 'text-purple-600', bg: 'bg-purple-50' },
    { type: 'รอยคล้ำใต้ตา', severity: 55, color: 'text-indigo-600', bg: 'bg-indigo-50' }
  ]

  const metrics = [
    { label: 'อายุผิว', val: '32', sub: 'YRS', icon: Clock, color: 'text-pink-600' },
    { label: 'ความชุ่มชื้น', val: '65%', sub: 'NOMINAL', icon: Activity, color: 'text-blue-600' },
    { label: 'ความยืดหยุ่น', val: '70%', sub: 'OPTIMAL', icon: TrendingUp, color: 'text-emerald-600' },
    { label: 'พื้นผิว', val: '60%', sub: 'REFINING', icon: LayoutGrid, color: 'text-purple-600' }
  ]

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950 selection:bg-pink-500/10">
      <Header />

      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 max-w-6xl mx-auto flex-1 space-y-16">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-slate-100">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
                <Sparkles className="mr-3 h-3.5 w-3.5" />
                Demonstration Sequence Node
              </Badge>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase">
                Analysis<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em] font-black uppercase">Simulator</span>
              </h1>
              <div className="space-y-2">
                <p className="text-xl text-slate-500 font-light max-w-2xl italic leading-relaxed tracking-tight">
                  Visualizing potential results and diagnostic telemetry using simulated data nodes.
                </p>
                <p className="text-sm text-slate-400 font-black uppercase tracking-widest italic">ผลการวิเคราะห์ผิวหน้า (ตัวอย่างสาธิต)</p>
              </div>
            </motion.div>
          </div>

          <div className="grid gap-12">
            {/* Overall Score Node */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/10">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                <CardHeader className="p-12 lg:p-16 pb-8 border-b border-slate-50 text-center space-y-8">
                  <div className="flex items-center justify-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm animate-pulse">
                      <Award className="w-10 h-10" />
                    </div>
                    <h2 className="text-4xl font-black text-emerald-600 italic uppercase tracking-tighter leading-none">Sequence Synchronized</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-pink-500/10 blur-3xl rounded-full" />
                      <div className="relative text-8xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">
                        75<span className="text-3xl font-bold opacity-20 ml-2">/100</span>
                      </div>
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">คะแนนสุขภาพผิวโดยรวม (ยอดเยี่ยม)</p>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {metrics.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                >
                  <Card className="border-slate-100 bg-white shadow-premium rounded-[2.5rem] transition-all duration-700 hover:border-pink-500/20 group relative overflow-hidden h-full">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                    <CardContent className="p-10 text-center space-y-6">
                      <div className="mx-auto h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-700">
                        <m.icon className={cn("h-8 w-8", m.color)} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover:text-slate-900 transition-colors">{m.label}</p>
                        <div className="text-4xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">
                          {m.val} <span className="text-sm font-bold opacity-20">{m.sub}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Pathological Mapping */}
            <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden group transition-all duration-700 hover:border-pink-500/10">
              <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50">
                <CardTitle className="text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-6 text-pink-600 italic">
                  <TrendingUp className="w-6 h-6" />
                  Simulated Pathological Mapping
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 lg:p-12 space-y-8 bg-slate-50/30">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {concerns.map((concern, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="flex items-center justify-between p-8 rounded-[2.5rem] bg-white border border-slate-100 hover:border-pink-500/20 transition-all duration-700 shadow-sm group/item relative overflow-hidden">
                      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-slate-50 group-hover/item:bg-pink-600 transition-all duration-700" />
                      <div className="space-y-2 relative z-10">
                        <h4 className="font-black text-slate-950 text-xl italic uppercase group-hover/item:text-pink-600 transition-colors leading-none">{concern.type}</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Severity Index</p>
                      </div>
                      <div className="text-right space-y-2 relative z-10">
                        <div className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{concern.severity}%</div>
                        <div className="h-1 w-16 bg-slate-50 rounded-full overflow-hidden shadow-inner border border-slate-100 p-0.5 ml-auto">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${concern.severity}%` }} className="h-full bg-pink-500 rounded-full" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="border-none bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden group/cta">
                <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                  <Zap className="w-48 h-48 text-white" />
                </div>
                <CardContent className="p-0 flex flex-col md:flex-row items-center gap-12 relative z-10">
                  <div className="flex-1 space-y-6 text-center md:text-left">
                    <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-tight">Initialize Real-Time Diagnostic Sequence</h3>
                    <p className="text-xl text-white/80 font-light italic leading-relaxed">
                      Sync your actual biological telemetry for precision aesthetic results and personalized program roadmap.
                    </p>
                  </div>
                  <Button size="xl" className="h-20 px-12 rounded-[2rem] bg-white text-slate-950 hover:bg-slate-50 font-black uppercase tracking-[0.3em] text-[11px] italic shadow-2xl transition-all hover:scale-105 active:scale-95 border-none" asChild>
                    <Link href={lp('/analysis')}>Start Initial Scan</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
