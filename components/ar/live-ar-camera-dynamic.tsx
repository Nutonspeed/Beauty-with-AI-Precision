"use client"

/**
 * Dynamic Wrapper for LiveARCamera
 * Reduces initial bundle size by lazy-loading @mediapipe/tasks-vision
 */

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

// Dynamic import with loading state
const LiveARCamera = dynamic(
  () => import('./live-ar-camera').then(mod => ({ default: mod.LiveARCamera })),
  {
    loading: () => (
      <Card className="w-full h-[480px] flex items-center justify-center bg-black/5">
        <CardContent className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading AR Camera...</p>
        </CardContent>
      </Card>
    ),
    ssr: false // Disable SSR for MediaPipe components
  }
)

export default LiveARCamera
