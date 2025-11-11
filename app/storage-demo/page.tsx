/**
 * Smart Storage Demo Page
 * 
 * Interactive demo of multi-tier image storage system
 * 
 * URL: /storage-demo
 * 
 * Features:
 * - Upload with progress tracking
 * - View all tier URLs (original, display, thumbnail)
 * - Compare file sizes and compression
 * - Delete images
 * - Batch upload support
 */

'use client';

import { useState } from 'react';
import { useImageUpload, useImageDelete, type UploadResult } from '@/hooks/useImageUpload';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Image as ImageIcon, Trash2, CheckCircle, XCircle, FileImage } from 'lucide-react';

export default function StorageDemoPage() {
  const [uploadedImages, setUploadedImages] = useState<UploadResult[]>([]);
  const { upload, uploading, progress, error: uploadError } = useImageUpload({
    onSuccess: (result) => {
      setUploadedImages(prev => [...prev, result]);
    },
  });
  const { deleteImage, deleting } = useImageDelete();

  /**
   * Handle file selection
   */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    await upload(file);

    // Reset input
    e.target.value = '';
  };

  /**
   * Handle delete
   */
  const handleDelete = async (storagePath: string) => {
    const success = await deleteImage(storagePath);
    if (success) {
      setUploadedImages(prev => prev.filter(img => img.storagePath !== storagePath));
    }
  };

  return (
    <div className="container max-w-6xl py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Smart Storage System Demo</h1>
        <p className="text-muted-foreground">
          ระบบจัดการรูปภาพแบบ Multi-Tier: Original (คุณภาพเต็ม) + Display (แสดงผล) + Thumbnail (โหลดเร็ว)
        </p>
      </div>

      {/* Upload Section */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Image
        </h2>

        <div className="space-y-4">
          {/* Upload Button */}
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input">
              <Button
                asChild
                disabled={uploading}
                className="cursor-pointer"
              >
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Select Image'}
                </span>
              </Button>
            </label>
          </div>

          {/* Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{progress.message}</span>
                <span>{progress.percent}%</span>
              </div>
              <Progress value={progress.percent} />
            </div>
          )}

          {/* Error */}
          {uploadError && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          {/* Success */}
          {progress.percent === 100 && !uploading && (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                อัพโหลดสำเร็จ! ระบบสร้าง 3 เวอร์ชั่น (Original, Display, Thumbnail)
              </AlertDescription>
            </Alert>
          )}
        </div>
      </Card>

      {/* Uploaded Images Grid */}
      {uploadedImages.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileImage className="w-5 h-5" />
            Uploaded Images ({uploadedImages.length})
          </h2>

          <div className="grid gap-6">
            {uploadedImages.map((image) => (
              <Card key={image.storagePath || Math.random()} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold mb-1">Image</h3>
                    <p className="text-sm text-muted-foreground">
                      {image.storagePath}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => image.storagePath && handleDelete(image.storagePath)}
                    disabled={deleting}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Three Tiers Preview */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {/* Original */}
                  <div className="space-y-2">
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                      {image.urls?.original && (
                        <img
                          src={image.urls.original}
                          alt="Original"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold">Original</p>
                      <p className="text-xs text-muted-foreground">
                        {image.metadata?.originalSize}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        (Full Resolution)
                      </p>
                    </div>
                  </div>

                  {/* Display */}
                  <div className="space-y-2">
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                      {image.urls?.display && (
                        <img
                          src={image.urls.display}
                          alt="Display"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold">Display</p>
                      <p className="text-xs text-muted-foreground">
                        {image.metadata?.displaySize}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        (1920x1080 max)
                      </p>
                    </div>
                  </div>

                  {/* Thumbnail */}
                  <div className="space-y-2">
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                      {image.urls?.thumbnail && (
                        <img
                          src={image.urls.thumbnail}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold">Thumbnail</p>
                      <p className="text-xs text-muted-foreground">
                        {image.metadata?.thumbnailSize}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        (512x512 WebP)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Compression Stats */}
                <div className="bg-muted rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Saved</p>
                      <p className="font-semibold text-green-600">
                        {image.metadata?.compressionSavings}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Compression</p>
                      <p className="font-semibold text-green-600">
                        {image.metadata?.savingsPercent} smaller
                      </p>
                    </div>
                  </div>
                </div>

                {/* URLs */}
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-semibold text-muted-foreground hover:text-foreground">
                    View URLs
                  </summary>
                  <div className="mt-2 space-y-2 text-xs">
                    <div>
                      <p className="font-semibold">Original:</p>
                      <p className="text-muted-foreground break-all">
                        {image.urls?.original}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">Display:</p>
                      <p className="text-muted-foreground break-all">
                        {image.urls?.display}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">Thumbnail:</p>
                      <p className="text-muted-foreground break-all">
                        {image.urls?.thumbnail}
                      </p>
                    </div>
                  </div>
                </details>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {uploadedImages.length === 0 && !uploading && (
        <Card className="p-12 text-center">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Images Uploaded</h3>
          <p className="text-muted-foreground mb-4">
            Upload an image to see the multi-tier optimization in action
          </p>
        </Card>
      )}

      {/* Technical Info */}
      <Card className="p-6 mt-8 bg-muted/50">
        <h3 className="font-semibold mb-4">System Information</h3>
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-muted-foreground">Storage Backend:</p>
              <p className="font-mono">Supabase Storage</p>
            </div>
            <div>
              <p className="text-muted-foreground">Optimization:</p>
              <p className="font-mono">Sharp + Auto Quality</p>
            </div>
            <div>
              <p className="text-muted-foreground">Original Tier:</p>
              <p className="font-mono">Full resolution PNG/JPEG</p>
            </div>
            <div>
              <p className="text-muted-foreground">Display Tier:</p>
              <p className="font-mono">1920x1080 JPEG (85%)</p>
            </div>
            <div>
              <p className="text-muted-foreground">Thumbnail Tier:</p>
              <p className="font-mono">512x512 WebP (80%)</p>
            </div>
            <div>
              <p className="text-muted-foreground">CDN:</p>
              <p className="font-mono">Supabase Edge Network</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
