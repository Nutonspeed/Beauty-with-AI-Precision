import { ClinicQueuePage } from '@/components/clinic/ClinicQueuePage';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ClinicQueueRoute(context: { params: Promise<{ clinicId: string }> }) {
  const params = await context.params;
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/api/auth/signin');
  }

  // TODO: Fetch initial queue from database
  // const initialQueue = await db.query.bookings.findMany({
  //   where: eq(bookings.clinicId, params.clinicId),
  //   orderBy: [asc(bookings.appointmentTime)]
  // });

  return <ClinicQueuePage clinicId={params.clinicId} />;
}
