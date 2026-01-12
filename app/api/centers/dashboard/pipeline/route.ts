import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's center_id
    const { data: userData } = await supabase.from("users").select("center_id, role").eq("id", user.id).single()

    if (!userData || (userData.role !== "center_owner" && userData.role !== "center_staff")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const centerId = userData.center_id

    if (!centerId) {
      return NextResponse.json({ error: "No center associated" }, { status: 400 })
    }

    // Fetch customers grouped by lead status
    const { data: customers, error } = await supabase
      .from("customers")
      .select("id, full_name, email, phone, lead_status, lead_score, created_at")
      .eq("center_id", centerId)
      .order("lead_score", { ascending: false })
      .limit(50)

    if (error) throw error

    // Group by lead status
    const pipeline = {
      new: customers?.filter((c) => c.lead_status === "new") || [],
      contacted: customers?.filter((c) => c.lead_status === "contacted") || [],
      qualified: customers?.filter((c) => c.lead_status === "qualified") || [],
      proposal: customers?.filter((c) => c.lead_status === "proposal_sent") || [],
      negotiation: customers?.filter((c) => c.lead_status === "negotiation") || [],
      won: customers?.filter((c) => c.lead_status === "won") || [],
      lost: customers?.filter((c) => c.lead_status === "lost") || [],
    }

    // Calculate pipeline metrics
    const metrics = {
      totalLeads: customers?.length || 0,
      newLeads: pipeline.new.length,
      contacted: pipeline.contacted.length,
      qualified: pipeline.qualified.length,
      proposals: pipeline.proposal.length,
      negotiation: pipeline.negotiation.length,
      won: pipeline.won.length,
      lost: pipeline.lost.length,
      conversionRate:
        customers && customers.length > 0 ? ((pipeline.won.length / customers.length) * 100).toFixed(1) : "0.0",
    }

    return NextResponse.json({
      pipeline,
      metrics,
    })
  } catch (error) {
    console.error("[v0] Error fetching pipeline:", error)
    return NextResponse.json(
      { error: "Failed to fetch pipeline", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
