"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, Zap, BarChart3, Calculator, Info, Activity, ShieldCheck, Target } from "lucide-react"
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
      "border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/20 flex flex-col min-h-[650px]",
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

      <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
            <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
              <Calculator className="h-8 w-8 text-pink-600 group-hover:text-white" />
            </div>
            {t('roiSimulator.title' as any) || 'ROI_Simulator'}
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">
            {t('roiSimulator.subtitle' as any) || 'Predictive financial yield and conversion acceleration modeling'}
          </CardDescription>
        </div>
        <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-white font-black italic tracking-widest text-[9px] uppercase shadow-sm animate-pulse relative z-10">
          {t('roiSimulator.biBadge' as any) || 'BUSINESS_INTEL_v4.8'}
        </Badge>
      </CardHeader>

      <CardContent className="p-10 lg:p-16 space-y-12 bg-white flex-1 relative overflow-hidden">
        <div className="grid lg:grid-cols-12 gap-16 h-full">
          {/* Input Controls interface */}
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-10">
              <div className="space-y-6 p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 shadow-inner group/input">
                <div className="flex justify-between items-end px-2">
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/input:scale-110 transition-transform">
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover/input:text-slate-950 transition-colors">{t('roiSimulator.inputs.avgMonthlyRevenue' as any) || 'Monthly_Inflow_Baseline'}</h4>
                  </div>
                  <span className="text-2xl font-black text-slate-950 italic tracking-tighter uppercase">฿{revenue.toLocaleString()}</span>
                </div>
                <Slider value={[revenue]} onValueChange={(v) => setRevenue(v[0])} max={2000000} min={100000} step={50000} className="py-4" />
              </div>

              <div className="space-y-6 p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 shadow-inner group/input">
                <div className="flex justify-between items-end px-2">
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/input:scale-110 transition-transform">
                      <Target className="h-4 w-4 text-blue-600" />
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover/input:text-slate-950 transition-colors">{t('roiSimulator.inputs.leadCount' as any) || 'Identity_Node_Load'}</h4>
                  </div>
                  <span className="text-2xl font-black text-slate-950 italic tracking-tighter uppercase">{leads} <span className="text-[10px] text-slate-300 ml-1">NODES</span></span>
                </div>
                <Slider value={[leads]} onValueChange={(v) => setLeads(v[0])} max={500} min={10} step={10} className="py-4" />
              </div>

              <div className="space-y-6 p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 shadow-inner group/input">
                <div className="flex justify-between items-end px-2">
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/input:scale-110 transition-transform">
                      <TrendingUp className="h-4 w-4 text-pink-600" />
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover/input:text-slate-950 transition-colors">{t('roiSimulator.inputs.conversionRate' as any) || 'Cycle_Conversion_Efficiency'}</h4>
                  </div>
                  <span className="text-2xl font-black text-slate-950 italic tracking-tighter uppercase">{conversion}%</span>
                </div>
                <Slider value={[conversion]} onValueChange={(v) => setConversion(v[0])} max={50} min={5} step={1} className="py-4" />
              </div>
            </div>

            <Button 
              size="xl"
              onClick={handleCalculate}
              disabled={isCalculating || !isEnterprise}
              className="w-full h-20 rounded-[2.5rem] bg-slate-950 hover:bg-pink-600 text-white font-black uppercase tracking-[0.4em] text-xs shadow-2xl transition-all hover:scale-105 active:scale-95 italic border-none group/calc relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover/calc:translate-x-[100%] transition-transform duration-1000" />
              {isCalculating ? <RefreshCw className="mr-4 h-6 w-6 animate-spin" /> : <Zap className="mr-4 h-6 w-6 animate-pulse" />}
              {t('roiSimulator.calculateButton' as any) || 'Initialize_Calculation'}
            </Button>
          </div>

          {/* Results Visualization interface */}
          <div className="lg:col-span-7 relative h-full">
            <AnimatePresence mode="wait">
              {showResults ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="h-full space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="bg-slate-50 border border-slate-100 p-10 rounded-[3rem] space-y-4 shadow-inner group/res transition-all duration-700 hover:bg-white hover:border-pink-500/20">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic leading-none group-hover/res:text-pink-600 transition-colors">{t('roiSimulator.projectedRevenue' as any) || 'OPTIMIZED_MONTHLY_INFLOW'}</p>
                      <div className="space-y-4">
                        <p className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">฿{Math.round(projectedMonthlyRevenue).toLocaleString()}</p>
                        <Badge className="bg-emerald-50 text-emerald-600 border-none text-[10px] font-black uppercase italic shadow-sm px-4 py-1.5 rounded-full leading-none">
                          +{t('roiSimulator.monthlyLift' as any || '฿{val} Delta').replace('{val}', Math.round(monthlyLift).toLocaleString())}
                        </Badge>
                      </div>
                    </Card>
                    <Card className="bg-slate-50 border border-slate-100 p-10 rounded-[3rem] space-y-4 shadow-inner group/res transition-all duration-700 hover:bg-white hover:border-blue-500/20">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic leading-none group-hover/res:text-blue-600 transition-colors">{t('roiSimulator.results.roiPercentage' as any) || 'PROJECTED_ANNUAL_YIELD'}</p>
                      <div className="space-y-4">
                        <p className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">{Math.round(roiPercentage)}%</p>
                        <Badge className="bg-blue-50 text-blue-600 border-none text-[10px] font-black uppercase italic shadow-sm px-4 py-1.5 rounded-full leading-none">{t('roiSimulator.annualYield' as any) || 'ROI_COEFFICIENT'}</Badge>
                      </div>
                    </Card>
                  </div>

                  <div className="p-10 rounded-[3.5rem] bg-white border border-slate-100 relative overflow-hidden group/chart shadow-premium hover:border-pink-500/20 transition-all duration-700">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01] pointer-events-none" />
                    <div className="space-y-10 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                          <div className="h-10 w-10 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center shadow-sm group-hover/chart:scale-110 transition-transform">
                            <Activity className="h-5 w-5 text-pink-600" />
                          </div>
                          <h5 className="text-[11px] font-black text-slate-950 uppercase tracking-[0.4em] italic">{t('roiSimulator.efficiencyAlpha' as any) || 'Efficiency_Alpha_Vector'}</h5>
                        </div>
                        <TrendingUp className="h-6 w-6 text-emerald-500 animate-pulse" />
                      </div>
                      
                      <div className="space-y-6">
                        <div className="flex justify-between items-end px-2">
                          <span className="text-[11px] text-slate-400 font-black uppercase tracking-widest italic">{t('roiSimulator.revenueGrowthNode' as any) || 'Growth_Probability_Node'}</span>
                          <span className="text-2xl font-black text-pink-600 italic tracking-tighter uppercase leading-none">{t('roiSimulator.lift' as any || '+{val}%').replace('{val}', String(Math.round((monthlyLift/revenue)*100)))} YIELD_LIFT</span>
                        </div>
                        <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner p-1 relative">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: '100%' }} 
                            transition={{ duration: 2, ease: "easeOut" }} 
                            className="h-full rounded-full bg-gradient-to-r from-pink-500 to-blue-600 shadow-glow-pink/30 relative overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-shimmer" />
                          </motion.div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 shadow-inner">
                        <Info className="h-5 w-5 text-blue-400 shrink-0 mt-1" />
                        <p className="text-[13px] text-slate-500 font-medium italic leading-relaxed tracking-tight">
                          {t('roiSimulator.aiImpact' as any || 'AI-precision protocols provide a persistent {percent}% lift in high-fidelity node conversions.').replace('{percent}', '45')}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-slate-50/50 border border-slate-100 rounded-[3.5rem] p-20 text-center space-y-10 italic shadow-inner group/wait transition-all duration-700 hover:bg-white hover:border-blue-100">
                  <div className="relative h-32 w-32 mx-auto">
                    <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full group-hover/wait:animate-pulse" />
                    <div className="h-32 w-32 rounded-[2.5rem] bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover/wait:scale-110 transition-transform duration-700">
                      <BarChart3 className="h-16 w-16 text-slate-200 group-hover/wait:text-blue-600 transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-xl font-black text-slate-950 uppercase tracking-tighter leading-none">{t('roiSimulator.awaitingParams' as any) || 'Awaiting_Calculation_Vector'}</p>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Input baseline parameters to initialize yield simulation</p>
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

function RefreshCw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  )
}
