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
  Calendar,
  Download,
  Trash2,
  Lock,
  Unlock,
  Eye,
  Plus,
  Edit,
  CreditCard
} from 'lucide-react';
import { motion } from 'framer-motion';
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
  const [planFilter, _setPlanFilter] = useState<string>('all');
  const [healthFilter, _setHealthFilter] = useState<string>('all');
  const [sortBy, _setSortBy] = useState<string>('name');
  const [sortOrder, _setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Detail modal state
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  
  // Onboarding wizard state
  const [wizardOpen, setWizardOpen] = useState(false);

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
  }, [centers, searchTerm, statusFilter, planFilter, healthFilter, sortBy, sortOrder]);

  const fetchCenters = async () => {
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
    if (planFilter !== 'all') {
      filtered = filtered.filter((c) => c.subscription.plan === planFilter);
    }

    // Health score filter
    if (healthFilter !== 'all') {
      filtered = filtered.filter((c) => {
        if (healthFilter === 'excellent') return c.healthScore >= 80;
        if (healthFilter === 'good') return c.healthScore >= 60 && c.healthScore < 80;
        if (healthFilter === 'fair') return c.healthScore >= 40 && c.healthScore < 60;
        if (healthFilter === 'poor') return c.healthScore < 40;
        return true;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      if (sortBy === 'name') {
        aValue = a.name;
        bValue = b.name;
      } else if (sortBy === 'users') {
        aValue = a.users;
        bValue = b.users;
      } else if (sortBy === 'revenue') {
        aValue = a.subscription.mrr;
        bValue = b.subscription.mrr;
      } else if (sortBy === 'health') {
        aValue = a.healthScore;
        bValue = b.healthScore;
      } else if (sortBy === 'created') {
        aValue = a.createdAt;
        bValue = b.createdAt;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortOrder === 'asc'
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

    const confirmed = globalThis.confirm(t('common.confirmAction'));

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
        toast.success(t('common.success'));
      }
    } catch (error) {
      console.error('Bulk action failed:', error);
      toast.error(t('common.error'));
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-500',
      inactive: 'bg-gray-500',
      suspended: 'bg-red-500',
      trial: 'bg-blue-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthIcon = (score: number) => {
    if (score >= 80) return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (score >= 60) return <TrendingUp className="h-4 w-4 text-blue-600" />;
    if (score >= 40) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
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
    a.download = `centers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header with Stats - Operational Hub */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2rem] hover:bg-white/[0.03] transition-all duration-500 group shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">{t('centerManagement.totalCenters')}</CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10 border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-700">
              <Users className="h-4 w-4 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white tracking-tighter italic">{centers.length}</div>
            <p className="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-500 italic">{t('centerManagement.globalNodes')}</p>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2rem] hover:bg-white/[0.03] transition-all duration-500 group shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">{t('centerManagement.active')}</CardTitle>
            <div className="p-2 rounded-lg bg-green-500/10 border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-700">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-green-400 tracking-tighter italic">
              {centers.filter((c) => c.status === 'active').length}
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-500 italic">{t('centerManagement.operationalCycles')}</p>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2rem] hover:bg-white/[0.03] transition-all duration-500 group shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">{t('centerManagement.avgHealth')}</CardTitle>
            <div className="p-2 rounded-lg bg-pink-500/10 border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-700">
              <TrendingUp className="h-4 w-4 text-pink-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white tracking-tighter italic">
              {centers.length > 0
                ? Math.round(centers.reduce((sum, c) => sum + c.healthScore, 0) / centers.length)
                : 0}
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-500 italic">{t('centerManagement.integrityIndex')}</p>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2rem] hover:bg-white/[0.03] transition-all duration-500 group shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">{t('centerManagement.totalUsers')}</CardTitle>
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-700">
              <Users className="h-4 w-4 text-cyan-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white tracking-tighter italic">
              {centers.reduce((sum, c) => sum + c.users, 0).toLocaleString()}
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-500 italic">{t('centerManagement.registeredEntities')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1 w-full md:w-auto relative group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-600 group-focus-within:text-pink-500 transition-colors" />
          </div>
          <Input
            placeholder={t('centerManagement.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-16 pl-16 pr-8 rounded-2xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-700 focus:border-pink-500/30 focus:ring-pink-500/20 transition-all text-sm font-bold italic"
          />
        </div>

        <div className="flex gap-3 flex-wrap justify-center">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-16 w-[160px] rounded-2xl border border-white/5 bg-white/[0.03] px-6 text-[10px] font-black uppercase tracking-widest text-white focus:ring-pink-500/20 appearance-none transition-all italic">
              <SelectValue placeholder={t('centerManagement.statusNode')} />
            </SelectTrigger>
            <SelectContent className="bg-[#020617] border-white/10 rounded-2xl">
              <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest italic">{t('centerManagement.global')}</SelectItem>
              <SelectItem value="active" className="text-[10px] font-black uppercase tracking-widest italic">{t('centerManagement.activeStatus')}</SelectItem>
              <SelectItem value="trial" className="text-[10px] font-black uppercase tracking-widest italic">{t('centerManagement.trial')}</SelectItem>
              <SelectItem value="inactive" className="text-[10px] font-black uppercase tracking-widest italic">{t('centerManagement.inactive')}</SelectItem>
              <SelectItem value="suspended" className="text-[10px] font-black uppercase tracking-widest italic text-rose-500">{t('centerManagement.suspended')}</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="h-16 px-8 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
            onClick={exportData}
          >
            <Download className="mr-3 h-4 w-4" />
            {t('centerManagement.exportSchema')}
          </Button>

          <Button 
            variant="premium" 
            className="h-16 px-10 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 border"
            onClick={() => setWizardOpen(true)}
          >
            <Plus className="mr-3 h-5 w-5" />
            {t('centerManagement.initializeNode')}
          </Button>
        </div>
      </div>

      <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <CardContent className="p-0">
          {/* Bulk Actions */}
          {selectedCenters.size > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-pink-600/10 border-b border-pink-500/20 flex items-center justify-between"
            >
              <span className="text-xs font-black uppercase tracking-widest text-pink-400">
                {t('centerManagement.nodesSelected', { count: selectedCenters.size })}
              </span>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="rounded-xl border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest" onClick={() => handleBulkAction('activate')}>
                  <Unlock className="h-3 w-3 mr-2" /> {t('centerManagement.activate')}
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest" onClick={() => handleBulkAction('suspend')}>
                  <Lock className="h-3 w-3 mr-2" /> {t('centerManagement.suspend')}
                </Button>
                <Button variant="destructive" size="sm" className="rounded-xl text-[9px] font-black uppercase tracking-widest" onClick={() => handleBulkAction('delete')}>
                  <Trash2 className="h-3 w-3 mr-2" /> {t('centerManagement.decommission')}
                </Button>
              </div>
            </motion.div>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-white/[0.02] border-b border-white/5">
                  <TableHead className="w-16 px-10">
                    <Checkbox
                      checked={selectedCenters.size === filteredCenters.length && filteredCenters.length > 0}
                      onCheckedChange={toggleSelectAll}
                      className="border-white/20 data-[state=checked]:bg-pink-600 data-[state=checked]:border-pink-600"
                    />
                  </TableHead>
                  <TableHead className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('centerManagement.clinicalUplink')}</TableHead>
                  <TableHead className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('centerManagement.protocolAccess')}</TableHead>
                  <TableHead className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('centerManagement.planVector')}</TableHead>
                  <TableHead className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('centerManagement.users')}</TableHead>
                  <TableHead className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('centerManagement.integrity')}</TableHead>
                  <TableHead className="px-8 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{t('centerManagement.lastSync')}</TableHead>
                  <TableHead className="px-10 py-8 text-right w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCenters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-20 text-slate-600 uppercase tracking-[0.4em] font-black text-[10px] italic">
                      {t('centerManagement.noNodesDetected')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCenters.map((center) => (
                    <TableRow 
                      key={center.id} 
                      className="group/row cursor-pointer transition-all duration-500 hover:bg-white/[0.03] border-white/5"
                      onClick={() => openCenterDetail(center.id)}
                    >
                      <TableCell className="px-10" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedCenters.has(center.id)}
                          onCheckedChange={() => toggleSelect(center.id)}
                          className="border-white/20 data-[state=checked]:bg-pink-600 data-[state=checked]:border-pink-600"
                        />
                      </TableCell>
                      <TableCell className="px-8 py-8">
                        <div className="space-y-1">
                          <div className="text-lg font-bold text-white tracking-tight italic group-hover/row:text-pink-400 transition-colors">{center.name}</div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">{center.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-8">
                        <Badge className={cn("px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-none shadow-inner", getStatusColor(center.status).replace('bg-', 'bg-opacity-10 text-').replace('500', '400'))}>
                          {center.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-8 py-8 text-sm font-bold text-slate-300 italic uppercase tracking-widest">{center.subscription.plan}</TableCell>
                      <TableCell className="px-8 py-8">
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-slate-600" />
                          <span className="text-sm font-black text-white italic">{center.users}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-8">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-1.5 rounded-lg border border-white/5 shadow-inner", getHealthColor(center.healthScore).replace('text-', 'bg-opacity-5 bg-'))}>
                            {getHealthIcon(center.healthScore)}
                          </div>
                          <span className={cn("text-sm font-black italic tracking-tighter", getHealthColor(center.healthScore))}>
                            {center.healthScore}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-8">
                        <div className="flex items-center gap-3 text-slate-500 italic">
                          <Calendar className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {new Date(center.lastActivity).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-10 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/10 text-slate-500">
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#020617] border-white/10 rounded-2xl p-2 min-w-[180px]">
                            <DropdownMenuLabel className="px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 italic">{t('centerManagement.nodeControl')}</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/5" />
                            <DropdownMenuItem className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-600 focus:text-white transition-colors" onClick={() => openCenterDetail(center.id)}>
                              <Eye className="mr-3 h-4 w-4" /> {t('centerManagement.viewVector')}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-600 focus:text-white transition-colors">
                              <Edit className="mr-3 h-4 w-4" /> {t('centerManagement.refineParameters')}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-600 focus:text-white transition-colors">
                              <CreditCard className="mr-3 h-4 w-4" /> {t('centerManagement.reallocatePlan')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/5" />
                            <DropdownMenuItem className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-rose-600 focus:text-white transition-colors text-rose-500">
                              <Trash2 className="mr-3 h-4 w-4" /> {t('centerManagement.decommissionUnit')}
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
        </CardContent>
      </Card>

      {/* Center Detail Modal */}
      <CenterDetailModal
        centerId={selectedCenterId}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />

      {/* Center Onboarding Wizard */}
      <CenterOnboardingWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onSuccess={fetchCenters}
      />
    </div>
  );
}
