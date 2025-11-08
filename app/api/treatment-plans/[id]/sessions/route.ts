import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

  const resolvedParams = await context.params

    const { data: sessions, error } = await supabase
      .from("treatment_sessions")
      .select(
        `
        *,
        staff:users!treatment_sessions_staff_id_fkey(full_name)
      `,
      )
      .eq("treatment_plan_id", resolvedParams.id)
      .order("session_number")

    if (error) throw error

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error("[v0] Error fetching sessions:", error)
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createServerClient()
    const body = await request.json()
    const { session_number, scheduled_date, notes } = body

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

  const resolvedParams = await context.params

    const { data: session, error } = await supabase
      .from("treatment_sessions")
      .insert({
        treatment_plan_id: resolvedParams.id,
        session_number,
        scheduled_date,
        staff_id: user.id,
        notes,
        status: "scheduled",
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ session })
  } catch (error) {
    console.error("[v0] Error creating session:", error)
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createServerClient()
    const body = await request.json()
    const { session_id, status, completed_date, staff_observations, customer_feedback } = body

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

  const resolvedParams = await context.params

    const { data: session, error } = await supabase
      .from("treatment_sessions")
      .update({
        status,
        completed_date,
        staff_observations,
        customer_feedback,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ session })
  } catch (error) {
    console.error("[v0] Error updating session:", error)
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 })
  }
}
