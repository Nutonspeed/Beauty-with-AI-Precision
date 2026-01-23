"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  History, 
  Zap, 
  Activity, 
  Target, 
  ShieldCheck, 
  Sparkles,
  Monitor,
  RefreshCw,
  Clock,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Rewind,
  Eye,
  Settings2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import Image from "next/image"

interface AgingSimulatorProps {
  baseImage?: string
  currentAge?: number
}

export function AgingSimulator({ 
  baseImage, 
  currentAge = 35 
}: AgingSimulatorProps) {
  const _t = useTranslations('agingSimulator')
  const [simulatedAge, setSimulatedAge] = useState(currentAge)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedFactor, setSelectedFactor] = useState<'uv' | 'lifestyle' | 'treatment'>('treatment')

  const factors = [
    { id: 'uv', label: 'UV_EXPOSURE', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'lifestyle', label: 'LIFESTYLE_NODE', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'treatment', label: 'TREATMENT_PLAN', icon: ShieldCheck, color: 'text-pink-600', bg: 'bg-pink-50' }
  ]

  const handleSimulate = (age: number[]) => {
    setSimulatedAge(age[0])
    setIsProcessing(true)
    // Simulate AI processing delay
    setTimeout(() => setIsProcessing(false), 800)
  }

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
    // Playback logic would increment age over time
  }

  return (
    <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-1000 hover:border-pink-500/20 flex flex-col min-h-[850px]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] bg-center pointer-events-none" />
      
      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-5">
            <Badge variant="outline" className="px-5 py-1.5 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black italic shadow-sm animate-pulse">
              <Clock className="mr-3 h-3.5 w-3.5" />
              TEMPORAL_ENGINE_v4.8
            </Badge>
          </div>
          <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
            <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:scale-110 group-hover:bg-pink-600 group-hover:text-white transition-all duration-700">
              <History className="h-8 w-8 text-pink-600 group-hover:text-white" />
            </div>
            Temporal_Aging_Sim
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mt-4 italic">
            Recursive predictive modeling of biological aging vectors
          </CardDescription>
        </div>
        <div className="flex items-center gap-6 relative z-10 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-right hidden sm:block space-y-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Simulation_State</p>
            <p className={cn("text-lg font-black italic tracking-tighter uppercase leading-none mt-1", isPlaying ? 'text-emerald-600' : 'text-slate-300')}>
              {isPlaying ? 'ACTIVE_PROJECTION' : 'NODE_STANDBY'}
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner">
            <Monitor className={cn("h-6 w-6 transition-colors", isPlaying ? 'text-emerald-500 animate-pulse' : 'text-slate-300')} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-16 space-y-12 bg-white flex-1 relative overflow-hidden flex flex-col">
        <div className="grid lg:grid-cols-12 gap-16 flex-1">
          {/* Simulation Viewport interface */}
          <div className="lg:col-span-8 relative group/viewport">
            <div className="relative aspect-[4/5] rounded-[3.5rem] overflow-hidden bg-slate-950 border-4 border-white shadow-premium group/canvas flex items-center justify-center">
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.05] pointer-events-none" />
              
              {baseImage ? (
                <div className="relative w-full h-full">
                  <Image src={baseImage} alt="Temporal Simulation" fill className="object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/40" />
                </div>
              ) : (
                <div className="text-center space-y-8 italic opacity-20 group-hover/viewport:opacity-100 transition-all duration-1000">
                  <div className="relative mx-auto h-32 w-32">
                    <div className="absolute inset-0 bg-pink-500/5 blur-[60px] rounded-full" />
                    <Sparkles className="h-24 w-24 text-slate-400 mx-auto" />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Imaging_Buffer_Empty</p>
                </div>
              )}

              {/* Simulation Overlays interface interface */}
              <AnimatePresence>
                {isProcessing && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/40 backdrop-blur-xl"
                  >
                    <div className="text-center space-y-8">
                      <div className="relative h-20 w-20 mx-auto">
                        <div className="absolute inset-0 bg-pink-500/20 blur-2xl rounded-full animate-pulse" />
                        <RefreshCw className="h-14 w-14 animate-spin mx-auto text-pink-600 relative" />
                      </div>
                      <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white animate-pulse">Recalibrating_Temporal_Voxel...</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* HUD interface interface interface */}
              <div className="absolute inset-0 z-10 pointer-events-none p-10 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-4">
                    <Badge className="bg-white/10 backdrop-blur-md text-white border-none px-6 py-2 rounded-full text-[10px] font-black italic shadow-2xl tracking-[0.2em] uppercase leading-none">
                      PROJECTION_ACTIVE
                    </Badge>
                    <div className="flex items-center gap-4 bg-emerald-500/20 backdrop-blur-md px-5 py-2 rounded-2xl border border-emerald-500/30 shadow-xl">
                      <Target className="h-4 w-4 text-emerald-400 animate-pulse" />
                      <span className="text-[9px] font-black text-white uppercase tracking-widest italic">Temporal_Lock: TRUE</span>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-[2rem] border border-white/10 shadow-2xl text-center min-w-[120px]">
                    <p className="text-[9px] font-black text-white/60 uppercase tracking-widest italic mb-1">Target_Age</p>
                    <p className="text-4xl font-black italic text-white tracking-tighter leading-none">{simulatedAge}</p>
                  </div>
                </div>

                <div className="flex justify-center gap-6 pointer-events-auto">
                  <Button size="icon" className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-2xl hover:bg-white/20 transition-all">
                    <Rewind className="h-6 w-6" />
                  </Button>
                  <Button 
                    onClick={togglePlayback}
                    size="xl" 
                    className="h-20 w-20 rounded-full bg-white text-slate-950 shadow-2xl hover:scale-110 active:scale-95 transition-all group/play"
                  >
                    {isPlaying ? <Pause className="h-8 w-8 fill-current" /> : <Play className="h-8 w-8 fill-current translate-x-1" />}
                  </Button>
                  <Button size="icon" className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-2xl hover:bg-white/20 transition-all">
                    <FastForward className="h-6 w-6" />
                  </Button>
                </div>
              </div>
              
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent shadow-glow-pink animate-scan-line pointer-events-none" />
            </div>
          </div>

          {/* Controls sidebar matrix interface */}
          <div className="lg:col-span-4 space-y-12">
            <div className="space-y-8">
              <div className="flex items-center gap-5 ml-4">
                <div className="h-8 w-8 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center">
                  <Settings2 className="h-4 w-4 text-pink-600" />
                </div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">Factor_Calibration</h4>
              </div>
              
              <div className="space-y-4">
                {factors.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFactor(f.id as any)}
                    className={cn(
                      "w-full p-6 rounded-[2rem] border transition-all duration-700 flex items-center gap-6 relative overflow-hidden group/fac",
                      selectedFactor === f.id 
                        ? "bg-white border-pink-200 shadow-premium scale-105 z-10" 
                        : "bg-slate-50 border-slate-100 hover:bg-white hover:border-pink-500/20 shadow-inner"
                    )}
                  >
                    <div className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover/fac:scale-110",
                      selectedFactor === f.id ? "bg-pink-50 border border-pink-100" : "bg-white border border-slate-50"
                    )}>
                      <f.icon className={cn("h-7 w-7", selectedFactor === f.id ? "text-pink-600" : "text-slate-300")} />
                    </div>
                    <div className="text-left flex-1">
                      <p className={cn("text-[10px] font-black uppercase tracking-widest italic transition-colors", selectedFactor === f.id ? "text-pink-600" : "text-slate-400")}>{f.label}</p>
                      <p className="text-xs font-medium text-slate-500 italic mt-1">Impact_Index: 0.82</p>
                    </div>
                    {selectedFactor === f.id && (
                      <motion.div layoutId="active-fac" className="h-2 w-2 rounded-full bg-pink-500 shadow-glow-pink" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-8 pt-10 border-t border-slate-50">
              <div className="flex justify-between items-center px-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Temporal_Shift</p>
                <span className="text-xl font-black text-pink-600 italic tracking-tighter leading-none">{simulatedAge} YEARS</span>
              </div>
              <Slider
                value={[simulatedAge]}
                onValueChange={handleSimulate}
                min={currentAge}
                max={currentAge + 30}
                step={1}
                className="py-4"
              />
              <div className="flex justify-between px-4 text-[9px] font-black text-slate-300 uppercase tracking-widest italic">
                <span>Current: {currentAge}</span>
                <span>Limit: {currentAge + 30}</span>
              </div>
            </div>

            <div className="p-8 rounded-[3rem] bg-slate-50 border border-slate-100 shadow-inner space-y-6 transition-all duration-700 hover:bg-white hover:border-blue-500/20 group/tips">
              <div className="flex items-center gap-4">
                <Eye className="h-5 w-5 text-blue-600 animate-pulse" />
                <p className="text-[10px] font-black text-slate-950 uppercase tracking-widest italic">Simulation_Context</p>
              </div>
              <p className="text-xs text-slate-500 font-medium italic group-hover/tips:text-slate-900 transition-colors leading-relaxed">
                Projected results assume sustained biological adherence to specified treatment nodes over the temporal shift.
              </p>
            </div>

            <Button 
              size="xl" 
              className="w-full h-20 rounded-[2.5rem] bg-slate-950 text-white border-none shadow-2xl transition-all hover:bg-pink-600 active:scale-95 italic font-black text-[11px] uppercase tracking-[0.3em] group/btn relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
              <RotateCcw className="mr-4 h-6 w-6 group-hover:rotate-180 transition-transform duration-700" />
              Reset_Temporal_Nodes
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between opacity-40 hover:opacity-100 transition-opacity duration-700 grayscale hover:grayscale-0">
        <div className="flex items-center gap-6 text-slate-400 group/status cursor-default">
          <ShieldCheck className="h-5 w-5 group-hover:text-emerald-500 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">Projection_Logic_Verified: NOMINAL</p>
        </div>
        <div className="flex items-center gap-6">
          <Badge variant="outline" className="px-6 py-2 rounded-full border-slate-100 text-slate-400 bg-white text-[9px] font-black italic shadow-sm uppercase tracking-widest leading-none">
            T-SIM-v2.1
          </Badge>
          <div className="h-4 w-px bg-slate-200" />
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic leading-none">Engine: QUANTUM_RECURSIVE</p>
        </div>
      </CardFooter>
    </Card>
  )
}
