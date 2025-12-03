export async function register() {
  // Check if we have a valid Sentry DSN configured
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

  // Check if DSN is valid (not placeholder and not empty)
  const enabled = dsn &&
    dsn !== 'https://your-sentry-dsn@sentry.io/project-id' &&
    dsn.startsWith('https://') &&
    dsn.includes('@') &&
    !dsn.includes('your-sentry-dsn')

  // Only dynamically import Sentry when we have a valid DSN
  if (!enabled) {
    console.info('[sentry] Disabled (no valid DSN configured)')
    return
  }

  const Sentry = await import('@sentry/nextjs')

  // Integrations: try to pull Replay from the dedicated package - not guaranteed to be included in the Sentry bundle
  const integrations = [] as any[];
  try {
    // Use eval dynamic import to avoid bundler resolving the module at build time.
    // This allows the integration to be optional at runtime.
    // @ts-ignore - dynamic import via eval
    const ReplayPkg = await (eval('import("@sentry/replay")'));
    if (ReplayPkg && ReplayPkg.Replay) {
      integrations.push(new ReplayPkg.Replay({ maskAllText: true, blockAllMedia: true }));
    }
  } catch (err) {
    console.info('[sentry] Replay integration not installed or supported, skipping Replay integration');
  }

  Sentry.init({
    dsn,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    integrations,
  })

  console.info('[sentry] Enabled with DSN:', dsn.split('@')[0] + '@***')
}
