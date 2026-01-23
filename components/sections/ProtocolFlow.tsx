"use client"

import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { Microscope, Brain, Target, ArrowRight, Activity, Zap, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

export function ProtocolFlow() {
  const t = useTranslations()
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const steps = [
    {
      key: 'step1',
      icon: Microscope,
      color: "blue",
      details: ["468-point face mesh", "Sub-dermal scanning", "Lighting normalization"]
    },
    {
      key: 'step2',
      icon: Brain,
      color: "indigo",
      details: ["8-point metric analysis", "Deep tissue diagnostic", "Texture & pigmentation"]
    },
    {
      key: 'step3',
      icon: Target,
      color: "violet",
      details: ["AR Outcome simulation", "Treatment path synthesis", "Success rate forecast"]
    }
  ]

  return (
    <section id="protocol" ref={containerRef} className="relative py-24 lg:py-40 bg-white overflow-hidden">
      {/* Background Decorative Elements with Neon Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-[120px] opacity-40" />
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] opacity-40" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" 
          style={{ backgroundImage: 'radial-gradient(#3b82f6 0.5px, transparent 0.5px)', backgroundSize: '32px 32px' }} 
        />
      </div>

      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-20 lg:mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 font-black tracking-[0.2em] text-[10px] uppercase mb-6 animate-pulse">
              {t('home.protocol.badge')}
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 leading-tight mb-8 italic">
              {t('home.protocol.title')}
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed font-light">
              {t('home.protocol.description')}
            </p>
          </motion.div>
        </div>

        {/* The Flow Visualization */}
        <div className="relative max-w-6xl mx-auto">
          {/* Connection Lines (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent -translate-y-1/2" />
          
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-8">
            {steps.map((step, index) => (
              <StepItem 
                key={step.key} 
                step={step} 
                index={index} 
                t={t} 
                scrollYProgress={scrollYProgress}
              />
            ))}
          </div>
        </div>

        {/* Technical Specs Footer */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 p-10 lg:p-16 rounded-[3rem] bg-slate-950 text-white relative overflow-hidden shadow-premium"
        >
          {/* Glowing Background with Pink/Blue Gradient */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[120px]" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="space-y-8 max-w-xl text-center lg:text-left">
              <div className="flex items-center gap-4 justify-center lg:justify-start">
                <div className="h-2 w-2 rounded-full bg-pink-500 animate-pulse shadow-glow-pink" />
                <span className="text-pink-400 text-[10px] font-black uppercase tracking-[0.3em]">Medical Intelligence Core</span>
              </div>
              <h3 className="text-4xl font-bold italic tracking-tight">High-Fidelity Neural Synthesis</h3>
              <p className="text-slate-400 leading-relaxed font-light text-lg">
                Our protocol combines clinical expertise with proprietary AI models to deliver 
                sub-dermal insights that go beyond traditional surface-level scanning.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-4">
                {[
                  { icon: ShieldCheck, text: "HIPAA Compliant", color: "text-blue-400" },
                  { icon: Activity, text: "Real-time Telemetry", color: "text-emerald-400" },
                  { icon: Zap, text: "< 3ms Latency", color: "text-pink-400" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors">
                    <item.icon className={cn("h-4 w-4", item.color)} /> {item.text}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-72 w-72 flex items-center justify-center">
              {/* Animated Rings with Neon Colors */}
              <motion.div 
                className="absolute inset-0 rounded-full border-2 border-white/5"
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className="absolute inset-6 rounded-full border border-pink-500/20"
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className="absolute inset-12 rounded-full border border-blue-500/20 shadow-glow-blue/10"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="relative z-10 text-center">
                <div className="text-6xl font-black text-white italic tracking-tighter">99.9<span className="text-pink-500">%</span></div>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-3">Precision Accuracy</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function StepItem({ step, index, t, scrollYProgress }: any) {
  const Icon = step.icon
  
  // Create relative progress for each step based on main scroll
  const start = index * 0.2
  const end = (index + 1) * 0.2
  
  const opacity = useTransform(scrollYProgress, [start, start + 0.1, end - 0.05, end], [0.3, 1, 1, 0.3])
  const scale = useTransform(scrollYProgress, [start, start + 0.1, end - 0.05, end], [0.95, 1, 1, 0.95])
  const y = useTransform(scrollYProgress, [start, start + 0.1, end - 0.05, end], [20, 0, 0, -20])

  return (
    <motion.div 
      style={{ opacity, scale, y }}
      className="relative group"
    >
      {/* Connector Node (Desktop) */}
      <div className="hidden lg:flex absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-slate-200 border-4 border-white group-hover:bg-blue-600 group-hover:scale-150 transition-all duration-500" />
      </div>

      <div className="relative z-10 p-10 lg:p-12 rounded-[3rem] bg-white border border-slate-100 shadow-premium hover:border-pink-500/30 transition-all duration-700 hover:-translate-y-2 overflow-hidden">
        {/* Background Step Number */}
        <div className="absolute top-6 right-8 text-8xl font-black text-slate-50 select-none group-hover:text-pink-50/50 transition-colors italic">
          0{index + 1}
        </div>

        <div className="relative space-y-8">
          <div className={cn(
            "h-20 w-20 rounded-2xl flex items-center justify-center transition-all duration-700 group-hover:scale-110 shadow-sm",
            index === 0 ? "bg-pink-50 text-pink-600 group-hover:bg-gradient-to-br group-hover:from-pink-500 group-hover:to-pink-600 group-hover:text-white" :
            index === 1 ? "bg-blue-50 text-blue-600 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-blue-600 group-hover:text-white" :
            "bg-indigo-50 text-indigo-600 group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:to-indigo-600 group-hover:text-white"
          )}>
            <Icon className="h-10 w-10" />
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-slate-900 group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-blue-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500 italic">
              {t(`home.protocol.${step.key}.title` as any)}
            </h3>
            <p className="text-slate-500 leading-relaxed text-sm font-light">
              {t(`home.protocol.${step.key}.description` as any)}
            </p>
          </div>

          <div className="h-px w-full bg-slate-100" />

          <ul className="space-y-3">
            {step.details.map((detail: string, i: number) => (
              <li key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">
                <div className="h-1 w-1 rounded-full bg-slate-300 group-hover:bg-pink-500 shadow-glow-pink" />
                {detail}
              </li>
            ))}
          </ul>

          <div className="pt-4 flex items-center gap-2 text-pink-500 font-black text-[10px] uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-all duration-700 translate-x-[-10px] group-hover:translate-x-0">
            Initialize Protocol <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
