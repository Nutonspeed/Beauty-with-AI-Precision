import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/action-plans/:planId
 * Get a specific action plan by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await params;

    // Fetch action plan with items
    const { data: plan, error } = await supabase
      .from('action_plans')
      .select('*, action_items(*)')
      .eq('id', planId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Action plan not found' }, { status: 404 });
      }
      console.error('Error fetching action plan:', error);
      return NextResponse.json(
        { error: 'Failed to fetch action plan' },
        { status: 500 }
      );
    }

    // Verify ownership (RLS should handle this, but double-check)
    if (plan.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error('Error in GET /api/action-plans/:planId:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/action-plans/:planId
 * Update action plan metadata
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await params;
    const updates = await request.json();

    // Only allow updating specific fields
    const allowedFields = ['progress_percentage'];
    const filteredUpdates: Record<string, any> = {};

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update action plan
    const { data: updatedPlan, error } = await supabase
      .from('action_plans')
      .update(filteredUpdates)
      .eq('id', planId)
      .eq('user_id', user.id) // Ensure ownership
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Action plan not found' }, { status: 404 });
      }
      console.error('Error updating action plan:', error);
      return NextResponse.json(
        { error: 'Failed to update action plan' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedPlan,
    });
  } catch (error) {
    console.error('Error in PATCH /api/action-plans/:planId:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/action-plans/:planId
 * Delete an action plan
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await params;

    // Delete action plan (cascade will delete action_items)
    const { error } = await supabase
      .from('action_plans')
      .delete()
      .eq('id', planId)
      .eq('user_id', user.id); // Ensure ownership

    if (error) {
      console.error('Error deleting action plan:', error);
      return NextResponse.json(
        { error: 'Failed to delete action plan' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Action plan deleted successfully',
    });
  } catch (error) {
    console.error('Error in DELETE /api/action-plans/:planId:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
