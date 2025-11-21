import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ActionStatus } from '@/lib/action-plan/action-plan-generator';

/**
 * PATCH /api/action-plans/:planId/actions/:actionId
 * Update a specific action item's status and notes
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string; actionId: string }> }
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

    const { planId, actionId } = await params;
    const updates = await request.json();

    // Verify plan ownership
    const { data: plan, error: planError } = await supabase
      .from('action_plans')
      .select('id, user_id')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'Action plan not found' }, { status: 404 });
    }

    if (plan.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Prepare update data
    const updateData: Record<string, any> = {};

    if (updates.status) {
      const validStatuses: ActionStatus[] = ['not-started', 'in-progress', 'completed', 'skipped'];
      if (!validStatuses.includes(updates.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updateData.status = updates.status;

      // Set timestamps based on status
      if (updates.status === 'in-progress' && !updateData.start_date) {
        updateData.start_date = new Date().toISOString();
      } else if (updates.status === 'completed') {
        updateData.completed_date = new Date().toISOString();
      } else if (updates.status === 'not-started') {
        updateData.start_date = null;
        updateData.completed_date = null;
      }
    }

    if (updates.notes !== undefined) {
      updateData.notes = updates.notes;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update action item
    const { data: updatedAction, error: actionError } = await supabase
      .from('action_items')
      .update(updateData)
      .eq('id', actionId)
      .eq('plan_id', planId)
      .select()
      .single();

    if (actionError) {
      console.error('Error updating action item:', actionError);
      return NextResponse.json(
        { error: 'Failed to update action item' },
        { status: 500 }
      );
    }

    // Recalculate plan progress
    const { data: allActions, error: actionsError } = await supabase
      .from('action_items')
      .select('status')
      .eq('plan_id', planId);

    if (actionsError) {
      console.error('Error fetching actions for progress calculation:', actionsError);
    } else if (allActions) {
      const totalActions = allActions.length;
      const completedActions = allActions.filter(a => a.status === 'completed').length;
      const progressPercentage = totalActions > 0
        ? Math.round((completedActions / totalActions) * 100)
        : 0;

      // Update plan progress
      await supabase
        .from('action_plans')
        .update({ progress_percentage: progressPercentage })
        .eq('id', planId);
    }

    return NextResponse.json({
      success: true,
      data: updatedAction,
    });
  } catch (error) {
    console.error('Error in PATCH /api/action-plans/:planId/actions/:actionId:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/action-plans/:planId/actions/:actionId
 * Get a specific action item
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string; actionId: string }> }
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

    const { planId, actionId } = await params;

    // Verify plan ownership
    const { data: plan, error: planError } = await supabase
      .from('action_plans')
      .select('id, user_id')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'Action plan not found' }, { status: 404 });
    }

    if (plan.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch action item
    const { data: action, error: actionError } = await supabase
      .from('action_items')
      .select('*')
      .eq('id', actionId)
      .eq('plan_id', planId)
      .single();

    if (actionError) {
      if (actionError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Action item not found' }, { status: 404 });
      }
      console.error('Error fetching action item:', actionError);
      return NextResponse.json(
        { error: 'Failed to fetch action item' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: action,
    });
  } catch (error) {
    console.error('Error in GET /api/action-plans/:planId/actions/:actionId:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
