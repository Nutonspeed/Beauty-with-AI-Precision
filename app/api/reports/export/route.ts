import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { format } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has access
    const { data: userProfile } = await supabase.from("users").select("role").eq("id", session.user.id).single()

    if (!["admin", "clinic_staff"].includes(userProfile?.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type") || "bookings" // bookings, payments, customers

    let data: any[] = []
    let headers: string[] = []

    switch (type) {
      case "bookings": {
        const { data: bookings } = await supabase
          .from("bookings")
          .select(
            `
          *,
          user:users(full_name, email, phone),
          clinic:clinics(name)
        `,
          )
          .order("created_at", { ascending: false })

        data = bookings || []
        headers = ["ID", "Customer", "Email", "Treatment", "Date", "Time", "Status", "Clinic", "Created"]
        break
      }

      case "payments": {
        const { data: payments } = await supabase
          .from("payments")
          .select(
            `
          *,
          user:users(full_name, email)
        `,
          )
          .order("created_at", { ascending: false })

        data = payments || []
        headers = ["ID", "Customer", "Email", "Amount", "Currency", "Status", "Type", "Created"]
        break
      }

      case "customers": {
        const { data: customers } = await supabase
          .from("users")
          .select("*")
          .in("role", ["customer", "customer_premium"])
          .order("created_at", { ascending: false })

        data = customers || []
        headers = ["ID", "Name", "Email", "Phone", "Role", "Created"]
        break
      }
    }

    // Convert to CSV
    const csvRows = [headers.join(",")]

    for (const row of data) {
      const values = headers.map((header) => {
        let value = ""

        switch (type) {
          case "bookings":
            switch (header) {
              case "ID":
                value = row.id
                break
              case "Customer":
                value = row.user?.full_name || "N/A"
                break
              case "Email":
                value = row.user?.email || "N/A"
                break
              case "Treatment":
                value = row.treatment_type
                break
              case "Date":
                value = row.booking_date
                break
              case "Time":
                value = row.booking_time
                break
              case "Status":
                value = row.status
                break
              case "Clinic":
                value = row.clinic?.name || "N/A"
                break
              case "Created":
                value = format(new Date(row.created_at), "yyyy-MM-dd HH:mm")
                break
            }
            break

          case "payments":
            switch (header) {
              case "ID":
                value = row.id
                break
              case "Customer":
                value = row.user?.full_name || "N/A"
                break
              case "Email":
                value = row.user?.email || "N/A"
                break
              case "Amount":
                value = (row.amount / 100).toString()
                break
              case "Currency":
                value = row.currency.toUpperCase()
                break
              case "Status":
                value = row.status
                break
              case "Type":
                value = row.payment_type
                break
              case "Created":
                value = format(new Date(row.created_at), "yyyy-MM-dd HH:mm")
                break
            }
            break

          case "customers":
            switch (header) {
              case "ID":
                value = row.id
                break
              case "Name":
                value = row.full_name || "N/A"
                break
              case "Email":
                value = row.email
                break
              case "Phone":
                value = row.phone || "N/A"
                break
              case "Role":
                value = row.role
                break
              case "Created":
                value = format(new Date(row.created_at), "yyyy-MM-dd HH:mm")
                break
            }
            break
        }

        // Escape commas and quotes
        return `"${value.toString().replace(/"/g, '""')}"`
      })

      csvRows.push(values.join(","))
    }

    const csv = csvRows.join("\n")
    const filename = `${type}-export-${format(new Date(), "yyyy-MM-dd")}.csv`

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Error exporting data:", error)
    return NextResponse.json(
      { error: "Failed to export data", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
