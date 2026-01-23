/**
 * Live AR Preview Component
 * Component for displaying AR live preview with controls
 */

'use client'

import React, { useState } from 'react'
import { useLiveARPreview } from '@/hooks/useLiveARPreview'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import type { AREffectConfig } from '@/lib/ar/live-preview-manager'
import { 
  Camera, 
  CameraOff, 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  Monitor, 
  ChevronRight,
  Layers,
  Info,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LiveARPreviewProps {
  className?: string
  onCapture?: (imageData: string) => void
  defaultEffects?: AREffectConfig[]
}

export function LiveARPreview({ className = '', onCapture, defaultEffects = [] }: LiveARPreviewProps) {
  const {
    isActive,
    isInitializing,
    error,
    fps,
    faceDetected,
    startPreview,
    stopPreview,
    addEffect,
    removeEffect,
    clearEffects,
    updateEffectIntensity,
    captureFrame,
    videoRef,
    canvasRef
  } = useLiveARPreview()

  const [selectedEffect, setSelectedEffect] = useState<AREffectConfig['type'] | null>(null)
  const [effectIntensity, setEffectIntensity] = useState(0.5)

  const handleStart = async () => {
    try {
      await startPreview({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'user',
          frameRate: { ideal: 30, max: 60 }
        },
        enableFaceTracking: true,
        enableAREffects: true,
        targetFPS: 30,
        quality: 'high'
      })

      // Apply default effects
      defaultEffects.forEach(effect => addEffect(effect))
    } catch (err) {
      console.error('Failed to start preview:', err)
    }
  }

  const handleStop = () => {
    stopPreview()
    clearEffects()
    setSelectedEffect(null)
  }

  const handleEffectToggle = (type: AREffectConfig['type']) => {
    if (selectedEffect === type) {
      removeEffect(type)
      setSelectedEffect(null)
    } else {
      if (selectedEffect) {
        removeEffect(selectedEffect)
      }
      addEffect({
        type,
        intensity: effectIntensity,
        targetAreas: type === 'botox' ? ['forehead'] : type === 'filler' ? ['cheeks'] : ['full']
      })
      setSelectedEffect(type)
    }
  }

  const handleIntensityChange = (value: number[]) => {
    const newIntensity = value[0]
    setEffectIntensity(newIntensity)
    
    if (selectedEffect) {
      updateEffectIntensity(selectedEffect, newIntensity)
    }
  }

  const handleCapture = () => {
    const imageData = captureFrame()
    if (imageData && onCapture) {
      onCapture(imageData)
    }
  }

  const effects: Array<{ type: AREffectConfig['type']; label: string; icon: string; color: string; bg: string }> = [
    { type: 'smoothing', label: 'Dermal_Smooth', icon: '✨', color: 'text-pink-600', bg: 'bg-pink-50' },
    { type: 'whitening', label: 'Spectrum_Bright', icon: '💎', color: 'text-blue-600', bg: 'bg-blue-50' },
    { type: 'botox', label: 'Neural_Relax', icon: '💉', color: 'text-purple-600', bg: 'bg-purple-50' },
    { type: 'filler', label: 'Volume_Node', icon: '💧', color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { type: 'laser', label: 'Radiance_Flux', icon: '⚡', color: 'text-amber-600', bg: 'bg-amber-50' },
    { type: 'peel', label: 'Cellular_Reset', icon: '🌟', color: 'text-emerald-600', bg: 'bg-emerald-50' }
  ]

  return (
    <Card className={cn("border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-1000 hover:border-pink-500/20 flex flex-col min-h-[850px]", className)}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
            <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
              <Sparkles className="h-8 w-8 text-pink-600 group-hover:text-white" />
            </div>
            Live_AR_Synthesis
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">
            Precision biological outcome simulation across spectral vectors
          </CardDescription>
        </div>
        <div className="flex items-center gap-6 relative z-10 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-right hidden sm:block space-y-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Stream_Status</p>
            <p className={cn("text-lg font-black italic tracking-tighter uppercase leading-none mt-1", isActive ? 'text-emerald-600' : 'text-slate-300')}>
              {isActive ? 'NOMINAL_SYNC' : 'NODE_OFFLINE'}
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner">
            <Activity className={cn("h-6 w-6 transition-colors", isActive ? 'text-emerald-500 animate-pulse' : 'text-slate-300')} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-16 space-y-12 bg-white flex-1 relative overflow-hidden flex flex-col">
        <div className="grid lg:grid-cols-12 gap-16 flex-1">
          {/* Main interface viewport interface */}
          <div className="lg:col-span-8 relative group/viewport">
            <div className="relative aspect-video rounded-[3.5rem] overflow-hidden bg-slate-950 border-4 border-white shadow-premium group/canvas">
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.05] pointer-events-none" />
              
              {/* Hidden video node interface */}
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover opacity-0"
                playsInline
                muted
              />
              
              {/* Neural Canvas interface */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover z-10 opacity-90 transition-opacity duration-1000 group-hover/viewport:opacity-100"
              />

              {/* HUD interface interface */}
              <AnimatePresence>
                {isActive && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 pointer-events-none p-10"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-4">
                        <div className="flex gap-3">
                          <Badge className="bg-rose-600 text-white border-none px-6 py-2 rounded-full text-[10px] font-black italic shadow-2xl tracking-[0.2em] uppercase leading-none animate-pulse">
                            🔴 LIVE_SYNC
                          </Badge>
                          <Badge className="bg-white/10 backdrop-blur-md text-white border-none px-6 py-2 rounded-full text-[10px] font-black italic shadow-2xl tracking-[0.2em] uppercase leading-none">
                            {fps} FPS
                          </Badge>
                        </div>
                        {faceDetected && (
                          <div className="flex items-center gap-4 bg-emerald-500/20 backdrop-blur-md px-5 py-2 rounded-2xl border border-emerald-500/30 shadow-xl">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 animate-pulse" />
                            <span className="text-[9px] font-black text-white uppercase tracking-widest italic">Identity_Voxel_Lock: TRUE</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl">
                        <Target className="h-7 w-7 text-blue-400" />
                      </div>
                    </div>

                    <div className="absolute bottom-10 right-10 pointer-events-auto">
                      <Button
                        onClick={handleCapture}
                        size="xl"
                        className="h-20 w-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all group/cap"
                      >
                        <Camera className="h-8 w-8 group-hover:text-pink-500 transition-colors" />
                      </Button>
                    </div>
                    
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent shadow-glow-pink animate-scan-line" />
                  </motion.div>
                )}
              </AnimatePresence>

              {!isActive && !isInitializing && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm z-30">
                  <div className="text-center space-y-8 italic group/init">
                    <div className="relative mx-auto h-24 w-24">
                      <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full" />
                      <Monitor className="h-20 w-20 text-slate-400 relative z-10 mx-auto opacity-40 group-hover/init:opacity-100 group-hover/init:text-pink-600 transition-all duration-700" />
                    </div>
                    <div className="space-y-4">
                      <p className="text-2xl font-black text-white uppercase tracking-tighter leading-none">Simulation_Standby</p>
                      <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">Initialize imaging node to Authorize Live Sync</p>
                    </div>
                  </div>
                </div>
              )}

              {isInitializing && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-xl z-30">
                  <div className="text-center space-y-8 italic">
                    <div className="relative h-20 w-20 mx-auto">
                      <div className="absolute inset-0 bg-pink-500/20 blur-2xl rounded-full animate-pulse" />
                      <RefreshCw className="h-14 w-14 animate-spin mx-auto text-pink-600 relative" />
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white animate-pulse">Initializing_Synthesis_Stream...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="absolute bottom-10 left-10 right-10 z-40">
                  <div className="bg-rose-600/90 backdrop-blur-xl text-white px-8 py-4 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-6">
                    <XCircle className="h-6 w-6 shrink-0" />
                    <p className="text-xs font-black uppercase tracking-widest italic leading-relaxed">{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Simulation interaction interface interface */}
            <div className="mt-10">
              <AnimatePresence>
                {!isActive ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                    <Button
                      onClick={handleStart}
                      disabled={isInitializing}
                      size="xl"
                      className="w-full h-20 rounded-[2.5rem] bg-slate-950 text-white border-none font-black uppercase tracking-[0.3em] text-xs italic shadow-2xl transition-all hover:bg-pink-600 active:scale-95 group/start relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/start:translate-x-[100%] transition-transform duration-1000" />
                      <Monitor className="mr-4 h-6 w-6 group-hover/start:scale-110 transition-transform" />
                      {isInitializing ? 'AUTHORIZING_UPLINK...' : 'Authorize_Live_Simulation'}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                    <Button
                      onClick={handleStop}
                      variant="outline"
                      size="xl"
                      className="w-full h-20 rounded-[2.5rem] border-slate-200 bg-white text-rose-600 font-black uppercase tracking-[0.3em] text-[11px] italic shadow-premium hover:bg-rose-50 hover:border-rose-200 transition-all active:scale-95 group/stop"
                    >
                      <CameraOff className="mr-4 h-6 w-6 group-hover/stop:scale-110 transition-transform" />
                      Terminate_Live_Sync
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Effects interface Column interface */}
          <div className="lg:col-span-4 space-y-10">
            <AnimatePresence mode="wait">
              {isActive ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-10"
                >
                  <div className="space-y-6">
                    <div className="flex items-center gap-5 ml-4">
                      <div className="h-8 w-8 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center">
                        <Layers className="h-4 w-4 text-pink-600" />
                      </div>
                      <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">Protocol_Sync_Nodes</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {effects.map(effect => (
                        <button
                          key={effect.type}
                          onClick={() => handleEffectToggle(effect.type)}
                          className={cn(
                            "p-6 rounded-[2rem] border transition-all duration-700 flex flex-col items-center gap-4 relative overflow-hidden group/eff",
                            selectedEffect === effect.type 
                              ? "bg-white border-pink-200 shadow-premium scale-105 z-10" 
                              : "bg-slate-50 border-slate-100 hover:bg-white hover:border-pink-500/20 shadow-inner"
                          )}
                        >
                          <div className={cn(
                            "h-14 w-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-transform group-hover/eff:scale-110",
                            selectedEffect === effect.type ? "bg-pink-50 border border-pink-100" : "bg-white border border-slate-50"
                          )}>
                            {effect.icon}
                          </div>
                          <span className={cn("text-[9px] font-black uppercase tracking-widest italic transition-colors text-center", selectedEffect === effect.type ? "text-pink-600" : "text-slate-400")}>{effect.label}</span>
                          {selectedEffect === effect.type && (
                            <motion.div layoutId="active-eff" className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-pink-500 shadow-glow-pink" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <AnimatePresence>
                    {selectedEffect && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-6 pt-10 border-t border-slate-50"
                      >
                        <div className="flex justify-between items-center px-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Protocol_Intensity</p>
                          <span className="text-xl font-black text-pink-600 italic tracking-tighter leading-none">{Math.round(effectIntensity * 100)}% FLUX</span>
                        </div>
                        <Slider
                          value={[effectIntensity]}
                          onValueChange={handleIntensityChange}
                          min={0}
                          max={1}
                          step={0.01}
                          className="py-4"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="p-8 rounded-[3rem] bg-slate-50 border border-slate-100 shadow-inner space-y-6 transition-all duration-700 hover:bg-white hover:border-blue-500/20 group/tips">
                    <div className="flex items-center gap-4">
                      <Info className="h-5 w-5 text-blue-600 animate-pulse" />
                      <p className="text-[10px] font-black text-slate-950 uppercase tracking-widest italic">Simulation_Heuristics</p>
                    </div>
                    <ul className="space-y-3">
                      {[
                        'Select protocol node for real-time synthesis',
                        'Calibrate intensity for recursive optimization',
                        'Authorize capture to commit diagnostic node'
                      ].map((tip, i) => (
                        <li key={i} className="flex items-center gap-4 text-xs text-slate-500 font-medium italic group-hover/tips:text-slate-900 transition-colors">
                          <ChevronRight className="h-3 w-3 text-pink-500 shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-50/50 rounded-[4rem] border border-slate-100 shadow-inner italic grayscale group-hover:grayscale-0 transition-all duration-1000"
                >
                  <div className="relative h-32 w-32 mx-auto mb-8">
                    <div className="absolute inset-0 bg-blue-500/5 blur-[60px] rounded-full" />
                    <div className="h-32 w-32 rounded-[2.5rem] bg-white border border-slate-100 flex items-center justify-center shadow-sm relative z-10">
                      <Layers className="h-16 w-16 text-slate-200" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-2xl font-black text-slate-950 uppercase tracking-tighter leading-none">Protocols_Ready</p>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Select active nodes after authorizing stream</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
            BIP-Live-v4.8
          </Badge>
          <div className="h-4 w-px bg-slate-200" />
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic leading-none">Synthesis_Engine: ACTIVE</p>
        </div>
      </CardFooter>
    </Card>
  )
}

function Circle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
}

export default LiveARPreview
