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
import { Sparkles, Menu, Globe, User, LogOut, Building2 } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { useLanguage } from "@/lib/i18n/language-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  // Safe auth access with fallback
  let user = null;
  let handleSignOut = async () => {};
  
  try {
    const auth = useAuth();
    user = auth.user;
    handleSignOut = auth.signOut;
  } catch (error) {
    // AuthProvider not available - component will render without user
    console.warn('[Header] AuthProvider not available:', error);
  }
  
  const { language, setLanguage, t } = useLanguage()

  // Get navigation items based on user role
  const getNavItems = () => {
    if (!user) {
      return [
        { href: "/features", label: t.nav.features || "Features" },
        { href: "/pricing", label: t.nav.pricing || "Pricing" },
        { href: "/analysis", label: t.nav.analysis },
        { href: "/ar-simulator", label: t.nav.arSimulator },
        { href: "/faq", label: "FAQ" },
      ]
    }

    const role = user.role

    switch (role) {
      case "clinic_owner":
        return [
          { href: "/clinic/dashboard", label: t.nav.dashboard },
          { href: "/customers", label: t.nav.customers },
          { href: "/ai-chat", label: "💬 AI Advisor" },
          { href: "/analytics", label: t.nav.analytics },
        ]
      case "sales_staff":
        return [
          { href: "/sales/dashboard", label: t.nav.dashboard },
          { href: "/leads", label: t.nav.leads },
          { href: "/proposals", label: t.nav.proposals },
        ]
      case "super_admin":
        return [
          { href: "/super-admin", label: t.nav.tenants },
          { href: "/users", label: t.nav.users },
          { href: "/settings", label: t.nav.settings },
        ]
      default:
        return [
          { href: "/analysis", label: t.nav.analysis },
          { href: "/ar-simulator", label: t.nav.arSimulator },
          { href: "/ai-chat", label: "💬 AI Advisor" },
          { href: "/booking", label: t.nav.booking },
        ]
    }
  }

  const navItems = getNavItems()

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "clinic_owner":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "sales_staff":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "super_admin":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  return (
    <header
      suppressHydrationWarning
      className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-14 sm:h-16 items-center justify-between gap-2 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-shrink">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-primary flex-shrink-0">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-base font-bold leading-tight">{t.brand}</span>
            <span className="text-[10px] text-muted-foreground leading-tight">Medical-Grade AI</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-4 lg:gap-6 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
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
              <Button variant="ghost" size="sm" className="h-8 sm:h-9 gap-1 px-2 sm:px-3">
                <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-xs font-medium hidden sm:inline">{language === "en" ? "🇬🇧 EN" : "🇹🇭 TH"}</span>
                <span className="text-xs font-medium sm:hidden">{language === "en" ? "EN" : "TH"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t.common.language}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLanguage("en")} className="gap-2">
                <span>🇬🇧</span>
                <span>English</span>
                {language === "en" && <span className="ml-auto text-primary">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("th")} className="gap-2">
                <span>🇹🇭</span>
                <span>ไทย</span>
                {language === "th" && <span className="ml-auto text-primary">✓</span>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu or CTA */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 sm:h-9 gap-1.5 sm:gap-2 px-1.5 sm:px-3">
                  <Avatar className="h-6 w-6 sm:h-7 sm:w-7">
                    <AvatarImage src={user.avatar_url || ""} />
                    <AvatarFallback className="text-xs">{user.full_name?.charAt(0) || user.email?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="hidden flex-col items-start xl:flex">
                    <span className="text-xs font-medium leading-tight">{user.full_name || user.email}</span>
                    {user.role && (
                      <Badge
                        variant="secondary"
                        className={`h-4 px-1.5 text-[10px] ${getRoleBadgeColor(user.role)}`}
                      >
                        {t.roles[user.role as keyof typeof t.roles]}
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
                      <span>{t.common.switchClinic}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>{t.common.profile}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleSignOut()} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t.common.logout}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              <Button variant="ghost" size="sm" asChild className="h-8 px-3">
                <Link href="/auth/login" className="text-xs">{t.common.login}</Link>
              </Button>
              <Button size="sm" asChild className="h-8 px-3">
                <Link href="/analysis" className="text-xs">{t.common.getStarted}</Link>
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
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <VisuallyHidden>
                <SheetTitle>Navigation Menu</SheetTitle>
              </VisuallyHidden>
              <nav className="flex flex-col gap-4 mt-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                ))}
                {!user && (
                  <>
                    <div className="my-4 border-t" />
                    <Button variant="outline" asChild className="w-full bg-transparent">
                      <Link href="/auth/login">{t.common.login}</Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link href="/analysis">{t.common.startAnalysis}</Link>
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
