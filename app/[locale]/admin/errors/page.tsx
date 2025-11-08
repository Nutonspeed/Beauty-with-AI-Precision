/**
 * Error Dashboard Page
 * Admin page for monitoring errors
 */

import { ErrorDashboard } from '@/components/admin/error-dashboard';

interface ErrorDashboardPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function ErrorDashboardPage({ params }: ErrorDashboardPageProps) {
  const { locale } = await params;

  return (
    <div className="container mx-auto py-8">
      <ErrorDashboard locale={locale} />
    </div>
  );
}
