/**
 * Analysis History API
 * 
 * GET /api/analysis/history
 * Canonical history endpoint for UI.
 * Returns skin_analyses history with pagination in the shape expected by AnalysisHistoryGallery.
 */

import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getSkinAnalysesHistory } from "@/lib/api/skin-analyses-history"

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const requestedUserId = searchParams.get('userId')
    const limit = Number.parseInt(searchParams.get('limit') || '12', 10)
    const offset = Number.parseInt(searchParams.get('offset') || '0', 10)

    // Best-effort support for userId param: only allow current user without relying on role
    const targetUserId = requestedUserId && requestedUserId === user.id ? requestedUserId : user.id

    const validatedLimit = Math.min(Math.max(1, limit), 100)
    const validatedOffset = Math.max(0, offset)

    const analyses = await getSkinAnalysesHistory(targetUserId, validatedLimit)
    const total = analyses.length

    const data = (analyses || []).map((row: any) => {
      const concernCount = {
        wrinkle: row.wrinkles_count || 0,
        pigmentation: row.spots_count || 0,
        pore: row.pores_count || 0,
        redness: row.redness_count || 0,
        acne: 0,
        dark_circle: 0,
      }

      const concerns = ((row.ai_concerns || []) as string[]).map((type) => ({
        type,
        severity: 50,
        confidence: 0.8,
        locations: [],
      }))

      return {
        id: row.id,
        imageUrl: row.image_url,
        displayUrl: row.image_url,
        thumbnailUrl: row.image_thumbnail_url || undefined,
        concerns,
        createdAt: row.created_at,
        concernCount,
      }
    })

    return NextResponse.json({
      data,
      pagination: {
        total: total || 0,
        limit: validatedLimit,
        offset: validatedOffset,
      },
    })
  } catch (error) {
    console.error('[HistoryAPI] Error:', error)
    return NextResponse.json(
      { error: "Failed to load analysis history" },
      { status: 500 }
    )
  }
}
