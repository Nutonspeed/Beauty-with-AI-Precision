import { locales } from '@/i18n/request'
import { HydrationProvider } from '@/components/providers/hydration-provider'

// Force runtime rendering for the entire locale subtree
export const dynamic = 'force-dynamic'

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  console.log('[DEBUG] Locale layout called with locale:', locale, 'valid locales:', locales)

  if (process.env.NODE_ENV === 'development') {
    console.log('[locale] layout params', { locale })
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <HydrationProvider>
          {children}
        </HydrationProvider>
      </body>
    </html>
  )
}
