'use client'

/**
 * Mobile Sales Presentation Wizard
 * 
 * Complete sales flow for field sales staff:
 * 1. Customer Info
 * 2. Quick Scan (3 angles)
 * 3. AI Analysis
 * 4. AR Program Preview
 * 5. Product Showcase (3D)
 * 6. Build Proposal
 * 7. Summary & Close
 * 
 * Optimized for mobile/tablet devices
 */

import { useParams } from 'next/navigation'
import { PresentationWizard } from '@/components/sales/presentation/presentation-wizard'

export default function MobileSalesPresentationPage() {
  const { id: clientId } = useParams<{ id: string }>()
  
  // In a real app, these would come from the client data or URL params
  const isNewClient = false
  const isOnline = true

  return (
    <div className="min-h-screen bg-white text-slate-950 selection:bg-pink-500/10">
      {/* Infrastructure Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
      </div>

      <div className="relative z-10">
        <PresentationWizard 
          clientId={clientId}
          isNewClient={isNewClient}
          isOnline={isOnline}
        />
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
