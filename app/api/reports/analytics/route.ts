// Report Analytics API
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const period = searchParams.get('period') || '30d'
    const clinicId = searchParams.get('clinic_id')

    let data: any = {}

    switch (type) {
      case 'overview':
        data = await getOverviewData(period, clinicId || undefined)
        break
      case 'trends':
        data = await getTrendsData(period, clinicId || undefined)
        break
      case 'performance':
        data = await getPerformanceData(period, clinicId || undefined)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid analytics type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data,
      period,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Analytics API failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}

async function getOverviewData(period: string, clinicId?: string) {
  const days = parseInt(period.replace('d', ''))
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  const supabase = await createClient()
  
  // Get user counts
  const { data: users } = await supabase
    .from('users')
    .select('created_at, clinic_id')
    .gte('created_at', startDate.toISOString())
    .eq(clinicId ? 'clinic_id' : 'clinic_id', clinicId || '')

  // Get session counts
  const { data: sessions } = await supabase
    .from('user_sessions')
    .select('created_at, duration, user_id, clinic_id')
    .gte('created_at', startDate.toISOString())
    .eq(clinicId ? 'clinic_id' : 'clinic_id', clinicId || '')

  // Get treatment counts
  const { data: treatments } = await supabase
    .from('treatments')
    .select('created_at, status, price, clinic_id')
    .gte('created_at', startDate.toISOString())
    .eq(clinicId ? 'clinic_id' : 'clinic_id', clinicId || '')

  return {
    users: {
      total: users?.length || 0,
      new: users?.filter(u => isNewUser(u.created_at)).length || 0,
      growth: calculateGrowthRate(users || [])
    },
    sessions: {
      total: sessions?.length || 0,
      averageDuration: calculateAverageDuration(sessions || []),
      active: calculateActiveUsers(sessions || [])
    },
    treatments: {
      total: treatments?.length || 0,
      completed: treatments?.filter(t => t.status === 'completed').length || 0,
      revenue: calculateTotalRevenue(treatments || [])
    }
  }
}

async function getTrendsData(period: string, clinicId?: string) {
  const days = parseInt(period.replace('d', ''))
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  const supabase = await createClient()
  
  // Get daily user counts
  const { data: dailyUsers } = await supabase
    .from('users')
    .select('created_at')
    .gte('created_at', startDate.toISOString())
    .eq(clinicId ? 'clinic_id' : 'clinic_id', clinicId || '')

  // Get daily revenue
  const { data: dailyRevenue } = await supabase
    .from('treatments')
    .select('created_at, price')
    .gte('created_at', startDate.toISOString())
    .eq('status', 'completed')
    .eq(clinicId ? 'clinic_id' : 'clinic_id', clinicId || '')

  return {
    users: groupByDay(dailyUsers || []),
    revenue: groupRevenueByDay(dailyRevenue || [])
  }
}

async function getPerformanceData(period: string, clinicId?: string) {
  const days = parseInt(period.replace('d', ''))
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  const supabase = await createClient()
  
  // Get feature usage
  const { data: featureUsage } = await supabase
    .from('feature_usage')
    .select('feature, created_at, user_id, clinic_id')
    .gte('created_at', startDate.toISOString())
    .eq(clinicId ? 'clinic_id' : 'clinic_id', clinicId || '')

  // Get page views
  const { data: pageViews } = await supabase
    .from('page_views')
    .select('page, created_at, user_id, clinic_id')
    .gte('created_at', startDate.toISOString())
    .eq(clinicId ? 'clinic_id' : 'clinic_id', clinicId || '')

  return {
    features: groupFeatureUsage(featureUsage || []),
    pages: groupPageViews(pageViews || []),
    performance: calculatePerformanceMetrics(featureUsage || [], pageViews || [])
  }
}

// Helper functions
function isNewUser(createdAt: string): boolean {
  const userAge = Date.now() - new Date(createdAt).getTime()
  return userAge < 7 * 24 * 60 * 60 * 1000 // Less than 7 days
}

function calculateGrowthRate(users: any[]): number {
  if (users.length < 2) return 0
  
  const midPoint = Math.floor(users.length / 2)
  const firstHalf = users.slice(0, midPoint)
  const secondHalf = users.slice(midPoint)
  
  return ((secondHalf.length - firstHalf.length) / firstHalf.length) * 100
}

function calculateAverageDuration(sessions: any[]): number {
  if (sessions.length === 0) return 0
  const total = sessions.reduce((sum, s) => sum + (s.duration || 0), 0)
  return total / sessions.length
}

function calculateActiveUsers(sessions: any[]): number {
  const uniqueUsers = new Set(sessions.map(s => s.user_id))
  return uniqueUsers.size
}

function calculateTotalRevenue(treatments: any[]): number {
  return treatments.reduce((sum, t) => sum + (t.price || 0), 0)
}

function groupByDay(items: any[]): any {
  return items.reduce((acc, item) => {
    const day = new Date(item.created_at).toISOString().split('T')[0]
    acc[day] = (acc[day] || 0) + 1
    return acc
  }, {})
}

function groupRevenueByDay(treatments: any[]): any {
  return treatments.reduce((acc, treatment) => {
    const day = new Date(treatment.created_at).toISOString().split('T')[0]
    acc[day] = (acc[day] || 0) + (treatment.price || 0)
    return acc
  }, {})
}

function groupFeatureUsage(usage: any[]): any {
  return usage.reduce((acc, item) => {
    acc[item.feature] = (acc[item.feature] || 0) + 1
    return acc
  }, {})
}

function groupPageViews(views: any[]): any {
  return views.reduce((acc, view) => {
    acc[view.page] = (acc[view.page] || 0) + 1
    return acc
  }, {})
}

function calculatePerformanceMetrics(featureUsage: any[], pageViews: any[]): any {
  return {
    totalInteractions: featureUsage.length + pageViews.length,
    uniqueFeatures: new Set(featureUsage.map(f => f.feature)).size,
    uniquePages: new Set(pageViews.map(p => p.page)).size,
    averageInteractionsPerUser: (featureUsage.length + pageViews.length) / Math.max(
      new Set([...featureUsage.map(f => f.user_id), ...pageViews.map(p => p.user_id)]).size,
      1
    )
  }
}
