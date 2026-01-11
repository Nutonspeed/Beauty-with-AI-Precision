"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Zap, Play, RotateCcw, Copy, Code, Server, Terminal, Activity, ArrowRight, Binary } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export function NeuralAPIExplorer() {
  const t = useTranslations()
  const [isRunning, setIsRunning] = useState(false)
  const [response, setResponse] = useState<any>(null)

  const mockPayload = {
    aesthetic_node: "BIP-NODE-BKK-01",
    biometric_scan_id: "SCAN_8842_Neural",
    requested_inference: ["pigmentation_vector", "dermal_elasticity", "4D_aging_projection"],
    auth_token: "pk_live_************************"
  }

  const handleRun = () => {
    setIsRunning(true)
    setResponse(null)
    setTimeout(() => {
      setIsRunning(false)
      setResponse({
        status: "SUCCESS",
        latency: "112ms",
        inference_results: {
          melasma_match: 0.85,
          textural_index: 0.92,
          projected_aging_delta: "+2.4y/decade"
        },
        metadata: {
          model_version: "BIP-Neural-v4.2",
          compute_node: "edge-sg-01"
        }
      })
      toast.success(t('ui.terminal.inferenceCompleted'))
    }, 2000)
  }

  return (
    <div className="w-full bg-[#020617] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl relative group">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
      
      <div className="p-8 lg:p-12 border-b border-white/5 bg-white/[0.01] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/[0.02] to-transparent animate-neural-pulse pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <h3 className="text-2xl font-black text-white italic uppercase tracking-[0.2em] flex items-center gap-4">
            <Binary className="h-6 w-6 text-pink-400" />
            {t('apiExplorer.title')}
          </h3>
          <p className="text-[10px] text-slate-500 font-light italic tracking-widest">{t('apiExplorer.subtitle')}</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" size="sm" onClick={() => setResponse(null)} className="h-10 rounded-xl border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest italic hover:bg-white/10">
            <RotateCcw className="mr-2 h-3 w-3" />
            {t('apiExplorer.reset')}
          </Button>
          <Button size="sm" onClick={handleRun} disabled={isRunning} className="h-10 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-black uppercase tracking-widest text-[9px] italic shadow-lg shadow-pink-600/20">
            {isRunning ? <Zap className="mr-2 h-3 w-3 animate-spin" /> : <Play className="mr-2 h-3 w-3 fill-current" />}
            {t('apiExplorer.runTest')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Request Side */}
        <div className="p-8 lg:p-12 border-r border-white/5 space-y-8">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{t('apiExplorer.requestPayload')}</h4>
            <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-none text-[8px] font-black italic">POST /v1/inference</Badge>
          </div>
          <div className="bg-black/40 rounded-2xl p-6 font-mono text-[11px] text-cyan-400/80 border border-white/5 relative">
            <pre className="whitespace-pre-wrap">{JSON.stringify(mockPayload, null, 2)}</pre>
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8 text-slate-600 hover:text-white transition-all">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 border border-pink-500/20">
                <Zap className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Aesthetic_Transmission_Node</h3>
                <p className="text-[10px] text-slate-500 font-bold">Latency: 24ms | Protocol: BIP-V4</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-slate-600">
              <Terminal className="h-4 w-4" />
              <p className="text-[9px] font-black uppercase tracking-widest italic">Node_Status: ONLINE</p>
            </div>
          </div>
        </div>

        {/* Response Side */}
        <div className="p-8 lg:p-12 bg-white/[0.01] flex flex-col h-full space-y-8 relative">
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{t('apiExplorer.responseStream')}</h4>
          
          <div className="flex-1 min-h-[250px] bg-black/60 rounded-2xl p-6 font-mono text-[11px] border border-white/5 relative overflow-hidden flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {isRunning ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 text-center"
                >
                  <Activity className="h-10 w-10 text-pink-500 mx-auto animate-pulse" />
                  <p className="text-[10px] font-black text-pink-400 uppercase tracking-[0.3em] italic">{t('ui.terminal.synthesizing')}</p>
                </motion.div>
              ) : response ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-emerald-400/90"
                >
                  <pre className="whitespace-pre-wrap">{JSON.stringify(response, null, 2)}</pre>
                  <div className={cn(
                    "absolute h-16 w-16 rounded-2xl border border-white/10 flex items-center justify-center transition-all duration-700 animate-synaptic-fire",
                    response.status === "SUCCESS" ? "bg-cyan-500/20 border-cyan-500/40 shadow-2xl shadow-cyan-500/20" : "bg-white/[0.03]"
                  )}>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] italic">{t('ui.terminal.awaiting')}</p>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center space-y-4 opacity-20">
                  <Server className="h-10 w-10 text-slate-600 mx-auto" />
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] italic">{t('ui.terminal.awaiting')}</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Code className="h-4 w-4 text-slate-700" />
              <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic">Inference_Engine: BIP-Neural-v4.2</p>
            </div>
            {response && (
              <Button variant="ghost" size="sm" className="h-8 px-4 rounded-xl bg-white/5 text-[9px] font-black uppercase tracking-widest text-cyan-400 hover:bg-cyan-500 hover:text-[#020617] transition-all italic">
                {t('apiExplorer.copyCode')}
                <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
