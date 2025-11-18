"use client"

import { Component, type ComponentType, type ErrorInfo, type ReactNode } from "react"
import { AlertTriangle, RefreshCw, Bug, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type ErrorBoundaryVariant = "general" | "ai"

interface BoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  variant: ErrorBoundaryVariant
  locale?: 'en' | 'th'
}

interface BoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

const TRANSLATIONS = {
  en: {
    general: {
      title: 'Oops! Something went wrong',
      description: 'We encountered an unexpected error. Don\'t worry, we\'re on it!',
      persistNote: 'If this problem persists, please contact support.',
    },
    ai: {
      title: 'AI Analysis Error',
      description: 'The AI system encountered a problem during processing. Please try again.',
      possibleCauses: 'Possible causes:',
      causes: [
        'Image resolution too low (minimum 640x480 required)',
        'No face detected or face too small',
        'Insufficient or excessive lighting',
        'Damaged or invalid image file',
        'AI model not loaded or missing',
      ],
    },
    actions: {
      retry: 'Try Again',
      home: 'Go to Home',
      refresh: 'Refresh Page',
      report: 'Report Issue',
    },
    technicalDetails: 'Technical Details',
    showDetails: 'Show Details',
    stackTrace: 'Stack trace',
  },
  th: {
    general: {
      title: 'เกิดข้อผิดพลาด',
      description: 'เกิดข้อผิดพลาดที่ไม่คาดคิด เราจะดำเนินการแก้ไขให้เร็วที่สุด',
      persistNote: 'หากปัญหายังคงอยู่ กรุณาติดต่อฝ่ายสนับสนุน',
    },
    ai: {
      title: 'เกิดข้อผิดพลาดในการวิเคราะห์ภาพ',
      description: 'ระบบ AI พบปัญหาในการประมวลผล กรุณาลองใหม่อีกครั้ง',
      possibleCauses: 'สาเหตุที่เป็นไปได้:',
      causes: [
        'ภาพมีความละเอียดต่ำเกินไป (ต้องการอย่างน้อย 640x480)',
        'ไม่พบใบหน้าในภาพ หรือใบหน้าเล็กเกินไป',
        'แสงในภาพไม่เพียงพอ หรือมืดเกินไป',
        'รูปภาพเสียหาย หรือไฟล์ไม่ถูกต้อง',
        'AI model ยังไม่โหลด หรือขาดหายไป',
      ],
    },
    actions: {
      retry: 'ลองอีกครั้ง',
      home: 'กลับหน้าแรก',
      refresh: 'รีเฟรชหน้า',
      report: 'รายงานปัญหา',
    },
    technicalDetails: 'รายละเอียดทางเทคนิค',
    showDetails: 'แสดงรายละเอียด',
    stackTrace: 'Stack trace',
  },
}

class InternalErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  constructor(props: BoundaryProps) {
    super(props)

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): BoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error boundary caught an error:", error, errorInfo)

    this.setState({
      error,
      errorInfo,
    })

    this.props.onError?.(error, errorInfo)

    // Send to Sentry if available
    if (typeof globalThis !== "undefined" && (globalThis as any).Sentry) {
      (globalThis as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      })
    }

    // Also log to API endpoint for persistent tracking
    this.logErrorToService(error, errorInfo)
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo): void {
    if (typeof window === 'undefined') return

    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    }

    fetch('/api/errors/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorData),
    }).catch(err => {
      console.error('Failed to log error to service:', err)
    })
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  private handleReportIssue = () => {
    const { error, errorInfo } = this.state
    const errorReport = {
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace',
      componentStack: errorInfo?.componentStack || 'No component stack',
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
        .then(() => {
          alert(this.props.locale === 'th' 
            ? 'คัดลอกรายละเอียดข้อผิดพลาดแล้ว กรุณาส่งให้ฝ่ายสนับสนุน' 
            : 'Error details copied to clipboard. Please send this to support.')
        })
        .catch(() => {
          alert(this.props.locale === 'th' 
            ? 'ไม่สามารถคัดลอกรายละเอียดได้' 
            : 'Failed to copy error details.')
        })
    }
  }

  private renderGeneralFallback() {
    const { error } = this.state
    const locale = this.props.locale || 'en'
    const t = TRANSLATIONS[locale]

    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-red-100 p-4 dark:bg-red-900">
                <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <CardTitle className="text-2xl">{t.general.title}</CardTitle>
            <CardDescription className="text-base">
              {t.general.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {process.env.NODE_ENV === "development" && error && (
              <Alert variant="destructive">
                <Bug className="h-4 w-4" />
                <AlertTitle>{t.technicalDetails}</AlertTitle>
                <AlertDescription className="mt-2">
                  <p className="break-all font-mono text-sm">{error.toString()}</p>
                  {error.stack && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs hover:underline">
                        {t.stackTrace}
                      </summary>
                      <pre className="mt-2 whitespace-pre-wrap text-xs">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-2 sm:flex-row">
            <Button aria-label="Reset error state"
              onClick={this.handleReset}
              className="w-full gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 sm:w-auto"
            >
              <RefreshCw className="h-4 w-4" />
              {t.actions.retry}
            </Button>
            <Button aria-label="Go to homepage" onClick={() => globalThis.location?.assign("/")} variant="outline" className="w-full gap-2 sm:w-auto">
              <Home className="h-4 w-4" />
              {t.actions.home}
            </Button>
            <Button aria-label="Report issue" onClick={this.handleReportIssue} variant="ghost" className="w-full gap-2 sm:w-auto">
              <Bug className="h-4 w-4" />
              {t.actions.report}
            </Button>
          </CardFooter>

          <div className="px-6 pb-6 text-center">
            <p className="text-xs text-muted-foreground">{t.general.persistNote}</p>
          </div>
        </Card>
      </div>
    )
  }

  private renderAIFallback() {
    const { error, errorInfo } = this.state
    const locale = this.props.locale || 'th'
    const t = TRANSLATIONS[locale]

    return (
      <Card className="mx-auto mt-8 max-w-2xl border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {t.ai.title}
          </CardTitle>
          <CardDescription>
            {t.ai.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === "development" && error && (
            <details className="rounded-lg border bg-muted p-4">
              <summary className="cursor-pointer font-semibold">
                {t.technicalDetails}
              </summary>
              <div className="mt-2 space-y-2 text-sm">
                <div>
                  <strong>Error:</strong>
                  <pre className="mt-1 overflow-auto rounded bg-background p-2">{error.toString()}</pre>
                </div>
                {errorInfo && (
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="mt-1 overflow-auto rounded bg-background p-2 text-xs">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <CardContent className="pt-4">
              <p className="mb-2 text-sm font-medium text-blue-900 dark:text-blue-100">
                {t.ai.possibleCauses}
              </p>
              <ul className="ml-6 list-disc space-y-1 text-sm text-blue-800 dark:text-blue-200">
                {t.ai.causes.map((cause, i) => (
                  <li key={i}>{cause}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button aria-label="Reset application" onClick={this.handleReset} variant="default" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {t.actions.retry}
          </Button>
          <Button aria-label="Reload page" onClick={() => globalThis.location?.reload()} variant="outline" className="gap-2">
            {t.actions.refresh}
          </Button>
          <Button aria-label="Report issue" onClick={this.handleReportIssue} variant="ghost" className="gap-2">
            <Bug className="h-4 w-4" />
            {t.actions.report}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    if (this.props.fallback) {
      return this.props.fallback
    }

    return this.props.variant === "ai"
      ? this.renderAIFallback()
      : this.renderGeneralFallback()
  }
}

export interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  locale?: 'en' | 'th'
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <InternalErrorBoundary {...props} variant="general" />
}

export function AIErrorBoundary(props: ErrorBoundaryProps) {
  return <InternalErrorBoundary {...props} variant="ai" />
}

export function withErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  fallback?: ReactNode,
  locale?: 'en' | 'th'
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback} locale={locale}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    )
  }
}

export function withAIErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  fallback?: ReactNode,
  locale?: 'en' | 'th'
) {
  return function WithAIErrorBoundary(props: P) {
    return (
      <AIErrorBoundary fallback={fallback} locale={locale}>
        <WrappedComponent {...props} />
      </AIErrorBoundary>
    )
  }
}
