import { createServerClient } from "@/lib/supabase/server"
import { getSkinAnalysesHistory } from "@/lib/api/skin-analyses-history"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const canonical = searchParams.get("canonical") === "true"

    const headers = {
      Deprecation: 'true',
      'X-Deprecated': 'true',
      Link: '</api/analysis/history>; rel="successor-version"',
      'X-Canonical-Mode': canonical ? 'true' : 'false',
    }

    if (canonical) {
      const validatedLimit = Math.min(Math.max(1, limit), 100)
      const validatedOffset = Math.max(0, offset)

      const analyses = await getSkinAnalysesHistory(user.id, validatedLimit)
      const formattedAnalyses = analyses.map((row: any) => {
        return {
          id: row.id,
          user_id: user.id,
          type: "single",
          storage_paths: {},
          image_urls: {
            primary: {
              original: row.image_url,
              display: row.image_url,
              thumbnail: row.image_thumbnail_url,
            },
          },
          analysis_data: {
            skin_analyses_id: row.id,
            image_url: row.image_url,
            created_at: row.created_at,
            ai_concerns: row.ai_concerns || [],
            counts: {
              spots: row.spots_count || 0,
              pores: row.pores_count || 0,
              wrinkles: row.wrinkles_count || 0,
              redness: row.redness_count || 0,
            },
          },
          metadata: {
            source: "skin_analyses",
          },
          created_at: row.created_at,
          updated_at: row.created_at,
        }
      })

      return NextResponse.json(
        { analyses: formattedAnalyses, pagination: { limit: validatedLimit, offset: validatedOffset, total: analyses.length } },
        { headers },
      )
    }

    const { data: analyses, error } = await supabase
      .from("analyses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({ analyses, pagination: { limit, offset, total: analyses.length } }, { headers })
  } catch (error) {
    console.error("Analyses fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
