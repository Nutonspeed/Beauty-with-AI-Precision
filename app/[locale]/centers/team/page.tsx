'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { useLocalizePath } from '@/lib/i18n/locale-link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Upload, 
  Download,
  Mail,
  Clock,
  CheckCircle2,
  Loader2,
  User
} from 'lucide-react';
import BulkTeamInvite from '@/components/center/bulk-team-invite';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SalesLeaderboard } from '@/components/sales/SalesLeaderboard';

interface Invitation {
  id: string;
  email: string;
  invited_role: string;
  status: 'pending' | 'accepted' | 'expired';
  created_at: string;
  expires_at: string;
}

interface TeamMember {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

export default function CenterTeamPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const lp = useLocalizePath();
  
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [bulkInviteOpen, setBulkInviteOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user || !['center_owner', 'center_admin', 'super_admin'].includes(user.role)) {
      router.push(lp('/unauthorized'));
      return;
    }

    loadData();
  }, [user, authLoading, router, lp]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load team members and invitations
      // TODO: Implement actual API calls
      setTeamMembers([]);
      setInvitations([]);
    } catch (error) {
      console.error('Failed to load team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkInviteSuccess = () => {
    setBulkInviteOpen(false);
    loadData();
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950 selection:bg-pink-500/10">
      <Header />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto flex-1">
          {/* Team Header Interface */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-slate-100">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
                <Users className="mr-3 h-3.5 w-3.5" />
                Human Capital Orchestration Node
              </Badge>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase">
                Team<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em] font-black uppercase">Management</span>
              </h1>
              <p className="text-xl text-slate-500 font-light max-w-2xl italic leading-relaxed tracking-tight">
                Sync specialized aesthetic personnel and authorize operational credentials.
              </p>
            </motion.div>
            
            <div className="flex flex-col sm:flex-row gap-6 shrink-0">
              <Button size="xl" variant="outline" className="h-16 px-10 rounded-2xl border-slate-200 bg-white text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:bg-slate-50 italic shadow-premium" onClick={() => {
                const csv = 'email,name,role\nexample@center.com,John Doe,sales_staff\n';
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'team-template.csv';
                a.click();
              }}>
                <Download className="mr-4 h-5 w-5" />
                Schema Template
              </Button>
              <Button size="xl" variant="premium" className="h-16 px-10 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white italic" onClick={() => setBulkInviteOpen(true)}>
                <Upload className="mr-4 h-5 w-5" />
                Bulk Authorization
              </Button>
            </div>
          </div>

          {/* Operational Capacity Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'Total Active Nodes', val: teamMembers.length, color: 'text-slate-950', icon: Users, bg: 'bg-slate-50' },
              { label: 'Pending Authorizations', val: invitations.filter(i => i.status === 'pending').length, color: 'text-pink-600', icon: Clock, bg: 'bg-pink-50' },
              { label: 'Successful Syncs (MTD)', val: invitations.filter(i => i.status === 'accepted').length, color: 'text-emerald-600', icon: CheckCircle2, bg: 'bg-emerald-50' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-slate-100 bg-white shadow-premium rounded-[3rem] transition-all duration-700 hover:border-pink-500/20 group relative overflow-hidden h-full">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                  <CardContent className="p-10 flex items-center justify-between">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic group-hover:text-slate-900 transition-colors">{stat.label}</p>
                      <div className={cn("text-5xl font-black tracking-tighter italic uppercase", stat.color)}>{stat.val}</div>
                    </div>
                    <div className={cn("h-16 w-16 rounded-[1.5rem] flex items-center justify-center border transition-all duration-700 group-hover:scale-110 shadow-sm", 
                      stat.bg, 
                      stat.color.includes('slate') ? 'border-slate-100' : stat.color.includes('pink') ? 'border-pink-100' : 'border-emerald-100'
                    )}>
                      <stat.icon className={cn("h-8 w-8", stat.color)} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <SalesLeaderboard />

          <div className="grid gap-12 lg:grid-cols-2">
            {/* Active Personnel Registry */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative transition-all duration-700 hover:border-pink-500/10 group h-full">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 flex flex-row items-center justify-between">
                  <div className="space-y-3">
                    <CardTitle className="text-3xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">Active Registry</CardTitle>
                    <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Personnel currently synced to center nodes</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-10 lg:p-12 bg-slate-50/30">
                  {teamMembers.length === 0 ? (
                    <div className="py-32 text-center space-y-10 bg-white italic rounded-[2.5rem] border border-slate-100 shadow-inner">
                      <div className="h-24 w-24 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200 mx-auto animate-pulse">
                        <Users className="h-12 w-12" />
                      </div>
                      <div className="space-y-4">
                        <p className="text-2xl font-black text-slate-950 uppercase tracking-tighter">Registry Empty</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">No active personnel nodes detected</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {teamMembers.map(member => (
                        <div key={member.id} className="group/item flex items-center justify-between p-8 rounded-[2.5rem] bg-white border border-slate-100 hover:border-pink-500/20 hover:shadow-premium transition-all duration-700 relative overflow-hidden">
                          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-slate-100 group-hover/item:bg-pink-600 transition-all duration-700" />
                          <div className="flex items-center gap-8 relative z-10">
                            <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover/item:bg-pink-50 transition-all duration-700">
                              <User className="h-7 w-7 text-slate-300 group-hover/item:text-pink-600 transition-colors" />
                            </div>
                            <div className="space-y-1.5">
                              <p className="text-xl font-black text-slate-950 italic uppercase leading-none group-hover/item:text-pink-600 transition-colors">{member.full_name || member.email}</p>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{member.email}</p>
                            </div>
                          </div>
                          <Badge className="bg-slate-50 text-slate-400 border-none rounded-full px-6 py-2 text-[10px] font-black uppercase tracking-widest italic group-hover/item:bg-pink-600 group-hover/item:text-white transition-all shadow-sm">
                            {member.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Authorization Queue */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card className="border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative transition-all duration-700 hover:border-pink-500/10 group h-full">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-8 border-b border-slate-50 flex flex-row items-center justify-between">
                  <div className="space-y-3">
                    <CardTitle className="text-3xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">Pending Syncs</CardTitle>
                    <CardDescription className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Temporal authorization requests active</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-10 lg:p-12 bg-slate-50/30">
                  {invitations.filter(i => i.status === 'pending').length === 0 ? (
                    <div className="py-32 text-center space-y-10 bg-white italic rounded-[2.5rem] border border-slate-100 shadow-inner">
                      <div className="h-24 w-24 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200 mx-auto animate-pulse">
                        <Mail className="h-12 w-12" />
                      </div>
                      <div className="space-y-4">
                        <p className="text-2xl font-black text-slate-950 uppercase tracking-tighter">Queue Empty</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">No pending synchronization requests</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {invitations.filter(i => i.status === 'pending').map(invite => (
                        <div key={invite.id} className="group/item flex items-center justify-between p-8 rounded-[2.5rem] bg-white border border-slate-100 hover:border-blue-500/20 hover:shadow-premium transition-all duration-700 relative overflow-hidden">
                          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-slate-100 group-hover/item:bg-blue-600 transition-all duration-700" />
                          <div className="flex items-center gap-8 relative z-10">
                            <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover/item:bg-blue-50 transition-all duration-700">
                              <Mail className="h-7 w-7 text-slate-300 group-hover/item:text-blue-600 transition-colors" />
                            </div>
                            <div className="space-y-1.5">
                              <p className="text-xl font-black text-slate-950 italic uppercase leading-none group-hover/item:text-blue-600 transition-colors">{invite.email}</p>
                              <p className="text-[10px] font-black uppercase tracking-widest text-rose-500/60 italic leading-none">
                                EXPIRES: {new Date(invite.expires_at).toLocaleDateString('th-TH')}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="border-blue-500/30 text-blue-600 bg-blue-500/5 rounded-full px-6 py-2 text-[10px] font-black uppercase tracking-widest italic group-hover/item:bg-blue-600 group-hover/item:text-white transition-all shadow-sm">
                            {invite.invited_role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />

      <BulkTeamInvite 
        open={bulkInviteOpen}
        onOpenChange={setBulkInviteOpen}
        onSuccess={handleBulkInviteSuccess}
      />
    </div>
  );
}
