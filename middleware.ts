import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing';
import { updateSession } from './lib/supabase/middleware'

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  console.log(`[MIDDLEWARE] Incoming request: ${pathname}`)

  // Completely bypass everything for static assets and internal Next.js paths to ensure performance
  if (
    pathname.startsWith('/_next/') || 
    pathname.startsWith('/_vercel/') || 
    pathname.includes('/favicon.ico') ||
    pathname.includes('/manifest.json') ||
    pathname.includes('/sw.js') ||
    pathname.includes('/robots.txt') ||
    pathname.includes('/sitemap.xml') ||
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|woff2?|css|js|json|svg)$/)
  ) {
    return NextResponse.next()
  }

  // Avoid i18n routing for API, but still keep session refresh behavior.
  if (pathname.startsWith('/api/')) {
    return updateSession(request)
  }

  const intlResponse = intlMiddleware(request)
  const rewrite = intlResponse.headers.get('x-middleware-rewrite')
  const location = intlResponse.headers.get('location')
  
  if (location) {
    console.log(`[MIDDLEWARE] Intl middleware redirecting: ${pathname} -> ${location}`)
  }

  const resolvedPathname = rewrite
    ? (() => {
        try {
          return new URL(rewrite).pathname
        } catch (e) {
          // If rewrite is just a path, return it as is
          return rewrite
        }
      })()
    : location
      ? (() => {
          try {
            return new URL(location, request.url).pathname
          } catch (e) {
            return undefined
          }
        })()
      : undefined

  // Auth + session refresh (RBAC) should run after i18n normalization.
  const authResponse = await updateSession(request, intlResponse, resolvedPathname)
  const authLocation = authResponse.headers.get('location')

  if (authLocation) {
    console.log(`[MIDDLEWARE] Auth middleware redirecting: ${pathname} -> ${authLocation}`)
  }

  // If auth decides to redirect, it must win over i18n normalization.
  if (authLocation && authResponse.status >= 300 && authResponse.status < 400) {
    return authResponse
  }

  return intlResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sitemap.xml, robots.txt, manifest.json, sw.js (SEO/PWA files)
     * - all files with common extensions (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|js|css|woff2?|map)$).*)',
  ],
};
