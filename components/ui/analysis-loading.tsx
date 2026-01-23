'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Upload, Brain, Save, CheckCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

export type AnalysisStep = 'upload' | 'processing' | 'saving' | 'complete'

interface AnalysisLoadingProps {
  step: AnalysisStep
  progress: number
  message?: string
  className?: string
}

export function AnalysisLoading({
  step,
  progress,
  message,
  className = '',
}: AnalysisLoadingProps) {
  const t = useTranslations('analysisLoading')
  
  const STEP_ORDER: AnalysisStep[] = ['upload', 'processing', 'saving', 'complete']
  const currentStepIndex = STEP_ORDER.indexOf(step)
  
  const config = {
    upload: { icon: Upload, color: 'text-blue-500', glow: 'shadow-glow-blue' },
    processing: { icon: Brain, color: 'text-purple-500', glow: 'shadow-glow-purple' },
    saving: { icon: Save, color: 'text-pink-500', glow: 'shadow-glow-pink' },
    complete: { icon: CheckCircle, color: 'text-pink-600', glow: 'shadow-glow-pink' },
  }[step]
  
  const Icon = config.icon

  return (
    <Card className={cn("rounded-[3.5rem] bg-white/80 backdrop-blur-md border-slate-100 shadow-premium", className)}>
      <CardContent className="p-12">
        {/* Main Icon */}
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="relative">
            <div className={cn("flex items-center justify-center size-24 rounded-[2.5rem] bg-white shadow-premium transition-all duration-500", config.color)}>
              {step === 'complete' ? (
                <Icon className={cn("size-12", config.glow)} />
              ) : (
                <Loader2 className={cn("size-12 animate-spin", config.glow)} />
              )}
            </div>
          </div>

          {/* Step Label */}
          <div className="space-y-3">
            <h3 className="text-3xl font-black uppercase tracking-widest italic text-slate-950">{t(`${step}.label`)}</h3>
            <p className="text-slate-500 font-medium italic text-lg">
              {message || t(`${step}.description`)}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md space-y-4">
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
              <div 
                className={cn("h-full transition-all duration-500 bg-gradient-to-r from-pink-500 to-rose-500 shadow-glow-pink")}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm font-black uppercase tracking-widest italic text-pink-600 text-right">
              {Math.round(progress)}%
            </p>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-4 pt-4">
            {STEP_ORDER.slice(0, -1).map((stepName, index) => {
              const stepIconConfig = {
                upload: { icon: Upload, color: 'text-blue-500' },
                processing: { icon: Brain, color: 'text-purple-500' },
                saving: { icon: Save, color: 'text-pink-500' },
                complete: { icon: CheckCircle, color: 'text-pink-600' },
              }[stepName]
              
              const StepIcon = stepIconConfig.icon
              const isActive = index === currentStepIndex
              const isCompleted = index < currentStepIndex

              return (
                <div key={stepName} className="flex items-center">
                  <div
                    className={cn(
                      "flex items-center justify-center size-12 rounded-2xl border-2 transition-all duration-500 shadow-sm",
                      isCompleted ? "bg-pink-600 border-pink-600 text-white shadow-glow-pink" : 
                      isActive ? cn(stepIconConfig.color, "border-pink-500 bg-white shadow-glow-pink") : 
                      "border-slate-100 text-slate-300 bg-slate-50/50"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="size-6" />
                    ) : (
                      <StepIcon className="size-6" />
                    )}
                  </div>
                  {index < STEP_ORDER.length - 2 && (
                    <div
                      className={cn(
                        "w-12 h-1 mx-2 rounded-full transition-all duration-500",
                        isCompleted ? "bg-pink-600" : "bg-slate-100"
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Step Labels */}
          <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-widest italic text-slate-400">
            {STEP_ORDER.slice(0, -1).map((stepName, index) => (
              <div key={stepName} className={cn("w-24 text-center transition-colors duration-500", index <= currentStepIndex && "text-pink-600")}>
                {t(`${stepName}.label`)}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Compact version for smaller spaces
interface AnalysisLoadingCompactProps {
  step: AnalysisStep
  className?: string
}

export function AnalysisLoadingCompact({
  step,
  className = '',
}: AnalysisLoadingCompactProps) {
  const t = useTranslations('analysisLoading')
  
  const config = {
    upload: { icon: Upload, color: 'text-blue-500' },
    processing: { icon: Brain, color: 'text-purple-500' },
    saving: { icon: Save, color: 'text-green-500' },
    complete: { icon: CheckCircle, color: 'text-green-600' },
  }[step]
  
  const Icon = config.icon

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={config.color}>
        {step === 'complete' ? (
          <Icon className="w-6 h-6" />
        ) : (
          <Loader2 className="w-6 h-6 animate-spin" />
        )}
      </div>
      <div className="flex-1">
        <p className="font-medium">{t(`${step}.label`)}</p>
        <p className="text-sm text-muted-foreground">{t(`${step}.description`)}</p>
      </div>
    </div>
  )
}
