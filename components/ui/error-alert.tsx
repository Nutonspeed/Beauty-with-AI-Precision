'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, X } from 'lucide-react'
import type { AnalysisError } from '@/lib/errors/analysis-errors'
import { useState } from 'react'

interface ErrorAlertProps {
  error: AnalysisError
  onRetry?: () => void
  onDismiss?: () => void
  locale?: 'th' | 'en'
  className?: string
  showTechnicalDetails?: boolean
}

export function ErrorAlert({
  error,
  onRetry,
  onDismiss,
  locale = 'en',
  className = '',
  showTechnicalDetails = false,
}: ErrorAlertProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const titles = {
    th: 'เกิดข้อผิดพลาด',
    en: 'Error',
  }

  return (
    <Alert variant="destructive" className={className}>
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 mt-0.5" />
        <div className="flex-1 space-y-2">
          <AlertTitle>{titles[locale]}</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{error.getUserMessage(locale)}</p>

            {showTechnicalDetails && (
              <div className="space-y-1">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs underline hover:no-underline"
                >
                  {isExpanded
                    ? locale === 'th'
                      ? 'ซ่อนรายละเอียด'
                      : 'Hide details'
                    : locale === 'th'
                      ? 'แสดงรายละเอียด'
                      : 'Show details'}
                </button>
                {isExpanded && (
                  <div className="mt-2 p-3 bg-destructive/10 rounded text-xs font-mono">
                    <p>
                      <strong>Code:</strong> {error.code}
                    </p>
                    <p>
                      <strong>Status:</strong> {error.statusCode}
                    </p>
                    <p>
                      <strong>Message:</strong> {error.technicalMessage}
                    </p>
                  </div>
                )}
              </div>
            )}
          </AlertDescription>

          {(error.retryable || onDismiss) && (
            <div className="flex items-center gap-2 mt-3">
              {error.retryable && onRetry && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRetry}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  {locale === 'th' ? 'ลองใหม่' : 'Try Again'}
                </Button>
              )}
              {onDismiss && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onDismiss}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  {locale === 'th' ? 'ปิด' : 'Dismiss'}
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
  return (
    <div
      className={`flex items-center gap-2 text-sm text-destructive ${className}`}
    >
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="underline hover:no-underline ml-2"
        >
          Retry
        </button>
      )}
    </div>
  )
}
