'use client'

import dynamic from 'next/dynamic'
import { ComponentType } from 'react'
import { GradientSpinner } from '@/components/ui/modern-loader'

/**
 * Loading component for dynamic imports
 */
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <GradientSpinner size="md" />
    </div>
  )
}

/**
 * Heavy components that should be lazy loaded
 * These are large libraries that shouldn't be in the initial bundle
 */

// 3D/AR Components (Three.js ~500KB)
export const Dynamic3DViewer = dynamic(
  () => import('@/components/ar/interactive-3d-viewer').then(mod => mod.Interactive3DViewer),
  { loading: LoadingSpinner, ssr: false }
)

export const DynamicARViewer = dynamic(
  () => import('@/components/ar/advanced-ar-viewer').then(mod => mod.AdvancedARViewer),
  { loading: LoadingSpinner, ssr: false }
)

// Charts (Recharts ~300KB)
export const DynamicRevenueChart = dynamic(
  () => import('@/components/dashboard/revenue-chart').then(mod => mod.RevenueChart),
  { loading: LoadingSpinner }
)

// PDF Export (jsPDF ~200KB)
export const DynamicPDFExport = dynamic(
  () => import('@/components/analysis/pdf-export-button'),
  { loading: LoadingSpinner }
)

// Video Call (WebRTC)
export const DynamicVideoCall = dynamic(
  () => import('@/components/realtime/video-call'),
  { loading: LoadingSpinner, ssr: false }
)

// Rich Text Editor
export const DynamicRichEditor = dynamic(
  () => import('@/components/ui/rich-text-editor'),
  { loading: LoadingSpinner, ssr: false }
)

// Calendar (heavy date handling)
export const DynamicCalendar = dynamic(
  () => import('@/components/ui/calendar').then(mod => mod.Calendar),
  { loading: LoadingSpinner }
)

/**
 * Helper to create dynamic import with loading
 */
export function createDynamicComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T } | T>,
  options?: { ssr?: boolean }
) {
  return dynamic(
    () => importFn().then(mod => ('default' in mod ? mod.default : mod) as T),
    {
      loading: LoadingSpinner,
      ssr: options?.ssr ?? true,
    }
  )
}
