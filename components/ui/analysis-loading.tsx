'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Loader2, Upload, Brain, Save, CheckCircle } from 'lucide-react'

import { useTranslations } from 'next-intl'

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
    upload: { icon: Upload, color: 'text-blue-500' },
    processing: { icon: Brain, color: 'text-purple-500' },
    saving: { icon: Save, color: 'text-green-500' },
    complete: { icon: CheckCircle, color: 'text-green-600' },
  }[step]
  
  const Icon = config.icon

  return (
    <Card className={`${className} border-2`}>
      <CardContent className="p-8">
        {/* Main Icon */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className={`${config.color}`}>
              {step === 'complete' ? (
                <Icon className="w-16 h-16" />
              ) : (
                <Loader2 className="w-16 h-16 animate-spin" />
              )}
            </div>
          </div>

          {/* Step Label */}
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold">{t(`${step}.label`)}</h3>
            <p className="text-muted-foreground">
              {message || t(`${step}.description`)}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground text-right">
              {Math.round(progress)}%
            </p>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-2 pt-4">
            {STEP_ORDER.slice(0, -1).map((stepName, index) => {
              const stepIconConfig = {
                upload: { icon: Upload, color: 'text-blue-500' },
                processing: { icon: Brain, color: 'text-purple-500' },
                saving: { icon: Save, color: 'text-green-500' },
                complete: { icon: CheckCircle, color: 'text-green-600' },
              }[stepName]
              
              const StepIcon = stepIconConfig.icon
              const isActive = index === currentStepIndex
              const isCompleted = index < currentStepIndex

              let stepClassName = 'border-muted text-muted-foreground'
              if (isCompleted) {
                stepClassName = 'bg-green-500 border-green-500 text-white'
              } else if (isActive) {
                stepClassName = `${stepIconConfig.color} border-current bg-background`
              }

              return (
                <div key={stepName} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${stepClassName}`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  {index < STEP_ORDER.length - 2 && (
                    <div
                      className={`w-12 h-0.5 mx-1 ${
                        isCompleted ? 'bg-green-500' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Step Labels */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            {STEP_ORDER.slice(0, -1).map((stepName) => (
              <div key={stepName} className="w-20 text-center">
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
