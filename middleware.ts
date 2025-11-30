import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Global Middleware
 * Handles: Rate limiting headers, Security, Logging
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Add request ID for tracing
  const requestId = crypto.randomUUID()
  response.headers.set('X-Request-ID', requestId)
  
  // Add timing header
  response.headers.set('X-Response-Start', Date.now().toString())
  
  // Security headers (additional to next.config.js)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // Log API requests in development
  if (process.env.NODE_ENV === 'development' && request.nextUrl.pathname.startsWith('/api/')) {
    console.log(`[API] ${request.method} ${request.nextUrl.pathname}`)
  }
  
  return response
}

// Only run middleware on API routes and pages
export const config = {
  matcher: [
    // API routes
    '/api/:path*',
    // Pages (exclude static files)
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
}
