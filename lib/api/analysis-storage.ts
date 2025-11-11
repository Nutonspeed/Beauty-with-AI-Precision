/**
 * Analysis Storage Integration
 * 
 * Handles image storage and retrieval for skin analysis workflow:
 * - Saves analysis images with multi-tier storage
 * - Manages analysis metadata in database
 * - Links storage URLs to analysis records
 * 
 * @example
 * ```typescript
 * // Save analysis with images
 * const result = await saveAnalysisWithStorage(userId, {
 *   front: imageBuffer,
 *   left: imageBuffer,
 *   right: imageBuffer
 * }, analysisResult);
 * 
 * // Get analysis with optimized URLs
 * const analysis = await getAnalysisWithImages(analysisId);
 * // Returns: { ..., imageUrl: display-tier, thumbnailUrl: thumbnail-tier }
 * ```
 */

import { getStorageManager, ImageTier } from '@/lib/storage/image-storage';
import { createServerClient } from '@/lib/supabase/server';

export interface AnalysisImageSet {
  front?: Buffer | string;
  left?: Buffer | string;
  right?: Buffer | string;
}

export interface AnalysisStorageResult {
  id: string;
  userId: string;
  imageUrls: {
    front?: { original: string; display: string; thumbnail: string };
    left?: { original: string; display: string; thumbnail: string };
    right?: { original: string; display: string; thumbnail: string };
  };
  storagePaths: {
    front?: string;
    left?: string;
    right?: string;
  };
  analysisData: any;
  createdAt: string;
}

/**
 * Save analysis with multi-tier image storage
 */
export async function saveAnalysisWithStorage(
  userId: string,
  images: AnalysisImageSet,
  analysisData: any,
  options?: {
    analysisType?: 'single' | 'multi-angle';
    metadata?: Record<string, any>;
  }
): Promise<AnalysisStorageResult> {
  const storage = getStorageManager();
  const supabase = await createServerClient();
  
  const timestamp = Date.now();
  const imageUrls: AnalysisStorageResult['imageUrls'] = {};
  const storagePaths: AnalysisStorageResult['storagePaths'] = {};

  try {
    // Upload images with multi-tier storage
    const uploadPromises = Object.entries(images).map(async ([angle, imageData]) => {
      if (!imageData) return;

      // Convert to Buffer if needed
      const buffer = imageData instanceof Buffer 
        ? imageData 
        : Buffer.from(imageData.replace(/^data:image\/\w+;base64,/, ''), 'base64');

      // Generate storage path: analysis/{userId}/{timestamp}_{angle}.jpg
      const storagePath = `analysis/${userId}/${timestamp}_${angle}.jpg`;

      console.log(`[AnalysisStorage] Uploading ${angle} view to storage...`);

      const uploadResult = await storage.uploadImage(buffer, storagePath);

      if (!uploadResult.success || !uploadResult.urls) {
        throw new Error(`Failed to upload ${angle} view`);
      }

      storagePaths[angle as keyof typeof storagePaths] = storagePath;
      imageUrls[angle as keyof typeof imageUrls] = uploadResult.urls;

      console.log(`[AnalysisStorage] ${angle} view uploaded:`, {
        original: uploadResult.metadata?.originalSize,
        display: uploadResult.metadata?.displaySize,
        thumbnail: uploadResult.metadata?.thumbnailSize,
        savings: uploadResult.metadata?.compressionSavings,
      });
    });

    await Promise.all(uploadPromises);

    // Save analysis record to database
    const analysisId = `analysis_${timestamp}`;
    
    const { data, error } = await supabase
      .from('analyses')
      .insert({
        id: analysisId,
        user_id: userId,
        type: options?.analysisType || 'single',
        storage_paths: storagePaths,
        image_urls: imageUrls,
        analysis_data: analysisData,
        metadata: options?.metadata || {},
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[AnalysisStorage] Database insert error:', error);
      // If DB fails, clean up uploaded images
      await cleanupStoredImages(storagePaths);
      throw new Error('Failed to save analysis to database');
    }

    console.log('[AnalysisStorage] Analysis saved successfully:', analysisId);

    return {
      id: analysisId,
      userId,
      imageUrls,
      storagePaths,
      analysisData,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('[AnalysisStorage] Save failed:', error);
    // Cleanup any uploaded images
    await cleanupStoredImages(storagePaths);
    throw error;
  }
}

/**
 * Get analysis with appropriate image URLs for use case
 */
export async function getAnalysisWithImages(
  analysisId: string,
  options?: {
    tier?: ImageTier; // Which tier to return (default: DISPLAY)
    includeOriginal?: boolean; // Include original URLs for re-analysis
  }
): Promise<AnalysisStorageResult | null> {
  const supabase = await createServerClient();
  const storage = getStorageManager();

  try {
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (error || !data) {
      console.error('[AnalysisStorage] Analysis not found:', analysisId);
      return null;
    }

    // Get URLs for requested tier
    const tier = options?.tier || ImageTier.DISPLAY;
    const imageUrls: any = {};

    for (const [angle, path] of Object.entries(data.storage_paths || {})) {
      if (!path) continue;

      const url = await storage.getImageUrl(path as string, tier);
      if (url) {
        imageUrls[angle] = url;
      }

      // Include all tiers if requested
      if (options?.includeOriginal) {
        const allUrls = await storage.getImageUrls(path as string);
        if (allUrls) {
          imageUrls[`${angle}_all`] = allUrls;
        }
      }
    }

    return {
      id: data.id,
      userId: data.user_id,
      imageUrls: options?.includeOriginal ? data.image_urls : imageUrls,
      storagePaths: data.storage_paths,
      analysisData: data.analysis_data,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('[AnalysisStorage] Get analysis error:', error);
    return null;
  }
}

/**
 * Get analysis history with thumbnail URLs (optimized for list view)
 */
export async function getAnalysisHistory(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    sortBy?: 'created_at' | 'updated_at';
    order?: 'asc' | 'desc';
  }
): Promise<{
  data: Array<{
    id: string;
    type: string;
    thumbnailUrl: string; // Thumbnail tier for fast loading
    displayUrl: string; // Display tier for preview
    concernCount: Record<string, number>;
    createdAt: string;
  }>;
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}> {
  const supabase = await createServerClient();
  const storage = getStorageManager();

  const limit = options?.limit || 12;
  const offset = options?.offset || 0;
  const sortBy = options?.sortBy || 'created_at';
  const order = options?.order || 'desc';

  try {
    // Get total count
    const { count } = await supabase
      .from('analyses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get analyses
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', userId)
      .order(sortBy, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error('Failed to load analysis history');
    }

    // Get optimized URLs for each analysis
    const historyWithUrls = await Promise.all(
      (data || []).map(async (analysis) => {
        // Use front view as primary image
        const primaryPath = analysis.storage_paths?.front || 
                           analysis.storage_paths?.left || 
                           analysis.storage_paths?.right;

        let thumbnailUrl = '/placeholder.svg';
        let displayUrl = '/placeholder.svg';

        if (primaryPath) {
          const thumbnail = await storage.getImageUrl(primaryPath, ImageTier.THUMBNAIL);
          const display = await storage.getImageUrl(primaryPath, ImageTier.DISPLAY);
          
          if (thumbnail) thumbnailUrl = thumbnail;
          if (display) displayUrl = display;
        }

        // Extract concern counts from analysis data
        const concernCount = extractConcernCounts(analysis.analysis_data);

        return {
          id: analysis.id,
          type: analysis.type,
          thumbnailUrl,
          displayUrl,
          concernCount,
          createdAt: analysis.created_at,
        };
      })
    );

    return {
      data: historyWithUrls,
      pagination: {
        total: count || 0,
        limit,
        offset,
      },
    };
  } catch (error) {
    console.error('[AnalysisStorage] History load error:', error);
    throw error;
  }
}

/**
 * Delete analysis and all associated images
 */
export async function deleteAnalysis(analysisId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient();

  try {
    // Get analysis to find storage paths
    const { data: analysis } = await supabase
      .from('analyses')
      .select('storage_paths')
      .eq('id', analysisId)
      .single();

    if (!analysis) {
      return { success: false, error: 'Analysis not found' };
    }

    // Delete images from storage
    await cleanupStoredImages(analysis.storage_paths || {});

    // Delete analysis record
    const { error } = await supabase
      .from('analyses')
      .delete()
      .eq('id', analysisId);

    if (error) {
      return { success: false, error: error.message };
    }

    console.log('[AnalysisStorage] Analysis deleted:', analysisId);
    return { success: true };
  } catch (error) {
    console.error('[AnalysisStorage] Delete error:', error);
    return { success: false, error: 'Failed to delete analysis' };
  }
}

// Helper functions

/**
 * Clean up stored images (used on error or delete)
 */
async function cleanupStoredImages(storagePaths: Record<string, string>): Promise<void> {
  const storage = getStorageManager();

  const deletePromises = Object.values(storagePaths)
    .filter(Boolean)
    .map(path => storage.deleteImage(path));

  await Promise.allSettled(deletePromises);
  console.log('[AnalysisStorage] Cleaned up stored images');
}

/**
 * Extract concern counts from analysis data
 */
function extractConcernCounts(analysisData: any): Record<string, number> {
  const counts: Record<string, number> = {
    acne: 0,
    wrinkle: 0,
    pigmentation: 0,
    pore: 0,
    redness: 0,
    dark_circle: 0,
  };

  try {
    // Handle different analysis data structures
    if (analysisData?.concerns) {
      for (const concern of analysisData.concerns) {
        const type = concern.type || concern.concern;
        if (type && type in counts) {
          counts[type]++;
        }
      }
    } else if (analysisData?.mediapipe || analysisData?.tensorflow || analysisData?.huggingface) {
      // Extract from individual model results
      const allResults = [
        ...(analysisData.mediapipe?.detections || []),
        ...(analysisData.tensorflow?.detections || []),
        ...(analysisData.huggingface?.detections || []),
      ];

      for (const detection of allResults) {
        const type = detection.type || detection.class;
        if (type && type in counts) {
          counts[type]++;
        }
      }
    }
  } catch (error) {
    console.error('[AnalysisStorage] Error extracting concern counts:', error);
  }

  return counts;
}
