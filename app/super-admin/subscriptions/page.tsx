'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, CreditCard, TrendingUp, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface Subscription {
  id: string
  name: string
  slug: string
  subscription_plan: 'starter' | 'professional' | 'enterprise'
  subscription_status: 'active' | 'trial' | 'past_due' | 'suspended' | 'cancelled'
  trial_ends_at: string | null
  is_trial: boolean
  created_at: string
  subscription_started_at: string | null
  subscription_ends_at: string | null
  planDetails: {
    name: string
    price: number
    maxUsers: number
    maxCustomersPerMonth: number
    maxStorageGB: number
    features: string[]
  }
  isTrialExpired: boolean
}

export default function SubscriptionsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [editForm, setEditForm] = useState({
    plan: 'starter' as 'starter' | 'professional' | 'enterprise',
    status: 'active' as 'active' | 'trial' | 'past_due' | 'suspended' | 'cancelled',
    trialEndsAt: '',
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    } else if (!loading && user && user.role !== 'super_admin') {
      router.push('/customer/dashboard')
    }
  }, [loading, user, router])

  useEffect(() => {
    async function loadSubscriptions() {
      try {
        const response = await fetch('/api/admin/subscriptions')
        if (response.ok) {
          const data = await response.json()
          setSubscriptions(data.subscriptions || [])
        }
      } catch (error) {
        console.error('Failed to load subscriptions:', error)
        toast({
          title: '❌ Error',
          description: 'Failed to load subscriptions',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.role === 'super_admin') {
      loadSubscriptions()
    }
  }, [user, toast])

  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription)
    setEditForm({
      plan: subscription.subscription_plan,
      status: subscription.subscription_status,
      trialEndsAt: subscription.trial_ends_at
        ? new Date(subscription.trial_ends_at).toISOString().split('T')[0]
        : '',
    })
  }

  const handleSaveSubscription = async () => {
    if (!editingSubscription) return

    try {
      setIsSaving(true)
      const response = await fetch('/api/admin/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId: editingSubscription.id,
          plan: editForm.plan,
          status: editForm.status,
          trialEndsAt: editForm.trialEndsAt || undefined,
        }),
      })

      if (response.ok) {
        toast({
          title: '✅ Success',
          description: 'Subscription updated successfully',
        })
        
        // Reload subscriptions
        const reloadResponse = await fetch('/api/admin/subscriptions')
        if (reloadResponse.ok) {
          const data = await reloadResponse.json()
          setSubscriptions(data.subscriptions || [])
        }
        
        setEditingSubscription(null)
      } else {
        const error = await response.json()
        toast({
          title: '❌ Error',
          description: error.error || 'Failed to update subscription',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to update subscription:', error)
      toast({
        title: '❌ Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2">Loading subscriptions...</span>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user || user.role !== 'super_admin') {
    return null
  }

  const activeCount = subscriptions.filter((s) => s.subscription_status === 'active').length
  const trialCount = subscriptions.filter((s) => s.is_trial).length
  const suspendedCount = subscriptions.filter((s) => s.subscription_status === 'suspended').length
  const pastDueCount = subscriptions.filter((s) => s.subscription_status === 'past_due').length
  const totalRevenue = subscriptions
    .filter((s) => s.subscription_status === 'active')
    .reduce((sum, s) => sum + s.planDetails.price, 0)

  const getPlanBadge = (plan: string) => {
    const colors = {
      starter: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      professional: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      enterprise: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    } as const

    return (
      <Badge variant="outline" className={colors[plan as keyof typeof colors] || ''}>
        {plan}
      </Badge>
    )
  }

  const getStatusBadge = (status: string, isTrialExpired: boolean) => {
    if (isTrialExpired) {
      return (
        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
          Trial Expired
        </Badge>
      )
    }

    const colors = {
      active: 'bg-green-500/10 text-green-500 border-green-500/20',
      trial: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      past_due: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      suspended: 'bg-red-500/10 text-red-500 border-red-500/20',
      cancelled: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    } as const

    return (
      <Badge variant="outline" className={colors[status as keyof typeof colors] || ''}>
        {status}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Subscription Management</h1>
            <p className="text-muted-foreground">Manage clinic subscriptions and billing</p>
          </div>
          <Link href="/super-admin">
            <Button variant="outline">← Back to Dashboard</Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Active Subscriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeCount}</div>
              <p className="text-xs text-muted-foreground">
                {subscriptions.length} total clinics
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Trial Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{trialCount}</div>
              <p className="text-xs text-muted-foreground">Need conversion</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ฿{totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">From active subscriptions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Suspended
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{suspendedCount}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Past Due
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pastDueCount}</div>
              <p className="text-xs text-muted-foreground">Payment required</p>
            </CardContent>
          </Card>
        </div>

        {/* Subscriptions List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">All Subscriptions</h2>
          {subscriptions.map((subscription) => (
            <Card key={subscription.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {subscription.name}
                      {getPlanBadge(subscription.subscription_plan)}
                      {getStatusBadge(subscription.subscription_status, subscription.isTrialExpired)}
                      {subscription.is_trial && <Badge variant="outline">TRIAL</Badge>}
                    </CardTitle>
                    <CardDescription>{subscription.slug}</CardDescription>
                  </div>
                  <Button onClick={() => handleEditSubscription(subscription)} size="sm">
                    Edit Subscription
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Plan Price</div>
                    <div className="text-lg font-semibold">
                      ฿{subscription.planDetails.price.toLocaleString()}/mo
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Max Users</div>
                    <div className="text-lg font-semibold">
                      {subscription.planDetails.maxUsers === -1
                        ? 'Unlimited'
                        : subscription.planDetails.maxUsers}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Max Customers</div>
                    <div className="text-lg font-semibold">
                      {subscription.planDetails.maxCustomersPerMonth === -1
                        ? 'Unlimited'
                        : `${subscription.planDetails.maxCustomersPerMonth}/mo`}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Storage Limit</div>
                    <div className="text-lg font-semibold">
                      {subscription.planDetails.maxStorageGB} GB
                    </div>
                  </div>
                </div>

                {subscription.is_trial && subscription.trial_ends_at && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium text-yellow-600">
                        Trial ends:{' '}
                        {new Date(subscription.trial_ends_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                      {subscription.isTrialExpired && (
                        <Badge variant="destructive" className="ml-2">
                          EXPIRED
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <div className="text-sm text-muted-foreground mb-2">Plan Features:</div>
                  <div className="flex flex-wrap gap-2">
                    {subscription.planDetails.features.map((feature) => (
                      <Badge key={feature} variant="secondary">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {subscriptions.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  No subscriptions found
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />

      {/* Edit Subscription Dialog */}
      <Dialog open={!!editingSubscription} onOpenChange={() => setEditingSubscription(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
            <DialogDescription>
              Update subscription plan and status for {editingSubscription?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="plan">Subscription Plan</Label>
              <Select
                value={editForm.plan}
                onValueChange={(value: 'starter' | 'professional' | 'enterprise') =>
                  setEditForm({ ...editForm, plan: value })
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
              <Label htmlFor="status">Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(value: 'active' | 'trial' | 'past_due' | 'suspended' | 'cancelled') =>
                  setEditForm({ ...editForm, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="trialEndsAt">Trial Ends At (Optional)</Label>
              <Input
                id="trialEndsAt"
                type="date"
                value={editForm.trialEndsAt}
                onChange={(e) => setEditForm({ ...editForm, trialEndsAt: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty if not a trial account
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSubscription(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSubscription} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
