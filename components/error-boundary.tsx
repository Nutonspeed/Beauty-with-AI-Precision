"use client"

import { Component, type ComponentType, type ErrorInfo, type ReactNode } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type ErrorBoundaryVariant = "general" | "ai"

interface BoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  variant: ErrorBoundaryVariant
}

interface BoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
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

    if (typeof globalThis !== "undefined" && (globalThis as any).Sentry) {
      (globalThis as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      })
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  private renderGeneralFallback() {
    const { error } = this.state

    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card className="w-full max-w-md p-8 text-center shadow-lg">
          <div className="mb-6">
            <div className="mb-4 text-6xl">⚠️</div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">Oops! Something went wrong</h1>
            <p className="text-gray-600">
              We encountered an unexpected error. Don&apos;t worry, we&apos;re on it!
            </p>
          </div>

          {process.env.NODE_ENV === "development" && error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-left">
              <p className="break-all font-mono text-sm text-red-800">{error.toString()}</p>
              {error.stack && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-red-600 hover:text-red-800">
                    Stack trace
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap text-xs text-red-700">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              onClick={this.handleReset}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              Try Again
            </Button>
            <Button onClick={() => globalThis.location?.assign("/")} variant="outline">
              Go to Home
            </Button>
          </div>

          <p className="mt-6 text-xs text-gray-500">If this problem persists, please contact support.</p>
        </Card>
      </div>
    )
  }

  private renderAIFallback() {
    const { error, errorInfo } = this.state

    return (
      <Card className="mx-auto mt-8 max-w-2xl border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            เกิดข้อผิดพลาดในการวิเคราะห์ภาพ
          </CardTitle>
          <CardDescription>
            ระบบ AI พบปัญหาในการประมวลผล กรุณาลองใหม่อีกครั้ง
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === "development" && error && (
            <details className="rounded-lg border bg-muted p-4">
              <summary className="cursor-pointer font-semibold">
                Technical Details (Dev Mode)
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

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>สาเหตุที่เป็นไปได้:</p>
            <ul className="ml-6 list-disc space-y-1">
              <li>ภาพมีความละเอียดต่ำเกินไป (ต้องการอย่างน้อย 640x480)</li>
              <li>ไม่พบใบหน้าในภาพ หรือใบหน้าเล็กเกินไป</li>
              <li>แสงในภาพไม่เพียงพอ หรือมืดเกินไป</li>
              <li>รูปภาพเสียหาย หรือไฟล์ไม่ถูกต้อง</li>
              <li>AI model ยังไม่โหลด หรือขาดหายไป</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button onClick={this.handleReset} variant="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              ลองใหม่อีกครั้ง
            </Button>
            <Button onClick={() => globalThis.location?.reload()} variant="outline">
              รีเฟรชหน้า
            </Button>
          </div>
        </CardContent>
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
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <InternalErrorBoundary {...props} variant="general" />
}

export function AIErrorBoundary(props: ErrorBoundaryProps) {
  return <InternalErrorBoundary {...props} variant="ai" />
}

export function withErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    )
  }
}

export function withAIErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithAIErrorBoundary(props: P) {
    return (
      <AIErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </AIErrorBoundary>
    )
  }
}
