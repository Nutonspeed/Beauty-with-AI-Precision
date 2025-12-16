"use server"

import { createServerClient, createServiceClient } from "@/lib/supabase/server"
import { normalizeRole } from "@/lib/auth/role-normalize"
import { redirect } from "next/navigation"

export async function getSession() {
  const supabase = await createServerClient()
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    console.error("[v0] Error getting session:", error)
    return null
  }

  return session
}

export async function getUser() {
  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error("[v0] Error getting user:", error)
    return null
  }

  return user
}

export async function signOut() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}

export async function requireAuth() {
  const session = await getSession()

  if (!session) {
    redirect("/auth/login")
  }

  return session
}

export async function requireRole(allowedRoles: string[]) {
  const user = await getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const allowedCanonical = allowedRoles.map((role) => normalizeRole(role))

  let roleValue: string | null | undefined
  try {
    const service = createServiceClient()
    const { data: userRow } = await service
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()

    roleValue = (userRow as any)?.role

    if (!roleValue) {
      // Do NOT auto-provision roles in production.
      // In dev/test only, allow creating a minimal users row with a safe default role.
      const allowAutoCreate =
        process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_TEST_MODE === 'true'

      if (!allowAutoCreate) {
        redirect('/unauthorized')
      }

      const { data: createdUser } = await service
        .from("users")
        .insert({
          id: user.id,
          email: user.email,
          role: "free_user",
          full_name: user.email?.split("@")[0].replace("-", " ") || "Demo User",
        })
        .select("role")
        .single()

      roleValue = (createdUser as any)?.role
    }
  } catch (error) {
    console.error("[supabase-auth] Failed to load role from users table:", error)
    redirect('/unauthorized')
  }

  if (!roleValue) {
    redirect('/unauthorized')
  }

  const canonicalRole = normalizeRole(roleValue)

  if (!allowedCanonical.includes(canonicalRole)) {
    redirect("/unauthorized")
  }

  return user
}
