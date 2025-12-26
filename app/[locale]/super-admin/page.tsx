import { redirect } from 'next/navigation'

/**
 * Super Admin - Redirects to Admin Dashboard
 */
export default function SuperAdminPage({ params }: { params: { locale: string } }) {
  redirect(`/${params.locale}/admin`)
}
