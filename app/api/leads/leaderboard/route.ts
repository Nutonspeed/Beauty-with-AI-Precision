import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface LeaderboardEntry {
  sales_staff_id: string
  sales_staff_name: string
  sales_staff_email: string
  total_leads: number
  new_leads: number
  contacted_leads: number
  hot_leads: number
  warm_leads: number
  cold_leads: number
  converted_leads: number
  lost_leads: number
  conversion_rate: number
  avg_lead_score: number
  rank: number
}

/**
 * GET /api/leads/leaderboard
 * Get sales staff leaderboard by lead performance
 * Requires authentication (clinic admin or super admin)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get sales staff info
    const { data: salesStaff, error: staffError } = await supabase
      .from('sales_staff')
      .select('id, role, clinic_id')
      .eq('user_id', userId)
      .single()

    if (staffError || !salesStaff) {
      return NextResponse.json(
        { success: false, message: 'Sales staff profile not found' },
        { status: 403 }
      )
    }

    // Check permission (clinic admin or super admin)
    if (salesStaff.role !== 'super_admin' && salesStaff.role !== 'clinic_admin') {
      return NextResponse.json(
        { success: false, message: 'You do not have permission to view leaderboard' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const clinicId = searchParams.get('clinic_id') || salesStaff.clinic_id
    const period = searchParams.get('period') || 'month' // month, quarter, year, all
    const limit = parseInt(searchParams.get('limit') || '10')

    // Calculate date range based on period
    let dateFilter = ''
    const now = new Date()
    
    if (period === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      dateFilter = startOfMonth.toISOString()
    } else if (period === 'quarter') {
      const currentQuarter = Math.floor(now.getMonth() / 3)
      const startOfQuarter = new Date(now.getFullYear(), currentQuarter * 3, 1)
      dateFilter = startOfQuarter.toISOString()
    } else if (period === 'year') {
      const startOfYear = new Date(now.getFullYear(), 0, 1)
      dateFilter = startOfYear.toISOString()
    }

    // Fetch all leads for the clinic in the period
    let leadsQuery = supabase
      .from('leads')
      .select(`
        id,
        sales_staff_id,
        status,
        lead_score,
        converted_to_customer,
        created_at,
        sales_staff:users!sales_staff_id (
          id,
          full_name,
          email
        )
      `)
      .eq('clinic_id', clinicId)

    if (dateFilter) {
      leadsQuery = leadsQuery.gte('created_at', dateFilter)
    }

    const { data: leads, error: leadsError } = await leadsQuery

    if (leadsError) {
      console.error('[LeaderboardAPI] Error fetching leads:', leadsError)
      throw leadsError
    }

    // Group leads by sales staff
    const staffStats = new Map<string, {
      staff_id: string
      staff_name: string
      staff_email: string
      total: number
      new: number
      contacted: number
      hot: number
      warm: number
      cold: number
      converted: number
      lost: number
      total_score: number
    }>()

    for (const lead of leads || []) {
      const staffId = lead.sales_staff_id
      
      if (!staffStats.has(staffId)) {
        staffStats.set(staffId, {
          staff_id: staffId,
          staff_name: lead.sales_staff?.full_name || 'Unknown',
          staff_email: lead.sales_staff?.email || '',
          total: 0,
          new: 0,
          contacted: 0,
          hot: 0,
          warm: 0,
          cold: 0,
          converted: 0,
          lost: 0,
          total_score: 0,
        })
      }

      const stats = staffStats.get(staffId)!
      stats.total++
      stats.total_score += lead.lead_score || 0

      switch (lead.status) {
        case 'new':
          stats.new++
          break
        case 'contacted':
          stats.contacted++
          break
        case 'hot':
          stats.hot++
          break
        case 'warm':
          stats.warm++
          break
        case 'cold':
          stats.cold++
          break
        case 'converted':
          stats.converted++
          break
        case 'lost':
          stats.lost++
          break
      }
    }

    // Convert to leaderboard entries
    const leaderboard: LeaderboardEntry[] = Array.from(staffStats.values())
      .map(stats => ({
        sales_staff_id: stats.staff_id,
        sales_staff_name: stats.staff_name,
        sales_staff_email: stats.staff_email,
        total_leads: stats.total,
        new_leads: stats.new,
        contacted_leads: stats.contacted,
        hot_leads: stats.hot,
        warm_leads: stats.warm,
        cold_leads: stats.cold,
        converted_leads: stats.converted,
        lost_leads: stats.lost,
        conversion_rate: stats.total > 0 ? (stats.converted / stats.total) * 100 : 0,
        avg_lead_score: stats.total > 0 ? stats.total_score / stats.total : 0,
        rank: 0, // Will be assigned after sorting
      }))
      .sort((a, b) => {
        // Sort by conversion rate first, then by total converted, then by avg score
        if (b.conversion_rate !== a.conversion_rate) {
          return b.conversion_rate - a.conversion_rate
        }
        if (b.converted_leads !== a.converted_leads) {
          return b.converted_leads - a.converted_leads
        }
        return b.avg_lead_score - a.avg_lead_score
      })
      .slice(0, limit)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }))

    // Calculate summary statistics
    const totalLeads = leads?.length || 0
    const totalConverted = leads?.filter(l => l.converted_to_customer).length || 0
    const overallConversionRate = totalLeads > 0 ? (totalConverted / totalLeads) * 100 : 0
    const avgLeadScore = totalLeads > 0 
      ? leads!.reduce((sum, l) => sum + (l.lead_score || 0), 0) / totalLeads 
      : 0

    return NextResponse.json({
      success: true,
      data: {
        leaderboard,
        summary: {
          period,
          total_leads: totalLeads,
          total_converted: totalConverted,
          overall_conversion_rate: overallConversionRate,
          avg_lead_score: avgLeadScore,
        },
      },
    })
  } catch (error) {
    console.error('[LeaderboardAPI] Error in GET:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch leaderboard',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
