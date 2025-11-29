// instrumentation.ts - Safe Sentry initialization with lazy loading
// Only loads Sentry SDK when a valid DSN is configured

function isValidDsn(dsn?: string): boolean {
  if (!dsn) return false
  if (dsn.includes('your-sentry-dsn') || dsn.startsWith('https://your-sentry-dsn')) return false
  return dsn.startsWith('http') && dsn.includes('@sentry.io/')
}

export async function register() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
  const enabled = isValidDsn(dsn)

  // Skip Sentry entirely if no valid DSN - prevents OpenTelemetry crash
  if (!enabled) {
    if (process.env.NODE_ENV === 'development') {
      console.info('[sentry] Disabled (no valid DSN configured)')
    }
    return
  }

  // Only dynamically import Sentry when we have a valid DSN
  try {
    const Sentry = await import('@sentry/nextjs')
    
    const common = {
      dsn,
      environment: process.env.NODE_ENV,
      release: process.env.NEXT_PUBLIC_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0.1,
    }

    if (process.env.NEXT_RUNTIME === 'nodejs') {
      Sentry.init({
        ...common,
        integrations: [],
      })
    }

    if (process.env.NEXT_RUNTIME === 'edge') {
      Sentry.init({
        ...common,
      })
    }
  } catch (error) {
    console.error('[sentry] Failed to initialize:', error)
  }
}

// Safe error handler that only uses Sentry when available
export function onRequestError(error: unknown) {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
  if (!isValidDsn(dsn)) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[sentry] Error not captured (no valid DSN):', error)
    }
    return
  }
  
  // Dynamically import and use Sentry for error capture
  import('@sentry/nextjs').then((Sentry) => {
    Sentry.captureException(error)
  }).catch(() => {
    console.error('[sentry] Failed to capture error:', error)
  })
}
