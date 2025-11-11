'use client';

import { useEffect, useState } from 'react';
import { getCacheStats, formatBytes, isOnline, onConnectionChange } from '@/lib/utils/service-worker-utils';

interface CacheStats {
  static: number;
  dynamic: number;
  images: number;
  total: number;
}

interface PerformanceMetrics {
  cacheHitRate: number;
  cacheHits: number;
  cacheMisses: number;
  totalRequests: number;
  avgResponseTime: number;
  initializationTime: number;
  memoryUsage: number;
}

export function PerformanceMonitoringDashboard() {
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [online, setOnline] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check online status
    setOnline(isOnline());
    
    // Listen for connection changes
    const cleanup = onConnectionChange((status) => {
      setOnline(status);
    });

    // Load cache stats
    loadCacheStats();

    return cleanup;
  }, []);

  const loadCacheStats = async () => {
    setLoading(true);
    const stats = await getCacheStats();
    setCacheStats(stats);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">⚡ Performance Metrics</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          online ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {online ? '🟢 Online' : '🔴 Offline'}
        </div>
      </div>

      {/* Cache Statistics */}
      {cacheStats && (
        <div className="space-y-4">
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Cache Storage</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-xs text-blue-600 font-medium mb-1">Static</p>
                <p className="text-lg font-bold text-blue-900">{formatBytes(cacheStats.static)}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-xs text-purple-600 font-medium mb-1">Dynamic</p>
                <p className="text-lg font-bold text-purple-900">{formatBytes(cacheStats.dynamic)}</p>
              </div>
              <div className="bg-pink-50 p-4 rounded-lg">
                <p className="text-xs text-pink-600 font-medium mb-1">Images</p>
                <p className="text-lg font-bold text-pink-900">{formatBytes(cacheStats.images)}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-xs text-green-600 font-medium mb-1">Total</p>
                <p className="text-lg font-bold text-green-900">{formatBytes(cacheStats.total)}</p>
              </div>
            </div>
          </div>

          {/* Cache Actions */}
          <div className="border-t pt-4">
            <button
              onClick={loadCacheStats}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              🔄 Refresh Stats
            </button>
          </div>
        </div>
      )}

      {!cacheStats && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Service Worker not active</p>
          <p className="text-sm text-gray-400">Enable Service Worker for offline support and caching</p>
        </div>
      )}

      {/* Performance Tips */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">💡 Optimization Tips</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Images are cached automatically for faster loading</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Analysis results are cached for 5 minutes</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Offline mode available for previously viewed content</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Service Worker provides background caching</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
