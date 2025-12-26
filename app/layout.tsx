import type React from "react"
import type { Metadata } from "next"
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { locales } from "@/i18n/request"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import AnnouncementSubscriber from "@/components/realtime/AnnouncementSubscriber"
import { ConnectionStatusIndicator } from "@/components/realtime/ConnectionStatusIndicator"
import { OfflineIndicator } from "@/components/offline/offline-indicator"
import { ErrorBoundaryWrapper } from "@/components/error/error-boundary"
import { PerformanceInit } from "./performance-init"
import { ServiceWorkerRegistration } from "@/components/service-worker-registration"
import { InstallPrompt } from "@/components/pwa/install-prompt"
import { SessionTracker } from "@/components/session-tracker"
import { Providers } from "@/components/providers"
import { Analytics } from "@vercel/analytics/react"
import { Noto_Sans_Thai, Kanit } from "next/font/google"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: "ClinicIQ — Intelligent Aesthetic Platform",
  description: "ClinicIQ brings medical-grade AI to aesthetics: skin analysis, booking, treatment recommendations, and clinic operations.",
  generator: "Next.js",
  manifest: "/manifest.json",
  openGraph: {
    title: "ClinicIQ — Intelligent Aesthetic Platform",
    description:
      "ClinicIQ brings medical-grade AI to aesthetics: skin analysis, booking, treatment recommendations, and clinic operations.",
    url: "https://cliniciq.example",
    siteName: "ClinicIQ",
    images: [
      {
        url: "/og-cliniciq.svg",
        width: 1200,
        height: 630,
        alt: "ClinicIQ",
        type: "image/svg+xml",
      },
    ],
    locale: "th_TH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@cliniciq",
    creator: "@cliniciq",
    title: "ClinicIQ — Intelligent Aesthetic Platform",
    description:
      "ClinicIQ brings medical-grade AI to aesthetics: skin analysis, booking, treatment recommendations, and clinic operations.",
    images: ["/og-cliniciq.svg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ClinicIQ",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/favicon.svg",
    apple: [
      { url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
  applicationName: "ClinicIQ",
  keywords: ["cliniciq", "skin analysis", "AI", "aesthetic", "clinic", "treatment", "dermatology"],
}

// Thai-friendly typography: Noto Sans Thai for body, Kanit for display headings
const _notoThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-noto-thai",
})

const _kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["600", "700", "800"],
  display: "swap",
  variable: "--font-kanit",
})

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#06b6d4" },
    { media: "(prefers-color-scheme: dark)", color: "#0891b2" },
  ],
  colorScheme: "light dark",
}

// Dynamic rendering for locales to avoid build timeout
// Force dynamic to prevent SSG generation at build time
export const dynamic = 'force-dynamic'

// Remove generateStaticParams to prevent static generation
// All pages will be rendered dynamically

export default async function RootLayout({
  children,
  params: { locale }
}: Readonly<{
  children: React.ReactNode
  params: { locale: string }
}>) {
  // ใช้ default locale ถ้า locale ไม่ถูกต้อง
  const validLocale = locales.includes(locale as any) ? locale : 'th'
  
  // Get messages for next-intl
  const messages = await getMessages()

  return (
    <html lang={validLocale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('ai-beauty-theme') || 'system';
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                const activeTheme = theme === 'system' ? systemTheme : theme;
                document.documentElement.classList.add(activeTheme);
                document.documentElement.style.colorScheme = activeTheme;
              } catch (e) {}
            `,
          }}
        />
  <link rel="icon" href="/favicon.svg" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="color-scheme" content="light dark" />
        <meta httpEquiv="Permissions-Policy" content="camera=(self), microphone=(self)" />
      </head>
      <body className={`${_notoThai.variable} ${_kanit.variable} font-sans antialiased`}>
        {/* Skip link for keyboard users */}
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <PerformanceInit />
        <ErrorBoundaryWrapper locale="th" showDetails={process.env.NODE_ENV === 'development'}>
          <NextIntlClientProvider messages={messages}>
            <Providers>
              <SessionTracker />
              <ServiceWorkerRegistration />
              <InstallPrompt />
              {/* Global realtime announcements */}
              <AnnouncementSubscriber />
              {/* Connection status indicator (fixed bottom-right) */}
              <div className="fixed bottom-4 right-4 z-50">
                <ConnectionStatusIndicator variant="badge" />
              </div>
              {/* Offline mode indicator with sync status */}
              <OfflineIndicator />
              <main id="main-content" role="main" aria-label="Primary content">
                {children}
              </main>
              <Toaster position="top-right" richColors closeButton />
            </Providers>
          </NextIntlClientProvider>
        </ErrorBoundaryWrapper>
        <Analytics />
      </body>
    </html>
  )
}
