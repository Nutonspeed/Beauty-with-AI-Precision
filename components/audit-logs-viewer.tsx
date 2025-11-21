/**
 * Audit Logs Viewer Component
 * 
 * Detailed audit log viewer with filtering and export capabilities
 */

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuditLogs } from "@/hooks/useSecurity"
import { 
  AuditEventType, 
  Resource, 
  RiskLevel,
} from "@/lib/security/security-manager"
import { 
  FileText, 
  Download, 
  Filter,
  Search,
  Lock,
  Activity,
  AlertTriangle,
  Info,
} from "lucide-react"

export default function AuditLogsViewer() {
  const [filters, setFilters] = useState<{
    userId?: string
    eventType?: AuditEventType
    resource?: Resource
    riskLevel?: RiskLevel
    phiAccessed?: boolean
    startDate?: Date
    endDate?: Date
  }>({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    endDate: new Date(),
  })
  
  const [searchTerm, setSearchTerm] = useState("")
  
  const { logs, loading } = useAuditLogs(filters)
  
  // Filter logs by search term
  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      log.userName.toLowerCase().includes(term) ||
      log.eventType.toLowerCase().includes(term) ||
      log.resource?.toLowerCase().includes(term) ||
      log.ipAddress.includes(term)
    )
  })
  
  const handleExport = () => {
    const csv = [
      ["Timestamp", "Event Type", "User", "Role", "Resource", "Action", "Risk Level", "PHI Accessed", "IP Address"].join(","),
      ...filteredLogs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.eventType,
        log.userName,
        log.userRole,
        log.resource || "",
        log.action || "",
        log.riskLevel,
        log.phiAccessed ? "Yes" : "No",
        log.ipAddress,
      ].join(","))
    ].join("\n")
    
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `audit-logs-${new Date().toISOString()}.csv`
    a.click()
  }
  
  const getRiskIcon = (riskLevel: RiskLevel) => {
    switch (riskLevel) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case "medium":
        return <Info className="h-4 w-4 text-yellow-600" />
      default:
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
          <p className="text-muted-foreground mt-2">
            Comprehensive audit trail of all system activities
          </p>
        </div>
        <Button onClick={handleExport} disabled={filteredLogs.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by user, event, resource, IP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            {/* Event Type */}
            <div>
              <Label htmlFor="eventType">Event Type</Label>
              <Select
                value={filters.eventType || "all"}
                onValueChange={(value) => 
                  setFilters({ ...filters, eventType: value === "all" ? undefined : value as AuditEventType })
                }
              >
                <SelectTrigger id="eventType" className="mt-2">
                  <SelectValue placeholder="All events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="login_failed">Login Failed</SelectItem>
                  <SelectItem value="data_access">Data Access</SelectItem>
                  <SelectItem value="phi_access">PHI Access</SelectItem>
                  <SelectItem value="data_create">Data Create</SelectItem>
                  <SelectItem value="data_update">Data Update</SelectItem>
                  <SelectItem value="data_delete">Data Delete</SelectItem>
                  <SelectItem value="data_export">Data Export</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Risk Level */}
            <div>
              <Label htmlFor="riskLevel">Risk Level</Label>
              <Select
                value={filters.riskLevel || "all"}
                onValueChange={(value) => 
                  setFilters({ ...filters, riskLevel: value === "all" ? undefined : value as RiskLevel })
                }
              >
                <SelectTrigger id="riskLevel" className="mt-2">
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* PHI Access */}
            <div>
              <Label htmlFor="phiAccessed">PHI Access</Label>
              <Select
                value={filters.phiAccessed === undefined ? "all" : filters.phiAccessed ? "yes" : "no"}
                onValueChange={(value) => 
                  setFilters({ 
                    ...filters, 
                    phiAccessed: value === "all" ? undefined : value === "yes" 
                  })
                }
              >
                <SelectTrigger id="phiAccessed" className="mt-2">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">PHI Accessed</SelectItem>
                  <SelectItem value="no">No PHI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Resource */}
            <div>
              <Label htmlFor="resource">Resource</Label>
              <Select
                value={filters.resource || "all"}
                onValueChange={(value) => 
                  setFilters({ ...filters, resource: value === "all" ? undefined : value as Resource })
                }
              >
                <SelectTrigger id="resource" className="mt-2">
                  <SelectValue placeholder="All resources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  <SelectItem value="patients">Patients</SelectItem>
                  <SelectItem value="medical_records">Medical Records</SelectItem>
                  <SelectItem value="treatments">Treatments</SelectItem>
                  <SelectItem value="appointments">Appointments</SelectItem>
                  <SelectItem value="prescriptions">Prescriptions</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="settings">Settings</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Date Range */}
            <div className="lg:col-span-2">
              <Label>Date Range</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={
                    filters.startDate && 
                    filters.startDate.getTime() === new Date(Date.now() - 24 * 60 * 60 * 1000).getTime()
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => setFilters({
                    ...filters,
                    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    endDate: new Date(),
                  })}
                >
                  Last 24h
                </Button>
                <Button
                  variant={
                    filters.startDate && 
                    filters.startDate.getTime() === new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime()
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => setFilters({
                    ...filters,
                    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    endDate: new Date(),
                  })}
                >
                  Last 7 days
                </Button>
                <Button
                  variant={
                    filters.startDate && 
                    filters.startDate.getTime() === new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).getTime()
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => setFilters({
                    ...filters,
                    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    endDate: new Date(),
                  })}
                >
                  Last 30 days
                </Button>
              </div>
            </div>
          </div>
          
          {/* Reset Filters */}
          <div className="mt-4 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilters({
                  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                  endDate: new Date(),
                })
                setSearchTerm("")
              }}
            >
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{filteredLogs.length}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">PHI Access</p>
                <p className="text-2xl font-bold">
                  {filteredLogs.filter(l => l.phiAccessed).length}
                </p>
              </div>
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Risk</p>
                <p className="text-2xl font-bold">
                  {filteredLogs.filter(l => l.riskLevel === "high" || l.riskLevel === "critical").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unique Users</p>
                <p className="text-2xl font-bold">
                  {new Set(filteredLogs.map(l => l.userId)).size}
                </p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} event{filteredLogs.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading audit logs...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2" />
              <p>No audit logs found matching your filters</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="mt-1">
                      {getRiskIcon(log.riskLevel)}
                    </div>
                    
                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-semibold">
                            {log.eventType.replace(/_/g, " ").toUpperCase()}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={log.phiAccessed ? "destructive" : "secondary"}>
                            {log.riskLevel.toUpperCase()}
                          </Badge>
                          {log.phiAccessed && (
                            <Badge variant="destructive">
                              <Lock className="h-3 w-3 mr-1" />
                              PHI
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">User:</span>
                          <div className="font-medium">{log.userName}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Role:</span>
                          <div className="font-medium capitalize">{log.userRole.replace(/_/g, " ")}</div>
                        </div>
                        {log.resource && (
                          <div>
                            <span className="text-muted-foreground">Resource:</span>
                            <div className="font-medium capitalize">{log.resource.replace(/_/g, " ")}</div>
                          </div>
                        )}
                        {log.action && (
                          <div>
                            <span className="text-muted-foreground">Action:</span>
                            <div className="font-medium capitalize">{log.action}</div>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">IP Address:</span>
                          <div className="font-medium">{log.ipAddress}</div>
                        </div>
                        {log.location && (
                          <div>
                            <span className="text-muted-foreground">Location:</span>
                            <div className="font-medium">
                              {log.location.city}, {log.location.country}
                            </div>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Session ID:</span>
                          <div className="font-medium font-mono text-xs">{log.sessionId}</div>
                        </div>
                      </div>
                      
                      {/* Additional Details */}
                      {Object.keys(log.details).length > 0 && (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                            View additional details
                          </summary>
                          <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
