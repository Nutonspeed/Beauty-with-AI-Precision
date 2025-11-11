/**
 * useImageUpload Hook
 * 
 * React hook for uploading images with progress tracking
 * 
 * Features:
 * - Multi-tier upload (original, display, thumbnail)
 * - Progress tracking
 * - Error handling
 * - Cancel support
 * - Automatic optimization
 * 
 * Usage:
 * ```tsx
 * const { upload, uploading, progress, error } = useImageUpload();
 * 
 * const handleUpload = async (file: File) => {
 *   const result = await upload(file);
 *   if (result.success) {
 *     console.log('URLs:', result.urls);
 *   }
 * };
 * ```
 */

'use client';

import { useState, useCallback, useRef } from 'react';

/**
 * Upload result
 */
export interface UploadResult {
  success: boolean;
  urls?: {
    original: string;
    display: string;
    thumbnail: string;
  };
  metadata?: {
    originalSize: string;
    displaySize: string;
    thumbnailSize: string;
    compressionSavings: string;
    savingsPercent: string;
  };
  storagePath?: string;
  error?: string;
}

/**
 * Upload progress
 */
export interface UploadProgress {
  percent: number;
  stage: 'validating' | 'optimizing' | 'uploading' | 'complete';
  message: string;
}

/**
 * Hook options
 */
export interface UseImageUploadOptions {
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: UploadProgress) => void;
  customPath?: (file: File) => string;  // Generate custom storage path
}

/**
 * useImageUpload Hook
 */
export function useImageUpload(options?: UseImageUploadOptions) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    percent: 0,
    stage: 'validating',
    message: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Upload single file
   */
  const upload = useCallback(async (file: File): Promise<UploadResult> => {
    try {
      setUploading(true);
      setError(null);
      setProgress({ percent: 0, stage: 'validating', message: 'กำลังเตรียม...' });

      // Create abort controller
      abortControllerRef.current = new AbortController();

      // Prepare form data
      const formData = new FormData();
      formData.append('file', file);

      // Add custom path if provided
      if (options?.customPath) {
        const path = options.customPath(file);
        formData.append('path', path);
      }

      // Simulate progress stages
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev.percent >= 90) return prev;
          return {
            ...prev,
            percent: prev.percent + 10,
          };
        });
      }, 200);

      // Upload to API
      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
        signal: abortControllerRef.current.signal,
      });

      clearInterval(progressInterval);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      // Complete
      setProgress({ percent: 100, stage: 'complete', message: 'อัพโหลดสำเร็จ!' });
      setResult(data);
      
      options?.onSuccess?.(data);
      options?.onProgress?.({ percent: 100, stage: 'complete', message: 'อัพโหลดสำเร็จ!' });

      return data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      options?.onError?.(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setUploading(false);
      abortControllerRef.current = null;
    }
  }, [options]);

  /**
   * Upload multiple files
   */
  const uploadBatch = useCallback(async (files: File[]): Promise<UploadResult[]> => {
    const results: UploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      setProgress({
        percent: Math.floor((i / files.length) * 100),
        stage: 'uploading',
        message: `กำลังอัพโหลด ${i + 1}/${files.length}`,
      });

      const result = await upload(file);
      results.push(result);

      if (!result.success) {
        // Stop on first error
        break;
      }
    }

    return results;
  }, [upload]);

  /**
   * Cancel upload
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setUploading(false);
      setError('Upload cancelled');
    }
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setUploading(false);
    setProgress({ percent: 0, stage: 'validating', message: '' });
    setError(null);
    setResult(null);
  }, []);

  return {
    upload,
    uploadBatch,
    cancel,
    reset,
    uploading,
    progress,
    error,
    result,
  };
}

/**
 * useImageUrl Hook
 * 
 * Fetch image URLs for existing images
 */
export function useImageUrl(storagePath: string | null) {
  const [loading, setLoading] = useState(false);
  const [urls, setUrls] = useState<{
    original: string;
    display: string;
    thumbnail: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUrls = useCallback(async () => {
    if (!storagePath) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/storage/upload?path=${encodeURIComponent(storagePath)}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch URLs');
      }

      setUrls(data.urls);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch URLs';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [storagePath]);

  return {
    fetchUrls,
    loading,
    urls,
    error,
  };
}

/**
 * useImageDelete Hook
 * 
 * Delete images from storage
 */
export function useImageDelete() {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteImage = useCallback(async (storagePath: string): Promise<boolean> => {
    try {
      setDeleting(true);
      setError(null);

      const response = await fetch(
        `/api/storage/upload?path=${encodeURIComponent(storagePath)}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Delete failed');
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      setError(errorMessage);
      return false;
    } finally {
      setDeleting(false);
    }
  }, []);

  return {
    deleteImage,
    deleting,
    error,
  };
}

export default useImageUpload;
