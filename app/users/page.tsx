'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Loader2, Search, UserPlus, Shield, Users as UsersIcon } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

interface User {
  id: string
  email: string
  role: string
  clinic_id?: string
  created_at: string
  last_sign_in_at?: string
  email_confirmed_at?: string
}

function UsersManagementContent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    } else if (!loading && user && user.role !== 'super_admin') {
      router.push('/dashboard')
    }
  }, [loading, user, router])

  useEffect(() => {
    async function loadUsers() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/users')
        
        if (!response.ok) {
          throw new Error('Failed to load users')
        }
        
        const data = await response.json()
        setUsers(data.users || [])
      } catch (err) {
        console.error('Failed to load users:', err)
        setError('Failed to load users. This feature may need API implementation.')
        setUsers([
          {
            id: '1',
            email: 'admin@ai367bar.com',
            role: 'super_admin',
            created_at: '2024-01-01T00:00:00Z',
            email_confirmed_at: '2024-01-01T00:00:00Z',
          },
          {
            id: '2',
            email: 'clinic-owner@example.com',
            role: 'clinic_owner',
            clinic_id: 'clinic_001',
            created_at: '2024-01-15T00:00:00Z',
            email_confirmed_at: '2024-01-15T00:00:00Z',
          },
          {
            id: '3',
            email: 'sales@example.com',
            role: 'sales_staff',
            created_at: '2024-02-01T00:00:00Z',
            email_confirmed_at: '2024-02-01T00:00:00Z',
          },
          {
            id: '4',
            email: 'customer@example.com',
            role: 'customer',
            created_at: '2024-02-15T00:00:00Z',
            email_confirmed_at: '2024-02-15T00:00:00Z',
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    if (!loading && user && user.role === 'super_admin') {
      loadUsers()
    }
  }, [loading, user])

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user || user.role !== 'super_admin') {
    return null
  }

  const getRoleBadge = (role: string) => {
    const variants = {
      super_admin: { label: 'Super Admin', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
      clinic_owner: { label: 'Clinic Owner', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
      clinic_admin: { label: 'Clinic Admin', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
      clinic_staff: { label: 'Clinic Staff', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
      sales_staff: { label: 'Sales Staff', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
      customer: { label: 'Customer', color: 'bg-pink-500/10 text-pink-500 border-pink-500/20' },
    } as const

    const roleInfo = variants[role as keyof typeof variants] || { 
      label: role, 
      color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' 
    }

    return (
      <Badge variant="outline" className={roleInfo.color}>
        {roleInfo.label}
      </Badge>
    )
  }

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.id.includes(searchQuery)
  )

  const roleStats = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <UsersIcon className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">User Management</h1>
          </div>
          <p className="text-muted-foreground">
            Manage all users across the platform
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <UsersIcon className="w-4 h-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Admins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {(roleStats.super_admin || 0) + (roleStats.clinic_owner || 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {(roleStats.clinic_staff || 0) + (roleStats.sales_staff || 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {roleStats.customer || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Actions */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email, role, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users ({filteredUsers.length})</CardTitle>
            <CardDescription>
              Complete list of users registered in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Clinic ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No users found matching your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.email}</TableCell>
                        <TableCell>{getRoleBadge(u.role)}</TableCell>
                        <TableCell>
                          {u.clinic_id ? (
                            <span className="text-xs font-mono">{u.clinic_id}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {u.email_confirmed_at ? (
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(u.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {u.last_sign_in_at ? (
                            new Date(u.last_sign_in_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })
                          ) : (
                            <span className="text-muted-foreground">Never</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

export default function UsersManagementPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <UsersManagementContent />
    </Suspense>
  )
}
