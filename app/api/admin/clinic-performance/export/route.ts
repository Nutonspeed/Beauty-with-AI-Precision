import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const period = searchParams.get('period') || 'month'
    const metric = searchParams.get('metric') || 'all'

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

    // Fetch performance data
    const performanceUrl = new URL('/api/admin/clinic-performance', request.url)
    performanceUrl.searchParams.set('period', period)
    performanceUrl.searchParams.set('metric', metric)

    const performanceResponse = await fetch(performanceUrl.toString())
    if (!performanceResponse.ok) throw new Error('Failed to fetch performance data')
    const performanceData = await performanceResponse.json()

    if (format === 'csv') {
      // Create CSV report
      const headers = [
        'Clinic Name',
        'Overall Rank',
        'Total Patients',
        'New Patients',
        'Recurring Patients',
        'Patient Growth Rate (%)',
        'Total Revenue',
        'Monthly Revenue',
        'Average Revenue Per Patient',
        'Revenue Growth Rate (%)',
        'Total Appointments',
        'Completed Appointments',
        'Cancelled Appointments',
        'Completion Rate (%)',
        'Average Rating',
        'Total Reviews',
        'Response Rate (%)',
        'Average Appointment Duration (min)',
        'Patients Per Day',
        'Utilization Rate (%)',
        'Patient Trend',
        'Revenue Trend',
        'Satisfaction Trend',
        'Period',
        'Generated At'
      ]

      const csvRows = [
        headers.join(','),
        ...performanceData.clinics.map((clinic: any) => [
          `"${clinic.name}"`,
          clinic.ranking.overall,
          clinic.metrics.patients.total,
          clinic.metrics.patients.new,
          clinic.metrics.patients.recurring,
          clinic.metrics.patients.growthRate.toFixed(2),
          clinic.metrics.revenue.total.toFixed(2),
          clinic.metrics.revenue.monthly.toFixed(2),
          clinic.metrics.revenue.averagePerPatient.toFixed(2),
          clinic.metrics.revenue.growthRate.toFixed(2),
          clinic.metrics.appointments.total,
          clinic.metrics.appointments.completed,
          clinic.metrics.appointments.cancelled,
          clinic.metrics.appointments.completionRate.toFixed(2),
          clinic.metrics.satisfaction.averageRating.toFixed(2),
          clinic.metrics.satisfaction.totalReviews,
          clinic.metrics.satisfaction.responseRate.toFixed(2),
          clinic.metrics.efficiency.avgAppointmentDuration,
          clinic.metrics.efficiency.patientsPerDay,
          clinic.metrics.efficiency.utilizationRate.toFixed(2),
          clinic.trend.patients,
          clinic.trend.revenue,
          clinic.trend.satisfaction,
          period,
          new Date().toISOString()
        ].map(field => `"${field}"`).join(','))
      ]

      const csv = csvRows.join('\n')

      // Return CSV file
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="clinic-performance-${period}-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    } else if (format === 'json') {
      // Return JSON with metadata
      return NextResponse.json({
        ...performanceData,
        metadata: {
          reportType: 'clinic-performance',
          period,
          metric,
          generatedAt: new Date().toISOString(),
          generatedBy: user.id
        }
      })
    } else if (format === 'excel') {
      // For Excel export, we would need a library like xlsx
      // For now, return an error suggesting CSV or JSON
      return NextResponse.json(
        { error: 'Excel export not yet implemented. Use CSV or JSON format.' },
        { status: 400 }
      )
    } else {
      return NextResponse.json(
        { error: 'Invalid format. Use csv, json, or excel' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error exporting clinic performance:', error)
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    )
  }
}
