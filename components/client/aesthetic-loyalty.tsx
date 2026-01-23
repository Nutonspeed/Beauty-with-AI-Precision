"use client"

import { useState } from "react"
import { Award, Star, Gift, Zap, CheckCircle2, Trophy, Coins, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { motion } from "framer-motion"

interface AestheticLoyaltyProps {
  isPremium: boolean
}

export function AestheticLoyalty({ isPremium }: AestheticLoyaltyProps) {
  const t = useTranslations()
  const [points, setPoints] = useState(2450)

  const achievements = [
    { id: 1, title: t('loyaltyRewards.achievements.consistencyKing' as any) || 'Consistency_Elite', desc: t('loyaltyRewards.achievements.consistencyKingDesc' as any) || '10 consecutive protocol cycles logged.', points: 100, status: 'completed' },
    { id: 2, title: t('loyaltyRewards.achievements.hydrationMaster' as any) || 'Hydration_Alpha', desc: t('loyaltyRewards.achievements.hydrationMasterDesc' as any) || 'Cellular hydration nodes reached 85%', points: 250, status: 'completed' },
    { id: 3, title: t('loyaltyRewards.achievements.loyalNode' as any) || 'Entity_Stability', desc: t('loyaltyRewards.achievements.loyalNodeDesc' as any) || 'Maintain node registry for 1 temporal year', points: 500, status: 'pending' },
  ]

  const rewards = [
    { id: 'r1', name: t('loyaltyRewards.rewards.freeScan' as any) || 'Neural_Sync_Credit', cost: 500, icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'r2', name: t('loyaltyRewards.rewards.discountVoucher' as any) || 'Yield_Optimization_Node', cost: 1200, icon: Gift, color: 'text-pink-600', bg: 'bg-pink-50' },
    { id: 'r3', name: t('loyaltyRewards.rewards.premiumPrint' as any) || 'Biometric_Asset_Portfolio', cost: 5000, icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  const handleRedeem = (name: string, cost: number) => {
    if (points >= cost) {
      setPoints(prev => prev - cost)
      toast.success(t('loyaltyRewards.redeemSuccess' as any) || 'Reward Node Synchronized')
    } else {
      toast.error(t('loyaltyRewards.insufficientPoints' as any) || 'Insufficient Inflow for Redemption')
    }
  }

  return (
    <Card className={cn(
      "border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-amber-500/20 flex flex-col",
      !isPremium && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {!isPremium && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm p-12 text-center">
          <Badge className="mb-6 bg-amber-50 text-amber-600 border-none font-black uppercase tracking-[0.3em] italic shadow-sm animate-pulse">
            LOYALTY_MATRIX_LOCKED
          </Badge>
          <h3 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none mb-6">{t('loyaltyRewards.locked' as any) || 'Reward_Restriction'}</h3>
          <p className="text-slate-500 max-w-sm font-medium italic leading-relaxed mb-10 text-base">
            Upgrade to Premium to synchronize with our elite reward ecosystem and earn biological yield credits.
          </p>
          <Button variant="premium" size="xl" className="h-18 px-12 rounded-[2rem] shadow-2xl shadow-amber-500/20 uppercase text-[11px] font-black tracking-[0.4em] italic border-none bg-slate-950 text-white hover:scale-105 active:scale-95 transition-all">
            {t('loyaltyRewards.initRewardNode' as any) || 'Authorize_Loyalty_Uplink'}
          </Button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
          <div className="space-y-3">
            <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 shadow-sm group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-700">
                <Trophy className="h-8 w-8 text-amber-600 group-hover:text-white" />
              </div>
              {t('loyaltyRewards.title' as any) || 'Yield_Loyalty_Matrix'}
            </CardTitle>
            <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">
              {t('loyaltyRewards.subtitle' as any) || 'Earn biometric sync credits through protocol adherence'}
            </CardDescription>
          </div>
          <div className="text-right space-y-2 bg-white px-8 py-4 rounded-[2rem] border border-slate-100 shadow-inner group-hover:border-amber-100 transition-all duration-700">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">{t('loyaltyRewards.pointsBalance' as any) || 'CURRENT_CREDIT_INFLOW'}</p>
            <div className="flex items-center gap-4 justify-end leading-none">
              <Coins className="h-6 w-6 text-amber-500 animate-pulse" />
              <span className="text-4xl font-black text-slate-950 italic tracking-tighter uppercase">{points.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-16 space-y-12 bg-white">
        <div className="grid lg:grid-cols-12 gap-16">
          {/* Achievements interface */}
          <div className="lg:col-span-7 space-y-10">
            <div className="flex items-center gap-5 ml-4">
              <div className="h-8 w-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
                <Star className="h-4 w-4 text-amber-600" />
              </div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">{t('loyaltyRewards.recentAchievements' as any) || 'Identity_Achievements'}</h4>
            </div>
            <div className="space-y-6">
              {achievements.map((ach, idx) => (
                <motion.div 
                  key={ach.id} 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    "p-8 rounded-[2.5rem] border transition-all duration-500 flex items-center justify-between group/ach relative overflow-hidden",
                    ach.status === 'completed' 
                      ? "bg-slate-50/50 border-slate-100 shadow-inner" 
                      : "bg-white border-slate-100 hover:border-amber-500/20 shadow-sm"
                  )}
                >
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 opacity-20" className={ach.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-200'} />
                  <div className="flex items-center gap-8 relative z-10">
                    <div className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center border transition-all duration-700 group-hover/ach:scale-110",
                      ach.status === 'completed' ? "bg-white text-emerald-600 border-emerald-100 shadow-sm" : "bg-slate-50 text-slate-300 border-slate-100 shadow-inner"
                    )}>
                      {ach.status === 'completed' ? <CheckCircle2 className="h-7 w-7" /> : <Activity className="h-7 w-7" />}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xl font-black text-slate-950 italic group-hover/ach:text-amber-600 transition-colors uppercase tracking-tight leading-none">{ach.title}</p>
                      <p className="text-[10px] text-slate-400 font-medium italic group-hover/ach:text-slate-600 transition-colors uppercase tracking-widest">{ach.desc}</p>
                    </div>
                  </div>
                  <Badge className={cn(
                    "px-5 py-1.5 rounded-full text-[10px] font-black italic border-none shadow-sm uppercase tracking-widest",
                    ach.status === 'completed' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                  )}>
                    +{ach.points} PTS
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Catalog interface */}
          <div className="lg:col-span-5 space-y-10">
            <div className="flex items-center gap-5 ml-4">
              <div className="h-8 w-8 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center">
                <Gift className="h-4 w-4 text-pink-600" />
              </div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">{t('loyaltyRewards.rewardCatalog' as any) || 'Credit_Redemption_Nodes'}</h4>
            </div>
            <div className="grid gap-6">
              {rewards.map((reward, idx) => (
                <motion.div 
                  key={reward.id} 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-8 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 group/reward hover:bg-white hover:border-pink-500/20 transition-all duration-700 relative overflow-hidden shadow-inner hover:shadow-premium"
                >
                  <div className="flex justify-between items-center relative z-10">
                    <div className="space-y-2">
                      <p className="text-lg font-black text-slate-950 italic group-hover/reward:text-pink-600 transition-colors uppercase tracking-tight leading-none">{reward.name}</p>
                      <div className="flex items-center gap-3">
                        <Coins className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{reward.cost} SYNC_CREDITS</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleRedeem(reward.name, reward.cost)}
                      className="rounded-xl border-slate-200 bg-white text-[9px] font-black uppercase tracking-widest italic text-slate-400 hover:text-pink-600 hover:border-pink-100 transition-all shadow-sm h-10 px-6"
                    >
                      {t('loyaltyRewards.redeem' as any) || 'INITIALIZE'}
                    </Button>
                  </div>
                  <reward.icon className="absolute -bottom-4 -right-4 h-24 w-24 text-slate-950/[0.02] group-hover/reward:scale-110 group-hover/reward:rotate-12 transition-transform duration-1000" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-slate-50 bg-slate-50/30">
        <div className="w-full p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-premium flex flex-col md:flex-row items-center justify-between gap-12 group/tier relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent opacity-0 group-hover/tier:opacity-100 transition-opacity" />
          <div className="flex items-center gap-10 relative z-10">
            <div className="h-20 w-20 rounded-[1.5rem] bg-amber-50 border border-amber-100 flex items-center justify-center shadow-inner group-hover/tier:scale-110 group-hover/tier:bg-white transition-all duration-700">
              <Award className="h-10 w-10 text-amber-600" />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em] italic leading-none">{t('loyaltyRewards.nextTierProgress' as any) || 'Tier_Synchronisation_Delta'}</p>
              <h4 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('loyaltyRewards.pathwayTo' as any || 'Pathway_to_{tier}').replace('{tier}', 'GOLD_NODE')}</h4>
              <p className="text-[11px] text-slate-400 font-medium italic">{t('loyaltyRewards.earnMore' as any || 'Authorize {points} more syncs to unlock global yield.').replace('{points}', '2,550')}</p>
            </div>
          </div>
          <div className="w-full md:w-80 space-y-4 relative z-10">
            <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest italic group-hover/tier:text-slate-950 transition-colors">
              <span>BRONZE_UPLINK</span>
              <span className="text-amber-600">GOLD_ACCESS</span>
            </div>
            <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner p-0.5">
              <motion.div 
                initial={{ width: 0 }} 
                whileInView={{ width: "49%" }} 
                transition={{ duration: 2, ease: "easeOut" }}
                className="h-full bg-amber-500 shadow-glow-amber/30 rounded-full" 
              />
            </div>
            <p className="text-[9px] font-black text-center text-slate-300 uppercase tracking-widest italic opacity-0 group-hover/tier:opacity-100 transition-opacity">49% Sync_Progress</p>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
