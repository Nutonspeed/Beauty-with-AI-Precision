import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withPublicAccess } from '@/lib/auth/middleware';

/**
 * GET /api/progress/photos
 * Get all progress photos for the current user
 */
export const GET = withPublicAccess(async (request: NextRequest) => {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const photoType = searchParams.get('photo_type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('progress_photos')
      .select('*')
      .eq('user_id', user.id)
      .order('taken_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (photoType) {
      query = query.eq('photo_type', photoType);
    }

    const { data: photos, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
    }

    return NextResponse.json({ photos });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, { rateLimitCategory: 'api' })

/**
 * POST /api/progress/photos
 * Upload a new progress photo
 */
export const POST = withPublicAccess(async (request: NextRequest) => {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const photoType = formData.get('photo_type') as string;
    const treatmentId = formData.get('treatment_id') as string | null;
    const sessionNumber = formData.get('session_number') as string | null;
    const daysSinceTreatment = formData.get('days_since_treatment') as string | null;
    const notes = formData.get('notes') as string | null;

    if (!file || !photoType) {
      return NextResponse.json(
        { error: 'file and photo_type are required' },
        { status: 400 }
      );
    }

    if (!['baseline', 'progress', 'final'].includes(photoType)) {
      return NextResponse.json(
        { error: 'photo_type must be baseline, progress, or final' },
        { status: 400 }
      );
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const filePath = `progress-photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('progress-photos')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('progress-photos').getPublicUrl(filePath);

    // TODO: Run AI analysis on the photo
    // For now, we'll insert without analysis results
    const photoData = {
      user_id: user.id,
      treatment_id: treatmentId,
      image_url: publicUrl,
      photo_type: photoType,
      session_number: sessionNumber ? parseInt(sessionNumber) : null,
      days_since_treatment: daysSinceTreatment ? parseInt(daysSinceTreatment) : null,
      notes,
      is_verified: false,
    };

    const { data: photo, error: photoError } = await supabase
      .from('progress_photos')
      .insert(photoData)
      .select()
      .single();

    if (photoError) {
      console.error('Database error:', photoError);
      return NextResponse.json({ error: 'Failed to save photo' }, { status: 500 });
    }

    return NextResponse.json({ photo }, { status: 201 });
  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, { rateLimitCategory: 'upload' })

/**
 * DELETE /api/progress/photos/:id
 * Delete a progress photo
 */
export const DELETE = withPublicAccess(async (request: NextRequest) => {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('id');

    if (!photoId) {
      return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 });
    }

    // Fetch photo to check ownership
    const { data: photo, error: fetchError } = await supabase
      .from('progress_photos')
      .select('*')
      .eq('id', photoId)
      .single();

    if (fetchError || !photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    if (photo.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete from storage
    if (photo.image_url) {
      const urlParts = photo.image_url.split('/progress-photos/');
      if (urlParts.length === 2) {
        const filePath = urlParts[1];
        await supabase.storage.from('progress-photos').remove([filePath]);
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('progress_photos')
      .delete()
      .eq('id', photoId);

    if (deleteError) {
      console.error('Database error:', deleteError);
      return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, { rateLimitCategory: 'upload' })
