'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Activity, 
  Eye, 
  XCircle,
  CheckCircle2,
  Clock,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { PaginationControls } from './pagination-controls';

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
  duration: number;
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

interface SecurityData {
  overview: SecurityOverview;
  recentEvents: RecentEvent[];
  failedLogins: FailedLoginStats[];
  activeSessions: ActiveSessionData[];
  suspiciousActivities: SuspiciousActivityData[];
  eventTypeDistribution: Record<string, number>;
  severityDistribution: Record<string, number>;
}

export default function SecurityMonitoring() {
  const [data, setData] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null)
  const { toast } = useToast()
  
  // Pagination state for each tab
  const [eventsPage, setEventsPage] = useState(1)
  const [failedLoginsPage, setFailedLoginsPage] = useState(1)
  const [sessionsPage, setSessionsPage] = useState(1)
  const [suspiciousPage, setSuspiciousPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filter state
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d')
  // Debounce search to reduce recomputation while typing
  const [debouncedQuery, setDebouncedQuery] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 300)
    return () => clearTimeout(t)
  }, [searchQuery])

  const fetchSecurityData = async () => {
    try {
      const response = await fetch('/api/admin/security-monitoring');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveEvent = async (id: string) => {
    try {
      setActingId(id)
      const res = await fetch('/api/admin/security-monitoring/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        toast({ title: 'Event resolved', variant: 'default' })
        await fetchSecurityData()
      } else {
        const err = await res.json().catch(() => ({}))
        toast({ title: 'Failed to resolve', description: err.error || 'Please try again', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Unexpected error', variant: 'destructive' })
    } finally {
      setActingId(null)
    }
  }

  const markReviewed = async (id: string) => {
    try {
      setActingId(id)
      const res = await fetch('/api/admin/security-monitoring/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, reviewed: true }),
      })
      if (res.ok) {
        toast({ title: 'Marked reviewed', variant: 'default' })
        await fetchSecurityData()
      } else {
        const err = await res.json().catch(() => ({}))
        toast({ title: 'Failed to update', description: err.error || 'Please try again', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Unexpected error', variant: 'destructive' })
    } finally {
      setActingId(null)
    }
  }

  useEffect(() => {
    fetchSecurityData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSecurityData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const paginate = <T,>(items: T[], page: number, size: number) => {
    const start = (page - 1) * size
    const end = start + size
    return {
      items: items.slice(start, end),
      totalPages: Math.ceil(items.length / size),
      total: items.length,
      hasNext: end < items.length,
      hasPrev: page > 1,
    }
  }

  const filterByDateRange = useCallback((timestamp: string) => {
    if (dateRange === 'all') return true
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    
    switch (dateRange) {
      case '24h': return diffHours <= 24
      case '7d': return diffHours <= 168
      case '30d': return diffHours <= 720
      default: return true
    }
  }, [dateRange])

  // Memoized filtered datasets to avoid repeated computation during render
  const filteredEvents = useMemo(() => {
    if (!data) return [] as RecentEvent[]
    return data.recentEvents.filter(event => {
      const matchesSeverity = severityFilter === 'all' || event.severity === severityFilter
      const q = debouncedQuery.toLowerCase()
      const matchesSearch = !q ||
        event.userEmail?.toLowerCase().includes(q) ||
        event.ipAddress?.toLowerCase().includes(q) ||
        event.description.toLowerCase().includes(q)
      const matchesDate = filterByDateRange(event.timestamp)
      return matchesSeverity && matchesSearch && matchesDate
    })
  }, [data, severityFilter, debouncedQuery, filterByDateRange])

  const filteredFailedLogins = useMemo(() => {
    if (!data) return [] as FailedLoginStats[]
    const q = debouncedQuery.toLowerCase()
    return data.failedLogins.filter(login => {
      const matchesSearch = !q ||
        login.email.toLowerCase().includes(q) ||
        login.ipAddress.toLowerCase().includes(q)
      const matchesDate = filterByDateRange(login.lastAttempt)
      return matchesSearch && matchesDate
    })
  }, [data, debouncedQuery, filterByDateRange])

  const filteredSessions = useMemo(() => {
    if (!data) return [] as ActiveSessionData[]
    const q = debouncedQuery.toLowerCase()
    return data.activeSessions.filter(session => {
      const matchesSearch = !q ||
        session.userEmail.toLowerCase().includes(q) ||
        session.ipAddress.toLowerCase().includes(q) ||
        session.location.toLowerCase().includes(q)
      const matchesDate = filterByDateRange(session.lastActivity)
      return matchesSearch && matchesDate
    })
  }, [data, debouncedQuery, filterByDateRange])

  const filteredSuspicious = useMemo(() => {
    if (!data) return [] as SuspiciousActivityData[]
    const q = debouncedQuery.toLowerCase()
    return data.suspiciousActivities.filter(activity => {
      const matchesSearch = !q ||
        activity.userEmail?.toLowerCase().includes(q) ||
        activity.ipAddress?.toLowerCase().includes(q) ||
        activity.description.toLowerCase().includes(q)
      const matchesDate = filterByDateRange(activity.timestamp)
      return matchesSearch && matchesDate
    })
  }, [data, debouncedQuery, filterByDateRange])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading security data...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Failed to load security data</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalEvents}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
            {data.overview.criticalEvents > 0 && (
              <Badge variant="destructive" className="mt-2">
                {data.overview.criticalEvents} Critical
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.failedLogins}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
            {data.overview.blockedIPs > 0 && (
              <Badge variant="destructive" className="mt-2">
                {data.overview.blockedIPs} Blocked IPs
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.activeSessions}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Activity</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.suspiciousActivities}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
            <div className={`text-sm font-semibold mt-2 ${getRiskColor(data.overview.averageRiskScore)}`}>
              Avg Risk: {data.overview.averageRiskScore}/100
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unresolved Events Alert */}
      {data.overview.unresolvedEvents > 0 && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Attention Required</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              There are <span className="font-bold">{data.overview.unresolvedEvents}</span> unresolved high/critical security events that require immediate attention.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Filter Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search by email, IP, or description..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  // Reset all pages to 1 when search changes
                  setEventsPage(1)
                  setFailedLoginsPage(1)
                  setSessionsPage(1)
                  setSuspiciousPage(1)
                }}
                className="w-full"
              />
            </div>
            
            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">Time:</span>
              <div className="flex gap-1">
                {(['24h', '7d', '30d', 'all'] as const).map((range) => (
                  <Button
                    key={range}
                    variant={dateRange === range ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setDateRange(range)
                      setEventsPage(1)
                      setFailedLoginsPage(1)
                      setSessionsPage(1)
                      setSuspiciousPage(1)
                    }}
                  >
                    {range === 'all' ? 'All' : range.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">Severity:</span>
              <div className="flex gap-1">
                {(['all', 'critical', 'high', 'medium', 'low'] as const).map((level) => (
                  <Button
                    key={level}
                    variant={severityFilter === level ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSeverityFilter(level)
                      setEventsPage(1)
                      setSuspiciousPage(1)
                    }}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {(searchQuery || dateRange !== '7d' || severityFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setDateRange('7d')
                  setSeverityFilter('all')
                  setEventsPage(1)
                  setFailedLoginsPage(1)
                  setSessionsPage(1)
                  setSuspiciousPage(1)
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Recent Events</TabsTrigger>
          <TabsTrigger value="failed-logins">Failed Logins</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="suspicious">Suspicious Activity</TabsTrigger>
        </TabsList>

        {/* Recent Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Security Events</CardTitle>
                  <CardDescription>Latest security events across the platform</CardDescription>
                </div>
                <Badge variant="secondary">
                  {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Severity</TableHead>
                    <TableHead>Event Type</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No security events found matching your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                  paginate(filteredEvents, eventsPage, pageSize).items.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <Badge variant={getSeverityColor(event.severity)}>
                          {event.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {event.eventType.replaceAll('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </TableCell>
                      <TableCell className="text-sm">{event.userEmail || 'N/A'}</TableCell>
                      <TableCell className="text-sm font-mono">{event.ipAddress || 'N/A'}</TableCell>
                      <TableCell className="text-sm max-w-xs truncate">{event.description}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatTimestamp(event.timestamp)}</TableCell>
                      <TableCell>
                        {event.resolved ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-xs text-green-600">Resolved</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-yellow-600" />
                            <span className="text-xs text-yellow-600">Unresolved</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {!event.resolved && (
                          <Button size="sm" variant="outline" disabled={actingId === event.id} onClick={() => resolveEvent(event.id)}>
                            {actingId === event.id ? 'Working...' : 'Resolve'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                  )}
                </TableBody>
              </Table>
              <PaginationControls 
                page={eventsPage}
                totalPages={paginate(filteredEvents, eventsPage, pageSize).totalPages}
                pageSize={pageSize}
                onPageChange={setEventsPage}
                onPageSizeChange={setPageSize}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Failed Logins Tab */}
        <TabsContent value="failed-logins" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Failed Login Attempts</CardTitle>
                  <CardDescription>Recent failed authentication attempts</CardDescription>
                </div>
                <Badge variant="secondary">
                  {filteredFailedLogins.length} {filteredFailedLogins.length === 1 ? 'attempt' : 'attempts'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Last Attempt</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFailedLogins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No failed login attempts found matching your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                  paginate(filteredFailedLogins, failedLoginsPage, pageSize).items.map((login) => (
                    <TableRow key={`${login.email}-${login.ipAddress}-${login.lastAttempt}`}>
                      <TableCell className="font-medium">{login.email}</TableCell>
                      <TableCell className="font-mono text-sm">{login.ipAddress}</TableCell>
                      <TableCell>
                        <Badge variant={login.attemptCount >= 5 ? 'destructive' : 'secondary'}>
                          {login.attemptCount} {login.attemptCount === 1 ? 'attempt' : 'attempts'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatTimestamp(login.lastAttempt)}</TableCell>
                      <TableCell>
                        {login.blocked ? (
                          <div className="flex items-center gap-1 text-destructive">
                            <XCircle className="h-4 w-4" />
                            <span className="text-sm">Blocked</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">Monitoring</span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                  )}
                </TableBody>
              </Table>
              <PaginationControls 
                page={failedLoginsPage}
                totalPages={paginate(filteredFailedLogins, failedLoginsPage, pageSize).totalPages}
                pageSize={pageSize}
                onPageChange={setFailedLoginsPage}
                onPageSizeChange={setPageSize}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active User Sessions</CardTitle>
              <CardDescription>Monitor currently active sessions across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Browser</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Last Activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No active sessions found matching your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                  paginate(filteredSessions, sessionsPage, pageSize).items.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{session.userEmail}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(session.deviceType)}
                          <span className="text-sm capitalize">{session.deviceType}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{session.browser}</TableCell>
                      <TableCell className="font-mono text-sm">{session.ipAddress}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Globe className="h-3 w-3" />
                          {session.location}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{session.duration}m</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatTimestamp(session.lastActivity)}</TableCell>
                    </TableRow>
                  ))
                  )}
                </TableBody>
              </Table>
              <PaginationControls 
                page={sessionsPage}
                totalPages={paginate(filteredSessions, sessionsPage, pageSize).totalPages}
                pageSize={pageSize}
                onPageChange={setSessionsPage}
                onPageSizeChange={setPageSize}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suspicious Activity Tab */}
        <TabsContent value="suspicious" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Suspicious Activities</CardTitle>
              <CardDescription>High-risk activities flagged by the security system</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Risk</TableHead>
                    <TableHead>Activity Type</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Indicators</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuspicious.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No suspicious activities found matching your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                  paginate(filteredSuspicious, suspiciousPage, pageSize).items.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <div className={`flex items-center gap-1 font-bold ${getRiskColor(activity.riskScore)}`}>
                          {activity.riskScore >= 50 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          {activity.riskScore}/100
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {activity.activityType.replaceAll('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </TableCell>
                      <TableCell className="text-sm">{activity.userEmail || 'N/A'}</TableCell>
                      <TableCell className="font-mono text-sm">{activity.ipAddress || 'N/A'}</TableCell>
                      <TableCell className="text-sm max-w-xs truncate">{activity.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{activity.indicators.length} indicators</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatTimestamp(activity.timestamp)}</TableCell>
                      <TableCell>
                        {activity.reviewed ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-xs text-green-600">Reviewed</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <span className="text-xs text-yellow-600">Unreviewed</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {!activity.reviewed && (
                          <Button size="sm" variant="outline" disabled={actingId === activity.id} onClick={() => markReviewed(activity.id)}>
                            {actingId === activity.id ? 'Working...' : 'Mark Reviewed'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                  )}
                </TableBody>
              </Table>
              <PaginationControls 
                page={suspiciousPage}
                totalPages={paginate(filteredSuspicious, suspiciousPage, pageSize).totalPages}
                pageSize={pageSize}
                onPageChange={setSuspiciousPage}
                onPageSizeChange={setPageSize}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
