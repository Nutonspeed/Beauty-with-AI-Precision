'use client'

/**
 * Wizard Navigation Component
 * 
 * Bottom navigation bar with Next/Back buttons
 * Fixed position on mobile for easy thumb access
 */

import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WizardNavigationProps {
  currentStep: number
  totalSteps: number
  canGoNext: boolean
  onNext: () => void
  onPrev: () => void
}

export function WizardNavigation({
  currentStep,
  totalSteps,
  canGoNext,
  onNext,
  onPrev,
}: WizardNavigationProps) {
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm border-t shadow-lg p-4 md:relative md:bg-transparent md:border-0 md:shadow-none md:p-0">
      <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          variant="outline"
          size="lg"
          onClick={onPrev}
          disabled={isFirstStep}
          className={cn(
            'flex-1 md:flex-initial',
            isFirstStep && 'invisible'
          )}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </Button>

        {/* Progress Text (hidden on mobile) */}
        <div className="hidden md:block text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </div>

        {/* Next Button */}
        <Button
          size="lg"
          onClick={onNext}
          disabled={!canGoNext}
          className="flex-1 md:flex-initial"
        >
          {isLastStep ? (
            <>
              <Check className="h-5 w-5 mr-2" />
              Complete
            </>
          ) : (
            <>
              Next
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Helpful hint */}
      {!canGoNext && (
        <p className="text-xs text-center text-muted-foreground mt-3 md:hidden">
          Complete this step to continue
        </p>
      )}
    </div>
  )
}
