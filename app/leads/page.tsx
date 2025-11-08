import { redirect } from 'next/navigation'

export default function LeadsRedirectPage() {
  // Redirect /leads to /sales/leads
  redirect('/sales/leads')
}
