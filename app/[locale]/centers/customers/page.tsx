import { redirect } from 'next/navigation'

/**
 * Center Customers - Redirects to Sales Leads
 * Customer management is handled through the sales leads system
 */
export default function CenterCustomersPage() {
  redirect('/th/sales/leads')
}
