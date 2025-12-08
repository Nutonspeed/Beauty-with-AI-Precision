import { notFound } from 'next/navigation'
import { locales } from '@/i18n/request'

// Force runtime rendering for the entire locale subtree
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const { locale } = params

  if (!locales.includes(locale as any)) {
    notFound()
  }

  return children
}
