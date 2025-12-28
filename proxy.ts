import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server'

import { locales, defaultLocale } from './i18n/request';
import { updateSession } from './lib/supabase/middleware'

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,
  
  // Used when no locale matches
  defaultLocale,
  
  // Optional: Configure path prefix behavior
  localePrefix: 'as-needed', // Default is 'always'
  
  // Optional: Configure locale detection
  localeDetection: true,
});

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Avoid i18n routing for API and Next internals, but still keep session refresh behavior.
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.startsWith('/_vercel/')) {
    return updateSession(request)
  }

  const intlResponse = intlMiddleware(request)
  const rewrite = intlResponse.headers.get('x-middleware-rewrite')
  const location = intlResponse.headers.get('location')
  const resolvedPathname = rewrite
    ? new URL(rewrite).pathname
    : location
      ? new URL(location, request.url).pathname
      : undefined

  const authResponse = await updateSession(request, intlResponse, resolvedPathname)
  const authLocation = authResponse.headers.get('location')

  // If auth decides to redirect, it must win over i18n normalization.
  if (authLocation && authResponse.status >= 300 && authResponse.status < 400) {
    return authResponse
  }

  return intlResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
