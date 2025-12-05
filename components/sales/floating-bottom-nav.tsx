"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Calendar, 
  Sparkles, 
  User,
  Home
} from "lucide-react"
import { usePathname } from "next/navigation"

interface FloatingBottomNavProps {
  readonly unreadChats?: number
  readonly newBookings?: number
  readonly notificationCount?: number
  readonly onNavigate?: (tab: 'dashboard' | 'chats' | 'bookings' | 'ai-tools' | 'profile') => void
}

export function FloatingBottomNav({ 
  unreadChats = 0,
  newBookings = 0,
  notificationCount = 0,
  onNavigate
}: FloatingBottomNavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      icon: Home,
      label: "Dashboard",
      tab: 'dashboard' as const,
      badge: notificationCount > 0 ? notificationCount : undefined,
      badgeColor: "bg-red-500",
      pulseAnimation: notificationCount > 0
    },
    {
      icon: MessageSquare,
      label: "Chats",
      tab: 'chats' as const,
      badge: unreadChats > 0 ? unreadChats : undefined,
      badgeColor: "bg-green-500"
    },
    {
      icon: Calendar,
      label: "Bookings",
      tab: 'bookings' as const,
      badge: newBookings > 0 ? newBookings : undefined,
      badgeColor: "bg-blue-500"
    },
    {
      icon: Sparkles,
      label: "AI Tools",
      tab: 'ai-tools' as const,
      badge: undefined,
    },
    {
      icon: User,
      label: "Profile",
      tab: 'profile' as const,
      badge: undefined,
    },
  ]

  return (
    <>
      {/* Spacer to prevent content from being hidden behind fixed nav */}
      <div className="h-20 md:hidden" />

      {/* Fixed Bottom Navigation - Only visible on mobile/tablet */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-50 md:hidden safe-area-inset-bottom">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === `/sales/${item.tab}`
            
            return (
              <Button 
                key={item.label}
                variant="ghost" 
                className={`flex flex-col h-16 gap-1 w-full items-center justify-center ${isActive ? 'bg-primary/10' : ''}`}
                onClick={() => onNavigate?.(item.tab)}
              >
                <div className="relative">
                  <Icon className={`h-6 w-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  {item.badge && (
                    <Badge 
                      className={`absolute -top-2 -right-2 h-5 min-w-[20px] rounded-full p-0 px-1 flex items-center justify-center text-xs ${item.badgeColor || 'bg-red-500'} text-white border-2 border-background ${item.pulseAnimation ? 'animate-pulse' : ''}`}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </Badge>
                  )}
                </div>
                <span className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </Button>
            )
          })}
        </div>
      </div>
    </>
  )
}
