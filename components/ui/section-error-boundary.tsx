'use client'

import { Component, ReactNode, ErrorInfo } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  children: ReactNode
  fallbackMessage?: string
  retryMessage?: string
  retryLabel?: string
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
                {this.props.fallbackMessage || 'Unable to load section'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {this.props.retryMessage || 'Please try again or refresh the page'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleRetry}
                className="mt-3"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {this.props.retryLabel || 'Retry'}
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

import { useTranslations } from 'next-intl'

/**
 * HOC to wrap any component with error boundary
 */
export function withSectionErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallbackMessage?: string
) {
  return function WithErrorBoundary(props: P) {
    const t = useTranslations('ui.sectionError')
    return (
      <SectionErrorBoundary 
        fallbackMessage={fallbackMessage || t('fallback')}
        retryMessage={t('retryMessage')}
        retryLabel={t('retry')}
      >
        <WrappedComponent {...props} />
      </SectionErrorBoundary>
    )
  }
}
