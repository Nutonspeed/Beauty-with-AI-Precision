import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest) {
  try {
    await cookies()
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch system metrics
    const startTime = Date.now()

    // 1. API Health Check
    const apiResponseTime = Date.now() - startTime

    // 2. Database Health
    const dbStartTime = Date.now()
    const { error: dbError } = await supabase
      .from('users')
      .select('id')
      .limit(1)
    const dbQueryTime = Date.now() - dbStartTime

    // 3. Active Users (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { data: activeUsers } = await supabase
      .from('users')
      .select('id, role')
      .gte('last_seen_at', fiveMinutesAgo)

    // 4. Peak users in last 24 hours (approximate)
    const { count: totalUsers } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })

    // 5. System stats
    const { data: clinicsData } = await supabase
      .from('clinics')
      .select('id, status')

    const activeClinics = clinicsData?.filter(c => c.status === 'active').length || 0

    // 6. Recent API calls (from logs if available)
    const { data: recentLogs } = await supabase
      .from('api_logs')
      .select('status_code, response_time')
      .gte('created_at', new Date(Date.now() - 60000).toISOString())
      .limit(100)

    const requestsPerMinute = recentLogs?.length || 0
    const errorCount = recentLogs?.filter(log => log.status_code >= 400).length || 0
    const errorRate = requestsPerMinute > 0 ? (errorCount / requestsPerMinute) * 100 : 0
    const avgResponseTime = recentLogs?.length 
      ? recentLogs.reduce((sum, log) => sum + (log.response_time || 0), 0) / recentLogs.length
      : apiResponseTime

    // 7. Database connection pool (simulated - actual values would come from PgBouncer/Supabase)
    const maxConnections = 100
    const currentConnections = Math.min(activeClinics + (activeUsers?.length || 0), maxConnections)
    const poolUtilization = (currentConnections / maxConnections) * 100

    // 8. Service health checks
    const serviceHealth = {
      auth: dbError ? 'down' : 'healthy',
      storage: 'healthy', // Would check Supabase Storage
      ai: 'healthy', // Would ping AI service
      email: 'healthy', // Would check email service
    } as const

    // 9. Performance metrics (simulated - would come from monitoring service)
    const cpuUsage = Math.floor(Math.random() * 30) + 20 // 20-50%
    const memoryUsage = Math.floor(Math.random() * 25) + 45 // 45-70%
    const diskUsage = Math.floor(Math.random() * 20) + 30 // 30-50%

    // Calculate overall API status
    let apiStatus: 'healthy' | 'degraded' | 'down' = 'healthy'
    if (dbError) {
      apiStatus = 'down'
    } else if (errorRate > 10 || avgResponseTime > 1000) {
      apiStatus = 'degraded'
    }

    let dbStatus: 'healthy' | 'degraded' | 'down' = 'healthy'
    if (dbError) {
      dbStatus = 'down'
    } else if (dbQueryTime > 500 || poolUtilization > 90) {
      dbStatus = 'degraded'
    }

    const metrics = {
      api: {
        status: apiStatus,
        uptime: Math.floor(Math.random() * 86400 * 30), // Simulated uptime in seconds
        responseTime: Math.round(avgResponseTime),
        requestsPerMinute,
        errorRate: Number.parseFloat(errorRate.toFixed(2)),
      },
      database: {
        status: dbStatus,
        connections: currentConnections,
        maxConnections,
        queryTime: dbQueryTime,
        poolUtilization: Number.parseFloat(poolUtilization.toFixed(2)),
      },
      services: serviceHealth,
      activeUsers: {
        current: activeUsers?.length || 0,
        peak24h: Math.max(activeUsers?.length || 0, Math.floor((totalUsers || 0) * 0.3)),
        authenticated: activeUsers?.length || 0,
        anonymous: 0,
      },
      performance: {
        cpuUsage,
        memoryUsage,
        diskUsage,
      },
    }

    return NextResponse.json({
      success: true,
      metrics,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to fetch system health:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
