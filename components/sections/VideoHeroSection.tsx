"use client"

import { useRef, useState, useEffect, useCallback, useMemo } from "react"
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion"
import { throttle } from "lodash"
import { useTranslations } from "next-intl"
import { ArrowRight, Play, X, Sparkles, Zap, Shield } from "lucide-react"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import Link from "next/link"

const floatingCards = [
  { icon: Sparkles, label: "AI Analysis", x: "8%", y: "25%", delay: 0.5 },
  { icon: Zap, label: "Real-time", x: "85%", y: "20%", delay: 0.8 },
  { icon: Shield, label: "Secure", x: "12%", y: "70%", delay: 1.1 },
]

export function VideoHeroSection() {
  const t = useTranslations()
  const lp = useLocalizePath()
  const ref = useRef<HTMLDivElement>(null)
  const [showModal, setShowModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 })
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 })
  
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1])
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -80])

  // Throttle mouse events for performance (60fps max)
  const handleMouse = useCallback((e: MouseEvent) => {
    mouseX.set((e.clientX - window.innerWidth / 2) * 0.02)
    mouseY.set((e.clientY - window.innerHeight / 2) * 0.02)
  }, [mouseX, mouseY])

  const throttledHandleMouse = useMemo(
    () => throttle(handleMouse, 16), // 60fps = 16ms
    [handleMouse]
  )

  // Check if mobile for performance optimizations
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    // Only enable on desktop for performance
    if (!isMobile && window.innerWidth > 1024) {
      window.addEventListener("mousemove", throttledHandleMouse)
      return () => {
        window.removeEventListener("mousemove", throttledHandleMouse)
        throttledHandleMouse.cancel()
      }
    }
  }, [throttledHandleMouse, isMobile])

  return (
    <div ref={ref} className="relative min-h-[200vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-slate-900">
        <motion.div className="relative h-full" style={{ opacity }}>
          <motion.div className="absolute inset-0" style={{ scale }}>
            {/* Video with fallback */}
            <div className="relative w-full h-full">
              {!isMobile ? (
                <iframe
                  className="absolute inset-0 w-[120%] h-[120%] -left-[10%] -top-[10%] object-cover pointer-events-none opacity-40"
                  src="https://www.youtube.com/embed/4kX_hS69SJQ?autoplay=1&mute=1&loop=1&playlist=4kX_hS69SJQ&controls=0&showinfo=0&autohide=1&modestbranding=1&vq=hd1080"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  frameBorder="0"
                  aria-hidden="true"
                />
              ) : null}
              {/* Fallback gradient if video fails */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900" 
                   style={{ zIndex: -1 }} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/40 to-slate-900/60" />
          </motion.div>

          {/* Floating Glass Cards with Neon Accents */}
          {floatingCards.map((card, i) => (
            <motion.div
              key={i}
              className="absolute hidden lg:flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl z-20 hover:border-pink-500/50 transition-colors duration-500 group/float"
              style={{ left: card.x, top: card.y, x: smoothX, y: smoothY }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
              transition={{ delay: card.delay, duration: 0.6, y: { delay: card.delay + 0.6, duration: 3, repeat: Infinity } }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-blue-600 flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover/float:scale-110 transition-transform">
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/90 text-[10px] font-black uppercase tracking-widest">{card.label}</span>
            </motion.div>
          ))}

          <motion.div style={{ y: contentY }} className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">
            <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold tracking-widest uppercase mb-8">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              {t("home.hero.badge")}
            </motion.span>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl lg:text-7xl font-bold text-white max-w-5xl leading-[1.1]">
              {t("home.hero.title")} <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{t("home.hero.subtitle")}</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-6 text-lg text-white/60 max-w-2xl">{t("home.hero.description")}</motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-10 flex flex-wrap gap-4 justify-center">
              <Link href={lp("/analysis")} className="group h-14 px-10 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:shadow-2xl hover:shadow-pink-500/25 transition-all hover:scale-105 active:scale-95">
                {t("home.hero.cta")} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button onClick={() => setShowModal(true)} className="h-14 px-10 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-white/10 transition-all hover:scale-105 active:scale-95">
                <Play className="w-5 h-5 text-pink-400" /> Watch Synthesis
              </button>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-16 flex gap-12 text-white/80">
              <div className="text-center"><div className="text-3xl font-bold">500+</div><div className="text-xs text-white/50 uppercase tracking-wider">Clinics</div></div>
              <div className="text-center"><div className="text-3xl font-bold">98%</div><div className="text-xs text-white/50 uppercase tracking-wider">Accuracy</div></div>
              <div className="text-center"><div className="text-3xl font-bold">4.9/5</div><div className="text-xs text-white/50 uppercase tracking-wider">Rating</div></div>
            </motion.div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
            <span className="text-[10px] text-white/40 uppercase tracking-widest">Scroll</span>
            <div className="w-5 h-8 rounded-full border-2 border-white/30 flex justify-center pt-2"><motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1 h-1 bg-white/60 rounded-full" /></div>
          </motion.div>
        </motion.div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <button className="absolute top-6 right-6 text-white/80 hover:text-white"><X className="w-8 h-8" /></button>
          <div className="w-full max-w-5xl aspect-video bg-slate-800 rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <iframe className="w-full h-full" src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" allow="autoplay; encrypted-media" allowFullScreen />
          </div>
        </div>
      )}
    </div>
  )
}
