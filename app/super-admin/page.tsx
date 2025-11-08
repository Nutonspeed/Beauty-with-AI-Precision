'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Tenant } from '@/lib/types/tenant'
import { Loader2 } from 'lucide-react'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

function SuperAdminDashboardContent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    clinicName: '',
    slug: '',
    email: '',
    phone: '',
    plan: 'starter' as 'starter' | 'professional' | 'enterprise',
    primaryColor: '#8B5CF6',
    secondaryColor: '#EC4899',
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    } else if (!loading && user && user.role !== 'super_admin') {
      router.push('/customer/dashboard')
    }
  }, [loading, user, router])

  useEffect(() => {
    async function loadTenants() {
      try {
        const response = await fetch('/api/tenant')
        const data = await response.json()
        setTenants(data.tenants || [])
      } catch (error) {
        console.error('Failed to load tenants:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (!loading && user && user.role === 'super_admin') {
      loadTenants()
    }
  }, [loading, user])

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ownerId: user?.id || 'super_admin_001',
          branding: {
            primaryColor: formData.primaryColor,
            secondaryColor: formData.secondaryColor,
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || 'Failed to create tenant')
        return
      }

      // Reload tenants
      const tenantsResponse = await fetch('/api/tenant')
      const data = await tenantsResponse.json()
      setTenants(data.tenants || [])

      // Reset form
      setFormData({
        clinicName: '',
        slug: '',
        email: '',
        phone: '',
        plan: 'starter',
        primaryColor: '#8B5CF6',
        secondaryColor: '#EC4899',
      })
      setShowCreateForm(false)
    } catch (error) {
      console.error('Failed to create tenant:', error)
      alert('Failed to create tenant')
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user || user.role !== 'super_admin') {
    return null
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      trial: 'secondary',
      suspended: 'destructive',
      cancelled: 'outline',
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>{status}</Badge>
  }

  const getPlanBadge = (plan: string) => {
    const colors = {
      starter: 'bg-blue-500/10 text-blue-500',
      professional: 'bg-purple-500/10 text-purple-500',
      enterprise: 'bg-orange-500/10 text-orange-500',
    } as const

    return (
      <Badge className={colors[plan as keyof typeof colors] || 'bg-gray-500/10 text-gray-500'}>
        {plan}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage all clinic tenants from a single interface</p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tenants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tenants.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {tenants.filter((t) => t.isActive && t.subscription.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Trial</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {tenants.filter((t) => t.isTrial).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tenants.reduce((sum, t) => sum + t.usage.currentUsers, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Tenant Button */}
        <div className="mb-6">
          <Button onClick={() => setShowCreateForm(!showCreateForm)} size="lg">
            {showCreateForm ? 'Cancel' : '+ Create New Tenant'}
          </Button>
        </div>

        {/* Create Tenant Form */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Tenant</CardTitle>
              <CardDescription>Set up a new clinic in the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTenant} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="clinicName">Clinic Name *</Label>
                    <Input
                      id="clinicName"
                      value={formData.clinicName}
                      onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                      required
                      placeholder="Beauty Clinic Bangkok"
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                        })
                      }
                      required
                      placeholder="beauty-clinic-bkk"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder="contact@clinic.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      placeholder="+66-2-123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="plan">Plan *</Label>
                    <Select
                      value={formData.plan}
                      onValueChange={(value: 'starter' | 'professional' | 'enterprise') =>
                        setFormData({ ...formData, plan: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="starter">Starter - ฿2,900/mo</SelectItem>
                        <SelectItem value="professional">Professional - ฿9,900/mo</SelectItem>
                        <SelectItem value="enterprise">Enterprise - ฿29,900/mo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <Input
                      id="primaryColor"
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    />
                  </div>
                </div>
                <Button type="submit" size="lg">
                  Create Tenant
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Tenants List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">All Tenants</h2>
          {tenants.map((tenant) => (
            <Card key={tenant.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {tenant.settings.clinicName}
                      {getStatusBadge(tenant.subscription.status)}
                      {getPlanBadge(tenant.subscription.plan)}
                      {tenant.isTrial && <Badge variant="outline">TRIAL</Badge>}
                    </CardTitle>
                    <CardDescription>
                      {tenant.slug} • {tenant.settings.email}
                    </CardDescription>
                  </div>
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: tenant.branding.primaryColor }}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Users</div>
                    <div className="text-lg font-semibold">
                      {tenant.usage.currentUsers}
                      {tenant.features.maxUsers !== -1 && (
                        <span className="text-sm text-muted-foreground">
                          {' '}
                          / {tenant.features.maxUsers}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Customers</div>
                    <div className="text-lg font-semibold">
                      {tenant.usage.currentCustomers}
                      {tenant.features.maxCustomersPerMonth !== -1 && (
                        <span className="text-sm text-muted-foreground">
                          {' '}
                          / {tenant.features.maxCustomersPerMonth}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Storage</div>
                    <div className="text-lg font-semibold">
                      {tenant.usage.storageUsedGB.toFixed(1)} GB
                      <span className="text-sm text-muted-foreground">
                        {' '}
                        / {tenant.features.maxStorageGB} GB
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">API Calls</div>
                    <div className="text-lg font-semibold">
                      {tenant.usage.apiCallsThisMonth.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Edit Settings
                  </Button>
                  <Button variant="outline" size="sm">
                    Manage Users
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function SuperAdminDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <SuperAdminDashboardContent />
    </Suspense>
  )
}
