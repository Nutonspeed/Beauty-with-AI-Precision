"use client"

import React from "react"
import { motion } from "framer-motion"

export function MedicalHUD() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
      {/* Corner Brackets */}
      <div className="absolute top-12 left-12 w-20 h-20 border-t-2 border-l-2 border-pink-500/20 rounded-tl-[2rem] shadow-glow-pink/10" />
      <div className="absolute top-12 right-12 w-20 h-20 border-t-2 border-r-2 border-pink-500/20 rounded-tr-[2rem] shadow-glow-pink/10" />
      <div className="absolute bottom-12 left-12 w-20 h-20 border-b-2 border-l-2 border-pink-500/20 rounded-bl-[2rem] shadow-glow-pink/10" />
      <div className="absolute bottom-12 right-12 w-20 h-20 border-b-2 border-r-2 border-pink-500/20 rounded-br-[2rem] shadow-glow-pink/10" />

      {/* Horizontal Coordinates */}
      <div className="absolute top-1/2 left-8 -translate-y-1/2 flex flex-col gap-32 text-[10px] font-black text-pink-500/30 uppercase tracking-[0.3em] italic vertical-text">
        <span>Aesthetic Engine v4.0</span>
        <span>Precision Level: 99.9%</span>
      </div>

      {/* Scanning Line Background */}
      <motion.div 
        animate={{ 
          y: ["0%", "100%", "0%"] 
        }}
        transition={{ 
          duration: 12, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-pink-500/20 to-transparent shadow-[0_0_20px_rgba(236,72,153,0.15)]"
      />

      {/* Data Stream Decoration */}
      <div className="absolute bottom-24 left-24 flex flex-col gap-2">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ width: 0 }}
            animate={{ width: [0, 60 + Math.random() * 80, 0] }}
            transition={{ 
              duration: 3 + Math.random() * 3, 
              repeat: Infinity, 
              delay: i * 0.3 
            }}
            className="h-[1.5px] bg-pink-500/20 rounded-full shadow-glow-pink/10"
          />
        ))}
      </div>
    </div>
  )
}
