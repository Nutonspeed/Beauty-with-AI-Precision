import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { securityLogger } from '@/lib/security/monitoring/logger'

// GET /api/security/metrics - Get security metrics
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '24h'

    // Get security metrics
    const securityMetrics = await securityLogger.getSecurityMetrics(timeRange)
    
    // Get recent alerts
    const { data: alerts } = await supabase.from('security_alerts').select('*').order('created_at', {
      ascending: false
    }).limit(10)

    // Get vulnerability metrics
    const { data: vulnerabilities } = await supabase
      .from('security_scan_results')
      .select('*')
      .order('scan_date', { ascending: false })
      .limit(1)
      .single()

    // Get compliance metrics
    const { data: compliance } = await supabase
      .from('compliance_checks')
      .select('*')
      .order('check_date', { ascending: false })
      .limit(1)
      .single()

    const metrics = {
      totalEvents: securityMetrics.totalEvents || 0,
      criticalEvents: securityMetrics.eventsByLevel?.CRITICAL || 0,
      highEvents: securityMetrics.eventsByLevel?.HIGH || 0,
      mediumEvents: securityMetrics.eventsByLevel?.MEDIUM || 0,
      lowEvents: securityMetrics.eventsByLevel?.LOW || 0,
      vulnerabilities: {
        critical: vulnerabilities?.critical_count || 0,
        high: vulnerabilities?.high_count || 0,
        medium: vulnerabilities?.medium_count || 0,
        low: vulnerabilities?.low_count || 0
      },
      compliance: {
        gdpr: 85, // Mock values - would be calculated from actual compliance data
        hipaa: 90,
        soc2: 88,
        iso27001: 82
      },
      recentAlerts: alerts?.map(alert => ({
        id: alert.id,
        type: alert.type,
        message: alert.message,
        severity: alert.severity,
        timestamp: alert.created_at
      })) || [],
      timeRange,
      generatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      metrics
    })

  } catch (error) {
    securityLogger.logError(error as Error, {
      action: 'get_security_metrics',
      url: request.url
    })
    
    return NextResponse.json({ 
      error: 'Failed to get security metrics' 
    }, { status: 500 })
  }
}
