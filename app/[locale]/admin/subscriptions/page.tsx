'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Building,
  Search,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock,
  Edit,
  Eye,
  Filter,
  RefreshCw,
  CreditCard,
  TrendingUp,
  Users,
  BarChart3,
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

interface Subscription {
  id: string
  name: string
  slug: string
  subscription_plan: string
  subscription_status: string
  trial_ends_at: string | null
  is_trial: boolean
  created_at: string
  subscription_started_at: string | null
  subscription_ends_at: string | null
  planDetails?: {
    name: string
    price: number
    interval: string
    features: string[]
  }
  isTrialExpired: boolean
}

interface SubscriptionStats {
  totalClinics: number
  activeSubscriptions: number
  trialSubscriptions: number
  expiredTrials: number
  monthlyRevenue: number
  annualRevenue: number
}

export default function SubscriptionsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [stats, setStats] = useState<SubscriptionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    plan: '',
    status: '',
    trialEndsAt: '',
  })

  useEffect(() => {
    if (!authLoading && user) {
      fetchSubscriptions()
      fetchStats()
    }
  }, [user, authLoading])

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/admin/subscriptions')
      if (!response.ok) throw new Error('Failed to fetch subscriptions')
      const data = await response.json()
      setSubscriptions(data.subscriptions)
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/subscriptions/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleEditSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription)
    setEditForm({
      plan: subscription.subscription_plan,
      status: subscription.subscription_status,
      trialEndsAt: subscription.trial_ends_at || '',
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveSubscription = async () => {
    if (!selectedSubscription) return

    try {
      const response = await fetch('/api/admin/subscriptions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clinicId: selectedSubscription.id,
          plan: editForm.plan,
          status: editForm.status,
          trialEndsAt: editForm.trialEndsAt || null,
        }),
      })

      if (!response.ok) throw new Error('Failed to update subscription')
      
      await fetchSubscriptions()
      await fetchStats()
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error('Error updating subscription:', error)
    }
  }

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || sub.subscription_status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string, isTrial: boolean, isTrialExpired: boolean) => {
    if (isTrialExpired) {
      return <Badge variant="destructive">Trial Expired</Badge>
    }
    if (isTrial) {
      return <Badge variant="secondary">Trial</Badge>
    }
    
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>
      case 'past_due':
        return <Badge variant="destructive">Past Due</Badge>
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
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
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <p className="text-muted-foreground">
            Manage clinic subscriptions and billing
          </p>
        </div>
        <Button onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clinics</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClinics}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeSubscriptions}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trial Subscriptions</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.trialSubscriptions}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">฿{stats.monthlyRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clinics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Clinic Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading subscriptions...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clinic</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Trial Ends</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{subscription.name}</div>
                        <div className="text-sm text-muted-foreground">{subscription.slug}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{subscription.planDetails?.name || subscription.subscription_plan}</div>
                      {subscription.planDetails?.price && (
                        <div className="text-sm text-muted-foreground">
                          ฿{subscription.planDetails.price}/{subscription.planDetails.interval}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(
                        subscription.subscription_status,
                        subscription.is_trial,
                        subscription.isTrialExpired
                      )}
                    </TableCell>
                    <TableCell>
                      {subscription.trial_ends_at ? (
                        <div className="text-sm">
                          {format(new Date(subscription.trial_ends_at), 'MMM dd, yyyy', { locale: th })}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(subscription.created_at), 'MMM dd, yyyy', { locale: th })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSubscription(subscription)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/clinics/${subscription.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Subscription Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Clinic</Label>
              <div className="text-sm font-medium mt-1">{selectedSubscription?.name}</div>
            </div>
            
            <div>
              <Label>Subscription Plan</Label>
              <Select value={editForm.plan} onValueChange={(value) => setEditForm({ ...editForm, plan: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editForm.status === 'trial' && (
              <div>
                <Label>Trial End Date</Label>
                <Input
                  type="datetime-local"
                  value={editForm.trialEndsAt}
                  onChange={(e) => setEditForm({ ...editForm, trialEndsAt: e.target.value })}
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSubscription}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
