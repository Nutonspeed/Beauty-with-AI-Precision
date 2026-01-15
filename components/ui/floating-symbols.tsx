"use client"

import React from "react"
import { motion, useScroll, useTransform, MotionValue } from "framer-motion"
import { 
  Plus, 
  Activity, 
  Microscope, 
  ShieldCheck, 
  Dna, 
  HeartPulse 
} from "lucide-react"

interface SymbolConfig {
  Icon: any
  size: number
  top: string
  left: string
  delay: number
  speed: number
}

const SYMBOLS: SymbolConfig[] = [
  { Icon: Plus, size: 24, top: "15%", left: "10%", delay: 0, speed: 0.2 },
  { Icon: Activity, size: 20, top: "25%", left: "85%", delay: 1, speed: -0.15 },
  { Icon: Microscope, size: 28, top: "65%", left: "5%", delay: 2, speed: 0.1 },
  { Icon: ShieldCheck, size: 22, top: "80%", left: "90%", delay: 3, speed: -0.25 },
  { Icon: Dna, size: 32, top: "45%", left: "92%", delay: 4, speed: 0.3 },
  { Icon: HeartPulse, size: 26, top: "10%", left: "75%", delay: 5, speed: -0.1 },
]

function FloatingSymbolItem({ symbol, scrollYProgress, index }: { symbol: SymbolConfig, scrollYProgress: MotionValue<number>, index: number }) {
  const y = useTransform(scrollYProgress, [0, 1], [0, symbol.speed * 500])
  
  return (
    <motion.div
      className="absolute text-blue-600"
      style={{
        top: symbol.top,
        left: symbol.left,
        y,
      }}
      animate={{
        rotate: [0, 10, -10, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        rotate: { duration: 6 + index, repeat: Infinity, ease: "easeInOut", delay: symbol.delay },
        scale: { duration: 4 + index, repeat: Infinity, ease: "easeInOut", delay: symbol.delay },
      }}
    >
      <symbol.Icon size={symbol.size} strokeWidth={1.5} />
    </motion.div>
  )
}

export function FloatingSymbols() {
  const { scrollYProgress } = useScroll()

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.03] z-0">
      {SYMBOLS.map((symbol, i) => (
        <FloatingSymbolItem key={i} symbol={symbol} scrollYProgress={scrollYProgress} index={i} />
      ))}
    </div>
  )
}
