import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

  const { id } = await context.params

    const { data: proposal, error: rpcError } = await supabase.rpc("increment_proposal_view_count", {
      proposal_id: id,
      user_id: user.id,
    })

    if (rpcError) {
      console.error("[API] Error tracking view:", rpcError)

      const { data: existing, error: checkError } = await supabase
        .from("sales_proposals")
        .select("id, view_count, first_viewed_at, lead_id, title, sales_user_id")
        .eq("id", id)
        .single()

      if (checkError || !existing) {
        return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
      }

      if (existing.sales_user_id !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      const now = new Date().toISOString()
      const updates: any = {
        viewed_at: now,
        view_count: (existing.view_count || 0) + 1,
        updated_at: now,
      }

      if (!existing.first_viewed_at) {
        updates.first_viewed_at = now
      }

      const { data: updatedProposal, error: updateError } = await supabase
        .from("sales_proposals")
        .update(updates)
        .eq("id", id)
        .select(`
          *,
          lead:sales_leads!lead_id (
            id,
            name,
            email,
            phone,
            status
          ),
          sales_user:users!sales_user_id (
            id,
            full_name,
            email
          )
        `)
        .single()

      if (updateError) {
        console.error("[API] Error updating proposal:", updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      if (!existing.first_viewed_at) {
        await supabase.from("sales_activities").insert({
          lead_id: existing.lead_id,
          sales_user_id: user.id,
          proposal_id: id,
          type: "note",
          subject: "Proposal First Viewed",
          description: `Customer viewed proposal: ${existing.title} for the first time`,
        })
      }

      return NextResponse.json(updatedProposal)
    }

    return NextResponse.json(proposal)
  } catch (error) {
    console.error("[API] Unexpected error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
