/**
 * Customer Portal Layout
 * Provides customer-specific navigation and authentication
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth/supabase-auth'

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login?redirect=/customer')
  }

  // Check if user has customer role
  const { data: userData } = await supabase
    .from('users')
    .select('role, clinic_id')
    .eq('id', user.id)
    .single()

  if (!userData || userData.role !== 'customer') {
    redirect('/auth/unauthorized')
  }

  // Get customer profile
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!customer) {
    redirect('/auth/profile-setup')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Customer Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                พอร์ทัลลูกค้า
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {customer.full_name}
              </span>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ออกจากระบบ
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
