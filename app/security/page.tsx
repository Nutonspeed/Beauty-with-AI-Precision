'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSecurityMetrics } from '@/hooks/useSecurity'
import SecurityDashboard from '@/components/security-dashboard'
import AuditLogsViewer from '@/components/audit-logs-viewer'
import ComplianceReportViewer from '@/components/compliance-report-viewer'
import UserManagement from '@/components/user-management'
import SessionManager from '@/components/session-manager'
import SecurityAlertManager from '@/components/security-alert-manager'
import PermissionEditor from '@/components/permission-editor'
import {
  Shield,
  Users,
  Clock,
  AlertTriangle,
  FileText,
  Settings,
  Eye,
  BarChart3,
  RefreshCw,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react'

export default function SecurityPage() {
  const { metrics, loading: metricsLoading, refresh: refreshMetrics } = useSecurityMetrics()

  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      component: SecurityDashboard,
      description: 'Security dashboard with real-time metrics and alerts'
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      component: UserManagement,
      description: 'User account management and administration'
    },
    {
      id: 'sessions',
      label: 'Sessions',
      icon: Clock,
      component: SessionManager,
      description: 'Active session monitoring and management'
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: AlertTriangle,
      component: SecurityAlertManager,
      description: 'Security threat detection and response'
    },
    {
      id: 'audit',
      label: 'Audit Logs',
      icon: Eye,
      component: AuditLogsViewer,
      description: 'Comprehensive audit logging and monitoring'
    },
    {
      id: 'compliance',
      label: 'Compliance',
      icon: FileText,
      component: ComplianceReportViewer,
      description: 'HIPAA/PDPA/GDPR compliance reporting'
    },
    {
      id: 'permissions',
      label: 'Permissions',
      icon: Shield,
      component: PermissionEditor,
      description: 'Role-based access control and permissions'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      component: null,
      description: 'Security system configuration and settings'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'critical': return <XCircle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getComplianceScore = (status: string) => {
    switch (status) {
      case 'compliant': return 95
      case 'warning': return 75
      case 'violation': return 45
      case 'under_review': return 60
      default: return 0
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Security Center</h1>
                  <p className="text-sm text-gray-600">Advanced Security & Compliance System</p>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="flex items-center gap-4">
              {!metricsLoading && metrics && (
                <div className="flex items-center gap-2">
                  {getStatusIcon(metrics.complianceStatus)}
                  <Badge className={getStatusColor(metrics.complianceStatus)}>
                    System: {metrics.complianceStatus.toUpperCase()}
                  </Badge>
                </div>
              )}

              <Button onClick={refreshMetrics} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        {!metricsLoading && metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold">{metrics.activeUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                    <p className="text-2xl font-bold">{metrics.activeSessions}</p>
                  </div>
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Security Alerts</p>
                    <p className="text-2xl font-bold text-red-600">{metrics.securityAlerts.unresolved}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                    <p className="text-2xl font-bold text-green-600">{getComplianceScore(metrics.complianceStatus)}%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 text-xs lg:text-sm"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {/* Tab Content */}
          {tabs.map((tab) => {
            const Component = tab.component
            const isSettingsTab = tab.id === 'settings'

            const renderTabContent = () => {
              if (isSettingsTab) {
                return (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Security Settings
                      </CardTitle>
                      <CardDescription>
                        Configure security policies, compliance settings, and system preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Password Policies</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Minimum length</span>
                              <Badge>12 characters</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Require special characters</span>
                              <Badge variant="outline">Enabled</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Password expiration</span>
                              <Badge>90 days</Badge>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Session Management</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Session timeout</span>
                              <Badge>8 hours</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Geo-fencing</span>
                              <Badge variant="outline">Enabled</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Anomaly detection</span>
                              <Badge variant="outline">Enabled</Badge>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Audit Settings</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Log retention</span>
                              <Badge>7 years</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">PHI access logging</span>
                              <Badge variant="outline">Enabled</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Real-time monitoring</span>
                              <Badge variant="outline">Enabled</Badge>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Compliance Frameworks</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">HIPAA</span>
                              <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">GDPR</span>
                              <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">PDPA</span>
                              <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                )
              }

              if (Component) {
                return <Component />
              }

              return (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">
                        {tab.label} Settings
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {tab.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            }

            return (
              <TabsContent key={tab.id} value={tab.id} className="space-y-6">
                {renderTabContent()}
              </TabsContent>
            )
          })}
        </Tabs>
      </div>
    </div>
  )
}
