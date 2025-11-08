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
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { Search, Monitor, MapPin, Clock, User, Shield, X, RefreshCw, Eye } from 'lucide-react'
import { useSessions } from '@/hooks/useSecurity'
import { SessionStatus } from '@/lib/security/security-manager'

export default function SessionManager() {
  const { sessions, loading, error, revokeSession } = useSessions()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<SessionStatus | 'all'>('all')
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.ipAddress.includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSession(sessionId, 'ADMIN', 'Manual revocation')
    } catch (err) {
      alert('Failed to revoke session: ' + (err as Error).message)
    }
  }

  const openSessionDetails = (session: any) => {
    setSelectedSession(session)
    setIsDetailsDialogOpen(true)
  }

  const getStatusBadgeColor = (status: SessionStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'expired': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'revoked': return 'bg-red-100 text-red-800 border-red-200'
      case 'locked': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getAuthMethodIcon = (method: string) => {
    switch (method) {
      case '2fa': return <Shield className="h-4 w-4 text-green-600" />
      case 'biometric': return <User className="h-4 w-4 text-blue-600" />
      case 'sso': return <RefreshCw className="h-4 w-4 text-purple-600" />
      default: return <Monitor className="h-4 w-4 text-gray-600" />
    }
  }

  const getSessionDuration = (session: any) => {
    const now = new Date()
    const start = new Date(session.createdAt)
    const duration = now.getTime() - start.getTime()
    const hours = Math.floor(duration / (1000 * 60 * 60))
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const getTimeToExpiry = (session: any) => {
    if (session.status !== 'active') return null
    const now = new Date()
    const expiry = new Date(session.expiresAt)
    const timeLeft = expiry.getTime() - now.getTime()
    if (timeLeft <= 0) return 'Expired'

    const hours = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const getSessionProgress = (session: any) => {
    if (session.status !== 'active') return 100
    const now = new Date()
    const start = new Date(session.createdAt)
    const expiry = new Date(session.expiresAt)
    const total = expiry.getTime() - start.getTime()
    const elapsed = now.getTime() - start.getTime()
    return Math.min((elapsed / total) * 100, 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading sessions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading sessions</p>
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
          <h2 className="text-3xl font-bold tracking-tight">Session Manager</h2>
          <p className="text-muted-foreground mt-2">
            Monitor and manage active user sessions
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold">
                  {sessions.filter(s => s.status === 'active').length}
                </p>
              </div>
              <Monitor className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expired Sessions</p>
                <p className="text-2xl font-bold">
                  {sessions.filter(s => s.status === 'expired').length}
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
                <p className="text-sm font-medium text-muted-foreground">Revoked Sessions</p>
                <p className="text-2xl font-bold">
                  {sessions.filter(s => s.status === 'revoked').length}
                </p>
              </div>
              <X className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unique Users</p>
                <p className="text-2xl font-bold">
                  {new Set(sessions.map(s => s.userId)).size}
                </p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
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
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sessions by user or IP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
                <SelectItem value="locked">Locked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions ({filteredSessions.length})</CardTitle>
          <CardDescription>
            Monitor user sessions and manage access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        {getAuthMethodIcon(session.authMethod)}
                      </div>
                      <div>
                        <p className="font-medium">{session.userName}</p>
                        <p className="text-sm text-muted-foreground">{session.userRole}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(session.status)}>
                      {session.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-sm">{session.ipAddress}</div>
                  </TableCell>
                  <TableCell>
                    {session.location ? (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {session.location.city}, {session.location.country}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{getSessionDuration(session)}</div>
                      {session.status === 'active' && (
                        <div className="text-muted-foreground">
                          Expires in: {getTimeToExpiry(session)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-24">
                      <Progress value={getSessionProgress(session)} className="h-2" />
                      <div className="text-xs text-muted-foreground mt-1">
                        {Math.round(getSessionProgress(session))}%
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openSessionDetails(session)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {session.status === 'active' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <X className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revoke Session</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to revoke the session for {session.userName}?
                                This will log them out immediately.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRevokeSession(session.id)}>
                                Revoke Session
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

      {/* Session Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
            <DialogDescription>
              Detailed information about the user session
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Session ID</Label>
                  <p className="font-mono text-sm">{selectedSession.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusBadgeColor(selectedSession.status)}>
                    {selectedSession.status.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">User</Label>
                  <p>{selectedSession.userName}</p>
                  <p className="text-sm text-muted-foreground">{selectedSession.userRole}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Auth Method</Label>
                  <div className="flex items-center gap-2">
                    {getAuthMethodIcon(selectedSession.authMethod)}
                    <span className="capitalize">{selectedSession.authMethod}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">IP Address</Label>
                  <p className="font-mono">{selectedSession.ipAddress}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">User Agent</Label>
                  <p className="text-sm">{selectedSession.userAgent}</p>
                </div>
              </div>

              {selectedSession.location && (
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {selectedSession.location.city}, {selectedSession.location.region}, {selectedSession.location.country}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm">{new Date(selectedSession.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Activity</Label>
                  <p className="text-sm">{new Date(selectedSession.lastActivity).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Expires</Label>
                  <p className="text-sm">{new Date(selectedSession.expiresAt).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Duration</Label>
                  <p className="text-sm">{getSessionDuration(selectedSession)}</p>
                </div>
              </div>

              {selectedSession.revokedAt && (
                <div>
                  <Label className="text-sm font-medium">Revoked</Label>
                  <p className="text-sm">{new Date(selectedSession.revokedAt).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">By: {selectedSession.revokedBy}</p>
                  <p className="text-sm text-muted-foreground">Reason: {selectedSession.revokedReason}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Close
            </Button>
            {selectedSession?.status === 'active' && (
              <Button
                variant="destructive"
                onClick={() => {
                  handleRevokeSession(selectedSession.id)
                  setIsDetailsDialogOpen(false)
                }}
              >
                Revoke Session
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
