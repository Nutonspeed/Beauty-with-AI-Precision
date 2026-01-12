'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Plus, Search, Edit, Lock, Unlock, Shield, User } from 'lucide-react'
import { useUsers } from '@/hooks/useSecurity'
import { UserRole } from '@/lib/security/security-manager'

export default function UserManagement() {
  const t = useTranslations()
  const { users, loading, error, createUser, updateUser, lockAccount, unlockAccount } = useUsers()
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'locked'>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'customer' as UserRole,
    department: '',
    password: '',
    confirmPassword: '',
  })

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'locked' && user.accountLocked) ||
                         (statusFilter === 'active' && !user.accountLocked)
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleCreateUser = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert(t('userManagement.alerts.passwordsNoMatch'))
      return
    }

    try {
      await createUser({
        email: formData.email,
        name: formData.name,
        role: formData.role,
        department: formData.department || undefined,
        permissions: [],
        mfaEnabled: false,
      })

      setIsCreateDialogOpen(false)
      resetForm()
    } catch (err) {
      alert(t('userManagement.alerts.createFailed', { error: (err as Error).message }))
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser) return

    try {
      await updateUser(selectedUser.id, {
        name: formData.name,
        role: formData.role,
        department: formData.department || undefined,
      })

      setIsEditDialogOpen(false)
      setSelectedUser(null)
      resetForm()
    } catch (err) {
      alert(t('userManagement.alerts.updateFailed', { error: (err as Error).message }))
    }
  }

  const handleLockAccount = async (userId: string) => {
    try {
      await lockAccount(userId)
    } catch (err) {
      alert(t('userManagement.alerts.lockFailed', { error: (err as Error).message }))
    }
  }

  const handleUnlockAccount = async (userId: string) => {
    try {
      await unlockAccount(userId)
    } catch (err) {
      alert(t('userManagement.alerts.unlockFailed', { error: (err as Error).message }))
    }
  }

  const openEditDialog = (user: any) => {
    setSelectedUser(user)
    setFormData({
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department || '',
      password: '',
      confirmPassword: '',
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      role: 'customer',
      department: '',
      password: '',
      confirmPassword: '',
    })
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800 border-red-200'
      case 'center_admin': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'center_owner': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'center_staff': return 'bg-green-100 text-green-800 border-green-200'
      case 'sales_staff': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'customer': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'customer_elite': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">{t('userManagement.alerts.loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading users</p>
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
          <h2 className="text-3xl font-bold tracking-tight">{t('userManagement.title')}</h2>
          <p className="text-muted-foreground mt-2">
            {t('userManagement.description')}
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('userManagement.addUser')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t('userManagement.createUser')}</DialogTitle>
              <DialogDescription>
                {t('userManagement.createDesc')}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">{t('userManagement.form.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  className="col-span-3"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">{t('userManagement.form.name')}</Label>
                <Input
                  id="name"
                  className="col-span-3"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">{t('userManagement.form.role')}</Label>
                <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({...formData, role: value})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">{t('userManagement.roles.super_admin')}</SelectItem>
                    <SelectItem value="center_admin">{t('userManagement.roles.center_admin')}</SelectItem>
                    <SelectItem value="center_owner">{t('userManagement.roles.center_owner')}</SelectItem>
                    <SelectItem value="center_staff">{t('userManagement.roles.center_staff')}</SelectItem>
                    <SelectItem value="sales_staff">{t('userManagement.roles.sales_staff')}</SelectItem>
                    <SelectItem value="customer">{t('userManagement.roles.customer')}</SelectItem>
                    <SelectItem value="customer_elite">{t('userManagement.roles.customer_elite')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">{t('userManagement.form.department')}</Label>
                <Input
                  id="department"
                  className="col-span-3"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  placeholder={t('userManagement.form.optional')}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreateUser}>{t('userManagement.form.create')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('userManagement.filters.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={(value: any) => setRoleFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('userManagement.filters.allRoles')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('userManagement.filters.allRoles')}</SelectItem>
                <SelectItem value="super_admin">{t('userManagement.roles.super_admin')}</SelectItem>
                <SelectItem value="center_admin">{t('userManagement.roles.center_admin')}</SelectItem>
                <SelectItem value="center_owner">{t('userManagement.roles.center_owner')}</SelectItem>
                <SelectItem value="center_staff">{t('userManagement.roles.center_staff')}</SelectItem>
                <SelectItem value="sales_staff">{t('userManagement.roles.sales_staff')}</SelectItem>
                <SelectItem value="customer">{t('userManagement.roles.customer')}</SelectItem>
                <SelectItem value="customer_elite">{t('userManagement.roles.customer_elite')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t('userManagement.filters.allStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('userManagement.filters.allStatus')}</SelectItem>
                <SelectItem value="active">{t('userManagement.filters.active')}</SelectItem>
                <SelectItem value="locked">{t('userManagement.filters.locked')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('userManagement.title')} ({filteredUsers.length})</CardTitle>
          <CardDescription>
            {t('userManagement.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('userManagement.table.user')}</TableHead>
                <TableHead>{t('userManagement.table.role')}</TableHead>
                <TableHead>{t('userManagement.table.department')}</TableHead>
                <TableHead>{t('userManagement.table.status')}</TableHead>
                <TableHead>{t('userManagement.table.lastLogin')}</TableHead>
                <TableHead>{t('userManagement.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {t(`userManagement.roles.${user.role}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.department || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.accountLocked ? (
                        <Badge variant="destructive">{t('userManagement.table.locked')}</Badge>
                      ) : (
                        <Badge variant="default">{t('userManagement.table.active')}</Badge>
                      )}
                      {user.mfaEnabled && (
                        <Shield className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.lastLogin ? (
                      <div className="text-sm">
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">{t('userManagement.table.never')}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {user.accountLocked ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnlockAccount(user.id)}
                        >
                          <Unlock className="h-4 w-4" />
                        </Button>
                      ) : (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Lock className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('userManagement.confirm.lockTitle')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('userManagement.confirm.lockDesc', { name: user.name })}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('userManagement.confirm.cancel')}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleLockAccount(user.id)}>
                                {t('userManagement.confirm.confirm')}
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

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('userManagement.editUser')}</DialogTitle>
            <DialogDescription>
              {t('userManagement.editDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">{t('userManagement.form.email')}</Label>
              <Input
                id="edit-email"
                type="email"
                className="col-span-3"
                value={formData.email}
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">{t('userManagement.form.name')}</Label>
              <Input
                id="edit-name"
                className="col-span-3"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right">{t('userManagement.form.role')}</Label>
              <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({...formData, role: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">{t('userManagement.roles.super_admin')}</SelectItem>
                  <SelectItem value="admin">{t('userManagement.roles.admin')}</SelectItem>
                  <SelectItem value="specialist">{t('userManagement.roles.specialist')}</SelectItem>
                  <SelectItem value="assistant">{t('userManagement.roles.assistant')}</SelectItem>
                  <SelectItem value="receptionist">{t('userManagement.roles.receptionist')}</SelectItem>
                  <SelectItem value="customer">{t('userManagement.roles.customer')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-department" className="text-right">{t('userManagement.form.department')}</Label>
              <Input
                id="edit-department"
                className="col-span-3"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                placeholder={t('userManagement.form.optional')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleEditUser}>{t('userManagement.form.update')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
