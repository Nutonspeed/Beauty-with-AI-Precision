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

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Beauty Platform - Medical-Grade Skin Analysis",
  description: "Advanced AI-powered skin analysis and treatment recommendations for beauty clinics",
  generator: "v0.app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AI367Bar",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#667eea",
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
