'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface ProgressiveImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  blur?: boolean
  priority?: boolean
  quality?: number
  fill?: boolean
  sizes?: string
  onLoad?: () => void
  onError?: (error: Error) => void
}

/**
 * Progressive Image Component
 * Shows blur placeholder while loading, then smoothly transitions to full image
 * Uses Next.js Image for automatic optimization
 */
export function ProgressiveImage({
  src,
  alt,
  width,
  height,
  className = '',
  blur = true,
  priority = false,
  quality = 85,
  fill = false,
  sizes,
  onLoad,
  onError,
}: ProgressiveImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Reset states when src changes
    setIsLoading(true)
    setHasError(false)
  }, [src])

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.(new Error(`Failed to load image: ${src}`))
  }

  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          className
        )}
        style={!fill ? { width, height } : undefined}
      >
        <div className="text-center p-4">
          <svg
            className="w-12 h-12 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm">Failed to load image</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Skeleton placeholder */}
      {isLoading && (
        <Skeleton
          className={cn(
            'absolute inset-0 z-10',
            !fill && 'w-full h-full'
          )}
          style={!fill ? { width, height } : undefined}
        />
      )}

      {/* Next.js optimized image */}
      <Image
        src={src}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        fill={fill}
        sizes={sizes}
        quality={quality}
        priority={priority}
        className={cn(
          'transition-all duration-500',
          isLoading && blur && 'blur-sm scale-105',
          !isLoading && 'blur-0 scale-100',
          fill && 'object-cover'
        )}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  )
}

/**
 * Simple progressive image without Next.js Image optimization
 * Useful for external images or when you need more control
 */
interface ProgressiveImageSimpleProps {
  src: string
  alt: string
  className?: string
  blur?: boolean
  blurDataURL?: string
  onLoad?: () => void
  onError?: (error: Error) => void
}

export function ProgressiveImageSimple({
  src,
  alt,
  className = '',
  blur = true,
  blurDataURL,
  onLoad,
  onError,
}: ProgressiveImageSimpleProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(blurDataURL || src)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Reset states
    setIsLoaded(false)
    setHasError(false)
    setCurrentSrc(blurDataURL || src)

    // Preload full image
    const img = new window.Image()
    img.src = src

    img.onload = () => {
      setCurrentSrc(src)
      setIsLoaded(true)
      onLoad?.()
    }

    img.onerror = () => {
      setHasError(true)
      onError?.(new Error(`Failed to load image: ${src}`))
    }

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src, blurDataURL, onLoad, onError])

  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          className
        )}
      >
        <div className="text-center p-4">
          <svg
            className="w-12 h-12 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm">Failed to load image</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <img
        src={currentSrc}
        alt={alt}
        className={cn(
          'transition-all duration-500',
          !isLoaded && blur && 'blur-sm',
          isLoaded && 'blur-0',
          className
        )}
      />
      {!isLoaded && <Skeleton className="absolute inset-0" />}
    </div>
  )
}

/**
 * Progressive background image
 * Useful for hero sections or backgrounds
 */
interface ProgressiveBackgroundProps {
  src: string
  className?: string
  blur?: boolean
  children?: React.ReactNode
  onLoad?: () => void
}

export function ProgressiveBackground({
  src,
  className = '',
  blur = true,
  children,
  onLoad,
}: ProgressiveBackgroundProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const img = new window.Image()
    img.src = src

    img.onload = () => {
      setIsLoaded(true)
      onLoad?.()
    }

    return () => {
      img.onload = null
    }
  }, [src, onLoad])

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{
        backgroundImage: isLoaded ? `url(${src})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {!isLoaded && <Skeleton className="absolute inset-0" />}
      <div
        className={cn(
          'transition-all duration-500',
          !isLoaded && blur && 'blur-lg backdrop-blur-sm',
          isLoaded && 'blur-0'
        )}
      >
        {children}
      </div>
    </div>
  )
}
