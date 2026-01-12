/**
 * AI Program Advisor API (Task 3/7)
 * POST /api/ai-advisor
 */

import { NextRequest, NextResponse } from 'next/server'
import { withCenterAuth } from '@/lib/auth/middleware'
import { getProgramAdvisor } from '@/lib/ai/program-advisor'
import type { HybridSkinAnalysis } from '@/lib/types/skin-analysis'

async function handler(request: NextRequest) {
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
    const advisor = getProgramAdvisor()

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
        totalPrograms: advice.length,
        estimatedCost: totalCost,
        timelineWeeks,
        topPriority: advice[0]?.programName
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

export const POST = withCenterAuth(handler, { rateLimitCategory: 'ai' })
