'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, X } from 'lucide-react'
import type { AnalysisError } from '@/lib/errors/analysis-errors'
import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { cn } from '@/lib/utils'

interface ErrorAlertProps {
  error: AnalysisError
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
  showTechnicalDetails?: boolean
}

export function ErrorAlert({
  error,
  onRetry,
  onDismiss,
  className = '',
  showTechnicalDetails = false,
}: ErrorAlertProps) {
  const t = useTranslations('errorAlert')
  const locale = useLocale() as 'en' | 'th'
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Alert variant="destructive" className={cn("rounded-[2.5rem] bg-rose-50/50 backdrop-blur-sm border-rose-100 shadow-premium", className)}>
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center size-10 rounded-2xl bg-rose-100/50 shadow-inner shrink-0 mt-0.5">
          <AlertCircle className="size-5 text-rose-600" />
        </div>
        <div className="flex-1 space-y-2">
          <AlertTitle className="text-rose-950 font-black uppercase tracking-widest italic">{t('title')}</AlertTitle>
          <AlertDescription className="space-y-3">
            <p className="text-rose-900/80 font-medium italic">{error.getUserMessage(locale)}</p>

            {showTechnicalDetails && (
              <div className="space-y-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs font-black uppercase tracking-widest italic text-rose-600 underline underline-offset-4 hover:text-rose-700 transition-colors"
                >
                  {isExpanded ? t('hideDetails') : t('showDetails')}
                </button>
                {isExpanded && (
                  <div className="mt-2 p-4 bg-rose-100/30 rounded-2xl text-[10px] font-mono border border-rose-100/50 backdrop-blur-sm shadow-inner text-rose-950">
                    <p className="flex items-center gap-2">
                      <strong className="uppercase font-black text-rose-600/70">Code:</strong> {error.code}
                    </p>
                    <p className="flex items-center gap-2">
                      <strong className="uppercase font-black text-rose-600/70">Status:</strong> {error.statusCode}
                    </p>
                    <p className="flex items-center gap-2">
                      <strong className="uppercase font-black text-rose-600/70">Message:</strong> {error.technicalMessage}
                    </p>
                  </div>
                )}
              </div>
            )}
          </AlertDescription>

          {(error.retryable || onDismiss) && (
            <div className="flex items-center gap-3 mt-4">
              {error.retryable && onRetry && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRetry}
                  className="gap-2 rounded-xl border-rose-200 bg-white/50 hover:bg-rose-100 hover:text-rose-700 text-rose-600 font-black uppercase tracking-widest italic"
                >
                  <RefreshCw className="size-3.5" />
                  {t('tryAgain')}
                </Button>
              )}
              {onDismiss && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onDismiss}
                  className="gap-2 rounded-xl hover:bg-rose-100/50 text-rose-600 font-black uppercase tracking-widest italic"
                >
                  <X className="size-3.5" />
                  {t('dismiss')}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Alert>
  )
}

// Compact version for inline errors
interface ErrorAlertCompactProps {
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorAlertCompact({
  message,
  onRetry,
  className = '',
}: ErrorAlertCompactProps) {
  const t = useTranslations('errorAlert')
  return (
    <div
      className={cn("flex items-center gap-2.5 text-xs font-black uppercase tracking-widest italic text-rose-600 bg-rose-50/50 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-rose-100/50 shadow-sm", className)}
    >
      <AlertCircle className="size-4" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="underline underline-offset-4 hover:text-rose-700 transition-colors ml-2 shrink-0"
        >
          {t('retry')}
        </button>
      )}
    </div>
  )
}