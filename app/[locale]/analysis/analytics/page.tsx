/**
 * Analytics Page
 * Phase 2 Week 4 Task 4.3
 * 
 * Customer analytics dashboard showing trends and insights
 */

import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import ClientDashboard from '@/components/analytics/client-dashboard';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, TrendingUp, Sparkles } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analytics Dashboard | Beauty with AI Precision',
  description: 'Track your skin improvement journey with detailed analytics and trends',
};

export default async function AnalyticsPage() {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login?redirect=/analysis/analytics');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

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

        <div className="container relative z-10 py-12 md:py-20 px-6 max-w-7xl mx-auto flex-1">
          {/* Header Interface */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pb-12 border-b border-slate-100 mb-16">
            <div className="space-y-8">
              <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse italic">
                <TrendingUp className="mr-3 h-3.5 w-3.5" />
                Evolutionary Analytics Node
              </Badge>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.8] italic uppercase">
                Aesthetic<br />
                <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent not-italic block mt-6 tracking-[0.2em] font-black uppercase">Intelligence</span>
              </h1>
              {profile?.full_name && (
                <p className="text-xl text-slate-500 font-light italic leading-relaxed tracking-tight">
                  Welcome back, <span className="font-black text-slate-950 uppercase">{profile.full_name}</span>. Accessing your transformation telemetry.
                </p>
              )}
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-blue-600/5 rounded-[4rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
            <ClientDashboard clientId={user.id} defaultPeriod="3m" />
          </div>

          {isAdmin && (
            <Card className="mt-16 border-blue-100 bg-blue-50/30 backdrop-blur-xl rounded-[3rem] shadow-premium relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
                <Sparkles className="w-32 h-32 text-blue-600" />
              </div>
              <CardContent className="p-10 flex items-start gap-8 relative z-10">
                <div className="h-14 w-14 rounded-2xl bg-white border border-blue-100 flex items-center justify-center shadow-sm">
                  <Info className="h-8 w-8 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-black text-slate-950 italic uppercase leading-none">Admin Authorization Terminal</p>
                  <p className="text-sm text-slate-500 font-light italic leading-relaxed">
                    You can view analytics for any user by providing their ID in the URL parameter: <code className="bg-white px-3 py-1 rounded-lg border border-blue-100 font-bold text-blue-600 not-italic">?customerId=xxx</code>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
