"use client"

import { useState } from "react"
import { Megaphone, Target, ArrowRight, Sparkles, Send, Globe, Layout, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface AutonomousMarketingProps {
  isEnterprise: boolean
}

export function AutonomousMarketing({ isEnterprise }: AutonomousMarketingProps) {
  const t = useTranslations()
  const [isGenerating, setIsGenerating] = useState(false)
  const [campaignGenerated, setCampaignGenerated] = useState(false)

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setCampaignGenerated(true)
      toast.success(t('autonomousMarketing.draftCreated'))
    }, 2500)
  }

  const detectedTrend = {
    issue: "Hyperpigmentation",
    increase: 24,
    region: "Bangkok Central",
    potentialLeads: 450
  }

  return (
    <Card className={cn(
      "border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group",
      !isEnterprise && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
      
      {!isEnterprise && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#020617]/60 backdrop-blur-sm p-10 text-center">
          <Badge className="mb-4 bg-purple-500/20 text-purple-400 border-purple-500/30">{t('autonomousMarketing.enterpriseGrowthEngine')}</Badge>
          <h3 className="text-2xl font-bold text-white italic mb-4">{t('autonomousMarketing.title')}</h3>
          <p className="text-slate-400 max-w-sm font-light mb-8">
            {t('autonomousMarketing.subtitle')}
          </p>
          <Button variant="premium" className="h-14 px-10 rounded-2xl border shadow-xl shadow-purple-500/20 uppercase text-[10px] font-black tracking-widest italic">
            {t('autonomousMarketing.unlockAutonomousMarketing')}
          </Button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <Megaphone className="h-8 w-8 text-purple-400" />
            {t('autonomousMarketing.title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('autonomousMarketing.subtitle')}
          </CardDescription>
        </div>
        {isEnterprise && (
          <Badge className="bg-purple-600 text-white border-none px-4 py-1 text-[9px] font-black tracking-widest uppercase italic">
            {t('autonomousMarketing.marketSenseActive')}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-12">
        {/* Trend Alert Node */}
        <div className="p-8 rounded-[2.5rem] bg-purple-500/5 border border-purple-500/10 flex items-center justify-between gap-8 group/alert">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-inner group-hover/alert:scale-110 transition-transform duration-500">
              <Zap className="h-8 w-8 text-purple-400" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">{t('autonomousMarketing.neuralTrendDetection')}</p>
              <h4 className="text-xl font-bold text-white italic">
                {t('autonomousMarketing.aiInsight', { trend: detectedTrend.issue, percent: detectedTrend.increase })}
              </h4>
              <p className="text-xs text-slate-500 font-light">{t('autonomousMarketing.targetClusterIdentified', { region: detectedTrend.region, count: detectedTrend.potentialLeads })}</p>
            </div>
          </div>
          {!campaignGenerated && (
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="h-14 px-8 rounded-2xl bg-white text-[#020617] font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-2xl"
            >
              {isGenerating ? <Sparkles className="h-4 w-4 animate-spin" /> : t('autonomousMarketing.generateCampaign')}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Campaign Strategy Node */}
          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                  <Target className="h-5 w-5 text-purple-500" />
                </div>
                <h4 className="text-sm font-black uppercase tracking-widest text-white italic">{t('autonomousMarketing.suggestedTarget')}</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: t('autonomousMarketing.demographic'), val: t('autonomousMarketing.femaleRange'), sub: t('autonomousMarketing.highTrendSignal', { trend: detectedTrend.issue }) },
                  { label: t('autonomousMarketing.interestNode'), val: t('autonomousMarketing.luxuryInterests'), sub: t('autonomousMarketing.premiumPath') },
                ].map((item, i) => (
                  <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-sm font-bold text-white italic">{item.val}</p>
                    <p className="text-[10px] text-slate-500 font-light mt-2">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                  <Layout className="h-5 w-5 text-cyan-500" />
                </div>
                <h4 className="text-sm font-black uppercase tracking-widest text-white italic">{t('autonomousMarketing.campaignDraft')}</h4>
              </div>
              <div className={cn(
                "p-8 rounded-[2rem] border border-white/5 bg-white/[0.02] relative group/draft min-h-[120px] flex items-center justify-center",
                !campaignGenerated && "opacity-20"
              )}>
                {!campaignGenerated ? (
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">{t('autonomousMarketing.initGenSequence')}</p>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-300 italic leading-relaxed">
                      {t('autonomousMarketing.draftContent', { region: detectedTrend.region })}
                    </p>
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm" className="text-[9px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-widest">{t('autonomousMarketing.editDraftSchema')}</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Predictive Performance Column */}
          <div className="lg:col-span-5 space-y-8">
            <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-8">
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic">{t('autonomousMarketing.estimatedConversion')}</p>
                  <p className="text-3xl font-black text-emerald-400 italic tracking-tighter">14.2%</p>
                </div>
                <Progress value={71} className="h-1.5 bg-white/5" indicatorClassName="bg-gradient-to-r from-emerald-500 to-cyan-500" />
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest text-right">{t('autonomousMarketing.vsManualCampaigns')}</p>
              </div>

              <div className="space-y-6">
                <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2 italic">{t('autonomousMarketing.channelOptimization')}</h5>
                <div className="space-y-4">
                  {[
                    { name: 'Instagram Ads', score: 92, icon: Globe },
                    { name: 'Line Broadcast', score: 85, icon: Send },
                    { name: 'Facebook Lookalike', score: 78, icon: Target },
                  ].map((chan, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <chan.icon className="h-4 w-4 text-purple-500" />
                        <span className="text-xs font-bold text-white italic">{chan.name}</span>
                      </div>
                      <Badge variant="outline" className="text-[8px] font-black border-white/10 text-emerald-400">{chan.score}% match</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Button variant="premium" className="w-full h-16 rounded-2xl border shadow-xl shadow-purple-500/20 uppercase text-[10px] font-black tracking-widest italic" disabled={!campaignGenerated}>
                {t('autonomousMarketing.deployAutonomousCampaign')}
                <ArrowRight className="ml-3 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
