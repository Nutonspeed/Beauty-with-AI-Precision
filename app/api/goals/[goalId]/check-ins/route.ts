import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { CheckIn } from '@/lib/goals/smart-goals';

/**
 * POST /api/goals/:goalId/check-ins
 * Record a new check-in for a goal
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ goalId: string }> }
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

    const { goalId } = await params;
    const checkInData: Omit<CheckIn, 'id'> = await request.json();

    // Verify goal ownership
    const { data: goal, error: goalError } = await supabase
      .from('smart_goals')
      .select('id, user_id, baseline, target, current_value')
      .eq('id', goalId)
      .single();

    if (goalError || !goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    if (goal.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate check-in data
    if (!checkInData.date || checkInData.currentValue === undefined) {
      return NextResponse.json(
        { error: 'Date and currentValue are required' },
        { status: 400 }
      );
    }

    // Save check-in
    const { data: savedCheckIn, error: checkInError } = await supabase
      .from('goal_check_ins')
      .insert({
        goal_id: goalId,
        date: checkInData.date,
        current_value: checkInData.currentValue,
        notes: checkInData.notes || null,
        photo_url: checkInData.photoUrl || null,
        mood: checkInData.mood || null,
        adherence: checkInData.adherence || null,
      })
      .select()
      .single();

    if (checkInError) {
      console.error('Error saving check-in:', checkInError);
      return NextResponse.json(
        { error: 'Failed to save check-in' },
        { status: 500 }
      );
    }

    // Update goal's current value and progress
    const totalChange = Math.abs(goal.target - goal.baseline);
    const currentChange = Math.abs(checkInData.currentValue - goal.baseline);
    const progressPercentage = totalChange > 0
      ? Math.min(100, Math.round((currentChange / totalChange) * 100))
      : 0;

    await supabase
      .from('smart_goals')
      .update({
        current_value: checkInData.currentValue,
        progress_percentage: progressPercentage,
      })
      .eq('id', goalId);

    // Check and update milestone completion
    const { data: milestones } = await supabase
      .from('goal_milestones')
      .select('*')
      .eq('goal_id', goalId)
      .eq('completed', false)
      .order('target_value', { ascending: true });

    const isImprovement = goal.target < goal.baseline;

    if (milestones) {
      for (const milestone of milestones) {
        if (milestone.target_value) {
          const achieved = isImprovement
            ? checkInData.currentValue <= milestone.target_value
            : checkInData.currentValue >= milestone.target_value;

          if (achieved) {
            await supabase
              .from('goal_milestones')
              .update({
                completed: true,
                completed_date: new Date().toISOString(),
              })
              .eq('id', milestone.id);
          }
        }
      }
    }

    // Check if goal is completed
    const isCompleted = isImprovement
      ? checkInData.currentValue <= goal.target
      : checkInData.currentValue >= goal.target;

    if (isCompleted && goal.current_value !== checkInData.currentValue) {
      await supabase
        .from('smart_goals')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', goalId);
    }

    return NextResponse.json(
      {
        success: true,
        data: savedCheckIn,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/goals/:goalId/check-ins:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/goals/:goalId/check-ins
 * Get all check-ins for a goal
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ goalId: string }> }
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

    const { goalId } = await params;

    // Verify goal ownership
    const { data: goal, error: goalError } = await supabase
      .from('smart_goals')
      .select('id, user_id')
      .eq('id', goalId)
      .single();

    if (goalError || !goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    if (goal.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch check-ins
    const { data: checkIns, error: checkInsError } = await supabase
      .from('goal_check_ins')
      .select('*')
      .eq('goal_id', goalId)
      .order('date', { ascending: false });

    if (checkInsError) {
      console.error('Error fetching check-ins:', checkInsError);
      return NextResponse.json(
        { error: 'Failed to fetch check-ins' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: checkIns,
    });
  } catch (error) {
    console.error('Error in GET /api/goals/:goalId/check-ins:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
