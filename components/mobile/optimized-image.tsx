/**
 * Optimized Image Component for Mobile
 * Lazy loading, responsive srcset, blur placeholder
 * 
 * Features:
 * - Automatic lazy loading
 * - Responsive image sizes
 * - Blur-up placeholder
 * - WebP format support
 * - Intersection Observer
 * - Error handling with fallback
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image, { type ImageProps } from 'next/image';
import { cn } from '@/lib/utils';
import { useMobileDetection, useNetworkInfo } from '@/hooks/use-mobile-detection';

export interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  alt: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape' | number;
  lazy?: boolean;
  blur?: boolean;
  fallbackSrc?: string;
  lowQualitySrc?: string;
  onLoad?: () => void;
  onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  adaptiveQuality?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  aspectRatio = 'video',
  lazy = true,
  blur = true,
  fallbackSrc = '/images/placeholder.svg',
  lowQualitySrc,
  className,
  onLoad,
  onError,
  adaptiveQuality = true,
  fill,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef<HTMLDivElement>(null);
  
  const { isMobile, screenWidth } = useMobileDetection();
  const { effectiveType, saveData } = useNetworkInfo();

  // Calculate quality based on network and device
  const quality = adaptiveQuality ? (
    saveData ? 50 :
    effectiveType === '4g' ? 90 :
    effectiveType === '3g' ? 70 :
    effectiveType === '2g' ? 50 : 60
  ) : 75;

  // Calculate sizes based on device
  const sizes = isMobile
    ? '100vw'
    : screenWidth < 1024
    ? '50vw'
    : '33vw';

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [lazy, isInView]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    onError?.(event);
  }, [onError]);

  // Get aspect ratio value
  const getAspectRatio = () => {
    if (typeof aspectRatio === 'number') return aspectRatio;
    
    switch (aspectRatio) {
      case 'square': return 1;
      case 'video': return 16 / 9;
      case 'portrait': return 3 / 4;
      case 'landscape': return 4 / 3;
      default: return undefined;
    }
  };

  const aspectValue = getAspectRatio();

  // Apply aspect ratio class
  const aspectClass = aspectValue ? `aspect-[${aspectValue}]` : '';

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden',
        'bg-gray-100 dark:bg-gray-800',
        aspectClass,
        className
      )}
    >
      {isInView && (
        <>
          {/* Blur placeholder */}
          {blur && !isLoaded && !hasError && (
            <div
              className={cn(
                'absolute inset-0',
                'bg-gradient-to-br from-gray-200 to-gray-300',
                'dark:from-gray-700 dark:to-gray-800',
                'animate-pulse'
              )}
              aria-hidden="true"
            />
          )}

          {/* Low quality placeholder (if provided) */}
          {lowQualitySrc && !isLoaded && !hasError && (
            <Image
              src={lowQualitySrc}
              alt={alt}
              fill
              className="blur-sm scale-110"
              quality={10}
              aria-hidden="true"
            />
          )}

          {/* Main image */}
          <Image
            src={hasError ? fallbackSrc : src}
            alt={alt}
            fill={fill ?? true}
            quality={quality}
            sizes={sizes}
            className={cn(
              'object-cover',
              'transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={handleLoad}
            onError={handleError}
            {...props}
          />

          {/* Loading state */}
          {!isLoaded && !hasError && (
            <div
              className={cn(
                'absolute inset-0',
                'flex items-center justify-center',
                'bg-black/5'
              )}
              aria-label="Loading image"
            >
              <div className="spinner-mobile" />
            </div>
          )}

          {/* Error state */}
          {hasError && (
            <div
              className={cn(
                'absolute inset-0',
                'flex flex-col items-center justify-center',
                'text-gray-500 dark:text-gray-400',
                'text-sm'
              )}
            >
              <svg
                className="w-12 h-12 mb-2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Image failed to load</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Gallery Component for Mobile
 * Swipeable image gallery with thumbnails
 */
export interface MobileGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  initialIndex?: number;
  className?: string;
  onClose?: () => void;
}

export function MobileGallery({
  images,
  initialIndex = 0,
  className,
  onClose,
}: MobileGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < images.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
    
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-50',
        'bg-black',
        'flex flex-col',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white safe-area-inset-top">
        <div className="text-sm">
          {currentIndex + 1} / {images.length}
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close gallery"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Main Image */}
      <div
        className="flex-1 relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <OptimizedImage
          src={images[currentIndex].src}
          alt={images[currentIndex].alt}
          fill
          className="object-contain"
          lazy={false}
          blur={false}
        />

        {/* Navigation Arrows (desktop) */}
        {currentIndex > 0 && (
          <button
            onClick={goToPrevious}
            className={cn(
              'absolute left-4 top-1/2 -translate-y-1/2',
              'p-3 rounded-full',
              'bg-black/50 text-white',
              'hover:bg-black/70',
              'transition-colors',
              'hidden md:flex items-center justify-center'
            )}
            aria-label="Previous image"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {currentIndex < images.length - 1 && (
          <button
            onClick={goToNext}
            className={cn(
              'absolute right-4 top-1/2 -translate-y-1/2',
              'p-3 rounded-full',
              'bg-black/50 text-white',
              'hover:bg-black/70',
              'transition-colors',
              'hidden md:flex items-center justify-center'
            )}
            aria-label="Next image"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Caption */}
      {images[currentIndex].caption && (
        <div className="p-4 text-white text-center bg-black/50">
          {images[currentIndex].caption}
        </div>
      )}

      {/* Thumbnails */}
      <div className="flex gap-2 p-4 overflow-x-auto safe-area-inset-bottom">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              'relative flex-shrink-0',
              'w-16 h-16 rounded-lg overflow-hidden',
              'border-2 transition-colors',
              index === currentIndex
                ? 'border-white'
                : 'border-transparent opacity-50 hover:opacity-100'
            )}
            aria-label={`Go to image ${index + 1}`}
          >
            <OptimizedImage
              src={image.src}
              alt={`Thumbnail ${index + 1}`}
              fill
              lazy={false}
            />
          </button>
        ))}
      </div>

      {/* Swipe Indicator */}
      <div className="flex justify-center gap-2 pb-4 safe-area-inset-bottom">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              'h-2 rounded-full transition-all',
              index === currentIndex
                ? 'w-6 bg-white'
                : 'w-2 bg-white/50'
            )}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
