"use client"

import { ReactNode } from 'react';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: ReactNode;
  showBreadcrumbs?: boolean;
  breadcrumbsClassName?: string;
  className?: string;
}

/**
 * Page Layout Wrapper with Breadcrumbs
 * 
 * Usage:
 * <PageLayout>
 *   <YourContent />
 * </PageLayout>
 * 
 * Or without breadcrumbs:
 * <PageLayout showBreadcrumbs={false}>
 *   <YourContent />
 * </PageLayout>
 */
export function PageLayout({ 
  children, 
  showBreadcrumbs = true,
  breadcrumbsClassName = '',
  className = ''
}: PageLayoutProps) {
  return (
    <div className={cn('min-h-screen', className)}>
      {showBreadcrumbs && (
        <div className="border-b bg-muted/30">
          <div className="container py-3">
            <Breadcrumbs className={breadcrumbsClassName} />
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
