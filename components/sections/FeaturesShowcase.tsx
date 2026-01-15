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
  Users
} from 'lucide-react'
import { cn } from '@/lib/utils'

const features = [
  { 
    icon: Brain, 
    key: 'neural',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-500/10',
    accentColor: 'text-blue-500'
  },
  { 
    icon: Microscope, 
    key: 'ar',
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-500/10',
    accentColor: 'text-purple-500'
  },
  { 
    icon: Fingerprint, 
    key: 'safety',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-500/10',
    accentColor: 'text-emerald-500'
  },
  { 
    icon: Activity, 
    key: 'vitals',
    color: 'from-orange-500 to-red-600',
    bgColor: 'bg-orange-500/10',
    accentColor: 'text-orange-500'
  },
  { 
    icon: Zap, 
    key: 'speed',
    color: 'from-yellow-500 to-orange-600',
    bgColor: 'bg-yellow-500/10',
    accentColor: 'text-yellow-500'
  },
  { 
    icon: Users, 
    key: 'management',
    color: 'from-cyan-500 to-blue-600',
    bgColor: 'bg-cyan-500/10',
    accentColor: 'text-cyan-500'
  }
]

function NavigationDot({ index, total, scrollYProgress }: { index: number, total: number, scrollYProgress: MotionValue<number> }) {
  const scale = useTransform(
    scrollYProgress,
    [(index - 0.5) / total, index / total, (index + 0.5) / total],
    [0.8, 1.5, 0.8]
  )
  
  const backgroundColor = useTransform(
    scrollYProgress,
    [(index - 0.5) / total, index / total, (index + 0.5) / total],
    ['rgba(255,255,255,0.3)', 'rgba(59,130,246,1)', 'rgba(255,255,255,0.3)']
  )

  return (
    <motion.div
      className="w-2 h-2 rounded-full"
      style={{
        scale,
        backgroundColor
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

  // Horizontal scroll transform
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", `-${(features.length - 1) * 100}%`]
  )
  const smoothX = useSpring(x, { damping: 30, stiffness: 100 })

  // Progress indicator
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])

  return (
    <div 
      ref={containerRef} 
      className="relative bg-slate-950"
      style={{ height: `${(features.length + 1) * 100}vh` }}
    >
      {/* Sticky Container */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
          
          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px'
            }}
          />
          
          {/* Gradient orbs */}
          <BackgroundOrbs scrollYProgress={scrollYProgress} />
        </div>

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 p-8 lg:p-12">
          <div className="flex items-center justify-between">
            <div>
              <motion.span 
                className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-[0.2em] text-blue-400 uppercase mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Core Capabilities
              </motion.span>
              <motion.h2 
                className="text-3xl md:text-5xl font-bold text-white"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {t('home.features.title')}
              </motion.h2>
            </div>
            
            {/* Progress Counter */}
            <div className="hidden md:flex items-center gap-4">
              <ProgressCounter scrollYProgress={scrollYProgress} total={features.length} />
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              style={{ width: progressWidth }}
            />
          </div>
        </div>

        {/* Horizontal Scroll Content */}
        <motion.div 
          className="absolute inset-0 flex pt-40"
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

        {/* Navigation Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
          {features.map((_, i) => (
            <NavigationDot key={i} index={i} total={features.length} scrollYProgress={scrollYProgress} />
          ))}
        </div>
      </div>
    </div>
  )
}

function BackgroundOrbs({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const x1 = useTransform(scrollYProgress, [0, 1], ['-20%', '30%'])
  const y1 = useTransform(scrollYProgress, [0, 1], ['-20%', '20%'])
  const x2 = useTransform(scrollYProgress, [0, 1], ['20%', '-30%'])
  const y2 = useTransform(scrollYProgress, [0, 1], ['20%', '-20%'])

  return (
    <>
      <motion.div 
        className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full blur-[200px]"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
          x: x1,
          y: y1
        }}
      />
      <motion.div 
        className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-[150px]"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
          x: x2,
          y: y2
        }}
      />
    </>
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
    <span className="text-white/50 text-sm font-mono">
      <span className="text-white text-2xl font-bold">
        {displayCount}
      </span>
      <span className="mx-2">/</span>
      {total.toString().padStart(2, '0')}
    </span>
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
  scrollYProgress: any
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

  const y = useTransform(
    scrollYProgress,
    [start, mid, end],
    [100, 0, -100]
  )

  const scale = useTransform(
    scrollYProgress,
    [start, mid, end],
    [0.8, 1, 0.8]
  )

  const rotateY = useTransform(
    scrollYProgress,
    [start, mid, end],
    [15, 0, -15]
  )

  return (
    <div className="w-screen h-full flex-shrink-0 flex items-center justify-center px-8 lg:px-20">
      <motion.div 
        className="relative max-w-5xl w-full"
        style={{ opacity, y, scale }}
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Icon & Visual */}
          <motion.div 
            className="relative"
            style={{ rotateY, transformStyle: 'preserve-3d' }}
          >
            {/* Large gradient background */}
            <div className={cn(
              "absolute inset-0 rounded-[3rem] blur-3xl opacity-30",
              `bg-gradient-to-br ${feature.color}`
            )} />
            
            {/* Icon container */}
            <div className="relative aspect-square max-w-md mx-auto flex items-center justify-center">
              {/* Outer ring */}
              <motion.div 
                className="absolute inset-8 rounded-full border border-white/10"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Middle ring */}
              <motion.div 
                className="absolute inset-16 rounded-full border border-white/5"
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Center icon */}
              <div className={cn(
                "relative w-32 h-32 rounded-3xl flex items-center justify-center",
                "bg-gradient-to-br shadow-2xl",
                feature.color
              )}>
                <feature.icon className="w-16 h-16 text-white" />
                
                {/* Glow effect */}
                <div className={cn(
                  "absolute inset-0 rounded-3xl blur-xl opacity-50",
                  `bg-gradient-to-br ${feature.color}`
                )} />
              </div>

              {/* Floating particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-white/30"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 0.8, 0.3],
                    scale: [1, 1.5, 1]
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: i * 0.5
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Right: Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div>
              <span className={cn(
                "inline-block px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-4",
                feature.bgColor,
                feature.accentColor
              )}>
                Feature {(index + 1).toString().padStart(2, '0')}
              </span>
              <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {t(`home.features.${feature.key}.title` as any)}
              </h3>
              <p className="text-lg text-white/60 leading-relaxed">
                {t(`home.features.${feature.key}.description` as any)}
              </p>
            </div>

            {/* Stats or highlights */}
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
              {[
                { value: '99.9%', label: 'Accuracy' },
                { value: '<1s', label: 'Response' },
                { value: '24/7', label: 'Available' }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className={cn("text-2xl font-bold", feature.accentColor)}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-white/40 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
