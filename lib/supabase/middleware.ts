import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const PUBLIC_ROUTES = new Set(["/", "/auth/login", "/auth/sign-up", "/auth/error", "/demo", "/contact", "/api/analyze", "/analysis"])

const PROTECTED_ROUTE_PATTERNS = [
  "/clinic",
  "/branches",
  "/sales",
  "/admin",
  "/super-admin",
  "/users",
  "/settings",
  "/dashboard",
  "/profile",
  "/booking",
  "/analysis/history",
  "/ar-simulator",
]

function getLocaleFromPathname(pathname: string): string | null {
  const segment = pathname.split("/")[1]
  if (!segment) return null
  if (/^[a-z]{2}(-[A-Z]{2})?$/.test(segment)) return segment
  return null
}

function stripLocaleFromPathname(pathname: string): string {
  const locale = getLocaleFromPathname(pathname)
  if (!locale) return pathname
  const rest = pathname.replace(`/${locale}`, "")
  return rest === "" ? "/" : rest
}

function _isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.has(pathname)) return true
  if (pathname.startsWith("/api/")) return true
  return false
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTE_PATTERNS.some((pattern) => pathname.startsWith(pattern))
}

export async function updateSession(request: NextRequest, response?: NextResponse, resolvedPathname?: string) {
  // Bypass auth for testing if enabled
  if (process.env.NEXT_PUBLIC_TEST_MODE === 'true' && process.env.NODE_ENV !== 'production') {
    return NextResponse.next({ request })
  }

  let supabaseResponse = response ?? NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options)
          }
        },
      },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
    },
  )

  // Try to refresh the session
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    const originalPathname = request.nextUrl.pathname
    const pathnameForChecks = resolvedPathname ?? originalPathname
    const locale = getLocaleFromPathname(originalPathname)
    const normalizedPathname = stripLocaleFromPathname(pathnameForChecks)
    const loginPath = locale ? `/${locale}/auth/login` : "/auth/login"
    const dashboardPath = locale ? `/${locale}/dashboard` : "/dashboard"
    
    if (error) {
      console.error('Auth error in middleware:', error.message)
      // Clear invalid session
      supabaseResponse.cookies.delete('sb-access-token')
      supabaseResponse.cookies.delete('sb-refresh-token')
      
      if (isProtectedRoute(normalizedPathname)) {
        const url = request.nextUrl.clone()
        url.pathname = loginPath
        url.searchParams.set("redirect", originalPathname)
        return NextResponse.redirect(url)
      }
      return supabaseResponse
    }

    if (isProtectedRoute(normalizedPathname) && !user) {
      const url = request.nextUrl.clone()
      url.pathname = loginPath
      url.searchParams.set("redirect", originalPathname)
      return NextResponse.redirect(url)
    }

    if (user && isProtectedRoute(normalizedPathname)) {
      const { data: userProfile } = await supabase.from("users").select("role, clinic_id").eq("id", user.id).single()

      if (userProfile) {
        // Clinic and branches routes require clinic_owner or clinic_staff
        if ((normalizedPathname.startsWith("/clinic") || normalizedPathname.startsWith("/branches")) && 
            userProfile.role !== "clinic_owner" && 
            userProfile.role !== "clinic_staff" &&
            userProfile.role !== "clinic_admin") {
          const url = request.nextUrl.clone()
          url.pathname = dashboardPath
          return NextResponse.redirect(url)
        }

        // Sales routes require sales_staff
        if (normalizedPathname.startsWith("/sales") && userProfile.role !== "sales_staff") {
          const url = request.nextUrl.clone()
          url.pathname = dashboardPath
          return NextResponse.redirect(url)
        }

        // Super Admin exclusive routes (super_admin only)
        if ((normalizedPathname.startsWith("/super-admin") || 
             normalizedPathname.startsWith("/users") || 
             normalizedPathname.startsWith("/settings")) && 
            userProfile.role !== "super_admin") {
          const url = request.nextUrl.clone()
          url.pathname = dashboardPath
          return NextResponse.redirect(url)
        }

        // Admin routes require clinic_owner or super_admin (shared admin tools)
        if (normalizedPathname.startsWith("/admin") && 
            userProfile.role !== "clinic_owner" && 
            userProfile.role !== "super_admin") {
          const url = request.nextUrl.clone()
          url.pathname = dashboardPath
          return NextResponse.redirect(url)
        }
      }
    }
  } catch (err) {
    console.error('Unexpected error in middleware:', err)
  }

  return supabaseResponse
}
