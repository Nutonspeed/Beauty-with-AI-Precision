import { Metadata } from 'next';
import DatabaseHealthDashboard from '@/components/admin/database-health-dashboard';

export const metadata: Metadata = {
  title: 'Database Health Monitor | ClinicIQ',
  description: 'Monitor database health and performance metrics',
};

export default function DatabaseHealthPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <DatabaseHealthDashboard />
    </div>
  );
}
