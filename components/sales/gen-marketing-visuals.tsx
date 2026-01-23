"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ImageIcon, Sparkles, Send, Download, Layout, Target, Wand2, ShieldCheck, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import Image from "next/image"

interface GenMarketingVisualsProps {
  isEnterprise: boolean
}

export function GenMarketingVisuals({ isEnterprise }: GenMarketingVisualsProps) {
  const t = useTranslations()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setGeneratedImage("https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=1000&auto=format&fit=crop")
      toast.success(t('generativeMarketing.createVisuals' as any) || "Asset Synthesis Successful")
    }, 3000)
  }

  return (
    <Card className={cn(
      "border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/20",
      !isEnterprise && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {!isEnterprise && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm p-10 text-center">
          <Badge className="mb-6 bg-purple-50 text-purple-600 border-none font-black uppercase tracking-widest italic shadow-sm">CREATIVE_AI_RESTRICTED</Badge>
          <div className="space-y-4 mb-8">
            <h3 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('generativeMarketing.title' as any) || 'Autonomous_Creative_Engine'}</h3>
            <p className="text-slate-500 max-w-sm font-medium italic leading-relaxed">
              Unlock the ability to automatically generate professional marketing visuals derived from your node's highest-yield aesthetic outcomes.
            </p>
          </div>
          <Button variant="premium" size="xl" className="h-18 px-12 rounded-[2rem] shadow-2xl shadow-purple-500/20 uppercase text-[11px] font-black tracking-widest italic transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white">
            <Zap className="mr-4 h-6 w-6" />
            Authorize Enterprise Protocol
          </Button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3">
            <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
              <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
                <Wand2 className="h-8 w-8 text-pink-600 group-hover:text-white" />
              </div>
              {t('generativeMarketing.title' as any) || 'Creative_Synthesis_Engine'}
            </CardTitle>
            <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">
              {t('generativeMarketing.subtitle' as any) || 'Autonomous marketing asset generation protocol'}
            </CardDescription>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-widest italic shadow-sm hover:bg-slate-50 transition-all">
              <Layout className="mr-3 h-4 w-4 text-blue-600" />
              {t('generativeMarketing.styleElite' as any) || 'Elite_Schema'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-12 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Creative Canvas interface */}
          <div className="lg:col-span-7 space-y-10">
            <div className={cn(
              "relative aspect-video rounded-[3rem] border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden transition-all duration-1000 shadow-inner",
              generatedImage ? "shadow-premium border-pink-500/10" : ""
            )}>
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.01] bg-center" />
              
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div 
                    key="generating"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center space-y-8 relative z-10"
                  >
                    <div className="relative h-24 w-24 mx-auto flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-pink-50 animate-ping opacity-20" />
                      <Sparkles className="h-12 w-12 text-pink-600 animate-pulse" />
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                        className="absolute inset-[-10px] border-2 border-dashed border-pink-500/20 rounded-full"
                      />
                    </div>
                    <p className="text-[11px] font-black text-pink-600 uppercase tracking-[0.4em] animate-pulse italic">{t('generativeMarketing.synthesizing' as any) || 'SYNTHESIZING_BIOMETRIC_ASSET...'}</p>
                  </motion.div>
                ) : generatedImage ? (
                  <motion.div key="result" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 group/canvas">
                    <Image src={generatedImage} alt="Generated" fill className="object-cover transition-transform duration-[3000ms] group-hover/canvas:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 transition-opacity group-hover/canvas:opacity-40" />
                    <div className="absolute bottom-10 left-10 right-10 space-y-4 relative z-10">
                      <Badge className="bg-pink-600 text-white border-none uppercase text-[9px] font-black tracking-widest italic shadow-lg shadow-pink-600/30">Dermal_Trend: High_Res</Badge>
                      <h4 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">{t('generativeMarketing.protocolTitle' as any) || 'Precision_Aesthetic_Sequence'}</h4>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="awaiting" className="text-center space-y-8 opacity-30">
                    <div className="h-24 w-24 rounded-[2rem] bg-white border border-slate-100 flex items-center justify-center mx-auto shadow-sm">
                      <ImageIcon className="h-12 w-12 text-slate-200" />
                    </div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic">{t('generativeMarketing.awaiting' as any) || 'Awaiting_Neural_Inflow'}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex gap-6">
              <Button 
                size="xl"
                onClick={handleGenerate} 
                disabled={isGenerating || !isEnterprise}
                className="flex-1 h-20 rounded-[2rem] bg-slate-950 hover:bg-pink-600 text-white font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl transition-all hover:scale-105 active:scale-95 italic border-none group/gen relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover/gen:translate-x-[100%] transition-transform duration-1000" />
                {isGenerating ? <Loader2 className="mr-4 h-6 w-6 animate-spin" /> : <Sparkles className="mr-4 h-6 w-6 group-hover/gen:scale-125 transition-transform" />}
                {t('generativeMarketing.createVisuals' as any) || 'Initialize_Synthesis'}
              </Button>
              <Button variant="outline" size="xl" className="h-20 px-10 rounded-[2rem] border-slate-200 bg-white text-slate-950 shadow-sm hover:bg-slate-50 transition-all disabled:opacity-20" disabled={!generatedImage}>
                <Download className="h-6 w-6 text-slate-400" />
              </Button>
            </div>
          </div>

          {/* Ad Copy & Strategy Column interface */}
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4 italic flex items-center gap-4">
                <div className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse" />
                {t('generativeMarketing.draftCopy' as any) || 'Neural_Copy_Sequence'}
              </h4>
              <div className={cn(
                "p-10 rounded-[3rem] border border-slate-100 bg-slate-50/50 min-h-[180px] flex items-center justify-center transition-all duration-1000 shadow-inner group/copy",
                !generatedImage ? "opacity-40" : "bg-white hover:border-pink-500/20 hover:shadow-premium"
              )}>
                {!generatedImage ? (
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic text-center leading-relaxed">Authorize generation to populate<br />copy node parameters</p>
                ) : (
                  <p className="text-lg text-slate-600 italic font-light leading-relaxed tracking-tight">
                    {t('generativeMarketing.copyDesc' as any) || 'Experience the next generation of precision beauty. Our AI-driven protocols synthesize your clinical markers to realize unparalleled aesthetic potential. Initialize your transformation sequence today.'}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4 italic flex items-center gap-4">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                Strategic_Parameters
              </h4>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { label: 'Target Demographic', val: 'Elite_Aesthetic_Segment', icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Predicted Yield', val: '+4.8% CTR', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Integrity Rating', val: 'Verified_Node', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:border-pink-500/20 transition-all duration-500 group/param">
                    <div className="flex items-center gap-5">
                      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center border border-slate-50 shadow-inner group-hover/param:scale-110 transition-transform duration-700", m.bg)}>
                        <m.icon className={cn("h-5 w-5", m.color)} />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic group-hover/param:text-slate-950 transition-colors">{m.label}</span>
                    </div>
                    <span className="text-sm font-black text-slate-950 italic uppercase tracking-tight">{m.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              size="xl"
              variant="premium" 
              className="w-full h-20 rounded-[2.5rem] bg-slate-950 text-white border-none shadow-2xl shadow-slate-900/20 uppercase text-[11px] font-black tracking-[0.4em] italic transition-all hover:scale-105 active:scale-95 group/broadcast" 
              disabled={!generatedImage}
            >
              Broadcast_Sequence
              <Send className="ml-4 h-5 w-5 group-hover/broadcast:translate-x-2 group-hover/broadcast:-translate-y-1 transition-transform" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
