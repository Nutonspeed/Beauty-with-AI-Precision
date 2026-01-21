import { redirect } from 'next/navigation'

/**
 * Center Dashboard - Redirects to Revenue Dashboard
 * The revenue page serves as the main center dashboard
 */
export default function CenterDashboardPage({ params }: { params: { locale: string } }) {
  redirect(`/${params.locale}/centers/revenue`)
}
