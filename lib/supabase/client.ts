import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"

export function createBrowserClient() {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    console.warn('createBrowserClient called in server environment - returning null or throwing later if env vars missing')
    // Return a dummy client or handle gracefully instead of throwing immediately
    // Next.js sometimes pre-renders components that use this
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === 'undefined') {
      return null as any // Fail gracefully on server
    }
    throw new Error('Missing Supabase Environment Variables')
  }

  return createSupabaseBrowserClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      cookies: {
        getAll() {
          if (typeof document === 'undefined') return []
          return document.cookie.split(';').map(cookie => {
            const [name, ...rest] = cookie.trim().split('=')
            return { name, value: rest.join('=') }
          })
        },
        setAll(cookiesToSet) {
          if (typeof document === 'undefined') return
          const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:'
          for (const { name, value, options } of cookiesToSet) {
            let cookieString = `${name}=${value}`
            if (options?.maxAge) cookieString += `; max-age=${options.maxAge}`
            if (options?.path) cookieString += `; path=${options.path}`
            if (options?.domain) cookieString += `; domain=${options.domain}`

            const secure = Boolean(options?.secure && isHttps)
            const sameSite = !secure && options?.sameSite === 'none' ? 'lax' : options?.sameSite
            if (sameSite) cookieString += `; samesite=${sameSite}`
            if (secure) cookieString += '; secure'
            document.cookie = cookieString
          }
        },
      },
    }
  )
}

export const createClient = createBrowserClient
