import * as Sentry from '@sentry/nextjs'

// Simple DSN validation: treat placeholder or empty as disabled
function isValidDsn(dsn?: string) {
  if (!dsn) return false
  if (dsn.includes('your-sentry-dsn') || dsn.startsWith('https://your-sentry-dsn')) return false
  // Very basic pattern check (not exhaustive)
  return dsn.startsWith('http') && dsn.includes('@sentry.io/')
}

export async function register() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
  const enabled = isValidDsn(dsn)

  // Avoid noisy invalid DSN errors during local dev
  if (!enabled) {
    if (process.env.NODE_ENV === 'development') {
      // Lightweight dev notice without throwing
      console.warn('[sentry] Disabled (no valid DSN)')
    }
    return
  }

  const common = {
    dsn,
    environment: process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA,
    // Keep sample rates conservative until production tuning
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1,
    replaysSessionSampleRate: 0, // disabled by default
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
}

export const onRequestError = enabledCaptureRequestError()

function enabledCaptureRequestError() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
  if (!isValidDsn(dsn)) {
    return (e: unknown) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[sentry] captureRequestError skipped (no valid DSN)', e)
      }
    }
  }
  return Sentry.captureRequestError
}