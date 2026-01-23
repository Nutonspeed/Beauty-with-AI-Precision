"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { useTranslations } from "next-intl"
import { 
  Sun, 
  Moon, 
  Droplets, 
  Activity, 
  Utensils,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { LifestyleFactors } from "@/lib/ai/skin-age-predictor"
import { cn } from "@/lib/utils"

interface LifestyleQuestionnaireProps {
  onComplete: (data: LifestyleFactors & { age: number }) => void
  locale?: 'th' | 'en'
  className?: string
}

export function LifestyleQuestionnaire({ 
  onComplete, 
  locale: _locale = 'th',
  className = ''
}: LifestyleQuestionnaireProps) {
  const t = useTranslations('lifestyleQuestionnaire')
  const [step, setStep] = useState(0)
  const [data, setData] = useState<{
    age: number
    sunExposure: 'low' | 'moderate' | 'high'
    smoking: boolean
    sleepHours: number
    stressLevel: 'low' | 'moderate' | 'high'
    hydrationLevel: 'poor' | 'adequate' | 'good'
    diet: 'poor' | 'average' | 'healthy'
    skinCareRoutine: 'none' | 'basic' | 'comprehensive'
  }>({
    age: 30,
    sunExposure: 'moderate',
    smoking: false,
    sleepHours: 7,
    stressLevel: 'moderate',
    hydrationLevel: 'adequate',
    diet: 'average',
    skinCareRoutine: 'basic'
  })

  const steps = [
    // Step 0: Age interface
    {
      icon: <Activity className="h-8 w-8 text-pink-600" />,
      title: t('age' as any) || 'Chronological_Stamp',
      subtitle: 'Establish your biological baseline node',
      content: (
        <div className="space-y-10 py-10">
          <div className="flex items-center justify-center gap-10">
            <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 shadow-inner text-center min-w-[180px] group/age">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-2 group-hover/age:text-pink-600 transition-colors">Target_Age</p>
              <Input
                type="number"
                value={data.age}
                onChange={(e) => setData({ ...data, age: parseInt(e.target.value) || 25 })}
                className="w-full text-center text-6xl font-black text-slate-950 italic border-none bg-transparent p-0 h-auto tracking-tighter"
                min={15}
                max={80}
              />
              <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest italic">{t('ageYears' as any) || 'Solar_Years'}</span>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between px-2">
              <span className="text-[10px] font-black text-slate-300 uppercase italic">MIN_15</span>
              <span className="text-[10px] font-black text-slate-300 uppercase italic">MAX_80</span>
            </div>
            <Slider
              value={[data.age]}
              onValueChange={([v]) => setData({ ...data, age: v })}
              min={15}
              max={80}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      )
    },
    // Step 1: Sun interface
    {
      icon: <Sun className="h-8 w-8 text-amber-500" />,
      title: t('sunExposure' as any) || 'Spectral_Exposure',
      subtitle: 'Quantify cumulative UV radiation intake',
      content: (
        <RadioGroup
          value={data.sunExposure}
          onValueChange={(v) => setData({ ...data, sunExposure: v as 'low' | 'moderate' | 'high' })}
          className="grid gap-6 py-10"
        >
          {[
            { value: 'low', label: t('sunLow' as any) || 'Low_Spectrum', desc: 'Minimal solar interaction' },
            { value: 'moderate', label: t('sunModerate' as any) || 'Moderate_Flux', desc: 'Normal daylight exposure' },
            { value: 'high', label: t('sunHigh' as any) || 'High_Intensity', desc: 'Sustained solar radiation' }
          ].map((option) => (
            <motion.div key={option.value} whileHover={{ x: 10 }}>
              <Label 
                htmlFor={`sun-${option.value}`} 
                className={cn(
                  "flex items-center justify-between p-8 rounded-[2.5rem] border transition-all duration-500 cursor-pointer shadow-sm relative overflow-hidden group/opt",
                  data.sunExposure === option.value 
                    ? "bg-white border-amber-200 shadow-premium" 
                    : "bg-slate-50/50 border-slate-100 hover:bg-white hover:border-amber-100 shadow-inner"
                )}
              >
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-100 group-hover/opt:bg-amber-500 transition-all" className={data.sunExposure === option.value ? 'bg-amber-500' : ''} />
                <div className="flex items-center gap-6 relative z-10">
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center border transition-all duration-700 shadow-inner group-hover/opt:scale-110",
                    data.sunExposure === option.value ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-white text-slate-200 border-slate-100"
                  )}>
                    <RadioGroupItem value={option.value} id={`sun-${option.value}`} className="sr-only" />
                    {data.sunExposure === option.value ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl font-black italic uppercase tracking-tight leading-none group-hover/opt:text-amber-600 transition-colors">{option.label}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{option.desc}</p>
                  </div>
                </div>
                {data.sunExposure === option.value && (
                  <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shadow-glow-amber" />
                )}
              </Label>
            </motion.div>
          ))}
        </RadioGroup>
      )
    },
    // Step 2: Sleep interface
    {
      icon: <Moon className="h-8 w-8 text-blue-600" />,
      title: t('sleep' as any) || 'Restoration_Cycle',
      subtitle: 'Measure temporal recovery intervals',
      content: (
        <div className="space-y-12 py-10">
          <div className="text-center space-y-4">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-[60px] animate-pulse" />
              <div className="text-[8rem] font-black text-slate-950 italic tracking-tighter leading-none uppercase group-hover:text-blue-600 transition-colors duration-1000 relative z-10">
                {data.sleepHours}
              </div>
            </div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic">{t('sleepHours' as any) || 'SOLAR_HOURS_REST'}</p>
          </div>
          <div className="space-y-8">
            <Slider
              value={[data.sleepHours]}
              onValueChange={([v]) => setData({ ...data, sleepHours: v })}
              min={3}
              max={12}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between items-center bg-slate-50 border border-slate-100 px-8 py-4 rounded-2xl shadow-inner italic">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">3H_MIN</span>
              <div className={cn(
                "px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm",
                data.sleepHours >= 7 && data.sleepHours <= 9 ? 'bg-emerald-50 text-emerald-600 shadow-glow-emerald/20' : 'bg-white text-slate-400'
              )}>
                {t('sleepGoal' as any) || 'OPTIMAL_RECOVERY_ZONE'}
              </div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">12H_MAX</span>
            </div>
          </div>
        </div>
      )
    },
    // Step 3: Stress interface
    {
      icon: <Activity className="h-8 w-8 text-purple-600" />,
      title: t('stress' as any) || 'Cortisol_Inference',
      subtitle: 'Quantify systemic neural stress load',
      content: (
        <RadioGroup
          value={data.stressLevel}
          onValueChange={(v) => setData({ ...data, stressLevel: v as 'low' | 'moderate' | 'high' })}
          className="grid gap-6 py-10"
        >
          {[
            { value: 'low', label: t('stressLow' as any) || 'Nominal_State', desc: 'Stable neural load' },
            { value: 'moderate', label: t('stressModerate' as any) || 'Active_Flux', desc: 'Normal operational stress' },
            { value: 'high', label: t('stressHigh' as any) || 'Peak_Tension', desc: 'Elevated cortisol markers' }
          ].map((option) => (
            <motion.div key={option.value} whileHover={{ x: 10 }}>
              <Label 
                htmlFor={`stress-${option.value}`} 
                className={cn(
                  "flex items-center justify-between p-8 rounded-[2.5rem] border transition-all duration-500 cursor-pointer shadow-sm relative overflow-hidden group/opt",
                  data.stressLevel === option.value 
                    ? "bg-white border-purple-200 shadow-premium" 
                    : "bg-slate-50/50 border-slate-100 hover:bg-white hover:border-purple-100 shadow-inner"
                )}
              >
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-100 group-hover/opt:bg-purple-600 transition-all" className={data.stressLevel === option.value ? 'bg-purple-600' : ''} />
                <div className="flex items-center gap-6 relative z-10">
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center border transition-all duration-700 group-hover/opt:scale-110 shadow-inner",
                    data.stressLevel === option.value ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-white text-slate-200 border-slate-100"
                  )}>
                    <RadioGroupItem value={option.value} id={`stress-${option.value}`} className="sr-only" />
                    {data.stressLevel === option.value ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl font-black italic uppercase tracking-tight leading-none group-hover/opt:text-purple-600 transition-colors">{option.label}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{option.desc}</p>
                  </div>
                </div>
              </Label>
            </motion.div>
          ))}
        </RadioGroup>
      )
    },
    // Step 4: Hydration interface
    {
      icon: <Droplets className="h-8 w-8 text-cyan-600" />,
      title: t('hydration' as any) || 'H2O_Payload_Sync',
      subtitle: 'Quantify cellular hydration throughput',
      content: (
        <RadioGroup
          value={data.hydrationLevel}
          onValueChange={(v) => setData({ ...data, hydrationLevel: v as 'poor' | 'adequate' | 'good' })}
          className="grid gap-6 py-10"
        >
          {[
            { value: 'poor', label: t('hydrationPoor' as any) || 'Critical_Deficit', desc: 'Insufficient hydraulic sync' },
            { value: 'adequate', label: t('hydrationAdequate' as any) || 'Nominal_Supply', desc: 'Standard hydration load' },
            { value: 'good', label: t('hydrationGood' as any) || 'Optimal_Saturation', desc: 'Full cellular hydration' }
          ].map((option) => (
            <motion.div key={option.value} whileHover={{ x: 10 }}>
              <Label 
                htmlFor={`hydration-${option.value}`} 
                className={cn(
                  "flex items-center justify-between p-8 rounded-[2.5rem] border transition-all duration-500 cursor-pointer shadow-sm relative overflow-hidden group/opt",
                  data.hydrationLevel === option.value 
                    ? "bg-white border-cyan-200 shadow-premium" 
                    : "bg-slate-50/50 border-slate-100 hover:bg-white hover:border-cyan-100 shadow-inner"
                )}
              >
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-100 group-hover/opt:bg-cyan-600 transition-all" className={data.hydrationLevel === option.value ? 'bg-cyan-600' : ''} />
                <div className="flex items-center gap-6 relative z-10">
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center border transition-all duration-700 group-hover/opt:scale-110 shadow-inner",
                    data.hydrationLevel === option.value ? "bg-cyan-50 text-cyan-600 border-cyan-100" : "bg-white text-slate-200 border-slate-100"
                  )}>
                    <RadioGroupItem value={option.value} id={`hydration-${option.value}`} className="sr-only" />
                    {data.hydrationLevel === option.value ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl font-black italic uppercase tracking-tight leading-none group-hover/opt:text-cyan-600 transition-colors">{option.label}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{option.desc}</p>
                  </div>
                </div>
              </Label>
            </motion.div>
          ))}
        </RadioGroup>
      )
    },
    // Step 5: Diet interface
    {
      icon: <Utensils className="h-8 w-8 text-emerald-600" />,
      title: t('diet' as any) || 'Nutrient_Uplink',
      subtitle: 'Measure biological input quality',
      content: (
        <RadioGroup
          value={data.diet}
          onValueChange={(v) => setData({ ...data, diet: v as 'poor' | 'average' | 'healthy' })}
          className="grid gap-6 py-10"
        >
          {[
            { value: 'poor', label: t('dietPoor' as any) || 'Sub-Optimal', desc: 'Low nutrient-node efficiency' },
            { value: 'average', label: t('dietAverage' as any) || 'Standard_Grid', desc: 'Baseline biological intake' },
            { value: 'healthy', label: t('dietHealthy' as any) || 'Elite_Inflow', desc: 'High-fidelity nutrient load' }
          ].map((option) => (
            <motion.div key={option.value} whileHover={{ x: 10 }}>
              <Label 
                htmlFor={`diet-${option.value}`} 
                className={cn(
                  "flex items-center justify-between p-8 rounded-[2.5rem] border transition-all duration-500 cursor-pointer shadow-sm relative overflow-hidden group/opt",
                  data.diet === option.value 
                    ? "bg-white border-emerald-200 shadow-premium" 
                    : "bg-slate-50/50 border-slate-100 hover:bg-white hover:border-emerald-100 shadow-inner"
                )}
              >
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-100 group-hover/opt:bg-emerald-600 transition-all" className={data.diet === option.value ? 'bg-emerald-500' : ''} />
                <div className="flex items-center gap-6 relative z-10">
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center border transition-all duration-700 group-hover/opt:scale-110 shadow-inner",
                    data.diet === option.value ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-white text-slate-200 border-slate-100"
                  )}>
                    <RadioGroupItem value={option.value} id={`diet-${option.value}`} className="sr-only" />
                    {data.diet === option.value ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl font-black italic uppercase tracking-tight leading-none group-hover/opt:text-emerald-600 transition-colors">{option.label}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{option.desc}</p>
                  </div>
                </div>
              </Label>
            </motion.div>
          ))}
        </RadioGroup>
      )
    },
    // Step 6: Skincare interface
    {
      icon: <Sparkles className="h-8 w-8 text-pink-600" />,
      title: t('skincare' as any) || 'Protocol_Baseline',
      subtitle: 'Measure existing regimen adherence',
      content: (
        <RadioGroup
          value={data.skinCareRoutine}
          onValueChange={(v) => setData({ ...data, skinCareRoutine: v as 'none' | 'basic' | 'comprehensive' })}
          className="grid gap-6 py-10"
        >
          {[
            { value: 'none', label: t('skincareNone' as any) || 'Zero_Regimen', desc: 'No active clinical nodes' },
            { value: 'basic', label: t('skincareBasic' as any) || 'Baseline_Sync', desc: 'Fundamental dermal hygiene' },
            { value: 'comprehensive', label: t('skincareComprehensive' as any) || 'Multi-Node_Active', desc: 'High-fidelity protocol use' }
          ].map((option) => (
            <motion.div key={option.value} whileHover={{ x: 10 }}>
              <Label 
                htmlFor={`skincare-${option.value}`} 
                className={cn(
                  "flex items-center justify-between p-8 rounded-[2.5rem] border transition-all duration-500 cursor-pointer shadow-sm relative overflow-hidden group/opt",
                  data.skinCareRoutine === option.value 
                    ? "bg-white border-pink-200 shadow-premium" 
                    : "bg-slate-50/50 border-slate-100 hover:bg-white hover:border-pink-100 shadow-inner"
                )}
              >
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-100 group-hover/opt:bg-pink-600 transition-all" className={data.skinCareRoutine === option.value ? 'bg-pink-500' : ''} />
                <div className="flex items-center gap-6 relative z-10">
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center border transition-all duration-700 group-hover/opt:scale-110 shadow-inner",
                    data.skinCareRoutine === option.value ? "bg-pink-50 text-pink-600 border-pink-100" : "bg-white text-slate-200 border-slate-100"
                  )}>
                    <RadioGroupItem value={option.value} id={`skincare-${option.value}`} className="sr-only" />
                    {data.skinCareRoutine === option.value ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl font-black italic uppercase tracking-tight leading-none group-hover/opt:text-pink-600 transition-colors">{option.label}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{option.desc}</p>
                  </div>
                </div>
              </Label>
            </motion.div>
          ))}
        </RadioGroup>
      )
    }
  ]

  const handleSubmit = () => {
    onComplete({
      age: data.age,
      sunExposure: data.sunExposure,
      smoking: data.smoking,
      sleepHours: data.sleepHours,
      stressLevel: data.stressLevel,
      hydrationLevel: data.hydrationLevel,
      diet: data.diet,
      skinCareRoutine: data.skinCareRoutine
    })
  }

  return (
    <Card className={cn("border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-1000 hover:border-pink-500/10 flex flex-col min-h-[700px]", className)}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01] pointer-events-none" />
      
      <CardHeader className="p-10 lg:p-16 pb-8 border-b border-slate-50 bg-slate-50/30 text-center space-y-6 shrink-0">
        <div className="space-y-3">
          <CardTitle className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{t('title' as any) || 'Heuristic_Lifecycle_Sync'}</CardTitle>
          <CardDescription className="text-lg text-slate-500 font-medium italic leading-relaxed tracking-tight">{t('subtitle' as any) || 'Quantify biological inputs for precision diagnostic synthesis.'}</CardDescription>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <div className="flex justify-center gap-3">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-700 shadow-sm",
                  i === step ? "w-12 bg-pink-600 shadow-glow-pink/30" : i < step ? "w-6 bg-blue-500/40" : "w-6 bg-slate-100"
                )}
              />
            ))}
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">
            Sequence_Stage: <span className="text-slate-950">{step + 1} / {steps.length}</span>
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-16 flex-1 flex flex-col justify-center relative bg-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-10"
          >
            <div className="flex items-center gap-8 border-b border-slate-50 pb-10">
              <div className="h-20 w-20 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:bg-white group-hover:border-pink-100 transition-all duration-700">
                {steps[step].icon}
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">{steps[step].title}</h3>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">{steps[step].subtitle}</p>
              </div>
            </div>

            <div className="relative">
              {steps[step].content}
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>

      <CardFooter className="p-10 lg:p-12 py-8 bg-slate-50/30 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-10 shrink-0">
        <Button
          variant="outline"
          size="xl"
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
          className="h-16 px-10 rounded-2xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] italic shadow-sm hover:bg-slate-50 transition-all disabled:opacity-20 group/btn"
        >
          <ChevronLeft className="h-5 w-5 mr-3 text-slate-300 group-hover/btn:text-pink-600 transition-colors" />
          {t('back' as any) || 'REVERT_STEP'}
        </Button>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-1 w-12 bg-white rounded-full overflow-hidden border border-slate-100 shadow-inner">
              <motion.div animate={{ x: [-48, 48] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="h-full w-6 bg-pink-500/40" />
            </div>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Node_Sync: BIP-Core-v4.8</p>
          </div>
        </div>

        {step < steps.length - 1 ? (
          <Button 
            size="xl" 
            onClick={() => setStep(s => s + 1)}
            className="h-16 px-12 rounded-2xl bg-slate-950 text-white border-none font-black uppercase tracking-[0.3em] text-[10px] italic shadow-2xl hover:bg-blue-600 active:scale-95 transition-all group/btn"
          >
            {t('next' as any) || 'AUTHORIZE_NEXT'}
            <ChevronRight className="ml-3 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        ) : (
          <Button 
            size="xl"
            onClick={handleSubmit} 
            className="h-16 px-12 rounded-2xl bg-slate-950 text-white border-none font-black uppercase tracking-[0.3em] text-[10px] italic shadow-2xl hover:bg-pink-600 active:scale-95 transition-all group/submit relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/submit:translate-x-[100%] transition-transform duration-1000" />
            <Sparkles className="h-5 w-5 mr-4 group-hover/submit:rotate-12 transition-transform" />
            {t('submit' as any) || 'COMMIT_VECTORS'}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
