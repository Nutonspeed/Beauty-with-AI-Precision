"use client"

import { useState, useRef } from "react"
import { 
  Split,
  ShieldCheck,
  Target,
  Sparkles,
  Activity,
  ArrowLeftRight
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface BeforeAfterSliderProps {
  beforeImage: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
  className?: string
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = "BASELINE",
  afterLabel = "POST_SYNTH",
  className
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    setSliderPosition((x / rect.width) * 100)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    handleMove(e.clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    handleMove(e.touches[0].clientX)
  }

  return (
    <Card className={cn("border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-1000 hover:border-pink-500/20 flex flex-col", className)}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-5">
            <Badge variant="outline" className="px-5 py-1.5 rounded-full border-blue-500/30 text-blue-600 bg-blue-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black italic shadow-sm animate-pulse">
              <Split className="mr-3 h-3.5 w-3.5" />
              DELTA_VISUALIZER_v4.8
            </Badge>
          </div>
          <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-700">
              <ArrowLeftRight className="h-8 w-8 text-blue-600 group-hover:text-white" />
            </div>
            Temporal_Comparison
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mt-4 italic">
            Precision differential analysis of biological outcome vectors
          </CardDescription>
        </div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="text-right hidden sm:block space-y-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Comparison_Node</p>
            <p className="text-lg font-black italic tracking-tighter uppercase leading-none mt-1 text-emerald-600">
              STABLE_SYNC
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
            <Activity className="h-6 w-6 text-blue-500 animate-pulse" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-16 bg-white flex-1 relative overflow-hidden flex flex-col">
        <div 
          ref={containerRef}
          className="relative aspect-video rounded-[3.5rem] overflow-hidden bg-slate-950 border-4 border-white shadow-premium cursor-ew-resize group/viewport select-none"
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={handleMouseMove}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          onTouchMove={handleTouchMove}
        >
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.05] pointer-events-none" />
          
          {/* After Image (Base Layer) interface */}
          <div className="absolute inset-0">
            <Image src={afterImage} alt="After" fill className="object-cover" />
            <div className="absolute bottom-10 right-10 z-20">
              <Badge className="bg-pink-600/80 backdrop-blur-xl text-white border-none px-6 py-2 rounded-full text-[10px] font-black italic shadow-2xl tracking-[0.2em] uppercase leading-none">
                {afterLabel}
              </Badge>
            </div>
          </div>

          {/* Before Image (Clipping Layer) interface */}
          <div 
            className="absolute inset-0 z-10 overflow-hidden" 
            style={{ width: `${sliderPosition}%` }}
          >
            <div className="absolute inset-0 w-[100vw] h-full">
              <Image src={beforeImage} alt="Before" fill className="object-cover" />
            </div>
            <div className="absolute bottom-10 left-10 z-20">
              <Badge className="bg-white/10 backdrop-blur-xl text-white border border-white/20 px-6 py-2 rounded-full text-[10px] font-black italic shadow-2xl tracking-[0.2em] uppercase leading-none">
                {beforeLabel}
              </Badge>
            </div>
          </div>

          {/* Slider Handle interface interface */}
          <div 
            className="absolute top-0 bottom-0 z-30 flex flex-col items-center group-hover/viewport:scale-x-110 transition-transform duration-500"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="w-1 h-full bg-white shadow-glow-blue relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-white border-4 border-white shadow-premium flex items-center justify-center group-hover/viewport:scale-110 transition-transform">
                <div className="flex gap-1.5">
                  <div className="w-1 h-4 bg-slate-200 rounded-full group-hover/viewport:bg-blue-500 transition-colors" />
                  <div className="w-1 h-4 bg-slate-200 rounded-full group-hover/viewport:bg-pink-500 transition-colors" />
                  <div className="w-1 h-4 bg-slate-200 rounded-full group-hover/viewport:bg-blue-500 transition-colors" />
                </div>
              </div>
            </div>
          </div>

          {/* HUD interface interface interface */}
          <div className="absolute inset-0 pointer-events-none z-20 p-10">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-2 rounded-2xl border border-white/10 shadow-xl">
                  <Target className="h-4 w-4 text-blue-400 animate-pulse" />
                  <span className="text-[9px] font-black text-white uppercase tracking-widest italic">Differential_Lock: TRUE</span>
                </div>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl">
                <Sparkles className="h-7 w-7 text-pink-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Hub interface */}
        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {[
            { label: 'Variance_Delta', val: '+12.4%', sub: 'Structural Optimization', icon: Activity, color: 'text-blue-600' },
            { label: 'Luminance_Shift', val: '88.2', sub: 'Spectrum Analysis', icon: Target, color: 'text-pink-600' },
            { label: 'Node_Confidence', val: '99.4%', sub: 'Heuristic Validation', icon: ShieldCheck, color: 'text-emerald-600' }
          ].map((stat, i) => (
            <div key={i} className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 shadow-inner group/stat hover:bg-white hover:border-blue-500/20 transition-all duration-700">
              <div className="flex items-center gap-4 mb-4">
                <stat.icon className={cn("h-5 w-5", stat.color)} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{stat.label}</span>
              </div>
              <p className="text-3xl font-black italic tracking-tighter text-slate-950 uppercase leading-none mb-2">{stat.val}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">{stat.sub}</p>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between opacity-40 hover:opacity-100 transition-opacity duration-700 grayscale hover:grayscale-0">
        <div className="flex items-center gap-6 text-slate-400 group/status cursor-default">
          <ShieldCheck className="h-5 w-5 group-hover:text-emerald-500 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">Delta_Integrity_Verified: NOMINAL</p>
        </div>
        <div className="flex items-center gap-6">
          <Badge variant="outline" className="px-6 py-2 rounded-full border-slate-100 text-slate-400 bg-white text-[9px] font-black italic shadow-sm uppercase tracking-widest leading-none">
            BIP-Delta-v4.8
          </Badge>
          <div className="h-4 w-px bg-slate-200" />
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic leading-none">Engine: VISION_RECURSIVE</p>
        </div>
      </CardFooter>
    </Card>
  )
}
