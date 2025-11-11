import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ActionPlanGenerator } from '@/lib/action-plan/action-plan-generator';
import type { InteractiveConcern } from '@/lib/concerns/concern-education';
import type { ActionPlanPreferences } from '@/lib/action-plan/action-plan-generator';

/**
 * POST /api/action-plans
 * Generate and save a new action plan
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

    // Parse request body
    const body = await request.json();
    const {
      analysisId,
      concerns,
      skinHealthScore,
      preferences,
    }: {
      analysisId?: string;
      concerns: InteractiveConcern[];
      skinHealthScore: number;
      preferences?: ActionPlanPreferences;
    } = body;

    // Validate required fields
    if (!concerns || concerns.length === 0) {
      return NextResponse.json(
        { error: 'Concerns are required to generate an action plan' },
        { status: 400 }
      );
    }

    if (skinHealthScore === undefined || skinHealthScore < 0 || skinHealthScore > 100) {
      return NextResponse.json(
        { error: 'Valid skin health score (0-100) is required' },
        { status: 400 }
      );
    }

    // Generate action plan
    const generator = new ActionPlanGenerator(concerns, preferences || {});
    const plan = generator.generatePlan(user.id, analysisId || '', skinHealthScore);

    // Save action plan to database
    const { data: savedPlan, error: planError } = await supabase
      .from('action_plans')
      .insert({
        user_id: user.id,
        analysis_id: analysisId || null,
        skin_health_score: skinHealthScore,
        primary_concerns: plan.primaryConcerns,
        total_actions: plan.totalActions,
        estimated_cost_min: plan.estimatedCost.min,
        estimated_cost_max: plan.estimatedCost.max,
        currency: plan.estimatedCost.currency,
        progress_percentage: 0,
      })
      .select()
      .single();

    if (planError) {
      console.error('Error saving action plan:', planError);
      return NextResponse.json(
        { error: 'Failed to save action plan' },
        { status: 500 }
      );
    }

    // Save action items
    const actionItems = plan.sections.flatMap((section, sectionIndex) =>
      section.actions.map((action, actionIndex) => ({
        plan_id: savedPlan.id,
        title: action.title,
        description: action.description,
        category: action.category,
        priority: action.priority,
        concern_types: action.concernTypes,
        frequency: action.frequency || null,
        estimated_duration: action.estimatedDuration || null,
        cost_min: action.cost?.min || null,
        cost_max: action.cost?.max || null,
        currency: action.cost?.currency || 'USD',
        difficulty: action.difficulty,
        status: action.status,
        display_order: sectionIndex * 100 + actionIndex,
      }))
    );

    const { error: itemsError } = await supabase
      .from('action_items')
      .insert(actionItems);

    if (itemsError) {
      console.error('Error saving action items:', itemsError);
      // Rollback plan creation
      await supabase.from('action_plans').delete().eq('id', savedPlan.id);
      return NextResponse.json(
        { error: 'Failed to save action items' },
        { status: 500 }
      );
    }

    // Fetch complete plan with items
    const { data: completePlan, error: fetchError } = await supabase
      .from('action_plans')
      .select('*, action_items(*)')
      .eq('id', savedPlan.id)
      .single();

    if (fetchError) {
      console.error('Error fetching complete plan:', fetchError);
      return NextResponse.json(
        { error: 'Plan created but failed to fetch' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: completePlan,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/action-plans:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/action-plans?userId=xxx
 * Get all action plans for a user
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

    // Users can only access their own plans
    if (userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch action plans with items
    const { data: plans, error } = await supabase
      .from('action_plans')
      .select('*, action_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching action plans:', error);
      return NextResponse.json(
        { error: 'Failed to fetch action plans' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error('Error in GET /api/action-plans:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
