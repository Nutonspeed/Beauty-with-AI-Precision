/**
 * Security Dashboard Component
 * 
 * Comprehensive security overview with metrics, alerts, and compliance status
 */

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSecurityMetrics, useSecurityAlerts, useAuditLogs } from "@/hooks/useSecurity"
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Users, 
  Activity,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  AlertOctagon,
} from "lucide-react"

interface SecurityDashboardProps {
  userId?: string
}

export default function SecurityDashboard({ userId: _userId }: SecurityDashboardProps) {
  const { metrics, loading: metricsLoading } = useSecurityMetrics()
  const { alerts } = useSecurityAlerts({ resolved: false })
  const { logs } = useAuditLogs({ 
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    endDate: new Date(),
  })
  
  if (metricsLoading || !metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-muted-foreground">Loading security metrics...</div>
      </div>
    )
  }
  
  const criticalAlerts = alerts.filter(a => a.severity === "critical").length
  const _highAlerts = alerts.filter(a => a.severity === "high").length
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Security Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          Monitor security, compliance, and audit activities
        </p>
      </div>
      
      {/* Critical Alerts Banner */}
      {criticalAlerts > 0 && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertOctagon className="h-8 w-8 text-destructive" />
              <div className="flex-1">
                <h3 className="font-semibold text-destructive">Critical Security Alerts</h3>
                <p className="text-sm text-muted-foreground">
                  {criticalAlerts} critical alert{criticalAlerts > 1 ? "s" : ""} require immediate attention
                </p>
              </div>
              <Button variant="destructive">View Alerts</Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
            {metrics.complianceStatus === "compliant" ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.complianceStatus === "compliant" ? "Compliant" : "Non-Compliant"}
            </div>
            <Badge 
              variant={metrics.complianceStatus === "compliant" ? "default" : "destructive"}
              className="mt-2"
            >
              {metrics.complianceStatus.toUpperCase()}
            </Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeSessions}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.expiredSessions} expired, {metrics.revokedSessions} revoked
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.securityAlerts.unresolved}</div>
            <div className="flex gap-2 mt-2">
              {metrics.securityAlerts.bySeverity.critical > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {metrics.securityAlerts.bySeverity.critical} Critical
                </Badge>
              )}
              {metrics.securityAlerts.bySeverity.high > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {metrics.securityAlerts.bySeverity.high} High
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PHI Access (24h)</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.phiAccessCount}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Protected Health Information
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Detailed Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Accounts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Users</span>
                <span className="font-medium">{metrics.totalUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Active Users</span>
                <span className="font-medium">{metrics.activeUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Locked Accounts</span>
                <span className="font-medium text-red-600">{metrics.lockedAccounts}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audit Activity (24h)</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Events</span>
                <span className="font-medium">{metrics.auditLogs24h}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Failed Logins</span>
                <span className="font-medium text-orange-600">{metrics.failedLoginAttempts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Suspicious Activity</span>
                <span className="font-medium text-red-600">{metrics.suspiciousActivities}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Audits</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.lastSecurityAudit && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last Audit</span>
                  <span className="font-medium text-xs">
                    {new Date(metrics.lastSecurityAudit).toLocaleDateString()}
                  </span>
                </div>
              )}
              {metrics.nextScheduledAudit && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Next Audit</span>
                  <span className="font-medium text-xs">
                    {new Date(metrics.nextScheduledAudit).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="pt-2">
                <Button variant="outline" size="sm" className="w-full">
                  Generate Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Security events and alerts from the last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="alerts">
            <TabsList>
              <TabsTrigger value="alerts">
                Security Alerts ({alerts.length})
              </TabsTrigger>
              <TabsTrigger value="audit">
                Audit Logs ({logs.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="alerts" className="space-y-4 mt-4">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-600" />
                  <p>No unresolved security alerts</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.slice(0, 10).map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className={`mt-1 ${
                        alert.severity === "critical" ? "text-red-600" :
                        alert.severity === "high" ? "text-orange-600" :
                        alert.severity === "medium" ? "text-yellow-600" :
                        "text-blue-600"
                      }`}>
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-medium">{alert.description}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {alert.userName && `User: ${alert.userName} • `}
                              {new Date(alert.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <Badge
                            variant={
                              alert.severity === "critical" || alert.severity === "high"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline">
                            Investigate
                          </Button>
                          <Button size="sm" variant="ghost">
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="audit" className="space-y-4 mt-4">
              {logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2" />
                  <p>No audit logs in the last 24 hours</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.slice(0, 15).map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center gap-4 p-3 border rounded-lg text-sm hover:bg-accent/50 transition-colors"
                    >
                      <div className={`${
                        log.riskLevel === "critical" || log.riskLevel === "high"
                          ? "text-red-600"
                          : log.riskLevel === "medium"
                          ? "text-orange-600"
                          : "text-muted-foreground"
                      }`}>
                        {log.phiAccessed ? (
                          <Lock className="h-4 w-4" />
                        ) : (
                          <Activity className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">
                          {log.eventType.replace(/_/g, " ").toUpperCase()}
                        </div>
                        <div className="text-muted-foreground">
                          {log.userName} • {log.resource && `${log.resource} • `}
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <Badge variant={log.phiAccessed ? "destructive" : "secondary"}>
                          {log.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
