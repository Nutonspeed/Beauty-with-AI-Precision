import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"

export function createBrowserClient() {
  // Check if we're in a browser environment
  if (globalThis.window === undefined) {
    throw new TypeError('createBrowserClient should only be called in browser environment')
  }

  return createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
          for (const { name, value, options } of cookiesToSet) {
            let cookieString = `${name}=${value}`
            if (options?.maxAge) cookieString += `; max-age=${options.maxAge}`
            if (options?.path) cookieString += `; path=${options.path}`
            if (options?.domain) cookieString += `; domain=${options.domain}`
            if (options?.sameSite) cookieString += `; samesite=${options.sameSite}`
            if (options?.secure) cookieString += '; secure'
            document.cookie = cookieString
          }
        },
      },
    }
  )
}

export const createClient = createBrowserClient
