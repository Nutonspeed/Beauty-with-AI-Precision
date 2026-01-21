import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import { Analytics } from "@vercel/analytics/react"
import { Kanit, Noto_Sans_Thai } from "next/font/google"

import "./globals.css"
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics"
import { PageTransition } from "@/components/animations/page-transition"
import { OfflineIndicator } from "@/components/offline/offline-indicator"
import { InstallPrompt } from "@/components/pwa/install-prompt"
import { ConnectionStatusIndicator } from "@/components/realtime/ConnectionStatusIndicator"
import { ServiceWorkerRegistration } from "@/components/service-worker-registration"
import { SessionTracker } from "@/components/session-tracker"
import { StructuredData } from "@/components/seo/StructuredData"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/sonner"

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").trim()
const metadataBase = URL.canParse(siteUrl) ? new URL(siteUrl) : new URL("http://localhost:3000")

export const metadata: Metadata = {
  metadataBase,
  title: "Aesthetic OS — Intelligent Aesthetic Intelligence Platform",
  description: "Aesthetic OS brings elite-grade AI to aesthetics: skin analysis, booking, program recommendations, and center operations.",
  generator: "Next.js",
  manifest: "/manifest.json",
  openGraph: {
    title: "Aesthetic OS — Intelligent Aesthetic Intelligence Platform",
    description:
      "Aesthetic OS brings elite-grade AI to aesthetics: skin analysis, booking, program recommendations, and center operations.",
    url: "https://aestheticos.ai",
    siteName: "Aesthetic OS",
    images: [
      {
        url: "/og-aestheticos.svg",
        width: 1200,
        height: 630,
        alt: "Aesthetic OS",
        type: "image/svg+xml",
      },
    ],
    locale: "th_TH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@aestheticos",
    creator: "@aestheticos",
    title: "Aesthetic OS — Intelligent Aesthetic Intelligence Platform",
    description:
      "Aesthetic OS brings elite-grade AI to aesthetics: skin analysis, booking, program recommendations, and center operations.",
    images: ["/og-aestheticos.svg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Aesthetic OS",
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
  applicationName: "Aesthetic OS",
  keywords: ["aestheticos", "skin analysis", "AI", "aesthetic", "center", "program", "dermatology"],
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
export const dynamic = "force-dynamic"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
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
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        <StructuredData />
        <Providers>
          <SessionTracker />
          <ServiceWorkerRegistration />
          <InstallPrompt />
          <div className="fixed bottom-4 right-4 z-50">
            <ConnectionStatusIndicator variant="badge" />
          </div>
          <OfflineIndicator />
          <main id="main-content" role="main" aria-label="Primary content">
            <PageTransition>{children}</PageTransition>
          </main>
          <Toaster position="top-right" richColors closeButton />
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
