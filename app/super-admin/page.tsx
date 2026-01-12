'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Header as PremiumHeader } from '@/components/header'
import { Footer as PremiumFooter } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import type { Tenant } from '@/lib/types/tenant'
import { Loader2, Activity, Building2, Send, TrendingUp, Shield, Brain, CreditCard, FileText, Users, Settings } from 'lucide-react'
import { SystemHealthMonitor } from '@/components/admin/system-health-monitor'
import RevenueAnalytics from '@/components/admin/revenue-analytics'
import EnhancedCenterManagement from '@/components/admin/enhanced-center-management'
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
  center_id: string | null
  status: 'pending' | 'accepted' | 'expired' | 'revoked'
  created_at: string
  expires_at: string
  accepted_at: string | null
  invited_by: string
  centers?: { name: string }
  inviter?: { full_name: string; email: string }
  neural_health: string;
  synaptic_intelligence: string;
  autonomous_ops: string;
  security_orchestration: string;
  strategic_growth: string;
  center_registry: string;
  operational_units: string;
  global_yield: string;
  system_cycles: string;
  node_synchronization: string;
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
    centerName: '',
    slug: '',
    email: '',
    phone: '',
    plan: 'starter' as 'starter' | 'professional' | 'enterprise',
    primaryColor: '#8B5CF6',
    secondaryColor: '#EC4899',
  })

  useEffect(() => {
    if (loading) return
    const enforceRole = async () => {
      if (!user) {
        router.push('/auth/login')
        return
      }
      try {
        const res = await fetch('/api/auth/check-role', { headers: { Accept: 'application/json' } })
        if (!res.ok) {
          router.push('/unauthorized')
          return
        }
        const data = await res.json()
        if (data.role !== 'super_admin') {
          router.push('/unauthorized')
        }
      } catch (err) {
        console.error('role check error', err)
        router.push('/unauthorized')
      }
    }
    enforceRole()
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
      // Step 1: Create tenant/center
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
          title: '❌ Failed to Create Center',
          description: error.error || 'Could not create the center. Please try again.',
          variant: 'destructive',
        })
        return
      }

      const tenantData = await response.json()
      const centerId = tenantData.tenant?.id

      // Step 2: Create invitation for center owner
      if (centerId && formData.email) {
        try {
          const inviteResponse = await fetch('/api/invitations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: formData.email,
              invited_role: 'center_owner',
              center_id: centerId,
              metadata: {
                center_name: formData.centerName,
                created_by: 'super_admin'
              }
            }),
          })

          if (inviteResponse.ok) {
            await inviteResponse.json()
            toast({
              title: '✅ Center Created Successfully',
              description: `Invitation email sent to ${formData.email}. Check the invitation link in the table below.`,
              variant: 'default',
            })
          } else {
            const inviteError = await inviteResponse.json()
            toast({
              title: '⚠️ Center Created',
              description: `Center created but failed to send invitation: ${inviteError.error}. Please create invitation manually.`,
              variant: 'default',
            })
          }
        } catch (inviteError) {
          console.error('Failed to send invitation:', inviteError)
          toast({
            title: '⚠️ Center Created',
            description: 'Center created but failed to send invitation. Please create invitation manually.',
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
        centerName: '',
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
        description: 'An unexpected error occurred while creating the center.',
        variant: 'destructive',
      })
    }
  }

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-pink-500" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 animate-pulse">Initializing Elite Command...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'super_admin') {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#020617] text-slate-200 selection:bg-pink-500/30">
      <PremiumHeader />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto flex-1">
          {/* Dashboard Header Interface */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 pb-12 border-b border-white/5"
          >
            <Badge variant="outline" className="px-4 py-1 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10">
              <Shield className="mr-3 h-3.5 w-3.5 animate-pulse" />
              Elite System Orchestration Node
            </Badge>
            <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9] italic">
              Super Admin<br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent not-italic">Dashboard</span>
            </h1>
            <p className="text-xl text-slate-500 font-light tracking-widest max-w-2xl italic leading-relaxed">
              Command and monitor global center infrastructure and establish system-wide operational parameters.
            </p>
          </motion.div>

          <Tabs defaultValue="overview" className="space-y-12">
            <div className="flex items-center justify-start overflow-x-auto pb-4 scrollbar-hide">
              <TabsList className="bg-white/[0.02] border border-white/5 p-1.5 rounded-2xl h-auto gap-2 flex-nowrap">
                {[
                  { value: 'overview', icon: Building2, label: 'Centers' },
                  { value: 'health', icon: Activity, label: 'Health' },
                  { value: 'revenue', icon: TrendingUp, label: 'Revenue' },
                  { value: 'security', icon: Shield, label: 'Security' },
                  { value: 'ai-analytics', icon: Brain, label: 'AI' },
                  { value: 'subscriptions', icon: CreditCard, label: 'Plans' },
                  { value: 'invitations', icon: Send, label: 'Invites' },
                  { value: 'activity-logs', icon: FileText, label: 'Logs' },
                  { value: 'users', icon: Users, label: 'Users' },
                  { value: 'settings', icon: Settings, label: 'Settings' }
                ].map((tab) => (
                  <TabsTrigger 
                    key={tab.value}
                    value={tab.value} 
                    className="rounded-xl px-6 py-3 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.15em] text-[10px] italic flex items-center gap-3 whitespace-nowrap"
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Centers Tab */}
                <TabsContent value="overview" className="mt-0 outline-none">
                  <EnhancedCenterManagement />
                </TabsContent>

                {/* Health Tab */}
                <TabsContent value="health" className="mt-0 outline-none">
                  <SystemHealthMonitor />
                </TabsContent>

                {/* Revenue Tab */}
                <TabsContent value="revenue" className="mt-0 outline-none">
                  <RevenueAnalytics />
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="mt-0 outline-none">
                  <SecurityMonitoring />
                </TabsContent>

                {/* AI Tab */}
                <TabsContent value="ai-analytics" className="mt-0 outline-none">
                  <AIAnalyticsDashboard />
                </TabsContent>

                {/* Subscriptions Tab */}
                <TabsContent value="subscriptions" className="mt-0 outline-none">
                  <SubscriptionManagement />
                </TabsContent>

                {/* Invitations Tab */}
                <TabsContent value="invitations" className="mt-0 outline-none space-y-10">
                  <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-row items-center justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-3xl font-bold text-white tracking-tight italic">Invitation Management</CardTitle>
                        <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Authorize global center access vectors</CardDescription>
                      </div>
                      <Select value={invitationFilter} onValueChange={setInvitationFilter}>
                        <SelectTrigger className="w-[200px] h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white focus:ring-pink-500/20 focus:border-pink-500/30 transition-all px-6 text-[10px] font-black uppercase tracking-widest italic">
                          <SelectValue placeholder="Filter Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#020617] border-white/10 rounded-2xl">
                          <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest italic">ALL_NODES</SelectItem>
                          <SelectItem value="pending" className="text-[10px] font-black uppercase tracking-widest italic">PENDING</SelectItem>
                          <SelectItem value="accepted" className="text-[10px] font-black uppercase tracking-widest italic">VERIFIED</SelectItem>
                          <SelectItem value="expired" className="text-[10px] font-black uppercase tracking-widest italic">EXPIRED</SelectItem>
                          <SelectItem value="revoked" className="text-[10px] font-black uppercase tracking-widest italic">REVOKED</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardHeader>
                    <CardContent className="p-10 lg:p-12">
                      {invitationsLoading ? (
                        <div className="py-20 text-center space-y-6">
                          <Loader2 className="mx-auto h-12 w-12 text-pink-500 animate-spin" />
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 animate-pulse">Syncing Invitation Nodes...</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {invitations
                            .filter(inv => invitationFilter === 'all' || inv.status === invitationFilter)
                            .map((invitation) => {
                              const isExpired = new Date(invitation.expires_at) < new Date()
                              const actualStatus = isExpired && invitation.status === 'pending' ? 'expired' : invitation.status
                              
                              return (
                                <div key={invitation.id} className="group/item flex items-center justify-between p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-pink-500/20 transition-all duration-500 relative overflow-hidden">
                                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-pink-600/20 group-hover/item:bg-pink-600 transition-colors" />
                                  <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-6">
                                      <div className="h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner">
                                        <Send className="h-6 w-6 text-slate-500 group-hover/item:text-pink-400 transition-colors" />
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-xl font-bold text-white italic group-hover/item:text-pink-400 transition-colors">{invitation.email}</p>
                                        <div className="flex gap-3">
                                          <Badge className="bg-white/[0.03] text-slate-400 border-none rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest italic">{invitation.invited_role}</Badge>
                                          <Badge className={cn("px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-none shadow-inner", 
                                            actualStatus === 'accepted' ? "bg-emerald-500/10 text-emerald-400" : 
                                            actualStatus === 'expired' ? "bg-rose-500/10 text-rose-400" : "bg-amber-500/10 text-amber-400"
                                          )}>
                                            {actualStatus.toUpperCase()}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pl-18">
                                      {invitation.centers && (
                                        <div className="space-y-1">
                                          <p className="text-[8px] font-black uppercase tracking-widest text-slate-600">Center Node</p>
                                          <p className="text-xs text-slate-400 italic font-bold">{invitation.centers.name}</p>
                                        </div>
                                      )}
                                      <div className="space-y-1">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-600">Temporal Stamp</p>
                                        <p className="text-xs text-slate-400 italic font-bold">SENT: {new Date(invitation.created_at).toLocaleDateString()}</p>
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-600">Expiry Vector</p>
                                        <p className={cn("text-xs italic font-bold", isExpired ? "text-rose-500" : "text-slate-400")}>{new Date(invitation.expires_at).toLocaleDateString()}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-3 ml-10">
                                    {(invitation.status === 'pending' || actualStatus === 'expired') && (
                                      <>
                                        <Button variant="outline" className="h-12 px-6 rounded-xl border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest italic hover:bg-white/10" onClick={() => handleResendInvitation(invitation.id)} disabled={resendingId === invitation.id}>
                                          {resendingId === invitation.id ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                                          Resend
                                        </Button>
                                        <Button variant="ghost" className="h-12 px-6 rounded-xl text-[9px] font-black uppercase tracking-widest italic text-rose-500 hover:bg-rose-500/10" onClick={() => handleRevokeInvitation(invitation.id)} disabled={revokingId === invitation.id}>
                                          {revokingId === invitation.id ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                                          Revoke
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Logs Tab */}
                <TabsContent value="activity-logs" className="mt-0 outline-none">
                  <ActivityLogsDashboard />
                </TabsContent>

                {/* Users Tab */}
                <TabsContent value="users" className="mt-0 outline-none">
                  <GlobalUserManagement />
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="mt-0 outline-none">
                  <SystemSettingsManagement />
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>
      </main>

      <PremiumFooter />
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
