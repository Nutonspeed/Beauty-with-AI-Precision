import { redirect } from 'next/navigation'

/**
 * Users Management - Redirects to Admin page
 * User management is handled in the admin section
 */
export default function UsersPage() {
  redirect('/th/admin')
}
