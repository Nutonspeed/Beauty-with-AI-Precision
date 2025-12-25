import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const period = searchParams.get('period') || 'month'
    const clinicId = searchParams.get('clinicId')

    // Check if user is super admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch revenue data
    const revenueUrl = new URL('/api/admin/revenue', request.url)
    revenueUrl.searchParams.set('period', period)
    if (clinicId) revenueUrl.searchParams.set('clinicId', clinicId)

    const revenueResponse = await fetch(revenueUrl.toString())
    if (!revenueResponse.ok) throw new Error('Failed to fetch revenue data')
    const revenueData = await revenueResponse.json()

    if (format === 'csv') {
      // Create detailed CSV report
      const headers = [
        'Report Type',
        'Metric',
        'Value',
        'Period',
        'Generated At'
      ]

      const rows = [
        ['Summary', 'Total Revenue', revenueData.totalRevenue.toString(), period, new Date().toISOString()],
        ['Summary', 'MRR', revenueData.mrr.toString(), period, new Date().toISOString()],
        ['Summary', 'ARR', revenueData.arr.toString(), period, new Date().toISOString()],
        ['Summary', 'Monthly Growth %', revenueData.growth.monthly.toString(), period, new Date().toISOString()],
        ['Summary', 'Yearly Growth %', revenueData.growth.yearly.toString(), period, new Date().toISOString()],
        ['Summary', 'Churn Rate %', revenueData.churnRate.toString(), period, new Date().toISOString()],
        ['Summary', 'LTV', revenueData.ltv.toString(), period, new Date().toISOString()],
        ['Summary', 'CAC', revenueData.cac.toString(), period, new Date().toISOString()],
        ['', '', '', '', ''], // Empty row separator
        ['Revenue by Plan', '', '', '', ''],
        ...revenueData.revenueByPlan.map(plan => [
          'Plan Revenue',
          plan.plan,
          plan.revenue.toString(),
          period,
          new Date().toISOString()
        ]),
        ['', '', '', '', ''], // Empty row separator
        ['Revenue by Clinic', '', '', '', ''],
        ...revenueData.revenueByClinic.slice(0, 20).map(clinic => [
          'Clinic Revenue',
          clinic.clinic,
          clinic.revenue.toString(),
          period,
          new Date().toISOString()
        ]),
        ['', '', '', '', ''], // Empty row separator
        ['Payment Methods', '', '', '', ''],
        ...revenueData.paymentMethods.map(method => [
          'Payment Method',
          method.method,
          method.amount.toString(),
          period,
          new Date().toISOString()
        ]),
        ['', '', '', '', ''], // Empty row separator
        ['Monthly Revenue', '', '', '', ''],
        ...revenueData.revenueByMonth.map(month => [
          'Monthly Revenue',
          month.month,
          month.revenue.toString(),
          period,
          new Date().toISOString()
        ]),
        ['', '', '', '', ''], // Empty row separator
        ['Top Transactions', '', '', '', ''],
        ...revenueData.topTransactions.slice(0, 50).map(transaction => [
          'Transaction',
          `${transaction.clinic} - ${transaction.date}`,
          transaction.amount.toString(),
          period,
          new Date().toISOString()
        ])
      ]

      const csvRows = [
        headers.join(','),
        ...rows.map(row => row.map(field => `"${field}"`).join(','))
      ]

      const csv = csvRows.join('\n')

      // Return CSV file
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="revenue-report-${period}-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    } else if (format === 'json') {
      // Return JSON with additional metadata
      return NextResponse.json({
        ...revenueData,
        metadata: {
          reportType: 'revenue',
          period,
          clinicId: clinicId || 'all',
          generatedAt: new Date().toISOString(),
          generatedBy: user.id
        }
      })
    } else if (format === 'pdf') {
      // For PDF export, we would need a PDF generation library
      // For now, return an error suggesting CSV or JSON
      return NextResponse.json(
        { error: 'PDF export not yet implemented. Use CSV or JSON format.' },
        { status: 400 }
      )
    } else {
      return NextResponse.json(
        { error: 'Invalid format. Use csv, json, or pdf' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error exporting revenue report:', error)
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    )
  }
}
