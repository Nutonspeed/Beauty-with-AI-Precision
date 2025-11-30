'use client'

import { Component, ReactNode, ErrorInfo } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  children: ReactNode
  fallbackMessage?: string
  className?: string
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Lightweight Error Boundary for sections
 * Use this to wrap individual sections so errors don't crash the whole page
 */
export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Section Error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className={cn(
            'rounded-lg border border-destructive/20 bg-destructive/5 p-6',
            this.props.className
          )}
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-destructive">
                {this.props.fallbackMessage || 'ไม่สามารถโหลดส่วนนี้ได้'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                กรุณาลองใหม่อีกครั้ง หรือรีเฟรชหน้า
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleRetry}
                className="mt-3"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                ลองใหม่
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * HOC to wrap any component with error boundary
 */
export function withSectionErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallbackMessage?: string
) {
  return function WithErrorBoundary(props: P) {
    return (
      <SectionErrorBoundary fallbackMessage={fallbackMessage}>
        <WrappedComponent {...props} />
      </SectionErrorBoundary>
    )
  }
}
