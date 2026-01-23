"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Dna, 
  Zap, 
  Activity, 
  Target, 
  ShieldCheck, 
  Layers,
  Database,
  Search,
  Cpu,
  RefreshCw,
  Fingerprint
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

interface GeneticMarker {
  id: string
  label: string
  score: number
  impact: 'positive' | 'neutral' | 'negative'
  category: 'structural' | 'pigment' | 'longevity' | 'barrier'
}

interface AestheticGenomeVisualizationProps {
  markers?: GeneticMarker[]
  isLoading?: boolean
}

export function AestheticGenomeVisualization({ 
  markers = [], 
  isLoading = false 
}: AestheticGenomeVisualizationProps) {
  const _t = useTranslations('aestheticGenome')
  const [selectedCategory, setSelectedCategory] = useState<GeneticMarker['category'] | 'all'>('all')

  const filteredMarkers = useMemo(() => {
    if (selectedCategory === 'all') return markers
    return markers.filter(m => m.category === selectedCategory)
  }, [markers, selectedCategory])

  const categories: Array<{ id: GeneticMarker['category'] | 'all', label: string, icon: any }> = [
    { id: 'all', label: 'FULL_GENOME', icon: Dna },
    { id: 'structural', label: 'STRUCTURAL_GRID', icon: Layers },
    { id: 'pigment', label: 'CHROMATIC_MAP', icon: Target },
    { id: 'longevity', label: 'TEMPORAL_DYNAMICS', icon: Activity },
    { id: 'barrier', label: 'DEFENSE_SYNC', icon: ShieldCheck }
  ]

  return (
    <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-1000 hover:border-pink-500/20 flex flex-col min-h-[850px]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] bg-center pointer-events-none" />
      
      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-5">
            <Badge variant="outline" className="px-5 py-1.5 rounded-full border-blue-500/30 text-blue-600 bg-blue-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black italic shadow-sm animate-pulse">
              <Dna className="mr-3 h-3.5 w-3.5" />
              BIO_SYNTH_CORE_v4.8
            </Badge>
          </div>
          <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-700">
              <Fingerprint className="h-8 w-8 text-blue-600 group-hover:text-white" />
            </div>
            Aesthetic_Genome_Viz
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mt-4 italic">
            Deep-layer biological marker synthesis and phenotypic mapping
          </CardDescription>
        </div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="text-right hidden sm:block space-y-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Processing_Node</p>
            <p className="text-lg font-black italic tracking-tighter uppercase leading-none mt-1 text-emerald-600">
              STABLE_UPLINK
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
            <Cpu className="h-6 w-6 text-blue-500 animate-pulse" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-16 space-y-12 bg-white flex-1 relative overflow-hidden flex flex-col">
        {/* Category Filter Matrix interface */}
        <div className="flex flex-wrap gap-4 pb-6 border-b border-slate-50">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              variant="ghost"
              className={cn(
                "h-16 px-8 rounded-2xl transition-all duration-700 font-black text-[10px] uppercase tracking-[0.2em] italic shadow-lg relative overflow-hidden group/cat",
                selectedCategory === cat.id 
                  ? "bg-slate-950 text-white scale-105 shadow-glow-blue/20" 
                  : "bg-slate-50 border border-slate-100 text-slate-400 hover:bg-white hover:border-blue-500/30 hover:text-blue-600"
              )}
            >
              <cat.icon className={cn("mr-4 h-5 w-5", selectedCategory === cat.id ? "text-blue-400" : "text-slate-300")} />
              {cat.label}
            </Button>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-16 flex-1 items-start">
          {/* Main Visualization Viewport interface */}
          <div className="lg:col-span-7 relative group/viz">
            <div className="relative aspect-square rounded-[4rem] bg-slate-950 overflow-hidden border-4 border-white shadow-premium flex items-center justify-center p-12">
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.05] pointer-events-none" />
              
              {/* DNA Double Helix Representation interface */}
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-blue-500/5 blur-[120px] animate-pulse" />
                
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center space-y-8 italic"
                    >
                      <div className="relative h-24 w-24 mx-auto">
                        <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />
                        <RefreshCw className="h-16 w-16 animate-spin mx-auto text-blue-600 relative" />
                      </div>
                      <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white animate-pulse">Sequencing_Phenotypes...</p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="content"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full h-full relative flex items-center justify-center"
                    >
                      {/* Animated Core DNA interface interface */}
                      <div className="relative flex flex-col gap-6 items-center">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ 
                              x: [Math.sin(i) * 40, -Math.sin(i) * 40, Math.sin(i) * 40],
                              scale: [1, 1.2, 1]
                            }}
                            transition={{ 
                              duration: 4, 
                              repeat: Infinity, 
                              delay: i * 0.2,
                              ease: "easeInOut"
                            }}
                            className="flex items-center gap-16"
                          >
                            <div className="h-6 w-6 rounded-full bg-blue-500 shadow-glow-blue border-2 border-white/20" />
                            <div className="h-px w-32 bg-gradient-to-r from-blue-500/50 via-white/20 to-pink-500/50" />
                            <div className="h-6 w-6 rounded-full bg-pink-500 shadow-glow-pink border-2 border-white/20" />
                          </motion.div>
                        ))}
                      </div>

                      {/* Diagnostic Hud Overlays interface interface */}
                      <div className="absolute top-10 left-10 p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 space-y-2">
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest leading-none italic">HEURISTIC_OVERLAY_ACTIVE</p>
                        <p className="text-xs font-black text-white italic tracking-tight">Sync_Node: BIP_STABLE</p>
                      </div>
                      
                      <div className="absolute bottom-10 right-10 p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center gap-4">
                        <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-glow-emerald" />
                        <p className="text-[10px] font-black text-white uppercase tracking-widest italic">Node_Fidelity: 99.4%</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent shadow-glow-blue animate-scan-line pointer-events-none" />
            </div>

            {/* Visual Analytics Hub interface */}
            <div className="mt-10 grid grid-cols-2 gap-8">
              <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 shadow-inner group/stat hover:bg-white hover:border-blue-500/20 transition-all duration-700">
                <div className="flex items-center gap-4 mb-4">
                  <Database className="h-5 w-5 text-blue-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Marker_Volume</span>
                </div>
                <p className="text-4xl font-black italic tracking-tighter text-slate-950 uppercase leading-none">{markers.length} NODE</p>
              </div>
              <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 shadow-inner group/stat hover:bg-white hover:border-pink-500/20 transition-all duration-700">
                <div className="flex items-center gap-4 mb-4">
                  <Activity className="h-5 w-5 text-pink-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Global_Variance</span>
                  <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-black ml-auto">LOW_RISK</Badge>
                </div>
                <p className="text-4xl font-black italic tracking-tighter text-slate-950 uppercase leading-none">1.2% DIFF</p>
              </div>
            </div>
          </div>

          {/* Marker Detail Sidebar matrix interface */}
          <div className="lg:col-span-5 space-y-10">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-5">
                <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <Layers className="h-4 w-4 text-blue-600" />
                </div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">Marker_Heuristics</h4>
              </div>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-all">
                <Search className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-6 max-h-[550px] overflow-y-auto pr-6 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {filteredMarkers.map((marker, i) => (
                  <motion.div
                    key={marker.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="border-slate-100 bg-slate-50/50 hover:bg-white hover:border-blue-500/20 hover:shadow-premium transition-all duration-700 group/marker overflow-hidden rounded-[2.5rem]">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover/marker:scale-110 transition-transform duration-1000">
                        <Zap className="h-16 w-16 text-blue-600" />
                      </div>
                      <CardContent className="p-8 space-y-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <Badge className={cn(
                              "px-3 py-0.5 rounded-full text-[8px] font-black italic uppercase tracking-widest border-none shadow-sm",
                              marker.impact === 'positive' ? 'bg-emerald-50 text-emerald-600' : 
                              marker.impact === 'neutral' ? 'bg-slate-100 text-slate-600' : 'bg-rose-50 text-rose-600'
                            )}>
                              {marker.category}
                            </Badge>
                            <h5 className="text-xl font-black text-slate-950 italic tracking-tight uppercase group-hover/marker:text-blue-600 transition-colors">{marker.label}</h5>
                          </div>
                          <div className="text-right">
                            <span className={cn(
                              "text-3xl font-black italic tracking-tighter leading-none",
                              marker.score >= 80 ? 'text-emerald-600' : marker.score >= 50 ? 'text-blue-600' : 'text-rose-600'
                            )}>
                              {marker.score}%
                            </span>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic mt-2">FIDELITY_SCORE</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 shadow-inner">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${marker.score}%` }}
                              transition={{ duration: 1.5, delay: 0.5 }}
                              className={cn(
                                "h-full rounded-full",
                                marker.score >= 80 ? 'bg-emerald-500 shadow-glow-emerald/30' : 
                                marker.score >= 50 ? 'bg-blue-500 shadow-glow-blue/30' : 'bg-rose-500 shadow-glow-rose/30'
                              )} 
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <Button 
              size="xl" 
              className="w-full h-20 rounded-[2.5rem] bg-slate-950 text-white border-none shadow-2xl transition-all hover:bg-blue-600 active:scale-95 italic font-black text-[11px] uppercase tracking-[0.3em] group/btn relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
              <Zap className="mr-4 h-6 w-6 group-hover:scale-110 transition-transform" />
              Authorize_Full_Deep_Sequence
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between opacity-40 hover:opacity-100 transition-opacity duration-700 grayscale hover:grayscale-0">
        <div className="flex items-center gap-6 text-slate-400 group/status cursor-default">
          <ShieldCheck className="h-5 w-5 group-hover:text-emerald-500 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">Neural_Sequence_Verified: NOMINAL</p>
        </div>
        <div className="flex items-center gap-6">
          <Badge variant="outline" className="px-6 py-2 rounded-full border-slate-100 text-slate-400 bg-white text-[9px] font-black italic shadow-sm uppercase tracking-widest leading-none">
            GENE-OS-v2.4
          </Badge>
          <div className="h-4 w-px bg-slate-200" />
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic leading-none">Deep_Layer_Sync: ENABLED</p>
        </div>
      </CardFooter>
    </Card>
  )
}
