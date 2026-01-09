"use client";

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface LaserScannerProps {
  color?: string;
  duration?: number;
}

export function LaserScanner({ color = "rgba(236, 72, 153, 0.5)", duration = 3 }: LaserScannerProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      <motion.div
        animate={{
          top: ['-10%', '110%'],
          opacity: [0, 1, 1, 0]
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          boxShadow: `0 0 15px ${color}`,
        }}
      />
    </div>
  );
}

export function SectionScanner({ children, color }: { children: React.ReactNode; color?: string }) {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const scanY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <div ref={ref} className="relative">
      <motion.div
        style={{ top: scanY, opacity }}
        className="absolute left-0 right-0 h-[2px] z-30 pointer-events-none"
      >
        <div 
          className="w-full h-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${color || 'rgba(236, 72, 153, 0.8)'}, transparent)`,
            boxShadow: `0 0 20px ${color || 'rgba(236, 72, 153, 0.5)'}`,
          }}
        />
        {/* Trailing glow */}
        <div 
          className="absolute top-0 left-0 right-0 h-20 -translate-y-full opacity-20"
          style={{
            background: `linear-gradient(to top, ${color || 'rgba(236, 72, 153, 0.3)'}, transparent)`
          }}
        />
      </motion.div>
      {children}
    </div>
  );
}
