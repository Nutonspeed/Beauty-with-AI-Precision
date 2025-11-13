import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface SecurityOverview {
  totalEvents: number;
  criticalEvents: number;
  failedLogins: number;
  suspiciousActivities: number;
  activeSessions: number;
  blockedIPs: number;
  unresolvedEvents: number;
  averageRiskScore: number;
}

interface RecentEvent {
  id: string;
  eventType: string;
  severity: string;
  timestamp: string;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  description: string;
  resolved: boolean;
}

interface FailedLoginStats {
  email: string;
  ipAddress: string;
  attemptCount: number;
  lastAttempt: string;
  blocked: boolean;
  blockedUntil?: string;
}

interface ActiveSessionData {
  id: string;
  userEmail: string;
  deviceType: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActivity: string;
  duration: number; // minutes
}

interface SuspiciousActivityData {
  id: string;
  activityType: string;
  userEmail?: string;
  ipAddress?: string;
  description: string;
  riskScore: number;
  indicators: string[];
  timestamp: string;
  reviewed: boolean;
}

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Verify super admin access
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch security overview metrics
    const overview: SecurityOverview = {
      totalEvents: 0,
      criticalEvents: 0,
      failedLogins: 0,
      suspiciousActivities: 0,
      activeSessions: 0,
      blockedIPs: 0,
      unresolvedEvents: 0,
      averageRiskScore: 0,
    };

    // Total security events (last 30 days)
    const { count: totalEventsCount } = await supabase
      .from('security_events')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    overview.totalEvents = totalEventsCount || 0;

    // Critical events (last 7 days)
    const { count: criticalCount } = await supabase
      .from('security_events')
      .select('*', { count: 'exact', head: true })
      .eq('severity', 'critical')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    overview.criticalEvents = criticalCount || 0;

    // Failed logins (last 24 hours)
    const { count: failedLoginsCount } = await supabase
      .from('failed_login_attempts')
      .select('*', { count: 'exact', head: true })
      .gte('last_attempt_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    overview.failedLogins = failedLoginsCount || 0;

    // Suspicious activities (last 7 days)
    const { count: suspiciousCount } = await supabase
      .from('suspicious_activities')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    overview.suspiciousActivities = suspiciousCount || 0;

    // Active sessions
    const { count: activeSessionsCount } = await supabase
      .from('active_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString());
    overview.activeSessions = activeSessionsCount || 0;

    // Blocked IPs (currently blocked)
    const { count: blockedIPsCount } = await supabase
      .from('failed_login_attempts')
      .select('*', { count: 'exact', head: true })
      .gt('blocked_until', new Date().toISOString());
    overview.blockedIPs = blockedIPsCount || 0;

    // Unresolved security events
    const { count: unresolvedCount } = await supabase
      .from('security_events')
      .select('*', { count: 'exact', head: true })
      .eq('resolved', false)
      .in('severity', ['high', 'critical']);
    overview.unresolvedEvents = unresolvedCount || 0;

    // Average risk score (suspicious activities last 7 days)
    const { data: riskScores } = await supabase
      .from('suspicious_activities')
      .select('risk_score')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    
    if (riskScores && riskScores.length > 0) {
      const totalRisk = riskScores.reduce((sum, item) => sum + (item.risk_score || 0), 0);
      overview.averageRiskScore = Math.round(totalRisk / riskScores.length);
    }

    // Fetch recent security events
    const { data: recentEventsData } = await supabase
      .from('security_events')
      .select('id, event_type, severity, created_at, user_id, ip_address, error_message, resolved')
      .order('created_at', { ascending: false })
      .limit(20);

    const recentEvents: RecentEvent[] = [];
    if (recentEventsData) {
      for (const event of recentEventsData) {
        let userEmail = 'Unknown';
        if (event.user_id) {
          const { data: userData } = await supabase.auth.admin.getUserById(event.user_id);
          userEmail = userData?.user?.email || 'Unknown';
        }

        recentEvents.push({
          id: event.id,
          eventType: event.event_type,
          severity: event.severity,
          timestamp: event.created_at,
          userId: event.user_id || undefined,
          userEmail,
          ipAddress: event.ip_address || undefined,
          description: event.error_message || `${event.event_type} event`,
          resolved: event.resolved,
        });
      }
    }

    // Fetch failed login attempts
    const { data: failedLoginsData } = await supabase
      .from('failed_login_attempts')
      .select('email, ip_address, attempt_count, last_attempt_at, blocked_until')
      .order('last_attempt_at', { ascending: false })
      .limit(15);

    const failedLogins: FailedLoginStats[] = (failedLoginsData || []).map(item => ({
      email: item.email,
      ipAddress: item.ip_address,
      attemptCount: item.attempt_count,
      lastAttempt: item.last_attempt_at,
      blocked: item.blocked_until ? new Date(item.blocked_until) > new Date() : false,
      blockedUntil: item.blocked_until || undefined,
    }));

    // Fetch active sessions
    const { data: activeSessionsData } = await supabase
      .from('active_sessions')
      .select('id, user_id, device_type, browser, ip_address, location_city, location_country, last_activity_at, created_at')
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('last_activity_at', { ascending: false })
      .limit(20);

    const activeSessions: ActiveSessionData[] = [];
    if (activeSessionsData) {
      for (const session of activeSessionsData) {
        let userEmail = 'Unknown';
        if (session.user_id) {
          const { data: userData } = await supabase.auth.admin.getUserById(session.user_id);
          userEmail = userData?.user?.email || 'Unknown';
        }

        const duration = Math.floor(
          (Date.now() - new Date(session.created_at).getTime()) / (1000 * 60)
        );

        activeSessions.push({
          id: session.id,
          userEmail,
          deviceType: session.device_type || 'unknown',
          browser: session.browser || 'Unknown',
          ipAddress: session.ip_address || 'Unknown',
          location: `${session.location_city || 'Unknown'}, ${session.location_country || 'Unknown'}`,
          lastActivity: session.last_activity_at,
          duration,
        });
      }
    }

    // Fetch suspicious activities
    const { data: suspiciousActivitiesData } = await supabase
      .from('suspicious_activities')
      .select('id, activity_type, user_id, ip_address, description, risk_score, indicators, created_at, reviewed')
      .order('risk_score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(15);

    const suspiciousActivities: SuspiciousActivityData[] = [];
    if (suspiciousActivitiesData) {
      for (const activity of suspiciousActivitiesData) {
        let userEmail = 'Unknown';
        if (activity.user_id) {
          const { data: userData } = await supabase.auth.admin.getUserById(activity.user_id);
          userEmail = userData?.user?.email || 'Unknown';
        }

        suspiciousActivities.push({
          id: activity.id,
          activityType: activity.activity_type,
          userEmail: activity.user_id ? userEmail : undefined,
          ipAddress: activity.ip_address || undefined,
          description: activity.description,
          riskScore: activity.risk_score || 0,
          indicators: Array.isArray(activity.indicators) ? activity.indicators : [],
          timestamp: activity.created_at,
          reviewed: activity.reviewed,
        });
      }
    }

    // Event type distribution (last 7 days)
    const { data: eventTypesData } = await supabase
      .from('security_events')
      .select('event_type')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const eventTypeDistribution: Record<string, number> = {};
    if (eventTypesData) {
      for (const event of eventTypesData) {
        const type = event.event_type || 'unknown';
        eventTypeDistribution[type] = (eventTypeDistribution[type] || 0) + 1;
      }
    }

    // Severity distribution (last 7 days)
    const { data: severityData } = await supabase
      .from('security_events')
      .select('severity')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const severityDistribution: Record<string, number> = {};
    if (severityData) {
      for (const event of severityData) {
        const severity = event.severity || 'low';
        severityDistribution[severity] = (severityDistribution[severity] || 0) + 1;
      }
    }

    return NextResponse.json({
      overview,
      recentEvents,
      failedLogins,
      activeSessions,
      suspiciousActivities,
      eventTypeDistribution,
      severityDistribution,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching security monitoring data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
