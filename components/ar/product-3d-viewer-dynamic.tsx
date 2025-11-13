"use client"

/**
 * Dynamic Wrapper for Product3DViewer
 * Reduces initial bundle size by lazy-loading @react-three/fiber
 */

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

// Dynamic import with loading state
const Product3DViewer = dynamic(
  () => import('./product-3d-viewer').then(mod => ({ default: mod.Product3DViewer })),
  {
    loading: () => (
      <Card className="w-full h-[500px] flex items-center justify-center">
        <CardContent className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading 3D Product Viewer...</p>
        </CardContent>
      </Card>
    ),
    ssr: false // Disable SSR for Three.js components
  }
)

export default Product3DViewer
