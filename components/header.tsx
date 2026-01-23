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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { CenterIQLogo } from "@/components/brand/logo"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { LanguageSwitcher } from "@/components/language-switcher"

import { motion } from "framer-motion"
import { MagneticButton } from "@/components/ui/magnetic-button"

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
  
  const lp = useLocalizePath()

  const roleLabels: Record<string, string> = {
    super_admin: t('roles.super_admin'),
    center_owner: t('roles.center_owner'),
    center_admin: t('roles.center_admin'),
    center_staff: t('roles.center_staff'),
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
        { href: "/vision-2026", label: t('vision2026.title') },
        { href: "/pricing", label: t('nav.pricing') },
        { href: "/3d-showcase", label: t('nav.3dModels') },
        { href: "/analysis", label: t('nav.tryDemo') },
      ]
    }

    const role = user.role

    switch (role) {
      case "center_owner":
        return [
          { href: "/center/revenue", label: t('nav.overview') },
          { href: "/sales/leads", label: t('nav.customers') },
          { href: "/analytics", label: t('nav.analytics') },
          { href: "/branches", label: t('nav.branches') },
          { href: "/ai-chat", label: t('nav.aiAdvisor') },
        ]
      case "center_staff":
        return [
          { href: "/booking", label: t('nav.reception') },
          { href: "/center/staff/my-schedule", label: t('nav.schedule') },
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
          { href: "/vision-2026", label: "VISION_2026" },
          { href: "/tech-supremacy", label: "TECH_HUB" },
          { href: "/admin/system-status", label: t('nav.systemStatus') },
          { href: "/center/settings", label: t('nav.settings') },
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

  return (
    <header
      suppressHydrationWarning
      className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 transition-all duration-300"
    >
      <div className="container flex h-16 sm:h-20 items-center justify-between gap-4 px-6 relative">
        {/* Logo - Premium Aesthetic Branding */}
        <Link
          href={lp("/")}
          className="flex items-center gap-3 min-w-0 flex-shrink transition-all hover:opacity-80 active:scale-95 group"
          aria-label={t('common.home')}
        >
          <CenterIQLogo className="relative flex-shrink-0" />
        </Link>

        {/* Desktop Navigation - Clean Corporate Spacing */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={lp(item.href)}
              className="relative text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 transition-all hover:text-pink-500 py-2 group/nav"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-blue-600 transition-all group-hover/nav:w-full" />
            </Link>
          ))}
        </nav>

        {/* Right Section - Functional Sophistication */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="hidden md:flex items-center gap-4 mr-4">
            <div className="flex items-center p-1 rounded-full bg-slate-100 border border-slate-200/50 backdrop-blur-md shadow-inner">
              <LanguageSwitcher />
            </div>
            <ThemeToggle />
          </div>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="outline-none">
                  <MagneticButton strength={0.1}>
                    <Button 
                      variant="glass" 
                      size="sm" 
                      className="h-11 gap-3 px-3 pr-5 rounded-full border-slate-200 bg-white/80 shadow-premium group pointer-events-none"
                    >
                      <div className="relative">
                        <Avatar className="h-8 w-8 border border-slate-200 ring-2 ring-transparent group-hover:ring-blue-500/10 transition-all">
                          <AvatarImage src={user.avatar_url || ""} alt={user.full_name || ""} />
                          <AvatarFallback className="bg-blue-50 text-blue-600 text-[10px] font-bold">
                            {user.full_name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                      </div>
                      <div className="hidden flex-col items-start xl:flex">
                        <span className="text-xs font-bold text-slate-900 tracking-tight leading-tight">{user.full_name || t('common.profile')}</span>
                        <span className="text-[8px] uppercase font-black text-blue-600 tracking-[0.2em] leading-none mt-0.5">
                          {roleLabels[user.role] || user.role?.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </Button>
                  </MagneticButton>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 glass-panel border-slate-200 p-3 rounded-2xl shadow-premium backdrop-blur-2xl bg-white/90">
                <DropdownMenuLabel className="px-4 py-4">
                  <div className="flex flex-col space-y-1.5">
                    <p className="text-sm font-bold text-slate-900 tracking-tight">{user.full_name || t('common.profile')}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100" />
                <div className="p-1 space-y-1 mt-1">
                  {user.center_id && (
                    <DropdownMenuItem className="rounded-xl py-3 cursor-pointer focus:bg-blue-50 focus:text-blue-600 transition-colors">
                      <Building2 className="mr-3 h-4 w-4" />
                      <span className="text-[11px] font-bold uppercase tracking-widest">{t('common.switchCenter')}</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild className="rounded-xl py-3 cursor-pointer focus:bg-blue-50 focus:text-blue-600 transition-colors">
                    <Link href={lp("/profile")} className="flex items-center w-full">
                      <User className="mr-3 h-4 w-4" />
                      <span className="text-[11px] font-bold uppercase tracking-widest">{t('nav.profile')}</span>
                    </Link>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="bg-slate-100" />
                <div className="p-1">
                  <DropdownMenuItem onClick={() => handleSignOut()} className="rounded-xl py-3 cursor-pointer text-rose-500 focus:bg-rose-50 focus:text-rose-600 transition-colors">
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="text-[11px] font-bold uppercase tracking-widest">{t('common.logout')}</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-4">
              <MagneticButton strength={0.1}>
                <Button variant="outline" size="sm" asChild className="hidden sm:flex h-11 px-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 border-slate-200 hover:border-blue-500/50 hover:bg-blue-50 rounded-full transition-all">
                  <Link href={lp("/auth/login")}>{t('common.login')}</Link>
                </Button>
              </MagneticButton>
              
              <MagneticButton strength={0.15}>
                <Button variant="premium" size="sm" asChild className="h-11 px-8 text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-pink-500/20 rounded-full hover:scale-105 active:scale-95 transition-all bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 text-white border-none">
                  <Link href={lp("/analysis")}>{t('common.getStarted')}</Link>
                </Button>
              </MagneticButton>
            </div>
          )}

          {/* Mobile Navigator */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl border border-slate-200 bg-white/50 shadow-sm">
                <Menu className="h-5 w-5 text-slate-600" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px] bg-white border-l border-slate-100 p-10 backdrop-blur-3xl">
              <VisuallyHidden>
                <SheetTitle>Navigation Infrastructure</SheetTitle>
              </VisuallyHidden>
              <div className="flex flex-col h-full">
                <div className="pb-10 border-b border-slate-100">
                  <CenterIQLogo />
                </div>
                <nav className="flex flex-col gap-8 mt-12">
                  {navItems.map((item, i) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={lp(item.href)}
                  className="text-2xl font-black text-slate-900 hover:text-pink-500 transition-all flex items-center group uppercase tracking-tighter italic"
                >
                  <span className="mr-6 h-px w-0 bg-gradient-to-r from-pink-500 to-blue-600 transition-all group-hover:w-12" />
                  {item.label}
                </Link>
              </motion.div>
                  ))}
                </nav>
                <div className="mt-auto space-y-6">
                  {!user && (
                    <div className="grid grid-cols-1 gap-4">
                      <Button variant="premium" asChild className="h-16 rounded-2xl uppercase tracking-[0.2em] font-black shadow-xl shadow-blue-600/20 bg-blue-600 text-white">
                        <Link href={lp("/analysis")}>{t('common.getStarted')}</Link>
                      </Button>
                      <Button variant="outline" asChild className="h-16 rounded-2xl border-slate-200 uppercase tracking-[0.2em] font-bold">
                        <Link href={lp("/auth/login")}>{t('common.login')}</Link>
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-inner">
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
