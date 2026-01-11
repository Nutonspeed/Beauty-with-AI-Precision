/**
 * Analytics Page
 * Phase 2 Week 4 Task 4.3
 * 
 * Customer analytics dashboard page
 */

import { Suspense } from 'react';
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CustomerDashboard from '@/components/analytics/customer-dashboard';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

// Metadata is now defined at the bottom of the file to avoid duplication errors

// Build-time guard: render this data-heavy dashboard at runtime to avoid
// prerendering per-locale during Vercel build.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// =============================================
// Loading Component
// =============================================

function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-9 w-24" />
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>

      <Skeleton className="h-[400px]" />
    </div>
  );
}

// =============================================
// Page Component
// =============================================

export default async function AnalyticsPage() {
  const supabase = await createServerClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
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
          {/* Analytics Header Interface */}
          <div className="space-y-6 pb-12 border-b border-white/5">
            <Badge variant="outline" className="px-4 py-1 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10">
              <Activity className="mr-3 h-3.5 w-3.5 animate-pulse" />
              Temporal Transformation Monitor
            </Badge>
            <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9] italic">
              Aesthetic<br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent not-italic">Intelligence</span>
            </h1>
            <p className="text-xl text-slate-500 font-light tracking-widest max-w-2xl italic leading-relaxed">
              Orchestrate your aesthetic evolution through precision diagnostic telemetry and temporal mapping.
            </p>
          </div>

          <Suspense fallback={<DashboardLoading />}>
            <CustomerDashboard customerId={user.id} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// =============================================
// Metadata
// =============================================

export const metadata = {
  title: 'Analytics Dashboard - Beauty with AI Precision',
  description: 'Track your skin improvement over time with detailed analytics',
};
