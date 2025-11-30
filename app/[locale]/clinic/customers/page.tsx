import { redirect } from 'next/navigation'

/**
 * Clinic Customers - Redirects to Sales Leads
 * Customer management is handled through the sales leads system
 */
export default function ClinicCustomersPage() {
  redirect('/th/sales/leads')
}
