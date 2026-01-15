import { redirect } from 'next/navigation'

/**
 * Super Admin - Redirects to Admin Dashboard
 */
export default async function SuperAdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect(`/${locale}/admin`)
}
