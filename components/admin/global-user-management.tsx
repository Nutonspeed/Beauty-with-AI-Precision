'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Search,
  MoreVertical,
  Shield,
  Building2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Crown,
  Briefcase,
  Scissors,
  User,
  Activity,
  Info,
  Fingerprint
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useTranslations, useLocale } from 'next-intl';

interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  center_id: string | null;
  avatar_url: string | null;
  phone: string | null;
  is_active: boolean;
  last_seen_at: string | null;
  created_at: string;
  centers: { id: string; name: string } | null;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  recentlyActive: number;
  byRole: Record<string, number>;
}

interface Center {
  id: string;
  name: string;
}

export default function GlobalUserManagement() {
  const t = useTranslations();
  const _locale = useLocale();
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [_centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Filters
  const [roleFilter, setRoleFilter] = useState('all');
  const [_centerFilter, _setCenterFilter] = useState('all');
  const [_statusFilter, _setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Edit modal
  const [editUser, setEditUser] = useState<UserData | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
      });
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (_centerFilter !== 'all') params.append('centerId', _centerFilter);
      if (_statusFilter !== 'all') params.append('status', _statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const res = await fetch(`/api/admin/users/all?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();
      setUsers(data.users || []);
      setStats(data.stats || null);
      setCenters(data.centers || []);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error('Error:', error);
      toast({ title: t('common.error'), description: t('userManagement.errorFetch' as any) || 'Failed to sync identity nodes', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [roleFilter, _centerFilter, _statusFilter, offset, searchTerm, toast, t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = () => {
    setOffset(0);
    fetchUsers();
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const res = await fetch('/api/admin/users/all', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'toggle_active', value: !isActive }),
      });
      if (!res.ok) throw new Error('Failed');
      toast({ title: t('common.success'), description: t('userManagement.successUpdate' as any) || 'Entity state synchronized' });
      fetchUsers();
    } catch {
      toast({ title: t('common.error'), description: t('userManagement.errorUpdate' as any) || 'Sync collision detected', variant: 'destructive' });
    }
  };

  const changeUserRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch('/api/admin/users/all', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'change_role', value: newRole }),
      });
      if (!res.ok) throw new Error('Failed');
      toast({ title: t('common.success'), description: t('userManagement.successRole' as any) || 'Authorization level updated' });
      fetchUsers();
      setEditModalOpen(false);
    } catch {
      toast({ title: t('common.error'), description: t('userManagement.errorRole' as any) || 'Authorization drift detected', variant: 'destructive' });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <Crown className="h-4 w-4 text-purple-600" />;
      case 'center_owner': return <Building2 className="h-4 w-4 text-blue-600" />;
      case 'center_admin': return <Shield className="h-4 w-4 text-emerald-600" />;
      case 'staff': return <Briefcase className="h-4 w-4 text-orange-600" />;
      case 'beautician': return <Scissors className="h-4 w-4 text-pink-600" />;
      default: return <User className="h-4 w-4 text-slate-400" />;
    }
  };

  const getRoleBadgeStyles = (role: string) => {
    const variants: Record<string, string> = {
      super_admin: 'bg-purple-50 text-purple-600',
      center_owner: 'bg-blue-50 text-blue-600',
      center_admin: 'bg-emerald-50 text-emerald-600',
      staff: 'bg-orange-50 text-orange-600',
      beautician: 'bg-pink-50 text-pink-600',
      customer: 'bg-slate-50 text-slate-400',
    };
    return variants[role] || 'bg-slate-50 text-slate-400';
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('th-TH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return email.slice(0, 2).toUpperCase();
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-6">
          <div className="relative h-20 w-20 mx-auto">
            <div className="absolute inset-0 bg-pink-500/10 blur-2xl rounded-full animate-pulse" />
            <RefreshCw className="h-12 w-12 animate-spin mx-auto text-pink-600 relative" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse italic">Synchronizing Identity Nodes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Overview Metrics Grid - Operational Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: t('userManagement.totalUserRegistry' as any) || 'Total Registry', val: stats?.total || 0, sub: t('userManagement.activeAuthorizationNodes' as any) || 'Global Entities', icon: Users, color: 'text-slate-950', bg: 'bg-slate-50' },
          { label: t('userManagement.verifiedEntities' as any) || 'Authorized', val: stats?.active || 0, sub: t('userManagement.nominalOperationalState' as any) || 'Nominal_State', icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: t('userManagement.inactiveUnits' as any) || 'Suspended', val: stats?.inactive || 0, sub: t('userManagement.decommissionedAccess' as any) || 'Restricted_Nodes', icon: UserX, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: t('userManagement.temporalSynchronicity' as any) || 'Temporal_Sync', val: stats?.recentlyActive || 0, sub: t('userManagement.activeSync7d' as any) || 'Active_7D_Flux', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' }
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
                <div className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">{node.val.toLocaleString()}</div>
                <p className="text-[9px] font-black uppercase tracking-widest mt-4 text-slate-400 italic group-hover:text-slate-600 transition-colors">{node.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Role Distribution Matrix interface */}
      <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/10">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
          <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
            <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
              <Shield className="h-8 w-8 text-pink-600 group-hover:text-white" />
            </div>
            {t('userManagement.authSectorMatrix' as any) || 'Authorization_Sector_Matrix'}
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">{t('userManagement.globalIdentityDesc' as any) || 'Personnel distribution across authorization vectors'}</CardDescription>
        </CardHeader>
        <CardContent className="p-10 lg:p-12 bg-white">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {[
              { role: 'super_admin', label: t('userManagement.roles.super_admin' as any) || 'SUPER_ADMIN', icon: Crown, color: 'purple' },
              { role: 'center_owner', label: t('userManagement.roles.center_owner' as any) || 'OWNER_NODE', icon: Building2, color: 'blue' },
              { role: 'center_admin', label: t('userManagement.roles.center_admin' as any) || 'ADMIN_VECTOR', icon: Shield, color: 'emerald' },
              { role: 'staff', label: t('userManagement.roles.staff' as any) || 'OPERATOR', icon: Briefcase, color: 'orange' },
              { role: 'beautician', label: t('userManagement.roles.beautician' as any) || 'TECHNICIAN', icon: Scissors, color: 'pink' },
              { role: 'customer', label: t('userManagement.roles.customer' as any) || 'CLIENT_UNIT', icon: User, color: 'slate' },
            ].map(({ role, label, icon: Icon, color }) => (
              <div key={role} className="flex flex-col items-center gap-6 p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-pink-500/20 transition-all duration-700 group/role shadow-sm">
                <div className={cn("p-4 rounded-2xl border border-slate-50 shadow-inner transition-transform duration-700 group-hover/role:scale-110 group-hover/role:bg-white", `bg-${color}-50`)}>
                  <Icon className={cn("h-8 w-8", `text-${color}-600`)} />
                </div>
                <div className="text-center space-y-1">
                  <div className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{stats?.byRole?.[role] || 0}</div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic group-hover/role:text-pink-600 transition-colors">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Primary Registry interface */}
      <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative group transition-all duration-700 hover:border-pink-500/10">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 bg-slate-50/30">
          <div className="flex flex-col lg:flex-row gap-10 items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter uppercase leading-none">{t('userManagement.registryTitle' as any) || 'Temporal_Identity_Registry'}</CardTitle>
              <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">{t('userManagement.registryDesc' as any) || 'Synchronized database of all authorized network nodes'}</CardDescription>
            </div>
            
            <div className="flex gap-4 flex-wrap justify-center">
              <div className="relative group/search">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within/search:text-pink-600 transition-colors" />
                <Input
                  placeholder={t('userManagement.searchPlaceholder' as any) || 'Search_Identity_Nodes...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="h-14 pl-14 pr-8 rounded-2xl border-slate-100 bg-white text-slate-950 placeholder:text-slate-300 focus:border-pink-500/30 focus:ring-pink-500/10 transition-all text-sm font-bold italic w-[280px] shadow-inner"
                />
              </div>

              <div className="flex gap-4">
                <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setOffset(0); }}>
                  <SelectTrigger className="h-14 w-[180px] rounded-2xl border-slate-100 bg-white px-6 text-[10px] font-black uppercase tracking-widest text-slate-950 focus:ring-pink-500/10 appearance-none transition-all italic shadow-inner">
                    <SelectValue placeholder="Access_Protocol" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-100 rounded-2xl shadow-premium">
                    <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-50 focus:text-pink-600">Global_Nodes</SelectItem>
                    <SelectItem value="super_admin" className="text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-50 focus:text-pink-600">SUPER_ADMIN</SelectItem>
                    <SelectItem value="center_owner" className="text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-50 focus:text-pink-600">OWNER_NODE</SelectItem>
                    <SelectItem value="center_admin" className="text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-50 focus:text-pink-600">ADMIN_VECTOR</SelectItem>
                    <SelectItem value="staff" className="text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-50 focus:text-pink-600">OPERATOR</SelectItem>
                    <SelectItem value="beautician" className="text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-50 focus:text-pink-600">TECHNICIAN</SelectItem>
                    <SelectItem value="customer" className="text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-50 focus:text-pink-600">CLIENT_UNIT</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-slate-100 bg-white hover:bg-slate-50 transition-all shadow-inner group/refresh" onClick={fetchUsers}>
                  <RefreshCw className={cn("h-5 w-5 text-slate-300 group-hover/refresh:text-pink-600 transition-all", loading && "animate-spin")} />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 bg-slate-50/30">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-white/50 border-b border-slate-100 hover:bg-white/50">
                  <TableHead className="px-10 py-10 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('userManagement.identityNode' as any) || 'Identity_Node'}</TableHead>
                  <TableHead className="px-10 py-10 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('userManagement.protocol' as any) || 'Protocol'}</TableHead>
                  <TableHead className="px-10 py-10 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('userManagement.centerUplink' as any) || 'Network_Uplink'}</TableHead>
                  <TableHead className="px-10 py-10 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('userManagement.operationalState' as any) || 'Operational_State'}</TableHead>
                  <TableHead className="px-10 py-10 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">{t('userManagement.lastTemporalSync' as any) || 'Temporal_Sync'}</TableHead>
                  <TableHead className="px-10 py-10 text-right w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100 bg-white">
                <AnimatePresence mode="popLayout">
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-40 text-slate-300 uppercase tracking-[0.5em] font-black text-[11px] italic">
                        NO_IDENTITIES_DETECTED_IN_SECTOR
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user, idx) => (
                      <motion.tr 
                        key={user.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="group/row transition-all duration-500 hover:bg-slate-50 relative"
                      >
                        <TableCell className="px-10 py-10">
                          <div className="flex items-center gap-8">
                            <div className="relative group/avatar">
                              <Avatar className="h-14 w-14 rounded-2xl border-2 border-white shadow-premium transition-transform duration-700 group-hover/avatar:scale-110">
                                <AvatarImage src={user.avatar_url || undefined} className="object-cover" />
                                <AvatarFallback className="bg-slate-50 text-slate-400 font-black italic uppercase">
                                  {getInitials(user.full_name, user.email)}
                                </AvatarFallback>
                              </Avatar>
                              {user.is_active && (
                                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm animate-pulse" />
                              )}
                            </div>
                            <div className="space-y-1.5">
                              <div className="text-xl font-black text-slate-950 tracking-tighter italic uppercase group-hover/row:text-pink-600 transition-colors leading-none">{user.full_name || t('userManagement.undefinedId' as any) || 'Undefined_Entity'}</div>
                              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic leading-none">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-10 py-10">
                          <div className="flex items-center gap-4">
                            {getRoleIcon(user.role)}
                            <Badge className={cn("px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-none shadow-sm italic leading-none", getRoleBadgeStyles(user.role))}>
                              {user.role.toUpperCase()}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="px-10 py-10">
                          <div className="flex items-center gap-4 group/node cursor-pointer">
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 shadow-inner group-hover/row:bg-pink-50 transition-all duration-700">
                              <Building2 className="h-4 w-4 text-slate-300 group-hover/row:text-pink-600" />
                            </div>
                            <span className="text-sm font-black text-slate-500 italic group-hover/row:text-slate-950 transition-colors uppercase tracking-tight leading-none">{user.centers?.name || t('userManagement.standaloneUnit' as any) || 'STANDALONE_NODE'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-10 py-10">
                          <div className="flex items-center gap-4">
                            <Switch
                              checked={user.is_active}
                              onCheckedChange={() => toggleUserStatus(user.id, user.is_active)}
                              className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-rose-500"
                            />
                            <span className={cn("text-[9px] font-black uppercase tracking-widest italic", user.is_active ? "text-emerald-600" : "text-rose-600")}>
                              {user.is_active ? 'NOMINAL' : 'RESTRICTED'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-10 py-10">
                          <div className="space-y-1">
                            <div className="text-base font-black text-slate-950 italic uppercase tracking-tighter leading-none">{user.last_seen_at ? formatDate(user.last_seen_at) : t('userManagement.neverSynced' as any) || 'AWAITING_SYNC'}</div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">{t('userManagement.established' as any) || 'INIT'}: {formatDate(user.created_at)}</p>
                          </div>
                        </TableCell>
                        <TableCell className="px-10 py-10 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:text-pink-600 transition-all duration-500 shadow-inner group/btn">
                                <MoreVertical className="h-6 w-6 text-slate-300 group-hover/btn:text-pink-600" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white border-slate-100 rounded-3xl p-3 min-w-[220px] shadow-premium selection:bg-pink-500/10">
                              <DropdownMenuLabel className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Identity Management</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-slate-50" />
                              <DropdownMenuItem className="rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-50 focus:text-pink-600 transition-all gap-4 mb-1" onClick={() => { setEditUser(user); setEditModalOpen(true); }}>
                                <Shield className="h-5 w-5 text-pink-500" />
                                Reallocate_Protocol
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-blue-50 focus:text-blue-600 transition-all gap-4 mb-1">
                                <Activity className="h-5 w-5 text-blue-500" />
                                Inference_History
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-slate-50" />
                              <DropdownMenuItem className="rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-rose-50 focus:text-rose-600 transition-all gap-4 text-rose-600" onClick={() => toggleUserStatus(user.id, user.is_active)}>
                                {user.is_active ? <UserX className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
                                {user.is_active ? 'Decommission_Unit' : 'Authorize_Unit'}
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

          {/* Pagination Telemetry interface */}
          <div className="p-10 border-t border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-6">
              <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 shadow-inner">
                <Fingerprint className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">
                Registry_Index: <span className="text-slate-950">{offset + 1} — {Math.min(offset + limit, total)}</span> <span className="text-slate-200 mx-2">//</span> Total_Identities: <span className="text-pink-600">{total}</span>
              </p>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                size="sm"
                className="rounded-2xl border-slate-200 bg-white h-14 px-8 text-[10px] font-black uppercase tracking-widest italic shadow-sm hover:bg-slate-50 transition-all disabled:opacity-20"
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-3" />
                Prev_Sector
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-2xl border-slate-200 bg-white h-14 px-8 text-[10px] font-black uppercase tracking-widest italic shadow-sm hover:bg-slate-50 transition-all disabled:opacity-20"
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= total}
              >
                Next_Sector
                <ChevronRight className="h-4 w-4 ml-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Role Modal interface */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="bg-white border-slate-100 rounded-[3.5rem] p-12 max-w-lg shadow-premium overflow-hidden selection:bg-pink-500/10">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
          <DialogHeader className="mb-10 text-center space-y-4">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 shadow-sm">
              <Shield className="h-8 w-8" />
            </div>
            <DialogTitle className="text-3xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">Protocol_Reallocation</DialogTitle>
            <CardDescription className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Adjust entity authorization parameters</CardDescription>
          </DialogHeader>
          {editUser && (
            <div className="space-y-10">
              <div className="flex items-center gap-8 p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 shadow-inner group/card">
                <Avatar className="h-20 w-20 rounded-[1.5rem] border-2 border-white shadow-premium group-hover/card:scale-105 transition-transform duration-700">
                  <AvatarImage src={editUser.avatar_url || undefined} className="object-cover" />
                  <AvatarFallback className="bg-white text-slate-300 font-black italic">{getInitials(editUser.full_name, editUser.email)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <div className="text-2xl font-black text-slate-950 italic tracking-tight uppercase leading-none">{editUser.full_name || 'Undefined_Entity'}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{editUser.email}</div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic ml-4 leading-none">Current_Auth_Level</label>
                  <div className="px-8 py-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between shadow-inner group/badge">
                    <Badge className={cn("px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest italic border-none shadow-sm leading-none group-hover/badge:scale-105 transition-transform", getRoleBadgeStyles(editUser.role))}>
                      {editUser.role.toUpperCase()}
                    </Badge>
                    <Info className="h-4 w-4 text-slate-200" />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic ml-4 leading-none">Initialize_Protocol_Shift</label>
                  <Select onValueChange={(v) => changeUserRole(editUser.id, v)}>
                    <SelectTrigger className="h-16 rounded-2xl border-slate-100 bg-white text-slate-950 focus:ring-pink-500/10 focus:border-pink-500/30 transition-all px-8 text-base font-black italic shadow-sm uppercase tracking-tight">
                      <SelectValue placeholder="Select_Target_Protocol..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-100 rounded-2xl shadow-premium">
                      <SelectItem value="super_admin" className="text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-50 focus:text-pink-600">SUPER_ADMIN</SelectItem>
                      <SelectItem value="center_owner" className="text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-50 focus:text-pink-600">OWNER_NODE</SelectItem>
                      <SelectItem value="center_admin" className="text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-50 focus:text-pink-600">ADMIN_VECTOR</SelectItem>
                      <SelectItem value="staff" className="text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-50 focus:text-pink-600">OPERATOR</SelectItem>
                      <SelectItem value="beautician" className="text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-50 focus:text-pink-600">TECHNICIAN</SelectItem>
                      <SelectItem value="customer" className="text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-50 focus:text-pink-600">CLIENT_UNIT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 flex gap-6">
                <Button variant="outline" size="xl" className="flex-1 h-18 rounded-2xl font-black uppercase tracking-widest text-[10px] italic border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm" onClick={() => setEditModalOpen(false)}>
                  Abort_Command
                </Button>
                <Button className="flex-1 h-18 rounded-2xl font-black uppercase tracking-widest text-[10px] italic bg-slate-950 text-white shadow-2xl hover:bg-pink-600 transition-all border-none" onClick={() => setEditModalOpen(false)}>
                  Commit_Shift
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
