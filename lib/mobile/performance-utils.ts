/**
 * Mobile Performance Optimization Utilities
 * Image compression, lazy loading helpers, performance monitoring
 * 
 * Features:
 * - Image compression before upload
 * - Adaptive loading based on network
 * - Performance metrics tracking
 * - Memory management
 */

/**
 * Compress image file before upload (client-side)
 * @param file Original image file
 * @param options Compression options
 * @returns Compressed image blob
 */
export async function compressImage(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    mimeType?: string;
  } = {}
): Promise<Blob> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85,
    mimeType = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Generate low-quality placeholder (blur-up)
 */
export async function generatePlaceholder(
  file: File | Blob,
  size: number = 20
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, size, size);

        resolve(canvas.toDataURL('image/jpeg', 0.1));
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Check if browser supports WebP format
 */
export function supportsWebP(): boolean {
  if (typeof window === 'undefined') return false;

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Check if browser supports AVIF format
 */
export async function supportsAVIF(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  return new Promise((resolve) => {
    const avif = new Image();
    avif.src =
      'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
    avif.onload = () => resolve(true);
    avif.onerror = () => resolve(false);
  });
}

/**
 * Get optimal image format based on browser support
 */
export async function getOptimalFormat(): Promise<'avif' | 'webp' | 'jpeg'> {
  if (await supportsAVIF()) return 'avif';
  if (supportsWebP()) return 'webp';
  return 'jpeg';
}

/**
 * Performance Metrics Tracker
 */
export class PerformanceTracker {
  private marks: Map<string, number> = new Map();
  private measures: Map<string, number> = new Map();

  /**
   * Mark a point in time
   */
  mark(name: string): void {
    if (typeof window === 'undefined' || !window.performance) return;

    this.marks.set(name, performance.now());
    performance.mark(name);
  }

  /**
   * Measure time between two marks
   */
  measure(name: string, startMark: string, endMark?: string): number {
    if (typeof window === 'undefined' || !window.performance) return 0;

    const start = this.marks.get(startMark);
    const end = endMark ? this.marks.get(endMark) : performance.now();

    if (!start || !end) return 0;

    const duration = end - start;
    this.measures.set(name, duration);

    try {
      performance.measure(name, startMark, endMark);
    } catch {
      // Silently fail if marks don't exist
    }

    return duration;
  }

  /**
   * Get all measures
   */
  getMeasures(): Record<string, number> {
    return Object.fromEntries(this.measures);
  }

  /**
   * Clear all marks and measures
   */
  clear(): void {
    this.marks.clear();
    this.measures.clear();
    
    if (typeof window !== 'undefined' && window.performance) {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }

  /**
   * Get Core Web Vitals
   */
  async getCoreWebVitals(): Promise<{
    LCP?: number;
    FID?: number;
    CLS?: number;
    FCP?: number;
    TTFB?: number;
  }> {
    if (typeof window === 'undefined' || !window.performance) {
      return {};
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');

    const vitals: any = {};

    // Time to First Byte
    if (navigation) {
      vitals.TTFB = navigation.responseStart - navigation.requestStart;
    }

    // First Contentful Paint
    const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
    if (fcp) {
      vitals.FCP = fcp.startTime;
    }

    // Largest Contentful Paint (requires web-vitals library)
    // First Input Delay (requires web-vitals library)
    // Cumulative Layout Shift (requires web-vitals library)

    return vitals;
  }
}

/**
 * Memory Monitor
 */
export class MemoryMonitor {
  /**
   * Get current memory usage (if available)
   */
  getMemoryUsage(): {
    usedJSHeapSize?: number;
    totalJSHeapSize?: number;
    jsHeapSizeLimit?: number;
    usedPercent?: number;
  } {
    if (typeof window === 'undefined') return {};

    const memory = (performance as any).memory;
    if (!memory) return {};

    const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usedPercent: Math.round(usedPercent * 100) / 100,
    };
  }

  /**
   * Check if memory usage is high (>80%)
   */
  isMemoryHigh(): boolean {
    const usage = this.getMemoryUsage();
    return usage.usedPercent ? usage.usedPercent > 80 : false;
  }

  /**
   * Log memory usage to console
   */
  logMemory(): void {
    const usage = this.getMemoryUsage();
    if (!usage.usedJSHeapSize) {
      console.log('Memory API not available');
      return;
    }

    console.group('Memory Usage');
    console.log('Used:', Math.round(usage.usedJSHeapSize! / 1024 / 1024), 'MB');
    console.log('Total:', Math.round(usage.totalJSHeapSize! / 1024 / 1024), 'MB');
    console.log('Limit:', Math.round(usage.jsHeapSizeLimit! / 1024 / 1024), 'MB');
    console.log('Used %:', usage.usedPercent);
    console.groupEnd();
  }
}

/**
 * Adaptive Loading Manager
 * Adjusts resource loading based on device capabilities and network
 */
export class AdaptiveLoadingManager {
  private networkType: '4g' | '3g' | '2g' | 'slow-2g' | 'unknown' = '4g';
  private saveData: boolean = false;
  private deviceMemory: number = 8; // GB

  constructor() {
    if (typeof window === 'undefined') return;

    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (connection) {
      this.networkType = connection.effectiveType || '4g';
      this.saveData = connection.saveData || false;
    }

    this.deviceMemory = (navigator as any).deviceMemory || 8;
  }

  /**
   * Should load high-quality resources?
   */
  shouldLoadHighQuality(): boolean {
    return (
      this.networkType === '4g' &&
      !this.saveData &&
      this.deviceMemory >= 4
    );
  }

  /**
   * Get recommended image quality (0-100)
   */
  getRecommendedQuality(): number {
    if (this.saveData) return 50;
    
    switch (this.networkType) {
      case '4g': return 90;
      case '3g': return 70;
      case '2g': return 50;
      case 'slow-2g': return 40;
      default: return 75;
    }
  }

  /**
   * Get recommended concurrent requests
   */
  getRecommendedConcurrency(): number {
    if (this.saveData) return 2;
    
    switch (this.networkType) {
      case '4g': return 6;
      case '3g': return 4;
      case '2g': return 2;
      case 'slow-2g': return 1;
      default: return 4;
    }
  }

  /**
   * Should prefetch resources?
   */
  shouldPrefetch(): boolean {
    return (
      this.networkType === '4g' &&
      !this.saveData
    );
  }

  /**
   * Should lazy load images?
   */
  shouldLazyLoad(): boolean {
    return (
      this.networkType !== '4g' ||
      this.saveData ||
      this.deviceMemory < 4
    );
  }
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Request Idle Callback polyfill
 */
export const requestIdleCallback =
  typeof window !== 'undefined' && 'requestIdleCallback' in window
    ? window.requestIdleCallback
    : (cb: IdleRequestCallback) => setTimeout(cb, 1);

export const cancelIdleCallback =
  typeof window !== 'undefined' && 'cancelIdleCallback' in window
    ? window.cancelIdleCallback
    : (id: number) => clearTimeout(id);

/**
 * Check if device has good hardware
 */
export function hasGoodHardware(): boolean {
  if (typeof window === 'undefined') return true;

  const memory = (navigator as any).deviceMemory || 8;
  const cores = navigator.hardwareConcurrency || 4;

  return memory >= 4 && cores >= 4;
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources(urls: string[]): void {
  if (typeof window === 'undefined') return;

  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
}

/**
 * Prefetch resources for next navigation
 */
export function prefetchResources(urls: string[]): void {
  if (typeof window === 'undefined') return;

  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  });
}
