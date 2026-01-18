import type { Metadata, Viewport } from "next"
import { locales } from '@/i18n/request'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: {
    default: 'AI Skin Analysis - 99% Cheaper Than Traditional Equipment | CenterIQ',
    template: '%s | CenterIQ AI'
  },
  description: 'Professional-grade skin analysis AI + AR simulator for beauty clinics. Mobile sales tool that closes deals 2.4x faster.',
  keywords: ['AI skin analysis', 'beauty tech', 'clinic sales tool', 'skin analyzer', 'AR simulator'],
  metadataBase: new URL('https://beauty-with-ai-precision.vercel.app'),
  openGraph: {
    title: 'Stop Paying Millions for Equipment - CenterIQ AI',
    description: 'Professional skin analysis on mobile. Used by 500+ clinics.',
    type: 'website',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'CenterIQ AI Skin Analysis'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Skin Analysis - Mobile Sales Tool',
    description: 'Close beauty deals 2.4x faster',
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  
  if (!locales.includes(locale as any)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="contents">
        {children}
      </div>
    </NextIntlClientProvider>
  )
}
