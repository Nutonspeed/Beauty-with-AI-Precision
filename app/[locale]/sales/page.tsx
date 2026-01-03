export const dynamic = 'force-dynamic'
export const revalidate = 0

import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n/request';

export default function SalesPage() {
  redirect(`/${defaultLocale}/sales/dashboard`);
}