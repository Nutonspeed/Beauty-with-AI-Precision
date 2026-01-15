"use client"

import { motion } from "framer-motion"
import { Map, MapPin, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface MarketIntelligenceHeatmapProps {
  isEnterprise: boolean
}

export function MarketIntelligenceHeatmap({ isEnterprise }: MarketIntelligenceHeatmapProps) {
  const t = useTranslations()

  const regions = [
    { id: 'bangkok', name: t('marketIntelligence.regions.bangkok'), value: 85, concern: t('marketIntelligence.concerns.hyperpigmentation') },
    { id: 'central', name: t('marketIntelligence.regions.central'), value: 62, concern: t('marketIntelligence.concerns.acnePores') },
    { id: 'north', name: t('marketIntelligence.regions.north'), value: 45, concern: t('marketIntelligence.concerns.dryness') },
    { id: 'south', name: t('marketIntelligence.regions.south'), value: 38, concern: t('marketIntelligence.concerns.sunDamage') },
  ]

  return (
    <Card className={cn(
      "border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group animate-neural-pulse",
      !isEnterprise && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      
      {!isEnterprise && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#020617]/60 backdrop-blur-sm p-10 text-center">
          <div className="h-20 w-20 rounded-3xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-6 shadow-2xl">
            <ShieldCheck className="h-10 w-10 text-pink-500" />
          </div>
          <h3 className="text-2xl font-bold text-white italic mb-4">{t('marketIntelligence.enterpriseBadge')}</h3>
          <p className="text-slate-400 max-w-sm font-light mb-8">
            {t('marketIntelligence.enterpriseUnlockDesc')}
          </p>
          <button className="h-14 px-10 rounded-2xl bg-white text-[#020617] font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all">
            {t('marketIntelligence.upgradePlan')}
          </button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-row items-center justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.02] to-transparent animate-neural-pulse pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <Map className="h-8 w-8 text-cyan-400" />
            {t('marketIntelligence.title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('marketIntelligence.subtitle')}
          </CardDescription>
        </div>
        {isEnterprise && (
          <Badge className="bg-cyan-600 text-white border-none px-4 py-1 text-[9px] font-black tracking-widest uppercase italic">
            {t('marketIntelligence.liveStreamActive')}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Simulated Map View */}
          <div className="lg:col-span-7 relative bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 aspect-video overflow-hidden group/map">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] bg-center" />
            
            {/* Visual Heatmap Nodes */}
            {regions.map((region, idx) => (
              <motion.div
                key={region.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.2 }}
                className="absolute flex flex-col items-center"
                style={{ 
                  left: `${20 + idx * 20}%`, 
                  top: `${30 + (idx % 2) * 30}%` 
                }}
              >
                <div className="relative">
                  <div className={cn(
                    "h-12 w-12 rounded-full blur-xl animate-pulse",
                    region.value > 70 ? "bg-rose-500/40" : "bg-cyan-500/40"
                  )} />
                  <div className={cn(
                    "absolute inset-0 h-4 w-4 rounded-full border-2 border-white/20 m-auto",
                    region.value > 70 ? "bg-rose-500" : "bg-cyan-500"
                  )} />
                </div>
                <div className="mt-4 px-4 py-2 bg-[#020617]/80 backdrop-blur-xl border border-white/10 rounded-xl">
                  <p className="text-[8px] font-black text-white uppercase tracking-widest">{region.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 italic">{region.concern}</p>
                </div>
              </motion.div>
            ))}

            <div className="absolute bottom-8 right-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-rose-500" />
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{t('marketIntelligence.highIntensity')}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-cyan-500" />
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{t('marketIntelligence.baselineSignal')}</span>
              </div>
            </div>
          </div>

          {/* Regional Data Grid */}
          <div className="lg:col-span-5 space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{t('marketIntelligence.regionalBuffer')}</h4>
            <div className="space-y-6">
              {regions.map((region, _idx) => (
                <div key={region.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl group/region hover:bg-white/[0.04] transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                      <MapPin className="h-4 w-4 text-cyan-500" />
                      <span className="text-sm font-bold text-white italic uppercase tracking-tighter">{region.name}</span>
                    </div>
                    <Badge variant="outline" className="text-[8px] font-black tracking-widest border-white/10 text-slate-500">{t('marketIntelligence.load', { val: region.value })}</Badge>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{t('marketIntelligence.primaryConcernNode')}</p>
                      <p className="text-sm font-bold text-pink-500 italic">{region.concern}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{t('marketIntelligence.growthVector')}</p>
                      <p className="text-sm font-black text-emerald-400 italic">+{Math.floor(Math.random() * 15 + 5)}% Δ</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
