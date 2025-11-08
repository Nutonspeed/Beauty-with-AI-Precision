/**
 * PATCH /api/skin-analysis/[id]/notes
 * Add or update doctor notes for analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

interface UpdateNotesRequest {
  notes: string;
}

export async function PATCH(request: NextRequest, context: RouteParams) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body: UpdateNotesRequest = await request.json();

    if (typeof body.notes !== 'string') {
      return NextResponse.json(
        { error: 'Notes must be a string' },
        { status: 400 }
      );
    }

    // Get analysis ID from params
  const { id } = await context.params;

    // Verify ownership and update notes
    const { data: analysis, error: updateError } = await supabase
      .from('skin_analyses')
      .update({
        notes: body.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns this analysis
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);

      if (updateError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Analysis not found' },
          { status: 404 }
        );
      }

      throw new Error('Failed to update notes');
    }

    return NextResponse.json({
      success: true,
      data: {
        id: analysis.id,
        notes: analysis.notes,
        updatedAt: new Date(analysis.updated_at),
      },
    });
  } catch (error) {
    console.error('Update notes error:', error);

    return NextResponse.json(
      {
        error: 'Failed to update notes',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/skin-analysis/[id]/notes
 * Retrieve notes for analysis
 */
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get analysis ID from params
  const { id } = await context.params;

    // Query notes
    const { data: analysis, error: queryError } = await supabase
      .from('skin_analyses')
      .select('id, notes, updated_at')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (queryError) {
      console.error('Query error:', queryError);

      if (queryError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Analysis not found' },
          { status: 404 }
        );
      }

      throw new Error('Failed to fetch notes');
    }

    return NextResponse.json({
      success: true,
      data: {
        id: analysis.id,
        notes: analysis.notes,
        updatedAt: new Date(analysis.updated_at),
      },
    });
  } catch (error) {
    console.error('Fetch notes error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch notes',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
