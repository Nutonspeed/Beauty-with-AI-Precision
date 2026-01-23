import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const PUBLIC_ROUTES = new Set(["/", "/auth/login", "/auth/sign-up", "/auth/error", "/demo", "/contact", "/api/analyze", "/analysis"])

const PROTECTED_ROUTE_PATTERNS = [
  "/center",
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

function withLocalePath(path: string, locale: string | null) {
  console.log('[MIDDLEWARE DEBUG] withLocalePath called with path:', path, 'locale:', locale)
  
  if (!locale) {
    console.log('[MIDDLEWARE DEBUG] No locale, returning path:', path)
    return path
  }
  
  // Ensure path starts with a slash
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  
  if (normalizedPath === "/") {
    const result = `/${locale}`
    console.log('[MIDDLEWARE DEBUG] Root path with locale:', result)
    return result
  }
  
  const result = `/${locale}${normalizedPath}`
  console.log('[MIDDLEWARE DEBUG] Path with locale:', result)
  return result
}

function getRoleDashboardPath(role?: string | null, locale?: string | null) {
  console.log('[MIDDLEWARE DEBUG] getRoleDashboardPath called with role:', role, 'locale:', locale)
  
  switch (role) {
    case "super_admin":
      return withLocalePath("/super-admin", locale ?? null)
    case "center_owner":
    case "center_admin":
    case "clinic_owner":
    case "clinic_admin":
      return withLocalePath("/centers/dashboard", locale ?? null)
    case "center_staff":
    case "clinic_staff":
      return withLocalePath("/beautician/dashboard", locale ?? null)
    case "sales_staff":
      return withLocalePath("/sales/dashboard", locale ?? null)
    case "customer":
    case "customer_free":
    case "customer_premium":
    case "customer_aesthetic":
    case "customer_elite":
    case "free_user":
    case "premium_customer":
      return withLocalePath("/dashboard", locale ?? null)
    default:
      return withLocalePath("/dashboard", locale ?? null)
  }
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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[MIDDLEWARE ERROR] Supabase environment variables are missing')
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
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

  // Try to refresh the session with a timeout
  try {
    console.log('[MIDDLEWARE] Fetching user session...')
    
    // Create a promise that rejects after a timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Supabase timeout')), 8000)
    )

    const userPromise = supabase.auth.getUser()
    
    const { data: { user }, error } = await Promise.race([
      userPromise,
      timeoutPromise
    ]) as any

    console.log('[MIDDLEWARE] User check result:', { hasUser: !!user, error: error?.message })

    const originalPathname = request.nextUrl.pathname
    const pathnameForChecks = resolvedPathname ?? originalPathname
    const locale = getLocaleFromPathname(originalPathname)
    const normalizedPathname = stripLocaleFromPathname(pathnameForChecks)
    const loginPath = locale ? `/${locale}/auth/login` : "/auth/login"
    
    if (error) {
      console.error('[MIDDLEWARE ERROR] Auth error:', error.message)
      if (isProtectedRoute(normalizedPathname)) {
        console.log('[MIDDLEWARE] Protected route + error, redirecting to login:', loginPath)
        // Clear invalid session
        supabaseResponse.cookies.delete('sb-access-token')
        supabaseResponse.cookies.delete('sb-refresh-token')
        
        const url = request.nextUrl.clone()
        url.pathname = loginPath
        url.searchParams.set("redirect", originalPathname)
        return NextResponse.redirect(url)
      }
      return supabaseResponse
    }

    if (isProtectedRoute(normalizedPathname) && !user) {
      console.log('[MIDDLEWARE] Protected route + no user, redirecting to login:', loginPath)
      const url = request.nextUrl.clone()
      url.pathname = loginPath
      url.searchParams.set("redirect", originalPathname)
      return NextResponse.redirect(url)
    }

    if (user && isProtectedRoute(normalizedPathname)) {
      console.log('[MIDDLEWARE] Protected route + user found, checking profile for:', user.id)
      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("role, center_id")
        .eq("id", user.id)
        .maybeSingle()
      
      if (profileError) {
        console.error('[MIDDLEWARE ERROR] Failed to fetch user profile:', profileError)
      }

      const resolvedRole = userProfile?.role ?? (user.user_metadata as any)?.role ?? (user.app_metadata as any)?.role ?? null
      const effectiveRole = userProfile?.role ?? resolvedRole
      const roleDashboardPath = getRoleDashboardPath(effectiveRole, locale)

      // DEBUG: Add logging to identify the issue
      console.log('[MIDDLEWARE DEBUG] User ID:', user.id)
      console.log('[MIDDLEWARE DEBUG] User Role (DB):', userProfile?.role)
      console.log('[MIDDLEWARE DEBUG] User Role (Metadata):', (user.user_metadata as any)?.role)
      console.log('[MIDDLEWARE DEBUG] Resolved Role:', resolvedRole)
      console.log('[MIDDLEWARE DEBUG] Effective Role:', effectiveRole)
      console.log('[MIDDLEWARE DEBUG] Locale:', locale)
      console.log('[MIDDLEWARE DEBUG] Role Dashboard Path:', roleDashboardPath)
      console.log('[MIDDLEWARE DEBUG] Current Normalized Pathname:', normalizedPathname)
      console.log('[MIDDLEWARE DEBUG] Current Original Pathname:', originalPathname)

      // Prevent redirect loop if already at the correct dashboard
      if (originalPathname === roleDashboardPath) {
        console.log('[MIDDLEWARE DEBUG] Already at correct dashboard path, continuing...')
        return supabaseResponse
      }

      const roleForChecks = effectiveRole ?? ""

      // Center and branches routes require center_owner or center_staff
      if ((normalizedPathname.startsWith("/center") || normalizedPathname.startsWith("/branches")) && 
          !["center_owner", "center_staff", "center_admin", "clinic_owner", "clinic_admin", "clinic_staff"].includes(roleForChecks)) {
        console.log('[MIDDLEWARE DEBUG] Center route access denied, redirecting to:', roleDashboardPath)
        const url = request.nextUrl.clone()
        url.pathname = roleDashboardPath
        return NextResponse.redirect(url)
      }

      // Sales routes require sales_staff
      if (normalizedPathname.startsWith("/sales") && roleForChecks !== "sales_staff") {
        console.log('[MIDDLEWARE DEBUG] Sales route access denied, redirecting to:', roleDashboardPath)
        const url = request.nextUrl.clone()
        url.pathname = roleDashboardPath
        return NextResponse.redirect(url)
      }

      // Super Admin exclusive routes (super_admin only)
      if ((normalizedPathname.startsWith("/super-admin") || 
           normalizedPathname.startsWith("/users") || 
           normalizedPathname.startsWith("/settings")) && 
          roleForChecks !== "super_admin") {
        console.log('[MIDDLEWARE DEBUG] Super Admin route access denied, redirecting to:', roleDashboardPath)
        const url = request.nextUrl.clone()
        url.pathname = roleDashboardPath
        return NextResponse.redirect(url)
      }

      // Admin routes require center_owner or super_admin (shared admin tools)
      if (normalizedPathname.startsWith("/admin") && 
          roleForChecks !== "center_owner" && 
          roleForChecks !== "super_admin") {
        console.log('[MIDDLEWARE DEBUG] Admin route access denied, redirecting to:', roleDashboardPath)
        const url = request.nextUrl.clone()
        url.pathname = roleDashboardPath
        return NextResponse.redirect(url)
      }

      // If user is on generic /dashboard or root but has specific role, route them accordingly
      if (normalizedPathname === "/dashboard" || normalizedPathname === "/") {
        if (originalPathname !== roleDashboardPath) {
          console.log('[MIDDLEWARE DEBUG] Generic path detected, redirecting to specific dashboard:', roleDashboardPath)
          const url = request.nextUrl.clone()
          url.pathname = roleDashboardPath
          return NextResponse.redirect(url)
        }
      }
    }
  } catch (err) {
    console.error('Unexpected error in middleware:', err)
  }

  return supabaseResponse
}
