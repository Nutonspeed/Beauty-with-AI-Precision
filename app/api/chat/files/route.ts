import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withClinicAuth } from '@/lib/auth/middleware';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/chat/files
 * List file uploads in a chat room
 * 
 * Query parameters:
 * - room_id (required): Chat room ID
 * - message_id (optional): Filter by message
 */
export const GET = withClinicAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const room_id = searchParams.get('room_id');
    const message_id = searchParams.get('message_id');

    if (!room_id) {
      return NextResponse.json(
        { error: 'room_id is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('chat_file_uploads')
      .select(`
        *,
        uploaded_by:users!chat_file_uploads_uploaded_by_user_id_fkey(id, full_name, avatar_url)
      `)
      .eq('room_id', room_id)
      .order('created_at', { ascending: false });

    if (message_id) {
      query = query.eq('message_id', message_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching file uploads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file uploads' },
      { status: 500 }
    );
  }
})

/**
 * POST /api/chat/files
 * Upload a file to a chat room
 * 
 * Body:
 * - room_id (required): Chat room ID
 * - message_id (optional): Associated message ID
 * - uploaded_by_user_id (required): User uploading the file
 * - file_name (required): File name
 * - file_url (required): File URL
 * - file_type (optional): MIME type
 * - file_size_bytes (optional): File size
 * - is_image (optional): Whether file is an image
 * - image_width (optional): Image width
 * - image_height (optional): Image height
 * - thumbnail_url (optional): Thumbnail URL for images
 */
export const POST = withClinicAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const {
      room_id,
      message_id,
      uploaded_by_user_id,
      file_name,
      file_url,
      file_type,
      file_size_bytes,
      is_image = false,
      image_width,
      image_height,
      thumbnail_url,
    } = body;

    if (!room_id || !uploaded_by_user_id || !file_name || !file_url) {
      return NextResponse.json(
        { error: 'room_id, uploaded_by_user_id, file_name, and file_url are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('chat_file_uploads')
      .insert({
        room_id,
        message_id,
        uploaded_by_user_id,
        file_name,
        file_url,
        file_type,
        file_size_bytes,
        is_image,
        image_width,
        image_height,
        thumbnail_url,
      })
      .select(`
        *,
        uploaded_by:users!chat_file_uploads_uploaded_by_user_id_fkey(id, full_name, avatar_url)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
})
