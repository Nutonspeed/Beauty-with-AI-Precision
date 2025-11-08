import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export type UserRole = "admin" | "clinic_owner" | "clinic_staff" | "sales_staff" | "customer"

export async function checkUserRole(allowedRoles: UserRole[]) {
  const supabase = await createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Use /api/user-profile to avoid RLS infinite recursion
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/user-profile?userId=${session.user.id}`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  })

  if (!response.ok) {
    console.error('[checkUserRole] Failed to fetch user profile:', response.status)
    redirect("/auth/login")
  }

  const { data: userData } = await response.json()

  if (!userData) {
    redirect("/auth/login")
  }

  const userRole = userData.role as UserRole

  if (!allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    if (userRole === "admin") {
      redirect("/admin")
    } else if (userRole === "clinic_owner" || userRole === "clinic_staff") {
      redirect("/clinic/dashboard")
    } else if (userRole === "sales_staff") {
      redirect("/sales/dashboard")
    } else {
      // Default: customer goes to their dashboard
      redirect("/customer/dashboard")
    }
  }

  return {
    user: session.user,
    role: userRole,
    clinicId: userData.clinic_id,
  }
}
