import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { locales, defaultLocale } from './request';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales,
  
  // Used when no locale matches
  defaultLocale,
  
  // Optional: Configure path prefix behavior
  localePrefix: {
    mode: 'as-needed',
    prefixes: {
      'th': '/th',
      'en': '/en',
      'zh': '/zh'
    }
  }
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } = createNavigation({ locales });
