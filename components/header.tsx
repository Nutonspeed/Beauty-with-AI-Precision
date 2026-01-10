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
import { ClinicIQLogo } from "@/components/brand/logo"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { LanguageSwitcher } from "@/components/language-switcher"

import { motion } from "framer-motion"

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
        { href: "/vision-2026", label: t('vision2026.title') },
        { href: "/pricing", label: t('nav.pricing') },
        { href: "/3d-showcase", label: t('nav.3dModels') },
        { href: "/analysis", label: t('nav.tryDemo') },
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
          { href: "/vision-2026", label: "VISION_2026" },
          { href: "/tech-supremacy", label: "TECH_HUB" },
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

  return (
    <header
      suppressHydrationWarning
      className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#020617]/40 backdrop-blur-3xl supports-[backdrop-filter]:bg-[#020617]/20 transition-all duration-500"
    >
      {/* Cinematic Top Beam */}
      <div className="absolute top-0 left-0 right-0 h-[1px] overflow-hidden">
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
          className="h-full w-1/2 bg-gradient-to-r from-transparent via-pink-500/40 to-transparent opacity-30"
        />
      </div>

      {/* Subtle Glow Underside */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />

      <div className="container flex h-16 sm:h-20 items-center justify-between gap-4 px-6 relative">
        {/* Glow effect behind logo */}
        <div className="absolute top-1/2 left-6 -translate-y-1/2 w-32 h-8 bg-pink-500/10 blur-2xl rounded-full -z-10" />
        
        {/* Logo - Premium Clinical Branding */}
        <Link
          href={lp("/")}
          className="flex items-center gap-3 min-w-0 flex-shrink transition-all hover:scale-[1.02] active:scale-95 group"
          aria-label={t('common.home')}
        >
          <div className="relative">
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.3, 0.2] 
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 bg-primary/30 blur-lg rounded-full" 
            />
            <ClinicIQLogo className="relative flex-shrink-0" />
          </div>
        </Link>

        {/* Desktop Navigation - High-end Spacing */}
        <nav className="hidden items-center gap-10 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={lp(item.href)}
              className="relative text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 transition-all hover:text-white group py-2"
            >
              {item.label}
              <motion.span 
                className="absolute bottom-0 left-0 h-px bg-pink-500 w-0 group-hover:w-full transition-all duration-500"
                initial={false}
              />
            </Link>
          ))}
        </nav>

        {/* Right Section - Functional Sophistication */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="hidden md:flex items-center gap-4 mr-4">
            <div className="flex items-center p-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <LanguageSwitcher />
            </div>
            <ThemeToggle />
          </div>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="glass" 
                  size="sm" 
                  className="h-11 gap-3 px-3 pr-5 rounded-full border-white/10 hover:border-pink-500/30 transition-all bg-white/[0.03] shadow-xl group"
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8 border border-white/20 ring-2 ring-transparent group-hover:ring-pink-500/20 transition-all">
                      <AvatarImage src={user.avatar_url || ""} alt={user.full_name || ""} />
                      <AvatarFallback className="bg-pink-500/10 text-pink-400 text-[10px] font-bold">
                        {user.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#020617] shadow-lg" />
                  </div>
                  <div className="hidden flex-col items-start xl:flex">
                    <span className="text-xs font-bold text-white tracking-tight leading-tight">{user.full_name || t('common.profile')}</span>
                    <span className="text-[8px] uppercase font-black text-pink-500 tracking-[0.2em] leading-none mt-0.5">
                      {roleLabels[user.role] || user.role?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 glass-panel border-white/10 p-3 rounded-2xl shadow-2xl backdrop-blur-2xl">
                <DropdownMenuLabel className="px-4 py-4">
                  <div className="flex flex-col space-y-1.5">
                    <p className="text-sm font-bold text-white tracking-tight">{user.full_name || t('common.profile')}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                <div className="p-1 space-y-1 mt-1">
                  {user.clinic_id && (
                    <DropdownMenuItem className="rounded-xl py-3 cursor-pointer focus:bg-pink-500/10 focus:text-pink-400 transition-colors">
                      <Building2 className="mr-3 h-4 w-4" />
                      <span className="text-[11px] font-bold uppercase tracking-widest">{t('common.switchClinic')}</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild className="rounded-xl py-3 cursor-pointer focus:bg-pink-500/10 focus:text-pink-400 transition-colors">
                    <Link href={lp("/profile")} className="flex items-center w-full">
                      <User className="mr-3 h-4 w-4" />
                      <span className="text-[11px] font-bold uppercase tracking-widest">{t('nav.profile')}</span>
                    </Link>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="bg-white/5" />
                <div className="p-1">
                  <DropdownMenuItem onClick={() => handleSignOut()} className="rounded-xl py-3 cursor-pointer text-rose-400 focus:bg-rose-500/10 focus:text-rose-400 transition-colors">
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="text-[11px] font-bold uppercase tracking-widest">{t('common.logout')}</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild className="hidden sm:flex h-11 px-6 text-[11px] font-black uppercase tracking-[0.2em] text-white border-white/10 hover:border-pink-500/50 hover:bg-pink-500/5 rounded-full transition-all">
                <Link href={lp("/auth/login")}>{t('common.login')}</Link>
              </Button>
              <Button variant="premium" size="sm" asChild className="h-11 px-8 text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-pink-500/20 rounded-full hover:scale-105 active:scale-95 transition-all">
                <Link href={lp("/analysis")}>{t('common.getStarted')}</Link>
              </Button>
            </div>
          )}

          {/* Mobile Navigator */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="glass" size="icon" className="h-11 w-11 rounded-xl border-white/10 bg-white/5">
                <Menu className="h-5 w-5 text-slate-300" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px] bg-[#020617] border-white/5 p-10 backdrop-blur-3xl">
              <VisuallyHidden>
                <SheetTitle>Navigation Infrastructure</SheetTitle>
              </VisuallyHidden>
              <div className="flex flex-col h-full">
                <div className="pb-10 border-b border-white/5">
                  <ClinicIQLogo />
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
                        className="text-2xl font-black text-white hover:text-pink-500 transition-all flex items-center group uppercase tracking-tighter"
                      >
                        <span className="mr-6 h-px w-0 bg-pink-500 transition-all group-hover:w-8" />
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                </nav>
                <div className="mt-auto space-y-6">
                  {!user && (
                    <div className="grid grid-cols-1 gap-4">
                      <Button variant="premium" asChild className="h-16 rounded-2xl uppercase tracking-[0.2em] font-black shadow-xl shadow-pink-500/20">
                        <Link href={lp("/analysis")}>{t('common.getStarted')}</Link>
                      </Button>
                      <Button variant="outline" asChild className="h-16 rounded-2xl glass uppercase tracking-[0.2em] font-bold">
                        <Link href={lp("/auth/login")}>{t('common.login')}</Link>
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
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
