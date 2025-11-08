import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get("customer_id")

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let query = supabase.from("treatment_plans").select("*").eq("is_active", true)

    if (customerId) {
      query = query.eq("user_id", customerId)
    } else {
      query = query.eq("user_id", user.id)
    }

    const { data: plans, error } = await query.order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ plans })
  } catch (error) {
    console.error("[v0] Error fetching treatment plans:", error)
    return NextResponse.json({ error: "Failed to fetch treatment plans" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const body = await request.json()
    const { user_id, analysis_id, concern_type, treatments, estimated_duration, estimated_cost, notes, schedule } = body

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: plan, error } = await supabase
      .from("treatment_plans")
      .insert({
        user_id,
        analysis_id,
        concern_type,
        treatments,
        estimated_duration,
        estimated_cost,
        notes,
        schedule,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ plan })
  } catch (error) {
    console.error("[v0] Error creating treatment plan:", error)
    return NextResponse.json({ error: "Failed to create treatment plan" }, { status: 500 })
  }
}
