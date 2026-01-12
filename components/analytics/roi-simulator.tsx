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
      "border-slate-200 bg-white rounded-3xl overflow-hidden shadow-xl relative group min-h-[600px] flex flex-col",
      !isEnterprise && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      
      {!isEnterprise && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm p-10 text-center">
          <Badge className="mb-4 bg-blue-600 text-white border-none uppercase tracking-widest font-bold">{t('roiSimulator.lockedBadge')}</Badge>
          <h3 className="text-2xl font-bold text-white mb-4">{t('roiSimulator.title')}</h3>
          <p className="text-slate-300 max-w-sm font-normal mb-8">
            {t('roiSimulator.subtitle')}
          </p>
          <Button className="h-14 px-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white uppercase text-[10px] font-bold tracking-widest transition-all">
            {t('roiSimulator.unlockButton')}
          </Button>
        </div>
      )}

      <CardHeader className="p-8 lg:p-10 pb-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden bg-slate-50/50">
        <div className="space-y-1 relative z-10">
          <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Calculator className="h-6 w-6 text-blue-600" />
            {t('roiSimulator.title')}
          </CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {t('roiSimulator.subtitle')}
          </CardDescription>
        </div>
        <Badge variant="outline" className="px-4 py-1 rounded-full border-blue-200 text-blue-700 bg-blue-50 font-bold tracking-wider text-[9px]">
          {t('roiSimulator.biBadge')}
        </Badge>
      </CardHeader>

      <CardContent className="p-8 lg:p-10 space-y-10 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Input Controls */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t('roiSimulator.inputs.avgMonthlyRevenue')}</h4>
                  <span className="text-lg font-bold text-slate-900">฿{revenue.toLocaleString()}</span>
                </div>
                <Slider value={[revenue]} onValueChange={(v) => setRevenue(v[0])} max={2000000} min={100000} step={50000} />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t('roiSimulator.inputs.leadCount')}</h4>
                  <span className="text-lg font-bold text-slate-900">{leads} {t('roiSimulator.leadsLabel')}</span>
                </div>
                <Slider value={[leads]} onValueChange={(v) => setLeads(v[0])} max={500} min={10} step={10} />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t('roiSimulator.inputs.conversionRate')}</h4>
                  <span className="text-lg font-bold text-slate-900">{conversion}%</span>
                </div>
                <Slider value={[conversion]} onValueChange={(v) => setConversion(v[0])} max={50} min={5} step={1} />
              </div>
            </div>

            <Button 
              onClick={handleCalculate}
              disabled={isCalculating || !isEnterprise}
              className="w-full h-16 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-widest text-xs shadow-lg shadow-blue-600/10"
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
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full space-y-6"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-slate-50 border-slate-100 p-6 rounded-2xl space-y-3">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{t('roiSimulator.projectedRevenue')}</p>
                      <p className="text-2xl font-bold text-blue-600 tracking-tight">฿{Math.round(projectedMonthlyRevenue).toLocaleString()}</p>
                      <Badge className="bg-blue-100 text-blue-700 border-none text-[8px] font-bold">+{t('roiSimulator.monthlyLift', { val: Math.round(monthlyLift).toLocaleString() })}</Badge>
                    </Card>
                    <Card className="bg-slate-50 border-slate-100 p-6 rounded-2xl space-y-3">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{t('roiSimulator.results.roiPercentage')}</p>
                      <p className="text-2xl font-bold text-indigo-600 tracking-tight">{Math.round(roiPercentage)}%</p>
                      <Badge className="bg-indigo-100 text-indigo-700 border-none text-[8px] font-bold">{t('roiSimulator.annualYield')}</Badge>
                    </Card>
                  </div>

                  <div className="p-8 rounded-2xl bg-white border border-slate-200 relative overflow-hidden group/chart shadow-sm">
                    <div className="space-y-6 relative z-10">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-bold text-slate-900 uppercase tracking-widest">{t('roiSimulator.efficiencyAlpha')}</h5>
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('roiSimulator.revenueGrowthNode')}</span>
                          <span className="text-xs font-bold text-blue-600">{t('roiSimulator.lift', { val: Math.round((monthlyLift/revenue)*100) })}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5 }} className="h-full bg-blue-600" />
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                        {t('roiSimulator.aiImpact', { percent: 45 })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl p-10 text-center opacity-60">
                  <BarChart3 className="h-16 w-16 text-slate-300 mb-6" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('roiSimulator.awaitingParams')}</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-8 lg:p-10 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 text-slate-400">
          <Info className="h-4 w-4" />
          <p className="text-[9px] font-bold uppercase tracking-widest">
            {t('roiSimulator.aestheticLogic')} | {t('ui.status.roiActive')}
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
