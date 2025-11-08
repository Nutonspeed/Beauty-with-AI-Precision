/**
 * Performance Monitoring Initializer
 * Initializes performance monitoring on client-side
 */

'use client';

import { useEffect } from 'react';
import { initPerformanceMonitoring } from '@/lib/utils/performance-monitoring';

export function PerformanceInit() {
  useEffect(() => {
    // Only initialize in production or when explicitly enabled
    const shouldInitialize =
      process.env.NODE_ENV === 'production' ||
      process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true';

    if (shouldInitialize) {
      initPerformanceMonitoring();
      console.log('✅ Performance monitoring initialized');
    } else {
      console.log('ℹ️ Performance monitoring disabled in development');
    }
  }, []);

  return null;
}
