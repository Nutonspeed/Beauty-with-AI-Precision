"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import Image from "next/image"
import { TrendingUp, Zap, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { EngagementTelemetry } from "@/components/share/engagement-telemetry"
import { cn } from "@/lib/utils"

interface ComparisonShareViewProps {
  token: string
  comparison: any
  customerRecord: any
  centerRecord: any
  brandColor: string
}

export function ComparisonShareView({
  token,
  comparison,
  customerRecord,
  centerRecord,
  brandColor
}: ComparisonShareViewProps) {
  const [beforeLoading, setBeforeLoading] = useState(true)
  const [afterLoading, setAfterLoading] = useState(true)

  const temporalDelta = Math.ceil(
    (new Date(comparison.created_at).getTime() - new Date(comparison.before_photo?.created_at).getTime()) / 
    (1000 * 60 * 60 * 24)
  )

  const metrics = [
    { label: 'Spots', val: comparison.improvement_spots, delta: comparison.spots_delta },
    { label: 'Pores', val: comparison.improvement_pores, delta: comparison.pores_delta },
    { label: 'Wrinkles', val: comparison.improvement_wrinkles, delta: comparison.wrinkles_delta },
    { label: 'Texture', val: comparison.improvement_texture, delta: null },
  ]

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col selection:bg-emerald-500/30">
      <EngagementTelemetry shareToken={token} />
      <Header />
      <main className="flex-1 relative overflow-hidden flex flex-col items-center justify-center py-24 px-6">
        {/* Background Infrastructure */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03]" />
        </div>

        <div className="max-w-6xl w-full space-y-16 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Badge variant="outline" className="px-6 py-2 rounded-full border-emerald-500/30 text-emerald-400 bg-emerald-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-2xl ring-1 ring-emerald-500/20">
              <TrendingUp className="mr-3 h-4 w-4 animate-pulse text-emerald-400" />
              Verified Aesthetic Evolution
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.85]">
              PROGRESS_<span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent not-italic">QUANTIFIED</span>
            </h1>
            <p className="text-slate-500 font-light tracking-[0.2em] uppercase text-xs text-center">Comparison data verified by AI Precision Engine</p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Visual Comparison Area */}
            <div className="space-y-10">
              <div className="grid grid-cols-2 gap-6">
                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="space-y-4"
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic text-left">Baseline (Before)</p>
                  <div className="aspect-[3/4] rounded-[2.5rem] overflow-hidden border border-white/10 relative group ring-1 ring-white/5 bg-slate-900/50">
                    {beforeLoading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 backdrop-blur-md bg-slate-900/40">
                        <RefreshCw className="h-10 w-10 animate-spin text-slate-500 mb-4" />
                        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-600 animate-pulse">Syncing_Baseline...</p>
                      </div>
                    )}
                    <Image 
                      src={comparison.before_photo?.image_url} 
                      alt="Before" 
                      fill 
                      sizes="(max-width: 768px) 50vw, 400px"
                      className={cn(
                        "object-cover transition-all duration-1000 group-hover:scale-105",
                        beforeLoading ? "opacity-0" : "opacity-100"
                      )}
                      onLoadingComplete={() => setBeforeLoading(false)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-6 left-6 right-6 bg-black/40 backdrop-blur-xl p-4 rounded-2xl border border-white/10 text-left">
                      <p className="text-[8px] font-bold text-white/60 uppercase tracking-[0.2em]">Captured_On</p>
                      <p className="text-sm font-black italic text-white tracking-tight">{new Date(comparison.before_photo?.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="space-y-4 text-right"
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 italic">Evolution (After)</p>
                  <div className="aspect-[3/4] rounded-[2.5rem] overflow-hidden border border-emerald-500/30 relative group ring-2 ring-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.15)] bg-slate-900/50">
                    {afterLoading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 backdrop-blur-md bg-slate-900/40">
                        <RefreshCw className="h-10 w-10 animate-spin text-emerald-500 mb-4" />
                        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-emerald-600 animate-pulse">Syncing_Evolution...</p>
                      </div>
                    )}
                    <Image 
                      src={comparison.after_photo?.image_url} 
                      alt="After" 
                      fill 
                      sizes="(max-width: 768px) 50vw, 400px"
                      className={cn(
                        "object-cover transition-all duration-1000 group-hover:scale-105",
                        afterLoading ? "opacity-0" : "opacity-100"
                      )}
                      onLoadingComplete={() => setAfterLoading(false)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-6 left-6 right-6 bg-emerald-950/40 backdrop-blur-xl p-4 rounded-2xl border border-emerald-500/30 text-left">
                      <p className="text-[8px] font-bold text-emerald-400/60 uppercase tracking-[0.2em]">Captured_On</p>
                      <p className="text-sm font-black italic text-emerald-400 tracking-tight">{new Date(comparison.after_photo?.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-10 rounded-[3rem] bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between shadow-inner relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                  <TrendingUp className="h-32 w-32 text-emerald-400" />
                </div>
                <div className="flex items-center gap-8 relative z-10">
                  <div className="h-20 w-20 rounded-[1.5rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-xl group-hover:rotate-3 transition-transform">
                    <TrendingUp className="h-10 w-10" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase text-emerald-500/60 tracking-[0.4em] italic mb-1">Overall_Improvement</p>
                    <p className="text-5xl font-black italic text-emerald-400 tracking-tighter">+{comparison.improvement_overall}%</p>
                  </div>
                </div>
                <div className="text-right relative z-10">
                  <p className="text-[10px] font-black uppercase text-slate-600 tracking-[0.4em] italic mb-1">Temporal_Delta</p>
                  <p className="text-2xl font-black text-white italic tracking-tighter">
                    {temporalDelta} <span className="text-sm text-slate-500 not-italic uppercase tracking-widest font-bold">Days</span>
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Metric Breakdown Column */}
            <div className="space-y-12 text-left">
              <div className="space-y-4 px-2">
                <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none">Biological Variance Matrix</h3>
                <p className="text-slate-400 font-light leading-relaxed italic text-base">
                  Quantified delta analysis across key aesthetic nodes established via deep-learning synchronization.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {metrics.map((m, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/10 space-y-6 group hover:bg-white/[0.04] hover:border-emerald-500/20 transition-all duration-500"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] italic">{m.label}</p>
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-none px-3 py-0.5 text-[10px] font-black italic shadow-sm">
                        +{m.val}%
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: `${m.val}%` }}
                          transition={{ duration: 1.5, delay: 0.5 + (i * 0.1), ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400" 
                        />
                      </div>
                      {m.delta !== null && (
                        <p className={cn(
                          "text-[9px] font-black uppercase tracking-[0.3em] italic",
                          m.delta < 0 ? "text-emerald-500/60" : "text-slate-600"
                        )}>
                          {m.delta < 0 ? 'REDUCED' : 'STABILIZED'}: {Math.abs(m.delta as number)} Nodes
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="pt-10 border-t border-white/5 space-y-10">
                <div className="flex items-center justify-between px-2">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 italic">Authorized_Client</p>
                    <p className="text-xl font-black italic text-white tracking-tight uppercase">{customerRecord?.full_name}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 italic">Neural_Origin_Node</p>
                    <p className="text-xl font-black italic text-white tracking-tight uppercase">{centerRecord?.name}</p>
                  </div>
                </div>
                
                <div className="grid gap-6">
                  <motion.button 
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-20 rounded-[2.5rem] text-white font-black uppercase tracking-[0.4em] text-sm shadow-[0_20px_60px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-4 relative overflow-hidden group/btn border-none"
                    style={{ backgroundColor: brandColor }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                    <Zap className="h-5 w-5 fill-current relative z-10" />
                    <span className="relative z-10">Initialize Your Evolution</span>
                  </motion.button>
                  
                  {centerRecord?.contact_phone && (
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.5em] text-center italic flex items-center justify-center gap-3">
                      <span className="h-px w-8 bg-white/5" />
                      Origin Node: {centerRecord.contact_phone}
                      <span className="h-px w-8 bg-white/5" />
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
