'use client'

/**
 * Sales Presentation Wizard - Mobile-First
 * 
 * Complete sales flow for field sales staff:
 * 1. Customer Info
 * 2. Quick Scan (3 angles)
 * 3. AI Analysis
 * 4. AR Treatment Preview
 * 5. Product Showcase (3D)
 * 6. Build Proposal
 * 7. Summary & Close
 * 
 * Optimized for mobile/tablet devices
 */

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { PresentationWizard } from '@/components/sales/presentation/presentation-wizard'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Wifi, WifiOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function SalesPresentationWizardPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const customerId = params.customerId as string
  const [isOnline, setIsOnline] = useState(true)
  
  // Get customer data from URL params (if provided from leads)
  const customerName = searchParams.get('name') || ''
  const customerPhone = searchParams.get('phone') || ''
  const customerEmail = searchParams.get('email') || ''

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    globalThis.addEventListener('online', handleOnline)
    globalThis.addEventListener('offline', handleOffline)
    setIsOnline(navigator.onLine)

    return () => {
      globalThis.removeEventListener('online', handleOnline)
      globalThis.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Check if it's a new customer (temp ID)
  const isNewCustomer = customerId.startsWith('temp-')

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header - Sticky */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="h-9 w-9 p-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Sales Presentation</h1>
              <p className="text-xs text-muted-foreground">
                {isNewCustomer ? 'New Customer' : `Customer ID: ${customerId.slice(0, 8)}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Online/Offline Indicator */}
            <Badge 
              variant={isOnline ? 'default' : 'secondary'}
              className={isOnline ? 'bg-green-500' : 'bg-gray-400'}
            >
              {isOnline ? (
                <>
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </>
              )}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Offline Warning */}
        {!isOnline && (
          <Card className="mb-4 p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200">
            <div className="flex items-start gap-3">
              <WifiOff className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  Offline Mode
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  You're currently offline. Data will be saved locally and synced when connection is restored.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Presentation Wizard */}
        <PresentationWizard 
          customerId={customerId}
          isNewCustomer={isNewCustomer}
          isOnline={isOnline}
          initialCustomerData={{
            name: customerName,
            phone: customerPhone,
            email: customerEmail
          }}
        />
      </main>

      {/* Mobile-optimized meta tags (handled in layout) */}
      {/* PWA manifest and service worker registration */}
    </div>
  )
}
