"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  ArrowRight, 
  Sparkles, 
  Camera, 
  BrainCircuit, 
  Star,
  ChevronRight
} from "lucide-react"
import { useTranslations, useLocale } from "next-intl"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { cn } from "@/lib/utils"
import { Header } from "@/components/header"

export default function BeautyLandingPage() {
  const t = useTranslations('beauty-landing')
  const locale = useLocale()
  const lp = useLocalizePath()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const avatarGradients = [
    'bg-gradient-to-br from-pink-400 to-purple-500',
    'bg-gradient-to-br from-blue-400 to-cyan-500',
    'bg-gradient-to-br from-purple-400 to-indigo-500',
    'bg-gradient-to-br from-emerald-400 to-teal-500',
    'bg-gradient-to-br from-orange-400 to-rose-500',
  ]

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950 selection:bg-pink-500/10 overflow-hidden">
      <Header />

      <main className="flex-1 relative">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
        </div>

        {/* Cinematic Hero Section */}
        <section className="relative pt-24 pb-32 lg:pt-40 lg:pb-48">
          <div className="container relative z-10 mx-auto px-6 max-w-7xl">
            <div className="max-w-5xl mx-auto text-center space-y-12">
              {/* Premium Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
                  <Star className="mr-3 h-3.5 w-3.5 fill-pink-600" />
                  {isThaiLocale ? 'อันดับ 1 ระบบวิเคราะห์ผิวด้วย AI' : 'Elite AI Aesthetic Protocol'}
                </Badge>
              </motion.div>

              {/* Main Headline */}
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="text-6xl md:text-9xl font-black tracking-tighter text-slate-950 leading-[0.85] italic uppercase"
              >
                <span className="block mb-4">{isThaiLocale ? 'เปิดโลก' : 'Evolve'}</span>
                <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic">
                  {isThaiLocale ? 'ความงามด้วย AI' : 'Beauty Intelligence'}
                </span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 1 }}
                className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto leading-relaxed tracking-tight italic font-light"
              >
                {isThaiLocale 
                  ? 'วิเคราะห์ผิวหน้า 8 ตัวชี้วัด พร้อม AR แสดงผลการรักษา เพิ่มยอดขายศูนย์ความงามของคุณได้ถึง 65%' 
                  : '8-Point biological mapping with real-time AR outcome synthesis. Orchestrate a 65% yield increase for your aesthetic node.'}
              </motion.p>

              {/* Action Sequence Trigger */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-6"
              >
                <Button 
                  size="xl" 
                  className="h-20 px-14 rounded-[2.5rem] shadow-2xl shadow-pink-500/20 text-[11px] font-black uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic group"
                  asChild
                >
                  <Link href={lp("/analysis")}>
                    <Camera className="mr-4 h-6 w-6" />
                    {isThaiLocale ? 'ทดลองวิเคราะห์ฟรี' : 'Initialize Analysis'}
                    <ArrowRight className="ml-4 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </Button>
                <Button 
                  size="xl" 
                  variant="outline"
                  className="h-20 px-14 rounded-[2.5rem] border-slate-200 bg-white/50 text-slate-950 backdrop-blur-md hover:bg-slate-50 hover:border-pink-500/30 text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 shadow-premium italic"
                  asChild
                >
                  <Link href={lp("/case-studies")}>
                    {isThaiLocale ? 'ดูตัวอย่างผลงาน' : 'Inspect Chronology'}
                  </Link>
                </Button>
              </motion.div>

              {/* Trust Telemetry interface */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="flex flex-wrap items-center justify-center gap-12 pt-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400"
              >
                <div className="flex items-center gap-4 group">
                  <div className="flex -space-x-3">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div 
                        key={i} 
                        className={cn("w-10 h-10 rounded-full border-4 border-white shadow-premium transition-transform group-hover:translate-x-1", avatarGradients[i])}
                      />
                    ))}
                  </div>
                  <span className="italic group-hover:text-pink-600 transition-colors">{isThaiLocale ? '89+ ศูนย์ความงามใช้งาน' : '89+ Nodes Operational'}</span>
                </div>
                <div className="flex items-center gap-4 group">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400 group-hover:scale-125 transition-transform" />
                  <span className="italic group-hover:text-amber-600 transition-colors"><span className="text-slate-900">4.8/5</span> User Consensus</span>
                </div>
                <div className="flex items-center gap-4 group">
                  <BrainCircuit className="w-5 h-5 text-blue-500 group-hover:rotate-12 transition-transform" />
                  <span className="italic group-hover:text-blue-600 transition-colors">Accuracy <span className="text-slate-900">95.3%</span></span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Feature Matrix - Precision Cards */}
        <section className="relative z-10 container mx-auto px-6 pb-48">
          <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {[
              { 
                icon: Camera, 
                title: isThaiLocale ? 'วิเคราะห์ผิว AI' : 'Neural Mapping', 
                desc: isThaiLocale ? 'ถ่ายภาพแค่ 3 วินาที รับผลวิเคราะห์ 8 ตัวชี้วัดทันที' : '3-Second multi-angle scan delivering 8-Point precision telemetry.',
                color: 'from-pink-500 to-purple-600'
              },
              { 
                icon: BrainCircuit, 
                title: isThaiLocale ? 'AR แสดงผล' : 'AR Synthesis', 
                desc: isThaiLocale ? 'เห็นผลก่อน-หลังการรักษาแบบ Real-time บนใบหน้า' : 'Real-time biological transformation preview on digital twin.',
                color: 'from-blue-500 to-cyan-600'
              },
              { 
                icon: TrendingUp, 
                title: isThaiLocale ? 'เพิ่มยอดขาย 65%' : 'Yield Optimization', 
                desc: isThaiLocale ? 'ลูกค้าตัดสินใจเร็วขึ้นเมื่อเห็นภาพผลลัพธ์ชัดเจน' : 'Accelerate conversion sequence with quantitative proof nodes.',
                color: 'from-emerald-500 to-teal-600'
              }
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 0.2 }}
              >
                <Card className="group border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden transition-all duration-700 hover:border-pink-500/20 h-full">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-12 space-y-10 flex flex-col h-full bg-slate-50/30 group-hover:bg-white transition-all duration-700">
                    <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center bg-gradient-to-br text-white shadow-lg transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3", f.color)}>
                      <f.icon className="w-8 h-8" />
                    </div>
                    <div className="space-y-4 flex-grow">
                      <h3 className="text-2xl font-black italic text-slate-950 uppercase group-hover:text-pink-600 transition-colors leading-none">{f.title}</h3>
                      <p className="text-lg text-slate-500 font-light leading-relaxed italic">
                        {f.desc}
                      </p>
                    </div>
                    <div className="pt-6 border-t border-slate-100 flex justify-between items-center group/btn">
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-pink-600 transition-colors">Initialize Module</span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-2 transition-transform group-hover:text-pink-600" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Aesthetic Footer interface */}
      <footer className="relative z-10 border-t border-slate-100 bg-white py-12">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">
            <div className="flex items-center gap-4">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span>© 2025 BeautyAI Sequence // Beta_Protocol</span>
            </div>
            <div className="flex gap-10">
              <Link href={lp("/privacy")} className="hover:text-pink-600 transition-colors">Privacy_Node</Link>
              <Link href={lp("/terms")} className="hover:text-pink-600 transition-colors">Protocol_Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

const isThaiLocale = true // Temporarily hardcoded for this demo component as we use locale hook
