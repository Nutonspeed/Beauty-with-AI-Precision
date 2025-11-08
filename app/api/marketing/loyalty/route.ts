import { createServerClient } from "@/lib/supabase/server"
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
    const customerId = searchParams.get("customerId") || user.id

    // Get loyalty points
    const { data: loyalty, error: loyaltyError } = await supabase
      .from("loyalty_points")
      .select("*")
      .eq("customer_id", customerId)
      .single()

    if (loyaltyError && loyaltyError.code !== "PGRST116") {
      throw loyaltyError
    }

    // Get recent transactions
    const { data: transactions, error: transError } = await supabase
      .from("loyalty_transactions")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })
      .limit(10)

    if (transError) throw transError

    return NextResponse.json({
      loyalty: loyalty || { points: 0, lifetime_points: 0, tier: "bronze" },
      transactions: transactions || [],
    })
  } catch (error) {
    console.error("Error fetching loyalty data:", error)
    return NextResponse.json({ error: "Failed to fetch loyalty data" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is staff
    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!userData || !["admin", "clinic_staff"].includes(userData.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { customerId, points, type, reason } = body

    // Update loyalty points
    const { data: loyalty, error: updateError } = await supabase
      .from("loyalty_points")
      .select("*")
      .eq("customer_id", customerId)
      .single()

    if (updateError && updateError.code !== "PGRST116") {
      throw updateError
    }

    const currentPoints = loyalty?.points || 0
    const currentLifetime = loyalty?.lifetime_points || 0
    const newPoints = type === "redeemed" ? currentPoints - points : currentPoints + points
    const newLifetime = type === "earned" ? currentLifetime + points : currentLifetime

    if (loyalty) {
      await supabase
        .from("loyalty_points")
        .update({ points: newPoints, lifetime_points: newLifetime })
        .eq("customer_id", customerId)
    } else {
      await supabase
        .from("loyalty_points")
        .insert({ customer_id: customerId, points: newPoints, lifetime_points: newLifetime })
    }

    // Record transaction
    await supabase.from("loyalty_transactions").insert({
      customer_id: customerId,
      points,
      type,
      reason,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating loyalty points:", error)
    return NextResponse.json({ error: "Failed to update loyalty points" }, { status: 500 })
  }
}
