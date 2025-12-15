import { createServerClient, createServiceClient } from "@/lib/supabase/server"
import { normalizeRole, type CanonicalRole } from "@/lib/auth/role-normalize"
import { redirect } from "next/navigation"

export type UserRole = CanonicalRole

export async function checkUserRole(allowedRoles: UserRole[]) {
  const supabase = await createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Use /api/user-profile to avoid RLS infinite recursion
  const serviceClient = createServiceClient()
  const { data: userData, error: userError } = await serviceClient
    .from("users")
    .select("role, clinic_id")
    .eq("id", session.user.id)
    .single()

  if (userError || !userData) {
    console.error('[checkUserRole] Failed to fetch user record:', userError)
    redirect("/auth/login")
  }

  const userRole = normalizeRole(userData.role) as UserRole

  if (!allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    if (userRole === "super_admin") {
      redirect("/admin")
    } else if (userRole === "clinic_owner" || userRole === "clinic_admin" || userRole === "clinic_staff") {
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
