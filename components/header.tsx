// @ts-nocheck
"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth/context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, Globe, User, LogOut, Building2 } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { useLanguage } from "@/lib/i18n/language-context"
import { useLocale } from "next-intl"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { ClinicIQLogo } from "@/components/brand/logo"
import { useLocalizePath } from "@/lib/i18n/locale-link"

// Safe hook wrapper for server-side rendering
function useSafeAuth() {
  try {
    return useAuth();
  } catch {
    return { user: null, signOut: async () => {} };
  }
}

// Safe hook wrapper for language context
function useSafeLanguage() {
  try {
    return useLanguage();
  } catch {
    return { language: 'th', setLanguage: () => {}, t: (key: string) => key };
  }
}

export function Header() {
  const auth = useSafeAuth();
  const user = auth.user;
  const handleSignOut = auth.signOut;
  
  const locale = useLocale()
  const isThaiLocale = locale === 'th'
  const lp = useLocalizePath()

  const roleLabels: Record<string, { th: string; en: string }> = {
    super_admin: { th: 'ผู้ดูแลระบบสูงสุด', en: 'Super Admin' },
    clinic_owner: { th: 'เจ้าของคลินิก', en: 'Clinic Owner' },
    clinic_admin: { th: 'ผู้ดูแลคลินิก', en: 'Clinic Admin' },
    clinic_staff: { th: 'พนักงานคลินิก', en: 'Clinic Staff' },
    sales_staff: { th: 'พนักงานขาย', en: 'Sales Staff' },
    premium_customer: { th: 'ลูกค้าพรีเมียม', en: 'Premium Customer' },
    free_user: { th: 'ผู้ใช้ฟรี', en: 'Free User' },
    public: { th: 'ผู้ใช้ทั่วไป', en: 'Public' },
    customer: { th: 'ลูกค้า', en: 'Customer' },
  }

  // Get navigation items based on user role
  const getNavItems = () => {
    if (!user) {
      // Landing page navigation - clean and professional
      return [
        { href: "/features", label: isThaiLocale ? "คุณสมบัติ" : "Features" },
        { href: "/pricing", label: isThaiLocale ? "ราคา" : "Pricing" },
        { href: "/3d-models", label: isThaiLocale ? "3D Models" : "3D Models" },
        { href: "/demo/skin-analysis", label: isThaiLocale ? "ทดลองใช้" : "Try Demo" },
        { href: "/faq", label: isThaiLocale ? "คำถามที่พบบ่อย" : "FAQ" },
      ]
    }

    const role = user.role

    switch (role) {
      case "clinic_owner":
        return [
          { href: "/clinic/revenue", label: isThaiLocale ? "ภาพรวม" : "Dashboard" },
          { href: "/sales/leads", label: isThaiLocale ? "ลูกค้า" : "Customers" },
          { href: "/analytics", label: isThaiLocale ? "รายงาน" : "Analytics" },
          { href: "/branches", label: isThaiLocale ? "สาขา" : "Branches" },
          { href: "/ai-chat", label: isThaiLocale ? "AI ที่ปรึกษา" : "AI Advisor" },
        ]
      case "clinic_staff":
        return [
          { href: "/booking", label: isThaiLocale ? "เคาน์เตอร์" : "Reception" },
          { href: "/clinic/staff/my-schedule", label: isThaiLocale ? "ตารางงาน" : "Schedule" },
          { href: "/analysis", label: isThaiLocale ? "วิเคราะห์ผิว" : "Analysis" },
        ]
      case "sales_staff":
        return [
          { href: "/sales/dashboard", label: isThaiLocale ? "ภาพรวม" : "Dashboard" },
          { href: "/sales/leads", label: isThaiLocale ? "ลีด" : "Leads" },
          { href: "/sales/presentations", label: isThaiLocale ? "ข้อเสนอ" : "Proposals" },
          { href: "/sales/tools", label: isThaiLocale ? "เครื่องมือขาย" : "Sales Tool" },
        ]
      case "super_admin":
        return [
          { href: "/admin", label: isThaiLocale ? "แดชบอร์ด" : "Dashboard" },
          { href: "/admin/system-status", label: isThaiLocale ? "สถานะระบบ" : "System" },
          { href: "/clinic/settings", label: isThaiLocale ? "ตั้งค่า" : "Settings" },
        ]
      default:
        // Customer navigation
        return [
          { href: "/analysis", label: isThaiLocale ? "วิเคราะห์ผิว" : "Analysis" },
          { href: "/ar-simulator", label: isThaiLocale ? "ลองผลลัพธ์" : "Try Results" },
          { href: "/booking", label: isThaiLocale ? "จองคิว" : "Booking" },
        ]
    }
  }

  const navItems = getNavItems()

  // Import centralized colors at top of file
  // import { getRoleColor } from "@/lib/ui/colors"
  const getRoleBadgeColor = (role: string) => {
    // Use centralized color system
    const roleColors: Record<string, string> = {
      super_admin: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200",
      clinic_owner: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200",
      clinic_staff: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200",
      sales_staff: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200",
      customer: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200",
      premium_customer: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-200",
    }
    return roleColors[role] || roleColors.customer
  }

  return (
    <header
      suppressHydrationWarning
      className="sticky top-0 z-50 w-full border-b border-border bg-background/98 supports-[backdrop-filter]:bg-background/90 backdrop-blur-md mix-blend-normal"
    >
      <div className="container flex h-14 sm:h-16 items-center justify-between gap-2 px-4">
        {/* Logo - แสดงเฉพาะโลโก้หลัก ให้ดูสะอาดขึ้น */}
        <Link
          href={lp("/")}
          className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-shrink"
          aria-label="กลับสู่หน้าแรก"
        >
          <ClinicIQLogo className="flex-shrink-0" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-4 lg:gap-6 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={lp(item.href)}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 sm:h-9 gap-1 px-2 sm:px-3"
                aria-label={isThaiLocale ? "เปลี่ยนภาษาเป็นอังกฤษ" : "Switch language to Thai"}
              >
                <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                <span className="text-xs font-medium hidden sm:inline">{isThaiLocale ? "🇹🇭 TH" : "🇬🇧 EN"}</span>
                <span className="text-xs font-medium sm:hidden">{isThaiLocale ? "TH" : "EN"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{isThaiLocale ? 'ภาษา' : 'Language'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2">
                <span>🇬🇧</span>
                <span>English</span>
                {!isThaiLocale && <span className="ml-auto text-primary">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <span>🇹🇭</span>
                <span>ไทย</span>
                {isThaiLocale && <span className="ml-auto text-primary">✓</span>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu or CTA */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 sm:h-9 gap-1.5 sm:gap-2 px-1.5 sm:px-3"
                  aria-label="เปิดเมนูผู้ใช้"
                >
                  <Avatar className="h-6 w-6 sm:h-7 sm:w-7">
                    <AvatarImage src={user.avatar_url || ""} alt={user.full_name || "User avatar"} />
                    <AvatarFallback className="text-xs">{user.full_name?.charAt(0) || user.email?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="hidden flex-col items-start xl:flex">
                    <span className="text-xs font-medium leading-tight">{user.full_name || user.email}</span>
                    {user.role && (
                      <Badge
                        variant="secondary"
                        className={`h-4 px-1.5 text-[10px] ${getRoleBadgeColor(user.role)}`}
                      >
                        {(isThaiLocale ? roleLabels[user.role]?.th : roleLabels[user.role]?.en) || user.role}
                      </Badge>
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.full_name || user.email}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.clinic_id && (
                  <>
                    <DropdownMenuItem>
                      <Building2 className="mr-2 h-4 w-4" />
                      <span>{isThaiLocale ? 'สลับคลินิก' : 'Switch Clinic'}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link href={lp("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>{isThaiLocale ? 'โปรไฟล์' : 'Profile'}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleSignOut()} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{isThaiLocale ? 'ออกจากระบบ' : 'Logout'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              <Button variant="ghost" size="sm" asChild className="h-8 px-3">
                <Link href={lp("/auth/login")} className="text-xs">{isThaiLocale ? 'เข้าสู่ระบบ' : 'Login'}</Link>
              </Button>
              <Button size="sm" asChild className="h-8 px-3">
                <Link href={lp("/analysis")} className="text-xs">{isThaiLocale ? 'เริ่มใช้งาน' : 'Get Started'}</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background">
              <VisuallyHidden>
                <SheetTitle>Navigation Menu</SheetTitle>
              </VisuallyHidden>
              <nav className="flex flex-col gap-4 mt-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={lp(item.href)}
                    className="text-base font-medium text-foreground hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-accent"
                  >
                    {item.label}
                  </Link>
                ))}
                {!user && (
                  <>
                    <div className="my-4 border-t" />
                    <Button variant="outline" asChild className="w-full">
                      <Link href={lp("/auth/login")}>{isThaiLocale ? 'เข้าสู่ระบบ' : 'Login'}</Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link href={lp("/analysis")}>{isThaiLocale ? 'เริ่มวิเคราะห์' : 'Start Analysis'}</Link>
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
