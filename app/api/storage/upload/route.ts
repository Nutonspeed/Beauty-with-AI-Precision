/**
 * Image Upload API
 * 
 * POST /api/storage/upload
 * 
 * Upload images with automatic multi-tier optimization:
 * - Original: Full resolution (for re-analysis)
 * - Display: 1920x1080 optimized (for viewing)
 * - Thumbnail: 512x512 WebP (fast loading)
 * 
 * Request:
 * - Content-Type: multipart/form-data
 * - Body: FormData with 'file' field
 * - Optional: 'path' field for custom storage path
 * 
 * Response:
 * {
 *   success: true,
 *   urls: { original, display, thumbnail },
 *   metadata: { originalSize, displaySize, thumbnailSize, compressionSavings }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStorageManager, type ImageTier } from '@/lib/storage/image-storage';
import { formatFileSize } from '@/lib/storage/image-optimizer';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds max

/**
 * POST /api/storage/upload
 */
export async function POST(request: NextRequest) {
  try {
    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const customPath = formData.get('path') as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate storage path
    const timestamp = Date.now();
    const sanitizedName = file.name.replaceAll(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = customPath || `uploads/${timestamp}_${sanitizedName}`;

    // Upload with optimization
    const storage = getStorageManager();
    const result = await storage.uploadImage(buffer, storagePath);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Format response
    return NextResponse.json({
      success: true,
      urls: result.urls,
      metadata: {
        originalSize: formatFileSize(result.metadata.originalSize),
        displaySize: formatFileSize(result.metadata.displaySize),
        thumbnailSize: formatFileSize(result.metadata.thumbnailSize),
        compressionSavings: formatFileSize(result.metadata.compressionSavings),
        savingsPercent: result.metadata.originalSize > 0
          ? ((result.metadata.compressionSavings / result.metadata.originalSize) * 100).toFixed(1) + '%'
          : '0%',
      },
      storagePath,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/storage/upload?path=xxx&tier=display
 * Get image URL
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path');
    const tierParam = searchParams.get('tier');

    if (!path) {
      return NextResponse.json(
        { success: false, error: 'Path parameter required' },
        { status: 400 }
      );
    }

    const storage = getStorageManager();

    if (tierParam) {
      // Get specific tier URL  
      let tier: ImageTier;
      if (tierParam === 'original') tier = 'original' as ImageTier;
      else if (tierParam === 'display') tier = 'display' as ImageTier;
      else if (tierParam === 'thumbnail') tier = 'thumbnail' as ImageTier;
      else {
        return NextResponse.json(
          { success: false, error: 'Invalid tier parameter' },
          { status: 400 }
        );
      }
      
      const url = await storage.getImageUrl(path, tier);
      
      if (!url) {
        return NextResponse.json(
          { success: false, error: 'Image not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, url });
    } else {
      // Get all tier URLs
      const urls = await storage.getImageUrls(path);
      
      if (!urls) {
        return NextResponse.json(
          { success: false, error: 'Image not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, urls });
    }

  } catch (error) {
    console.error('Get URL error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get URL' 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/storage/upload?path=xxx
 * Delete image (all tiers)
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json(
        { success: false, error: 'Path parameter required' },
        { status: 400 }
      );
    }

    const storage = getStorageManager();
    const result = await storage.deleteImage(path);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Delete failed' 
      },
      { status: 500 }
    );
  }
}
