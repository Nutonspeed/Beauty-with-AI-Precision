import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/sign-up", "/auth/error", "/demo", "/contact", "/api/analyze"]

const PROTECTED_ROUTE_PATTERNS = [
  "/clinic",
  "/sales",
  "/admin",
  "/dashboard",
  "/profile",
  "/booking",
  "/analysis/history",
  "/ar-simulator",
]

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true
  if (pathname.startsWith("/api/")) return true
  return false
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTE_PATTERNS.some((pattern) => pathname.startsWith(pattern))
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
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
          supabaseResponse = NextResponse.next({
            request,
          })
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
    
    if (error) {
      console.error('Auth error in middleware:', error.message)
      // Clear invalid session
      const response = NextResponse.next({ request })
      response.cookies.delete('sb-access-token')
      response.cookies.delete('sb-refresh-token')
      
      const pathname = request.nextUrl.pathname
      if (isProtectedRoute(pathname)) {
        const url = request.nextUrl.clone()
        url.pathname = "/auth/login"
        url.searchParams.set("redirect", pathname)
        return NextResponse.redirect(url)
      }
      return response
    }

    const pathname = request.nextUrl.pathname

    if (isProtectedRoute(pathname) && !user) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      url.searchParams.set("redirect", pathname)
      return NextResponse.redirect(url)
    }

    if (user && isProtectedRoute(pathname)) {
      const { data: userProfile } = await supabase.from("users").select("role, clinic_id").eq("id", user.id).single()

      if (userProfile) {
        // Clinic routes require clinic_owner role
        if (pathname.startsWith("/clinic") && userProfile.role !== "clinic_owner") {
          return NextResponse.redirect(new URL("/", request.url))
        }

        // Sales routes require sales_staff role
        if (pathname.startsWith("/sales") && userProfile.role !== "sales_staff") {
          return NextResponse.redirect(new URL("/", request.url))
        }

        // Admin routes require clinic_owner role
        if (pathname.startsWith("/admin") && userProfile.role !== "clinic_owner") {
          return NextResponse.redirect(new URL("/", request.url))
        }
      }
    }
  } catch (err) {
    console.error('Unexpected error in middleware:', err)
  }

  return supabaseResponse
}
