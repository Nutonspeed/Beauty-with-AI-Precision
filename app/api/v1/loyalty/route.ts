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

    // Get loyalty points
    const { data: loyalty, error: loyaltyError } = await supabase
      .from("loyalty_points")
      .select("*")
      .eq("customer_id", user.id)
      .single()

    if (loyaltyError && loyaltyError.code !== "PGRST116") {
      throw loyaltyError
    }

    // Get recent transactions
    const { data: transactions, error: transError } = await supabase
      .from("loyalty_transactions")
      .select("*")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)

    if (transError) throw transError

    return NextResponse.json({
      loyalty: loyalty || { points: 0, lifetime_points: 0, tier: "bronze" },
      transactions: transactions || [],
    })
  } catch (error) {
    console.error("Loyalty fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
