"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Brain, Zap, Heart, ShieldCheck, RefreshCw, Copy, MessageSquare, Target, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface NeuralNarrativeSynthesisProps {
  clientData?: {
    name: string
    concerns: string[]
    score: number
  }
}

export function NeuralNarrativeSynthesis({ clientData }: NeuralNarrativeSynthesisProps) {
  const t = useTranslations()
  const [isSynthesizing, setIsSynthesizing] = useState(false)
  const [activeMode, setActiveNode] = useState<'empathy' | 'authority' | 'scarcity'>('authority')
  const [narrative, setNarrative] = useState<string | null>(null)

  const handleSynthesize = () => {
    setIsSynthesizing(true)
    setTimeout(() => {
      setIsSynthesizing(false)
      const mockNarrative = t('neuralNarrative.mock.greeting', { name: clientData?.name || t('neuralNarrative.mock.fallbackName') }) + '\n\n' +
        t('neuralNarrative.mock.intro') + '\n\n' +
        t('neuralNarrative.mock.body', { concerns: clientData?.concerns.join(', ') || t('neuralNarrative.mock.fallbackConcerns') }) + '\n\n' +
        t('neuralNarrative.mock.evidence')
      
      setNarrative(mockNarrative.trim())
      toast.success(t('neuralNarrative.success'))
    }, 2500)
  }

  return (
    <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group h-full flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
      
      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
              <Sparkles className="h-8 w-8 text-pink-400 animate-pulse" />
              {t('neuralNarrative.title')}
            </CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              {t('neuralNarrative.subtitle')}
            </CardDescription>
          </div>
          <Badge className="bg-pink-600 text-white border-none px-4 py-1 text-[9px] font-black tracking-widest uppercase italic">
            NARRATIVE_SYNTH_LIVE
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-10 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{t('neuralNarrative.synthesisMode')}</h4>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'empathy', label: t('neuralNarrative.empathyNode'), icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/10' },
                  { id: 'authority', label: t('neuralNarrative.authorityNode'), icon: ShieldCheck, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                  { id: 'scarcity', label: t('neuralNarrative.scarcityNode'), icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                ].map((node) => (
                  <button
                    key={node.id}
                    onClick={() => setActiveNode(node.id as any)}
                    className={cn(
                      "flex items-center gap-6 p-6 rounded-[2rem] border transition-all duration-500 text-left group/node",
                      activeMode === node.id 
                        ? "bg-white/[0.03] border-white/10 shadow-xl" 
                        : "bg-transparent border-transparent opacity-40 hover:opacity-100 hover:bg-white/[0.01]"
                    )}
                  >
                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner", node.bg, node.color)}>
                      <node.icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-bold text-white uppercase tracking-widest italic">{node.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleSynthesize}
              disabled={isSynthesizing}
              className="w-full h-20 rounded-[2.5rem] bg-pink-600 hover:bg-pink-500 text-white font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-pink-600/20 italic"
            >
              {isSynthesizing ? <RefreshCw className="mr-3 h-5 w-5 animate-spin" /> : <Brain className="mr-3 h-5 w-5" />}
              {t('neuralNarrative.generateNarrative')}
            </Button>
          </div>

          {/* Output Canvas */}
          <div className="lg:col-span-7">
            <div className="h-full min-h-[400px] rounded-[3rem] bg-white/[0.02] border border-white/5 p-10 relative overflow-hidden flex flex-col group/canvas">
              <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-[#020617] to-transparent opacity-40 z-10" />
              
              <AnimatePresence mode="wait">
                {isSynthesizing ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center space-y-6"
                  >
                    <div className="relative">
                      <Sparkles className="h-16 w-16 text-pink-500 animate-pulse" />
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                        className="absolute inset-[-10px] border border-dashed border-pink-500/20 rounded-full"
                      />
                    </div>
                    <p className="text-[10px] font-black text-pink-400 uppercase tracking-[0.4em] italic animate-pulse">{t('neuralNarrative.synthesizing')}</p>
                  </motion.div>
                ) : narrative ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 space-y-8"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[8px] font-black text-slate-500 uppercase tracking-widest border-white/10 italic">Neural_Output_v4.2</Badge>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-slate-300 font-light leading-relaxed italic whitespace-pre-wrap">
                      {narrative}
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-6 opacity-20">
                    <MessageSquare className="h-20 w-20 text-slate-600" />
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] italic">{t('neuralNarrative.awaiting')}</p>
                  </div>
                )}
              </AnimatePresence>

              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#020617] to-transparent opacity-40 z-10" />
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-white/5 bg-white/[0.01]">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-slate-600">
            <Activity className="h-5 w-5" />
            <p className="text-[9px] font-black uppercase tracking-[0.2em] italic">{t('neuralNarrative.nodeInfo')}</p>
          </div>
          <Button 
            disabled={!narrative}
            className="h-14 px-10 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-[#020617] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-cyan-600/20 italic"
          >
            {t('neuralNarrative.copyToProposal')}
            <Target className="ml-3 h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
