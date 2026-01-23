"use client"

import { useTranslations } from 'next-intl';
import { Fragment } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { useLocalizePath } from '@/lib/i18n/locale-link';
import { cn } from '@/lib/utils';

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
  
  if (pathname === '/' || pathname === '/th' || pathname === '/en' || pathname === '/zh') {
    return null;
  }

  const pathWithoutLocale = pathname.replace(/^\/(th|en|zh)/, '');
  const segments = pathWithoutLocale.split('/').filter(Boolean);

  const breadcrumbs = segments.map((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join('/')}`;
    const isLast = index === segments.length - 1;

    let displayName = t(segment as any) || 
                      segment.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ');

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
    <nav aria-label="Breadcrumb" className={cn("flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest italic rounded-xl bg-slate-50 shadow-inner", className)}>
      <Link 
        href={lp('/dashboard')} 
        className="flex items-center text-slate-400 hover:text-pink-600 transition-all duration-300 group"
      >
        <div className="size-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-pink-50 transition-colors shadow-inner">
          <Home className="size-4" />
        </div>
      </Link>

      {breadcrumbs.map((item, _index) => (
        <Fragment key={item.path}>
          <ChevronRight className="size-4 text-slate-300" />
          {item.isLast ? (
            <span className="text-slate-950 font-black">
              {item.name}
            </span>
          ) : (
            <Link
              href={lp(item.path)}
              className="text-slate-400 hover:text-pink-600 transition-all duration-300"
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
    <nav aria-label="Breadcrumb" className={cn("flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest italic rounded-xl bg-slate-50/50 p-1 shadow-inner w-fit", className)}>
      {items.map((item, _index) => {
        const isLast = _index === items.length - 1;

        return (
          <Fragment key={`${item.name}-${_index}`}>
            {_index > 0 && <ChevronRight className="size-4 text-slate-300" />}
            {isLast || !item.path ? (
              <span className="text-slate-950 font-black px-2">
                {item.name}
              </span>
            ) : (
              <Link
                href={lp(item.path)}
                className="text-slate-400 hover:text-pink-600 transition-all duration-300 px-2"
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
