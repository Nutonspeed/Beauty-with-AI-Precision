'use client'

/**
 * Mobile Sales Presentation Wizard
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

import { useParams } from 'next/navigation'
import { PresentationWizard } from '@/components/sales/presentation/presentation-wizard'

export default function MobileSalesPresentationPage() {
  const { id: customerId } = useParams<{ id: string }>()
  
  // In a real app, these would come from the customer data or URL params
  const isNewCustomer = false
  const isOnline = true

  return (
    <div className="min-h-screen bg-background">
      <PresentationWizard 
        customerId={customerId}
        isNewCustomer={isNewCustomer}
        isOnline={isOnline}
      />
    </div>
  )
}

export const dynamic = 'force-dynamic'
