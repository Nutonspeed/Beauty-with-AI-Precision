"use client"

import { motion } from "framer-motion"
import { Map, MapPin, Zap, Compass } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

export function RegionalGrowthHeatmap() {
  const t = useTranslations()

  const regions = [
    { name: t('regionalGrowthHeatmap.regions.bangkok'), users: '42.5K', growth: '+18%', penetration: 75, color: 'bg-pink-500' },
    { name: t('regionalGrowthHeatmap.regions.northern'), users: '12.8K', growth: '+24%', penetration: 42, color: 'bg-cyan-500' },
    { name: t('regionalGrowthHeatmap.regions.southern'), users: '8.4K', growth: '+12%', penetration: 35, color: 'bg-emerald-500' },
    { name: t('regionalGrowthHeatmap.regions.eastern'), users: '15.2K', growth: '+15%', penetration: 58, color: 'bg-purple-500' },
  ]

  return (
    <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
      
      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <Map className="h-8 w-8 text-purple-400" />
            {t('regionalGrowthHeatmap.title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('regionalGrowthHeatmap.subtitle')}
          </CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-purple-600 text-white border-none px-4 py-1 text-[9px] font-black tracking-widest uppercase italic">
            {t('ui.hud.regionalExpansionNode')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Mock Heatmap Visualization */}
          <div className="lg:col-span-7 relative">
            <div className="aspect-square w-full bg-white/[0.02] border border-white/5 rounded-[3rem] p-12 flex items-center justify-center relative overflow-hidden group/map">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] bg-center" />
              
              {/* Abstract Map Shape */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full border-2 border-dashed border-white/5 rounded-full relative flex items-center justify-center"
              >
                {/* Simulated Heat Points */}
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="absolute top-[20%] left-[40%] h-32 w-32 bg-pink-500/20 blur-[60px] rounded-full" 
                />
                <motion.div 
                  animate={{ scale: [1, 1.3, 1] }} 
                  transition={{ repeat: Infinity, duration: 5 }}
                  className="absolute bottom-[30%] right-[20%] h-40 w-40 bg-cyan-500/20 blur-[70px] rounded-full" 
                />
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }} 
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="absolute bottom-[10%] left-[30%] h-24 w-24 bg-emerald-500/20 blur-[50px] rounded-full" 
                />

                <Compass className="h-20 w-20 text-white/5 animate-pulse" />
              </motion.div>

              {/* Data Overlays */}
              <div className="absolute top-12 left-12 space-y-1">
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{t('ui.hud.activeTelemetry')}</p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs font-bold text-white italic">{t('ui.hud.nodesOnline', { count: 4 })}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Region Stats Column */}
          <div className="lg:col-span-5 space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{t('ui.hud.regionalMetrics')}</h4>
            <div className="space-y-4">
              {regions.map((region, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all group/region"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center border border-white/5 shadow-inner transition-transform group-hover/region:scale-110", region.color.replace('bg-', 'bg-opacity-20 text-').replace('500', '400'))}>
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5">
                        <h5 className="text-sm font-bold text-white italic">{region.name}</h5>
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{region.users} Users • {region.growth} Growth</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[8px] font-black border-white/5 text-slate-500 italic">
                      {region.penetration}% {t('ui.hud.penetration')}
                    </Badge>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      whileInView={{ width: `${region.penetration}%` }} 
                      className={cn("h-full shadow-[0_0_10px_rgba(255,255,255,0.2)]", region.color)} 
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-6 bg-purple-500/5 border border-purple-500/10 rounded-3xl flex items-center gap-4">
              <Zap className="h-5 w-5 text-purple-400 animate-pulse" />
              <p className="text-[10px] text-slate-500 font-light italic leading-relaxed">
                <span className="text-white font-bold italic">{t('ui.hud.expansionOpportunity')}:</span> {t('ui.hud.expansionSignalDesc', { region: t('regionalGrowthHeatmap.regions.northern') })}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-white/5 bg-white/[0.01]">
        <div className="w-full flex items-center justify-between">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] italic">{t('ui.hud.isoGeoSync')}</p>
          <Button variant="ghost" className="text-[9px] font-black text-purple-400 uppercase tracking-widest italic group">
            {t('ui.hud.globalStrategyHub')}
            <Compass className="ml-2 h-3 w-3 group-hover:rotate-12 transition-transform" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
