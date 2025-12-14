'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import type { Tenant } from '@/lib/types/tenant'
import { Loader2, Activity, Building2, Send, TrendingUp, Shield, Brain, CreditCard, FileText, Users, Settings } from 'lucide-react'
import { SystemHealthMonitor } from '@/components/admin/system-health-monitor'
import RevenueAnalytics from '@/components/admin/revenue-analytics'
import EnhancedClinicManagement from '@/components/admin/enhanced-clinic-management'
import SecurityMonitoring from '@/components/admin/security-monitoring'
import AIAnalyticsDashboard from '@/components/admin/ai-analytics-dashboard'
import SubscriptionManagement from '@/components/admin/subscription-management'
import ActivityLogsDashboard from '@/components/admin/activity-logs-dashboard'
import GlobalUserManagement from '@/components/admin/global-user-management'
import SystemSettingsManagement from '@/components/admin/system-settings-management'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

interface Invitation {
  id: string
  email: string
  invited_role: string
  clinic_id: string | null
  status: 'pending' | 'accepted' | 'expired' | 'revoked'
  created_at: string
  expires_at: string
  accepted_at: string | null
  invited_by: string
  clinics?: { name: string }
  inviter?: { full_name: string; email: string }
}

function SuperAdminDashboardContent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Invitation management state
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [invitationsLoading, setInvitationsLoading] = useState(true)
  const [invitationFilter, setInvitationFilter] = useState<string>('all')
  const [resendingId, setResendingId] = useState<string | null>(null)
  const [revokingId, setRevokingId] = useState<string | null>(null)

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
    async function loadInvitations() {
      try {
        setInvitationsLoading(true)
        const response = await fetch('/api/invitations')
        if (response.ok) {
          const data = await response.json()
          setInvitations(data.invitations || [])
        }
      } catch (error) {
        console.error('Failed to load invitations:', error)
      } finally {
        setInvitationsLoading(false)
      }
    }

    if (user?.role === 'super_admin') {
      loadInvitations()
    }
  }, [user])

  useEffect(() => {
    async function loadTenants() {
      try {
        const response = await fetch('/api/tenant')
        if (!response.ok) {
          console.error('Failed to load tenants:', response.status)
          setIsLoading(false)
          return
        }
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
    } else if (!loading) {
      // Not super admin or not logged in - stop loading
      setIsLoading(false)
    }
  }, [loading, user])

  const handleResendInvitation = async (invitationId: string) => {
    try {
      setResendingId(invitationId)
      const response = await fetch('/api/invitations/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: invitationId }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: '✅ Invitation Resent',
          description: data.warning || 'Invitation email has been resent successfully with new expiry date.',
          variant: 'default',
        })
        // Reload invitations
        const invitesResponse = await fetch('/api/invitations')
        if (invitesResponse.ok) {
          const invitesData = await invitesResponse.json()
          setInvitations(invitesData.invitations || [])
        }
      } else {
        const error = await response.json()
        toast({
          title: '❌ Failed to Resend',
          description: error.error || 'Could not resend the invitation email.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to resend invitation:', error)
      toast({
        title: '❌ Error',
        description: 'An unexpected error occurred while resending invitation.',
        variant: 'destructive',
      })
    } finally {
      setResendingId(null)
    }
  }

  const handleRevokeInvitation = async (invitationId: string) => {
    if (!confirm('Are you sure you want to revoke this invitation?')) {
      return
    }

    try {
      setRevokingId(invitationId)
      const response = await fetch('/api/invitations/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: invitationId }),
      })

      if (response.ok) {
        toast({
          title: '✅ Invitation Revoked',
          description: 'The invitation has been revoked successfully.',
          variant: 'default',
        })
        // Reload invitations
        const invitesResponse = await fetch('/api/invitations')
        if (invitesResponse.ok) {
          const invitesData = await invitesResponse.json()
          setInvitations(invitesData.invitations || [])
        }
      } else {
        const error = await response.json()
        toast({
          title: '❌ Failed to Revoke',
          description: error.error || 'Could not revoke the invitation.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to revoke invitation:', error)
      toast({
        title: '❌ Error',
        description: 'An unexpected error occurred while revoking invitation.',
        variant: 'destructive',
      })
    } finally {
      setRevokingId(null)
    }
  }

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Step 1: Create tenant/clinic
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
        toast({
          title: '❌ Failed to Create Clinic',
          description: error.error || 'Could not create the clinic. Please try again.',
          variant: 'destructive',
        })
        return
      }

      const tenantData = await response.json()
      const clinicId = tenantData.tenant?.id

      // Step 2: Create invitation for clinic owner
      if (clinicId && formData.email) {
        try {
          const inviteResponse = await fetch('/api/invitations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: formData.email,
              invited_role: 'clinic_owner',
              clinic_id: clinicId,
              metadata: {
                clinic_name: formData.clinicName,
                created_by: 'super_admin'
              }
            }),
          })

          if (inviteResponse.ok) {
            await inviteResponse.json()
            toast({
              title: '✅ Clinic Created Successfully',
              description: `Invitation email sent to ${formData.email}. Check the invitation link in the table below.`,
              variant: 'default',
            })
          } else {
            const inviteError = await inviteResponse.json()
            toast({
              title: '⚠️ Clinic Created',
              description: `Clinic created but failed to send invitation: ${inviteError.error}. Please create invitation manually.`,
              variant: 'default',
            })
          }
        } catch (inviteError) {
          console.error('Failed to send invitation:', inviteError)
          toast({
            title: '⚠️ Clinic Created',
            description: 'Clinic created but failed to send invitation. Please create invitation manually.',
            variant: 'default',
          })
        }
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
      toast({
        title: '❌ Error',
        description: 'An unexpected error occurred while creating the clinic.',
        variant: 'destructive',
      })
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
          <p className="text-muted-foreground">Manage all clinic tenants and monitor system health</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-10 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="gap-2">
              <Building2 className="w-4 h-4" />
              Clinic Management
            </TabsTrigger>
            <TabsTrigger value="health" className="gap-2">
              <Activity className="w-4 h-4" />
              System Health
            </TabsTrigger>
            <TabsTrigger value="revenue" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Revenue & Billing
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="ai-analytics" className="gap-2">
              <Brain className="w-4 h-4" />
              AI Analytics
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="gap-2">
              <CreditCard className="w-4 h-4" />
              Subscriptions
            </TabsTrigger>
            <TabsTrigger value="invitations" className="gap-2">
              <Send className="w-4 h-4" />
              Invitations
            </TabsTrigger>
            <TabsTrigger value="activity-logs" className="gap-2">
              <FileText className="w-4 h-4" />
              Activity Logs
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Clinic Management Tab */}
          <TabsContent value="overview" className="space-y-6">
            <EnhancedClinicManagement />
          </TabsContent>

          {/* System Health Tab */}
          <TabsContent value="health">
            <SystemHealthMonitor />
          </TabsContent>

          {/* Revenue & Billing Tab */}
          <TabsContent value="revenue">
            <RevenueAnalytics />
          </TabsContent>

          {/* Security Monitoring Tab */}
          <TabsContent value="security">
            <SecurityMonitoring />
          </TabsContent>

          {/* AI Analytics Tab */}
          <TabsContent value="ai-analytics">
            <AIAnalyticsDashboard />
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions">
            <SubscriptionManagement />
          </TabsContent>

          {/* Activity Logs Tab */}
          <TabsContent value="activity-logs">
            <ActivityLogsDashboard />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <GlobalUserManagement />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <SystemSettingsManagement />
          </TabsContent>

          {/* Invitations Tab */}
          <TabsContent value="invitations" className="space-y-6">{/* Invitation Management Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Invitation Management</h2>
            <Select value={invitationFilter} onValueChange={setInvitationFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Invitations</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {invitationsLoading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-2">Loading invitations...</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {invitations
                .filter(inv => invitationFilter === 'all' || inv.status === invitationFilter)
                .map((invitation) => {
                  const roleColors: Record<string, string> = {
                    super_admin: 'bg-purple-100 text-purple-800',
                    clinic_owner: 'bg-blue-100 text-blue-800',
                    clinic_manager: 'bg-indigo-100 text-indigo-800',
                    clinic_staff: 'bg-green-100 text-green-800',
                    sales_staff: 'bg-yellow-100 text-yellow-800',
                    customer: 'bg-gray-100 text-gray-800',
                  }

                  const statusColors: Record<string, string> = {
                    pending: 'bg-yellow-100 text-yellow-800',
                    accepted: 'bg-green-100 text-green-800',
                    expired: 'bg-red-100 text-red-800',
                    revoked: 'bg-gray-100 text-gray-800',
                  }

                  const roleNames: Record<string, string> = {
                    super_admin: 'Super Admin',
                    clinic_owner: 'Clinic Owner',
                    clinic_manager: 'Clinic Manager',
                    clinic_staff: 'Clinic Staff',
                    sales_staff: 'Sales Staff',
                    customer: 'Customer',
                  }

                  const isExpired = new Date(invitation.expires_at) < new Date()
                  const actualStatus = isExpired && invitation.status === 'pending' ? 'expired' : invitation.status

                  return (
                    <Card key={invitation.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">{invitation.email}</span>
                              <Badge className={roleColors[invitation.invited_role] || 'bg-gray-100'}>
                                {roleNames[invitation.invited_role] || invitation.invited_role}
                              </Badge>
                              <Badge className={statusColors[actualStatus] || 'bg-gray-100'}>
                                {actualStatus.toUpperCase()}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                              {invitation.clinics && (
                                <div>
                                  <span className="font-medium">Clinic:</span> {invitation.clinics.name}
                                </div>
                              )}
                              {invitation.inviter && (
                                <div>
                                  <span className="font-medium">Invited by:</span> {invitation.inviter.full_name}
                                </div>
                              )}
                              <div>
                                <span className="font-medium">Sent:</span>{' '}
                                {new Date(invitation.created_at).toLocaleDateString('th-TH', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                              <div>
                                <span className="font-medium">Expires:</span>{' '}
                                <span className={isExpired ? 'text-red-600 font-semibold' : ''}>
                                  {new Date(invitation.expires_at).toLocaleDateString('th-TH', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              {invitation.accepted_at && (
                                <div>
                                  <span className="font-medium">Accepted:</span>{' '}
                                  {new Date(invitation.accepted_at).toLocaleDateString('th-TH', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 ml-4">
                            {(invitation.status === 'pending' || actualStatus === 'expired') && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleResendInvitation(invitation.id)}
                                  disabled={resendingId === invitation.id}
                                >
                                  {resendingId === invitation.id ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                      Sending...
                                    </>
                                  ) : (
                                    'Resend'
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRevokeInvitation(invitation.id)}
                                  disabled={revokingId === invitation.id}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  {revokingId === invitation.id ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                      Revoking...
                                    </>
                                  ) : (
                                    'Revoke'
                                  )}
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}

              {invitations.filter(inv => invitationFilter === 'all' || inv.status === invitationFilter).length === 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8 text-muted-foreground">
                      No invitations found
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
          </TabsContent>
        </Tabs>
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
