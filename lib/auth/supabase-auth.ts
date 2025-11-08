"use server"

import { createServerClient } from "@/lib/supabase/server"
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

  const userRole = user.user_metadata?.role || "customer"

  if (!allowedRoles.includes(userRole)) {
    redirect("/unauthorized")
  }

  return user
}
