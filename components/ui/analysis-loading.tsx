'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Loader2, Upload, Brain, Save, CheckCircle } from 'lucide-react'

export type AnalysisStep = 'upload' | 'processing' | 'saving' | 'complete'

interface AnalysisLoadingProps {
  step: AnalysisStep
  progress: number
  message?: string
  locale?: 'th' | 'en'
  className?: string
}

const STEP_CONFIG: Record<
  AnalysisStep,
  {
    icon: typeof Upload
    label: { th: string; en: string }
    description: { th: string; en: string }
    color: string
  }
> = {
  upload: {
    icon: Upload,
    label: { th: 'กำลังอัปโหลด', en: 'Uploading' },
    description: { th: 'กำลังอัปโหลดรูปภาพ...', en: 'Uploading image...' },
    color: 'text-blue-500',
  },
  processing: {
    icon: Brain,
    label: { th: 'กำลังวิเคราะห์', en: 'Processing' },
    description: { th: 'AI กำลังวิเคราะห์ผิวหน้าของคุณ...', en: 'AI is analyzing your skin...' },
    color: 'text-purple-500',
  },
  saving: {
    icon: Save,
    label: { th: 'กำลังบันทึก', en: 'Saving' },
    description: { th: 'กำลังบันทึกผลการวิเคราะห์...', en: 'Saving analysis results...' },
    color: 'text-green-500',
  },
  complete: {
    icon: CheckCircle,
    label: { th: 'เสร็จสิ้น', en: 'Complete' },
    description: { th: 'การวิเคราะห์เสร็จสมบูรณ์!', en: 'Analysis complete!' },
    color: 'text-green-600',
  },
}

const STEP_ORDER: AnalysisStep[] = ['upload', 'processing', 'saving', 'complete']

export function AnalysisLoading({
  step,
  progress,
  message,
  locale = 'en',
  className = '',
}: AnalysisLoadingProps) {
  const currentStepIndex = STEP_ORDER.indexOf(step)
  const config = STEP_CONFIG[step]
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
            <h3 className="text-2xl font-semibold">{config.label[locale]}</h3>
            <p className="text-muted-foreground">
              {message || config.description[locale]}
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
              const stepConfig = STEP_CONFIG[stepName]
              const StepIcon = stepConfig.icon
              const isActive = index === currentStepIndex
              const isCompleted = index < currentStepIndex

              let stepClassName = 'border-muted text-muted-foreground'
              if (isCompleted) {
                stepClassName = 'bg-green-500 border-green-500 text-white'
              } else if (isActive) {
                stepClassName = `${stepConfig.color} border-current bg-background`
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
                {STEP_CONFIG[stepName].label[locale]}
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
  locale?: 'th' | 'en'
  className?: string
}

export function AnalysisLoadingCompact({
  step,
  locale = 'en',
  className = '',
}: AnalysisLoadingCompactProps) {
  const config = STEP_CONFIG[step]
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
        <p className="font-medium">{config.label[locale]}</p>
        <p className="text-sm text-muted-foreground">{config.description[locale]}</p>
      </div>
    </div>
  )
}
