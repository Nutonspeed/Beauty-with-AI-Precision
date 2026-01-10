"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, Zap, PieChart, BarChart3, Calculator, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface ROISimulatorProps {
  isEnterprise: boolean
}

export function ROISimulator({ isEnterprise }: ROISimulatorProps) {
  const t = useTranslations()
  const [revenue, setRevenue] = useState(500000)
  const [leads, setLeads] = useState(100)
  const [conversion, setConversion] = useState(20)
  const [isCalculating, setIsCalculating] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // Simulation Logic
  const aiConversionLift = 1.45 // 45% lift in conversion
  const projectedConversion = Math.min(conversion * aiConversionLift, 100)
  const currentMonthlyRevenue = revenue
  const projectedMonthlyRevenue = (revenue / conversion) * projectedConversion
  const monthlyLift = projectedMonthlyRevenue - currentMonthlyRevenue
  const annualLift = monthlyLift * 12
  const roiPercentage = ((annualLift - 480000) / 480000) * 100 // Mock platform cost 480k/yr

  const handleCalculate = () => {
    setIsCalculating(true)
    setTimeout(() => {
      setIsCalculating(false)
      setShowResults(true)
    }, 1500)
  }

  return (
    <Card className={cn(
      "border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group min-h-[700px] flex flex-col",
      !isEnterprise && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
      
      {!isEnterprise && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#020617]/60 backdrop-blur-sm p-10 text-center">
          <Badge className="mb-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 uppercase tracking-widest font-black">{t('roiSimulator.lockedBadge')}</Badge>
          <h3 className="text-2xl font-bold text-white italic mb-4">{t('roiSimulator.title')}</h3>
          <p className="text-slate-400 max-w-sm font-light mb-8">
            {t('roiSimulator.subtitle')}
          </p>
          <Button variant="premium" className="h-14 px-10 rounded-2xl border shadow-xl shadow-emerald-500/20 uppercase text-[10px] font-black tracking-widest italic">
            {t('roiSimulator.unlockButton')}
          </Button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.02] to-transparent animate-neural-pulse pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <CardTitle className="text-3xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <Calculator className="h-8 w-8 text-emerald-400" />
            {t('roiSimulator.title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            {t('roiSimulator.subtitle')}
          </CardDescription>
        </div>
        <Badge variant="outline" className="px-4 py-1 rounded-full border-emerald-500/30 text-emerald-400 bg-emerald-500/5 font-black italic tracking-widest text-[9px]">
          {t('roiSimulator.biBadge')}
        </Badge>
      </CardHeader>

      <CardContent className="p-10 lg:p-12 space-y-12 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Input Controls */}
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{t('roiSimulator.inputs.avgMonthlyRevenue')}</h4>
                  <span className="text-xl font-black text-white italic">฿{revenue.toLocaleString()}</span>
                </div>
                <Slider value={[revenue]} onValueChange={(v) => setRevenue(v[0])} max={2000000} min={100000} step={50000} />
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{t('roiSimulator.inputs.leadCount')}</h4>
                  <span className="text-xl font-black text-white italic">{leads} {t('roiSimulator.leadsLabel')}</span>
                </div>
                <Slider value={[leads]} onValueChange={(v) => setLeads(v[0])} max={500} min={10} step={10} />
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">{t('roiSimulator.inputs.conversionRate')}</h4>
                  <span className="text-xl font-black text-white italic">{conversion}%</span>
                </div>
                <Slider value={[conversion]} onValueChange={(v) => setConversion(v[0])} max={50} min={5} step={1} />
              </div>
            </div>

            <Button 
              onClick={handleCalculate}
              disabled={isCalculating || !isEnterprise}
              className="w-full h-20 rounded-[2.5rem] bg-emerald-600 hover:bg-emerald-500 text-[#020617] font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-emerald-600/20 italic"
            >
              {isCalculating ? <Zap className="h-5 w-5 animate-spin mr-3" /> : <Calculator className="h-5 w-5 mr-3" />}
              {t('roiSimulator.calculateButton')}
            </Button>
          </div>

          {/* Results Visualization */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {showResults ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full space-y-8"
                >
                  <div className="grid grid-cols-2 gap-6">
                    <Card className="bg-white/[0.02] border-white/5 p-8 rounded-[2.5rem] space-y-4">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">{t('roiSimulator.projectedRevenue')}</p>
                      <p className="text-3xl font-black text-emerald-400 italic tracking-tighter">฿{Math.round(projectedMonthlyRevenue).toLocaleString()}</p>
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[8px] font-black italic">+{t('roiSimulator.monthlyLift', { val: Math.round(monthlyLift).toLocaleString() })}</Badge>
                    </Card>
                    <Card className="bg-white/[0.02] border-white/5 p-8 rounded-[2.5rem] space-y-4">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">{t('roiSimulator.results.roiPercentage')}</p>
                      <p className="text-3xl font-black text-cyan-400 italic tracking-tighter">{Math.round(roiPercentage)}%</p>
                      <Badge className="bg-cyan-500/10 text-cyan-400 border-none text-[8px] font-black italic">{t('roiSimulator.annualYield')}</Badge>
                    </Card>
                  </div>

                  <div className="p-10 rounded-[3rem] bg-gradient-to-br from-emerald-600/10 via-transparent to-transparent border border-emerald-500/20 relative overflow-hidden group/chart">
                    <div className="space-y-6 relative z-10">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-black text-white italic uppercase tracking-widest">{t('roiSimulator.efficiencyAlpha')}</h5>
                        <TrendingUp className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('roiSimulator.revenueGrowthNode')}</span>
                          <span className="text-xs font-black text-emerald-400">{t('roiSimulator.lift', { val: Math.round((monthlyLift/revenue)*100) })}</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2 }} className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 font-light italic leading-relaxed">
                        {t('roiSimulator.aiImpact', { percent: 45 })}
                      </p>
                    </div>
                    <PieChart className="absolute bottom-[-20px] right-[-20px] h-48 w-48 text-emerald-500/5 rotate-12" />
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 rounded-[3rem] p-12 text-center opacity-40 grayscale">
                  <BarChart3 className="h-24 w-24 text-slate-600 mb-8" />
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] italic">{t('roiSimulator.awaitingParams')}</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-white/5 bg-white/[0.01]">
        <div className="flex items-center gap-4 text-slate-600">
          <Info className="h-5 w-5" />
          <p className="text-[9px] font-black uppercase tracking-[0.2em] italic">
            {t('roiSimulator.clinicalLogic')} | {t('ui.status.roiActive')}
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
