import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/request';

export default createMiddleware({
  // A list of all locales that are supported
  locales,
  
  // Used when no locale matches
  defaultLocale,
  
  // Optional: Configure path prefix behavior
  localePrefix: 'as-needed', // Default is 'always'
  
  // Optional: Configure locale detection
  localeDetection: true,
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(th|en|zh)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
