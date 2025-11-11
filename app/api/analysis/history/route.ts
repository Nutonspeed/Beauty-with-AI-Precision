/**
 * Analysis History API
 * 
 * GET /api/analysis/history
 * Returns analysis history with optimized image URLs:
 * - Thumbnail tier for fast list view loading (95 KB vs 8.5 MB)
 * - Display tier for preview modal (890 KB)
 * - Original tier preserved for re-analysis
 */

import { type NextRequest, NextResponse } from "next/server"
import { getAnalysisHistory } from "@/lib/api/analysis-storage"
import { createServerClient } from "@/lib/supabase/server"

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get('limit') || '12', 10)
    const offset = Number.parseInt(searchParams.get('offset') || '0', 10)
    const sortBy = (searchParams.get('sortBy') || 'created_at') as 'created_at' | 'updated_at'
    const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc'

    console.log('[HistoryAPI] Loading history for user:', user.id, { limit, offset, sortBy, order })

    // Get history with optimized URLs
    const result = await getAnalysisHistory(user.id, {
      limit,
      offset,
      sortBy,
      order,
    })

    console.log('[HistoryAPI] Loaded', result.data.length, 'analyses')

    return NextResponse.json(result)
  } catch (error) {
    console.error('[HistoryAPI] Error:', error)
    return NextResponse.json(
      { error: "Failed to load analysis history" },
      { status: 500 }
    )
  }
}
