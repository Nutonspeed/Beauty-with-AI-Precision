"use client";
import React, { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useTranslations } from "next-intl";
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { MagneticButton } from "@/components/ui/magnetic-button";
import { MedicalHUD } from "@/components/ui/medical-hud";
import { useEffect } from "react";

interface LandingHeroProps {
  _onPrimary?: () => void;
  _onSecondary?: () => void;
  _ctaVariant?: "A" | "B";
}

export function LandingHero({ _onPrimary, _onSecondary, _ctaVariant = "A" }: LandingHeroProps) {
  const t = useTranslations();
  
  // Mouse parallax setup
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);

  const gridX = useTransform(mouseXSpring, [-500, 500], ["-20px", "20px"]);
  const gridY = useTransform(mouseYSpring, [-500, 500], ["-20px", "20px"]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white">
      <MedicalHUD />
      {/* Dynamic Medical Grid Pattern with Parallax */}
      <motion.div 
        className="absolute inset-[-100px] opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(#1e40af 1px, transparent 1px), linear-gradient(90deg, #1e40af 1px, transparent 1px)', 
          backgroundSize: '100px 100px',
          x: gridX,
          y: gridY
        }} 
      />
      
      {/* Decorative Floating Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            y: [0, -20, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[10%] w-64 h-64 bg-blue-400 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ 
            y: [0, 20, 0],
            opacity: [0.05, 0.15, 0.05]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-indigo-300 rounded-full blur-[120px]"
        />
      </div>
      
      <div className="relative z-10 container max-w-6xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5"
        >
          <div className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest text-blue-700 uppercase">
            {t('home.hero.badge')}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display font-bold tracking-tight text-[clamp(2.5rem,7vw,4.5rem)] leading-[1.1] text-slate-900"
        >
          {t('home.hero.title')}
          <span className="block text-blue-600">
            {t('home.hero.subtitle')}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 max-w-2xl mx-auto text-lg md:text-xl text-slate-500 font-normal leading-relaxed"
        >
          {t('home.hero.description')}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <MagneticButton strength={0.15}>
            <button 
              onClick={_onPrimary}
              className="group h-14 md:h-16 w-full sm:w-auto px-10 md:px-12 rounded-xl bg-blue-600 text-white font-bold text-sm uppercase tracking-wider transition-all hover:bg-blue-700 hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
            >
              {t('home.hero.cta')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </MagneticButton>

          <MagneticButton strength={0.1}>
            <button 
              onClick={_onSecondary}
              className="h-14 md:h-16 w-full sm:w-auto px-10 md:px-12 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-sm uppercase tracking-wider transition-all hover:bg-slate-50 hover:border-slate-300 shadow-sm"
            >
              {t('home.hero.learnMore')}
            </button>
          </MagneticButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-16 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase"
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-blue-500/40" />
            {t('home.hero.noCreditCard')}
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-blue-500/40" />
            {t('home.hero.freeTierAvailable')}
          </span>
        </motion.div>
      </div>

      {/* Scroll Guide */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[9px] font-bold tracking-[0.2em] text-slate-400 uppercase">
          Scroll to explore
        </span>
        <div className="w-px h-12 bg-gradient-to-b from-blue-600/50 to-transparent relative overflow-hidden">
          <motion.div
            animate={{ 
              y: ["-100%", "100%"]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute top-0 left-0 w-full h-1/2 bg-blue-600"
          />
        </div>
      </motion.div>
    </div>
  );
}

