import { NextRequest, NextResponse } from "next/server"
// import * as XLSX from "xlsx" // TODO: Install xlsx package

// GET /api/clinic/analytics/export - Export analytics to Excel
export async function GET(request: NextRequest) {
  // TODO: Temporarily disabled until xlsx package is properly installed
  return NextResponse.json(
    { error: "Export feature temporarily unavailable. Please contact support." },
    { status: 503 }
  )
  
  /* try {
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
    const startDate = searchParams.get("start_date") || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const endDate = searchParams.get("end_date") || new Date().toISOString()

    // Fetch all data in parallel
    const [revenueRes, treatmentsRes, staffRes, customersRes] = await Promise.all([
      fetch(`${request.nextUrl.origin}/api/clinic/analytics/revenue?start_date=${startDate}&end_date=${endDate}`, {
        headers: { Cookie: request.headers.get("cookie") || "" },
      }),
      fetch(`${request.nextUrl.origin}/api/clinic/analytics/treatments?start_date=${startDate}&end_date=${endDate}`, {
        headers: { Cookie: request.headers.get("cookie") || "" },
      }),
      fetch(
        `${request.nextUrl.origin}/api/clinic/analytics/staff-performance?start_date=${startDate}&end_date=${endDate}`,
        { headers: { Cookie: request.headers.get("cookie") || "" } }
      ),
      fetch(
        `${request.nextUrl.origin}/api/clinic/analytics/customer-retention?start_date=${startDate}&end_date=${endDate}`,
        { headers: { Cookie: request.headers.get("cookie") || "" } }
      ),
    ])

    const [revenueData, treatmentsData, staffData, customersData] = await Promise.all([
      revenueRes.json(),
      treatmentsRes.json(),
      staffRes.json(),
      customersRes.json(),
    ])

    // Create a new workbook
    const wb = XLSX.utils.book_new()

    // Sheet 1: Revenue Summary
    const revenueSheet = [
      ["Revenue Analytics Report"],
      [`Period: ${new Date(startDate).toLocaleDateString("th-TH")} - ${new Date(endDate).toLocaleDateString("th-TH")}`],
      [],
      ["Summary"],
      ["Total Revenue", revenueData.summary.totalRevenue],
      ["Total Bookings", revenueData.summary.totalBookings],
      ["Paid Count", revenueData.summary.paidCount],
      ["Pending Count", revenueData.summary.pendingCount],
      ["Average Order Value", revenueData.summary.averageOrderValue],
      ["Conversion Rate", `${revenueData.summary.conversionRate.toFixed(2)}%`],
      [],
      ["Revenue by Treatment"],
      ["Treatment", "Revenue", "Count", "Percentage"],
      ...revenueData.treatmentBreakdown.map((item: any) => [
        item.treatment,
        item.revenue,
        item.count,
        `${item.percentage.toFixed(2)}%`,
      ]),
    ]
    const ws1 = XLSX.utils.aoa_to_sheet(revenueSheet)
    XLSX.utils.book_append_sheet(wb, ws1, "Revenue")

    // Sheet 2: Treatment Analysis
    const treatmentSheet = [
      ["Treatment Analytics"],
      [],
      ["Summary"],
      ["Total Treatments", treatmentsData.summary.totalTreatments],
      ["Total Bookings", treatmentsData.summary.totalBookings],
      ["Total Revenue", treatmentsData.summary.totalRevenue],
      ["Average Revenue per Treatment", treatmentsData.summary.averageRevenuePerTreatment],
      [],
      ["Treatment Details"],
      ["Treatment", "Bookings", "Revenue", "Paid Count", "Unique Customers", "Avg Price", "Growth Rate"],
      ...treatmentsData.treatments.map((item: any) => [
        item.treatment,
        item.bookings,
        item.revenue,
        item.paidCount,
        item.uniqueCustomers,
        item.averagePrice,
        `${item.growthRate.toFixed(2)}%`,
      ]),
    ]
    const ws2 = XLSX.utils.aoa_to_sheet(treatmentSheet)
    XLSX.utils.book_append_sheet(wb, ws2, "Treatments")

    // Sheet 3: Staff Performance
    const staffSheet = [
      ["Staff Performance"],
      [],
      ["Summary"],
      ["Total Staff", staffData.summary.totalStaff],
      ["Total Revenue", staffData.summary.totalRevenue],
      ["Total Appointments", staffData.summary.totalAppointments],
      ["Average Revenue per Staff", staffData.summary.averageRevenuePerStaff],
      [],
      ["Staff Details"],
      ["Name", "Role", "Rating", "Appointments", "Revenue", "Avg per Appointment", "Email"],
      ...staffData.staffPerformance.map((item: any) => [
        item.name,
        item.role,
        item.rating,
        item.appointments,
        item.revenue,
        item.averageRevenuePerAppointment,
        item.email,
      ]),
    ]
    const ws3 = XLSX.utils.aoa_to_sheet(staffSheet)
    XLSX.utils.book_append_sheet(wb, ws3, "Staff")

    // Sheet 4: Customer Retention
    const customerSheet = [
      ["Customer Retention Analysis"],
      [],
      ["Summary"],
      ["Total Customers", customersData.summary.totalCustomers],
      ["Customers with Bookings", customersData.summary.customersWithBookings],
      ["Repeat Customers", customersData.summary.repeatCustomers],
      ["Retention Rate", `${customersData.summary.retentionRate.toFixed(2)}%`],
      ["Average Lifetime Value", customersData.summary.averageLifetimeValue],
      ["New Customers in Period", customersData.summary.newCustomersInPeriod],
      ["Churned Customers", customersData.summary.churnedCustomers],
      ["Churn Rate", `${customersData.summary.churnRate.toFixed(2)}%`],
      [],
      ["Customer Segments"],
      ["One-time Customers", customersData.segments.oneTime],
      ["2-5 Bookings", customersData.segments.twoToFive],
      ["5+ Bookings", customersData.segments.moreThanFive],
      [],
      ["Top Customers"],
      ["Customer Name", "Total Value", "Total Bookings", "Paid Bookings", "Average Order Value"],
      ...customersData.topCustomers.map((item: any) => [
        item.customerName,
        item.totalValue,
        item.totalBookings,
        item.paidBookings,
        item.averageOrderValue,
      ]),
    ]
    const ws4 = XLSX.utils.aoa_to_sheet(customerSheet)
    XLSX.utils.book_append_sheet(wb, ws4, "Customers")

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

    // Return Excel file
    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="analytics-report-${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    })
  } catch (error) {
    console.error("Error generating Excel export:", error)
    return NextResponse.json({ error: "Failed to generate export" }, { status: 500 })
  } */
}
