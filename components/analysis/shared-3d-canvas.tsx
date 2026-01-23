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
  Ruler,
  Maximize2,
  Zap,
  Loader2
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
  const [isSaving, setIsSaving] = useState(false)

  const tools = [
    { id: 'draw', icon: Pencil, label: t('drawTool' as any) || 'Precision_Draw' },
    { id: 'measure', icon: Ruler, label: t('measureTool' as any) || 'Scale_Analysis' },
    { id: 'move', icon: Move, label: t('cameraOrbit' as any) || 'Voxel_Orbit' },
    { id: 'erase', icon: Eraser, label: t('clearCanvas' as any) || 'Reset_Buffer' },
  ]

  const handleSavePlan = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success(t('savePlan' as any) || "Protocol Commitment Authorized")
    }, 2000)
  }

  return (
    <Card className={cn(
      "border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-1000 hover:border-pink-500/20 flex flex-col min-h-[800px]",
      !isPremium && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01] pointer-events-none" />
      
      {!isPremium && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm p-12 text-center">
          <Badge className="mb-6 bg-cyan-50 text-cyan-600 border-none font-black uppercase tracking-[0.3em] italic shadow-sm animate-pulse">
            COLLABORATION_NODE_LOCKED
          </Badge>
          <div className="space-y-4 mb-10">
            <h3 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('title' as any) || 'Collaborative_3D_Canvas'}</h3>
            <p className="text-slate-500 max-w-sm font-medium italic leading-relaxed text-base">
              {t('collaborationDesc' as any) || 'Unlock the high-fidelity 3D annotation node for clinical collaboration and multi-layered dermal mapping.'}
            </p>
          </div>
          <Button variant="premium" size="xl" className="h-18 px-12 rounded-[2rem] shadow-2xl shadow-cyan-500/20 uppercase text-[11px] font-black tracking-[0.4em] italic border-none bg-slate-950 text-white hover:scale-105 active:scale-95 transition-all">
            <Zap className="mr-4 h-6 w-6" />
            {t('initializeCanvas' as any) || 'Authorize_Collab_Node'}
          </Button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-10 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
            <div className="p-4 bg-cyan-50 rounded-2xl border border-cyan-100 shadow-sm group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-700">
              <Layers className="h-8 w-8 text-cyan-600 group-hover:text-white" />
            </div>
            {t('title' as any) || 'Shared_3D_Canvas'}
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">
            {t('subtitle' as any) || 'High-fidelity collaborative dermal mapping and clinical annotation'}
          </CardDescription>
        </div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="flex items-center gap-4 bg-white px-6 py-2.5 rounded-full border border-slate-100 shadow-sm">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-glow-emerald" />
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic">{t('liveSync' as any) || 'LIVE_SYNC_STABLE'}</span>
          </div>
          <div className="flex -space-x-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 w-12 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center shadow-sm relative group/avatar">
                <Users className="h-5 w-5 text-slate-300 group-hover/avatar:text-cyan-600 transition-colors" />
                <div className="absolute inset-0 rounded-full border border-cyan-500/20 opacity-0 group-hover/avatar:opacity-100 animate-ping" />
              </div>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 relative bg-slate-950 overflow-hidden group/viewport">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] bg-center pointer-events-none" />
        
        {/* Collaborative Simulation Area interface */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Mock 3D Model Placeholder interface */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-cyan-500/5 blur-[120px] animate-pulse" />
              <div className="relative h-96 w-96 rounded-full border border-white/5 flex items-center justify-center backdrop-blur-3xl overflow-hidden group/model shadow-2xl">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] bg-center animate-spin-slow" />
                <Users className="h-40 w-40 text-white/5 group-hover/model:text-white/10 transition-all duration-1000 group-hover/model:scale-110" />
                
                {/* Mock Annotation Nodes interface interface */}
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5, delay: 1 }} className="absolute top-[30%] left-[40%] h-6 w-6 rounded-full bg-pink-500/40 border-2 border-white shadow-glow-pink cursor-pointer hover:scale-125 transition-transform" />
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5, duration: 0.5 }} className="absolute bottom-[40%] right-[30%] h-6 w-6 rounded-full bg-cyan-500/40 border-2 border-white shadow-glow-blue cursor-pointer hover:scale-125 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* Float Controls - Left Tools interface interface */}
        <div className="absolute left-10 top-1/2 -translate-y-1/2 flex flex-col gap-6 p-4 rounded-[2.5rem] bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl z-20">
          <TooltipProvider>
            {tools.map(tool => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setActiveTool(tool.id as any)}
                    className={cn(
                      "h-16 w-16 rounded-2xl transition-all duration-700 shadow-lg relative overflow-hidden group/tool",
                      activeTool === tool.id 
                        ? "bg-white text-slate-950 scale-110" 
                        : "text-white/40 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/tool:opacity-100 transition-opacity" />
                    <tool.icon className="h-7 w-7 relative z-10" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-slate-950 border-white/10 text-[10px] font-black uppercase tracking-widest text-white italic rounded-xl px-6 py-2 shadow-2xl">
                  {tool.label}
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>

        {/* Float Controls - Right Layers interface interface */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col gap-6 p-4 rounded-[2.5rem] bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl z-20">
          {(['dermal', 'muscular', 'vascular'] as const).map(layer => (
            <Button
              key={layer}
              variant="ghost"
              size="sm"
              onClick={() => setActiveLayer(layer)}
              className={cn(
                "h-16 px-6 rounded-2xl transition-all duration-700 text-[10px] font-black uppercase tracking-[0.2em] italic shadow-lg relative overflow-hidden group/layer",
                activeLayer === layer 
                  ? "bg-pink-600 text-white scale-110 shadow-glow-pink/30" 
                  : "text-white/40 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/layer:opacity-100 transition-opacity" />
              <span className="relative z-10">{t(`layers.${layer}` as any) || layer.toUpperCase()}</span>
            </Button>
          ))}
        </div>

        {/* Status Badge interface interface */}
        <div className="absolute bottom-10 left-10 p-8 rounded-[2.5rem] bg-slate-950/80 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center gap-6 group/validation hover:border-pink-500/30 transition-all duration-700">
          <div className="h-12 w-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center group-hover/validation:scale-110 transition-transform">
            <ShieldCheck className="h-6 w-6 text-pink-500 animate-pulse" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-white italic leading-none">
              {t('aestheticValidation' as any) || 'VALIDATION_ACTIVE'}
            </p>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Precision_Verified_v4.8</p>
          </div>
        </div>

        {/* Fullscreen control interface interface */}
        <div className="absolute bottom-10 right-10">
          <Button variant="ghost" size="icon" className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all shadow-2xl">
            <Maximize2 className="h-7 w-7" />
          </Button>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-slate-50 bg-slate-50/30 flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="flex items-center gap-8 group/info cursor-default">
          <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/info:bg-blue-50 transition-all">
            <Info className="h-7 w-7 text-blue-600/40 group-hover/info:text-blue-600 transition-colors" />
          </div>
          <p className="text-sm text-slate-500 font-medium italic max-w-sm leading-relaxed group-hover/info:text-slate-950 transition-colors">
            {t('aestheticDescription' as any) || 'Collaborative node sync allows for real-time protocol derivation and dermal voxel annotation across the clinical network.'}
          </p>
        </div>
        <div className="flex gap-6 shrink-0">
          <Button variant="outline" size="xl" className="h-18 px-10 rounded-2xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-[0.2em] text-[10px] italic shadow-sm hover:bg-slate-50 transition-all group/discard">
            <Trash2 className="mr-3 h-4 w-4 text-slate-300 group-hover/discard:text-rose-600 transition-colors" />
            {t('discardSchema' as any) || 'Discard_Sync'}
          </Button>
          <Button 
            size="xl"
            onClick={handleSavePlan}
            disabled={isSaving}
            className="h-18 px-12 rounded-2xl bg-slate-950 text-white border-none shadow-2xl hover:bg-cyan-600 transition-all font-black text-[10px] uppercase tracking-[0.3em] italic group/save relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/save:translate-x-[100%] transition-transform duration-1000" />
            {isSaving ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />}
            {isSaving ? (t('finalizingSync' as any) || 'SYNCHRONIZING...') : (t('authorizePlan' as any) || 'Authorize_Protocol')}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
