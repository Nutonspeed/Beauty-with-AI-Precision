import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/request';
import { NextRequest, NextResponse } from 'next/server';
import { hasPermission, getRedirectUrl, type UserRole } from './lib/auth/role-config';
import { createClient, createServiceClient } from './lib/supabase/server';
import rateLimiter, { RATE_LIMITS, getRateLimitIdentifier, createRateLimitError } from './lib/rate-limit/limiter';

// Inline proxy config to avoid path resolution issues in Vercel build
const STATIC_ASSETS = ['/_next', '/static'];

const DEMO_PATTERNS = [
  '/robot-3d', '/robot-showcase', '/advanced-sphere', '/premium-scroll',
  '/scroll-demo', '/action-plan-demo', '/ai-chat-demo', '/booking-demo',
  '/minitap-demo', '/mobile-test', '/test-ai', '/test-ai-huggingface',
  '/test-ai-performance', '/ar-simulator', '/minitap-clone', '/minitap-clone-v2',
  '/mobile-payments', '/beauty-ai-demo', '/ultra-modern-landing',
  '/cinematic-beauty', '/test-sphere-performance', '/sphere-quality-test',
  '/comparison', '/analytics-demo', '/ai-test'
];

const PUBLIC_PATHS = [
  '/auth/',
  '/',
  /^\/(th|en|zh)\/?$/,
  '/about',
  '/contact',
  '/pricing',
  '/features',
  '/faq',
  '/privacy',
  '/terms',
  '/pdpa',
  '/analysis'
];

const REQUIRES_AUTH_PATHS = [
  '/clinic',
  '/sales',
  '/admin',
  '/super-admin',
  '/dashboard',
  '/profile',
  '/settings'
];

// Create i18n middleware - DISABLED to avoid conflict
// const intlMiddleware = createMiddleware({
//   // A list of all locales that are supported
//   locales,

//   // Used when no locale matches
//   defaultLocale,

//   // Automatically redirect root path to default locale
//   localePrefix: 'always',
//
//   // Redirect strategy: redirect root path to default locale
//   localeDetection: true,
// });

// Temporary: return NextResponse.next() instead of intlMiddleware
const intlMiddleware = (request: NextRequest) => NextResponse.next();

// ฟังก์ชันตรวจสอบและส่งคืนภาษาที่ต้องการใช้
function getPreferredLocale(request: NextRequest): string {
  // ตรวจสอบจาก cookie ก่อน
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale as any)) {
    return cookieLocale;
  }

  // ใช้ภาษาเริ่มต้น
  return defaultLocale;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('[DEBUG] Proxy middleware called with pathname:', pathname);

  // จัดการการ redirect สำหรับ root path
  if (pathname === '/') {
    const locale = getPreferredLocale(request);
    console.log('[DEBUG] Redirecting root to locale:', locale);
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // ตรวจสอบว่า pathname เริ่มต้นด้วย locale ที่ถูกต้องหรือไม่
  const pathSegments = pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0];

  if (firstSegment && locales.includes(firstSegment as any)) {
    // Path เริ่มต้นด้วย locale ที่ถูกต้อง (เช่น /th, /en, /zh)
    console.log('[DEBUG] Path starts with valid locale:', firstSegment);
  } else if (firstSegment && !locales.includes(firstSegment as any)) {
    // Path เริ่มต้นด้วย locale ที่ไม่ถูกต้อง - redirect ไป default locale
    console.log('[DEBUG] Path starts with invalid locale:', firstSegment, 'redirecting to default');
    const locale = defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }

  // เรียกใช้ i18n middleware (ตอนนี้เป็น dummy)
  const intlResponse = intlMiddleware(request);
  
  // ข้าม middleware สำหรับ static assets
  if (
    STATIC_ASSETS.some(asset => pathname.startsWith(asset)) ||
    pathname.includes('.') // ไฟล์ที่มีนามสกุล
  ) {
    return intlResponse;
  }

  // ============================================================================
  // DEMO EXCLUSION (Production Only)
  // ============================================================================
  if (process.env.NODE_ENV === 'production' && process.env.EXCLUDE_DEMOS === 'true') {
    const isDemo = DEMO_PATTERNS.some(pattern => 
      pathname.includes(pattern) || 
      pathname.split('/').some(segment => segment === pattern.replace('/', ''))
    );
    
    if (isDemo) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // ============================================================================
  // RATE LIMITING (API Routes Only)
  // ============================================================================
  if (pathname.startsWith('/api')) {
    // Get identifier (prefer user ID over IP)
  const userId = request.headers.get('x-user-id'); // Set by auth middleware
  const ipAddress = request.headers.get('x-forwarded-for') ?? 
            request.headers.get('x-real-ip') ??
            request.headers.get('cf-connecting-ip') ??
            undefined;
    
    const identifier = getRateLimitIdentifier(userId || undefined, ipAddress || undefined);
    
    // Choose rate limit based on endpoint
  let rateLimit = RATE_LIMITS.API_GENERAL;
    
    if (pathname.includes('/api/analysis')) {
      rateLimit = pathname.includes('create') 
        ? RATE_LIMITS.ANALYSIS_CREATE 
        : RATE_LIMITS.ANALYSIS_VIEW;
    } else if (pathname.includes('/api/leads')) {
      rateLimit = RATE_LIMITS.LEAD_CREATE;
    } else if (pathname.includes('/api/auth')) {
      rateLimit = RATE_LIMITS.AUTH_LOGIN;
    } else if (!userId) {
      // Stricter limit for unauthenticated requests
      rateLimit = RATE_LIMITS.PUBLIC_API;
    }
    
    const result = rateLimiter.check(identifier, rateLimit.maxRequests, rateLimit.windowMs);
    
    // Add rate limit headers to response
    const response = intlResponse.clone();
    response.headers.set('X-RateLimit-Limit', rateLimit.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(result.resetAt).toISOString());
    
    if (!result.allowed) {
      // Rate limit exceeded
      response.headers.set('Retry-After', result.retryAfter!.toString());
      
      return new NextResponse(
        JSON.stringify(createRateLimitError(result.retryAfter!)),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': rateLimit.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
            'Retry-After': result.retryAfter!.toString(),
          },
        }
      );
    }
    
    return response;
  }

  // ============================================================================
  // AUTHENTICATION & AUTHORIZATION
  // ============================================================================
  
  // Skip auth check for public pages
  const isPublic = PUBLIC_PATHS.some(path => 
    typeof path === 'string' ? pathname.includes(path) : path.test(pathname)
  );
  
  if (isPublic) {
    return intlResponse;
  }

  try {
    // Get user session from Supabase
    const supabase = await createClient();
    
    // Use getSession() for middleware - more reliable for navigation
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    const user = session?.user;
    console.log('[Proxy] 👤 Session check:', { hasSession: !!session, hasUser: !!user, hasError: !!authError, path: pathname });

    let userRole: UserRole | null = null;

    if (!authError && user) {
      // Use service client to bypass RLS policies (avoid infinite recursion)
      const serviceClient = createServiceClient();
      const { data: userData, error: dbError } = await serviceClient
        .from('users')
        .select('role, clinic_id')
        .eq('id', user.id)
        .single();

      console.log('[Proxy] 📊 DB Query result:', { 
        userId: user.id.slice(0, 8), 
        hasData: !!userData, 
        error: dbError?.message,
        role: userData?.role 
      });

      if (userData) {
        userRole = userData.role as UserRole || 'customer_free';
        
        console.log('[Proxy] 🔍 User:', user.id.slice(0, 8), 'Role:', userRole, 'Path:', pathname);
        
        // Set user ID header for rate limiting
        intlResponse.headers.set('x-user-id', user.id);
      } else {
        console.log('[Proxy] ⚠️ No user data found for:', user.id.slice(0, 8));
      }
    } else {
      // ⚠️ No user - redirect to login if trying to access protected routes
      // Check if current path requires authentication
      const requiresAuth = REQUIRES_AUTH_PATHS.some(path => pathname.includes(path));
      
      if (requiresAuth) {
        console.log('[Proxy] No user, redirecting to login from:', pathname);
        const locale = pathname.split('/')[1];
        const loginPath = locales.includes(locale as any)
          ? `/${locale}/auth/login`
          : `/${defaultLocale}/auth/login`;
        
        return NextResponse.redirect(new URL(loginPath, request.url));
      }
    }

    // Check if user has permission to access this route
    const hasAccess = hasPermission(userRole, pathname);
    console.log('[Proxy] 🔐 hasAccess:', hasAccess, 'for role:', userRole);

    if (!hasAccess) {
      console.log('[Proxy] ❌ Access denied - Redirecting...');
      // Get redirect URL
      const redirectUrl = getRedirectUrl(userRole, pathname);
      
      if (redirectUrl) {
        // Preserve locale in redirect
        const locale = pathname.split('/')[1];
        const localizedRedirect = locales.includes(locale as any)
          ? `/${locale}${redirectUrl}`
          : `/${defaultLocale}${redirectUrl}`;

        return NextResponse.redirect(new URL(localizedRedirect, request.url));
      }
    }

    return intlResponse;
  } catch (error) {
    console.error('Error in middleware:', error);
    // On error, allow access (fail open)
    return intlResponse;
  }
}

export const config = {
  // Match only internationalized pathnames
  // Include root path for redirect
  matcher: ['/', '/(th|en|zh)/:path*'],
};
