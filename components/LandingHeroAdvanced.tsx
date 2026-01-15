"use client"

import React, { useRef, useEffect } from 'react'
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'
import { useTranslations } from "next-intl"
import { ArrowRight, CheckCircle2, Sparkles, Zap, Shield } from 'lucide-react'
import { MagneticButton } from "@/components/ui/magnetic-button"
import { cn } from '@/lib/utils'

interface LandingHeroAdvancedProps {
  onPrimary?: () => void
  onSecondary?: () => void
}

export function LandingHeroAdvanced({ onPrimary, onSecondary }: LandingHeroAdvancedProps) {
  const t = useTranslations()
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Mouse parallax
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springConfig = { damping: 25, stiffness: 150 }
  const mouseXSpring = useSpring(mouseX, springConfig)
  const mouseYSpring = useSpring(mouseY, springConfig)

  // Scroll-driven animations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  // Transform values based on scroll
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9])
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -100])
  const titleY = useTransform(scrollYProgress, [0, 0.3], [0, -50])
  const subtitleY = useTransform(scrollYProgress, [0, 0.3], [0, -30])
  const ctaY = useTransform(scrollYProgress, [0, 0.3], [0, -20])
  
  // Parallax layers
  const layer1Y = useTransform(scrollYProgress, [0, 1], [0, -150])
  const layer2Y = useTransform(scrollYProgress, [0, 1], [0, -300])
  const layer3Y = useTransform(scrollYProgress, [0, 1], [0, -450])
  const gridScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.5])
  const gridOpacity = useTransform(scrollYProgress, [0, 0.3], [0.03, 0])

  // Grid parallax with mouse
  const gridX = useTransform(mouseXSpring, [-500, 500], ["-30px", "30px"])
  const gridY = useTransform(mouseYSpring, [-500, 500], ["-30px", "30px"])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2)
      mouseY.set(e.clientY - window.innerHeight / 2)
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseX, mouseY])

  // Floating elements data
  const floatingElements = [
    { icon: Sparkles, delay: 0, x: '10%', y: '20%', size: 'w-12 h-12' },
    { icon: Zap, delay: 0.5, x: '85%', y: '15%', size: 'w-10 h-10' },
    { icon: Shield, delay: 1, x: '15%', y: '75%', size: 'w-8 h-8' },
    { icon: Sparkles, delay: 1.5, x: '80%', y: '70%', size: 'w-14 h-14' },
  ]

  return (
    <div 
      ref={containerRef} 
      className="relative min-h-[200vh]" // Extended height for scroll space
    >
      {/* Sticky Hero Container */}
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div 
          className="relative h-full flex flex-col items-center justify-center bg-white"
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        >
          {/* === LAYER 1: Deep Background Grid with Parallax === */}
          <motion.div 
            className="absolute inset-[-200px] pointer-events-none" 
            style={{ 
              backgroundImage: `
                linear-gradient(rgba(37, 99, 235, 0.4) 1px, transparent 1px),
                linear-gradient(90deg, rgba(37, 99, 235, 0.4) 1px, transparent 1px)
              `, 
              backgroundSize: '80px 80px',
              x: gridX,
              y: gridY,
              scale: gridScale,
              opacity: gridOpacity
            }} 
          />

          {/* === LAYER 2: Gradient Orbs with Scroll Parallax === */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Primary Orb - Top Left */}
            <motion.div 
              className="absolute top-[10%] left-[5%] w-[500px] h-[500px]"
              style={{ y: layer1Y }}
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.15, 0.25, 0.15]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-full bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500 rounded-full blur-[120px]"
              />
            </motion.div>

            {/* Secondary Orb - Bottom Right */}
            <motion.div 
              className="absolute bottom-[5%] right-[5%] w-[600px] h-[600px]"
              style={{ y: layer2Y }}
            >
              <motion.div
                animate={{ 
                  scale: [1.2, 1, 1.2],
                  opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="w-full h-full bg-gradient-to-tl from-indigo-400 via-purple-400 to-blue-400 rounded-full blur-[150px]"
              />
            </motion.div>

            {/* Accent Orb - Center */}
            <motion.div 
              className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[300px] h-[300px]"
              style={{ y: layer3Y }}
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.05, 0.15, 0.05]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="w-full h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-[100px]"
              />
            </motion.div>
          </div>

          {/* === LAYER 3: Floating Decorative Elements === */}
          <div className="absolute inset-0 pointer-events-none">
            {floatingElements.map((el, i) => (
              <motion.div
                key={i}
                className={cn(
                  "absolute rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl shadow-blue-500/10 flex items-center justify-center",
                  el.size
                )}
                style={{ left: el.x, top: el.y }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  y: [0, -15, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  opacity: { delay: el.delay, duration: 0.5 },
                  scale: { delay: el.delay, duration: 0.5 },
                  y: { delay: el.delay + 0.5, duration: 4, repeat: Infinity, ease: "easeInOut" },
                  rotate: { delay: el.delay + 0.5, duration: 6, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <el.icon className="w-1/2 h-1/2 text-blue-500" />
              </motion.div>
            ))}
          </div>

          {/* === LAYER 4: Main Content === */}
          <div className="relative z-10 container max-w-6xl px-6 text-center">
            {/* Badge */}
            <motion.div
              style={{ y: titleY }}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <span className="inline-flex items-center gap-3 rounded-full border border-blue-200/50 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-2 shadow-lg shadow-blue-500/10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <span className="text-[11px] font-bold tracking-[0.2em] text-blue-700 uppercase">
                  {t('home.hero.badge')}
                </span>
              </span>
            </motion.div>

            {/* Main Title with Staggered Animation */}
            <motion.div style={{ y: titleY }}>
              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="font-display font-bold tracking-tight text-[clamp(2.5rem,8vw,5.5rem)] leading-[1.05] text-slate-900"
              >
                <motion.span 
                  className="inline-block"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {t('home.hero.title')}
                </motion.span>
                <motion.span 
                  className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  {t('home.hero.subtitle')}
                </motion.span>
              </motion.h1>
            </motion.div>

            {/* Description */}
            <motion.p
              style={{ y: subtitleY }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 max-w-2xl mx-auto text-lg md:text-xl text-slate-500 font-normal leading-relaxed"
            >
              {t('home.hero.description')}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              style={{ y: ctaY }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <MagneticButton strength={0.15}>
                <button 
                  onClick={onPrimary}
                  className="group relative h-16 w-full sm:w-auto px-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm uppercase tracking-wider transition-all hover:shadow-2xl hover:shadow-blue-500/30 active:scale-95 flex items-center justify-center gap-3 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {t('home.hero.cta')}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  />
                </button>
              </MagneticButton>

              <MagneticButton strength={0.1}>
                <button 
                  onClick={onSecondary}
                  className="h-16 w-full sm:w-auto px-12 rounded-2xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm text-slate-600 font-bold text-sm uppercase tracking-wider transition-all hover:bg-slate-50 hover:border-slate-300 hover:shadow-xl shadow-sm"
                >
                  {t('home.hero.learnMore')}
                </button>
              </MagneticButton>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="mt-16 flex flex-wrap justify-center items-center gap-x-10 gap-y-4"
            >
              {[
                { text: t('home.hero.noCreditCard'), icon: CheckCircle2 },
                { text: t('home.hero.freeTierAvailable'), icon: CheckCircle2 },
              ].map((item, i) => (
                <motion.span 
                  key={i}
                  className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-slate-400 uppercase"
                  whileHover={{ scale: 1.05, color: '#3b82f6' }}
                >
                  <item.icon className="h-4 w-4 text-blue-500/50" />
                  {item.text}
                </motion.span>
              ))}
            </motion.div>
          </div>

          {/* === LAYER 5: Scroll Indicator === */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
          >
            <span className="text-[10px] font-bold tracking-[0.25em] text-slate-400 uppercase">
              Scroll to explore
            </span>
            <motion.div 
              className="w-6 h-10 rounded-full border-2 border-slate-300 flex items-start justify-center p-2"
              animate={{ borderColor: ['#cbd5e1', '#3b82f6', '#cbd5e1'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-blue-500"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
