'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  retryCount: number
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void; goHome: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  maxRetries?: number
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error to monitoring service
    this.logError(error, errorInfo)

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  private logError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo)
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // Send to performance monitor
      try {
        fetch('/api/monitoring/error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
          })
        }).catch(err => console.warn('Failed to log error:', err))
      } catch (err) {
        console.warn('Error logging failed:', err)
      }
    }

    // Send to Sentry if available
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        }
      })
    }
  }

  private retry = () => {
    const maxRetries = this.props.maxRetries || 3
    
    if (this.state.retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }))
    }
  }

  private goHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props
      
      if (Fallback && this.state.error) {
        return (
          <Fallback 
            error={this.state.error} 
            retry={this.retry}
            goHome={this.goHome}
          />
        )
      }

      return <DefaultErrorFallback error={this.state.error} retry={this.retry} goHome={this.goHome} />
    }

    return this.props.children
  }
}

// Default error fallback component
function DefaultErrorFallback({ 
  error, 
  retry, 
  goHome 
}: { 
  error: Error | null
  retry: () => void
  goHome: () => void
}) {
  const t = useTranslations('ui.errorBoundary')
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50/50 backdrop-blur-sm">
      <Card className="w-full max-w-lg rounded-[3.5rem] border border-slate-100 bg-white/90 shadow-premium p-10 backdrop-blur-xl">
        <CardHeader className="text-center p-0 mb-8">
          <div className="mx-auto size-20 rounded-[2rem] bg-rose-50/50 flex items-center justify-center mb-6 shadow-inner">
            <AlertTriangle className="size-10 text-rose-600 shadow-glow-pink" />
          </div>
          <CardTitle className="text-3xl font-black uppercase tracking-widest italic text-slate-950">{t('title')}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-8 p-0">
          <p className="text-slate-500 font-medium italic text-lg leading-relaxed">
            {t('message')}
            {process.env.NODE_ENV === 'development' && error && (
              <span className="block mt-4 p-4 rounded-2xl bg-rose-50/30 border border-rose-100/50 text-sm text-rose-600 font-mono overflow-auto max-h-32 text-left">
                {error.message}
              </span>
            )}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={retry} className="flex-1 h-14 rounded-2xl shadow-glow-pink">
              <RefreshCw className="size-5 mr-2" />
              {t('retry') || 'Retry'}
            </Button>
            <Button variant="outline" onClick={goHome} className="flex-1 h-14 rounded-2xl border-slate-200">
              <Home className="size-5 mr-2" />
              {t('homeBtn')}
            </Button>
          </div>
          
          <p className="text-[10px] font-black uppercase tracking-widest italic text-slate-400">
            {t('contactAdmin')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook for handling async errors in function components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const handleError = React.useCallback((error: Error) => {
    setError(error)
    
    // Log error
    console.error('Async error caught:', error)
    
    // Send to monitoring
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/monitoring/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
          type: 'async'
        })
      }).catch(() => {})
    }
  }, [])

  // Throw error to be caught by ErrorBoundary
  if (error) {
    throw error
  }

  return { handleError, resetError }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}
