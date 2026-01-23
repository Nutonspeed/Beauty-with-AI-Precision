"use client"

import React, { useRef, useEffect } from 'react'
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion'
import { useTranslations } from "next-intl"
import { 
  Brain, 
  Microscope, 
  Fingerprint, 
  Activity, 
  Zap, 
  Users,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const features = [
  { 
    icon: Brain, 
    key: 'neural',
    color: 'from-pink-500 to-purple-600',
    bgColor: 'bg-pink-50',
    accentColor: 'text-pink-600',
    border: 'border-pink-100'
  },
  { 
    icon: Microscope, 
    key: 'ar',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
    accentColor: 'text-blue-600',
    border: 'border-blue-100'
  },
  { 
    icon: Fingerprint, 
    key: 'safety',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    accentColor: 'text-emerald-600',
    border: 'border-emerald-100'
  },
  { 
    icon: Activity, 
    key: 'vitals',
    color: 'from-purple-500 to-indigo-600',
    bgColor: 'bg-purple-50',
    accentColor: 'text-purple-600',
    border: 'border-purple-100'
  },
  { 
    icon: Zap, 
    key: 'speed',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    accentColor: 'text-amber-600',
    border: 'border-amber-100'
  },
  { 
    icon: Users, 
    key: 'management',
    color: 'from-cyan-500 to-blue-600',
    bgColor: 'bg-cyan-50',
    accentColor: 'text-cyan-600',
    border: 'border-cyan-100'
  }
]

function NavigationDot({ index, total, scrollYProgress }: { index: number, total: number, scrollYProgress: MotionValue<number> }) {
  const start = index / total
  const end = (index + 1) / total
  
  const scale = useTransform(
    scrollYProgress,
    [start - 0.1, start, end, end + 0.1],
    [0.8, 1.5, 1.5, 0.8]
  )
  
  const backgroundColor = useTransform(
    scrollYProgress,
    [start - 0.1, start, end, end + 0.1],
    ['rgba(241,245,249,1)', 'rgba(236,72,153,1)', 'rgba(236,72,153,1)', 'rgba(241,245,249,1)']
  )

  const boxShadow = useTransform(
    scrollYProgress,
    [start - 0.1, start, end, end + 0.1],
    ['0 0 0 rgba(236,72,153,0)', '0 0 20px rgba(236,72,153,0.4)', '0 0 20px rgba(236,72,153,0.4)', '0 0 0 rgba(236,72,153,0)']
  )

  return (
    <motion.div
      className="w-3 h-3 rounded-full border border-slate-200"
      style={{
        scale,
        backgroundColor,
        boxShadow
      }}
    />
  )
}

export function FeaturesShowcase() {
  const t = useTranslations()
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const x = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", `-${(features.length - 1) * 100}%`]
  )
  const smoothX = useSpring(x, { damping: 30, stiffness: 100 })
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])

  return (
    <div 
      ref={containerRef} 
      className="relative bg-white"
      style={{ height: `${(features.length + 1) * 100}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
        </div>

        {/* Header interface */}
        <div className="absolute top-0 left-0 right-0 z-30 p-10 lg:p-16">
          <div className="flex items-center justify-between gap-10">
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-sm animate-pulse italic">
                  <Sparkles className="mr-3 h-3.5 w-3.5" />
                  Ecosystem_Core_Capabilities
                </Badge>
              </motion.div>
              <motion.h2 
                className="text-4xl md:text-6xl font-black text-slate-950 italic uppercase tracking-tighter leading-none"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {t('home.features.title' as any) || 'Network Capacities'}
              </motion.h2>
            </div>
            
            <div className="hidden md:flex items-center gap-10 bg-white/50 backdrop-blur-md p-6 rounded-[2rem] border border-slate-100 shadow-premium">
              <ProgressCounter scrollYProgress={scrollYProgress} total={features.length} />
              <div className="h-10 w-px bg-slate-100" />
              <div className="w-40 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner p-0.5">
                <motion.div 
                  className="h-full bg-gradient-to-r from-pink-500 to-blue-600 rounded-full shadow-glow-pink/50"
                  style={{ width: progressWidth }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Scroll interface */}
        <motion.div 
          className="absolute inset-0 flex pt-48 lg:pt-64"
          style={{ x: smoothX }}
        >
          {features.map((feature, index) => (
            <FeatureSlide 
              key={feature.key}
              feature={feature}
              index={index}
              total={features.length}
              scrollYProgress={scrollYProgress}
              t={t}
            />
          ))}
        </motion.div>

        {/* Navigation Dots interface */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-6 z-30 bg-white/50 backdrop-blur-md px-10 py-5 rounded-full border border-slate-100 shadow-premium">
          {features.map((_, i) => (
            <NavigationDot key={i} index={i} total={features.length} scrollYProgress={scrollYProgress} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ProgressCounter({ scrollYProgress, total }: { scrollYProgress: MotionValue<number>, total: number }) {
  const count = useTransform(scrollYProgress, [0, 1], [1, total])
  const [displayCount, setDisplayCount] = React.useState("01")

  useEffect(() => {
    return count.on("change", (latest) => {
      setDisplayCount(Math.round(latest).toString().padStart(2, '0'))
    })
  }, [count])

  return (
    <div className="flex items-baseline gap-3">
      <span className="text-4xl font-black text-slate-950 italic tracking-tighter leading-none">
        {displayCount}
      </span>
      <span className="text-xs font-black text-slate-300 uppercase tracking-widest italic">/ {total.toString().padStart(2, '0')}</span>
    </div>
  )
}

function FeatureSlide({ 
  feature, 
  index, 
  total,
  scrollYProgress,
  t 
}: { 
  feature: typeof features[0]
  index: number
  total: number
  scrollYProgress: MotionValue<number>
  t: any
}) {
  const start = index / total
  const end = (index + 1) / total
  const mid = start + (end - start) / 2

  const opacity = useTransform(
    scrollYProgress,
    [start, start + 0.05, end - 0.05, end],
    [0, 1, 1, 0]
  )

  const scale = useTransform(
    scrollYProgress,
    [start, mid, end],
    [0.9, 1, 0.9]
  )

  const rotateY = useTransform(
    scrollYProgress,
    [start, mid, end],
    [15, 0, -15]
  )

  return (
    <div className="w-screen h-full flex-shrink-0 flex items-center justify-center px-10 lg:px-20 relative">
      <motion.div 
        className="relative max-w-6xl w-full"
        style={{ opacity, scale }}
      >
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Visual Node port interface */}
          <motion.div 
            className="relative"
            style={{ rotateY, transformStyle: 'preserve-3d' }}
          >
            <div className={cn(
              "absolute -inset-10 rounded-full blur-[100px] opacity-20",
              `bg-gradient-to-br ${feature.color}`
            )} />
            
            <div className="relative aspect-square max-w-lg mx-auto flex items-center justify-center">
              <motion.div 
                className="absolute inset-4 rounded-full border-2 border-slate-100 border-dashed opacity-40"
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className="absolute inset-16 rounded-full border border-slate-50 opacity-60"
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              />
              
              <div className={cn(
                "relative w-48 h-48 rounded-[3rem] flex items-center justify-center",
                "bg-white shadow-premium border transition-all duration-700",
                feature.border
              )}>
                <feature.icon className={cn("w-20 h-20", feature.accentColor)} />
                <div className={cn(
                  "absolute -inset-4 rounded-[3.5rem] blur-2xl opacity-20 animate-pulse",
                  `bg-gradient-to-br ${feature.color}`
                )} />
              </div>

              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className={cn("absolute w-2 h-2 rounded-full", feature.accentColor.replace('text', 'bg'), "opacity-20 shadow-lg")}
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                  }}
                  animate={{
                    y: [0, -40, 0],
                    x: [0, (Math.random() - 0.5) * 40, 0],
                    opacity: [0.1, 0.5, 0.1],
                    scale: [1, 2, 1]
                  }}
                  transition={{
                    duration: 4 + Math.random() * 3,
                    repeat: Infinity,
                    delay: i * 0.4
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Content interface */}
          <div className="space-y-10 text-center lg:text-left">
            <div className="space-y-6">
              <Badge className={cn(
                "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border-none shadow-sm italic leading-none",
                feature.bgColor,
                feature.accentColor
              )}>
                NODE_PROTOCOL_{(index + 1).toString().padStart(2, '0')}
              </Badge>
              <h3 className="text-5xl md:text-7xl font-black text-slate-950 italic uppercase tracking-tighter leading-tight">
                {t(`home.features.${feature.key}.title` as any)}
              </h3>
              <p className="text-xl text-slate-500 font-light leading-relaxed italic">
                {t(`home.features.${feature.key}.description` as any)}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-100">
              {[
                { value: '99.9%', label: 'NOMINAL', icon: ShieldCheck },
                { value: '0.003s', label: 'LATENCY', icon: Zap },
                { value: 'SYNCED', label: 'STATE', icon: Activity }
              ].map((stat, i) => (
                <div key={i} className="space-y-2 group/stat">
                  <div className={cn("text-2xl font-black italic tracking-tighter uppercase leading-none group-hover/stat:text-pink-600 transition-colors", feature.accentColor)}>
                    {stat.value}
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <stat.icon className="w-3 h-3 text-slate-300" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="ghost" className="h-auto p-0 text-[11px] font-black uppercase tracking-[0.4em] text-pink-600 hover:bg-transparent hover:translate-x-3 transition-all italic group/btn">
              Explore Documentation Sequence <ChevronRight className="ml-3 h-4 w-4 group-hover/btn:translate-x-2 transition-transform" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
