import { locales } from '@/i18n/request'

// Force runtime rendering for the entire locale subtree
export const dynamic = 'force-dynamic'

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const { locale } = params
  console.log('[DEBUG] Locale layout called with locale:', locale, 'valid locales:', locales)

  if (process.env.NODE_ENV === 'development') {
    console.log('[locale] layout params', params)
  }

  // Temporarily disable notFound() to let middleware handle locale routing
  // if (!locales.includes(locale as any)) {
  //   console.log('[DEBUG] Locale', locale, 'not found in', locales, 'calling notFound()')
  //   notFound()
  // }

  console.log('[DEBUG] Locale', locale, 'is valid, rendering children')
  return children
}
