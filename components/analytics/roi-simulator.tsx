"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, Zap, BarChart3, Calculator, Info, Activity, ShieldCheck, Target, DollarSign, RefreshCw } from "lucide-react"
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
      "border-slate-100 bg-white/40 backdrop-blur-3xl shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-1000 hover:border-pink-500/30 flex flex-col min-h-[700px]",
      !isEnterprise && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {!isEnterprise && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm p-12 text-center">
          <Badge className="mb-6 bg-pink-50 text-pink-600 border-none font-black uppercase tracking-[0.3em] italic shadow-sm animate-pulse">
            ROI_ANALYSIS_LOCKED
          </Badge>
          <div className="space-y-4 mb-10">
            <h3 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('roiSimulator.title' as any) || 'Economic_Yield_Simulator'}</h3>
            <p className="text-slate-500 max-w-sm font-medium italic leading-relaxed text-base">
              Unlock the ability to simulate financial outcomes and project annual yield acceleration through BIP-Standard clinical protocols.
            </p>
          </div>
          <Button variant="premium" size="xl" className="h-18 px-12 rounded-[2rem] shadow-2xl shadow-pink-500/20 uppercase text-[11px] font-black tracking-[0.4em] italic border-none bg-slate-950 text-white hover:scale-105 active:scale-95 transition-all">
            <Zap className="mr-4 h-6 w-6" />
            {t('roiSimulator.unlockButton' as any) || 'Authorize_Economic_AI'}
          </Button>
        </div>
      )}

      <CardHeader className="p-10 lg:p-14 pb-10 border-b border-white/20 bg-white/40 flex flex-col md:flex-row md:items-center justify-between gap-10 relative overflow-hidden">
        <div className="space-y-4 relative z-10">
          <CardTitle className="text-4xl font-black text-slate-950 italic tracking-tighter flex items-center gap-8 uppercase leading-none">
            <div className="p-5 bg-white rounded-2xl border border-white shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-1000">
              <Calculator className="h-10 w-10 text-pink-600" />
            </div>
            {t('roiSimulator.title' as any) || 'ROI_Simulator'}
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mt-4 italic">
            {t('roiSimulator.subtitle' as any) || 'Predictive financial yield and conversion acceleration modeling'}
          </CardDescription>
        </div>
        <Badge variant="outline" className="px-8 py-2.5 rounded-full border-pink-500/30 text-pink-600 bg-white/80 font-black italic tracking-[0.2em] text-[10px] uppercase shadow-xl animate-pulse relative z-10">
          {t('roiSimulator.biBadge' as any) || 'BUSINESS_INTEL_v5.0'}
        </Badge>
      </CardHeader>

      <CardContent className="p-10 lg:p-16 space-y-12 bg-transparent flex-1 relative overflow-hidden">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-24 h-full">
          {/* Input Controls interface */}
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-12">
              <div className="space-y-8 p-10 rounded-[3rem] bg-white/40 backdrop-blur-xl border border-white/60 shadow-inner group/input transition-all duration-700 hover:bg-white/60">
                <div className="flex justify-between items-end px-2">
                  <div className="flex items-center gap-5">
                    <div className="h-10 w-10 rounded-xl bg-white border border-white flex items-center justify-center shadow-lg group-hover/input:scale-110 group-hover:rotate-6 transition-all duration-700">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                    </div>
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover/input:text-slate-950 transition-colors">{t('roiSimulator.inputs.avgMonthlyRevenue' as any) || 'Monthly_Inflow_Baseline'}</h4>
                  </div>
                  <motion.span 
                    key={revenue}
                    initial={{ scale: 1.1, color: '#ec4899' }}
                    animate={{ scale: 1, color: '#0f172a' }}
                    className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase"
                  >
                    ฿{revenue.toLocaleString()}
                  </motion.span>
                </div>
                <Slider value={[revenue]} onValueChange={(v) => setRevenue(v[0])} max={2000000} min={100000} step={50000} className="py-4" />
              </div>

              <div className="space-y-8 p-10 rounded-[3rem] bg-white/40 backdrop-blur-xl border border-white/60 shadow-inner group/input transition-all duration-700 hover:bg-white/60">
                <div className="flex justify-between items-end px-2">
                  <div className="flex items-center gap-5">
                    <div className="h-10 w-10 rounded-xl bg-white border border-white flex items-center justify-center shadow-lg group-hover/input:scale-110 group-hover:rotate-6 transition-all duration-700">
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover/input:text-slate-950 transition-colors">{t('roiSimulator.inputs.leadCount' as any) || 'Identity_Node_Load'}</h4>
                  </div>
                  <motion.span 
                    key={leads}
                    initial={{ scale: 1.1, color: '#3b82f6' }}
                    animate={{ scale: 1, color: '#0f172a' }}
                    className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase"
                  >
                    {leads} <span className="text-[10px] text-slate-300 ml-1">NODES</span>
                  </motion.span>
                </div>
                <Slider value={[leads]} onValueChange={(v) => setLeads(v[0])} max={500} min={10} step={10} className="py-4" />
              </div>

              <div className="space-y-8 p-10 rounded-[3rem] bg-white/40 backdrop-blur-xl border border-white/60 shadow-inner group/input transition-all duration-700 hover:bg-white/60">
                <div className="flex justify-between items-end px-2">
                  <div className="flex items-center gap-5">
                    <div className="h-10 w-10 rounded-xl bg-white border border-white flex items-center justify-center shadow-lg group-hover/input:scale-110 group-hover:rotate-6 transition-all duration-700">
                      <TrendingUp className="h-5 w-5 text-pink-600" />
                    </div>
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover/input:text-slate-950 transition-colors">{t('roiSimulator.inputs.conversionRate' as any) || 'Cycle_Conversion_Efficiency'}</h4>
                  </div>
                  <motion.span 
                    key={conversion}
                    initial={{ scale: 1.1, color: '#ec4899' }}
                    animate={{ scale: 1, color: '#0f172a' }}
                    className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase"
                  >
                    {conversion}%
                  </motion.span>
                </div>
                <Slider value={[conversion]} onValueChange={(v) => setConversion(v[0])} max={50} min={5} step={1} className="py-4" />
              </div>
            </div>

            <Button 
              size="xl"
              onClick={handleCalculate}
              disabled={isCalculating || !isEnterprise}
              className="w-full h-24 rounded-[3rem] bg-slate-950 hover:bg-pink-600 text-white font-black uppercase tracking-[0.5em] text-[10px] shadow-2xl transition-all hover:scale-105 active:scale-95 italic border-none group/calc relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/calc:translate-x-[100%] transition-transform duration-1000" />
              {isCalculating ? <RefreshCw className="mr-6 h-8 w-8 animate-spin" /> : <Zap className="mr-6 h-8 w-8 animate-pulse" />}
              {t('roiSimulator.calculateButton' as any) || 'Initialize_Calculation'}
            </Button>
          </div>

          {/* Results Visualization interface */}
          <div className="lg:col-span-7 relative h-full">
            <AnimatePresence mode="wait">
              {showResults ? (
                <motion.div 
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  className="h-full space-y-12"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <Card className="bg-white/60 backdrop-blur-xl border border-white/80 p-12 rounded-[3.5rem] space-y-6 shadow-premium group/res transition-all duration-1000 hover:bg-white hover:border-pink-500/30">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none group-hover/res:text-pink-600 transition-colors">{t('roiSimulator.projectedRevenue' as any) || 'OPTIMIZED_MONTHLY_INFLOW'}</p>
                      <div className="space-y-6">
                        <motion.p 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-5xl font-black text-slate-950 tracking-tighter italic uppercase leading-none"
                        >
                          ฿{Math.round(projectedMonthlyRevenue).toLocaleString()}
                        </motion.p>
                        <Badge className="bg-emerald-500 text-white border-none text-[11px] font-black uppercase italic shadow-lg shadow-emerald-500/20 px-6 py-2 rounded-full leading-none animate-bounce">
                          +{t('roiSimulator.monthlyLift' as any || '฿{val} Delta').replace('{val}', Math.round(monthlyLift).toLocaleString())}
                        </Badge>
                      </div>
                    </Card>
                    <Card className="bg-white/60 backdrop-blur-xl border border-white/80 p-12 rounded-[3.5rem] space-y-6 shadow-premium group/res transition-all duration-1000 hover:bg-white hover:border-blue-500/30">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none group-hover/res:text-blue-600 transition-colors">{t('roiSimulator.results.roiPercentage' as any) || 'PROJECTED_ANNUAL_YIELD'}</p>
                      <div className="space-y-6">
                        <motion.p 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="text-5xl font-black text-slate-950 tracking-tighter italic uppercase leading-none"
                        >
                          {Math.round(roiPercentage)}%
                        </motion.p>
                        <Badge className="bg-blue-600 text-white border-none text-[11px] font-black uppercase italic shadow-lg shadow-blue-500/20 px-6 py-2 rounded-full leading-none animate-pulse">{t('roiSimulator.annualYield' as any) || 'ROI_COEFFICIENT'}</Badge>
                      </div>
                    </Card>
                  </div>

                  <div className="p-12 rounded-[4rem] bg-white/60 backdrop-blur-3xl border border-white relative overflow-hidden group/chart shadow-premium hover:border-pink-500/40 transition-all duration-1000">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02] pointer-events-none" />
                    <div className="space-y-12 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-xl group-hover/chart:scale-110 group-hover:rotate-6 transition-all duration-1000">
                            <Activity className="h-6 w-6 text-pink-600" />
                          </div>
                          <h5 className="text-[12px] font-black text-slate-950 uppercase tracking-[0.5em] italic">{t('roiSimulator.efficiencyAlpha' as any) || 'Efficiency_Alpha_Vector'}</h5>
                        </div>
                        <TrendingUp className="h-8 w-8 text-emerald-500 animate-pulse" />
                      </div>
                      
                      <div className="space-y-8">
                        <div className="flex justify-between items-end px-2">
                          <span className="text-[12px] text-slate-400 font-black uppercase tracking-[0.3em] italic">{t('roiSimulator.revenueGrowthNode' as any) || 'Growth_Probability_Node'}</span>
                          <span className="text-3xl font-black text-pink-600 italic tracking-tighter uppercase leading-none">{t('roiSimulator.lift' as any || '+{val}%').replace('{val}', String(Math.round((monthlyLift/revenue)*100)))} YIELD_LIFT</span>
                        </div>
                        <div className="h-4 w-full bg-white/50 rounded-full overflow-hidden border border-white shadow-inner p-1 relative">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: '100%' }} 
                            transition={{ duration: 2.5, ease: "circOut" }} 
                            className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 shadow-glow-pink/40 relative overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] animate-shimmer" />
                          </motion.div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-8 bg-white/40 backdrop-blur-md p-8 rounded-3xl border border-white/60 shadow-inner group/tip">
                        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 group-hover/tip:scale-110 transition-transform">
                          <Info className="h-6 w-6 text-blue-500" />
                        </div>
                        <p className="text-[14px] text-slate-500 font-medium italic leading-relaxed tracking-tight">
                          {t('roiSimulator.aiImpact' as any || 'AI-precision protocols provide a persistent {percent}% lift in high-fidelity node conversions.').replace('{percent}', '45')}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-white/40 backdrop-blur-xl border border-white rounded-[4rem] p-24 text-center space-y-12 italic shadow-premium group/wait transition-all duration-1000 hover:bg-white/60 hover:border-pink-100">
                  <div className="relative h-40 w-40 mx-auto">
                    <div className="absolute -inset-8 bg-gradient-to-br from-pink-500/10 to-blue-600/10 blur-[50px] rounded-full group-hover/wait:animate-glow-pulse" />
                    <div className="h-40 w-40 rounded-[3rem] bg-white border border-white flex items-center justify-center shadow-xl group-hover/wait:scale-110 group-hover:-rotate-3 transition-all duration-1000">
                      <BarChart3 className="h-20 w-20 text-slate-200 group-hover/wait:text-pink-600 transition-colors duration-700" />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <p className="text-2xl font-black text-slate-950 uppercase tracking-tighter leading-none">{t('roiSimulator.awaitingParams' as any) || 'Awaiting_Calculation_Vector'}</p>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">Input baseline parameters to initialize yield simulation</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
        <div className="flex items-center gap-6 text-slate-400 group/status cursor-default">
          <ShieldCheck className="h-5 w-5 group-hover:text-emerald-500 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">
            {t('roiSimulator.aestheticLogic' as any) || 'ROI_Inference_Logic'} // {t('ui.status.roiActive' as any) || 'ACTIVE_SYNC'}
          </p>
        </div>
        <p className="text-[10px] font-black text-pink-600/60 uppercase tracking-widest italic bg-white px-6 py-2 rounded-full shadow-sm border border-slate-100">BIP-Standard-v4.8 // Economic_Layer</p>
      </CardFooter>
    </Card>
  )
}
