'use client'

import React, { Component, ReactNode, ErrorInfo } from 'react'
import { errorLogger } from '@/lib/error/logger'
import { errorBoundary } from '@/lib/error/global-handler'
import { GenericErrorFallback, NetworkErrorFallback, AIServiceErrorFallback } from '@/components/error/fallback/error-components'

// Props for error boundary
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError?: () => void }>
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  isolate?: boolean
}

// State for error boundary
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorId?: string
}

// Main Error Boundary Component
export class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0
  private maxRetries = 3

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to our error logger
    errorLogger.logError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: 'AppErrorBoundary',
      retryCount: this.retryCount,
      errorId: this.state.errorId,
      isolated: this.props.isolate
    })

    // Handle through global error boundary
    errorBoundary.handleError(error, errorInfo)

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Report to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo)
    }
  }

  // Reset error boundary
  resetError = () => {
    this.retryCount++
    
    // Prevent infinite retries
    if (this.retryCount > this.maxRetries) {
      console.warn('Max retries reached for error boundary')
      return
    }

    this.setState({ hasError: false, error: undefined, errorId: undefined })
  }

  // Report error to external service
  private reportError(error: Error, _errorInfo: ErrorInfo) {
    // This would integrate with services like Sentry, LogRocket, etc.
    try {
      // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } })
      console.log('Error reported to external service:', error.message)
    } catch (reportError) {
      console.error('Failed to report error:', reportError)
    }
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || GenericErrorFallback
      
      return (
        <FallbackComponent 
          error={this.state.error} 
          resetError={this.resetError}
        />
      )
    }

    return this.props.children
  }
}

// Specialized error boundaries for different contexts

// AI Service Error Boundary
export class AIServiceErrorBoundary extends Component<Omit<ErrorBoundaryProps, 'fallback'>> {
  render() {
    return (
      <AppErrorBoundary
        {...this.props}
        fallback={AIServiceErrorFallback}
        onError={(error, errorInfo) => {
          // Log AI service specific errors
          errorLogger.logError(error, {
            category: 'AI_SERVICE',
            componentStack: errorInfo.componentStack,
            service: 'ai_boundary'
          })
          
          if (this.props.onError) {
            this.props.onError(error, errorInfo)
          }
        }}
      >
        {this.props.children}
      </AppErrorBoundary>
    )
  }
}

// Network Error Boundary
export class NetworkErrorBoundary extends Component<Omit<ErrorBoundaryProps, 'fallback'>> {
  render() {
    return (
      <AppErrorBoundary
        {...this.props}
        fallback={NetworkErrorFallback}
        onError={(error, errorInfo) => {
          // Log network specific errors
          errorLogger.logError(error, {
            category: 'NETWORK',
            componentStack: errorInfo.componentStack,
            service: 'network_boundary'
          })
          
          if (this.props.onError) {
            this.props.onError(error, errorInfo)
          }
        }}
      >
        {this.props.children}
      </AppErrorBoundary>
    )
  }
}

// Route-level Error Boundary
export class RouteErrorBoundary extends Component<ErrorBoundaryProps> {
  render() {
    return (
      <AppErrorBoundary
        {...this.props}
        isolate={true} // Isolate route errors
        onError={(error, errorInfo) => {
          // Log route specific errors
          errorLogger.logError(error, {
            category: 'USER_INTERFACE',
            componentStack: errorInfo.componentStack,
            route: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
            service: 'route_boundary'
          })
          
          if (this.props.onError) {
            this.props.onError(error, errorInfo)
          }
        }}
      >
        {this.props.children}
      </AppErrorBoundary>
    )
  }
}

// Hook for error handling in functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const handleError = React.useCallback((error: Error) => {
    setError(error)
    errorLogger.logError(error, {
      source: 'useErrorHandler',
      hook: true
    })
  }, [])

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  // Throw error to be caught by error boundary
  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { handleError, resetError }
}

// Helper function for async operations
async function executeAsyncOperation<T>(
  asyncOperation: () => Promise<T>,
  errorHandler: ((error: Error) => void) | undefined,
  setError: (error: Error | null) => void
): Promise<T | null> {
  try {
    const result = await asyncOperation()
    return result
  } catch (err) {
    const error = err as Error
    setError(error)

    errorLogger.logError(error, {
      source: 'useAsyncError',
      hook: true,
      asyncOperation: true
    })

    if (errorHandler) {
      errorHandler(error)
    }

    return null
  }
}

// Hook for async error handling
export function useAsyncError() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const executeAsync = React.useCallback(
    <T,>(
      asyncOperation: () => Promise<T>,
      errorHandler?: (error: Error) => void
    ): Promise<T | null> => {
      return executeAsyncOperation(asyncOperation, errorHandler, setError)
    },
    []
  )

  return { error, resetError, executeAsync }
}

// Error Boundary Provider for app-wide error handling
interface ErrorBoundaryProviderProps {
  children: ReactNode
  config?: {
    enableErrorReporting?: boolean
    enableConsoleLogging?: boolean
    maxRetries?: number
  }
}

export function ErrorBoundaryProvider({ children, config }: ErrorBoundaryProviderProps) {
  const [globalError, setGlobalError] = React.useState<Error | null>(null)

  // Configure error logger
  React.useEffect(() => {
    if (config?.enableErrorReporting !== false) {
      // Configure error logger for production
      errorLogger.logInfo('Error boundary provider initialized', {
        config,
        timestamp: new Date().toISOString()
      })
    }
  }, [config])

  // Handle global errors
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = new Error(event.reason?.message || 'Unhandled promise rejection')
      errorLogger.logError(error, {
        source: 'unhandledRejection',
        reason: event.reason,
        global: true
      })
    }

    const handleError = (event: ErrorEvent) => {
      const error = new Error(event.message)
      error.stack = event.error?.stack
      errorLogger.logError(error, {
        source: 'globalError',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        global: true
      })
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [])

  if (globalError) {
    return <GenericErrorFallback error={globalError} resetError={() => setGlobalError(null)} />
  }

  return (
    <AppErrorBoundary
      onError={(error, _errorInfo) => {
        setGlobalError(error)
      }}
    >
      {children}
    </AppErrorBoundary>
  )
}

// Higher-order component for error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error?: Error; resetError?: () => void }>
) {
  return function WrappedComponent(props: P) {
    return (
      <AppErrorBoundary fallback={fallback}>
        <Component {...props} />
      </AppErrorBoundary>
    )
  }
}

// Export components
export {
  AppErrorBoundary as default,
  GenericErrorFallback,
  NetworkErrorFallback,
  AIServiceErrorFallback
}
