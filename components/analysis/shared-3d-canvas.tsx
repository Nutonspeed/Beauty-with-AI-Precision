"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Pencil, 
  Eraser, 
  Move, 
  Layers, 
  Trash2, 
  Users, 
  ShieldCheck, 
  Info,
  Ruler
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Shared3DCanvasProps {
  isPremium: boolean
}

export function Shared3DCanvas({ isPremium }: Shared3DCanvasProps) {
  const t = useTranslations('shared3DCanvas');
  const [activeTool, setActiveTool] = useState<'draw' | 'measure' | 'move' | 'erase'>('draw')
  const [activeLayer, setActiveLayer] = useState<'dermal' | 'muscular' | 'vascular'>('dermal')
  const [isSaving, setIsGenerating] = useState(false)

  const tools = [
    { id: 'draw', icon: Pencil, label: t('drawTool') },
    { id: 'measure', icon: Ruler, label: t('measureTool') },
    { id: 'move', icon: Move, label: t('cameraOrbit') },
    { id: 'erase', icon: Eraser, label: t('clearCanvas') },
  ]

  const handleSavePlan = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      toast.success(t('savePlan'))
    }, 2000)
  }

  return (
    <Card className={cn(
      "border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col min-h-[700px]",
      !isPremium && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      
      {!isPremium && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#020617]/60 backdrop-blur-sm p-10 text-center">
          <Badge className="mb-4 bg-cyan-500/20 text-cyan-400 border-cyan-500/30 uppercase tracking-widest font-black">{t('proCollaborationNode')}</Badge>
          <h3 className="text-2xl font-bold text-white italic mb-4">{t('title')}</h3>
          <p className="text-slate-400 max-w-sm font-light mb-8">
            {t('collaborationDesc')}
          </p>
          <Button variant="premium" className="h-14 px-10 rounded-2xl border shadow-xl shadow-cyan-500/20 uppercase text-[10px] font-black tracking-widest italic">
            {t('initializeCanvas')}
          </Button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <Layers className="h-8 w-8 text-cyan-400" />
            {t('title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('subtitle')}
          </CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest italic">{t('liveSync')}</span>
          </div>
          <div className="flex -space-x-3">
            {[1, 2].map(i => (
              <div key={i} className="h-10 w-10 rounded-full border-2 border-[#020617] bg-slate-800 flex items-center justify-center">
                <Users className="h-4 w-4 text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 relative bg-black/20 overflow-hidden">
        {/* Collaborative Simulation Area */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full max-w-2xl aspect-square flex items-center justify-center">
            {/* Mock 3D Model Placeholder */}
            <div className="relative w-64 h-64 md:w-96 md:h-96">
              <div className="absolute inset-0 rounded-full bg-slate-800/20 blur-[100px] animate-glow-pulse" />
              <div className="relative w-full h-full rounded-full border border-white/5 flex items-center justify-center backdrop-blur-3xl overflow-hidden group/model">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] bg-center" />
                <Users className="h-32 w-32 text-white/5 group-hover/model:text-white/10 transition-colors" />
                
                {/* Mock Annotation Nodes */}
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }} className="absolute top-[30%] left-[40%] h-4 w-4 rounded-full bg-pink-500/40 border border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)] cursor-pointer" />
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, duration: 0.3 }} className="absolute bottom-[40%] right-[30%] h-4 w-4 rounded-full bg-cyan-500/40 border border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)] cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

        {/* Float Controls - Left Tools */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 p-3 rounded-[2rem] bg-[#020617]/80 backdrop-blur-3xl border border-white/5 shadow-2xl z-10">
          <TooltipProvider>
            {tools.map(tool => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setActiveTool(tool.id as any)}
                    className={cn(
                      "h-14 w-14 rounded-2xl transition-all duration-500",
                      activeTool === tool.id 
                        ? "bg-cyan-600 text-[#020617] shadow-xl shadow-cyan-600/20" 
                        : "text-slate-500 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <tool.icon className="h-6 w-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-[#020617] border-white/10 text-[9px] font-black uppercase tracking-widest text-white italic rounded-xl px-4 py-2">
                  {tool.label}
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>

        {/* Float Controls - Right Layers */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 p-3 rounded-[2rem] bg-[#020617]/80 backdrop-blur-3xl border border-white/5 shadow-2xl z-10">
          {(['dermal', 'muscular', 'vascular'] as const).map(layer => (
            <Button
              key={layer}
              variant="ghost"
              size="sm"
              onClick={() => setActiveLayer(layer)}
              className={cn(
                "h-14 px-4 rounded-2xl transition-all duration-500 text-[9px] font-black uppercase tracking-[0.2em] italic",
                activeLayer === layer 
                  ? "bg-pink-600 text-white shadow-xl shadow-pink-600/20" 
                  : "text-slate-500 hover:bg-white/5 hover:text-white"
              )}
            >
              {t(`layers.${layer}`)}
            </Button>
          ))}
        </div>

        {/* Status Badge */}
        <div className="absolute bottom-8 left-8 p-6 rounded-2xl bg-[#020617]/80 backdrop-blur-3xl border border-white/5 shadow-2xl flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-pink-500" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
            {t('clinicalValidation')}
          </p>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-white/5 bg-white/[0.01] flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Info className="h-5 w-5 text-slate-500" />
          </div>
          <p className="text-[11px] text-slate-500 font-light italic max-w-sm">{t('clinicalDescription')}</p>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" className="h-16 px-8 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-rose-500 transition-all italic">
            <Trash2 className="mr-3 h-4 w-4" />
            {t('discardSchema')}
          </Button>
          <Button 
            onClick={handleSavePlan}
            disabled={isSaving}
            className="h-16 px-10 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-[#020617] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-cyan-600/20 italic"
          >
            {isSaving ? t('finalizingSync') : t('authorizePlan')}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
