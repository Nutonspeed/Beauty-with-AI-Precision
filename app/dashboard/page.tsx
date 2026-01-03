"use client"

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { Loader2 } from 'lucide-react';
import type { UserRole } from '@/lib/auth/role-config';
import { useLocalizePath } from '@/lib/i18n/locale-link';

// Import role-specific dashboards
import CustomerDashboard from '@/components/dashboard/customer-dashboard';

export default function DashboardPage() {
  const router = useRouter();
  const lp = useLocalizePath();
  const { user, loading: authLoading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    try {
      if (!user) {
        console.log('[Dashboard] No user, redirecting to login...');
        router.push(lp('/auth/login'));
        return;
      }

      // Role-based redirects
      const role = user.role;
      console.log('[Dashboard] User role:', role);

      if (role === 'super_admin') {
        console.log('[Dashboard] Redirecting super_admin to /super-admin');
        setRedirecting(true);
        window.location.href = lp('/super-admin');
        return;
      }

      if (role === 'clinic_owner') {
        console.log('[Dashboard] Redirecting clinic_owner to /clinic');
        setRedirecting(true);
        window.location.href = lp('/clinic');
        return;
      }

      if (role === 'sales_staff') {
        console.log('[Dashboard] Redirecting sales_staff to /sales');
        setRedirecting(true);
        window.location.href = lp('/sales');
        return;
      }

      // customer stays on /dashboard
      console.log('[Dashboard] Customer staying on /dashboard');
    } catch (error) {
      console.error('[Dashboard] Error in useEffect:', error);
      router.push(lp('/auth/login'));
    }
  }, [user, authLoading, router, lp]);

  if (authLoading || redirecting) {
    return (
      <div className="flex min-h-screen md:min-h-screen items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm w-full">
          <Loader2 className="h-8 w-8 md:h-12 md:w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground text-sm md:text-base">
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
