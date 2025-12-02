import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { metricsAggregator } from '@/lib/analytics/aggregation/metrics'
import { analyticsLogger } from '@/lib/analytics/websocket/logger'

// GET /api/analytics/dashboard - Get dashboard metrics
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '1h'
    const clinicId = session.user.user_metadata?.clinic_id || 'default-clinic'

    // Get business metrics
    const businessMetrics = await getBusinessMetrics(clinicId, timeRange)
    
    // Get performance metrics
    const performanceMetrics = await getPerformanceMetrics(timeRange)
    
    // Get AI metrics
    const aiMetrics = await getAIMetrics(timeRange)
    
    // Get real-time metrics
    const realTimeMetrics = await getRealTimeMetrics()

    const dashboardData = {
      success: true,
      metrics: {
        business: businessMetrics,
        performance: performanceMetrics,
        ai: aiMetrics,
        realTime: realTimeMetrics
      },
      timeRange,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    analyticsLogger.logError(error as Error, {
      action: 'get_dashboard_metrics',
      url: request.url
    })
    
    return NextResponse.json({ 
      error: 'Failed to fetch dashboard metrics' 
    }, { status: 500 })
  }
}

// POST /api/analytics/track - Track custom metrics
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { metrics } = await request.json()
    
    if (!Array.isArray(metrics)) {
      return NextResponse.json({ error: 'Metrics must be an array' }, { status: 400 })
    }

    // Track each metric
    metrics.forEach(metric => {
      const { name, type, value, category, labels } = metric
      
      switch (type) {
        case 'counter':
          metricsAggregator.incrementCounter(name, value, labels, session.user.user_metadata?.clinic_id || 'default-clinic', session.user.id)
          break
        case 'gauge':
          metricsAggregator.setGauge(name, value, labels, session.user.user_metadata?.clinic_id || 'default-clinic', session.user.id)
          break
        case 'timer':
          metricsAggregator.recordTimer(name, value, labels, session.user.user_metadata?.clinic_id || 'default-clinic', session.user.id)
          break
        case 'histogram':
          metricsAggregator.recordHistogram(name, value, labels, session.user.user_metadata?.clinic_id || 'default-clinic', session.user.id)
          break
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    analyticsLogger.logError(error as Error, {
      action: 'track_metrics',
      url: request.url
    })
    
    return NextResponse.json({ 
      error: 'Failed to track metrics' 
    }, { status: 500 })
  }
}

// Helper functions
async function getBusinessMetrics(clinicId: string, timeRange: string): Promise<any> {
  try {
    const supabaseClient = await createClient()
    const cutoffDate = getCutoffDate(timeRange)
    
    // Get total users
    const { count: totalUsers } = await supabaseClient
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .gte('created_at', cutoffDate)

    // Get total analyses
    const { count: totalAnalyses } = await supabaseClient
      .from('skin_analyses')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .gte('created_at', cutoffDate)

    // Get total bookings
    const { count: totalBookings } = await supabaseClient
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .gte('created_at', cutoffDate)

    // Get total revenue
    const { data: payments } = await supabaseClient
      .from('payments')
      .select('amount')
      .eq('clinic_id', clinicId)
      .eq('status', 'completed')
      .gte('created_at', cutoffDate)

    const totalRevenue = payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0

    // Calculate conversion rate
    const { count: totalLeads } = await supabaseClient
      .from('sales_leads')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .gte('created_at', cutoffDate)

    const conversionRate = (totalLeads || 0) > 0 ? (totalBookings || 0) / (totalLeads || 0) : 0

    return {
      totalUsers: totalUsers || 0,
      totalAnalyses: totalAnalyses || 0,
      totalBookings: totalBookings || 0,
      totalRevenue,
      conversionRate
    }
  } catch (error) {
    analyticsLogger.logError(error as Error, {
      action: 'get_business_metrics'
    })
    
    return {
      totalUsers: 0,
      totalAnalyses: 0,
      totalBookings: 0,
      totalRevenue: 0,
      conversionRate: 0
    }
  }
}

async function getPerformanceMetrics(timeRange: string): Promise<any> {
  try {
    // Get aggregated performance metrics
    const responseTime = metricsAggregator.getAggregatedMetrics('api_response_time', timeRange)
    const errorRate = metricsAggregator.getAggregatedMetrics('api_requests_error', timeRange)
    const totalRequests = metricsAggregator.getAggregatedMetrics('api_requests', timeRange)
    const cacheHitRate = metricsAggregator.getAggregatedMetrics('cache_hit_rate', timeRange)

    // Calculate uptime (simplified)
    const uptime = 0.99 // This would come from actual monitoring

    return {
      avgResponseTime: responseTime?.avg || 0,
      uptime,
      errorRate: totalRequests && errorRate ? errorRate.value / totalRequests.value : 0,
      activeConnections: 10, // This would come from connection pool metrics
      cacheHitRate: cacheHitRate?.avg || 0
    }
  } catch (error) {
    analyticsLogger.logError(error as Error, {
      action: 'get_performance_metrics'
    })
    
    return {
      avgResponseTime: 0,
      uptime: 0,
      errorRate: 0,
      activeConnections: 0,
      cacheHitRate: 0
    }
  }
}

async function getAIMetrics(timeRange: string): Promise<any> {
  try {
    const totalRequests = metricsAggregator.getAggregatedMetrics('ai_requests', timeRange)
    const avgResponseTime = metricsAggregator.getAggregatedMetrics('ai_response_time', timeRange)
    const tokensUsed = metricsAggregator.getAggregatedMetrics('ai_tokens_used', timeRange)
    const errorRate = metricsAggregator.getAggregatedMetrics('ai_requests_error', timeRange)

    const successRate = totalRequests && errorRate 
      ? (totalRequests.value - errorRate.value) / totalRequests.value 
      : 0

    // Get model usage breakdown
    const modelUsage = {
      'gpt-4': metricsAggregator.getAggregatedMetrics('ai_requests_gpt_4', timeRange)?.value || 0,
      'gpt-3.5': metricsAggregator.getAggregatedMetrics('ai_requests_gpt_3_5', timeRange)?.value || 0,
      'claude': metricsAggregator.getAggregatedMetrics('ai_requests_claude', timeRange)?.value || 0,
      'deepface': metricsAggregator.getAggregatedMetrics('ai_requests_deepface', timeRange)?.value || 0
    }

    return {
      totalRequests: totalRequests?.value || 0,
      avgResponseTime: avgResponseTime?.avg || 0,
      successRate,
      tokensUsed: tokensUsed?.value || 0,
      modelUsage
    }
  } catch (error) {
    analyticsLogger.logError(error as Error, {
      action: 'get_ai_metrics'
    })
    
    return {
      totalRequests: 0,
      avgResponseTime: 0,
      successRate: 0,
      tokensUsed: 0,
      modelUsage: {}
    }
  }
}

async function getRealTimeMetrics(): Promise<any> {
  try {
    // These would come from real-time monitoring systems
    return {
      currentUsers: 25,
      activeSessions: 18,
      requestsPerSecond: 12,
      systemLoad: 45
    }
  } catch (error) {
    analyticsLogger.logError(error as Error, {
      action: 'get_realtime_metrics'
    })
    
    return {
      currentUsers: 0,
      activeSessions: 0,
      requestsPerSecond: 0,
      systemLoad: 0
    }
  }
}

function getCutoffDate(timeRange: string): string {
  const now = new Date()
  const cutoff = new Date()
  
  switch (timeRange) {
    case '1h':
      cutoff.setHours(now.getHours() - 1)
      break
    case '6h':
      cutoff.setHours(now.getHours() - 6)
      break
    case '24h':
      cutoff.setDate(now.getDate() - 1)
      break
    case '7d':
      cutoff.setDate(now.getDate() - 7)
      break
    case '30d':
      cutoff.setDate(now.getDate() - 30)
      break
    default:
      cutoff.setHours(now.getHours() - 1)
  }
  
  return cutoff.toISOString()
}
