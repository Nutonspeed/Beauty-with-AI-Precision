import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
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

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI367 Beauty & Aesthetic Clinic",
  description: "AI-powered beauty clinic platform with skin analysis, booking, and treatment recommendations",
  generator: "Next.js",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AI367",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/favicon.ico",
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
  applicationName: "AI367 Beauty",
  keywords: ["beauty", "skin analysis", "AI", "aesthetic clinic", "treatment"],
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3b82f6" },
    { media: "(prefers-color-scheme: dark)", color: "#1e40af" },
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
        <link rel="icon" href="/favicon.ico" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="color-scheme" content="light dark" />
        <meta httpEquiv="Permissions-Policy" content="camera=(self), microphone=(self)" />
      </head>
      <body className={`font-sans antialiased`}>
        <PerformanceInit />
        <ErrorBoundaryWrapper locale="th" showDetails={process.env.NODE_ENV === 'development'}>
          <Providers>
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
