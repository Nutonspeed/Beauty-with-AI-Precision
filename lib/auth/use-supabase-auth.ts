"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"

export interface AuthSession {
  user: {
    id: string
    email: string
    name?: string
    image?: string
    role?: string
    tenantId?: string
  } | null
}

export function useSupabaseAuth() {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading")
  const supabase = createBrowserClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession({
          user: {
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.user_metadata?.name || session.user.email,
            image: session.user.user_metadata?.avatar_url,
            role: session.user.user_metadata?.role || "customer",
            tenantId: session.user.user_metadata?.tenant_id,
          },
        })
        setStatus("authenticated")
      } else {
        setSession(null)
        setStatus("unauthenticated")
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession({
          user: {
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.user_metadata?.name || session.user.email,
            image: session.user.user_metadata?.avatar_url,
            role: session.user.user_metadata?.role || "customer",
            tenantId: session.user.user_metadata?.tenant_id,
          },
        })
        setStatus("authenticated")
      } else {
        setSession(null)
        setStatus("unauthenticated")
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return { data: session, status }
}

export async function signIn(email: string, password: string) {
  const supabase = createBrowserClient()
  
  console.log("[v0] Attempting sign in for:", email)
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("[v0] Sign in error:", error.message)
    return { error: error.message }
  }

  console.log("[v0] Sign in successful:", data.user?.email)
  return { data, error: null }
}

export async function signOut() {
  const supabase = createBrowserClient()
  await supabase.auth.signOut()
  globalThis.location.href = "/"
}
