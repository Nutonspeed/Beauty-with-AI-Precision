"use client"

import { useTranslations } from 'next-intl';
import { Fragment } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { useLocalizePath } from '@/lib/i18n/locale-link';

interface BreadcrumbsProps {
  className?: string;
}

// Route name mappings (Thai + English)


/**
 * Breadcrumbs Component
 * Auto-generates breadcrumb navigation from current pathname
 * 
 * Usage:
 * <Breadcrumbs /> - Shows breadcrumbs for current page
 * <Breadcrumbs className="mb-4" /> - With custom styling
 */
export function Breadcrumbs({ className = '' }: BreadcrumbsProps) {
  const t = useTranslations('breadcrumbs');
  const pathname = usePathname();
  const lp = useLocalizePath();
  
  // Don't show breadcrumbs on homepage
  if (pathname === '/' || pathname === '/th' || pathname === '/en' || pathname === '/zh') {
    return null;
  }

  // Remove locale prefix if exists
  const pathWithoutLocale = pathname.replace(/^\/(th|en|zh)/, '');
  
  // Split pathname into segments
  const segments = pathWithoutLocale.split('/').filter(Boolean);

  // Build breadcrumb items
  const breadcrumbs = segments.map((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join('/')}`;
    const isLast = index === segments.length - 1;

    // Get display name (prefer localized name from i18n, then fallback to English, then capitalize segment)
    let displayName = t(segment as any) || 
                      segment.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ');

    // Special handling for dynamic routes (UUIDs, IDs)
    if (segment.match(/^[a-f0-9-]{36}$/i)) {
      displayName = t('details');
    }

    return {
      name: displayName,
      path,
      isLast,
    };
  });

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center space-x-1 text-sm ${className}`}>
      {/* Home Link */}
      <Link 
        href={lp('/dashboard')} 
        className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {/* Breadcrumb Items */}
      {breadcrumbs.map((item, _index) => (
        <Fragment key={item.path}>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          {item.isLast ? (
            <span className="font-medium text-foreground">
              {item.name}
            </span>
          ) : (
            <Link
              href={lp(item.path)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.name}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  );
}

/**
 * Custom Breadcrumbs Component
 * Allows manual definition of breadcrumb items
 * 
 * Usage:
 * <CustomBreadcrumbs items={[
 *   { name: 'Home', path: '/' },
 *   { name: 'Products', path: '/products' },
 *   { name: 'Product Detail' } // Last item without path
 * ]} />
 */
export function CustomBreadcrumbs({ 
  items,
  className = ''
}: { 
  items: { name: string; path?: string }[];
  className?: string;
}) {
  const lp = useLocalizePath();
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center space-x-1 text-sm ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <Fragment key={`${item.name}-${index}`}>
            {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            {isLast || !item.path ? (
              <span className="font-medium text-foreground">
                {item.name}
              </span>
            ) : (
              <Link
                href={lp(item.path)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
