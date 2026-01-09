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
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  clinic_id: string | null;
  avatar_url: string | null;
  phone: string | null;
  is_active: boolean;
  last_seen_at: string | null;
  created_at: string;
  clinics: { id: string; name: string } | null;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  recentlyActive: number;
  byRole: Record<string, number>;
}

interface Clinic {
  id: string;
  name: string;
}

export default function GlobalUserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Filters
  const [roleFilter, setRoleFilter] = useState('all');
  const [clinicFilter, setClinicFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
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
      if (clinicFilter !== 'all') params.append('clinicId', clinicFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const res = await fetch(`/api/admin/users/all?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();
      setUsers(data.users || []);
      setStats(data.stats || null);
      setClinics(data.clinics || []);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Error', description: 'Failed to fetch users', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [roleFilter, clinicFilter, statusFilter, offset, searchTerm, toast]);

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
      toast({ title: 'Success', description: `User ${!isActive ? 'activated' : 'deactivated'}` });
      fetchUsers();
    } catch {
      toast({ title: 'Error', description: 'Failed to update user', variant: 'destructive' });
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
      toast({ title: 'Success', description: 'Role updated' });
      fetchUsers();
      setEditModalOpen(false);
    } catch {
      toast({ title: 'Error', description: 'Failed to update role', variant: 'destructive' });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <Crown className="h-4 w-4 text-purple-500" />;
      case 'clinic_owner': return <Building2 className="h-4 w-4 text-blue-500" />;
      case 'clinic_admin': return <Shield className="h-4 w-4 text-green-500" />;
      case 'staff': return <Briefcase className="h-4 w-4 text-orange-500" />;
      case 'beautician': return <Scissors className="h-4 w-4 text-pink-500" />;
      default: return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, string> = {
      super_admin: 'bg-purple-100 text-purple-700',
      clinic_owner: 'bg-blue-100 text-blue-700',
      clinic_admin: 'bg-green-100 text-green-700',
      staff: 'bg-orange-100 text-orange-700',
      beautician: 'bg-pink-100 text-pink-700',
      customer: 'bg-gray-100 text-gray-700',
    };
    return variants[role] || 'bg-gray-100 text-gray-700';
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

  const filteredUsers = users.filter(u =>
    !searchTerm ||
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Overview Metrics Grid - Operational Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total User Registry', val: stats?.total || 0, sub: 'Active Authorization Nodes', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Verified Entities', val: stats?.active || 0, sub: 'Nominal Operational State', icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Inactive Units', val: stats?.inactive || 0, sub: 'Decommissioned Access', icon: UserX, color: 'text-rose-400', bg: 'bg-rose-500/10' },
          { label: 'Temporal Synchronicity', val: stats?.recentlyActive || 0, sub: 'Active Sync (7d)', icon: Clock, color: 'text-cyan-400', bg: 'bg-cyan-500/10' }
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

      {/* Role Distribution Matrix */}
      <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
        <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
          <CardTitle className="text-2xl font-bold text-white tracking-tight italic flex items-center gap-4">
            <Shield className="h-6 w-6 text-pink-400" />
            Authorization Sector Matrix
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">Global identity node distribution by protocol</CardDescription>
        </CardHeader>
        <CardContent className="p-10 lg:p-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { role: 'super_admin', label: 'Super Admin', icon: Crown, color: 'purple' },
              { role: 'clinic_owner', label: 'Owner Node', icon: Building2, color: 'blue' },
              { role: 'clinic_admin', label: 'Admin Vector', icon: Shield, color: 'green' },
              { role: 'staff', label: 'Operator', icon: Briefcase, color: 'orange' },
              { role: 'beautician', label: 'Technician', icon: Scissors, color: 'pink' },
              { role: 'customer', label: 'Client Unit', icon: User, color: 'gray' },
            ].map(({ role, label, icon: Icon, color }) => (
              <div key={role} className="flex flex-col items-center gap-4 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-pink-500/20 transition-all duration-500 group/role">
                <div className={cn("p-3 rounded-2xl border border-white/5 shadow-inner transition-transform duration-700 group-hover/role:scale-110", `bg-${color}-500/10`)}>
                  <Icon className={cn("h-6 w-6", `text-${color}-400`)} />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-white italic tracking-tighter">{stats?.byRole?.[role] || 0}</div>
                  <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Primary Registry Table */}
      <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5">
          <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-white tracking-tight italic">Personnel Registry</CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Live identity node synchronization</CardDescription>
            </div>
            
            <div className="flex gap-3 flex-wrap justify-center">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-pink-500 transition-colors" />
                <Input
                  placeholder="Search Identity Node..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="h-14 pl-12 pr-6 rounded-2xl border-white/5 bg-white/[0.03] text-white placeholder:text-slate-700 focus:border-pink-500/30 focus:ring-pink-500/20 transition-all text-sm font-bold italic w-[240px]"
                />
              </div>

              <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setOffset(0); }}>
                <SelectTrigger className="h-14 w-[160px] rounded-2xl border border-white/5 bg-white/[0.03] px-6 text-[10px] font-black uppercase tracking-widest text-white focus:ring-pink-500/20 appearance-none transition-all italic">
                  <SelectValue placeholder="Protocol" />
                </SelectTrigger>
                <SelectContent className="bg-[#020617] border-white/10 rounded-2xl">
                  <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest italic">GLOBAL_PROTOCOL</SelectItem>
                  <SelectItem value="super_admin" className="text-[10px] font-black uppercase tracking-widest italic">SUPER_ADMIN</SelectItem>
                  <SelectItem value="clinic_owner" className="text-[10px] font-black uppercase tracking-widest italic">OWNER_NODE</SelectItem>
                  <SelectItem value="clinic_admin" className="text-[10px] font-black uppercase tracking-widest italic">ADMIN_VECTOR</SelectItem>
                  <SelectItem value="staff" className="text-[10px] font-black uppercase tracking-widest italic">OPERATOR</SelectItem>
                  <SelectItem value="beautician" className="text-[10px] font-black uppercase tracking-widest italic">TECHNICIAN</SelectItem>
                  <SelectItem value="customer" className="text-[10px] font-black uppercase tracking-widest italic">CLIENT_UNIT</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setOffset(0); }}>
                <SelectTrigger className="h-14 w-[160px] rounded-2xl border border-white/5 bg-white/[0.03] px-6 text-[10px] font-black uppercase tracking-widest text-white focus:ring-pink-500/20 appearance-none transition-all italic">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#020617] border-white/10 rounded-2xl">
                  <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest italic">ANY_STATE</SelectItem>
                  <SelectItem value="active" className="text-[10px] font-black uppercase tracking-widest italic">ACTIVE</SelectItem>
                  <SelectItem value="inactive" className="text-[10px] font-black uppercase tracking-widest italic">INACTIVE</SelectItem>
                </SelectContent>
              </Select>

              <Select value={clinicFilter} onValueChange={(v) => { setClinicFilter(v); setOffset(0); }}>
                <SelectTrigger className="h-14 w-[180px] rounded-2xl border border-white/5 bg-white/[0.03] px-6 text-[10px] font-black uppercase tracking-widest text-white focus:ring-pink-500/20 appearance-none transition-all italic">
                  <SelectValue placeholder="Clinical Uplink" />
                </SelectTrigger>
                <SelectContent className="bg-[#020617] border-white/10 rounded-2xl max-h-[300px]">
                  <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest italic">GLOBAL_NETWORK</SelectItem>
                  {clinics.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-[10px] font-black uppercase tracking-widest italic">{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10" onClick={fetchUsers}>
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
                  <TableHead className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Identity Node</TableHead>
                  <TableHead className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Protocol</TableHead>
                  <TableHead className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Clinical Uplink</TableHead>
                  <TableHead className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Operational State</TableHead>
                  <TableHead className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Last Temporal Sync</TableHead>
                  <TableHead className="px-10 py-8 text-right w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-white/5">
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20 text-slate-600 uppercase tracking-[0.4em] font-black text-[10px] italic">
                      NO_IDENTITY_NODES_DETECTED
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user, idx) => (
                    <motion.tr 
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group/row transition-all duration-500 hover:bg-white/[0.03]"
                    >
                      <TableCell className="px-10 py-8">
                        <div className="flex items-center gap-6">
                          <Avatar className="h-12 w-12 rounded-2xl border border-white/10 group-hover/row:border-pink-500/30 transition-all shadow-inner">
                            <AvatarImage src={user.avatar_url || undefined} className="object-cover" />
                            <AvatarFallback className="bg-white/[0.03] text-slate-500 font-black italic">
                              {getInitials(user.full_name, user.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <div className="text-lg font-bold text-white tracking-tight italic group-hover/row:text-pink-400 transition-colors">{user.full_name || 'UNDEFINED_ID'}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-8">
                        <div className="flex items-center gap-3">
                          {getRoleIcon(user.role)}
                          <Badge className={cn("px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-none shadow-inner", getRoleBadge(user.role).replace('bg-', 'bg-opacity-10 text-').replace('100', '400'))}>
                            {user.role.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 py-8">
                        <span className="text-sm font-bold text-slate-300 italic uppercase tracking-tight">{user.clinics?.name || 'STANDALONE_UNIT'}</span>
                      </TableCell>
                      <TableCell className="px-8 py-8">
                        <Switch
                          checked={user.is_active}
                          onCheckedChange={() => toggleUserStatus(user.id, user.is_active)}
                          className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-rose-500"
                        />
                      </TableCell>
                      <TableCell className="px-8 py-8">
                        <div className="space-y-1">
                          <div className="text-sm font-bold text-slate-300 italic">{user.last_seen_at ? formatDate(user.last_seen_at) : 'NEVER_SYNCED'}</div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Established: {formatDate(user.created_at)}</p>
                        </div>
                      </TableCell>
                      <TableCell className="px-10 py-8 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/10 text-slate-500">
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#020617] border-white/10 rounded-2xl p-2 min-w-[180px]">
                            <DropdownMenuLabel className="px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Node control</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/5" />
                            <DropdownMenuItem className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-600 focus:text-white transition-colors" onClick={() => { setEditUser(user); setEditModalOpen(true); }}>
                              <Shield className="mr-3 h-4 w-4" /> Reallocate Protocol
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest italic cursor-pointer focus:bg-pink-600 focus:text-white transition-colors" onClick={() => toggleUserStatus(user.id, user.is_active)}>
                              {user.is_active ? <UserX className="mr-3 h-4 w-4" /> : <UserCheck className="mr-3 h-4 w-4" />}
                              {user.is_active ? 'Decommission Unit' : 'Authorize Unit'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Telemetry */}
          <div className="p-10 border-t border-white/5 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">
              Displaying Identity Range: {offset + 1} — {Math.min(offset + limit, total)} <span className="mx-2">::</span> Sector Total: {total}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-white/10 bg-white/5 h-12 px-6 hover:bg-white/10 transition-all"
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span className="text-[9px] font-black uppercase tracking-widest">Previous_Sector</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-white/10 bg-white/5 h-12 px-6 hover:bg-white/10 transition-all"
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= total}
              >
                <span className="text-[9px] font-black uppercase tracking-widest">Next_Sector</span>
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Role Modal - Critical Command Interface */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="bg-[#020617] border-white/10 rounded-[3rem] p-10 max-w-md shadow-2xl backdrop-blur-3xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />
          <DialogHeader className="mb-10">
            <DialogTitle className="text-2xl font-bold text-white tracking-tight italic flex items-center gap-4">
              <Shield className="h-6 w-6 text-pink-500" />
              Reallocate Protocol
            </DialogTitle>
          </DialogHeader>
          {editUser && (
            <div className="space-y-10">
              <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                <Avatar className="h-16 w-16 rounded-2xl border border-white/10 shadow-xl">
                  <AvatarImage src={editUser.avatar_url || undefined} className="object-cover" />
                  <AvatarFallback className="bg-white/[0.03] text-slate-500 font-black italic">{getInitials(editUser.full_name, editUser.email)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-xl font-bold text-white italic tracking-tight">{editUser.full_name || 'UNDEFINED_ID'}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 mt-1">{editUser.email}</div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic ml-4">Current Authorization</label>
                  <div className="px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/10">
                    <Badge className={cn("px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-none shadow-inner", getRoleBadge(editUser.role).replace('bg-', 'bg-opacity-10 text-').replace('100', '400'))}>
                      {editUser.role.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic ml-4">Initialize New Protocol</label>
                  <Select onValueChange={(v) => changeUserRole(editUser.id, v)}>
                    <SelectTrigger className="h-16 rounded-2xl border-white/5 bg-white/[0.03] text-white focus:ring-pink-500/20 focus:border-pink-500/30 transition-all px-8 text-sm font-bold italic">
                      <SelectValue placeholder="Select Sector Protocol" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#020617] border-white/10 rounded-2xl">
                      <SelectItem value="super_admin" className="text-[10px] font-black uppercase tracking-widest italic">SUPER_ADMIN</SelectItem>
                      <SelectItem value="clinic_owner" className="text-[10px] font-black uppercase tracking-widest italic">OWNER_NODE</SelectItem>
                      <SelectItem value="clinic_admin" className="text-[10px] font-black uppercase tracking-widest italic">ADMIN_VECTOR</SelectItem>
                      <SelectItem value="staff" className="text-[10px] font-black uppercase tracking-widest italic">OPERATOR</SelectItem>
                      <SelectItem value="beautician" className="text-[10px] font-black uppercase tracking-widest italic">TECHNICIAN</SelectItem>
                      <SelectItem value="customer" className="text-[10px] font-black uppercase tracking-widest italic">CLIENT_UNIT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex gap-4">
                <Button variant="outline" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border-white/10 bg-white/5" onClick={() => setEditModalOpen(false)}>
                  ABORT_COMMAND
                </Button>
                <Button className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-pink-600 shadow-2xl shadow-pink-600/40" onClick={() => setEditModalOpen(false)}>
                  CONFIRM_REALLOCATION
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
