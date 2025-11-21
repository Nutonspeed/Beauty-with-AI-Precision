// @ts-nocheck
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useSecurity } from '@/hooks/useSecurity'
import { User, UserRole, ResourceType, ActionType, PermissionRule } from '@/lib/security/security-manager'
import {
  Shield,
  User as UserIcon,
  Settings,
  Plus,
  Edit,
  Trash2,
  X,
  AlertTriangle,
  Clock,
  Users,
  Key,
  Eye
} from 'lucide-react'

interface PermissionEditorProps {
  className?: string
}

export default function PermissionEditor({ className }: PermissionEditorProps) {
  const {
    users,
    loading: usersLoading,
    error: usersError,
    refresh: refreshUsers
  } = useSecurity().useUsers()

  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<PermissionRule | null>(null)
  const [newRule, setNewRule] = useState<Partial<PermissionRule>>({
    resource: 'patient_records',
    action: 'read',
    conditions: [],
    expiresAt: null
  })

  // Mock permission rules - in real app this would come from security manager
  const [permissionRules, setPermissionRules] = useState<PermissionRule[]>([
    {
      id: 'rule_1',
      userId: 'user_1',
      resource: 'patient_records',
      action: 'read',
      conditions: [{ field: 'department', operator: 'equals', value: 'cardiology' }],
      expiresAt: null,
      createdAt: new Date('2024-01-15'),
      createdBy: 'admin_1'
    },
    {
      id: 'rule_2',
      userId: 'user_2',
      resource: 'appointments',
      action: 'write',
      conditions: [],
      expiresAt: new Date('2024-12-31'),
      createdAt: new Date('2024-01-20'),
      createdBy: 'admin_1'
    }
  ])

  const resources: ResourceType[] = [
    'patient_records', 'appointments', 'inventory', 'billing', 'reports',
    'user_management', 'system_settings', 'audit_logs', 'emergency_alerts'
  ]

  const actions: ActionType[] = ['read', 'write', 'delete', 'admin']

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'admin': return 'bg-red-100 text-red-800 border-red-200'
      case 'doctor': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'nurse': return 'bg-green-100 text-green-800 border-green-200'
      case 'receptionist': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'patient': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'customer': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getResourceIcon = (resource: ResourceType) => {
    switch (resource) {
      case 'patient_records': return <UserIcon className="h-4 w-4" />
      case 'appointments': return <Clock className="h-4 w-4" />
      case 'inventory': return <Settings className="h-4 w-4" />
      case 'billing': return <Key className="h-4 w-4" />
      case 'reports': return <Eye className="h-4 w-4" />
      case 'user_management': return <Users className="h-4 w-4" />
      case 'system_settings': return <Settings className="h-4 w-4" />
      case 'audit_logs': return <Eye className="h-4 w-4" />
      case 'emergency_alerts': return <AlertTriangle className="h-4 w-4" />
      default: return <Shield className="h-4 w-4" />
    }
  }

  const getActionColor = (action: ActionType) => {
    switch (action) {
      case 'read': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'write': return 'bg-green-100 text-green-800 border-green-200'
      case 'delete': return 'bg-red-100 text-red-800 border-red-200'
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const filteredRules = permissionRules.filter(rule => {
    if (selectedRole !== 'all') {
      const user = users.find(u => u.id === rule.userId)
      return user?.role === selectedRole
    }
    if (selectedUser) {
      return rule.userId === selectedUser.id
    }
    return true
  })

  const handleCreateRule = () => {
    if (newRule.resource && newRule.action) {
      const rule: PermissionRule = {
        id: `rule_${Date.now()}`,
        userId: selectedUser?.id || '',
        resource: newRule.resource,
        action: newRule.action,
        conditions: newRule.conditions || [],
        expiresAt: newRule.expiresAt,
        createdAt: new Date(),
        createdBy: 'current_user' // In real app, get from auth context
      }
      setPermissionRules([...permissionRules, rule])
      setNewRule({
        resource: 'patient_records',
        action: 'read',
        conditions: [],
        expiresAt: null
      })
      setIsCreateDialogOpen(false)
    }
  }

  const handleEditRule = () => {
    if (editingRule) {
      setPermissionRules(permissionRules.map(rule =>
        rule.id === editingRule.id ? editingRule : rule
      ))
      setEditingRule(null)
      setIsEditDialogOpen(false)
    }
  }

  const handleDeleteRule = (ruleId: string) => {
    setPermissionRules(permissionRules.filter(rule => rule.id !== ruleId))
  }

  const addCondition = (rule: PermissionRule) => {
    const newConditions = [...(rule.conditions || []), { field: '', operator: 'equals', value: '' }]
    if (rule === editingRule) {
      setEditingRule({ ...rule, conditions: newConditions })
    } else {
      setNewRule({ ...newRule, conditions: newConditions })
    }
  }

  const updateCondition = (rule: PermissionRule, index: number, field: string, value: string) => {
    const conditions = [...(rule.conditions || [])]
    conditions[index] = { ...conditions[index], [field]: value }
    if (rule === editingRule) {
      setEditingRule({ ...rule, conditions })
    } else {
      setNewRule({ ...newRule, conditions })
    }
  }

  const removeCondition = (rule: PermissionRule, index: number) => {
    const conditions = (rule.conditions || []).filter((_, i) => i !== index)
    if (rule === editingRule) {
      setEditingRule({ ...rule, conditions })
    } else {
      setNewRule({ ...newRule, conditions })
    }
  }

  if (usersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading permission editor...</p>
        </div>
      </div>
    )
  }

  if (usersError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading users</p>
          <p className="text-sm text-muted-foreground">{usersError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Permission Editor</h2>
          <p className="text-muted-foreground mt-2">
            Manage role-based access control and user-specific permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={refreshUsers} variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Permission Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create Permission Rule</DialogTitle>
                <DialogDescription>
                  Define a new permission rule for a user or role
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="user">User</Label>
                    <Select value={selectedUser?.id || ''} onValueChange={(value) => {
                      const user = users.find(u => u.id === value)
                      setSelectedUser(user || null)
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="resource">Resource</Label>
                    <Select value={newRule.resource} onValueChange={(value: ResourceType) =>
                      setNewRule({ ...newRule, resource: value })
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {resources.map((resource) => (
                          <SelectItem key={resource} value={resource}>
                            {resource.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="action">Action</Label>
                  <Select value={newRule.action} onValueChange={(value: ActionType) =>
                    setNewRule({ ...newRule, action: value })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {actions.map((action) => (
                        <SelectItem key={action} value={action}>
                          {action.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
                  <Input
                    type="datetime-local"
                    value={newRule.expiresAt ? newRule.expiresAt.toISOString().slice(0, 16) : ''}
                    onChange={(e) => setNewRule({
                      ...newRule,
                      expiresAt: e.target.value ? new Date(e.target.value) : null
                    })}
                  />
                </div>
                <div>
                  <Label>Conditions</Label>
                  <div className="space-y-2 mt-2">
                    {(newRule.conditions || []).map((condition, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder="Field"
                          value={condition.field}
                          onChange={(e) => updateCondition(newRule as PermissionRule, index, 'field', e.target.value)}
                          className="flex-1"
                        />
                        <Select
                          value={condition.operator}
                          onValueChange={(value) => updateCondition(newRule as PermissionRule, index, 'operator', value)}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="contains">Contains</SelectItem>
                            <SelectItem value="starts_with">Starts With</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Value"
                          value={condition.value}
                          onChange={(e) => updateCondition(newRule as PermissionRule, index, 'value', e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCondition(newRule as PermissionRule, index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addCondition(newRule as PermissionRule)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Condition
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRule}>
                  Create Rule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="role-filter">Filter by Role</Label>
              <Select value={selectedRole} onValueChange={(value: UserRole | 'all') => setSelectedRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="nurse">Nurse</SelectItem>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="user-filter">Filter by User</Label>
              <Select value={selectedUser?.id || ''} onValueChange={(value) => {
                const user = users.find(u => u.id === value)
                setSelectedUser(user || null)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Users</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permission Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Rules ({filteredRules.length})</CardTitle>
          <CardDescription>
            Manage access control rules and conditional permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Conditions</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRules.map((rule) => {
                const user = users.find(u => u.id === rule.userId)
                return (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{user?.name || 'Unknown User'}</p>
                          <Badge className={getRoleColor(user?.role || 'patient')}>
                            {user?.role || 'patient'}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getResourceIcon(rule.resource)}
                        <span className="capitalize">{rule.resource.replace('_', ' ')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getActionColor(rule.action)}>
                        {rule.action.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {rule.conditions && rule.conditions.length > 0 ? (
                        <div className="space-y-1">
                          {rule.conditions.slice(0, 2).map((condition, index) => (
                            <div key={index} className="text-sm text-muted-foreground">
                              {condition.field} {condition.operator} "{condition.value}"
                            </div>
                          ))}
                          {rule.conditions.length > 2 && (
                            <div className="text-sm text-muted-foreground">
                              +{rule.conditions.length - 2} more conditions
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No conditions</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {rule.expiresAt ? (
                        <div className="text-sm">
                          <div>{rule.expiresAt.toLocaleDateString()}</div>
                          <div className="text-muted-foreground">
                            {rule.expiresAt < new Date() ? 'Expired' : 'Active'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog open={isEditDialogOpen && editingRule?.id === rule.id} onOpenChange={(open) => {
                          if (!open) {
                            setEditingRule(null)
                            setIsEditDialogOpen(false)
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingRule(rule)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>Edit Permission Rule</DialogTitle>
                              <DialogDescription>
                                Modify the permission rule settings
                              </DialogDescription>
                            </DialogHeader>
                            {editingRule && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Resource</Label>
                                    <Select value={editingRule.resource} onValueChange={(value: ResourceType) =>
                                      setEditingRule({ ...editingRule, resource: value })
                                    }>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {resources.map((resource) => (
                                          <SelectItem key={resource} value={resource}>
                                            {resource.replace('_', ' ')}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label>Action</Label>
                                    <Select value={editingRule.action} onValueChange={(value: ActionType) =>
                                      setEditingRule({ ...editingRule, action: value })
                                    }>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {actions.map((action) => (
                                          <SelectItem key={action} value={action}>
                                            {action.toUpperCase()}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div>
                                  <Label>Expiration Date (Optional)</Label>
                                  <Input
                                    type="datetime-local"
                                    value={editingRule.expiresAt ? editingRule.expiresAt.toISOString().slice(0, 16) : ''}
                                    onChange={(e) => setEditingRule({
                                      ...editingRule,
                                      expiresAt: e.target.value ? new Date(e.target.value) : null
                                    })}
                                  />
                                </div>
                                <div>
                                  <Label>Conditions</Label>
                                  <div className="space-y-2 mt-2">
                                    {(editingRule.conditions || []).map((condition, index) => (
                                      <div key={index} className="flex items-center gap-2">
                                        <Input
                                          placeholder="Field"
                                          value={condition.field}
                                          onChange={(e) => updateCondition(editingRule, index, 'field', e.target.value)}
                                          className="flex-1"
                                        />
                                        <Select
                                          value={condition.operator}
                                          onValueChange={(value) => updateCondition(editingRule, index, 'operator', value)}
                                        >
                                          <SelectTrigger className="w-24">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="equals">Equals</SelectItem>
                                            <SelectItem value="contains">Contains</SelectItem>
                                            <SelectItem value="starts_with">Starts With</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <Input
                                          placeholder="Value"
                                          value={condition.value}
                                          onChange={(e) => updateCondition(editingRule, index, 'value', e.target.value)}
                                          className="flex-1"
                                        />
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeCondition(editingRule, index)}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => addCondition(editingRule)}
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add Condition
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <Button variant="outline" onClick={() => {
                                setEditingRule(null)
                                setIsEditDialogOpen(false)
                              }}>
                                Cancel
                              </Button>
                              <Button onClick={handleEditRule}>
                                Save Changes
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Permission Rule</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this permission rule? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteRule(rule.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Rule
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
