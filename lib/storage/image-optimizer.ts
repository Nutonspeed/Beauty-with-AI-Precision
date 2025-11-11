/**
 * Image Optimizer
 * 
 * Optimize images for different use cases:
 * 1. Original - Full resolution (stored for re-analysis)
 * 2. Display - Optimized for viewing (1920x1080 max)
 * 3. Thumbnail - Fast loading (512x512)
 * 
 * Features:
 * - Smart resizing (maintain aspect ratio)
 * - Format conversion (JPEG, WebP, PNG)
 * - Quality optimization
 * - File size reduction (70-90% smaller)
 * 
 * Strategy:
 * ✅ Keep original for accuracy
 * ✅ Optimize for display (save bandwidth)
 * ✅ Generate thumbnails (fast loading)
 */

import sharp from 'sharp';

/**
 * Image optimization tiers
 */
export enum ImageTier {
  ORIGINAL = 'original',      // Full resolution (no optimization)
  DISPLAY = 'display',         // Optimized for viewing (1920x1080 max)
  THUMBNAIL = 'thumbnail',     // Fast loading (512x512)
}

/**
 * Image format options
 */
export enum ImageFormat {
  JPEG = 'jpeg',
  WEBP = 'webp',
  PNG = 'png',
}

/**
 * Optimization options
 */
export interface OptimizationOptions {
  tier: ImageTier;
  format?: ImageFormat;
  quality?: number;  // 1-100 (default: auto based on tier)
}

/**
 * Optimization result
 */
export interface OptimizationResult {
  buffer: Buffer;
  format: ImageFormat;
  width: number;
  height: number;
  size: number;  // File size in bytes
  originalSize: number;
  compressionRatio: number;  // e.g., 0.85 = 85% smaller
}

/**
 * Image metadata
 */
export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  aspectRatio: number;
}

/**
 * Default optimization settings per tier
 */
const TIER_SETTINGS = {
  [ImageTier.ORIGINAL]: {
    maxWidth: null,
    maxHeight: null,
    quality: 100,
    format: ImageFormat.PNG,
  },
  [ImageTier.DISPLAY]: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 85,
    format: ImageFormat.JPEG,
  },
  [ImageTier.THUMBNAIL]: {
    maxWidth: 512,
    maxHeight: 512,
    quality: 80,
    format: ImageFormat.WEBP,
  },
};

/**
 * Image Optimizer Class
 */
export class ImageOptimizer {
  /**
   * Get image metadata without loading full image
   */
  static async getMetadata(input: Buffer | string): Promise<ImageMetadata> {
    const image = sharp(input);
    const metadata = await image.metadata();

    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'unknown',
      size: input instanceof Buffer ? input.length : 0,
      aspectRatio: metadata.width && metadata.height 
        ? metadata.width / metadata.height 
        : 0,
    };
  }

  /**
   * Optimize image for specific tier
   */
  static async optimize(
    input: Buffer | string,
    options: OptimizationOptions
  ): Promise<OptimizationResult> {
    const { tier, format, quality } = options;
    const settings = TIER_SETTINGS[tier];

    // Get original metadata
    const metadata = await this.getMetadata(input);
    const originalSize = input instanceof Buffer ? input.length : 0;

    // Original tier - no optimization
    if (tier === ImageTier.ORIGINAL) {
      let buffer: Buffer;
      if (input instanceof Buffer) {
        buffer = input;
      } else {
        const response = await fetch(input as string);
        const arrayBuffer = await response.arrayBuffer();
        buffer = Buffer.from(new Uint8Array(arrayBuffer));
      }
      
      return {
        buffer,
        format: format || ImageFormat.PNG,
        width: metadata.width,
        height: metadata.height,
        size: buffer.length,
        originalSize,
        compressionRatio: 0,
      };
    }

    // Start sharp pipeline
    let pipeline = sharp(input);

    // Resize if needed
    if (settings.maxWidth || settings.maxHeight) {
      pipeline = pipeline.resize(settings.maxWidth, settings.maxHeight, {
        fit: 'inside',  // Maintain aspect ratio
        withoutEnlargement: true,  // Don't upscale
      });
    }

    // Convert format
    const targetFormat = format || settings.format;
    const targetQuality = quality || settings.quality;

    switch (targetFormat) {
      case ImageFormat.JPEG:
        pipeline = pipeline.jpeg({
          quality: targetQuality,
          progressive: true,
          mozjpeg: true,
        });
        break;

      case ImageFormat.WEBP:
        pipeline = pipeline.webp({
          quality: targetQuality,
          effort: 4,  // Balance between speed and compression
        });
        break;

      case ImageFormat.PNG:
        pipeline = pipeline.png({
          quality: targetQuality,
          compressionLevel: 9,
          progressive: true,
        });
        break;
    }

    // Execute pipeline
    const buffer = await pipeline.toBuffer();
    const optimizedMetadata = await sharp(buffer).metadata();

    return {
      buffer,
      format: targetFormat,
      width: optimizedMetadata.width || 0,
      height: optimizedMetadata.height || 0,
      size: buffer.length,
      originalSize,
      compressionRatio: originalSize > 0 
        ? 1 - (buffer.length / originalSize)
        : 0,
    };
  }

  /**
   * Optimize image for all tiers
   */
  static async optimizeAll(
    input: Buffer | string
  ): Promise<Record<ImageTier, OptimizationResult>> {
    const [original, display, thumbnail] = await Promise.all([
      this.optimize(input, { tier: ImageTier.ORIGINAL }),
      this.optimize(input, { tier: ImageTier.DISPLAY }),
      this.optimize(input, { tier: ImageTier.THUMBNAIL }),
    ]);

    return {
      [ImageTier.ORIGINAL]: original,
      [ImageTier.DISPLAY]: display,
      [ImageTier.THUMBNAIL]: thumbnail,
    };
  }

  /**
   * Calculate optimal quality based on file size target
   */
  static async findOptimalQuality(
    input: Buffer | string,
    targetSizeKB: number,
    tier: ImageTier = ImageTier.DISPLAY,
    format: ImageFormat = ImageFormat.JPEG
  ): Promise<{ quality: number; result: OptimizationResult }> {
    let minQuality = 50;
    let maxQuality = 100;
    let bestQuality = 75;
    let bestResult: OptimizationResult | null = null;

    // Binary search for optimal quality
    while (minQuality <= maxQuality) {
      const quality = Math.floor((minQuality + maxQuality) / 2);
      const result = await this.optimize(input, { tier, format, quality });

      const sizeKB = result.size / 1024;

      if (Math.abs(sizeKB - targetSizeKB) < 10) {
        // Within 10KB of target
        return { quality, result };
      }

      if (sizeKB > targetSizeKB) {
        maxQuality = quality - 1;
      } else {
        minQuality = quality + 1;
        bestQuality = quality;
        bestResult = result;
      }
    }

    // Return best result found
    const finalResult = bestResult || await this.optimize(input, { 
      tier, 
      format, 
      quality: bestQuality 
    });

    return { quality: bestQuality, result: finalResult };
  }

  /**
   * Validate image file
   */
  static async validateImage(input: Buffer | string): Promise<{
    valid: boolean;
    error?: string;
    metadata?: ImageMetadata;
  }> {
    try {
      const metadata = await this.getMetadata(input);

      // Check minimum dimensions
      if (metadata.width < 100 || metadata.height < 100) {
        return {
          valid: false,
          error: 'Image too small (minimum 100x100 pixels)',
          metadata,
        };
      }

      // Check maximum dimensions (50MP limit)
      const megapixels = (metadata.width * metadata.height) / 1_000_000;
      if (megapixels > 50) {
        return {
          valid: false,
          error: `Image too large (${megapixels.toFixed(1)}MP, maximum 50MP)`,
          metadata,
        };
      }

      // Check format
      const supportedFormats = ['jpeg', 'jpg', 'png', 'webp'];
      if (!supportedFormats.includes(metadata.format.toLowerCase())) {
        return {
          valid: false,
          error: `Unsupported format: ${metadata.format}`,
          metadata,
        };
      }

      return {
        valid: true,
        metadata,
      };
    } catch (error) {
      return {
        valid: false,
        error: `Invalid image file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Convert image to base64 data URL
   */
  static async toBase64(
    input: Buffer | string,
    tier: ImageTier = ImageTier.THUMBNAIL
  ): Promise<string> {
    const result = await this.optimize(input, { tier });
    const base64 = result.buffer.toString('base64');
    const mimeType = `image/${result.format}`;
    return `data:${mimeType};base64,${base64}`;
  }

  /**
   * Batch optimize multiple images
   */
  static async optimizeBatch(
    inputs: Array<{ id: string; buffer: Buffer | string }>,
    tier: ImageTier
  ): Promise<Array<{ id: string; result: OptimizationResult; error?: string }>> {
    return Promise.all(
      inputs.map(async ({ id, buffer }) => {
        try {
          const result = await this.optimize(buffer, { tier });
          return { id, result };
        } catch (error) {
          return {
            id,
            result: {} as OptimizationResult,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );
  }

  /**
   * Get file extension for format
   */
  static getExtension(format: ImageFormat): string {
    const extensions = {
      [ImageFormat.JPEG]: 'jpg',
      [ImageFormat.WEBP]: 'webp',
      [ImageFormat.PNG]: 'png',
    };
    return extensions[format];
  }

  /**
   * Generate filename for tier
   */
  static generateFilename(
    originalFilename: string,
    tier: ImageTier,
    format?: ImageFormat
  ): string {
    const settings = TIER_SETTINGS[tier];
    const ext = format ? this.getExtension(format) : this.getExtension(settings.format);
    const baseName = originalFilename.replace(/\.[^.]+$/, '');

    if (tier === ImageTier.ORIGINAL) {
      return `${baseName}.${ext}`;
    }

    return `${baseName}_${tier}.${ext}`;
  }
}

/**
 * Utility functions
 */

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`;
}

/**
 * Calculate compression percentage
 */
export function formatCompressionRatio(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`;
}

/**
 * Get recommended tier for use case
 */
export function getRecommendedTier(useCase: string): ImageTier {
  const useCaseMap: Record<string, ImageTier> = {
    analysis: ImageTier.ORIGINAL,
    'ai-processing': ImageTier.ORIGINAL,
    'history-view': ImageTier.DISPLAY,
    'list-view': ImageTier.THUMBNAIL,
    'card-view': ImageTier.THUMBNAIL,
    'profile-picture': ImageTier.THUMBNAIL,
  };

  return useCaseMap[useCase.toLowerCase()] || ImageTier.DISPLAY;
}

export default ImageOptimizer;
