import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth/session';

/**
 * GET /api/customer-notes
 * Get all notes for a customer
 * 
 * Query params:
 * - customer_id: UUID (required)
 * - include_private: boolean (optional, default: true)
 * - pinned_only: boolean (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const customer_id = searchParams.get('customer_id');
    const include_private = searchParams.get('include_private') !== 'false';
    const pinned_only = searchParams.get('pinned_only') === 'true';

    if (!customer_id) {
      return NextResponse.json(
        { error: 'customer_id is required' },
        { status: 400 }
      );
    }

    // Build query
    let query = supabase
      .from('customer_notes')
      .select('*')
      .eq('customer_id', customer_id)
      .order('created_at', { ascending: false });

    // Filter by privacy
    if (!include_private) {
      query = query.eq('is_private', false);
    }

    // Filter pinned only
    if (pinned_only) {
      query = query.eq('is_pinned', true);
    }

    const { data: notes, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: notes || [],
      count: notes?.length || 0
    });

  } catch (error) {
    console.error('Error fetching customer notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/customer-notes
 * Create a new note
 * 
 * Body:
 * - customer_id: UUID (required)
 * - content: string (required)
 * - note_type: string (optional, default: 'general')
 * - tags: string[] (optional)
 * - is_private: boolean (optional, default: false)
 * - is_pinned: boolean (optional, default: false)
 * - followup_date: string (optional, ISO timestamp)
 * - related_scan_id: UUID (optional)
 * - related_proposal_id: UUID (optional)
 * - attachments: array (optional)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user info
    const { data: userInfo } = await supabase
      .from('users')
      .select('full_name, clinic_id')
      .eq('id', user.id)
      .single();

    if (!userInfo?.clinic_id) {
      return NextResponse.json(
        { error: 'User clinic information not found' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      customer_id,
      content,
      note_type = 'general',
      tags = [],
      is_private = false,
      is_pinned = false,
      followup_date,
      related_scan_id,
      related_proposal_id,
      attachments = []
    } = body;

    // Validate required fields
    if (!customer_id || !content) {
      return NextResponse.json(
        { error: 'customer_id and content are required' },
        { status: 400 }
      );
    }

    // Validate note_type
    const validTypes = ['call', 'meeting', 'followup', 'general', 'important'];
    if (!validTypes.includes(note_type)) {
      return NextResponse.json(
        { error: `note_type must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Insert note
    const { data: note, error } = await supabase
      .from('customer_notes')
      .insert({
        customer_id,
        sales_staff_id: user.id,
        clinic_id: userInfo.clinic_id,
        content: content.trim(),
        note_type,
        tags,
        is_private,
        is_pinned,
        followup_date: followup_date || null,
        related_scan_id: related_scan_id || null,
        related_proposal_id: related_proposal_id || null,
        attachments: attachments || [],
        created_by_name: userInfo.full_name || 'Unknown'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: note,
      message: 'Note created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating customer note:', error);
    return NextResponse.json(
      { error: 'Failed to create note', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/customer-notes
 * Update an existing note
 * 
 * Body:
 * - id: UUID (required)
 * - content: string (optional)
 * - note_type: string (optional)
 * - tags: string[] (optional)
 * - is_private: boolean (optional)
 * - is_pinned: boolean (optional)
 * - followup_date: string (optional)
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    // Get user info for audit
    const { data: userInfo } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .single();

    // Add audit info
    const updateData = {
      ...updates,
      updated_by_name: userInfo?.full_name || 'Unknown'
    };

    // Trim content if provided
    if (updateData.content) {
      updateData.content = updateData.content.trim();
    }

    // Update note (RLS will ensure user owns this note)
    const { data: note, error } = await supabase
      .from('customer_notes')
      .update(updateData)
      .eq('id', id)
      .eq('sales_staff_id', user.id) // Extra safety check
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Note not found or you do not have permission to update it' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: note,
      message: 'Note updated successfully'
    });

  } catch (error) {
    console.error('Error updating customer note:', error);
    return NextResponse.json(
      { error: 'Failed to update note', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/customer-notes
 * Delete a note
 * 
 * Query params:
 * - id: UUID (required)
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    // Delete note (RLS will ensure user owns this note)
    const { error } = await supabase
      .from('customer_notes')
      .delete()
      .eq('id', id)
      .eq('sales_staff_id', user.id); // Extra safety check

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Note deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting customer note:', error);
    return NextResponse.json(
      { error: 'Failed to delete note', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
