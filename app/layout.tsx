import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Noto_Sans_Thai, Kanit } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { Providers } from "@/components/providers"
import AnnouncementSubscriber from "@/components/realtime/AnnouncementSubscriber"
import { ConnectionStatusIndicator } from "@/components/realtime/ConnectionStatusIndicator"
import { OfflineIndicator } from "@/components/offline/offline-indicator"
import { ErrorBoundaryWrapper } from "@/components/error/error-boundary"
import { PerformanceInit } from "./performance-init"
import "./globals.css"

import { ServiceWorkerRegistration } from "@/components/service-worker-registration"
import { InstallPrompt } from "@/components/pwa/install-prompt"
import { SessionTracker } from "@/components/session-tracker"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

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

export const metadata: Metadata = {
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
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
        <PerformanceInit />
        <ErrorBoundaryWrapper locale="th" showDetails={process.env.NODE_ENV === 'development'}>
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
            {children}
            <Toaster position="top-right" richColors closeButton />
          </Providers>
        </ErrorBoundaryWrapper>
        <Analytics />
      </body>
    </html>
  )
}
