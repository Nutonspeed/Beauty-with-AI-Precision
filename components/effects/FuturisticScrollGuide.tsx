"use client";

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';

const SECTIONS = [
  { id: 'hero', label: 'UPLINK_INIT' },
  { id: 'roi', label: 'PROFIT_ORCH' },
  { id: 'digital-twin', label: 'RECON_ENGINE' },
  { id: 'intelligence', label: 'NEURAL_GRID' },
  { id: 'protocol', label: 'DIAG_PROTO' },
  { id: 'deployment', label: 'SYS_DEPLOY' },
  { id: 'pricing', label: 'SUBSCRIPTION' },
];

export function FuturisticScrollGuide() {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [activeSection, setActiveSection] = useState(0);
  const scrollPercent = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const [displayPercent, setDisplayPercent] = useState(0);

  useEffect(() => {
    return scrollPercent.on("change", (latest) => {
      setDisplayPercent(Math.round(latest));
      
      // Calculate active section based on scroll progress
      const sectionIndex = Math.min(
        Math.floor(latest / (100 / SECTIONS.length)),
        SECTIONS.length - 1
      );
      setActiveSection(sectionIndex);
    });
  }, [scrollPercent]);

  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden xl:flex flex-col items-end gap-8 pointer-events-none">
      {/* Active Section Label */}
      <div className="flex flex-col items-end gap-1">
        <motion.span 
          key={activeSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-[10px] font-black font-mono text-cyan-500 tracking-[0.3em] uppercase"
        >
          {SECTIONS[activeSection].label}
        </motion.span>
        <div className="text-[24px] font-black font-mono text-white/20 italic leading-none">
          {String(activeSection + 1).padStart(2, '0')}
        </div>
      </div>

      {/* Progress Line */}
      <div className="relative h-64 w-px bg-white/5">
        <motion.div 
          className="absolute top-0 left-0 w-full bg-gradient-to-b from-cyan-500 via-pink-500 to-purple-500 origin-top"
          style={{ height: '100%', scaleY }}
        />
        
        {/* Section Markers */}
        {SECTIONS.map((_, i) => (
          <div 
            key={i}
            className="absolute left-1/2 -translate-x-1/2 w-4 h-px bg-white/10"
            style={{ top: `${(i / (SECTIONS.length - 1)) * 100}%` }}
          />
        ))}

        {/* Current Depth HUD */}
        <motion.div 
          className="absolute -left-24 top-0 -translate-y-1/2 flex items-center gap-3"
          style={{ 
            top: useTransform(scrollYProgress, [0, 1], ["0%", "100%"])
          }}
        >
          <div className="text-[9px] font-mono text-cyan-400/60 font-bold whitespace-nowrap bg-black/40 backdrop-blur-md px-2 py-1 border border-cyan-500/20 rounded">
            DEPTH: {displayPercent.toFixed(1)}%
          </div>
          <div className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
        </motion.div>
      </div>

      {/* Bottom Telemetry */}
      <div className="flex flex-col items-end gap-1 opacity-40 group">
        <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Buffer_Status</div>
        <div className="text-[10px] font-mono text-emerald-500 font-bold">OPTIMIZED</div>
      </div>
    </div>
  );
}
