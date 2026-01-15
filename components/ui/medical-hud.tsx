"use client"

import React from "react"
import { motion } from "framer-motion"

export function MedicalHUD() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-20">
      {/* Corner Brackets */}
      <div className="absolute top-12 left-12 w-16 h-16 border-t-2 border-l-2 border-blue-600/30 rounded-tl-xl" />
      <div className="absolute top-12 right-12 w-16 h-16 border-t-2 border-r-2 border-blue-600/30 rounded-tr-xl" />
      <div className="absolute bottom-12 left-12 w-16 h-16 border-b-2 border-l-2 border-blue-600/30 rounded-bl-xl" />
      <div className="absolute bottom-12 right-12 w-16 h-16 border-b-2 border-r-2 border-blue-600/30 rounded-br-xl" />

      {/* Horizontal Coordinates */}
      <div className="absolute top-1/2 left-6 -translate-y-1/2 flex flex-col gap-24 text-[8px] font-black text-blue-600/40 uppercase tracking-widest vertical-text">
        <span>Lat: 13.7563° N</span>
        <span>Lon: 100.5018° E</span>
      </div>

      {/* Scanning Line Background */}
      <motion.div 
        animate={{ 
          y: ["0%", "100%", "0%"] 
        }}
        transition={{ 
          duration: 15, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="absolute top-0 left-0 w-full h-[1px] bg-blue-600/10 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
      />

      {/* Data Stream Decoration */}
      <div className="absolute bottom-24 left-24 flex flex-col gap-1">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ width: 0 }}
            animate={{ width: [0, 40 + Math.random() * 60, 0] }}
            transition={{ 
              duration: 2 + Math.random() * 2, 
              repeat: Infinity, 
              delay: i * 0.2 
            }}
            className="h-[2px] bg-blue-600/20 rounded-full"
          />
        ))}
      </div>
    </div>
  )
}
