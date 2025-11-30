import { redirect } from 'next/navigation'

/**
 * Clinic Dashboard - Redirects to Revenue Dashboard
 * The revenue page serves as the main clinic dashboard
 */
export default function ClinicDashboardPage() {
  redirect('/th/clinic/revenue')
}
