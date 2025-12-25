'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  Calendar,
  User,
  Activity,
  FileText,
  Eye,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  Settings,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

interface AuditLog {
  id: string
  user_id: string
  action: string
  resource_type: string
  resource_id: string | null
  metadata: any
  ip_address: string | null
  created_at: string
  auth: {
    users: {
      email: string
    }
  }
}

interface FilterOptions {
  actions: string[]
  resourceTypes: string[]
  users: Array<{ id: string; email: string }>
}

export default function AuditLogsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [filters, setFilters] = useState<FilterOptions | null>(null)
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  })
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAction, setSelectedAction] = useState<string>('all')
  const [selectedResourceType, setSelectedResourceType] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<string>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  
  // View states
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      fetchLogs()
    }
  }, [user, authLoading, pagination.page, selectedAction, selectedResourceType, selectedUser, startDate, endDate])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (selectedAction !== 'all') params.append('action', selectedAction)
      if (selectedResourceType !== 'all') params.append('resourceType', selectedResourceType)
      if (selectedUser !== 'all') params.append('userId', selectedUser)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await fetch(`/api/admin/audit-logs?${params}`)
      if (!response.ok) throw new Error('Failed to fetch audit logs')
      const data = await response.json()
      
      setLogs(data.logs)
      setFilters(data.filters)
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        pages: data.pagination.pages
      }))
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewLog = (log: AuditLog) => {
    setSelectedLog(log)
    setIsViewDialogOpen(true)
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'updated':
        return <Edit className="w-4 h-4 text-blue-500" />
      case 'deleted':
        return <Trash2 className="w-4 h-4 text-red-500" />
      case 'login':
        return <User className="w-4 h-4 text-purple-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getActionBadge = (action: string) => {
    const variants: Record<string, string> = {
      created: 'bg-green-100 text-green-800',
      updated: 'bg-blue-100 text-blue-800',
      deleted: 'bg-red-100 text-red-800',
      login: 'bg-purple-100 text-purple-800',
      subscription_updated: 'bg-indigo-100 text-indigo-800',
    }
    
    return (
      <Badge className={variants[action] || 'bg-gray-100 text-gray-800'}>
        {action}
      </Badge>
    )
  }

  const exportLogs = async () => {
    try {
      const params = new URLSearchParams({
        limit: '10000', // Export more records
      })
      
      if (selectedAction !== 'all') params.append('action', selectedAction)
      if (selectedResourceType !== 'all') params.append('resourceType', selectedResourceType)
      if (selectedUser !== 'all') params.append('userId', selectedUser)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await fetch(`/api/admin/audit-logs/export?${params}`)
      if (!response.ok) throw new Error('Failed to export logs')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting logs:', error)
    }
  }

  if (authLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    router.push('/auth/login')
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">
            Track all admin actions for compliance and security
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportLogs}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label>Action</Label>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {filters?.actions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Resource Type</Label>
              <Select value={selectedResourceType} onValueChange={setSelectedResourceType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  {filters?.resourceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>User</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {filters?.users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date Range</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading audit logs...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          {getActionBadge(log.action)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.auth.users.email}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {log.user_id.slice(0, 8)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.resource_type}</div>
                          {log.resource_id && (
                            <div className="text-sm text-muted-foreground">
                              ID: {log.resource_id.slice(0, 8)}...
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {log.ip_address || 'N/A'}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss', { locale: th })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewLog(log)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} results
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* View Log Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Log ID</Label>
                  <div className="text-sm font-mono mt-1">{selectedLog.id}</div>
                </div>
                <div>
                  <Label>Action</Label>
                  <div className="mt-1">{getActionBadge(selectedLog.action)}</div>
                </div>
                <div>
                  <Label>User</Label>
                  <div className="text-sm mt-1">{selectedLog.auth.users.email}</div>
                </div>
                <div>
                  <Label>Resource Type</Label>
                  <div className="text-sm mt-1">{selectedLog.resource_type}</div>
                </div>
                <div>
                  <Label>Resource ID</Label>
                  <div className="text-sm font-mono mt-1">
                    {selectedLog.resource_id || 'N/A'}
                  </div>
                </div>
                <div>
                  <Label>IP Address</Label>
                  <div className="text-sm font-mono mt-1">
                    {selectedLog.ip_address || 'N/A'}
                  </div>
                </div>
                <div className="col-span-2">
                  <Label>Timestamp</Label>
                  <div className="text-sm mt-1">
                    {format(new Date(selectedLog.created_at), 'PPPpp', { locale: th })}
                  </div>
                </div>
              </div>
              
              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <Label>Metadata</Label>
                  <pre className="mt-1 p-3 bg-muted rounded-md text-sm overflow-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
