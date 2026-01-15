
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, ShieldAlert, X, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  getQuotaSummary, 
  isQuotaLow, 
  isQuotaCritical,
  type QuotaSummary 
} from '@/lib/quota'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useLocalizePath } from '@/lib/i18n/locale-link'

export function QuotaAlertBanner() {
  const lp = useLocalizePath()
  const [quota, setQuota] = useState<QuotaSummary | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsVisibleDismissed] = useState(false)

  useEffect(() => {
    const checkQuota = async () => {
      const summary = await getQuotaSummary()
      if (summary?.view === 'personal' && summary.quota) {
        setQuota(summary.quota)
        // Show banner if quota is low and not dismissed
        if (isQuotaLow(summary.quota.analysis_used, summary.quota.analysis_quota)) {
          setIsVisible(true)
        }
      }
    }
    checkQuota()
  }, [])

  if (!isVisible || isDismissed || !quota) return null

  const isCritical = isQuotaCritical(quota.analysis_used, quota.analysis_quota)
  const remaining = quota.analysis_quota - quota.analysis_used

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          "relative w-full overflow-hidden rounded-[2rem] border p-6 mb-8",
          isCritical 
            ? "bg-red-500/10 border-red-500/20 text-red-400" 
            : "bg-amber-500/10 border-amber-500/20 text-amber-400"
        )}
      >
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={cn(
            "absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-20",
            isCritical ? "bg-red-500" : "bg-amber-500"
          )} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className={cn(
              "h-14 w-14 rounded-2xl border flex items-center justify-center shadow-inner",
              isCritical 
                ? "bg-red-500/20 border-red-500/30" 
                : "bg-amber-500/20 border-amber-500/30"
            )}>
              {isCritical ? <ShieldAlert className="h-7 w-7" /> : <AlertTriangle className="h-7 w-7" />}
            </div>
            
            <div className="space-y-1">
              <h4 className="text-lg font-bold italic tracking-tight">
                {isCritical ? 'CRITICAL: Quota Depletion Detected' : 'WARNING: Low Quota Synchronized'}
              </h4>
              <p className="text-sm font-medium opacity-80 italic">
                Only <span className="font-black text-white px-2 py-0.5 rounded bg-white/10">{remaining}</span> cycles remaining for AI Skin Analysis this month.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <Button 
              asChild
              variant="outline" 
              className={cn(
                "h-12 px-6 rounded-xl border-current bg-transparent hover:bg-white/10 font-black uppercase tracking-widest text-[10px] italic",
                isCritical ? "text-red-400" : "text-amber-400"
              )}
            >
              <Link href={lp('/contact')}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Buy Power Pack
              </Link>
            </Button>
            
            <button 
              onClick={() => setIsVisibleDismissed(true)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
