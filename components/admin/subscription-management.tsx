'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  CreditCard,
  Building2,
  AlertTriangle,
  Loader2,
  Edit,
  Clock,
  CheckCircle2,
  Search,
  Shield,
  Layers,
  Calendar,
  RefreshCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useToast } from '@/components/ui/use-toast';

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
  const t = useTranslations();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubs, setFilteredSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [editPlan, setEditPlan] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [saving, setSaving] = useState(false);
  
  const { toast } = useToast();

  const fetchSubscriptions = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/subscriptions');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
    } catch {
      toast({
        title: t('common.error'),
        description: t('subscriptionManagement.errorLoad'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

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
          centerId: selectedSub.id,
          plan: editPlan,
          status: editStatus,
        }),
      });

      if (!response.ok) throw new Error('Failed to update');

      toast({
        title: t('common.success'),
        description: t('subscriptionManagement.successUpdate'),
      });

      setEditModalOpen(false);
      fetchSubscriptions();
    } catch {
      toast({
        title: t('common.error'),
        description: t('subscriptionManagement.errorUpdate'),
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

  // Calculate stats
  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter((s) => s.subscription_status === 'active').length,
    trial: subscriptions.filter((s) => s.subscription_status === 'trial').length,
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
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Overview Metrics Grid - Operational Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: t('subscriptionManagement.totalAestheticUplinks'), val: stats.total, sub: t('subscriptionManagement.globalInfrastructureNodes'), icon: Building2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: t('subscriptionManagement.verifiedActiveVectors'), val: stats.active, sub: t('subscriptionManagement.nominalOperationalState'), icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: t('subscriptionManagement.temporalTrialSync'), val: stats.trial, sub: t('subscriptionManagement.activeEvaluationCycles'), icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: t('subscriptionManagement.trialExpiryDelta'), val: stats.expiredTrials, sub: t('subscriptionManagement.decommissionedEvaluationNodes'), icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10' }
        ].map((node, i) => (
          <Card key={i} className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2rem] hover:bg-white/[0.03] transition-all duration-500 group shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">{node.label}</CardTitle>
              <div className={cn("p-2 rounded-lg border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-700", node.bg)}>
                <node.icon className={cn("h-4 w-4", node.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white tracking-tighter italic">{node.val.toLocaleString()}</div>
              <p className="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-500 italic">{node.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plan Allocation Matrix */}
      <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
        <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
          <CardTitle className="text-2xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <Layers className="h-6 w-6 text-purple-400" />
            {t('subscriptionManagement.sectorMatrix')}
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{t('subscriptionManagement.resourceAllocationDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="p-10 lg:p-12 space-y-10">
          <div className="grid md:grid-cols-3 gap-10">
            {Object.entries(stats.byPlan).map(([plan, count], idx) => {
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              const colorClass = plan === 'enterprise' ? 'from-purple-500 to-indigo-600' : plan === 'professional' ? 'from-blue-500 to-cyan-600' : 'from-slate-500 to-slate-600';
              const shadowColor = plan === 'enterprise' ? 'rgba(139,92,246,0.3)' : plan === 'professional' ? 'rgba(6,182,212,0.3)' : 'rgba(148,163,184,0.2)';
              
              return (
                <div key={plan} className="space-y-4 group/plan">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-white group-hover/plan:text-pink-400 transition-colors uppercase tracking-[0.25em] italic">{t('subscriptionManagement.protocolLabel', { plan: plan.toUpperCase() })}</span>
                      <p className="text-2xl font-black text-white italic tracking-tighter">{count} <span className="text-[10px] text-slate-600 not-italic ml-1">{t('subscriptionManagement.nodes')}</span></p>
                    </div>
                    <Badge variant="outline" className="bg-white/[0.03] border-white/10 text-slate-500 text-[9px] font-black rounded-lg px-3 py-1 italic">{percentage.toFixed(1)}%</Badge>
                  </div>
                  <div className="relative h-2 w-full bg-white/[0.02] rounded-full overflow-hidden border border-white/5 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1.5, delay: idx * 0.1 }}
                      className={cn("h-full bg-gradient-to-r rounded-full", colorClass)} 
                      style={{ boxShadow: `0 0 15px ${shadowColor}` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Primary Registry Table */}
      <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
          <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-white tracking-tight italic">{t('subscriptionManagement.ledgerTitle')}</CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('subscriptionManagement.ledgerDesc')}</CardDescription>
            </div>
            
            <div className="flex gap-3 flex-wrap justify-center">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-pink-500 transition-colors" />
                <Input
                  placeholder={t('subscriptionManagement.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-14 pl-12 pr-6 rounded-2xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-700 focus:border-pink-500/30 focus:ring-pink-500/20 transition-all text-sm font-bold italic w-[240px]"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-14 w-[160px] rounded-2xl border border-white/5 bg-white/[0.03] px-6 text-[10px] font-black uppercase tracking-widest text-white focus:ring-pink-500/20 appearance-none transition-all italic">
                  <SelectValue placeholder={t('subscriptionManagement.statusProtocol')} />
                </SelectTrigger>
                <SelectContent className="bg-[#020617] border-white/10 rounded-2xl">
                  <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest italic">{t('subscriptionManagement.globalState')}</SelectItem>
                  <SelectItem value="active" className="text-[10px] font-black uppercase tracking-widest italic">{t('subscriptionManagement.active')}</SelectItem>
                  <SelectItem value="trial" className="text-[10px] font-black uppercase tracking-widest italic">{t('subscriptionManagement.trialCycle')}</SelectItem>
                  <SelectItem value="suspended" className="text-[10px] font-black uppercase tracking-widest italic text-rose-500">{t('subscriptionManagement.suspended')}</SelectItem>
                  <SelectItem value="cancelled" className="text-[10px] font-black uppercase tracking-widest italic">{t('subscriptionManagement.decommissioned')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="h-14 w-[160px] rounded-2xl border border-white/5 bg-white/[0.03] px-6 text-[10px] font-black uppercase tracking-widest text-white focus:ring-pink-500/20 appearance-none transition-all italic">
                  <SelectValue placeholder={t('subscriptionManagement.tierVector')} />
                </SelectTrigger>
                <SelectContent className="bg-[#020617] border-white/10 rounded-2xl">
                  <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest italic">{t('subscriptionManagement.allTiers')}</SelectItem>
                  <SelectItem value="starter" className="text-[10px] font-black uppercase tracking-widest italic">{t('subscriptionManagement.starter')}</SelectItem>
                  <SelectItem value="professional" className="text-[10px] font-black uppercase tracking-widest italic">{t('subscriptionManagement.professional')}</SelectItem>
                  <SelectItem value="enterprise" className="text-[10px] font-black uppercase tracking-widest italic">{t('subscriptionManagement.enterprise')}</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10" onClick={fetchSubscriptions}>
                <RefreshCw className={cn("h-4 w-4 text-slate-400", loading && "animate-spin")} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-white/[0.02] border-b border-white/5">
                  <TableHead className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('subscriptionManagement.originNode')}</TableHead>
                  <TableHead className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('subscriptionManagement.planProtocol')}</TableHead>
                  <TableHead className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('subscriptionManagement.state')}</TableHead>
                  <TableHead className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('subscriptionManagement.established')}</TableHead>
                  <TableHead className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('subscriptionManagement.temporalExpiry')}</TableHead>
                  <TableHead className="px-10 py-8 text-right w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-white/5">
                {filteredSubs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20 text-slate-600 uppercase tracking-[0.4em] font-black text-[10px] italic">
                      {t('subscriptionManagement.noSubscriptions')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubs.map((sub) => (
                    <TableRow key={sub.id} className="group/row transition-all duration-500 hover:bg-white/[0.03] border-white/5">
                      <TableCell className="px-10 py-8">
                        <div className="space-y-1">
                          <div className="text-lg font-bold text-white tracking-tight italic group-hover/row:text-pink-400 transition-colors">{sub.name}</div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">/{sub.slug}</div>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-8">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-3.5 w-3.5 text-slate-600" />
                          <span className="text-sm font-bold text-slate-300 italic uppercase tracking-widest">{sub.subscription_plan}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-8">
                        <div className="flex items-center gap-2">
                          <div className={cn("h-2 w-2 rounded-full animate-pulse shadow-lg", sub.subscription_status === 'active' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-rose-500 shadow-rose-500/50')} />
                          <Badge className={cn("px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-none shadow-inner", sub.subscription_status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400')}>
                            {sub.subscription_status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-8">
                        <div className="flex items-center gap-3 text-slate-500 italic">
                          <Calendar className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{formatDate(sub.subscription_started_at)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-8">
                        {sub.is_trial ? (
                          <div className="flex items-center gap-3">
                            <Clock className={cn("h-3.5 w-3.5", sub.isTrialExpired ? 'text-rose-500' : 'text-amber-500')} />
                            <span className={cn("text-sm font-black italic tracking-tighter", sub.isTrialExpired ? 'text-rose-500' : 'text-amber-400')}>
                              {formatDate(sub.trial_ends_at)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest italic">{t('permanentUplink')}</span>
                        )}
                      </TableCell>
                      <TableCell className="px-10 py-8 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/10 text-slate-500">
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#020617] border-white/10 rounded-2xl p-2 min-w-[180px]">
                            <DropdownMenuLabel className="px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 italic">{t('resourceControl')}</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/5" />
                            <DropdownMenuItem className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-600 focus:text-white transition-colors" onClick={() => openEditModal(sub)}>
                              <Edit className="mr-3 h-4 w-4" /> {t('reallocateProtocol')}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-600 focus:text-white transition-colors">
                              <Shield className="mr-3 h-4 w-4" /> {t('viewSector')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/5" />
                            <DropdownMenuItem className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-rose-600 focus:text-white transition-colors text-rose-500">
                              <Trash2 className="mr-3 h-4 w-4" /> {t('suspendInflow')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Telemetry */}
          <div className="p-10 border-t border-white/5 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">
              {t('subscriptionManagement.uplinksRange', { range: `${filteredSubs.length} of ${subscriptions.length}`, total: stats.active })}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-white/10 bg-white/5 h-12 px-6 hover:bg-white/10 transition-all opacity-20 cursor-not-allowed"
                disabled
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span className="text-[9px] font-black uppercase tracking-widest">{t('subscriptionManagement.previousSector')}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-white/10 bg-white/5 h-12 px-6 hover:bg-white/10 transition-all opacity-20 cursor-not-allowed"
                disabled
              >
                <span className="text-[9px] font-black uppercase tracking-widest">{t('subscriptionManagement.nextSector')}</span>
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reallocation Modal - Critical Command Interface */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="bg-[#020617] border-white/10 rounded-[3rem] p-10 max-w-md shadow-2xl backdrop-blur-3xl overflow-hidden text-slate-200">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />
          <DialogHeader className="mb-10">
            <DialogTitle className="text-2xl font-bold text-white tracking-tight italic flex items-center gap-4">
              <Shield className="h-6 w-6 text-pink-500" />
              {t('subscriptionManagement.reallocationTitle')}
            </DialogTitle>
          </DialogHeader>
          {selectedSub && (
            <div className="space-y-10">
              <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                <div className="h-16 w-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-xl">
                  <Building2 className="h-8 w-8 text-pink-400" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white italic tracking-tight">{selectedSub.name}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 mt-1">{t('subscriptionManagement.nodeIdentifier')}: /{selectedSub.slug}</div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic ml-4">{t('subscriptionManagement.protocolTier')}</label>
                  <Select value={editPlan} onValueChange={setEditPlan}>
                    <SelectTrigger className="h-16 rounded-2xl border-white/5 bg-white/[0.03] text-white focus:ring-pink-500/20 focus:border-pink-500/30 transition-all px-8 text-sm font-bold italic">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#020617] border-white/10 rounded-2xl">
                      <SelectItem value="starter" className="text-[10px] font-black uppercase tracking-widest italic">{t('subscriptionManagement.starter')}</SelectItem>
                      <SelectItem value="professional" className="text-[10px] font-black uppercase tracking-widest italic">{t('subscriptionManagement.professional')}</SelectItem>
                      <SelectItem value="enterprise" className="text-[10px] font-black uppercase tracking-widest italic">{t('subscriptionManagement.enterprise')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic ml-4">{t('subscriptionManagement.stateVector')}</label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger className="h-16 rounded-2xl border-white/5 bg-white/[0.03] text-white focus:ring-pink-500/20 focus:border-pink-500/30 transition-all px-8 text-sm font-bold italic">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#020617] border-white/10 rounded-2xl">
                      <SelectItem value="active" className="text-[10px] font-black uppercase tracking-widest italic text-emerald-400">{t('subscriptionManagement.active')}</SelectItem>
                      <SelectItem value="trial" className="text-[10px] font-black uppercase tracking-widest italic text-amber-400">{t('subscriptionManagement.trialCycle')}</SelectItem>
                      <SelectItem value="suspended" className="text-[10px] font-black uppercase tracking-widest italic text-rose-500">{t('subscriptionManagement.suspended')}</SelectItem>
                      <SelectItem value="cancelled" className="text-[10px] font-black uppercase tracking-widest italic">{t('subscriptionManagement.decommissioned')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex gap-4">
                <Button variant="outline" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border-white/10 bg-white/5" onClick={() => setEditModalOpen(false)}>
                  {t('subscriptionManagement.abortCommand')}
                </Button>
                <Button className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-pink-600 shadow-2xl shadow-pink-600/40" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {t('subscriptionManagement.confirmReallocation')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
