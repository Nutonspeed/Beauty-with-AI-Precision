'use client'

/**
 * Wizard Progress Component
 * 
 * Visual progress indicator for multi-step wizard
 * Mobile-optimized with horizontal scroll on small screens
 */

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface Step {
  id: number
  name: string
  key: string
}

interface WizardProgressProps {
  steps: readonly Step[]
  currentStep: number
  completedSteps: number[]
  onStepClick?: (step: number) => void
}

export function WizardProgress({ 
  steps, 
  currentStep, 
  completedSteps,
  onStepClick 
}: WizardProgressProps) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-center justify-between min-w-max md:min-w-0 gap-2 px-2">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id)
          const isCurrent = currentStep === step.id
          const isClickable = index < currentStep - 1 || isCompleted
          
          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <button
                onClick={() => isClickable && onStepClick?.(step.id)}
                disabled={!isClickable}
                className={cn(
                  'flex flex-col items-center gap-2 transition-all',
                  isClickable && 'cursor-pointer hover:scale-105',
                  !isClickable && 'cursor-not-allowed opacity-60'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all',
                    isCompleted && 'bg-green-500 text-white shadow-lg',
                    isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-lg scale-110',
                    !isCompleted && !isCurrent && 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                
                {/* Step Label */}
                <span
                  className={cn(
                    'text-xs font-medium whitespace-nowrap transition-colors',
                    isCurrent && 'text-primary font-bold',
                    isCompleted && 'text-green-600 dark:text-green-400',
                    !isCompleted && !isCurrent && 'text-muted-foreground'
                  )}
                >
                  {step.name}
                </span>
              </button>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-1 mx-2 rounded-full transition-colors',
                    isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
