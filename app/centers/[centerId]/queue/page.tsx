import { CenterQueuePage } from '@/components/center/CenterQueuePage';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function CenterQueueRoute(context: { params: Promise<{ centerId: string }> }) {
  const params = await context.params;
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/api/auth/signin');
  }

  // TODO: Fetch initial queue from database
  // const initialQueue = await db.query.bookings.findMany({
  //   where: eq(bookings.centerId, params.centerId),
  //   orderBy: [asc(bookings.appointmentTime)]
  // });

  return <CenterQueuePage centerId={params.centerId} />;
}
