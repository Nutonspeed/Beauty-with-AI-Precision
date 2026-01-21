import type React from "react"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { locales, type Locale, defaultLocale } from "@/i18n/locales"
import { notFound } from "next/navigation"
import { AnnouncementSubscriber } from "@/components/realtime/AnnouncementSubscriber"

export const dynamic = 'force-dynamic'

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  let messages = {}
  try {
    messages = await getMessages()
  } catch (error) {
    console.error("[LocaleLayout] Failed to load messages", error)
  }

  return (
    <NextIntlClientProvider
      locale={locale || defaultLocale}
      messages={messages}
    >
      <AnnouncementSubscriber />
      <div className="localized-contents">
        {children}
      </div>
    </NextIntlClientProvider>
  )
}
