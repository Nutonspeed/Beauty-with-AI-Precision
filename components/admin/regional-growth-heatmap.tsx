"use client"

import { motion } from "framer-motion"
import { Map, MapPin, Zap, Compass } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

export function RegionalGrowthHeatmap() {
  const t = useTranslations('home.salesWizard')

  const regions = [
    { name: t('regionalGrowthHeatmap.regions.bangkok'), users: '42.5K', growth: '+18%', penetration: 75, color: 'bg-pink-500' },
    { name: t('regionalGrowthHeatmap.regions.northern'), users: '12.8K', growth: '+24%', penetration: 42, color: 'bg-cyan-500' },
    { name: t('regionalGrowthHeatmap.regions.southern'), users: '8.4K', growth: '+12%', penetration: 35, color: 'bg-emerald-500' },
    { name: t('regionalGrowthHeatmap.regions.eastern'), users: '15.2K', growth: '+15%', penetration: 58, color: 'bg-purple-500' },
  ]

  return (
    <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] overflow-hidden relative group">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/10 to-transparent" />
      
      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <CardTitle className="text-3xl font-black text-slate-950 tracking-tight italic flex items-center gap-5 uppercase leading-none">
            <div className="p-3 bg-purple-50 rounded-2xl shadow-sm group-hover:bg-purple-500 group-hover:text-white transition-all duration-700">
              <Map className="h-8 w-8 text-purple-600 group-hover:text-white" />
            </div>
            {t('regionalGrowthHeatmap.title')}
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">
            {t('regionalGrowthHeatmap.subtitle')}
          </CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-purple-50 text-purple-600 border-none px-5 py-1.5 text-[10px] font-black tracking-widest uppercase italic shadow-sm">
            {t('ui.hud.regionalExpansionNode')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-12 bg-slate-50/30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Mock Heatmap Visualization */}
          <div className="lg:col-span-7 relative">
            <div className="aspect-square w-full bg-white border border-slate-100 rounded-[3rem] p-12 flex items-center justify-center relative overflow-hidden group/map shadow-inner">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.01] bg-center" />
              
              {/* Abstract Map Shape */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full border-2 border-dashed border-slate-100 rounded-full relative flex items-center justify-center"
              >
                {/* Simulated Heat Points */}
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="absolute top-[20%] left-[40%] h-32 w-32 bg-pink-500/10 blur-[60px] rounded-full" 
                />
                <motion.div 
                  animate={{ scale: [1, 1.3, 1] }} 
                  transition={{ repeat: Infinity, duration: 5 }}
                  className="absolute bottom-[30%] right-[20%] h-40 w-40 bg-blue-500/10 blur-[70px] rounded-full" 
                />
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }} 
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="absolute bottom-[10%] left-[30%] h-24 w-24 bg-emerald-500/10 blur-[50px] rounded-full" 
                />

                <Compass className="h-20 w-20 text-slate-100 animate-pulse" />
              </motion.div>

              {/* Data Overlays */}
              <div className="absolute top-12 left-12 space-y-1.5 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-100 shadow-premium">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">{t('ui.hud.activeTelemetry')}</p>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-glow-emerald" />
                  <p className="text-sm font-black text-slate-950 italic uppercase">{t('ui.hud.nodesOnline', { count: 4 })}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Region Stats Column */}
          <div className="lg:col-span-5 space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none">{t('ui.hud.regionalMetrics')}</h4>
            <div className="space-y-6">
              {regions.map((region, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:border-purple-500/20 transition-all duration-700 group/region shadow-sm hover:shadow-premium"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-6">
                      <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner transition-transform group-hover/region:scale-110 duration-700", region.color.replace('500', '50').replace('bg-', 'bg-').replace('text-', 'bg-').replace('blue', 'pink'))}>
                        <MapPin className={cn("h-7 w-7", region.color.replace('bg-', 'text-'))} />
                      </div>
                      <div className="space-y-1">
                        <h5 className="text-xl font-black text-slate-950 italic uppercase leading-none group-hover:text-purple-600 transition-colors">{region.name}</h5>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{region.users} Users • {region.growth} Growth</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-black border-none bg-slate-50 text-slate-400 italic px-4 py-1.5 rounded-full shadow-sm">
                      {region.penetration}% {t('ui.hud.penetration')}
                    </Badge>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }} 
                      whileInView={{ width: `${region.penetration}%` }} 
                      transition={{ duration: 1.5, delay: i * 0.1 }}
                      className={cn("h-full shadow-glow-purple/20 rounded-full", region.color)} 
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-10 rounded-[3rem] bg-gradient-to-br from-purple-50 to-white border border-purple-100 flex items-center gap-6 group shadow-premium overflow-hidden relative">
              <Zap className="h-10 w-10 text-purple-600 animate-pulse relative z-10" />
              <p className="text-[13px] text-slate-500 font-light italic leading-relaxed relative z-10 tracking-tight">
                <span className="text-slate-950 font-black italic uppercase">{t('ui.hud.expansionOpportunity')}:</span> {t('ui.hud.expansionSignalDesc', { region: t('regionalGrowthHeatmap.regions.northern') })}
              </p>
              <Compass className="absolute bottom-[-30px] right-[-30px] h-32 w-32 text-purple-500/5 rotate-12 transition-transform duration-[2000ms] group-hover:rotate-90" />
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-slate-50 bg-white">
        <div className="w-full flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">{t('ui.hud.isoGeoSync')}</p>
          <Button variant="ghost" className="text-[10px] font-black text-purple-600 uppercase tracking-widest italic group hover:bg-purple-50 rounded-2xl px-6 py-3 transition-all">
            {t('ui.hud.globalStrategyHub')}
            <Compass className="ml-3 h-4 w-4 group-hover:rotate-12 transition-transform" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
