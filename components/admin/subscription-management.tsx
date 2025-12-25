'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CreditCard,
  Building2,
  TrendingUp,
  AlertTriangle,
  Loader2,
  Edit,
  Clock,
  CheckCircle2,
  Search,
  Filter,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatPrice, type PricingPlanView } from '@/lib/subscriptions/pricing-service-client';

interface Subscription {
  id: string;
  name: string;
  slug: string;
  subscription_plan: string;
  subscription_status: string;
  trial_ends_at: string | null;
  is_trial: boolean;
  created_at: string;
  subscription_started_at: string | null;
  subscription_ends_at: string | null;
  planDetails: {
    name: string;
    price: number;
    features: string[];
  } | null;
  isTrialExpired: boolean;
}

export default function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubs, setFilteredSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [availablePlans, setAvailablePlans] = useState<PricingPlanView[]>([]);
  
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [editPlan, setEditPlan] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [saving, setSaving] = useState(false);
  
  const { toast } = useToast();

  // Load available plans
  useEffect(() => {
    async function loadPlans() {
      try {
        const response = await fetch('/api/pricing/plans?type=b2b')
        if (!response.ok) throw new Error('Failed to fetch plans')
        const data = await response.json()
        setAvailablePlans(data.plans || [])
      } catch (error) {
        console.error('Failed to load plans:', error);
      }
    }
    loadPlans();
  }, []);

  const fetchSubscriptions = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/subscriptions');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load subscriptions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const filterSubscriptions = useCallback(() => {
    let filtered = [...subscriptions];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(search) ||
          s.slug.toLowerCase().includes(search)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((s) => s.subscription_status === statusFilter);
    }

    if (planFilter !== 'all') {
      filtered = filtered.filter((s) => s.subscription_plan === planFilter);
    }

    setFilteredSubs(filtered);
  }, [subscriptions, searchTerm, statusFilter, planFilter]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  useEffect(() => {
    filterSubscriptions();
  }, [filterSubscriptions]);

  const openEditModal = (sub: Subscription) => {
    setSelectedSub(sub);
    setEditPlan(sub.subscription_plan);
    setEditStatus(sub.subscription_status);
    setEditModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedSub) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId: selectedSub.id,
          plan: editPlan,
          status: editStatus,
        }),
      });

      if (!response.ok) throw new Error('Failed to update');

      toast({
        title: 'Success',
        description: 'Subscription updated successfully',
      });

      setEditModalOpen(false);
      fetchSubscriptions();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update subscription',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string, isTrialExpired: boolean) => {
    if (isTrialExpired) {
      return <Badge variant="destructive">Trial Expired</Badge>;
    }
    
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      trial: 'secondary',
      past_due: 'secondary',
      suspended: 'destructive',
      cancelled: 'outline',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getPlanBadge = (plan: string) => {
    const colors: Record<string, string> = {
      starter: 'bg-gray-100 text-gray-800',
      professional: 'bg-blue-100 text-blue-800',
      enterprise: 'bg-purple-100 text-purple-800',
    };
    return (
      <Badge className={colors[plan] || 'bg-gray-100 text-gray-800'}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </Badge>
    );
  };

  // Calculate stats
  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter((s) => s.subscription_status === 'active').length,
    trial: subscriptions.filter((s) => s.subscription_status === 'trial').length,
    pastDue: subscriptions.filter((s) => s.subscription_status === 'past_due').length,
    expiredTrials: subscriptions.filter((s) => s.isTrialExpired).length,
    byPlan: {
      starter: subscriptions.filter((s) => s.subscription_plan === 'starter').length,
      professional: subscriptions.filter((s) => s.subscription_plan === 'professional').length,
      enterprise: subscriptions.filter((s) => s.subscription_plan === 'enterprise').length,
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Building2 className="w-10 h-10 p-2 rounded-full bg-blue-100 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Clinics</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-10 h-10 p-2 rounded-full bg-green-100 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Clock className="w-10 h-10 p-2 rounded-full bg-yellow-100 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{stats.trial}</p>
                <p className="text-xs text-muted-foreground">On Trial</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-10 h-10 p-2 rounded-full bg-orange-100 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stats.pastDue}</p>
                <p className="text-xs text-muted-foreground">Past Due</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-10 h-10 p-2 rounded-full bg-red-100 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{stats.expiredTrials}</p>
                <p className="text-xs text-muted-foreground">Expired Trials</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Plan Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {Object.entries(stats.byPlan).map(([plan, count]) => {
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={plan} className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{plan}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        plan === 'enterprise'
                          ? 'bg-purple-500'
                          : plan === 'professional'
                          ? 'bg-blue-500'
                          : 'bg-gray-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              All Subscriptions
            </CardTitle>
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clinics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-[200px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
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
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  {availablePlans.map((plan) => (
                    <SelectItem key={plan.slug} value={plan.slug}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clinic</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Trial Ends</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No subscriptions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubs.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{sub.name}</div>
                          <div className="text-sm text-muted-foreground">{sub.slug}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getPlanBadge(sub.subscription_plan)}</TableCell>
                      <TableCell>{getStatusBadge(sub.subscription_status, sub.isTrialExpired)}</TableCell>
                      <TableCell>{formatDate(sub.subscription_started_at)}</TableCell>
                      <TableCell>
                        {sub.is_trial ? (
                          <span className={sub.isTrialExpired ? 'text-red-600' : ''}>
                            {formatDate(sub.trial_ends_at)}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(sub)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredSubs.length} of {subscriptions.length} subscriptions
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subscription: {selectedSub?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Plan</Label>
              <Select value={editPlan} onValueChange={setEditPlan}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availablePlans.map((plan) => (
                    <SelectItem key={plan.slug} value={plan.slug}>
                      {plan.name} - ฿{plan.price_amount.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
