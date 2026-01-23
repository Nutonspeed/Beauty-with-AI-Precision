'use client'

/**
 * Sales Presentation Wizard - Mobile-First
 * 
 * Complete sales flow for field sales staff:
 * 1. Client Info
 * 2. Quick Scan (3 angles)
 * 3. AI Analysis
 * 4. AR Program Preview
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
import { useLocalizePath } from '@/lib/i18n/locale-link'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function SalesPresentationWizardPage() {
  const t = useTranslations()
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const clientId = params.clientId as string
  const lp = useLocalizePath()
  const [isOnline, setIsOnline] = useState(true)
  
  // Get client data from URL params (if provided from leads)
  const clientName = searchParams.get('name') || ''
  const clientPhone = searchParams.get('phone') || ''
  const clientEmail = searchParams.get('email') || ''

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

  // Check if it's a new client (temp ID)
  const isNewClient = clientId.startsWith('temp-')

  return (
    <div className="min-h-screen bg-white text-slate-950 selection:bg-pink-500/10">
      {/* Infrastructure Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
      </div>

      {/* Header - Sticky */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-3xl border-b border-slate-100 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-12 w-12 rounded-2xl text-slate-400 hover:bg-slate-50 border border-slate-100 shadow-inner transition-all hover:text-pink-600"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="space-y-1">
              <h1 className="text-xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">{t('salesWizard.title')}</h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                {isNewClient ? t('salesWizard.newClient') : `${t('salesWizard.clientId')}: ${clientId.slice(0, 8)}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Online/Offline Indicator */}
            <Badge 
              className={cn(
                "px-6 py-2 rounded-full border-none text-[10px] font-black uppercase tracking-[0.2em] italic shadow-sm",
                isOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              )}
            >
              {isOnline ? (
                <>
                  <Wifi className="h-3.5 w-3.5 mr-2" />
                  {t('salesWizard.online')}
                </>
              ) : (
                <>
                  <WifiOff className="h-3.5 w-3.5 mr-2" />
                  {t('salesWizard.offline')}
                </>
              )}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container relative z-10 mx-auto px-6 py-12 max-w-5xl">
        {/* Offline Warning */}
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="mb-10 p-8 bg-rose-50 border-rose-100 rounded-[2.5rem] shadow-premium relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
                <WifiOff className="w-24 h-24 text-rose-600" />
              </div>
              <div className="flex items-start gap-6 relative z-10">
                <div className="h-12 w-12 rounded-2xl bg-white border border-rose-100 flex items-center justify-center shadow-sm">
                  <WifiOff className="h-6 w-6 text-rose-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-black text-slate-950 italic uppercase leading-none">
                    {t('salesWizard.offlineWarning.title')}
                  </p>
                  <p className="text-sm text-slate-500 font-light italic leading-relaxed">
                    {t('salesWizard.offlineWarning.description')}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Presentation Wizard */}
        <PresentationWizard 
          clientId={clientId}
          isNewClient={isNewClient}
          isOnline={isOnline}
          initialClientData={{
            name: clientName,
            phone: clientPhone,
            email: clientEmail
          }}
        />
      </main>

      {/* Mobile-optimized meta tags (handled in layout) */}
      {/* PWA manifest and service worker registration */}
    </div>
  )
}
