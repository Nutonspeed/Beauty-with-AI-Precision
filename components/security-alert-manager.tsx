'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle, Shield, Clock, CheckCircle, XCircle, Eye, AlertCircle, RefreshCw, Filter } from 'lucide-react'
import { useSecurityAlerts } from '@/hooks/useSecurity'
import { RiskLevel } from '@/lib/security/security-manager'
import { formatTimeAgo } from '@/lib/lead-prioritization'

export default function SecurityAlertManager() {
  const { alerts, loading, error, resolveAlert, refresh } = useSecurityAlerts()
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState<RiskLevel | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'resolved' | 'unresolved'>('all')
  const [selectedAlert, setSelectedAlert] = useState<any>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [resolutionNotes, setResolutionNotes] = useState('')

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.userName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'resolved' && alert.resolved) ||
                         (statusFilter === 'unresolved' && !alert.resolved)
    return matchesSearch && matchesSeverity && matchesStatus
  })

  const handleResolveAlert = async (alertId: string) => {
    if (!resolutionNotes.trim()) {
      alert('Please provide resolution notes')
      return
    }

    try {
      await resolveAlert(alertId, resolutionNotes, 'ADMIN')
      setResolutionNotes('')
      setIsDetailsDialogOpen(false)
    } catch (err) {
      alert('Failed to resolve alert: ' + (err as Error).message)
    }
  }

  const openAlertDetails = (alert: any) => {
    setSelectedAlert(alert)
    setResolutionNotes('')
    setIsDetailsDialogOpen(true)
  }

  const getSeverityBadgeColor = (severity: RiskLevel) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getResolvedBadgeColor = () => 'bg-green-100 text-green-800 border-green-200'

  const getUnresolvedBadgeColor = () => 'bg-red-100 text-red-800 border-red-200'

  const getSeverityIcon = (severity: RiskLevel) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'high': return <AlertCircle className="h-4 w-4 text-orange-600" />
      case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'low': return <Shield className="h-4 w-4 text-blue-600" />
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getResolvedIcon = () => <CheckCircle className="h-4 w-4 text-green-600" />

  const getUnresolvedIcon = () => <XCircle className="h-4 w-4 text-red-600" />

  const getTimeAgo = (date: Date) => {
    return formatTimeAgo(date)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading security alerts...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading alerts</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Security Alert Manager</h2>
          <p className="text-muted-foreground mt-2">
            Monitor and respond to security threats and anomalies
          </p>
        </div>
        <Button onClick={refresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold text-red-600">
                  {alerts.filter(a => !a.resolved).length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Investigating</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {alerts.filter(a => !a.resolved && a.severity === 'high').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-green-600">
                  {alerts.filter(a => a.resolved).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-600">
                  {alerts.filter(a => a.severity === 'critical').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Filter className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search alerts by title, description, or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={severityFilter} onValueChange={(value: any) => setSeverityFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unresolved">Unresolved</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Security Alerts ({filteredAlerts.length})</CardTitle>
          <CardDescription>
            Monitor and respond to security threats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alert</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell>
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(alert.severity)}
                      <div>
                        <p className="font-medium">{alert.description}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {alert.type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getSeverityBadgeColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {alert.resolved ? getResolvedIcon() : getUnresolvedIcon()}
                      <Badge className={alert.resolved ? getResolvedBadgeColor() : getUnresolvedBadgeColor()}>
                        {alert.resolved ? 'RESOLVED' : 'UNRESOLVED'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {alert.userName ? (
                      <div>
                        <p className="font-medium">{alert.userName}</p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{getTimeAgo(alert.createdAt)}</div>
                      <div className="text-muted-foreground">
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openAlertDetails(alert)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!alert.resolved && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Resolve Alert</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to resolve this alert? Please provide resolution notes.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="py-4">
                              <Textarea
                                placeholder="Enter resolution notes..."
                                value={resolutionNotes}
                                onChange={(e) => setResolutionNotes(e.target.value)}
                                rows={3}
                              />
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleResolveAlert(alert.id)}
                                disabled={!resolutionNotes.trim()}
                              >
                                Resolve Alert
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Alert Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAlert && getSeverityIcon(selectedAlert.severity)}
              {selectedAlert?.description}
            </DialogTitle>
            <DialogDescription>
              Detailed information about the security alert
            </DialogDescription>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium">Alert ID</h4>
                  <p className="font-mono text-sm">{selectedAlert.id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Severity</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {getSeverityIcon(selectedAlert.severity)}
                    <Badge className={getSeverityBadgeColor(selectedAlert.severity)}>
                      {selectedAlert.severity.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Status</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedAlert.resolved ? getResolvedIcon() : getUnresolvedIcon()}
                    <Badge className={selectedAlert.resolved ? getResolvedBadgeColor() : getUnresolvedBadgeColor()}>
                      {selectedAlert.resolved ? 'RESOLVED' : 'UNRESOLVED'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Type</h4>
                  <p className="capitalize">{selectedAlert.type.replace('_', ' ')}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium">Description</h4>
                <p className="mt-1">{selectedAlert.description}</p>
              </div>

              {selectedAlert.userName && (
                <div>
                  <h4 className="text-sm font-medium">Affected User</h4>
                  <div className="mt-1">
                    <p className="font-medium">{selectedAlert.userName}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium">Created</h4>
                  <p className="text-sm">{new Date(selectedAlert.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Last Updated</h4>
                  <p className="text-sm">{new Date(selectedAlert.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {selectedAlert.details && Object.keys(selectedAlert.details).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium">Additional Details</h4>
                  <div className="mt-2 space-y-2">
                    {Object.entries(selectedAlert.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm text-muted-foreground capitalize">
                          {key.replace('_', ' ')}:
                        </span>
                        <span className="text-sm font-mono">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedAlert.resolved && selectedAlert.resolution && (
                <div>
                  <h4 className="text-sm font-medium">Resolution</h4>
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm">
                      <strong>Resolved by:</strong> {selectedAlert.resolvedBy}
                    </p>
                    <p className="text-sm mt-1">
                      <strong>Resolution notes:</strong> {selectedAlert.resolution}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedAlert.resolvedAt ? new Date(selectedAlert.resolvedAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              )}

              {selectedAlert.relatedAuditLogs && selectedAlert.relatedAuditLogs.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium">Related Audit Logs</h4>
                  <div className="mt-2 space-y-2">
                    {selectedAlert.relatedAuditLogs.slice(0, 5).map((logId: string) => (
                      <div key={logId} className="p-2 bg-gray-50 border rounded text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">Log ID: {logId}</span>
                          <span className="text-muted-foreground">Related to this alert</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Close
            </Button>
            {selectedAlert && !selectedAlert.resolved && (
              <Button
                variant="default"
                onClick={() => {
                  const notes = prompt('Enter resolution notes:')
                  if (notes?.trim()) {
                    handleResolveAlert(selectedAlert.id)
                  }
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Resolve Alert
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
