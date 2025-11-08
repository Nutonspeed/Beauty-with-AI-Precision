'use client'

/**
 * Presentation Wizard Component
 *
 * Manages the full seven-step customer presentation workflow with
 * offline-first persistence and deferred sync support.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
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
import type { PresentationData } from '@/lib/sales/presentation-types'
import {
  loadPresentationData,
  savePresentationData,
  enqueuePresentationSync,
  flushPresentationSyncQueue,
} from '@/lib/sales/presentation-storage'

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

const STORAGE_DEBOUNCE_MS = 500

type InitialDataConfig = {
  customerId: string
  initialCustomerData?: PresentationWizardProps['initialCustomerData']
}

function generateSessionId() {
  const scope = typeof globalThis === 'object' ? (globalThis as { crypto?: Crypto }) : undefined
  const cryptoApi = scope?.crypto

  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID()
  }

  return `presentation-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function createInitialPresentationData({
  customerId,
  initialCustomerData,
}: InitialDataConfig): PresentationData {
  return {
    sessionId: generateSessionId(),
    customer: {
      id: customerId,
      name: initialCustomerData?.name ?? '',
      phone: initialCustomerData?.phone ?? '',
      email: initialCustomerData?.email ?? '',
    },
    scannedImages: {},
    analysisResults: null,
    selectedTreatments: [],
    selectedProducts: [],
    proposal: null,
    signature: null,
    completedAt: null,
    lastSavedAt: null,
    lastSyncedAt: null,
    syncStatus: 'idle',
  }
}

function findLastCompletedStep(data: PresentationData): number {
  if (data.completedAt) return 7
  if (data.signature) return 7
  if (data.proposal) return 6
  if (data.selectedProducts.length > 0) return 5
  if (data.selectedTreatments.length > 0) return 4
  if (data.analysisResults) return 3
  if (data.scannedImages.front && data.scannedImages.left && data.scannedImages.right) return 2
  if (data.customer.name && data.customer.phone) return 1
  return 0
}

export function PresentationWizard({
  customerId,
  isNewCustomer,
  isOnline,
  initialCustomerData,
}: Readonly<PresentationWizardProps>) {
  const [currentStep, setCurrentStep] = useState(() => (isNewCustomer ? 1 : 2))
  const [data, setData] = useState<PresentationData>(() =>
    createInitialPresentationData({ customerId, initialCustomerData })
  )

  useEffect(() => {
    const base = createInitialPresentationData({ customerId, initialCustomerData })
    const saved = loadPresentationData(customerId)

    if (!saved) {
      setData(base)
      setCurrentStep(isNewCustomer ? 1 : 2)
      return
    }

    const merged: PresentationData = {
      ...base,
      ...saved,
      sessionId: saved.sessionId || base.sessionId,
      lastSavedAt: saved.lastSavedAt ?? saved.completedAt ?? null,
      lastSyncedAt: saved.lastSyncedAt ?? null,
      syncStatus: saved.syncStatus ?? 'idle',
      customer: {
        ...base.customer,
        ...saved.customer,
        id: saved.customer?.id || customerId,
      },
    }

    setData(merged)

    if (merged.completedAt) {
      setCurrentStep(STEPS.length)
    } else {
      const lastStep = findLastCompletedStep(merged)
      setCurrentStep(Math.min(Math.max(lastStep + 1, 1), STEPS.length))
    }
  }, [customerId, initialCustomerData, isNewCustomer])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      savePresentationData(customerId, data)
      enqueuePresentationSync(customerId, data)
    }, STORAGE_DEBOUNCE_MS)

    return () => clearTimeout(timeoutId)
  }, [customerId, data])

  useEffect(() => {
    if (!isOnline) {
      return
    }

    let cancelled = false

    const attemptFlush = async () => {
      let syncedCurrentSession = false

      await flushPresentationSyncQueue(async (record) => {
        try {
          const response = await fetch('/api/sales/presentation-sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerId: record.customerId,
              payload: record.payload,
            }),
          })

          const ok = response.ok
          if (ok && record.customerId === customerId) {
            if (record.payload.sessionId === data.sessionId) {
              syncedCurrentSession = true
            }
          }

          return ok
        } catch (error) {
          console.warn('[presentation-wizard] Failed to sync presentation session', error)
          return false
        }
      })

      if (!cancelled && syncedCurrentSession) {
        setData((prev) => ({
          ...prev,
          lastSyncedAt: new Date(),
          syncStatus: 'synced',
        }))
      }
    }

    const handleOnline = () => {
      void attemptFlush()
    }

    void attemptFlush()
    globalThis.addEventListener?.('online', handleOnline)

    return () => {
      cancelled = true
      globalThis.removeEventListener?.('online', handleOnline)
    }
  }, [customerId, data.sessionId, isOnline])

  const updateData = useCallback(<K extends keyof PresentationData>(
    field: K,
    value: PresentationData[K]
  ) => {
    setData((prev) => ({
      ...prev,
      [field]: value,
      lastSavedAt: new Date(),
      syncStatus: 'pending',
    }))
  }, [])

  const goToNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const goToPrev = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= STEPS.length) {
      setCurrentStep(step)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

  const isStepComplete = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        return Boolean(data.customer.name && data.customer.phone)
      case 2:
        return Boolean(data.scannedImages.front && data.scannedImages.left && data.scannedImages.right)
      case 3:
        return Boolean(data.analysisResults)
      case 4:
        return data.selectedTreatments.length > 0
      case 5:
        return data.selectedProducts.length > 0
      case 6:
        return Boolean(data.proposal)
      case 7:
        return Boolean(data.signature && data.completedAt)
      default:
        return false
    }
  }, [data])

  const canGoNext = useMemo(() => isStepComplete(currentStep), [currentStep, isStepComplete])

  const completedSteps = useMemo(
    () =>
      STEPS.filter((step) => step.id !== currentStep && isStepComplete(step.id as number)).map(
        (step) => step.id
      ),
    [currentStep, isStepComplete]
  )

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
            recommendedProducts={data.analysisResults?.recommendations ?? []}
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
            onUpdate={(proposal) => updateData('proposal', proposal)}
            customerName={data.customer.name || 'Customer'}
            isOnline={isOnline}
          />
        )
      case 7:
        return (
          <SummaryStep
            data={data}
            onSignature={(signature) => updateData('signature', signature)}
            onComplete={(completedAt) => updateData('completedAt', completedAt)}
            isOnline={isOnline}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <WizardProgress
        steps={STEPS}
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={goToStep}
      />

      <Card className="p-6 min-h-[60vh]">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{STEPS[currentStep - 1].name}</h2>
          <p className="text-sm text-muted-foreground">
            Step {currentStep} of {STEPS.length}
          </p>
        </div>

        <div className="mb-8">{renderStepContent()}</div>
      </Card>

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
