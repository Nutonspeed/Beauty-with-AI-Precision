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
import BulkTeamInvite from '@/components/clinic/bulk-team-invite';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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

export default function ClinicTeamPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const lp = useLocalizePath();
  
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [bulkInviteOpen, setBulkInviteOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user || !['clinic_owner', 'clinic_admin', 'super_admin'].includes(user.role)) {
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
    <div className="flex min-h-screen flex-col bg-[#020617] text-slate-200 selection:bg-pink-500/30">
      <Header />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 px-6 space-y-16 max-w-7xl mx-auto flex-1">
          {/* Team Header Interface */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Badge variant="outline" className="px-4 py-1 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10">
                <Users className="mr-3 h-3.5 w-3.5 animate-pulse" />
                Human Capital Orchestration Node
              </Badge>
              <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9] italic">
                Team<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent not-italic">Management</span>
              </h1>
              <p className="text-xl text-slate-500 font-light tracking-widest max-w-2xl italic leading-relaxed">
                Sync specialized clinical personnel and authorize operational credentials.
              </p>
            </motion.div>
            
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <Button size="xl" variant="outline" className="h-16 px-10 rounded-2xl border-white/5 bg-white/[0.03] text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:bg-white/10 italic" onClick={() => {
                const csv = 'email,name,role\nexample@clinic.com,John Doe,sales_staff\n';
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'team-template.csv';
                a.click();
              }}>
                <Download className="mr-3 h-5 w-5" />
                Schema Template
              </Button>
              <Button size="xl" variant="premium" className="h-16 px-10 rounded-2xl shadow-2xl shadow-pink-500/20 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95 border" onClick={() => setBulkInviteOpen(true)}>
                <Upload className="mr-3 h-5 w-5" />
                Bulk Authorization
              </Button>
            </div>
          </div>

          {/* Operational Capacity Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Total Active Nodes', val: teamMembers.length, color: 'text-white', icon: Users },
              { label: 'Pending Authorizations', val: invitations.filter(i => i.status === 'pending').length, color: 'text-pink-400', icon: Clock },
              { label: 'Successful Syncs (MTD)', val: invitations.filter(i => i.status === 'accepted').length, color: 'text-emerald-400', icon: CheckCircle2 }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] hover:bg-white/[0.03] transition-all duration-500 group shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                  <CardContent className="p-8 flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">{stat.label}</p>
                      <div className={cn("text-4xl font-black tracking-tighter italic", stat.color)}>{stat.val}</div>
                    </div>
                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner", stat.color.replace('text-', 'bg-').replace('400', '500/10'))}>
                      <stat.icon className={cn("h-6 w-6", stat.color)} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-10 lg:grid-cols-2">
            {/* Active Personnel Registry */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group h-full">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-row items-center justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-3xl font-bold text-white tracking-tight italic">Active Registry</CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Personnel currently synced to clinic nodes</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-10 lg:p-12">
                  {teamMembers.length === 0 ? (
                    <div className="py-20 text-center space-y-6">
                      <div className="h-20 w-20 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-slate-700 mx-auto">
                        <Users className="h-10 w-10" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Registry Empty</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {teamMembers.map(member => (
                        <div key={member.id} className="group/item flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-pink-500/20 transition-all duration-500 relative overflow-hidden">
                          <div className="absolute top-0 left-0 bottom-0 w-1 bg-white/5 group-hover/item:bg-pink-600 transition-colors" />
                          <div className="flex items-center gap-6">
                            <div className="h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner">
                              <User className="h-6 w-6 text-slate-500 group-hover/item:text-pink-400 transition-colors" />
                            </div>
                            <div className="space-y-1">
                              <p className="font-bold text-white italic group-hover/item:text-pink-400 transition-colors">{member.full_name || member.email}</p>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">{member.email}</p>
                            </div>
                          </div>
                          <Badge className="bg-white/[0.03] text-slate-400 border-none rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest italic group-hover/item:bg-pink-600/20 group-hover/item:text-pink-400">
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
              <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative group h-full">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
                <CardHeader className="p-10 lg:p-12 pb-6 border-b border-white/5 flex flex-row items-center justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-3xl font-bold text-white tracking-tight italic">Pending Syncs</CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Temporal authorization requests active</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-10 lg:p-12">
                  {invitations.filter(i => i.status === 'pending').length === 0 ? (
                    <div className="py-20 text-center space-y-6">
                      <div className="h-20 w-20 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-slate-700 mx-auto">
                        <Mail className="h-10 w-10" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Queue Empty</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {invitations.filter(i => i.status === 'pending').map(invite => (
                        <div key={invite.id} className="group/item flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 transition-all duration-500 relative overflow-hidden">
                          <div className="absolute top-0 left-0 bottom-0 w-1 bg-white/5 group-hover/item:bg-cyan-600 transition-colors" />
                          <div className="flex items-center gap-6">
                            <div className="h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner">
                              <Mail className="h-6 w-6 text-slate-500 group-hover/item:text-cyan-400 transition-colors" />
                            </div>
                            <div className="space-y-1">
                              <p className="font-bold text-white italic group-hover/item:text-cyan-400 transition-colors">{invite.email}</p>
                              <p className="text-[9px] font-black uppercase tracking-widest text-rose-500/60 italic">
                                EXPIRES: {new Date(invite.expires_at).toLocaleDateString('th-TH')}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 bg-cyan-500/5 rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest italic group-hover/item:bg-cyan-600 group-hover/item:text-white transition-all">
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
