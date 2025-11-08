'use client'

/**
 * Presentation Wizard Component
 * 
 * Main wizard container that manages:
 * - Step navigation
 * - State management
 * - Progress tracking
 * - Data persistence
 * 
 * Mobile-first design with swipe gestures
 */

import { useState, useCallback, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { WizardProgress } from './wizard-progress'
import { WizardNavigation } from './wizard-navigation'
import { CustomerInfoStep } from './steps/customer-info-step'
import { ScanStep } from './steps/scan-step'
import { AnalysisStep } from './steps/analysis-step'
import { ARPreviewStep } from './steps/ar-preview-step'
import { ProductShowcaseStep } from './steps/product-showcase-step'
import { ProposalStep } from './steps/proposal-step'
import { SummaryStep } from './steps/summary-step'

export interface PresentationData {
  customer: {
    id: string
    name: string
    phone: string
    email?: string
  }
  scannedImages: {
    front?: string
    left?: string
    right?: string
  }
  analysisResults: {
    skinAge: number
    actualAge: number
    concerns: Array<{
      type: string
      severity: number
      description: string
    }>
    recommendations: Array<{
      treatment: string
      sessions: number
      price: number
      expectedResult: string
    }>
  } | null
  selectedTreatments: string[]
  selectedProducts: string[]
  proposal: {
    items: Array<{
      id: string
      name: string
      type: 'treatment' | 'product'
      quantity: number
      pricePerUnit: number
      total: number
    }>
    subtotal: number
    discountType: 'percent' | 'fixed'
    discountValue: number
    discountAmount: number
    total: number
    paymentTerms: string
    notes: string
  } | null
  signature: string | null
  completedAt: Date | null
}

interface PresentationWizardProps {
  customerId: string
  isNewCustomer: boolean
  isOnline: boolean
  initialCustomerData?: {
    name?: string
    phone?: string
    email?: string
  }
}

const STEPS = [
  { id: 1, name: 'Customer Info', key: 'customer' },
  { id: 2, name: 'Scan', key: 'scan' },
  { id: 3, name: 'Analysis', key: 'analysis' },
  { id: 4, name: 'AR Preview', key: 'ar' },
  { id: 5, name: 'Products', key: 'products' },
  { id: 6, name: 'Proposal', key: 'proposal' },
  { id: 7, name: 'Summary', key: 'summary' },
] as const

export function PresentationWizard({ 
  customerId, 
  isNewCustomer,
  isOnline,
  initialCustomerData
}: PresentationWizardProps) {
  const [currentStep, setCurrentStep] = useState(isNewCustomer ? 1 : 2)
  const [data, setData] = useState<PresentationData>({
    customer: {
      id: customerId,
      name: initialCustomerData?.name || '',
      phone: initialCustomerData?.phone || '',
      email: initialCustomerData?.email || '',
    },
    scannedImages: {},
    analysisResults: null,
    selectedTreatments: [],
    selectedProducts: [],
    proposal: null,
    signature: null,
    completedAt: null,
  })

  // Load saved data from localStorage (for offline support)
  useEffect(() => {
    const savedData = localStorage.getItem(`presentation-${customerId}`)
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        // Merge saved data with initial customer data (prioritize saved if exists)
        setData({
          ...parsed,
          customer: {
            ...parsed.customer,
            // Keep saved data if exists, otherwise use URL params
            name: parsed.customer?.name || initialCustomerData?.name || '',
            phone: parsed.customer?.phone || initialCustomerData?.phone || '',
            email: parsed.customer?.email || initialCustomerData?.email || '',
          }
        })
        // Resume from last incomplete step
        if (!parsed.completedAt) {
          const lastStep = findLastCompletedStep(parsed)
          setCurrentStep(Math.min(lastStep + 1, STEPS.length))
        }
      } catch (error) {
        console.error('Failed to load saved presentation data:', error)
      }
    }
  }, [customerId, initialCustomerData])

  // Auto-save data to localStorage
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem(`presentation-${customerId}`, JSON.stringify(data))
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [data, customerId])

  // Find the last completed step based on data
  const findLastCompletedStep = (presentationData: PresentationData): number => {
    if (presentationData.completedAt) return 7
    if (presentationData.signature) return 6
    if (presentationData.proposal) return 5
    if (presentationData.selectedProducts.length > 0) return 4
    if (presentationData.selectedTreatments.length > 0) return 3
    if (presentationData.analysisResults) return 2
    if (presentationData.scannedImages.front) return 1
    if (presentationData.customer.name) return 0
    return 0
  }

  // Update data for specific field
  const updateData = useCallback(<K extends keyof PresentationData>(
    field: K,
    value: PresentationData[K]
  ) => {
    setData(prev => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  // Navigation handlers
  const goToNext = useCallback(() => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1)
      // Scroll to top on mobile
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentStep])

  const goToPrev = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentStep])

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= STEPS.length) {
      setCurrentStep(step)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

  // Check if current step is complete (validation)
  const isStepComplete = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        return !!(data.customer.name && data.customer.phone)
      case 2:
        return !!(data.scannedImages.front && data.scannedImages.left && data.scannedImages.right)
      case 3:
        return !!data.analysisResults
      case 4:
        return data.selectedTreatments.length > 0
      case 5:
        return data.selectedProducts.length > 0
      case 6:
        return !!data.proposal
      case 7:
        return !!(data.signature && data.completedAt)
      default:
        return false
    }
  }, [data])

  // Enable/disable next button
  const canGoNext = isStepComplete(currentStep)

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CustomerInfoStep
            customer={data.customer}
            onUpdate={(customer) => updateData('customer', customer)}
            isOnline={isOnline}
          />
        )
      case 2:
        return (
          <ScanStep
            images={data.scannedImages}
            onUpdate={(images) => updateData('scannedImages', images)}
            customerName={data.customer.name}
          />
        )
      case 3:
        return (
          <AnalysisStep
            images={data.scannedImages}
            analysisResults={data.analysisResults}
            onAnalysisComplete={(results) => updateData('analysisResults', results)}
            customerName={data.customer.name || 'Customer'}
            isOnline={isOnline}
          />
        )
      case 4:
        return (
          <ARPreviewStep
            image={data.scannedImages.front || ''}
            analysisResults={data.analysisResults}
            selectedTreatments={data.selectedTreatments}
            onUpdate={(treatments) => updateData('selectedTreatments', treatments)}
            customerName={data.customer.name || 'Customer'}
          />
        )
      case 5:
        return (
          <ProductShowcaseStep
            selectedProducts={data.selectedProducts}
            recommendedProducts={data.analysisResults?.recommendations.map(r => r.treatment) || []}
            onUpdate={(products) => updateData('selectedProducts', products)}
            customerName={data.customer.name || 'Customer'}
          />
        )
      case 6:
        return (
          <ProposalStep
            selectedTreatments={data.selectedTreatments}
            selectedProducts={data.selectedProducts}
            proposal={data.proposal}
            onUpdate={(proposal: any) => updateData('proposal', proposal)}
            customerName={data.customer.name || 'Customer'}
            isOnline={isOnline}
          />
        )
      case 7:
        return (
          <SummaryStep
            data={data}
            onSignature={(signature: string) => updateData('signature', signature)}
            onComplete={(completedAt: Date) => updateData('completedAt', completedAt)}
            isOnline={isOnline}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {/* Progress Indicator */}
      <WizardProgress
        steps={STEPS}
        currentStep={currentStep}
        completedSteps={STEPS.filter((_, idx) => isStepComplete(idx + 1)).map(s => s.id)}
        onStepClick={goToStep}
      />

      {/* Step Content Card */}
      <Card className="p-6 min-h-[60vh]">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">
            {STEPS[currentStep - 1].name}
          </h2>
          <p className="text-sm text-muted-foreground">
            Step {currentStep} of {STEPS.length}
          </p>
        </div>

        {/* Dynamic Step Content */}
        <div className="mb-8">
          {renderStepContent()}
        </div>
      </Card>

      {/* Navigation Buttons */}
      <WizardNavigation
        currentStep={currentStep}
        totalSteps={STEPS.length}
        canGoNext={canGoNext}
        onNext={goToNext}
        onPrev={goToPrev}
      />
    </div>
  )
}
