"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { Loader2 } from 'lucide-react';
import type { UserRole } from '@/lib/auth/role-config';

// Import role-specific dashboards
import CustomerDashboard from '@/components/dashboard/customer-dashboard';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      console.log('[Dashboard] No user, redirecting to login...');
      router.push('/auth/login');
      return;
    }

    // Role-based redirects
    const role = user.role;
    console.log('[Dashboard] User role:', role);

    if (role === 'super_admin') {
      console.log('[Dashboard] Redirecting super_admin to /super-admin');
      setRedirecting(true);
      window.location.href = '/super-admin';
      return;
    }

    if (role === 'clinic_owner') {
      console.log('[Dashboard] Redirecting clinic_owner to /clinic');
      setRedirecting(true);
      window.location.href = '/clinic';
      return;
    }

    if (role === 'sales_staff') {
      console.log('[Dashboard] Redirecting sales_staff to /sales');
      setRedirecting(true);
      window.location.href = '/sales';
      return;
    }

    // customer stays on /dashboard
    console.log('[Dashboard] Customer staying on /dashboard');
  }, [user, authLoading, router]);

  if (authLoading || redirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">
            {redirecting ? 'กำลังเปลี่ยนหน้า...' : 'กำลังโหลด Dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  // Only customer role should see this
  return <CustomerDashboard role={user.role as UserRole} />;
}
