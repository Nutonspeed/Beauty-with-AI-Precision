// @ts-nocheck
"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth/context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, User, LogOut, Building2 } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { ClinicIQLogo } from "@/components/brand/logo"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { LanguageSwitcher } from "@/components/language-switcher"

// Safe hook wrapper for server-side rendering
function useSafeAuth() {
  try {
    return useAuth();
  } catch {
    return { user: null, signOut: async () => {} };
  }
}

export function Header() {
  const auth = useSafeAuth();
  const user = auth.user;
  const handleSignOut = auth.signOut;
  const t = useTranslations()
  
  const locale = useLocale()
  const isThaiLocale = locale === 'th'
  const lp = useLocalizePath()

  const roleLabels: Record<string, string> = {
    super_admin: t('roles.super_admin'),
    clinic_owner: t('roles.clinic_owner'),
    clinic_admin: t('roles.clinic_admin'),
    clinic_staff: t('roles.clinic_staff'),
    sales_staff: t('roles.sales_staff'),
    premium_customer: t('roles.premium_customer'),
    free_user: t('roles.free_user'),
    public: t('roles.public'),
    customer: t('roles.customer'),
  }

  // Get navigation items based on user role
  const getNavItems = () => {
    if (!user) {
      // Landing page navigation - clean and professional
      return [
        { href: "/features", label: t('nav.features') },
        { href: "/pricing", label: t('nav.pricing') },
        { href: "/3d-models", label: t('nav.3dModels') },
        { href: "/demo/skin-analysis", label: t('nav.tryDemo') },
        { href: "/faq", label: t('nav.faq') },
      ]
    }

    const role = user.role

    switch (role) {
      case "clinic_owner":
        return [
          { href: "/clinic/revenue", label: t('nav.overview') },
          { href: "/sales/leads", label: t('nav.customers') },
          { href: "/analytics", label: t('nav.analytics') },
          { href: "/branches", label: t('nav.branches') },
          { href: "/ai-chat", label: t('nav.aiAdvisor') },
        ]
      case "clinic_staff":
        return [
          { href: "/booking", label: t('nav.reception') },
          { href: "/clinic/staff/my-schedule", label: t('nav.schedule') },
          { href: "/analysis", label: t('nav.analysis') },
        ]
      case "sales_staff":
        return [
          { href: "/sales/dashboard", label: t('nav.overview') },
          { href: "/sales/leads", label: t('nav.leads') },
          { href: "/sales/presentations", label: t('nav.proposals') },
          { href: "/sales/tools", label: t('nav.salesTool') },
        ]
      case "super_admin":
        return [
          { href: "/admin", label: t('nav.admin') },
          { href: "/admin/system-status", label: t('nav.systemStatus') },
          { href: "/clinic/settings", label: t('nav.settings') },
        ]
      default:
        // Customer navigation
        return [
          { href: "/analysis", label: t('nav.analysis') },
          { href: "/ar-simulator", label: t('nav.tryResults') },
          { href: "/booking", label: t('nav.booking') },
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
      className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[#020617]/60"
    >
      <div className="container flex h-16 sm:h-20 items-center justify-between gap-4 px-6">
        {/* Logo - Premium Clinical Branding */}
        <Link
          href={lp("/")}
          className="flex items-center gap-3 min-w-0 flex-shrink transition-transform hover:scale-[1.02] active:scale-95"
          aria-label={t('common.home')}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-md rounded-full animate-pulse" />
            <ClinicIQLogo className="relative flex-shrink-0" />
          </div>
        </Link>

        {/* Desktop Navigation - High-end Spacing */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={lp(item.href)}
              className="text-[13px] font-bold uppercase tracking-[0.15em] text-slate-400 transition-all hover:text-primary hover:tracking-[0.2em]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Section - Functional Sophistication */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-2 mr-2">
            <LanguageSwitcher />
            <div className="h-4 w-px bg-white/10 mx-1" />
            <ThemeToggle />
          </div>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="glass" 
                  size="sm" 
                  className="h-10 gap-3 px-2 pr-4 rounded-full border-white/10 hover:border-primary/30 transition-all group"
                >
                  <div className="relative">
                    <Avatar className="h-7 w-7 border border-white/20">
                      <AvatarImage src={user.avatar_url || ""} alt={user.full_name || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                        {user.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-[#020617] shadow-sm" />
                  </div>
                  <div className="hidden flex-col items-start xl:flex">
                    <span className="text-xs font-bold text-white tracking-tight">{user.full_name || t('common.profile')}</span>
                    <span className="text-[9px] uppercase font-black text-primary tracking-widest leading-none">
                      {roleLabels[user.role] || user.role?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 glass-panel border-white/10 p-2">
                <DropdownMenuLabel className="px-4 py-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold text-white">{user.full_name || t('common.profile')}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-medium tracking-tighter">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                {user.clinic_id && (
                  <DropdownMenuItem className="rounded-lg py-2 cursor-pointer focus:bg-primary/10 focus:text-primary">
                    <Building2 className="mr-3 h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">{t('common.switchClinic')}</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild className="rounded-lg py-2 cursor-pointer focus:bg-primary/10 focus:text-primary">
                  <Link href={lp("/profile")} className="flex items-center w-full">
                    <User className="mr-3 h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">{t('nav.profile')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem onClick={() => handleSignOut()} className="rounded-lg py-2 cursor-pointer text-rose-400 focus:bg-rose-500/10 focus:text-rose-400">
                  <LogOut className="mr-3 h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">{t('common.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild className="h-10 px-5 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5">
                <Link href={lp("/auth/login")}>{t('common.login')}</Link>
              </Button>
              <Button variant="premium" size="sm" asChild className="h-10 px-6 text-[11px] font-black uppercase tracking-[0.15em] shadow-glow-primary">
                <Link href={lp("/analysis")}>{t('common.getStarted')}</Link>
              </Button>
            </div>
          )}

          {/* Mobile Navigator */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="glass" size="icon" className="h-10 w-10 border-white/10">
                <Menu className="h-5 w-5 text-slate-300" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px] bg-[#020617] border-white/5 p-8">
              <VisuallyHidden>
                <SheetTitle>Navigation Portfolio</SheetTitle>
              </VisuallyHidden>
              <div className="flex flex-col h-full">
                <div className="pb-8 border-b border-white/5">
                  <ClinicIQLogo />
                </div>
                <nav className="flex flex-col gap-6 mt-10">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={lp(item.href)}
                      className="text-lg font-bold text-white hover:text-primary transition-all flex items-center group"
                    >
                      <span className="mr-4 h-1 w-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto space-y-4">
                  {!user && (
                    <>
                      <Button variant="premium" asChild className="w-full h-14 uppercase tracking-widest font-black">
                        <Link href={lp("/analysis")}>{t('common.getStarted')}</Link>
                      </Button>
                      <Button variant="outline" asChild className="w-full h-14 glass uppercase tracking-widest font-bold">
                        <Link href={lp("/auth/login")}>{t('common.login')}</Link>
                      </Button>
                    </>
                  )}
                  <div className="flex items-center justify-center gap-6 pt-6 border-t border-white/5">
                    <LanguageSwitcher />
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
