import * as Sentry from '@sentry/nextjs'

// Initialize Sentry for error tracking
export function initSentry() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      
      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for performance monitoring.
      tracesSampleRate: 0.1,
      
      // Set the environment
      environment: process.env.NODE_ENV || 'development',
      
      // beforeSend filter to reduce noise
      beforeSend(event) {
        // Filter out known non-critical errors
        if (event.exception) {
          const error = event.exception.values?.[0]
          if (error?.type === 'ChunkLoadError') {
            // Don't send chunk load errors to Sentry
            return null
          }
        }
        
        // Add custom context
        event.contexts = {
          ...event.contexts,
          app: {
            name: 'Beauty AI Precision',
            version: process.env.npm_package_version || '1.0.0'
          }
        }
        
        return event
      },
      
      // Custom tags
      beforeSendTransaction(event) {
        // Add custom tags to transactions
        event.tags = {
          ...event.tags,
          service: 'beauty-ai-web',
        }
        return event
      }
    })
  }
}

// Helper to capture custom errors
export function captureError(error: Error, context?: Record<string, any>) {
  console.error('[Sentry] Capturing error:', error)
  
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.withScope((scope) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value)
        })
      }
      scope.setTag('customError', 'true')
      Sentry.captureException(error)
    })
  }
}

// Helper to track user actions
export function trackUserAction(action: string, properties?: Record<string, any>) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.addBreadcrumb({
      message: `User Action: ${action}`,
      category: 'user',
      level: 'info',
      data: properties,
    })
  }
}

// Helper to track API errors
export function trackApiError(endpoint: string, error: any, statusCode?: number) {
  captureError(new Error(`API Error: ${endpoint}`), {
    endpoint,
    statusCode,
    error: error?.message || 'Unknown error',
  })
}
