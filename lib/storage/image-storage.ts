/**
 * Image Storage Manager
 * 
 * Manages image storage in Supabase Storage with multi-tier optimization:
 * 
 * Storage Structure:
 * - analysis-images/
 *   - original/        (Full resolution - for re-analysis)
 *   - display/         (Optimized 1920x1080 - for viewing)
 *   - thumbnails/      (512x512 WebP - fast loading)
 * 
 * Features:
 * - Multi-tier upload (original + optimized versions)
 * - CDN delivery via Supabase Storage
 * - Automatic optimization
 * - Batch operations
 * - Progress tracking
 * - Error handling & retries
 * 
 * Usage:
 * ```typescript
 * const storage = new ImageStorageManager();
 * 
 * // Upload with auto-optimization
 * const urls = await storage.uploadImage(buffer, 'user123/selfie.jpg');
 * // Returns: { original, display, thumbnail }
 * 
 * // Get optimized URL
 * const displayUrl = await storage.getImageUrl('user123/selfie.jpg', 'display');
 * ```
 */

import { createServiceClient } from '@/lib/supabase/server';
import { ImageOptimizer, ImageTier, ImageFormat } from './image-optimizer';

// Re-export for convenience
export { ImageTier, ImageFormat } from './image-optimizer';

/**
 * Storage paths for different tiers
 */
const STORAGE_PATHS = {
  [ImageTier.ORIGINAL]: 'original',
  [ImageTier.DISPLAY]: 'display',
  [ImageTier.THUMBNAIL]: 'thumbnails',
} as const;

/**
 * Supabase Storage bucket name
 */
const BUCKET_NAME = 'analysis-images';

/**
 * Upload result
 */
export interface UploadResult {
  success: boolean;
  urls: {
    original: string;
    display: string;
    thumbnail: string;
  };
  metadata: {
    originalSize: number;
    displaySize: number;
    thumbnailSize: number;
    compressionSavings: number;  // Total bytes saved
  };
  error?: string;
}

/**
 * Upload progress callback
 */
export type UploadProgressCallback = (progress: {
  stage: 'validating' | 'optimizing' | 'uploading' | 'complete';
  percent: number;
  message: string;
}) => void;

/**
 * Batch upload options
 */
export interface BatchUploadOptions {
  onProgress?: (fileIndex: number, total: number, result: UploadResult) => void;
  continueOnError?: boolean;
}

/**
 * Image Storage Manager
 */
export class ImageStorageManager {
  private readonly supabase: ReturnType<typeof createServiceClient>;

  constructor() {
    this.supabase = createServiceClient();
  }

  /**
   * Initialize storage bucket (call once on setup)
   */
  async initializeBucket(): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if bucket exists
      const { data: buckets, error: listError } = await this.supabase.storage.listBuckets();

      if (listError) {
        return { success: false, error: listError.message };
      }

      const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

      if (!bucketExists) {
        // Create bucket with public access
        const { error: createError } = await this.supabase.storage.createBucket(BUCKET_NAME, {
          public: true,
          fileSizeLimit: 52428800, // 50MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        });

        if (createError) {
          return { success: false, error: createError.message };
        }
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Upload image with multi-tier optimization
   * 
   * @param buffer - Image buffer or file path
   * @param storagePath - Storage path (e.g., 'user123/selfie.jpg')
   * @param onProgress - Optional progress callback
   */
  async uploadImage(
    buffer: Buffer | string,
    storagePath: string,
    onProgress?: UploadProgressCallback
  ): Promise<UploadResult> {
    try {
      // Stage 1: Validate image
      onProgress?.({ 
        stage: 'validating', 
        percent: 0, 
        message: 'กำลังตรวจสอบรูปภาพ...' 
      });

      const validation = await ImageOptimizer.validateImage(buffer);
      if (!validation.valid) {
        return {
          success: false,
          urls: { original: '', display: '', thumbnail: '' },
          metadata: { 
            originalSize: 0, 
            displaySize: 0, 
            thumbnailSize: 0,
            compressionSavings: 0 
          },
          error: validation.error,
        };
      }

      // Stage 2: Optimize for all tiers
      onProgress?.({ 
        stage: 'optimizing', 
        percent: 20, 
        message: 'กำลังปรับแต่งรูปภาพ...' 
      });

      const optimized = await ImageOptimizer.optimizeAll(buffer);

      // Stage 3: Upload to Supabase Storage
      onProgress?.({ 
        stage: 'uploading', 
        percent: 50, 
        message: 'กำลังอัพโหลด...' 
      });

      const uploadPromises = Object.entries(optimized).map(async ([tier, result]) => {
        const tierPath = STORAGE_PATHS[tier as ImageTier];
        const filename = this.generateFilename(storagePath, tier as ImageTier, result.format);
        const fullPath = `${tierPath}/${filename}`;

        const { error } = await this.supabase.storage
          .from(BUCKET_NAME)
          .upload(fullPath, result.buffer, {
            contentType: `image/${result.format}`,
            upsert: true,
            cacheControl: '3600', // Cache for 1 hour
          });

        if (error) throw error;

        // Get public URL
        const { data } = this.supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(fullPath);

        return { tier, url: data.publicUrl, size: result.size };
      });

      const uploadResults = await Promise.all(uploadPromises);

      // Stage 4: Complete
      onProgress?.({ 
        stage: 'complete', 
        percent: 100, 
        message: 'อัพโหลดสำเร็จ!' 
      });

      // Build result
      const urls = uploadResults.reduce((acc, { tier, url }) => {
        acc[tier as keyof typeof acc] = url;
        return acc;
      }, { original: '', display: '', thumbnail: '' });

      const metadata = {
        originalSize: uploadResults.find(r => r.tier === ImageTier.ORIGINAL)?.size || 0,
        displaySize: uploadResults.find(r => r.tier === ImageTier.DISPLAY)?.size || 0,
        thumbnailSize: uploadResults.find(r => r.tier === ImageTier.THUMBNAIL)?.size || 0,
        compressionSavings: 0,
      };

      metadata.compressionSavings = 
        metadata.originalSize - metadata.displaySize - metadata.thumbnailSize;

      return {
        success: true,
        urls,
        metadata,
      };

    } catch (error) {
      return {
        success: false,
        urls: { original: '', display: '', thumbnail: '' },
        metadata: { 
          originalSize: 0, 
          displaySize: 0, 
          thumbnailSize: 0,
          compressionSavings: 0 
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get image URL for specific tier
   */
  async getImageUrl(
    storagePath: string,
    tier: ImageTier = ImageTier.DISPLAY
  ): Promise<string | null> {
    try {
      const tierPath = STORAGE_PATHS[tier];
      const fullPath = `${tierPath}/${storagePath}`;

      const { data } = this.supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fullPath);

      return data.publicUrl;
    } catch (error) {
      console.error(`Failed to get image URL: ${error}`);
      return null;
    }
  }

  /**
   * Get all tier URLs for an image
   */
  async getImageUrls(storagePath: string): Promise<{
    original: string;
    display: string;
    thumbnail: string;
  } | null> {
    try {
      const [original, display, thumbnail] = await Promise.all([
        this.getImageUrl(storagePath, ImageTier.ORIGINAL),
        this.getImageUrl(storagePath, ImageTier.DISPLAY),
        this.getImageUrl(storagePath, ImageTier.THUMBNAIL),
      ]);

      if (!original || !display || !thumbnail) return null;

      return { original, display, thumbnail };
    } catch (error) {
      console.error(`Failed to get image URLs: ${error}`);
      return null;
    }
  }

  /**
   * Delete image (all tiers)
   */
  async deleteImage(storagePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const deletePromises = Object.values(STORAGE_PATHS).map(tierPath => {
        const fullPath = `${tierPath}/${storagePath}`;
        return this.supabase.storage.from(BUCKET_NAME).remove([fullPath]);
      });

      await Promise.all(deletePromises);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Batch upload multiple images
   */
  async uploadBatch(
    images: Array<{ buffer: Buffer | string; storagePath: string }>,
    options?: BatchUploadOptions
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (let i = 0; i < images.length; i++) {
      const { buffer, storagePath } = images[i];

      try {
        const result = await this.uploadImage(buffer, storagePath);
        results.push(result);

        options?.onProgress?.(i + 1, images.length, result);

        if (!result.success && !options?.continueOnError) {
          break;
        }
      } catch (error) {
        const errorResult: UploadResult = {
          success: false,
          urls: { original: '', display: '', thumbnail: '' },
          metadata: { 
            originalSize: 0, 
            displaySize: 0, 
            thumbnailSize: 0,
            compressionSavings: 0 
          },
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        results.push(errorResult);

        if (!options?.continueOnError) break;
      }
    }

    return results;
  }

  /**
   * List images in storage
   */
  async listImages(
    folder?: string,
    tier: ImageTier = ImageTier.DISPLAY
  ): Promise<Array<{ name: string; url: string; size: number }>> {
    try {
      const tierPath = STORAGE_PATHS[tier];
      const path = folder ? `${tierPath}/${folder}` : tierPath;

      const { data, error } = await this.supabase.storage
        .from(BUCKET_NAME)
        .list(path);

      if (error) throw error;

      return (data || []).map(file => ({
        name: file.name,
        url: this.supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(`${path}/${file.name}`).data.publicUrl,
        size: file.metadata?.size || 0,
      }));
    } catch (error) {
      console.error(`Failed to list images: ${error}`);
      return [];
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(folder?: string): Promise<{
    totalFiles: number;
    totalSize: number;
    tierSizes: Record<ImageTier, number>;
  }> {
    try {
      const statsPromises = Object.entries(STORAGE_PATHS).map(async ([tier, path]) => {
        const fullPath = folder ? `${path}/${folder}` : path;
        const { data } = await this.supabase.storage.from(BUCKET_NAME).list(fullPath);
        
        const size = (data || []).reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
        return { tier: tier as ImageTier, count: data?.length || 0, size };
      });

      const stats = await Promise.all(statsPromises);

      return {
        totalFiles: stats.reduce((sum, s) => sum + s.count, 0),
        totalSize: stats.reduce((sum, s) => sum + s.size, 0),
        tierSizes: stats.reduce((acc, s) => {
          acc[s.tier] = s.size;
          return acc;
        }, {} as Record<ImageTier, number>),
      };
    } catch (error) {
      console.error(`Failed to get storage stats: ${error}`);
      return {
        totalFiles: 0,
        totalSize: 0,
        tierSizes: {
          [ImageTier.ORIGINAL]: 0,
          [ImageTier.DISPLAY]: 0,
          [ImageTier.THUMBNAIL]: 0,
        },
      };
    }
  }

  /**
   * Helper: Generate filename for tier
   */
  private generateFilename(storagePath: string, tier: ImageTier, format: ImageFormat): string {
    return ImageOptimizer.generateFilename(storagePath, tier, format);
  }
}

/**
 * Singleton instance for convenience
 */
let storageInstance: ImageStorageManager | null = null;

export function getStorageManager(): ImageStorageManager {
  storageInstance ??= new ImageStorageManager();
  return storageInstance;
}

export default ImageStorageManager;
