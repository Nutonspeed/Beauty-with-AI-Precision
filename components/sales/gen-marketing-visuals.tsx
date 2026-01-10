"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ImageIcon, Sparkles, Send, Download, Layout, Target, RefreshCw, Wand2, ShieldCheck, TrendingUp } from "lucide-react"
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
      toast.success(t('generativeMarketing.createVisuals') + " Success")
    }, 3000)
  }

  return (
    <Card className={cn(
      "border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group",
      !isEnterprise && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
      
      {!isEnterprise && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#020617]/60 backdrop-blur-sm p-10 text-center">
          <Badge className="mb-4 bg-purple-500/20 text-purple-400 border-purple-500/30 font-black uppercase tracking-widest">CREATIVE_AI_LOCKED</Badge>
          <h3 className="text-2xl font-bold text-white italic mb-4">{t('generativeMarketing.title')}</h3>
          <p className="text-slate-400 max-w-sm font-light mb-8">
            Automatically generate professional marketing visuals and ad copies derived from your clinic's most successful clinical outcomes.
          </p>
          <Button variant="premium" className="h-14 px-10 rounded-2xl border shadow-xl shadow-purple-500/20 uppercase text-[10px] font-black tracking-widest italic">
            Unlock Generative Creative
          </Button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <Wand2 className="h-8 w-8 text-purple-400" />
            {t('generativeMarketing.title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('generativeMarketing.subtitle')}
          </CardDescription>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-12 px-6 rounded-xl border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest italic hover:bg-white/10">
            <Layout className="mr-2 h-4 w-4" />
            {t('generativeMarketing.styleElite')}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Creative Canvas */}
          <div className="lg:col-span-7 space-y-8">
            <div className={cn(
              "relative aspect-video rounded-[2.5rem] border border-white/5 bg-white/[0.02] flex items-center justify-center overflow-hidden transition-all duration-1000",
              generatedImage ? "shadow-[0_0_50px_rgba(168,85,247,0.1)]" : ""
            )}>
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] bg-center" />
              
              {isGenerating ? (
                <div className="text-center space-y-6 relative z-10">
                  <div className="relative h-20 w-20 mx-auto">
                    <Sparkles className="h-20 w-20 text-purple-500 animate-pulse" />
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                      className="absolute inset-0 border-2 border-dashed border-purple-500/30 rounded-full"
                    />
                  </div>
                  <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] animate-pulse italic">{t('generativeMarketing.synthesizing')}</p>
                </div>
              ) : generatedImage ? (
                <motion.div initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0">
                  <Image src={generatedImage} alt="Generated" fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-10 left-10 right-10 space-y-2">
                    <Badge className="bg-pink-600 text-white border-none uppercase text-[8px] font-black tracking-widest italic">{t('generativeMarketing.resultBadge', { trend: 'Hyperpigmentation' })}</Badge>
                    <h4 className="text-2xl font-black text-white italic tracking-tight">{t('generativeMarketing.protocolTitle')}</h4>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center space-y-6 opacity-30">
                  <ImageIcon className="h-20 w-20 mx-auto text-slate-600" />
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] italic">{t('generativeMarketing.awaiting')}</p>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !isEnterprise}
                className="flex-1 h-16 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-purple-600/20 italic"
              >
                {isGenerating ? <RefreshCw className="mr-3 h-4 w-4 animate-spin" /> : <Sparkles className="mr-3 h-4 w-4" />}
                {t('generativeMarketing.createVisuals')}
              </Button>
              <Button variant="outline" className="h-16 px-8 rounded-2xl border-white/10 bg-white/5" disabled={!generatedImage}>
                <Download className="h-5 w-5 text-slate-400" />
              </Button>
            </div>
          </div>

          {/* Ad Copy & Strategy Column */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{t('generativeMarketing.draftCopy')}</h4>
              <div className={cn(
                "p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] min-h-[150px] flex items-center justify-center transition-opacity duration-700",
                !generatedImage && "opacity-20"
              )}>
                {!generatedImage ? (
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic text-center italic">{t('generativeMarketing.initDesc')}</p>
                ) : (
                  <p className="text-sm text-slate-300 italic leading-relaxed">
                    {t('generativeMarketing.copyDesc')}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{t('missionControl.activeNodes')}</h4>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { label: t('generativeMarketing.params.targetDemographic'), val: t('generativeMarketing.params.targetVal'), icon: Target },
                  { label: t('generativeMarketing.params.predictedCtr'), val: '4.8%', icon: TrendingUp },
                  { label: t('generativeMarketing.params.dataIntegrity'), val: t('generativeMarketing.params.verifiedCases'), icon: ShieldCheck },
                ].map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <m.icon className="h-4 w-4 text-purple-500" />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{m.label}</span>
                    </div>
                    <span className="text-xs font-bold text-white italic">{m.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button variant="premium" className="w-full h-16 rounded-2xl border shadow-xl shadow-purple-500/20 uppercase text-[10px] font-black tracking-widest italic" disabled={!generatedImage}>
              {t('generativeMarketing.autoPost')}
              <Send className="ml-3 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
