"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Play, 
  RotateCcw, 
  Zap, 
  ShieldCheck, 
  Activity, 
  Target, 
  Sparkles, 
  Layers, 
  ChevronRight,
  Monitor,
  Settings2,
  RefreshCw
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

interface ProgramStep {
  id: string
  label: string
  duration: string
  intensity: number
  status: 'pending' | 'active' | 'completed'
}

export function ProgramSimulator() {
  const t = useTranslations('programSimulator')
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedProgram, setSelectedProgram] = useState("rejuvenation")
  const [isSyncing, setIsSyncing] = useState(false)

  const programs = [
    { id: 'rejuvenation', label: 'NEURAL_REGEN', icon: Sparkles, color: 'text-pink-600', bg: 'bg-pink-50' },
    { id: 'sculpting', label: 'VECTOR_SCULPT', icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'hydration', label: 'HYDRO_FLUX', icon: Activity, color: 'text-cyan-600', bg: 'bg-cyan-50' }
  ]

  const steps: ProgramStep[] = [
    { id: '1', label: 'Dermal_Sync', duration: '2:00', intensity: 85, status: 'completed' },
    { id: '2', label: 'Neural_Mapping', duration: '5:00', intensity: 92, status: 'active' },
    { id: '3', label: 'Vector_Commit', duration: '3:00', intensity: 78, status: 'pending' }
  ]

  const handleStart = () => {
    setIsPlaying(true)
    setIsSyncing(true)
    setTimeout(() => setIsSyncing(false), 1500)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setProgress(0)
  }

  return (
    <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-1000 hover:border-pink-500/20 flex flex-col min-h-[850px]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] bg-center pointer-events-none" />
      
      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-5">
            <Badge variant="outline" className="px-5 py-1.5 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black italic shadow-sm animate-pulse">
              <Zap className="mr-3 h-3.5 w-3.5" />
              SIM_CORE_v4.8
            </Badge>
          </div>
          <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
            <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:scale-110 group-hover:bg-pink-600 group-hover:text-white transition-all duration-700">
              <Monitor className="h-8 w-8 text-pink-600 group-hover:text-white" />
            </div>
            Aesthetic_Program_Sim
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mt-4 italic">
            Virtual protocol outcome forecasting and temporal simulation
          </CardDescription>
        </div>
        <div className="flex items-center gap-6 relative z-10 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-right hidden sm:block space-y-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Sim_Status</p>
            <p className={cn("text-lg font-black italic tracking-tighter uppercase leading-none mt-1", isPlaying ? 'text-emerald-600' : 'text-slate-300')}>
              {isPlaying ? 'ENGINE_ACTIVE' : 'READY_SYNC'}
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner">
            <Activity className={cn("h-6 w-6 transition-colors", isPlaying ? 'text-emerald-500 animate-pulse' : 'text-slate-300')} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-16 space-y-12 bg-white flex-1 relative overflow-hidden flex flex-col">
        <div className="grid lg:grid-cols-12 gap-16 flex-1">
          {/* Main Visualizer interface */}
          <div className="lg:col-span-8 relative group/viz">
            <div className="relative aspect-video rounded-[3.5rem] overflow-hidden bg-slate-950 border-4 border-white shadow-premium group/canvas flex items-center justify-center">
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.05] pointer-events-none" />
              
              <AnimatePresence mode="wait">
                {isSyncing ? (
                  <motion.div 
                    key="syncing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center space-y-8 italic"
                  >
                    <div className="relative h-24 w-24 mx-auto">
                      <div className="absolute inset-0 bg-pink-500/20 blur-2xl rounded-full animate-pulse" />
                      <RefreshCw className="h-16 w-16 animate-spin mx-auto text-pink-600 relative" />
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white animate-pulse">Synchronizing_Protocol_Voxel...</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="active"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full h-full relative"
                  >
                    {/* Mock Simulation Graphics interface interface */}
                    <div className="absolute inset-0 flex items-center justify-center p-20">
                      <div className="relative w-full h-full">
                        <div className="absolute inset-0 rounded-full bg-pink-500/5 blur-[120px] animate-pulse" />
                        <svg className="w-full h-full" viewBox="0 0 400 200">
                          <motion.path
                            d="M 0 100 Q 100 50 200 100 T 400 100"
                            fill="none"
                            stroke="rgba(255, 105, 180, 0.3)"
                            strokeWidth="2"
                            animate={{
                              d: isPlaying ? [
                                "M 0 100 Q 100 50 200 100 T 400 100",
                                "M 0 100 Q 100 150 200 100 T 400 100",
                                "M 0 100 Q 100 50 200 100 T 400 100"
                              ] : "M 0 100 Q 100 50 200 100 T 400 100"
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          />
                          <motion.path
                            d="M 0 100 Q 100 150 200 100 T 400 100"
                            fill="none"
                            stroke="rgba(3, 169, 244, 0.3)"
                            strokeWidth="2"
                            animate={{
                              d: isPlaying ? [
                                "M 0 100 Q 100 150 200 100 T 400 100",
                                "M 0 100 Q 100 50 200 100 T 400 100",
                                "M 0 100 Q 100 150 200 100 T 400 100"
                              ] : "M 0 100 Q 100 150 200 100 T 400 100"
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                          />
                        </svg>
                      </div>
                    </div>

                    {/* HUD interface interface interface */}
                    <div className="absolute inset-0 p-10 flex flex-col justify-between pointer-events-none">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-4">
                          <Badge className="bg-white/10 backdrop-blur-md text-white border-none px-6 py-2 rounded-full text-[10px] font-black italic shadow-2xl tracking-[0.2em] uppercase leading-none">
                            {isPlaying ? 'SIMULATION_ACTIVE' : 'NODE_IDLE'}
                          </Badge>
                          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-2 rounded-2xl border border-white/10 shadow-xl">
                            <Activity className="h-4 w-4 text-pink-500 animate-pulse" />
                            <span className="text-[9px] font-black text-white uppercase tracking-widest italic">Signal_Lock: TRUE</span>
                          </div>
                        </div>
                        <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl">
                          <Target className="h-7 w-7 text-blue-400" />
                        </div>
                      </div>

                      <div className="flex justify-between items-end">
                        <div className="bg-white/10 backdrop-blur-md px-8 py-4 rounded-[2rem] border border-white/10 shadow-2xl">
                          <p className="text-[9px] font-black text-white/40 uppercase tracking-widest italic mb-2">Current_Protocol</p>
                          <p className="text-xl font-black italic text-white tracking-tighter uppercase leading-none">{selectedProgram}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-white/60 uppercase tracking-widest italic mb-2">Completion_Idx</p>
                          <p className="text-5xl font-black italic text-pink-500 tracking-tighter leading-none">{progress}%</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent shadow-glow-pink animate-scan-line pointer-events-none" />
            </div>

            {/* Simulation Interface matrix interface */}
            <div className="mt-10 p-8 rounded-[3rem] bg-slate-50 border border-slate-100 shadow-inner flex flex-col sm:flex-row gap-8 justify-center items-center">
              <Button onClick={handleReset} variant="outline" size="xl" className="flex-1 w-full h-20 rounded-[2rem] border-slate-200 bg-white text-slate-950 font-black uppercase tracking-[0.2em] text-[10px] italic shadow-sm hover:bg-slate-50 transition-all active:scale-95 group/btn">
                <RotateCcw className="mr-4 h-6 w-6 group-hover/btn:rotate-180 transition-transform duration-700" />
                Reset_Nodes
              </Button>
              <Button 
                onClick={handleStart}
                disabled={isPlaying}
                size="xl" 
                className="flex-1 w-full h-20 rounded-[2rem] bg-slate-950 text-white font-black uppercase tracking-[0.2em] text-[10px] italic shadow-2xl transition-all hover:bg-pink-600 active:scale-95 border-none group/cap relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/cap:translate-x-[100%] transition-transform duration-1000" />
                <Play className="mr-4 h-6 w-6 group-hover/cap:scale-110 transition-transform" />
                Authorize_Sim
              </Button>
            </div>
          </div>

          {/* Program Sidebar matrix interface */}
          <div className="lg:col-span-4 space-y-12">
            <div className="space-y-8">
              <div className="flex items-center gap-5 ml-4">
                <div className="h-8 w-8 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center">
                  <Settings2 className="h-4 w-4 text-pink-600" />
                </div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">Protocol_Sync</h4>
              </div>
              
              <div className="grid gap-4">
                {programs.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProgram(p.id)}
                    className={cn(
                      "p-6 rounded-[2rem] border transition-all duration-700 flex items-center gap-6 relative overflow-hidden group/prog",
                      selectedProgram === p.id 
                        ? "bg-white border-pink-200 shadow-premium scale-105 z-10" 
                        : "bg-slate-50 border-slate-100 hover:bg-white hover:border-pink-500/20 shadow-inner"
                    )}
                  >
                    <div className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover/prog:scale-110",
                      selectedProgram === p.id ? "bg-pink-50 border border-pink-100" : "bg-white border border-slate-50"
                    )}>
                      <p.icon className={cn("h-7 w-7", selectedProgram === p.id ? "text-pink-600" : "text-slate-300")} />
                    </div>
                    <div className="text-left flex-1">
                      <p className={cn("text-[10px] font-black uppercase tracking-widest italic transition-colors", selectedProgram === p.id ? "text-pink-600" : "text-slate-400")}>{p.label}</p>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">v4.8_OPTIMIZED</p>
                    </div>
                    {selectedProgram === p.id && (
                      <motion.div layoutId="active-prog" className="h-2 w-2 rounded-full bg-pink-500 shadow-glow-pink" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-8 pt-10 border-t border-slate-50">
              <div className="flex items-center gap-5 ml-4">
                <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <Layers className="h-4 w-4 text-blue-600" />
                </div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">Sequence_Registry</h4>
              </div>
              
              <div className="space-y-4">
                {steps.map((step, i) => (
                  <div key={step.id} className="relative pl-12">
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-100" />
                    <div className={cn(
                      "absolute left-2 top-0 h-4 w-4 rounded-full border-4 border-white shadow-sm transition-colors",
                      step.status === 'completed' ? 'bg-emerald-500' : step.status === 'active' ? 'bg-blue-500 animate-pulse' : 'bg-slate-200'
                    )} />
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 group/step hover:bg-white hover:border-blue-500/20 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] font-black text-slate-950 uppercase italic">{step.label}</p>
                        <span className="text-[9px] font-black text-slate-400 italic">{step.duration}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="h-1 w-full bg-white rounded-full overflow-hidden p-0.5 shadow-inner">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${step.intensity}%` }} transition={{ duration: 1.5, delay: i * 0.1 }} className={cn("h-full rounded-full", step.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500')} />
                        </div>
                        <span className="text-[9px] font-black text-slate-400 italic">{step.intensity}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              size="xl" 
              className="w-full h-20 rounded-[2.5rem] bg-slate-950 text-white border-none shadow-2xl transition-all hover:bg-pink-600 active:scale-95 italic font-black text-[11px] uppercase tracking-[0.3em] group/btn relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
              Authorize_Commit_Registry
              <ChevronRight className="ml-4 h-6 w-6 group-hover:translate-x-2 transition-transform" />
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between opacity-40 hover:opacity-100 transition-opacity duration-700 grayscale hover:grayscale-0">
        <div className="flex items-center gap-6 text-slate-400 group/status cursor-default">
          <ShieldCheck className="h-5 w-5 group-hover:text-emerald-500 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">Simulation_Integrity_Verified: NOMINAL</p>
        </div>
        <div className="flex items-center gap-6">
          <Badge variant="outline" className="px-6 py-2 rounded-full border-slate-100 text-slate-400 bg-white text-[9px] font-black italic shadow-sm uppercase tracking-widest leading-none">
            BIP-Sim-v4.8
          </Badge>
          <div className="h-4 w-px bg-slate-200" />
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic leading-none">Engine: QUANTUM_TEMPORAL</p>
        </div>
      </CardFooter>
    </Card>
  )
}
