import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { SmartGoal, GoalStatus } from '@/lib/goals/smart-goals';

/**
 * POST /api/goals
 * Create a new SMART goal
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      planId,
      goal,
    }: {
      planId?: string;
      goal: Partial<SmartGoal>;
    } = body;

    // Validate required fields
    if (!goal.specific?.title || !goal.measurable || !goal.timeBound) {
      return NextResponse.json(
        { error: 'Missing required goal fields (specific, measurable, timeBound)' },
        { status: 400 }
      );
    }

    // Save goal to database
    const { data: savedGoal, error: goalError } = await supabase
      .from('smart_goals')
      .insert({
        user_id: user.id,
        plan_id: planId || null,
        type: goal.type || 'improvement',
        status: goal.status || 'active',
        title: goal.specific.title,
        description: goal.specific.description || '',
        concern_types: goal.specific.concernTypes || [],
        metric: goal.measurable.metric,
        baseline: goal.measurable.baseline,
        target: goal.measurable.target,
        current_value: goal.measurable.currentValue ?? goal.measurable.baseline,
        unit: goal.measurable.unit,
        difficulty: goal.achievable?.difficulty || 'moderate',
        required_actions: goal.achievable?.requiredActions || [],
        prerequisites: goal.achievable?.prerequisites || [],
        importance: goal.relevant?.importance || 3,
        motivations: goal.relevant?.motivations || [],
        related_goals: goal.relevant?.relatedGoals || [],
        time_frame: goal.timeBound.timeFrame,
        start_date: goal.timeBound.startDate,
        end_date: goal.timeBound.endDate,
        check_in_frequency: goal.timeBound.checkInFrequency,
        progress_percentage: 0,
        notes: goal.notes || null,
      })
      .select()
      .single();

    if (goalError) {
      console.error('Error saving goal:', goalError);
      return NextResponse.json({ error: 'Failed to save goal' }, { status: 500 });
    }

    // Save milestones if provided
    if (goal.progress?.milestones && goal.progress.milestones.length > 0) {
      const milestones = goal.progress.milestones.map((milestone, index) => ({
        goal_id: savedGoal.id,
        title: milestone.title,
        description: milestone.description || null,
        target_date: milestone.targetDate,
        target_value: milestone.targetValue || null,
        completed: false,
        reward: milestone.reward || null,
        display_order: index,
      }));

      const { error: milestonesError } = await supabase
        .from('goal_milestones')
        .insert(milestones);

      if (milestonesError) {
        console.error('Error saving milestones:', milestonesError);
        // Continue anyway, goal is saved
      }
    }

    // Fetch complete goal with milestones
    const { data: completeGoal, error: fetchError } = await supabase
      .from('smart_goals')
      .select('*, goal_milestones(*), goal_check_ins(*)')
      .eq('id', savedGoal.id)
      .single();

    if (fetchError) {
      console.error('Error fetching complete goal:', fetchError);
      return NextResponse.json(
        { error: 'Goal created but failed to fetch' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: completeGoal,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/goals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/goals?userId=xxx&status=active
 * Get all goals for a user
 */
export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || user.id;
    const status = searchParams.get('status') as GoalStatus | null;
    const planId = searchParams.get('planId');

    // Users can only access their own goals
    if (userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Build query
    let query = supabase
      .from('smart_goals')
      .select('*, goal_milestones(*), goal_check_ins(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (planId) {
      query = query.eq('plan_id', planId);
    }

    const { data: goals, error } = await query;

    if (error) {
      console.error('Error fetching goals:', error);
      return NextResponse.json(
        { error: 'Failed to fetch goals' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: goals,
    });
  } catch (error) {
    console.error('Error in GET /api/goals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
