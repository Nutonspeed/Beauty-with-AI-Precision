"use client"

import { motion } from "framer-motion"
import { MapPin, ShieldCheck, Zap, Globe, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface MarketIntelligenceHeatmapProps {
  isEnterprise: boolean
}

export function MarketIntelligenceHeatmap({ isEnterprise }: MarketIntelligenceHeatmapProps) {
  const t = useTranslations()

  const regions = [
    { id: 'bangkok', name: t('marketIntelligence.regions.bangkok' as any) || 'Metropolis_Core', value: 85, concern: t('marketIntelligence.concerns.hyperpigmentation' as any) || 'Hyperpigmentation', color: 'bg-rose-500' },
    { id: 'central', name: t('marketIntelligence.regions.central' as any) || 'Central_Hub', value: 62, concern: t('marketIntelligence.concerns.acnePores' as any) || 'Acne_&_Pores', color: 'text-blue-600' },
    { id: 'north', name: t('marketIntelligence.regions.north' as any) || 'Northern_Sector', value: 45, concern: t('marketIntelligence.concerns.dryness' as any) || 'Dryness', color: 'text-amber-600' },
    { id: 'south', name: t('marketIntelligence.regions.south' as any) || 'Southern_Vector', value: 38, concern: t('marketIntelligence.concerns.sunDamage' as any) || 'Sun_Damage', color: 'text-emerald-600' },
  ]

  return (
    <Card className={cn(
      "border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/20 flex flex-col min-h-[700px]",
      !isEnterprise && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {!isEnterprise && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm p-12 text-center">
          <Badge className="mb-6 bg-cyan-50 text-cyan-600 border-none font-black uppercase tracking-[0.3em] italic shadow-sm animate-pulse">
            MARKET_INTEL_RESTRICTED
          </Badge>
          <div className="space-y-4 mb-10">
            <h3 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('marketIntelligence.enterpriseBadge' as any) || 'Regional_Heatmap_Analytics'}</h3>
            <p className="text-slate-500 max-w-sm font-medium italic leading-relaxed text-base">
              Unlock global market intelligence and regional concern node mapping across your entire aesthetic network.
            </p>
          </div>
          <Button variant="premium" size="xl" className="h-18 px-12 rounded-[2rem] shadow-2xl shadow-cyan-500/20 uppercase text-[11px] font-black tracking-[0.4em] italic border-none bg-slate-950 text-white hover:scale-105 active:scale-95 transition-all">
            <Zap className="mr-4 h-6 w-6" />
            Authorize_Enterprise_Intel
          </Button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
            <div className="p-4 bg-cyan-50 rounded-2xl border border-cyan-100 shadow-sm group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-700">
              <Globe className="h-8 w-8 text-cyan-600 group-hover:text-white" />
            </div>
            {t('marketIntelligence.title' as any) || 'Market_Intelligence'}
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">
            {t('marketIntelligence.subtitle' as any) || 'Regional aesthetic trend mapping and demographic diagnostics'}
          </CardDescription>
        </div>
        {isEnterprise && (
          <Badge className="bg-emerald-50 text-emerald-600 border-none px-6 py-2 rounded-full text-[10px] font-black italic shadow-sm uppercase tracking-widest animate-pulse">
            LIVE_DEMOGRAPHIC_STREAM
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-10 lg:p-16 space-y-12 bg-white flex-1 relative overflow-hidden">
        <div className="grid lg:grid-cols-12 gap-16 h-full">
          {/* Simulated Map View interface */}
          <div className="lg:col-span-7 relative bg-slate-50 rounded-[3.5rem] border border-slate-100 p-10 aspect-video overflow-hidden group/map shadow-inner">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02] pointer-events-none" />
            
            {/* Visual Heatmap Nodes interface */}
            {regions.map((region, idx) => (
              <motion.div
                key={region.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.2, type: "spring" }}
                className="absolute flex flex-col items-center group/node"
                style={{ 
                  left: `${20 + idx * 20}%`, 
                  top: `${30 + (idx % 2) * 30}%` 
                }}
              >
                <div className="relative">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3] 
                    }}
                    transition={{ repeat: Infinity, duration: 3, delay: idx * 0.5 }}
                    className={cn(
                      "h-16 w-16 rounded-full blur-2xl",
                      region.value > 70 ? "bg-rose-500" : "bg-cyan-500"
                    )} 
                  />
                  <div className={cn(
                    "absolute inset-0 h-5 w-5 rounded-full border-4 border-white shadow-2xl m-auto transition-transform group-hover/node:scale-150 duration-500",
                    region.value > 70 ? "bg-rose-600 shadow-glow-rose/50" : "bg-cyan-600 shadow-glow-blue/50"
                  )} />
                </div>
                <div className="mt-6 px-6 py-3 bg-white/90 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-premium translate-y-2 opacity-0 group-hover/node:opacity-100 group-hover/node:translate-y-0 transition-all duration-500">
                  <p className="text-[10px] font-black text-slate-950 uppercase tracking-widest italic leading-none">{region.name}</p>
                  <p className="text-[11px] font-bold text-slate-500 italic mt-1">{region.concern}</p>
                </div>
              </motion.div>
            ))}

            <div className="absolute bottom-10 right-10 space-y-4 bg-white/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-glow-rose" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{t('marketIntelligence.highIntensity' as any) || 'HIGH_DELTA_REGION'}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-2.5 w-2.5 rounded-full bg-cyan-500 shadow-glow-blue" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{t('marketIntelligence.baselineSignal' as any) || 'STABLE_NODE'}</span>
              </div>
            </div>
          </div>

          {/* Regional Data Grid interface */}
          <div className="lg:col-span-5 space-y-10">
            <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4 italic flex items-center gap-4">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
              {t('marketIntelligence.regionalBuffer' as any) || 'Sector_Trend_Matrix'}
            </h4>
            <div className="space-y-6">
              {regions.map((region, idx) => (
                <motion.div 
                  key={region.id} 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 group/region hover:bg-white hover:border-cyan-500/20 transition-all duration-700 shadow-inner hover:shadow-premium relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-100 group-hover/region:bg-cyan-600 transition-all duration-700" />
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="flex items-center gap-5">
                      <div className="h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/region:scale-110 transition-transform duration-700">
                        <MapPin className="h-6 w-6 text-cyan-600" />
                      </div>
                      <span className="text-xl font-black text-slate-950 italic uppercase tracking-tighter group-hover/region:text-cyan-600 transition-colors leading-none">{region.name}</span>
                    </div>
                    <Badge variant="outline" className="px-4 py-1 rounded-full border-slate-200 bg-white text-slate-400 text-[9px] font-black italic uppercase shadow-sm">{t('marketIntelligence.load' as any || 'LOAD: {val}%').replace('{val}', String(region.value))}</Badge>
                  </div>
                  <div className="flex justify-between items-end relative z-10">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{t('marketIntelligence.primaryConcernNode' as any) || 'DOMINANT_CONCERN'}</p>
                      <p className="text-base font-black text-pink-600 italic uppercase leading-none">{region.concern}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{t('marketIntelligence.growthVector' as any) || 'GROWTH_DELTA'}</p>
                      <div className="flex items-center gap-2 justify-end text-emerald-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xl font-black italic tracking-tighter">+{Math.floor(Math.random() * 15 + 5)}%</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <Button variant="outline" size="xl" className="w-full h-18 rounded-[2rem] border-slate-200 bg-white text-slate-950 font-black uppercase tracking-[0.3em] text-[10px] italic shadow-premium hover:bg-slate-50 transition-all group/btn">
              Export_Strategic_Intel
              <ChevronRight className="ml-3 h-5 w-5 text-slate-300 group-hover/btn:translate-x-1 group-hover/btn:text-cyan-600 transition-all" />
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 py-8 border-t border-slate-50 bg-slate-50/30">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-6 text-slate-400 group/status cursor-default">
            <ShieldCheck className="h-5 w-5 group-hover:text-emerald-500 transition-colors" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">Market_Analysis_Verified: BIP_INTEL_v4.2</p>
          </div>
          <p className="text-[10px] font-black text-cyan-600/60 uppercase tracking-widest italic bg-white px-6 py-2 rounded-full shadow-sm border border-slate-100">Global_Trend_Sync: Nominal</p>
        </div>
      </CardFooter>
    </Card>
  )
}
