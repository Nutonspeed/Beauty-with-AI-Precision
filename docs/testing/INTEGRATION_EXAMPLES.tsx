/**
 * Integration Example: Error Boundary and Performance Monitoring
 * 
 * This file demonstrates how to integrate error boundaries and performance monitoring
 * into your application layouts.
 */

// ============================================
// Example 1: Root Layout with Error Boundary
// ============================================

/*
import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { Providers } from "@/components/providers"
import AnnouncementSubscriber from "@/components/realtime/AnnouncementSubscriber"
import { ConnectionStatusIndicator } from "@/components/realtime/ConnectionStatusIndicator"
import { OfflineIndicator } from "@/components/offline/offline-indicator"
import "./globals.css"

import { ServiceWorkerRegistration } from "@/components/service-worker-registration"

// ✅ ADD THIS IMPORT
import { ErrorBoundaryWrapper } from "@/components/error/error-boundary"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  // ... existing metadata
}

export const viewport = {
  // ... existing viewport config
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ... existing head content *\/}
      </head>
      <body className={`font-sans antialiased`}>
        {/* ✅ WRAP EVERYTHING IN ERROR BOUNDARY *\/}
        <ErrorBoundaryWrapper locale="th" showDetails={process.env.NODE_ENV === 'development'}>
          <Providers>
            <ServiceWorkerRegistration />
            <AnnouncementSubscriber />
            <div className="fixed bottom-4 right-4 z-50">
              <ConnectionStatusIndicator variant="badge" />
            </div>
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
*/

// ============================================
// Example 2: Initialize Performance Monitoring
// ============================================

/*
// Create a new file: app/performance-init.tsx

'use client';

import { useEffect } from 'react';
import { initPerformanceMonitoring } from '@/lib/utils/performance-monitoring';

export function PerformanceInit() {
  useEffect(() => {
    // Initialize performance monitoring on mount
    initPerformanceMonitoring();
  }, []);

  return null;
}
*/

/*
// Then add to root layout:

import { PerformanceInit } from './performance-init';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PerformanceInit />
        {/* ... rest of layout *\/}
      </body>
    </html>
  );
}
*/

// ============================================
// Example 3: Page-Level Error Boundary
// ============================================

/*
// For critical pages, you can add additional error boundaries:

import { ErrorBoundaryWrapper } from '@/components/error/error-boundary';

export default function DashboardPage() {
  return (
    <ErrorBoundaryWrapper
      locale="th"
      showDetails={false}
      onError={(error, errorInfo) => {
        // Custom error handling
        console.error('Dashboard error:', error);
        // You can send to analytics here
      }}
    >
      {/* Your page content *\/}
    </ErrorBoundaryWrapper>
  );
}
*/

// ============================================
// Example 4: Component Performance Monitoring
// ============================================

/*
import { usePerformanceMonitor } from '@/hooks/use-performance-monitor';

export function ExpensiveComponent() {
  const { getMetrics, renderCount } = usePerformanceMonitor({
    componentName: 'ExpensiveComponent',
    trackRenders: true,
    trackMemory: true,
    onSlowRender: (duration) => {
      console.warn('Slow render detected:', duration);
    },
    slowRenderThreshold: 16, // 60fps = 16ms per frame
  });

  // Your component logic

  return (
    <div>
      {/* Your component JSX *\/}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-muted-foreground">
          Renders: {renderCount}
        </div>
      )}
    </div>
  );
}
*/

// ============================================
// Example 5: Page Performance Tracking
// ============================================

/*
'use client';

import { usePagePerformance } from '@/hooks/use-performance-monitor';

export default function AboutPage() {
  // Track page performance automatically
  usePagePerformance('about');

  return (
    <div>
      {/* Your page content *\/}
    </div>
  );
}
*/

// ============================================
// Example 6: API Call Performance Tracking
// ============================================

/*
'use client';

import { useApiPerformance } from '@/hooks/use-performance-monitor';

export function UserProfile() {
  const { trackApiCall } = useApiPerformance();

  const fetchUser = async () => {
    const user = await trackApiCall('/api/users/me', async () => {
      const res = await fetch('/api/users/me');
      return res.json();
    });
    return user;
  };

  // Use fetchUser in your component
}
*/

// ============================================
// Example 7: Async Operation Performance
// ============================================

/*
'use client';

import { useAsyncPerformance } from '@/hooks/use-performance-monitor';

export function DataProcessor() {
  const { measureAsync } = useAsyncPerformance();

  const processData = async (data: any[]) => {
    return await measureAsync(
      'process-large-dataset',
      async () => {
        // Your async operation
        return data.map(item => item * 2); // Example processing
      },
      {
        onSlow: (duration) => {
          console.warn('Slow data processing:', duration);
        },
        slowThreshold: 2000, // 2 seconds
      }
    );
  };

  // Use processData in your component
}
*/

// ============================================
// Example 8: Manual Performance Marks
// ============================================

/*
import { markPerformance, measurePerformance } from '@/lib/utils/performance-monitoring';

export async function fetchAndRenderData() {
  // Mark start
  markPerformance('fetch-start');

  const data = await fetch('/api/data').then(r => r.json());

  // Mark end of fetch
  markPerformance('fetch-end');

  // Measure fetch duration
  const fetchDuration = measurePerformance('fetch-data', 'fetch-start', 'fetch-end');
  console.log('Fetch took:', fetchDuration, 'ms');

  // Mark start of render
  markPerformance('render-start');

  // Render data
  // ...

  markPerformance('render-end');
  const renderDuration = measurePerformance('render-data', 'render-start', 'render-end');
  console.log('Render took:', renderDuration, 'ms');
}
*/

// ============================================
// Example 9: Custom Error Logging
// ============================================

/*
// You can also manually log errors to the API:

async function logCustomError(error: Error, context?: Record<string, unknown>) {
  try {
    await fetch('/api/errors/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        severity: 'error',
        context: context || {},
      }),
    });
  } catch (logError) {
    console.error('Failed to log error:', logError);
  }
}

// Usage:
try {
  // Some code that might throw
} catch (error) {
  logCustomError(error as Error, {
    action: 'submit-form',
    formData: { /* sanitized form data *\/ },
  });
}
*/

// ============================================
// Example 10: Environment-Based Configuration
// ============================================

/*
// Create a config file: lib/monitoring/config.ts

export const MONITORING_CONFIG = {
  // Enable/disable monitoring based on environment
  enableErrorLogging: process.env.NODE_ENV !== 'test',
  enablePerformanceMonitoring: process.env.NODE_ENV === 'production',
  
  // Show detailed errors only in development
  showDetailedErrors: process.env.NODE_ENV === 'development',
  
  // Sentry DSN (from environment variable)
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance thresholds
  thresholds: {
    slowRender: 16, // 60fps
    slowApi: 2000, // 2 seconds
    longTask: 50, // Main thread blocking
  },
};

// Use in components:
import { MONITORING_CONFIG } from '@/lib/monitoring/config';

if (MONITORING_CONFIG.enablePerformanceMonitoring) {
  initPerformanceMonitoring();
}
*/

export default function IntegrationExample() {
  return null;
}
