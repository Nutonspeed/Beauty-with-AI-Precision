import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withRateLimit } from '@/lib/rate-limit/middleware/rate-limit'
import { rateLimitLogger } from '@/lib/rate-limit/middleware/logger'

// GET /api/rate-limit/analytics - Get rate limiting analytics
export async function GET(request: NextRequest) {
  return withRateLimit(async (req: NextRequest) => {
    try {
      const supabase = await createClient()
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session?.user || !['super_admin', 'admin'].includes(session.user.user_metadata?.role || '')) {
        if (!session?.user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        } else {
          return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }
      }

      const { searchParams } = new URL(req.url)
      const timeRange = searchParams.get('timeRange') || '24h'

      // Get time range
      const cutoffDate = getTimeRangeCutoff(timeRange)

      // Get total requests
      const { count: totalRequests } = await supabase
        .from('rate_limit_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', cutoffDate)

      // Get blocked requests
      const { count: blockedRequests } = await supabase
        .from('rate_limit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('level', 'WARN')
        .gte('created_at', cutoffDate)

      // Get top violators
      const { data: topViolators } = await supabase
        .from('rate_limit_logs')
        .select('ip')
        .eq('level', 'WARN')
        .gte('created_at', cutoffDate)

      // Count violations by IP
      const ipCounts = new Map<string, number>()
      topViolators?.forEach(log => {
        if (log.ip) {
          ipCounts.set(log.ip, (ipCounts.get(log.ip) || 0) + 1)
        }
      })

      const topViolatorsList = Array.from(ipCounts.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([ip, count]) => ({ ip, count }))

      // Get endpoint violations
      const { data: endpointViolations } = await supabase
        .from('rate_limit_logs')
        .select('path')
        .eq('level', 'WARN')
        .gte('created_at', cutoffDate)

      // Count violations by endpoint
      const endpointCounts = new Map<string, number>()
      endpointViolations?.forEach(log => {
        if (log.path) {
          endpointCounts.set(log.path, (endpointCounts.get(log.path) || 0) + 1)
        }
      })

      const endpointList = Array.from(endpointCounts.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([endpoint, violations]) => ({ endpoint, violations }))

      const analytics = {
        totalRequests: totalRequests || 0,
        blockedRequests: blockedRequests || 0,
        topViolators: topViolatorsList,
        endpoints: endpointList,
        timeRange,
        generatedAt: new Date().toISOString()
      }

      return NextResponse.json({
        success: true,
        analytics
      })

    } catch (error) {
      rateLimitLogger.logError(error as Error, {
        action: 'get_rate_limit_analytics',
        url: req.url
      })
      
      return NextResponse.json({ 
        error: 'Failed to get rate limit analytics' 
      }, { status: 500 })
    }
  })(request)
}

// Helper function to get time range cutoff
function getTimeRangeCutoff(timeRange: string): string {
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
