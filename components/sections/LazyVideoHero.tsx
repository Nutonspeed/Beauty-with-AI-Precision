"use client"

import dynamic from 'next/dynamic'
import { VideoHeroSkeleton } from './VideoHeroSkeleton'

export const LazyVideoHero = dynamic(
  () => import('./VideoHeroSection').then(mod => ({ default: mod.VideoHeroSection })),
  {
    loading: () => <VideoHeroSkeleton />,
    ssr: false
  }
)
