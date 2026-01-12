"use client"

import { useState } from "react"
import { Award, Star, Gift, Zap, CheckCircle2, Trophy, Coins } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface AestheticLoyaltyProps {
  isPremium: boolean
}

export function AestheticLoyalty({ isPremium }: AestheticLoyaltyProps) {
  const t = useTranslations()
  const [points, setPoints] = useState(2450)

  const achievements = [
    { id: 1, title: t('loyaltyRewards.achievements.consistencyKing'), desc: t('loyaltyRewards.achievements.consistencyKingDesc'), points: 100, status: 'completed' },
    { id: 2, title: t('loyaltyRewards.achievements.hydrationMaster'), desc: t('loyaltyRewards.achievements.hydrationMasterDesc'), points: 250, status: 'completed' },
    { id: 3, title: t('loyaltyRewards.achievements.loyalNode'), desc: t('loyaltyRewards.achievements.loyalNodeDesc'), points: 500, status: 'pending' },
  ]

  const rewards = [
    { id: 'r1', name: t('loyaltyRewards.rewards.freeScan'), cost: 500, icon: Zap },
    { id: 'r2', name: t('loyaltyRewards.rewards.discountVoucher'), cost: 1200, icon: Gift },
    { id: 'r3', name: t('loyaltyRewards.rewards.premiumPrint'), cost: 5000, icon: Trophy },
  ]

  const handleRedeem = (name: string, cost: number) => {
    if (points >= cost) {
      setPoints(prev => prev - cost)
      toast.success(t('loyaltyRewards.redeemSuccess'))
    } else {
      toast.error(t('loyaltyRewards.insufficientPoints'))
    }
  }

  return (
    <Card className={cn(
      "border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group animate-neural-pulse",
      !isPremium && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
      
      {!isPremium && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#020617]/60 backdrop-blur-sm p-10 text-center">
          <Badge className="mb-4 bg-amber-500/20 text-amber-400 border-amber-500/30 uppercase tracking-widest">{t('loyaltyRewards.locked')}</Badge>
          <h3 className="text-2xl font-bold text-white italic mb-4">{t('loyaltyRewards.title')}</h3>
          <p className="text-slate-400 max-w-sm font-light mb-8">
            {t('loyaltyRewards.upgradeUnlock')}
          </p>
          <Button variant="premium" className="h-14 px-10 rounded-2xl border shadow-xl shadow-amber-500/20 uppercase text-[10px] font-black tracking-widest italic">
            {t('loyaltyRewards.initRewardNode')}
          </Button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-row items-center justify-between">
        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <Trophy className="h-8 w-8 text-amber-400" />
            {t('loyaltyRewards.title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('loyaltyRewards.subtitle')}
          </CardDescription>
        </div>
        <div className="text-right space-y-1">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{t('loyaltyRewards.pointsBalance')}</p>
          <div className="flex items-center gap-3 justify-end">
            <Coins className="h-5 w-5 text-amber-400" />
            <span className="text-3xl font-black text-white italic tracking-tighter">{points.toLocaleString()}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Achievements Node */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Star className="h-5 w-5 text-amber-500" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-widest text-white italic">{t('loyaltyRewards.recentAchievements')}</h4>
            </div>
            <div className="space-y-4">
              {achievements.map((ach) => (
                <div key={ach.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group/ach hover:bg-white/[0.04] transition-all">
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center border transition-all animate-synaptic-fire",
                      ach.status === 'completed' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/10 text-slate-600"
                    )}>
                      {ach.status === 'completed' ? <CheckCircle2 className="h-6 w-6" /> : <Award className="h-6 w-6" />}
                    </div>
                    <div>
                      <p className="font-bold text-white italic">{ach.title}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-1">{ach.desc}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn(
                    "px-4 py-1 text-[9px] font-black italic border-white/5",
                    ach.status === 'completed' ? "text-emerald-400" : "text-slate-600"
                  )}>
                    +{ach.points} PTS
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Reward Catalog Node */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
                <Gift className="h-5 w-5 text-pink-500" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-widest text-white italic">{t('loyaltyRewards.rewardCatalog')}</h4>
            </div>
            <div className="space-y-4">
              {rewards.map((reward) => (
                <div key={reward.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl group/reward hover:bg-white/[0.04] transition-all relative overflow-hidden">
                  <div className="flex justify-between items-center relative z-10">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white italic">{reward.name}</p>
                      <div className="flex items-center gap-2">
                        <Coins className="h-3 w-3 text-amber-400" />
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">{reward.cost} PTS</span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRedeem(reward.name, reward.cost)}
                      className="rounded-xl bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-pink-600 transition-all"
                    >
                      {t('loyaltyRewards.redeem')}
                    </Button>
                  </div>
                  <reward.icon className="absolute -bottom-2 -right-2 h-16 w-16 text-white/[0.02] group-hover/reward:scale-110 transition-transform duration-700" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-white/5 bg-white/[0.01]">
        <div className="w-full p-8 rounded-[2rem] bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
              <Award className="h-8 w-8 text-amber-400" />
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-black text-amber-400 uppercase tracking-[0.2em]">{t('loyaltyRewards.nextTierProgress')}</p>
              <h4 className="text-xl font-bold text-white italic">{t('loyaltyRewards.pathwayTo', { tier: t('loyaltyRewards.tiers.gold') })}</h4>
              <p className="text-[10px] text-slate-500 font-light">{t('loyaltyRewards.earnMore', { points: '2,550' })}</p>
            </div>
          </div>
          <div className="w-full md:w-64 space-y-3">
            <div className="flex justify-between text-[9px] font-black uppercase text-slate-600 tracking-widest italic">
              <span>{t('loyaltyRewards.current')}</span>
              <span>{t('loyaltyRewards.goldNode')}</span>
            </div>
            <Progress value={49} className="h-1.5 bg-white/5" indicatorClassName="bg-amber-500" />
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
