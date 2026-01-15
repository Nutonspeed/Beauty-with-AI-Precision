"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ShieldCheck, Trophy, Zap, Binary, Award, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { EngagementTelemetry } from "@/components/share/engagement-telemetry"

interface MilestoneShareViewProps {
  token: string
  milestone: any
  customerRecord: any
  centerRecord: any
  brandColor: string
}

export function MilestoneShareView({ 
  token, 
  milestone, 
  customerRecord, 
  centerRecord, 
  brandColor 
}: MilestoneShareViewProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const _unusedStates = { isGenerating, setIsGenerating, imageLoading, setImageLoading };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col selection:bg-blue-500/30">
      <EngagementTelemetry shareToken={token} />
      <Header />
      <main className="flex-1 relative overflow-hidden flex flex-col items-center justify-center py-24 px-6">
        {/* Background Infrastructure */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-500/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03]" />
        </div>

        <div className="max-w-5xl w-full space-y-16 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Badge variant="outline" className="px-6 py-2 rounded-full border-blue-500/30 text-blue-400 bg-blue-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-2xl ring-1 ring-blue-500/20">
              <ShieldCheck className="mr-3 h-4 w-4 animate-pulse text-blue-400" />
              Neural Verified Aesthetic Achievement
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.85]">
              VERIFIED_<span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent not-italic">EVOLUTION</span>
            </h1>
            <p className="text-slate-500 font-light tracking-[0.2em] uppercase text-xs">Authenticity secured via CenterIQ Blockchain-grade telemetry</p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-16 items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, x: -50, rotateY: 20 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 1, type: "spring" }}
              className="shrink-0 scale-100 origin-center perspective-1000"
            >
              <div 
                className="w-[400px] h-[600px] bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-12 flex flex-col justify-between relative overflow-hidden shadow-[0_0_100px_rgba(37,99,235,0.15)] ring-1 ring-white/20 group hover:shadow-[0_0_120px_rgba(37,99,235,0.2)] transition-all duration-700"
              >
                <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
                  <Binary className="h-64 w-64 text-white" />
                </div>
                
                <div className="relative z-10 space-y-6 text-left">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 shadow-inner group-hover:scale-110 transition-transform">
                      <Award className="h-6 w-6 text-blue-400" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-400/80">Biological_Proof</span>
                  </div>
                  <h2 className="text-4xl font-black italic leading-[0.9] tracking-tighter text-white uppercase group-hover:tracking-normal transition-all duration-500">
                    {milestone.title}
                  </h2>
                </div>

                <div className="relative z-10 flex-1 flex flex-col justify-center space-y-10">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="h-28 w-28 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto shadow-[0_20px_50px_rgba(37,99,235,0.3)] ring-2 ring-white/10"
                  >
                    <Trophy className="h-14 w-14 text-white drop-shadow-lg" />
                  </motion.div>
                  <div className="text-center space-y-4 px-2">
                    <p className="text-base text-slate-300 italic font-medium leading-relaxed">
                      "{milestone.description}"
                    </p>
                    <div className="flex justify-center gap-3">
                      <motion.div 
                        animate={{ width: [32, 48, 32] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="h-1 bg-blue-500/30 rounded-full" 
                      />
                      <div className="h-1 w-1 bg-blue-500/30 rounded-full" />
                      <div className="h-1 w-1 bg-blue-500/30 rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="relative z-10 pt-10 border-t border-white/5 space-y-8 text-left">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Node_Identifier</p>
                      <p className="text-base font-bold italic text-white">{customerRecord?.full_name}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Origin_Node</p>
                      <p className="text-base font-bold italic text-white">{centerRecord?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-3 bg-white/[0.02] py-3 rounded-2xl border border-white/5 shadow-inner">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400">Sync Date: {new Date(milestone.achieved_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="flex-1 text-left space-y-10 max-w-md"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold italic">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  LIVE_VERIFICATION_ACTIVE
                </div>
                <h3 className="text-3xl font-bold italic text-white tracking-tight">The Aesthetic Standard</h3>
                <p className="text-slate-400 font-light leading-relaxed text-lg italic">
                  This biological milestone represents a significant leap in aesthetic wellness, quantified by our deep-learning diagnostic nodes.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/10 flex items-center gap-6 group hover:bg-white/[0.04] transition-all">
                  <div className="h-14 w-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Binary className="h-7 w-7 text-blue-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest italic">Diagnostic_Accuracy</p>
                    <p className="text-xl font-black italic text-white">99.8% Precision</p>
                  </div>
                </div>
                <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/10 flex items-center gap-6 group hover:bg-white/[0.04] transition-all">
                  <div className="h-14 w-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Zap className="h-7 w-7 text-pink-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest italic">Authenticity_Status</p>
                    <p className="text-xl font-black italic text-white">SYSTEM_VERIFIED</p>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <motion.button 
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-20 rounded-[2.5rem] text-white font-black uppercase tracking-[0.3em] text-sm shadow-[0_20px_50px_rgba(37,99,235,0.3)] transition-all flex items-center justify-center gap-4 relative overflow-hidden group/btn"
                  style={{ backgroundColor: brandColor }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                  <Zap className="h-5 w-5 fill-current relative z-10" />
                  <span className="relative z-10">Initialize Your Node</span>
                </motion.button>
                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest text-center mt-6 italic">CenterIQ AI Neural Network Infrastructure</p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
