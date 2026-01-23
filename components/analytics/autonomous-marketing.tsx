"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Megaphone, Target, ArrowRight, Sparkles, Send, Globe, Layout, Zap, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
      toast.success(t('autonomousMarketing.draftCreated' as any) || "Marketing Protocol Generated")
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
      "border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/20 flex flex-col min-h-[700px]",
      !isEnterprise && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {!isEnterprise && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm p-12 text-center">
          <Badge className="mb-6 bg-purple-50 text-purple-600 border-none font-black uppercase tracking-[0.3em] italic shadow-sm animate-pulse">
            MARKETING_AI_RESTRICTED
          </Badge>
          <div className="space-y-4 mb-10">
            <h3 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('autonomousMarketing.title' as any) || 'Autonomous_Growth_Engine'}</h3>
            <p className="text-slate-500 max-w-sm font-medium italic leading-relaxed text-base">
              Unlock autonomous multi-channel marketing synchronization and AI-driven campaign synthesis derived from localized trend nodes.
            </p>
          </div>
          <Button variant="premium" size="xl" className="h-18 px-12 rounded-[2rem] shadow-2xl shadow-purple-500/20 uppercase text-[11px] font-black tracking-[0.4em] italic border-none bg-slate-950 text-white hover:scale-105 active:scale-95 transition-all">
            <Zap className="mr-4 h-6 w-6" />
            Authorize_Marketing_AI
          </Button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
            <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
              <Megaphone className="h-8 w-8 text-pink-600 group-hover:text-white" />
            </div>
            {t('autonomousMarketing.title' as any) || 'Growth_Engine'}
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">
            {t('autonomousMarketing.subtitle' as any) || 'Autonomous trend-based aesthetic marketing synthesis'}
          </CardDescription>
        </div>
        {isEnterprise && (
          <Badge className="bg-pink-600 text-white border-none px-6 py-2 rounded-full text-[10px] font-black italic shadow-lg shadow-pink-600/30 uppercase tracking-widest animate-pulse">
            {t('autonomousMarketing.marketSenseActive' as any) || 'MARKET_SENSE_ACTIVE'}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-10 lg:p-16 space-y-12 bg-white flex-1 relative overflow-hidden">
        {/* Trend Alert Node interface */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 shadow-inner group/alert relative overflow-hidden transition-all duration-700 hover:bg-white hover:border-pink-500/20"
        >
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover/alert:scale-110 group-hover/alert:rotate-12 transition-transform duration-1000">
            <Zap className="w-40 h-40 text-pink-600" />
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
            <div className="flex items-center gap-8">
              <div className="h-20 w-20 rounded-[1.5rem] bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/alert:scale-110 transition-transform duration-700">
                <Zap className="h-10 w-10 text-pink-600 animate-pulse" />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-pink-600 uppercase tracking-[0.3em] italic leading-none">{t('autonomousMarketing.neuralTrendDetection' as any) || 'NEURAL_TREND_SIGNAL'}</p>
                <h4 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">
                  {t('autonomousMarketing.aiInsight' as any || '{trend} interest increased by {percent}% delta.').replace('{trend}', detectedTrend.issue).replace('{percent}', String(detectedTrend.increase))}
                </h4>
                <p className="text-sm text-slate-500 font-medium italic">{t('autonomousMarketing.targetClusterIdentified' as any || 'Cluster node identified in {region} with {count} potential identities.').replace('{region}', detectedTrend.region).replace('{count}', String(detectedTrend.potentialLeads))}</p>
              </div>
            </div>
            {!campaignGenerated && (
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating}
                variant="premium"
                size="xl"
                className="h-18 px-10 rounded-2xl bg-slate-950 text-white border-none font-black uppercase tracking-[0.2em] text-[10px] italic transition-all hover:scale-105 active:scale-95 shadow-2xl relative overflow-hidden group/gen"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/gen:translate-x-[100%] transition-transform duration-1000" />
                {isGenerating ? <RefreshCw className="h-5 w-5 mr-4 animate-spin" /> : <Sparkles className="h-5 w-5 mr-4 group-hover:rotate-12 transition-transform" />}
                {t('autonomousMarketing.generateCampaign' as any) || 'Initialize_Protocol'}
              </Button>
            )}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-16">
          {/* Campaign Strategy interface */}
          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-6">
              <div className="flex items-center gap-5 ml-4">
                <div className="h-8 w-8 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center">
                  <Target className="h-4 w-4 text-pink-600" />
                </div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">{t('autonomousMarketing.suggestedTarget' as any) || 'Strategic_Target_Vector'}</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: t('autonomousMarketing.demographic' as any) || 'Demographic_Segment', val: t('autonomousMarketing.femaleRange' as any) || 'Female, 25-45', sub: (t('autonomousMarketing.highTrendSignal' as any) || 'High signal for {trend}').replace('{trend}', detectedTrend.issue), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: t('autonomousMarketing.interestNode' as any) || 'Behavioral_Cluster', val: t('autonomousMarketing.luxuryInterests' as any) || 'Premium Skincare', sub: t('autonomousMarketing.premiumPath' as any) || 'High-propensity conversion path', icon: Sparkles, color: 'text-pink-600', bg: 'bg-pink-50' },
                ].map((item, i) => (
                  <div key={i} className="p-8 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 shadow-inner group/item hover:bg-white hover:border-pink-500/20 transition-all duration-700">
                    <div className="flex justify-between items-start mb-6">
                      <div className={cn("h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/item:scale-110 transition-transform duration-700", item.color)}>
                        <item.icon className="h-6 w-6" />
                      </div>
                      <Badge variant="outline" className="text-[8px] font-black border-slate-200 bg-white text-slate-400 italic px-3 py-1 rounded-full uppercase">Optimal_Node</Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none group-hover/item:text-slate-950 transition-colors">{item.label}</p>
                      <p className="text-xl font-black text-slate-950 italic uppercase tracking-tight leading-none group-hover/item:text-pink-600 transition-colors">{item.val}</p>
                      <p className="text-[10px] text-slate-500 font-medium italic mt-2 leading-tight">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-5 ml-4">
                <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <Layout className="h-4 w-4 text-blue-600" />
                </div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">{t('autonomousMarketing.campaignDraft' as any) || 'Protocol_Content_Draft'}</h4>
              </div>
              <div className={cn(
                "p-10 rounded-[3rem] border border-slate-100 bg-slate-50/50 relative group/draft min-h-[180px] flex items-center justify-center transition-all duration-1000 shadow-inner",
                !campaignGenerated ? "opacity-40" : "bg-white hover:border-blue-500/20 hover:shadow-premium"
              )}>
                {!campaignGenerated ? (
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic text-center leading-relaxed">Initialize generation sequence to<br />author strategic campaign parameters</p>
                ) : (
                  <div className="space-y-8 relative z-10 w-full">
                    <p className="text-lg text-slate-600 italic font-light leading-relaxed tracking-tight">
                      {t('autonomousMarketing.draftContent' as any || 'Precision aesthetic protocols for {region} nodes. Experience 99.9% accurate dermal synthesis.').replace('{region}', detectedTrend.region)}
                    </p>
                    <div className="flex justify-end pt-4 border-t border-slate-50">
                      <Button variant="ghost" size="sm" className="h-10 px-6 rounded-xl text-[10px] font-black text-pink-600 hover:bg-pink-50 uppercase tracking-widest italic transition-all">
                        {t('autonomousMarketing.editDraftSchema' as any) || 'Refine_Draft_Parameters'}
                        <ChevronRight className="ml-2 h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Performance Column interface */}
          <div className="lg:col-span-5 space-y-10">
            <div className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 shadow-inner space-y-10 group/stats transition-all duration-700 hover:bg-white hover:border-emerald-500/20 hover:shadow-premium">
              <div className="space-y-4">
                <div className="flex justify-between items-end px-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic leading-none">{t('autonomousMarketing.estimatedConversion' as any) || 'Predicted_Conv_Yield'}</p>
                  <p className="text-4xl font-black text-emerald-600 italic tracking-tighter uppercase leading-none">14.2%</p>
                </div>
                <div className="h-3 w-full bg-white rounded-full overflow-hidden border border-slate-100 shadow-sm p-1 relative">
                  <motion.div 
                    initial={{ width: 0 }} 
                    whileInView={{ width: "71%" }} 
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-glow-emerald/30 rounded-full" 
                  />
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-right italic">{t('autonomousMarketing.vsManualCampaigns' as any) || '+4.8% vs Manual Node Authoring'}</p>
              </div>

              <div className="space-y-8">
                <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-4 italic">{t('autonomousMarketing.channelOptimization' as any) || 'Channel_Synchronicity'}</h5>
                <div className="space-y-6">
                  {[
                    { name: 'Instagram Ads', score: 92, icon: Globe, color: 'text-pink-600', bg: 'bg-pink-50' },
                    { name: 'Line Broadcast', score: 85, icon: Send, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { name: 'Facebook Neural', score: 78, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
                  ].map((chan, i) => (
                    <div key={i} className="flex items-center justify-between group/chan">
                      <div className="flex items-center gap-5">
                        <div className={cn("h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/chan:scale-110 transition-transform duration-700", chan.bg)}>
                          <chan.icon className={cn("h-5 w-5", chan.color)} />
                        </div>
                        <span className="text-sm font-black text-slate-950 italic uppercase tracking-tight group-hover/chan:text-pink-600 transition-colors">{chan.name}</span>
                      </div>
                      <Badge variant="outline" className="border-none bg-white text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black italic shadow-sm">{chan.score}% MATCH</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                variant="premium" 
                size="xl" 
                className="w-full h-20 rounded-[2.5rem] bg-slate-950 text-white border-none shadow-2xl hover:bg-pink-600 transition-all font-black text-[11px] uppercase tracking-[0.3em] italic group/btn disabled:opacity-20" 
                disabled={!campaignGenerated}
              >
                {t('autonomousMarketing.deployAutonomousCampaign' as any) || 'Authorize_Global_Deployment'}
                <ArrowRight className="ml-4 h-6 w-6 group-hover/btn:translate-x-2 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
        <div className="flex items-center gap-6 text-slate-400 group/status cursor-default">
          <ShieldCheck className="h-5 w-5 group-hover:text-emerald-500 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">Marketing_Protocol_Integrity: NOMINAL</p>
        </div>
        <p className="text-[10px] font-black text-pink-600/60 uppercase tracking-widest italic bg-white px-6 py-2 rounded-full shadow-sm border border-slate-100">BIP-Marketing-v4.8 // Autonomous_Mode</p>
      </CardFooter>
    </Card>
  )
}
