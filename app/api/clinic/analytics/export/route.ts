import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// GET /api/clinic/analytics/export - Export analytics to CSV
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const _format = searchParams.get("format") || "csv" // Reserved for future Excel support
    const startDate = searchParams.get("start_date") || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const endDate = searchParams.get("end_date") || new Date().toISOString()

    // Get user's clinic
    const { data: userProfile } = await supabase
      .from("users")
      .select("clinic_id")
      .eq("id", user.id)
      .single()

    if (!userProfile?.clinic_id) {
      return NextResponse.json({ error: "No clinic assigned" }, { status: 403 })
    }

    // Fetch bookings data
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select(`
        id,
        booking_date,
        status,
        total_amount,
        treatment_type,
        customer:customers(full_name, email, phone),
        staff:users(full_name)
      `)
      .eq("clinic_id", userProfile.clinic_id)
      .gte("booking_date", startDate)
      .lte("booking_date", endDate)
      .order("booking_date", { ascending: false })

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError)
      return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
    }

    // Generate CSV
    const csvRows = [
      // Header
      ["Date", "Customer", "Email", "Phone", "Treatment", "Staff", "Status", "Amount"].join(","),
      // Data rows
      ...(bookings || []).map((b: any) => [
        new Date(b.booking_date).toLocaleDateString("th-TH"),
        `"${b.customer?.full_name || "N/A"}"`,
        b.customer?.email || "N/A",
        b.customer?.phone || "N/A",
        `"${b.treatment_type || "N/A"}"`,
        `"${b.staff?.full_name || "N/A"}"`,
        b.status,
        b.total_amount || 0
      ].join(","))
    ]

    const csvContent = csvRows.join("\n")
    const filename = `clinic-analytics-${new Date().toISOString().split("T")[0]}.csv`

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Error generating export:", error)
    return NextResponse.json({ error: "Failed to generate export" }, { status: 500 })
  }
}

// Note: Excel export removed - using CSV for simplicity
// If Excel needed, install xlsx package: pnpm add xlsx
