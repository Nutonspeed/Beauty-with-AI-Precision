/**
 * Analytics Page
 * Phase 2 Week 4 Task 4.3
 * 
 * Customer analytics dashboard showing trends and insights
 */

import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import CustomerDashboard from '@/components/analytics/customer-dashboard';
import { Metadata } from 'next';

// =============================================
// Metadata
// =============================================

export const metadata: Metadata = {
  title: 'Analytics Dashboard | Beauty with AI Precision',
  description: 'Track your skin improvement journey with detailed analytics and trends',
};

// =============================================
// Page Component
// =============================================

export default async function AnalyticsPage() {
  // Initialize Supabase client
  const supabase = await createServerClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login?redirect=/analysis/analytics');
  }

  // Get user profile to check role
  const { data: profile } = await supabase
    .from('users')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  return (
    <div className="md:container mx-auto px-4 py-8">
      {/* Welcome message */}
      {profile?.full_name && (
        <div className="mb-6">
          <p className="text-lg text-muted-foreground">
            Welcome back, <span className="font-semibold">{profile.full_name}</span>
          </p>
        </div>
      )}

      {/* Customer Dashboard */}
      <CustomerDashboard customerId={user.id} defaultPeriod="3m" />

      {/* Admin notice */}
      {isAdmin && (
        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-800">
          <p className="text-sm">
            <strong>Admin Note:</strong> You can view analytics for any user by
            providing their ID in the URL parameter: ?customerId=xxx
          </p>
        </div>
      )}
    </div>
  );
}
