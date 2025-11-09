-- =====================================================
-- Supabase Storage Buckets Setup for Skin Analysis
-- =====================================================
-- Created: 2025-01-09
-- Purpose: Create storage buckets for skin analysis images and visualizations
-- Dependencies: Requires skin_analyses table from 20250109_create_skin_analyses.sql
-- =====================================================

-- Create storage bucket for original skin analysis images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'skin-analysis-images',
  'skin-analysis-images',
  true, -- Public access for viewing
  10485760, -- 10 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- RLS Policies for skin-analysis-images bucket
-- =====================================================

-- Policy: Users can upload their own images
CREATE POLICY "Users can upload skin analysis images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'skin-analysis-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can view their own images
CREATE POLICY "Users can view their own skin analysis images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'skin-analysis-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own images
CREATE POLICY "Users can update their own skin analysis images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'skin-analysis-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'skin-analysis-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own images
CREATE POLICY "Users can delete their own skin analysis images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'skin-analysis-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Admins can view all images
CREATE POLICY "Admins can view all skin analysis images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'skin-analysis-images' AND
  (
    auth.jwt()->>'role' = 'admin' OR
    auth.jwt()->>'role' = 'doctor'
  )
);

-- Policy: Service role has full access
CREATE POLICY "Service role has full access to skin analysis images"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'skin-analysis-images')
WITH CHECK (bucket_id = 'skin-analysis-images');

-- =====================================================
-- Comments for Documentation
-- =====================================================

COMMENT ON TABLE storage.buckets IS 'Supabase Storage buckets for file storage';
COMMENT ON COLUMN storage.buckets.id IS 'Unique identifier for the bucket';
COMMENT ON COLUMN storage.buckets.name IS 'Human-readable bucket name';
COMMENT ON COLUMN storage.buckets.public IS 'Whether files in this bucket are publicly accessible';
COMMENT ON COLUMN storage.buckets.file_size_limit IS 'Maximum file size in bytes (10MB = 10485760)';
COMMENT ON COLUMN storage.buckets.allowed_mime_types IS 'Array of allowed MIME types for uploads';

-- =====================================================
-- Usage Notes
-- =====================================================
-- 
-- File naming convention: {user_id}/{timestamp}-{type}.{ext}
-- Example: "123e4567-e89b-12d3-a456-426614174000/1704844800000-original.jpg"
-- 
-- Types:
-- - original: Original uploaded image
-- - visualization: Multi-mode overlay visualization
-- - spots: Individual mode visualization (spots)
-- - wrinkles: Individual mode visualization (wrinkles)
-- - texture: Individual mode visualization (texture)
-- - pores: Individual mode visualization (pores)
-- - uv_spots: Individual mode visualization (UV spots)
-- - brown_spots: Individual mode visualization (brown spots)
-- - red_areas: Individual mode visualization (red areas)
-- - porphyrins: Individual mode visualization (porphyrins)
-- 
-- Public URL format:
-- https://{project-ref}.supabase.co/storage/v1/object/public/skin-analysis-images/{file-path}
-- 
-- Upload example (JavaScript):
-- const { data, error } = await supabase.storage
--   .from('skin-analysis-images')
--   .upload(`${userId}/${timestamp}-original.jpg`, file, {
--     contentType: 'image/jpeg',
--     cacheControl: '3600',
--   });
-- 
-- Download/view example:
-- const { data: { publicUrl } } = supabase.storage
--   .from('skin-analysis-images')
--   .getPublicUrl(filePath);
-- 
-- =====================================================
