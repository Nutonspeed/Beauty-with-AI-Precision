/**
 * AI Treatment Advisor API (Task 3/7)
 * POST /api/ai-advisor
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTreatmentAdvisor } from '@/lib/ai/treatment-advisor'
import type { HybridSkinAnalysis } from '@/lib/types/skin-analysis'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { analysis, options } = body
    
    if (!analysis) {
      return NextResponse.json(
        { error: 'Missing skin analysis data' },
        { status: 400 }
      )
    }
    
    // Get AI advisor
    const advisor = getTreatmentAdvisor()
    
    // Generate intelligent recommendations
    const advice = await advisor.analyzeSkinAndRecommend(
      analysis as HybridSkinAnalysis,
      options
    )
    
    // Calculate totals
    const totalCost = advisor.calculateTotalCost(advice)
    const timelineWeeks = advisor.estimateTimelineWeeks(advice)
    
    return NextResponse.json({
      success: true,
      advice,
      summary: {
        totalTreatments: advice.length,
        estimatedCost: totalCost,
        timelineWeeks,
        topPriority: advice[0]?.treatmentName
      }
    })
  } catch (error) {
    console.error('AI Advisor error:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI recommendations' },
      { status: 500 }
    )
  }
}
