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
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[120px] opacity-60" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" 
          style={{ backgroundImage: 'radial-gradient(#3b82f6 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} 
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
            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-blue-200 text-blue-700 bg-blue-50 font-bold tracking-wider text-[10px] uppercase mb-6">
              {t('home.protocol.badge')}
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 leading-tight mb-8">
              {t('home.protocol.title')}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
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
          className="mt-32 p-8 lg:p-12 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden"
        >
          {/* Glowing Background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="space-y-6 max-w-xl text-center lg:text-left">
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">Medical Intelligence Core</span>
              </div>
              <h3 className="text-3xl font-bold">High-Fidelity Neural Synthesis</h3>
              <p className="text-slate-400 leading-relaxed">
                Our protocol combines clinical expertise with proprietary AI models to deliver 
                sub-dermal insights that go beyond traditional surface-level scanning.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium">
                  <ShieldCheck className="h-4 w-4 text-blue-400" /> HIPAA Compliant
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium">
                  <Activity className="h-4 w-4 text-emerald-400" /> Real-time Telemetry
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium">
                  <Zap className="h-4 w-4 text-amber-400" /> &lt; 3ms Latency
                </div>
              </div>
            </div>

            <div className="relative h-64 w-64 flex items-center justify-center">
              {/* Animated Rings */}
              <motion.div 
                className="absolute inset-0 rounded-full border-2 border-white/5"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className="absolute inset-4 rounded-full border border-white/10"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className="absolute inset-8 rounded-full border border-blue-500/20"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="relative z-10 text-center">
                <div className="text-5xl font-black text-white">99.9<span className="text-blue-500">%</span></div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">Precision Accuracy</div>
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

      <div className="relative z-10 p-10 lg:p-12 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
        {/* Background Step Number */}
        <div className="absolute top-6 right-8 text-8xl font-black text-slate-50/50 select-none group-hover:text-blue-50 transition-colors">
          0{index + 1}
        </div>

        <div className="relative space-y-8">
          <div className={cn(
            "h-20 w-20 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110",
            index === 0 ? "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white" :
            index === 1 ? "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white" :
            "bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white"
          )}>
            <Icon className="h-10 w-10" />
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              {t(`home.protocol.${step.key}.title` as any)}
            </h3>
            <p className="text-slate-500 leading-relaxed text-sm">
              {t(`home.protocol.${step.key}.description` as any)}
            </p>
          </div>

          <div className="h-px w-full bg-slate-100" />

          <ul className="space-y-3">
            {step.details.map((detail: string, i: number) => (
              <li key={i} className="flex items-center gap-3 text-xs font-bold text-slate-400 group-hover:text-slate-600 transition-colors">
                <div className="h-1 w-1 rounded-full bg-slate-300 group-hover:bg-blue-500" />
                {detail}
              </li>
            ))}
          </ul>

          <div className="pt-4 flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0">
            Learn Protocol <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
