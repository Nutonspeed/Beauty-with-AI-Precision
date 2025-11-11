/**
 * Treatment Recommendations API
 * Generate AI-powered treatment recommendations based on skin analysis
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateTreatmentRecommendations } from '@/lib/ai/treatment-recommendation-engine'
import type { RecommendationCriteria } from '@/types/treatment'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { analysis_id, criteria } = body

    if (!analysis_id) {
      return NextResponse.json(
        { error: 'analysis_id is required' },
        { status: 400 }
      )
    }

    // Fetch analysis data
    const { data: analysis, error: analysisError } = await supabase
      .from('skin_analyses')
      .select('*')
      .eq('id', analysis_id)
      .single()

    if (analysisError || !analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      )
    }

    // Get user profile for personalization
    const { data: profile } = await supabase
      .from('profiles')
      .select('birth_date, medical_history, skin_type')
      .eq('id', user.id)
      .single()

    // Calculate age from birth_date
    const age = profile?.birth_date
      ? new Date().getFullYear() - new Date(profile.birth_date).getFullYear()
      : 30 // Default age

    // Build recommendation criteria
    const recommendationCriteria: RecommendationCriteria = {
      // Analysis results
      spots_severity: analysis.results?.spots?.[0]?.severity || 0,
      pores_severity: analysis.results?.pores?.[0]?.size || 0,
      wrinkles_severity: analysis.results?.wrinkles?.[0]?.severity || 0,
      texture_score: analysis.results?.texture?.score || 0,
      redness_level: analysis.results?.redness?.level || 0,

      // User profile
      age,
      skin_type: profile?.skin_type,
      medical_history: profile?.medical_history,

      // User preferences (from request)
      budget_min: criteria?.budget_min,
      budget_max: criteria?.budget_max,
      max_downtime_days: criteria?.max_downtime_days,
      max_pain_level: criteria?.max_pain_level,
      preferred_categories: criteria?.preferred_categories
    }

    // Generate recommendations
    const recommendations = await generateTreatmentRecommendations(
      analysis.results,
      recommendationCriteria
    )

    // Save recommendations to database
    const recommendationsToInsert = recommendations.recommended_treatments.map(rec => ({
      analysis_id,
      treatment_id: rec.treatment_id,
      priority: rec.priority,
      confidence_score: rec.confidence_score,
      estimated_cost_min: rec.estimated_cost_min,
      estimated_cost_max: rec.estimated_cost_max,
      estimated_sessions: rec.estimated_sessions,
      predicted_improvement: rec.predicted_improvement,
      timeline_weeks: rec.timeline_weeks,
      recommendation_reason: rec.recommendation_reason,
      target_concerns: rec.target_concerns,
      status: 'suggested'
    }))

    // Check if table exists before inserting
    const { error: insertError } = await supabase
      .from('treatment_recommendations')
      .insert(recommendationsToInsert)

    if (insertError) {
      console.warn('Could not save recommendations to database:', insertError.message)
      // Continue anyway - return recommendations even if DB save fails
    }

    return NextResponse.json({
      success: true,
      data: recommendations,
      analysis_id,
      user_id: user.id,
      generated_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error generating treatment recommendations:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET - Fetch existing recommendations for an analysis
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get analysis_id from query params
    const { searchParams } = new URL(request.url)
    const analysis_id = searchParams.get('analysis_id')

    if (!analysis_id) {
      return NextResponse.json(
        { error: 'analysis_id is required' },
        { status: 400 }
      )
    }

    // Fetch recommendations with treatment details
    const { data: recommendations, error } = await supabase
      .from('treatment_recommendations')
      .select(`
        *,
        treatment:treatments(*)
      `)
      .eq('analysis_id', analysis_id)
      .order('priority', { ascending: true })

    if (error) {
      console.error('Error fetching recommendations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch recommendations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: recommendations,
      count: recommendations?.length || 0
    })

  } catch (error) {
    console.error('Error in GET /api/recommendations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
