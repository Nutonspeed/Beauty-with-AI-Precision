import { redirect } from 'next/navigation'

/**
 * Super Admin - Redirects to Admin Dashboard
 */
export default function SuperAdminPage() {
  redirect('/th/admin')
}
