"use client"

import { Fragment } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  className?: string;
}

// Route name mappings (Thai + English)
const routeNames: Record<string, { th: string; en: string }> = {
  'dashboard': { th: 'แดชบอร์ด', en: 'Dashboard' },
  'analysis': { th: 'วิเคราะห์ผิว', en: 'Analysis' },
  'results': { th: 'ผลการวิเคราะห์', en: 'Results' },
  'ar-simulator': { th: 'AR Simulator', en: 'AR Simulator' },
  'ar-3d': { th: 'AR 3D', en: 'AR 3D' },
  'booking': { th: 'จองนัดหมาย', en: 'Booking' },
  'profile': { th: 'โปรไฟล์', en: 'Profile' },
  'settings': { th: 'ตั้งค่า', en: 'Settings' },
  'admin': { th: 'ผู้ดูแล', en: 'Admin' },
  'super-admin': { th: 'Super Admin', en: 'Super Admin' },
  'sales': { th: 'ฝ่ายขาย', en: 'Sales' },
  'customer': { th: 'ลูกค้า', en: 'Customer' },
  'reports': { th: 'รายงาน', en: 'Reports' },
  'chat': { th: 'แชท', en: 'Chat' },
  'onboarding': { th: 'เริ่มต้นใช้งาน', en: 'Onboarding' },
  'pricing': { th: 'แพ็กเกจ', en: 'Pricing' },
  'contact': { th: 'ติดต่อ', en: 'Contact' },
  'about': { th: 'เกี่ยวกับเรา', en: 'About' },
  'faq': { th: 'คำถามที่พบบ่อย', en: 'FAQ' },
  'privacy': { th: 'นโยบายความเป็นส่วนตัว', en: 'Privacy Policy' },
  'terms': { th: 'เงื่อนไขการใช้งาน', en: 'Terms' },
  'inventory': { th: 'สต็อกสินค้า', en: 'Inventory' },
  'clinic': { th: 'คลินิก', en: 'Clinic' },
  'treatments': { th: 'การรักษา', en: 'Treatments' },
  'treatment-plans': { th: 'แผนการรักษา', en: 'Treatment Plans' },
  'patients': { th: 'ผู้ป่วย', en: 'Patients' },
  'staff': { th: 'พนักงาน', en: 'Staff' },
  'schedule': { th: 'ตารางเวลา', en: 'Schedule' },
  'notifications': { th: 'แจ้งเตือน', en: 'Notifications' },
  'emergency-alerts': { th: 'แจ้งเหตุฉุกเฉิน', en: 'Emergency Alerts' },
  'analytics': { th: 'รายงานและวิเคราะห์', en: 'Analytics' },
  'reception': { th: 'แผนกต้อนรับ', en: 'Reception' },
  'my-schedule': { th: 'ตารางงานของฉัน', en: 'My Schedule' },
  'automation': { th: 'ระบบอัตโนมัติ', en: 'Automation' },
  'customers': { th: 'ลูกค้า', en: 'Customers' },
  'leads': { th: 'ลูกค้าเป้าหมาย', en: 'Leads' },
  'presentations': { th: 'งานนำเสนอ', en: 'Presentations' },
  'wizard': { th: 'เริ่มงานนำเสนอ', en: 'Presentation Wizard' },
  'quick-scan': { th: 'สแกนด่วน', en: 'Quick Scan' },
};

/**
 * Breadcrumbs Component
 * Auto-generates breadcrumb navigation from current pathname
 * 
 * Usage:
 * <Breadcrumbs /> - Shows breadcrumbs for current page
 * <Breadcrumbs className="mb-4" /> - With custom styling
 */
export function Breadcrumbs({ className = '' }: BreadcrumbsProps) {
  const pathname = usePathname();
  
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

    // Get display name (prefer Thai, fallback to English, then capitalize segment)
    let displayName = routeNames[segment]?.th || 
                      routeNames[segment]?.en || 
                      segment.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ');

    // Special handling for dynamic routes (UUIDs, IDs)
    if (segment.match(/^[a-f0-9-]{36}$/i)) {
      displayName = 'รายละเอียด'; // Details
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
        href="/dashboard" 
        className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {/* Breadcrumb Items */}
      {breadcrumbs.map((item, index) => (
        <Fragment key={item.path}>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          {item.isLast ? (
            <span className="font-medium text-foreground">
              {item.name}
            </span>
          ) : (
            <Link
              href={item.path}
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
                href={item.path}
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
