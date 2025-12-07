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
import { Skeleton } from '@/components/ui/skeleton';

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
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<DashboardLoading />}>
        <CustomerDashboard customerId={user.id} />
      </Suspense>
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
