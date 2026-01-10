"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Cpu, Zap, ShieldCheck, Activity, Terminal, Code, Database, Globe } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

export function NeuralTerminal() {
  const t = useTranslations()
  const [logs, setActivities] = useState<string[]>([])
  const [activeNode, setActiveNode] = useState(0)

  useEffect(() => {
    const activityPool = [
      "SYNAPTIC_FIRE: VECTOR_468_MAPPED",
      "NEURAL_SYNTHESIS: PROTOCOL_v5.2_LOADED",
      "DATA_INTEGRITY: QUANTUM_SAFE_VERIFIED",
      "GEO_EXPANSION: NODE_BANGKOK_ACTIVE",
      "AI_INFERENCE: LATENCY_118ms",
      "BIOMETRIC_SYNC: MIRROR_LINK_ESTABLISHED",
      "PREDICTIVE_YIELD: ROI_PROJECTION_SUCCESS",
      "CLINICAL_AUDIT: ZERO_ANOMALIES_DETECTED"
    ]

    const interval = setInterval(() => {
      setActivities(prev => [activityPool[Math.floor(Math.random() * activityPool.length)], ...prev].slice(0, 6))
      setActiveNode(Math.floor(Math.random() * 4))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full max-w-4xl mx-auto rounded-[2.5rem] bg-[#020617] border border-white/5 shadow-2xl overflow-hidden relative group">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      
      {/* Terminal Header */}
      <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-500/40" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500/40" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/40" />
          </div>
          <div className="h-4 w-px bg-white/10 mx-2" />
          <div className="flex items-center gap-3 text-slate-500">
            <Terminal className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">{t('ui.status.neuralLive')}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black text-emerald-500/80 uppercase tracking-widest italic">{t('ui.status.nodeSync')}</span>
        </div>
      </div>

      <div className="p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Neural Network Visualization */}
        <div className="lg:col-span-7 space-y-8">
          <div className="relative aspect-video bg-white/[0.01] border border-white/5 rounded-3xl overflow-hidden p-8 flex items-center justify-center">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] bg-center" />
            
            {/* Dynamic Neural Pathways */}
            <div className="relative w-full h-full">
              {[0, 1, 2, 3].map((node) => (
                <motion.div
                  key={node}
                  className={cn(
                    "absolute h-16 w-16 rounded-2xl border border-white/10 flex items-center justify-center transition-all duration-700",
                    activeNode === node ? "bg-cyan-500/20 border-cyan-500/40 shadow-2xl shadow-cyan-500/20" : "bg-white/[0.03]"
                  )}
                  style={{
                    top: node < 2 ? '20%' : '60%',
                    left: node % 2 === 0 ? '20%' : '60%',
                  }}
                >
                  {node === 0 && <Cpu className={cn("h-6 w-6", activeNode === node ? "text-cyan-400" : "text-slate-600")} />}
                  {node === 1 && <Database className={cn("h-6 w-6", activeNode === node ? "text-pink-400" : "text-slate-600")} />}
                  {node === 2 && <Zap className={cn("h-6 w-6", activeNode === node ? "text-amber-400" : "text-slate-600")} />}
                  {node === 3 && <Globe className={cn("h-6 w-6", activeNode === node ? "text-emerald-400" : "text-slate-600")} />}
                </motion.div>
              ))}
              
              {/* SVG Connector Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                <line x1="30%" y1="30%" x2="70%" y2="30%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="30%" y1="30%" x2="30%" y2="70%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="70%" y1="30%" x2="70%" y2="70%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="30%" y1="70%" x2="70%" y2="70%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
              </svg>
            </div>

            <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">{t('neuralTerminal.neuralPathways')}</p>
                <p className="text-xs font-bold text-white italic">4.2M ACTIVE_SYNAPSES</p>
              </div>
              <Activity className="h-4 w-4 text-cyan-500 animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">{t('neuralTerminal.synapticVelocity')}</p>
              <p className="text-xl font-black text-cyan-400 italic tracking-tighter">0.0042 ms</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">{t('neuralTerminal.computePower')}</p>
              <p className="text-xl font-black text-pink-400 italic tracking-tighter">8.4 TFLOPS</p>
            </div>
          </div>
        </div>

        {/* Live System Logs */}
        <div className="lg:col-span-5 flex flex-col h-full space-y-8">
          <div className="flex-1 rounded-3xl bg-black/40 border border-white/5 p-8 font-mono space-y-4 overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-[#020617] to-transparent z-10" />
            <div className="space-y-4 pt-4">
              <AnimatePresence mode="popLayout">
                {logs.map((log, i) => (
                  <motion.div
                    key={log + i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex gap-4 text-[10px] leading-relaxed"
                  >
                    <span className="text-cyan-500/50 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                    <span className={cn(
                      "font-bold italic tracking-tight",
                      log.includes('SUCCESS') || log.includes('DETECTED') ? "text-emerald-400" : "text-slate-400"
                    )}>{log}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#020617] to-transparent z-10" />
          </div>

          <div className="p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 flex items-center gap-4">
            <ShieldCheck className="h-5 w-5 text-cyan-500" />
            <p className="text-[10px] text-slate-500 font-light italic leading-relaxed">
              {t('neuralTerminal.secure')}: <span className="text-white font-bold italic uppercase tracking-widest">AES-256_BIP_v4</span>
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 py-4 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Code className="h-3 w-3 text-slate-700" />
          <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.4em] italic">Intelligence_Supremacy_Protocol</p>
        </div>
        <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest">{t('ui.status.neuralVerified')}</p>
      </div>
    </div>
  )
}
