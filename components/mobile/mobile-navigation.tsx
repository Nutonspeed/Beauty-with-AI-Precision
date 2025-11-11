/**
 * Mobile Bottom Navigation Component
 * Touch-friendly navigation bar for mobile devices
 * 
 * Features:
 * - Fixed bottom position with safe area support
 * - Active state indication
 * - Haptic feedback on touch
 * - Icon + label layout
 * - Responsive to orientation changes
 */

'use client';

import React, { useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Calendar, 
  Camera, 
  BarChart3, 
  User,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileDetection } from '@/hooks/use-mobile-detection';
import { useHaptic } from '@/lib/hooks/use-haptic';

export interface MobileNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  activePattern?: RegExp;
}

export interface MobileNavigationProps {
  items?: MobileNavItem[];
  className?: string;
  showLabels?: boolean;
  hapticFeedback?: boolean;
}

const defaultItems: MobileNavItem[] = [
  {
    label: 'หน้าแรก',
    href: '/th',
    icon: Home,
    activePattern: /^\/(th|en)?$/,
  },
  {
    label: 'จองคิว',
    href: '/th/booking',
    icon: Calendar,
    activePattern: /\/booking/,
  },
  {
    label: 'วิเคราะห์',
    href: '/th/analysis',
    icon: Camera,
    activePattern: /\/analysis/,
  },
  {
    label: 'สถิติ',
    href: '/th/analytics',
    icon: BarChart3,
    activePattern: /\/analytics/,
  },
  {
    label: 'โปรไฟล์',
    href: '/th/profile',
    icon: User,
    activePattern: /\/profile/,
  },
];

export function MobileNavigation({
  items = defaultItems,
  className,
  showLabels = true,
  hapticFeedback = true,
}: MobileNavigationProps) {
  const pathname = usePathname();
  const { isMobile, isTablet } = useMobileDetection();
  const haptic = useHaptic();

  const handleNavClick = useCallback(() => {
    if (hapticFeedback) {
      haptic.trigger('light');
    }
  }, [hapticFeedback, haptic]);

  // Don't render on desktop
  if (!isMobile && !isTablet) {
    return null;
  }

  return (
    <nav
      className={cn(
        // Base styles
        'fixed bottom-0 left-0 right-0 z-40',
        'flex items-center justify-around',
        'bg-white dark:bg-gray-900',
        'border-t border-gray-200 dark:border-gray-800',
        'shadow-lg',
        // Safe area support
        'pb-[env(safe-area-inset-bottom)]',
        // Height
        'h-16',
        // Accessibility
        'touch-manipulation',
        className
      )}
      role="navigation"
      aria-label="Mobile navigation"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = item.activePattern 
          ? item.activePattern.test(pathname)
          : pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={handleNavClick}
            className={cn(
              // Base styles
              'flex flex-col items-center justify-center',
              'relative flex-1',
              'min-h-[48px]',
              'transition-colors duration-150',
              // Hover effect (only on devices with hover)
              'hover:bg-gray-50 dark:hover:bg-gray-800',
              // Active effect
              'active:bg-gray-100 dark:active:bg-gray-700',
              // Remove default tap highlight
              '-webkit-tap-highlight-color-transparent',
              // Colors
              isActive 
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400'
            )}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            {/* Icon Container */}
            <div className="relative">
              <Icon 
                className={cn(
                  'h-6 w-6',
                  'transition-transform duration-150',
                  isActive && 'scale-110'
                )}
                strokeWidth={isActive ? 2.5 : 2}
                aria-hidden="true"
              />
              
              {/* Badge */}
              {item.badge && item.badge > 0 && (
                <span
                  className={cn(
                    'absolute -top-2 -right-2',
                    'flex items-center justify-center',
                    'min-w-[18px] h-[18px]',
                    'px-1',
                    'text-xs font-bold text-white',
                    'bg-red-600',
                    'rounded-full',
                    'border-2 border-white dark:border-gray-900'
                  )}
                  aria-label={`${item.badge} notifications`}
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}

              {/* Active Indicator Dot */}
              {isActive && (
                <span
                  className={cn(
                    'absolute -bottom-1 left-1/2 -translate-x-1/2',
                    'w-1 h-1',
                    'bg-blue-600 dark:bg-blue-400',
                    'rounded-full'
                  )}
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Label */}
            {showLabels && (
              <span
                className={cn(
                  'mt-1',
                  'text-xs font-medium',
                  'transition-all duration-150',
                  isActive && 'font-semibold'
                )}
              >
                {item.label}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Mobile Navigation Spacer
 * Adds bottom padding to account for fixed mobile nav
 */
export function MobileNavigationSpacer({ className }: { className?: string }) {
  const { isMobile, isTablet } = useMobileDetection();

  if (!isMobile && !isTablet) {
    return null;
  }

  return (
    <div
      className={cn(
        'h-16',
        'pb-[env(safe-area-inset-bottom)]',
        className
      )}
      aria-hidden="true"
    />
  );
}

/**
 * Mobile Header Component
 * Fixed top header for mobile screens
 */
export interface MobileHeaderProps {
  title: string;
  backButton?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
}

export function MobileHeader({
  title,
  backButton = false,
  onBack,
  rightAction,
  className,
}: MobileHeaderProps) {
  const { isMobile, isTablet } = useMobileDetection();
  const haptic = useHaptic();

  const handleBack = useCallback(() => {
    haptic.trigger('light');
    if (onBack) {
      onBack();
    } else if (typeof window !== 'undefined') {
      window.history.back();
    }
  }, [onBack, haptic]);

  if (!isMobile && !isTablet) {
    return null;
  }

  return (
    <header
      className={cn(
        // Base styles
        'fixed top-0 left-0 right-0 z-40',
        'flex items-center',
        'h-14',
        'px-4',
        'bg-white dark:bg-gray-900',
        'border-b border-gray-200 dark:border-gray-800',
        'shadow-sm',
        // Safe area support
        'pt-[env(safe-area-inset-top)]',
        className
      )}
    >
      {/* Back Button */}
      {backButton && (
        <button
          onClick={handleBack}
          className={cn(
            'flex items-center justify-center',
            'w-10 h-10',
            'mr-2',
            'rounded-full',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            'active:bg-gray-200 dark:active:bg-gray-700',
            'transition-colors duration-150',
            '-webkit-tap-highlight-color-transparent'
          )}
          aria-label="Go back"
        >
          <svg
            className="w-6 h-6 text-gray-700 dark:text-gray-300"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Title */}
      <h1 className="flex-1 text-lg font-semibold text-gray-900 dark:text-white truncate">
        {title}
      </h1>

      {/* Right Action */}
      {rightAction && (
        <div className="ml-2">
          {rightAction}
        </div>
      )}
    </header>
  );
}

/**
 * Mobile Header Spacer
 * Adds top padding to account for fixed mobile header
 */
export function MobileHeaderSpacer({ className }: { className?: string }) {
  const { isMobile, isTablet } = useMobileDetection();

  if (!isMobile && !isTablet) {
    return null;
  }

  return (
    <div
      className={cn(
        'h-14',
        'pt-[env(safe-area-inset-top)]',
        className
      )}
      aria-hidden="true"
    />
  );
}
