'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Download,
  Trash2,
  Lock,
  Unlock,
  Eye,
  Plus,
  Edit,
  CreditCard,
  Building2,
  Activity,
  Zap,
  Info,
  Layers,
  ChevronRight,
  ChevronLeft,
  Mail,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import CenterDetailModal from './center-detail-modal';
import CenterOnboardingWizard from './center-onboarding-wizard';

interface CenterData {
  id: string;
  name: string;
  slug: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended' | 'trial';
  subscription: {
    plan: string;
    status: string;
    mrr: number;
  };
  users: number;
  createdAt: string;
  lastActivity: string;
  healthScore: number;
}

export default function EnhancedCenterManagement() {
  const t = useTranslations();
  const [centers, setCenters] = useState<CenterData[]>([]);
  const [filteredCenters, setFilteredCenters] = useState<CenterData[]>([]);
  const [selectedCenters, setSelectedCenters] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [_planFilter, _setPlanFilter] = useState<string>('all');
  const [_healthFilter, _setHealthFilter] = useState<string>('all');
  const [_sortBy, _setSortBy] = useState<string>('name');
  const [_sortOrder, _setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Detail modal state
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  
  // Pagination state
  const [offset, setOffset] = useState(0);
  const [limit] = useState(10);
  const total = filteredCenters.length;
  const page = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  // Onboarding wizard state
  const [wizardOpen, setWizardOpen] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const openCenterDetail = (centerId: string) => {
    setSelectedCenterId(centerId);
    setDetailModalOpen(true);
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centers, searchTerm, statusFilter, _planFilter, _healthFilter, _sortBy, _sortOrder]);

  const fetchCenters = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/centers');
      if (response.ok) {
        const data = await response.json();
        setCenters(data.centers || []);
      }
    } catch (error) {
      console.error('Failed to fetch centers:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...centers];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          c.slug.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    // Plan filter
    if (_planFilter !== 'all') {
      filtered = filtered.filter((c) => c.subscription.plan === _planFilter);
    }

    // Health score filter
    if (_healthFilter !== 'all') {
      filtered = filtered.filter((c) => {
        if (_healthFilter === 'excellent') return c.healthScore >= 80;
        if (_healthFilter === 'good') return c.healthScore >= 60 && c.healthScore < 80;
        if (_healthFilter === 'fair') return c.healthScore >= 40 && c.healthScore < 60;
        if (_healthFilter === 'poor') return c.healthScore < 40;
        return true;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      if (_sortBy === 'name') {
        aValue = a.name;
        bValue = b.name;
      } else if (_sortBy === 'users') {
        aValue = a.users;
        bValue = b.users;
      } else if (_sortBy === 'revenue') {
        aValue = a.subscription.mrr;
        bValue = b.subscription.mrr;
      } else if (_sortBy === 'health') {
        aValue = a.healthScore;
        bValue = b.healthScore;
      } else if (_sortBy === 'created') {
        aValue = a.createdAt;
        bValue = b.createdAt;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return _sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return _sortOrder === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    setFilteredCenters(filtered);
  };

  const toggleSelectAll = () => {
    if (selectedCenters.size === filteredCenters.length) {
      setSelectedCenters(new Set());
    } else {
      setSelectedCenters(new Set(filteredCenters.map((c) => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedCenters);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCenters(newSelected);
  };

  const handleBulkAction = async (action: string) => {
    if (selectedCenters.size === 0) return;

    const confirmed = globalThis.confirm(t('common.confirmAction' as any) || 'Confirm Bulk Operation?');

    if (!confirmed) return;

    try {
      const response = await fetch('/api/admin/centers/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          centerIds: Array.from(selectedCenters),
        }),
      });

      if (response.ok) {
        await fetchCenters();
        setSelectedCenters(new Set());
        toast.success(t('common.success' as any) || 'Synchronization Successful');
      }
    } catch (error) {
      console.error('Bulk action failed:', error);
      toast.error(t('common.error' as any) || 'Protocol Variance Detected');
    }
  };

  const getStatusStyles = (status: string) => {
    const variants: Record<string, string> = {
      active: 'bg-emerald-50 text-emerald-600',
      inactive: 'bg-slate-50 text-slate-400',
      suspended: 'bg-rose-50 text-rose-600',
      trial: 'bg-blue-50 text-blue-600',
    };
    return variants[status] || 'bg-slate-50 text-slate-400';
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getHealthIcon = (score: number) => {
    if (score >= 80) return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    if (score >= 60) return <TrendingUp className="h-4 w-4 text-blue-600" />;
    if (score >= 40) return <AlertTriangle className="h-4 w-4 text-amber-600" />;
    return <XCircle className="h-4 w-4 text-rose-600" />;
  };

  const exportData = () => {
    const csv = [
      ['Name', 'Email', 'Status', 'Plan', 'Users', 'MRR', 'Health Score', 'Created'].join(','),
      ...filteredCenters.map((c) =>
        [
          c.name,
          c.email,
          c.status,
          c.subscription.plan,
          c.users,
          c.subscription.mrr,
          c.healthScore,
          new Date(c.createdAt).toLocaleDateString(),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = globalThis.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `center-topology-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading && centers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-6">
          <div className="relative h-20 w-20 mx-auto">
            <div className="absolute inset-0 bg-pink-500/10 blur-2xl rounded-full animate-pulse" />
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-pink-600 relative" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse italic">Synchronizing Node Topology...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Overview Metrics Grid - Operational Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: t('centerManagement.totalCenters' as any) || 'Total Registry', val: centers.length, sub: `${centers.filter((c) => c.status === 'active').length} Active Nodes`, icon: Building2, color: 'text-slate-950', bg: 'bg-slate-50' },
          { label: t('centerManagement.active' as any) || 'Operational Load', val: `${Math.round((centers.filter(c => c.status === 'active').length / (centers.length || 1)) * 100)}%`, sub: 'Real-time Flux', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: t('centerManagement.avgHealth' as any) || 'Integrity Index', val: centers.length > 0 ? Math.round(centers.reduce((sum, c) => sum + c.healthScore, 0) / centers.length) : 0, sub: 'Composite Quality Score', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: t('centerManagement.totalUsers' as any) || 'Entity Nodes', val: centers.reduce((sum, c) => sum + c.users, 0).toLocaleString(), sub: 'Registered Identities', icon: Users, color: 'text-pink-600', bg: 'bg-pink-50' }
        ].map((node, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] transition-all duration-700 hover:border-pink-500/20 group relative overflow-hidden h-full">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-10 pb-6">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover:text-slate-950 transition-colors">{node.label}</CardTitle>
                <div className={cn("p-3 rounded-2xl border border-slate-50 shadow-inner group-hover:scale-110 transition-transform duration-700", node.bg)}>
                  <node.icon className={cn("h-5 w-5", node.color)} />
                </div>
              </CardHeader>
              <CardContent className="p-10 pt-0">
                <div className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">{node.val}</div>
                <p className="text-[9px] font-black uppercase tracking-widest mt-4 text-slate-400 italic group-hover:text-slate-600 transition-colors">{node.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filtering and Actions Interface */}
      <div className="flex flex-col lg:flex-row gap-8 items-end">
        <div className="flex-1 w-full relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 to-blue-600/20 rounded-[1.5rem] blur opacity-0 group-focus-within:opacity-100 transition duration-1000" />
          <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none z-20">
            <Search className="h-6 w-6 text-slate-300 group-focus-within:text-pink-600 transition-colors" />
          </div>
          <Input
            placeholder={t('centerManagement.searchPlaceholder' as any) || 'Search_Center_Nodes...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-16 pl-20 pr-10 rounded-2xl border-slate-100 bg-slate-50 text-slate-950 placeholder:text-slate-300 focus:border-pink-500/30 focus:ring-pink-500/10 transition-all text-base font-bold italic shadow-inner relative z-10"
          />
        </div>

        <div className="flex gap-4 flex-wrap justify-center shrink-0">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-16 w-[180px] rounded-2xl border-slate-100 bg-slate-50 px-8 text-[10px] font-black uppercase tracking-widest text-slate-950 focus:ring-pink-500/10 appearance-none transition-all italic shadow-inner">
              <SelectValue placeholder="Node_Status" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-100 rounded-2xl shadow-premium">
              <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-50 focus:text-pink-600">Global_Nodes</SelectItem>
              <SelectItem value="active" className="text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-50 focus:text-pink-600">Active_Only</SelectItem>
              <SelectItem value="trial" className="text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-50 focus:text-pink-600">Trial_Nodes</SelectItem>
              <SelectItem value="inactive" className="text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-50 focus:text-pink-600">Inactive_Nodes</SelectItem>
              <SelectItem value="suspended" className="text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-rose-50 focus:text-rose-600">Suspended</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="h-16 px-10 rounded-2xl border-slate-200 bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] italic shadow-premium hover:bg-slate-50 transition-all"
            onClick={exportData}
          >
            <Download className="mr-3 h-5 w-5 text-blue-600" />
            Schema_Export
          </Button>

          <Button 
            variant="premium" 
            className="h-16 px-12 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic"
            onClick={() => setWizardOpen(true)}
          >
            <Plus className="mr-3 h-5 w-5" />
            Initialize_Uplink
          </Button>
        </div>
      </div>

      {/* Main Node Registry interface */}
      <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative transition-all duration-700 hover:border-pink-500/10 group">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardContent className="p-0">
          <AnimatePresence>
            {selectedCenters.size > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-8 bg-pink-50/50 border-b border-pink-100 flex flex-col sm:flex-row items-center justify-between gap-8"
              >
                <div className="flex items-center gap-6">
                  <div className="h-10 w-10 rounded-xl bg-white border border-pink-100 flex items-center justify-center text-pink-600 shadow-sm">
                    <Layers className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-pink-600 italic">
                    {selectedCenters.size} Nodes_Selected_For_Mass_Authorisation
                  </span>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" size="sm" className="h-12 rounded-xl border-slate-200 bg-white text-[9px] font-black uppercase tracking-widest italic hover:bg-slate-50" onClick={() => handleBulkAction('activate')}>
                    <Unlock className="h-3.5 w-3.5 mr-2 text-emerald-600" /> Activate_All
                  </Button>
                  <Button variant="outline" size="sm" className="h-12 rounded-xl border-slate-200 bg-white text-[9px] font-black uppercase tracking-widest italic hover:bg-slate-50" onClick={() => handleBulkAction('suspend')}>
                    <Lock className="h-3.5 w-3.5 mr-2 text-amber-600" /> Suspend_Batch
                  </Button>
                  <Button variant="destructive" size="sm" className="h-12 rounded-xl bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest italic shadow-lg shadow-rose-600/20" onClick={() => handleBulkAction('delete')}>
                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Decommission
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 border-b border-slate-100 hover:bg-slate-50/50">
                  <TableHead className="w-20 px-10">
                    <Checkbox
                      checked={selectedCenters.size === filteredCenters.length && filteredCenters.length > 0}
                      onCheckedChange={toggleSelectAll}
                      className="border-slate-300 data-[state=checked]:bg-pink-600 data-[state=checked]:border-pink-600"
                    />
                  </TableHead>
                  <TableHead className="px-10 py-10 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('centerManagement.aestheticUplink' as any) || 'Center_Node'}</TableHead>
                  <TableHead className="px-10 py-10 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('centerManagement.protocolAccess' as any) || 'Access_Status'}</TableHead>
                  <TableHead className="px-10 py-10 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('centerManagement.planVector' as any) || 'Plan_Class'}</TableHead>
                  <TableHead className="px-10 py-10 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('centerManagement.users' as any) || 'Entity_Load'}</TableHead>
                  <TableHead className="px-10 py-10 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('centerManagement.integrity' as any) || 'Integrity_Index'}</TableHead>
                  <TableHead className="px-10 py-10 text-right w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                <AnimatePresence mode="popLayout">
                  {filteredCenters.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-40 text-slate-300 uppercase tracking-[0.5em] font-black text-[11px] italic">
                        NO_NODES_DETECTED_IN_SECTOR
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCenters.map((center, idx) => (
                      <motion.tr 
                        key={center.id} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="group/row cursor-pointer transition-all duration-500 hover:bg-slate-50 relative"
                        onClick={() => openCenterDetail(center.id)}
                      >
                        <TableCell className="px-10" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedCenters.has(center.id)}
                            onCheckedChange={() => toggleSelect(center.id)}
                            className="border-slate-300 data-[state=checked]:bg-pink-600 data-[state=checked]:border-pink-600"
                          />
                        </TableCell>
                        <TableCell className="px-10 py-10">
                          <div className="flex items-center gap-8">
                            <div className="h-16 w-16 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover/row:scale-110 group-hover/row:bg-white transition-all duration-700">
                              <Building2 className="h-8 w-8 text-slate-300 group-hover/row:text-pink-600 transition-colors" />
                            </div>
                            <div className="space-y-1.5">
                              <div className="text-2xl font-black text-slate-950 tracking-tighter italic uppercase group-hover/row:text-pink-600 transition-colors leading-none">{center.name}</div>
                              <div className="flex items-center gap-4">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic flex items-center gap-2">
                                  <Mail className="h-3 w-3 text-pink-500/40" />
                                  {center.email}
                                </span>
                                <div className="h-1 w-1 rounded-full bg-slate-200" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic flex items-center gap-2">
                                  <Activity className="h-3 w-3 text-blue-500/40" />
                                  SYNC: {new Date(center.lastActivity).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-10 py-10">
                          <Badge className={cn("px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-none shadow-sm italic leading-none", getStatusStyles(center.status))}>
                            {center.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-10 py-10">
                          <div className="space-y-1">
                            <p className="text-lg font-black text-slate-950 italic uppercase tracking-tighter leading-none group-hover/row:text-blue-600 transition-colors">{center.subscription.plan}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic leading-none">Yield: {formatCurrency(center.subscription.mrr)}/mo</p>
                          </div>
                        </TableCell>
                        <TableCell className="px-10 py-10">
                          <div className="flex items-center gap-4 group/entity">
                            <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover/row:bg-white transition-all duration-700">
                              <Users className="h-5 w-5 text-slate-300 group-hover/row:text-blue-600" />
                            </div>
                            <span className="text-2xl font-black text-slate-950 italic tracking-tighter leading-none group-hover/row:scale-110 transition-transform">{center.users}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-10 py-10">
                          <div className="flex items-center gap-5">
                            <div className={cn("p-3 rounded-xl border border-slate-50 shadow-inner group-hover/row:scale-110 transition-transform duration-700", getHealthColor(center.healthScore).replace('text', 'bg-opacity-5 bg'))}>
                              {getHealthIcon(center.healthScore)}
                            </div>
                            <span className={cn("text-2xl font-black italic tracking-tighter uppercase leading-none", getHealthColor(center.healthScore))}>
                              {center.healthScore}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-10 py-10 text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:text-pink-600 transition-all duration-500 shadow-inner group/btn">
                                <MoreVertical className="h-6 w-6 text-slate-300 group-hover/btn:text-pink-600" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white border-slate-100 rounded-3xl p-3 min-w-[220px] shadow-premium selection:bg-pink-500/10">
                              <DropdownMenuLabel className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Node Protocols</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-slate-50" />
                              <DropdownMenuItem className="rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-50 focus:text-pink-600 transition-all gap-4 mb-1" onClick={() => openCenterDetail(center.id)}>
                                <Eye className="h-5 w-5 text-pink-500" />
                                Inspect_Node
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-blue-50 focus:text-blue-600 transition-all gap-4 mb-1">
                                <Edit className="h-5 w-5 text-blue-500" />
                                Refine_Parameters
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-purple-50 focus:text-purple-600 transition-all gap-4 mb-1">
                                <CreditCard className="h-5 w-5 text-purple-500" />
                                Reallocate_Plan
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-slate-50" />
                              <DropdownMenuItem className="rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-rose-50 focus:text-rose-600 transition-all gap-4 text-rose-600">
                                <Trash2 className="h-5 w-5" />
                                Decommission_Unit
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination interface */}
      <div className="flex items-center justify-between px-10">
        <div className="flex items-center gap-6">
          <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 shadow-inner">
            <Info className="h-5 w-5" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">
            Sector_Registry_Index: <span className="text-slate-950">{offset + 1} — {Math.min(offset + limit, total)}</span> <span className="text-slate-200 mx-2">//</span> Total_Nodes: <span className="text-pink-600">{total}</span>
          </p>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="rounded-2xl border-slate-200 bg-white h-14 px-8 text-[10px] font-black uppercase tracking-widest italic shadow-sm hover:bg-slate-50 transition-all disabled:opacity-20"
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-3" />
            Prev_Sector
          </Button>
          <Button
            variant="outline"
            className="rounded-2xl border-slate-200 bg-white h-14 px-8 text-[10px] font-black uppercase tracking-widest italic shadow-sm hover:bg-slate-50 transition-all disabled:opacity-20"
            onClick={() => setOffset(offset + limit)}
            disabled={page === totalPages}
          >
            Next_Sector
            <ChevronRight className="h-4 w-4 ml-3" />
          </Button>
        </div>
      </div>

      {/* Modals interface */}
      <CenterDetailModal
        centerId={selectedCenterId}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />

      <CenterOnboardingWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onSuccess={fetchCenters}
      />
    </div>
  );
}
