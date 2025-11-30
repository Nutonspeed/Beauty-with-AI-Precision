'use client'

import Image, { ImageProps } from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps extends Omit<ImageProps, 'onError'> {
  fallback?: string
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto'
}

const aspectRatioClasses = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
  auto: '',
}

/**
 * Optimized Image component with:
 * - Automatic lazy loading
 * - Blur placeholder
 * - Error fallback
 * - Aspect ratio support
 */
export function OptimizedImage({
  src,
  alt,
  className,
  fallback = '/images/placeholder.png',
  aspectRatio = 'auto',
  ...props
}: OptimizedImageProps) {
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  return (
    <div className={cn('relative overflow-hidden', aspectRatioClasses[aspectRatio], className)}>
      {!loaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <Image
        src={error ? fallback : src}
        alt={alt}
        className={cn(
          'object-cover transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0'
        )}
        onError={() => setError(true)}
        onLoad={() => setLoaded(true)}
        loading="lazy"
        {...props}
      />
    </div>
  )
}

/**
 * Avatar Image with circular crop
 */
export function AvatarImage({
  src,
  alt,
  size = 40,
  className,
  fallback = '/images/avatar-placeholder.png',
}: {
  src: string
  alt: string
  size?: number
  className?: string
  fallback?: string
}) {
  const [error, setError] = useState(false)

  return (
    <div 
      className={cn(
        'relative rounded-full overflow-hidden bg-muted',
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={error ? fallback : src}
        alt={alt}
        width={size}
        height={size}
        className="object-cover"
        onError={() => setError(true)}
      />
    </div>
  )
}

/**
 * Background Image with overlay support
 */
export function BackgroundImage({
  src,
  alt,
  children,
  overlay = false,
  className,
}: {
  src: string
  alt: string
  children?: React.ReactNode
  overlay?: boolean
  className?: string
}) {
  return (
    <div className={cn('relative', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        priority={false}
      />
      {overlay && (
        <div className="absolute inset-0 bg-black/50" />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
