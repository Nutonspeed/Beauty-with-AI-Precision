'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Eye,
  Globe,
  FileText,
  TrendingUp,
  Activity
} from 'lucide-react'

// Security metrics interface
interface SecurityMetrics {
  totalEvents: number
  criticalEvents: number
  highEvents: number
  mediumEvents: number
  lowEvents: number
  vulnerabilities: {
    critical: number
    high: number
    medium: number
    low: number
  }
  compliance: {
    gdpr: number
    hipaa: number
    soc2: number
    iso27001: number
  }
  recentAlerts: Array<{
    id: string
    type: string
    message: string
    severity: string
    timestamp: string
  }>
}

export default function SecurityDashboard() {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    criticalEvents: 0,
    highEvents: 0,
    mediumEvents: 0,
    lowEvents: 0,
    vulnerabilities: { critical: 0, high: 0, medium: 0, low: 0 },
    compliance: { gdpr: 0, hipaa: 0, soc2: 0, iso27001: 0 },
    recentAlerts: []
  })

  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('24h')

  useEffect(() => {
    fetchSecurityMetrics()
  }, [timeRange])

  const fetchSecurityMetrics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/security/metrics?timeRange=${timeRange}`)
      const data = await response.json()
      
      if (data.success) {
        setMetrics(data.metrics)
      }
    } catch (error) {
      console.error('Failed to fetch security metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const getSeverityBadgeVariant = (severity: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'default'
    }
  }

  const getComplianceColor = (score: number): string => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Shield className="w-6 h-6 mr-2" />
            Security Dashboard
          </h2>
          <p className="text-muted-foreground">Real-time security monitoring and compliance tracking</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          
          <Button onClick={fetchSecurityMetrics} variant="outline" size="sm">
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEvents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Security events detected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.criticalEvents}</div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vulnerabilities</CardTitle>
            <Shield className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {Object.values(metrics.vulnerabilities).reduce((sum, count) => sum + count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total vulnerabilities found</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(Object.values(metrics.compliance).reduce((sum, score) => sum + score, 0) / Object.keys(metrics.compliance).length)}%
            </div>
            <p className="text-xs text-muted-foreground">Average compliance score</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Details */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="alerts">Recent Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Security Events by Severity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Critical</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-red-600 font-medium">{metrics.criticalEvents}</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ width: `${metrics.totalEvents > 0 ? (metrics.criticalEvents / metrics.totalEvents) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">High</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-orange-600 font-medium">{metrics.highEvents}</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-600 h-2 rounded-full" 
                          style={{ width: `${metrics.totalEvents > 0 ? (metrics.highEvents / metrics.totalEvents) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Medium</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-600 font-medium">{metrics.mediumEvents}</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-600 h-2 rounded-full" 
                          style={{ width: `${metrics.totalEvents > 0 ? (metrics.mediumEvents / metrics.totalEvents) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Low</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-600 font-medium">{metrics.lowEvents}</span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${metrics.totalEvents > 0 ? (metrics.lowEvents / metrics.totalEvents) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Vulnerability Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Critical</span>
                    <Badge variant="destructive">{metrics.vulnerabilities.critical}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">High</span>
                    <Badge variant="destructive">{metrics.vulnerabilities.high}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Medium</span>
                    <Badge variant="secondary">{metrics.vulnerabilities.medium}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Low</span>
                    <Badge variant="outline">{metrics.vulnerabilities.low}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vulnerabilities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Vulnerability Management
              </CardTitle>
              <CardDescription>
                Track and manage security vulnerabilities across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Critical Vulnerabilities</h4>
                      <Badge variant="destructive">{metrics.vulnerabilities.critical}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Require immediate remediation
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">High Vulnerabilities</h4>
                      <Badge variant="destructive">{metrics.vulnerabilities.high}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Should be addressed within 7 days
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Button>
                    <Eye className="w-4 h-4 mr-2" />
                    View Detailed Vulnerability Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Compliance Status
              </CardTitle>
              <CardDescription>
                Monitor compliance across multiple security frameworks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">GDPR</h4>
                      <span className={getComplianceColor(metrics.compliance.gdpr)}>
                        {metrics.compliance.gdpr}%
                      </span>
                    </div>
                    <Progress value={metrics.compliance.gdpr} className="h-2" />
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">HIPAA</h4>
                      <span className={getComplianceColor(metrics.compliance.hipaa)}>
                        {metrics.compliance.hipaa}%
                      </span>
                    </div>
                    <Progress value={metrics.compliance.hipaa} className="h-2" />
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">SOC 2</h4>
                      <span className={getComplianceColor(metrics.compliance.soc2)}>
                        {metrics.compliance.soc2}%
                      </span>
                    </div>
                    <Progress value={metrics.compliance.soc2} className="h-2" />
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">ISO 27001</h4>
                      <span className={getComplianceColor(metrics.compliance.iso27001)}>
                        {metrics.compliance.iso27001}%
                      </span>
                    </div>
                    <Progress value={metrics.compliance.iso27001} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Recent Security Alerts
              </CardTitle>
              <CardDescription>
                Latest security events and alerts requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.recentAlerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                    <p>No recent security alerts</p>
                  </div>
                ) : (
                  metrics.recentAlerts.map((alert) => (
                    <Alert key={alert.id} className="border-l-4 border-l-orange-500">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{alert.type}</div>
                            <div className="text-sm">{alert.message}</div>
                          </div>
                          <div className="text-right">
                            <Badge variant={getSeverityBadgeVariant(alert.severity)}>
                              {alert.severity}
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(alert.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
