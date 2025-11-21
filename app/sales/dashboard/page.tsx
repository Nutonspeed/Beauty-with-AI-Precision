"use client"

import type React from "react"

import { useState, useEffect, useMemo, useCallback } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { useInfiniteScroll } from "@/lib/hooks/use-infinite-scroll"
import { PageLayout } from "@/components/layouts/page-layout"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SalesMetrics } from "@/components/sales/sales-metrics"
import { HotLeadCard } from "@/components/sales/hot-lead-card"
import { HotLeadCardSkeleton } from "@/components/sales/hot-lead-card-skeleton"
import { ResumePresentations } from "@/components/sales/presentation/resume-presentations"
import { PresentationStatsCards } from "@/components/sales/presentation/presentation-stats-cards"
import { FloatingBottomNav } from "@/components/sales/floating-bottom-nav"
import { ChatDrawer } from "@/components/sales/chat-drawer"
import { QuickProposal } from "@/components/sales/quick-proposal"
import { PriorityScoreCard } from "@/components/sales/priority-score-card"
import LeadNotificationToast from "@/components/sales/lead-notification-toast"
import { OfflineIndicator } from "@/components/offline/offline-indicator"
import { ErrorBoundary } from "@/components/error-boundary"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Phone, Mail, RefreshCw, Sparkles, Bell, BellOff, Search, Filter, Users, FileText, Megaphone, Zap, Gift, Presentation, Smartphone, StickyNote, BarChart3 } from "lucide-react"
import Link from "next/link"
import { sortLeadsByPriority, formatTimeAgo, type PriorityScore } from "@/lib/lead-prioritization"
import wsClient, { type LeadNotification } from "@/lib/websocket-client"
import notificationSound from "@/lib/notification-sound"
import { SearchNoResultsState, NoDataState } from "@/components/ui/empty-state"

// Mock hot leads data with prioritization fields
const mockHotLeads = [
  {
    id: "1",
    customer_user_id: undefined, // Mock lead not yet converted to customer
    name: "Sarah Johnson",
    age: 32,
    photo: undefined,
    initials: "SJ",
    score: 65,
    isOnline: true,
    topConcern: "Wrinkles",
    secondaryConcern: "Pigmentation",
    estimatedValue: 45000,
    lastActivity: "3 min ago",
    analysisTimestamp: new Date(Date.now() - 1000 * 60 * 3), // 3 minutes ago
    engagementCount: 5, // High engagement
    analysisData: {
      wrinkles: 72,
      pigmentation: 75,
      pores: 80,
      hydration: 68,
    },
    skinType: "Combination",
    email: "sarah.j@email.com",
    phone: "081-234-5678",
  },
  {
    id: "3",
    customer_user_id: undefined, // Mock lead not yet converted to customer
    name: "Emma Wilson",
    age: 45,
    photo: undefined,
    initials: "EW",
    score: 58,
    isOnline: true,
    topConcern: "Elasticity",
    secondaryConcern: "Wrinkles",
    estimatedValue: 55000,
    lastActivity: "8 min ago",
    analysisTimestamp: new Date(Date.now() - 1000 * 60 * 8), // 8 minutes ago
    engagementCount: 3, // Medium engagement
    analysisData: {
      wrinkles: 60,
      pigmentation: 65,
      pores: 72,
      hydration: 55,
    },
    skinType: "Dry",
    email: "emma.w@email.com",
    phone: "082-345-6789",
  },
  {
    id: "2",
    customer_user_id: undefined, // Mock lead not yet converted to customer
    name: "Michael Chen",
    age: 28,
    photo: undefined,
    initials: "MC",
    score: 78,
    isOnline: false,
    topConcern: "Pores",
    secondaryConcern: "Hydration",
    estimatedValue: 35000,
    lastActivity: "15 min ago",
    analysisTimestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    engagementCount: 1, // Low engagement
    analysisData: {
      wrinkles: 85,
      pigmentation: 82,
      pores: 68,
      hydration: 70,
    },
    skinType: "Oily",
    email: "michael.c@email.com",
    phone: "083-456-7890",
  },
  {
    id: "4",
    customer_user_id: undefined, // Mock lead not yet converted to customer
    name: "Lisa Anderson",
    age: 38,
    photo: undefined,
    initials: "LA",
    score: 55,
    isOnline: true,
    topConcern: "Pigmentation",
    secondaryConcern: "Wrinkles",
    estimatedValue: 85000,
    lastActivity: "2 min ago",
    analysisTimestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
    engagementCount: 7, // Very high engagement
    analysisData: {
      wrinkles: 58,
      pigmentation: 55,
      pores: 65,
      hydration: 52,
    },
    skinType: "Combination",
    email: "lisa.a@email.com",
    phone: "084-567-8901",
  },
]

// Mock chat messages
const initialMessages = [
  {
    id: "1",
    text: "สวัสดีค่ะ ผมเพิ่งทำ skin analysis เสร็จครับ",
    sender: "customer" as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    isRead: true,
  },
  {
    id: "2",
    text: "สวัสดีค่ะคุณ Sarah ยินดีให้คำปรึกษาค่ะ 😊 ผลการวิเคราะห์ของคุณออกมาดีมากเลยค่ะ",
    sender: "sales" as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 4),
    isRead: true,
  },
  {
    id: "3",
    text: "ตอนนี้สนใจ treatment ไหนคะ?",
    sender: "sales" as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
    isRead: true,
  },
]

export default function SalesDashboardPage() {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [userEmail, setUserEmail] = useState<string>("")
  const [chatOpen, setChatOpen] = useState(false)
  const [proposalOpen, setProposalOpen] = useState(false)
  const [scoreDetailOpen, setScoreDetailOpen] = useState(false)
  
  // Hot leads state - fetch from API instead of mock
  const [hotLeads, setHotLeads] = useState<typeof mockHotLeads>([])
  const [selectedCustomer, setSelectedCustomer] = useState<typeof mockHotLeads[0] | null>(null)
  const [selectedLead, setSelectedLead] = useState<(typeof mockHotLeads)[0] | null>(null)
  const [selectedLeadForScore, setSelectedLeadForScore] = useState<(typeof mockHotLeads)[0] & { priorityScore: PriorityScore } | null>(null)
  const [messages, setMessages] = useState<typeof initialMessages>([])
  const [lastSortTime, setLastSortTime] = useState(new Date())

  // Fetch chat messages when chat opens
  useEffect(() => {
    async function fetchMessages() {
      if (!chatOpen || !selectedCustomer) return
      
      try {
        const response = await fetch(`/api/sales/chat-messages?customer_id=${selectedCustomer.id}`)
        if (!response.ok) throw new Error('Failed to fetch messages')
        const data = await response.json()
        
        // If no messages (chat system not implemented), use empty array
        setMessages(data.messages || [])
        
        if (data.note) {
          console.log('[SalesDashboard]', data.note)
        }
      } catch (error) {
        console.error('[SalesDashboard] Error fetching messages:', error)
        // Fallback to empty messages
        setMessages([])
      }
    }

    fetchMessages()
  }, [chatOpen, selectedCustomer])

  // Notification state
  const [notifications, setNotifications] = useState<LeadNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [newLeadIds, setNewLeadIds] = useState<Set<string>>(new Set())
  const [isLoadingLeads, setIsLoadingLeads] = useState(true)

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPriority, setFilterPriority] = useState<string>("all")

  // Auto-refresh state
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)

  // Pagination state
  const ITEMS_PER_PAGE = 10
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE)

  // Debounced search query (500ms delay)
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Fetch hot leads from API
  const fetchHotLeads = useCallback(async () => {
    try {
      setIsLoadingLeads(true)
      const response = await fetch('/api/sales/hot-leads?limit=50')
      if (!response.ok) throw new Error('Failed to fetch hot leads')
      const data = await response.json()
      setHotLeads(data.leads || [])
      // Set first lead as selected customer if available
      if (data.leads && data.leads.length > 0 && !selectedCustomer) {
        setSelectedCustomer(data.leads[0])
      }
    } catch (error) {
      console.error('[SalesDashboard] Error fetching hot leads:', error)
      toast.error('ไม่สามารถโหลดข้อมูล Hot Leads ได้')
      // Fallback to mock data on error
      setHotLeads(mockHotLeads)
      if (!selectedCustomer) setSelectedCustomer(mockHotLeads[0])
    } finally {
      setIsLoadingLeads(false)
    }
  }, [selectedCustomer])

  useEffect(() => {
    fetchHotLeads()
    // Refresh every 5 minutes if auto-refresh is enabled
    const interval = autoRefreshEnabled ? setInterval(fetchHotLeads, 300000) : null
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [fetchHotLeads, autoRefreshEnabled])

  // Auto-sort and filter leads using prioritization algorithm
  const sortedLeads = useMemo(() => {
    let sorted = sortLeadsByPriority(hotLeads)

    // Apply search filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase()
      sorted = sorted.filter(
        (lead) =>
          lead.name.toLowerCase().includes(query) ||
          lead.topConcern.toLowerCase().includes(query) ||
          lead.email.toLowerCase().includes(query) ||
          lead.phone.includes(query),
      )
    }

    // Apply priority filter
    if (filterPriority !== "all") {
      sorted = sorted.filter((lead) => lead.priorityScore.priorityLevel === filterPriority)
    }

    return sorted
  }, [hotLeads, debouncedSearchQuery, filterPriority])

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE)
  }, [debouncedSearchQuery, filterPriority])

  // Displayed leads (with infinite scroll)
  const displayedLeads = sortedLeads.slice(0, displayCount)
  const hasMore = displayCount < sortedLeads.length
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Load more leads
  const loadMoreLeads = () => {
    setIsLoadingMore(true)
    setTimeout(() => {
      setDisplayCount((prev) => prev + ITEMS_PER_PAGE)
      setIsLoadingMore(false)
    }, 500)
  }

  // Infinite scroll sentinel ref
  const sentinelRef = useInfiniteScroll({
    onLoadMore: loadMoreLeads,
    hasMore,
    isLoading: isLoadingMore,
    threshold: 300,
  })

  // Auto-refresh sort every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastSortTime(new Date())
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // WebSocket notification system
  useEffect(() => {
    console.log("[SalesDashboard] Initializing WebSocket notifications")

    // Connect to WebSocket
    wsClient.connect()

    // Subscribe to notifications
    const unsubscribe = wsClient.subscribe((notification) => {
      console.log("[SalesDashboard] Received notification:", notification)

      // Add to notification queue (max 5 visible)
      setNotifications((prev) => {
        const updated = [...prev, notification]
        return updated.slice(-5) // Keep last 5
      })

      // Increment unread count
      setUnreadCount((prev) => prev + 1)

      // Mark lead as new if it's a new lead notification
      if (notification.type === "new_lead" && notification.leadId) {
        setNewLeadIds((prev) => new Set(prev).add(notification.leadId))

        // Remove "NEW" badge after 30 seconds
        setTimeout(() => {
          setNewLeadIds((prev) => {
            const updated = new Set(prev)
            updated.delete(notification.leadId)
            return updated
          })
        }, 30000)
      }

      // Play notification sound (only for critical/high priority)
      if (soundEnabled && (notification.priority === "critical" || notification.priority === "high")) {
        notificationSound.playNotification(notification.priority)
      }

      // Refresh lead list
      setLastSortTime(new Date())
    })

    // Cleanup
    return () => {
      unsubscribe()
      wsClient.disconnect()
    }
  }, [soundEnabled])

  // Toggle notification sound
  const toggleSound = () => {
    const newState = !soundEnabled
    setSoundEnabled(newState)
    if (newState) {
      notificationSound.enable()
    } else {
      notificationSound.disable()
    }
  }

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/check-role")
        if (!response.ok) {
          router.push("/auth/login")
          return
        }
        const data = await response.json()
        if (data.role !== "sales_staff" && data.role !== "admin") {
          router.push("/auth/login")
          return
        }
        setUserEmail(data.email)
      } catch (error) {
        console.error("[v0] Auth check failed:", error)
        router.push("/auth/login")
      } finally {
        setIsCheckingAuth(false)
      }
    }
    checkAuth()
  }, [router])

  const handleCall = (leadId: string) => {
    const lead = hotLeads.find((l) => l.id === leadId)
    if (!lead) {
      toast.error("ไม่พบข้อมูล Lead")
      return
    }
    console.log("Calling lead:", leadId)
    toast.success(`📞 กำลังโทรหา ${lead.name}...`)
  }

  const handleChat = (leadId: string) => {
    const lead = hotLeads.find((l) => l.id === leadId)
    if (!lead) {
      toast.error("ไม่พบข้อมูล Lead")
      return
    }
    setSelectedCustomer(lead)
    setChatOpen(true)
  }

  const handleEmail = (leadId: string) => {
    const lead = hotLeads.find((l) => l.id === leadId)
    if (!lead) {
      toast.error("ไม่พบข้อมูล Lead")
      return
    }
    console.log("Sending email to lead:", leadId)
    toast.success(`📧 เปิดแม่แบบอีเมลสำหรับ ${lead.name}`)
  }

  const handleARDemo = (leadId: string) => {
    const lead = hotLeads.find((l) => l.id === leadId)
    if (!lead) {
      toast.error("ไม่พบข้อมูล Lead")
      return
    }
    console.log("Sending AR Demo link to lead:", leadId)
    toast.success(`🎥 ส่งลิงก์ AR Demo ให้ ${lead.name} แล้ว!`, {
      description: `Link: https://ai367bar.com/ar-simulator?lead=${leadId}`,
    })
  }

  const handleProposal = (leadId: string) => {
    const lead = hotLeads.find((l) => l.id === leadId)
    if (!lead) {
      toast.error("ไม่พบข้อมูล Lead")
      return
    }
    setSelectedLead(lead)
    setProposalOpen(true)
  }

  const handleSendMessage = async (message: string) => {
    try {
      const newMessage = {
        id: String(messages.length + 1),
        text: message,
        sender: "sales" as const,
        timestamp: new Date(),
        isRead: false,
      }
      setMessages([...messages, newMessage])
      toast.success("ส่งข้อความสำเร็จ")
    } catch (error) {
      console.error("Failed to send message:", error)
      toast.error("ส่งข้อความไม่สำเร็จ กรุณาลองใหม่อีกครั้ง")
    }
  }

  const getPriorityBadgeClass = (level: string) => {
    // Solid background colors for priority badges (darker for better contrast)
    const solidColors = {
      critical: "bg-red-600",
      high: "bg-orange-600",
      medium: "bg-yellow-600",
      low: "bg-green-600",
      info: "bg-blue-600",
    }
    return solidColors[level as keyof typeof solidColors] || solidColors.info
  }

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-foreground/70">Verifying access...</p>
        </div>
      </div>
    )
  }

  return (
    <PageLayout>
      <ErrorBoundary>
        <div className="flex min-h-screen flex-col bg-muted/30">
          <Header />

        <main className="flex-1 pb-20 md:pb-0">
          {/* Header */}
          <div className="border-b bg-background dark:bg-gray-900 sticky top-16 z-40">
            <div className="container py-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h1 className="text-2xl font-bold">Sales Dashboard</h1>
                  <p className="text-sm text-foreground/70">Welcome back, {userEmail || "Sales Staff"}</p>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Online
                  </Badge>

                  {/* Notification Sound Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSound}
                    title={soundEnabled ? "Mute notifications" : "Unmute notifications"}
                  >
                    {soundEnabled ? <Bell className="h-4 w-4 mr-2" /> : <BellOff className="h-4 w-4 mr-2" />}
                    {soundEnabled ? "Sound On" : "Sound Off"}
                  </Button>

                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Center
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Templates
                  </Button>
                  <Button 
                    variant={autoRefreshEnabled ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                    title={autoRefreshEnabled ? "Disable auto-refresh" : "Enable auto-refresh"}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${autoRefreshEnabled ? 'animate-spin' : ''}`} />
                    Auto {autoRefreshEnabled ? 'On' : 'Off'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="container py-6 space-y-6">
            {/* Quick Navigation Menu */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              <Link href="/sales/leads">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 h-auto py-4"
                >
                  <Users className="h-5 w-5 text-blue-500" />
                  <div className="text-left">
                    <p className="font-semibold">All Leads</p>
                    <p className="text-xs text-muted-foreground">จัดการลูกค้า</p>
                  </div>
                </Button>
              </Link>

              <Link href="/sales/proposals">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 h-auto py-4"
                >
                  <FileText className="h-5 w-5 text-green-500" />
                  <div className="text-left">
                    <p className="font-semibold">Proposals</p>
                    <p className="text-xs text-muted-foreground">ใบเสนอราคา</p>
                  </div>
                </Button>
              </Link>

              <Link href="/sales/notes">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 h-auto py-4"
                >
                  <StickyNote className="h-5 w-5 text-yellow-500" />
                  <div className="text-left">
                    <p className="font-semibold">Customer Notes</p>
                    <p className="text-xs text-muted-foreground">บันทึกลูกค้า</p>
                  </div>
                </Button>
              </Link>

              <Link href="/marketing">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 h-auto py-4"
                >
                  <Megaphone className="h-5 w-5 text-purple-500" />
                  <div className="text-left">
                    <p className="font-semibold">Marketing</p>
                    <p className="text-xs text-muted-foreground">เครื่องมือการตลาด</p>
                  </div>
                </Button>
              </Link>

              <Link href="/campaign-automation">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 h-auto py-4"
                >
                  <Zap className="h-5 w-5 text-orange-500" />
                  <div className="text-left">
                    <p className="font-semibold">Campaigns</p>
                    <p className="text-xs text-muted-foreground">แคมเปญอัตโนมัติ</p>
                  </div>
                </Button>
              </Link>

              <Link href="/loyalty">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 h-auto py-4"
                >
                  <Gift className="h-5 w-5 text-pink-500" />
                  <div className="text-left">
                    <p className="font-semibold">Loyalty</p>
                    <p className="text-xs text-muted-foreground">โปรแกรมสะสมคะแนน</p>
                  </div>
                </Button>
              </Link>
            </div>

            {/* Sales Performance Overview */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Badge className="mb-2 bg-blue-100 text-blue-800">Live Performance</Badge>
                  <h2 className="text-lg md:text-xl font-semibold">Today's Performance</h2>
                  <p className="text-xs md:text-sm text-foreground/70">
                    Last updated: {new Date().toLocaleTimeString()}
                  </p>
                </div>
                <Link href="/sales/performance">
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Full Report
                  </Button>
                </Link>
              </div>
              <SalesMetrics />
            </div>

            {/* Presentation Stats Cards */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold">Presentation Stats</h2>
                  <p className="text-xs md:text-sm text-foreground/70">
                    Field presentations overview
                  </p>
                </div>
                <Link href="/sales/presentations">
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </Link>
              </div>
              <PresentationStatsCards />
            </div>

            {/* Field Presentation CTA - Prominent Button */}
            <div className="bg-blue-600 border-b-4 border-blue-700 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Smartphone className="h-6 w-6" />
                    <h3 className="text-xl font-bold">Mobile Field Presentation</h3>
                  </div>
                  <p className="text-sm text-blue-50 mb-1">
                    ระบบ AR/AI Analysis สำหรับเซลส์ พร้อมวิเคราะห์ผิวหน้าและปิดการขายได้ทันที
                  </p>
                  <p className="text-xs text-blue-100">
                    ✨ Scan → Analyze → AR Preview → Products → Proposal → Signature
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href={`/sales/wizard/new-${Date.now()}`}>
                    <Button 
                      size="lg"
                      className="bg-white text-blue-600 hover:bg-blue-50 shadow-md h-14 px-8"
                    >
                      <Presentation className="h-5 w-5 mr-2" />
                      เริ่ม Presentation ใหม่
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Resume Incomplete Presentations */}
            <ResumePresentations />

            {/* Hot Leads - Priority Queue */}
            <div>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2 flex-wrap">
                    🔥 Hot Leads
                    <Badge className="bg-red-100 text-red-800 text-xs">
                      {
                        sortedLeads.filter(
                          (l) =>
                            l.priorityScore.priorityLevel === "critical" || l.priorityScore.priorityLevel === "high",
                        ).length
                      }{" "}
                      High Priority
                    </Badge>
                    {sortedLeads.length < hotLeads.length && (
                      <Badge variant="secondary" className="ml-2">
                        {sortedLeads.length} of {hotLeads.length}
                      </Badge>
                    )}
                  </h2>
                  <p className="text-xs text-foreground/70 flex items-center gap-1 mt-1">
                    <Sparkles className="h-3 w-3" />
                    Auto-sorted by AI • Last updated: {formatTimeAgo(lastSortTime)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden md:flex"
                  onClick={() => setLastSortTime(new Date())}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {/* Search and Filter Bar */}
              <div className="mb-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50" />
                  <Input
                    type="text"
                    placeholder="Search by name, concern, email, phone..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                  {searchQuery && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      {searchQuery === debouncedSearchQuery ? `${sortedLeads.length} found` : "Searching..."}
                    </span>
                  )}
                </div>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="critical">🔴 Critical</SelectItem>
                    <SelectItem value="high">🟠 High</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="low">🟢 Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Lead Cards - Tablet Optimized with Priority Scores */}
              <div className="space-y-4">
                {isLoadingLeads ? (
                  // Show skeleton loaders while loading
                  <>
                    <HotLeadCardSkeleton />
                    <HotLeadCardSkeleton />
                    <HotLeadCardSkeleton />
                  </>
                ) : displayedLeads.length === 0 ? (
                  // No results found
                  searchQuery || filterPriority !== "all" ? (
                    <SearchNoResultsState
                      query={searchQuery || `Priority: ${filterPriority}`}
                      onClear={() => {
                        setSearchQuery("")
                        setFilterPriority("all")
                      }}
                    />
                  ) : (
                    <NoDataState
                      message="ยังไม่มี Hot Leads"
                      description="รอลูกค้าทำ Skin Analysis หรือเพิ่มลูกค้าใหม่"
                    />
                  )
                ) : (
                  <>
                    {/* Show actual lead cards when loaded */}
                    {displayedLeads.map((lead) => (
                      <div key={lead.id} className="relative group">
                        {/* NEW Lead Indicator */}
                        {newLeadIds.has(lead.id) && (
                          <div className="absolute -top-3 -left-3 z-20 animate-bounce">
                            <Badge className="bg-green-600 border-2 border-green-700 text-white shadow-lg">
                              ✨ NEW
                            </Badge>
                          </div>
                        )}

                        {/* Priority Badge Overlay - Clickable */}
                        <button
                          onClick={() => {
                            setSelectedLeadForScore(lead)
                            setScoreDetailOpen(true)
                          }}
                          className="absolute -top-2 -right-2 z-10 transition-transform hover:scale-110"
                        >
                          <Badge
                            className={`${getPriorityBadgeClass(lead.priorityScore.priorityLevel)} text-white shadow-lg cursor-pointer`}
                          >
                            {lead.priorityScore.badge} ({lead.priorityScore.totalScore})
                          </Badge>
                        </button>
                        
                        {/* Start Presentation Button - Quick Action */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/sales/wizard/${lead.id}?name=${encodeURIComponent(lead.name)}&phone=${encodeURIComponent(lead.phone || '')}&email=${encodeURIComponent(lead.email || '')}`}>
                            <Button 
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 border-2 border-blue-700 text-white shadow-lg h-8 px-4"
                            >
                              <Smartphone className="h-3.5 w-3.5 mr-1.5" />
                              Start Presentation
                            </Button>
                          </Link>
                        </div>

                        <HotLeadCard
                          lead={lead}
                          onCall={handleCall}
                          onChat={handleChat}
                          onEmail={handleEmail}
                          onARDemo={handleARDemo}
                          onProposal={handleProposal}
                        />
                      </div>
                    ))}

                    {/* Infinite scroll sentinel */}
                    <div ref={sentinelRef} className="h-20 flex items-center justify-center">
                      {isLoadingMore && (
                        <div className="flex items-center gap-2 text-foreground/70">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          <span className="text-sm">กำลังโหลดเพิ่มเติม...</span>
                        </div>
                      )}
                      {!hasMore && sortedLeads.length > ITEMS_PER_PAGE && (
                        <p className="text-sm text-foreground/70">แสดงครบทั้งหมด {sortedLeads.length} รายการแล้ว</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* AI Tools - Hidden on Mobile, Grid on Desktop */}
            {/* <div className="hidden lg:grid grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                🤖 AI Proposal
                <Badge className="bg-purple-100 text-purple-800 text-xs">Smart</Badge>
              </h3>
              <AIProposalGenerator />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                🎯 Lead Scoring
                <Badge className="bg-orange-100 text-orange-800 text-xs">AI</Badge>
              </h3>
              <LeadScoring />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                ⚖️ Comparison
                <Badge className="bg-green-100 text-green-800 text-xs">Interactive</Badge>
              </h3>
              <TreatmentComparison />
            </div>
          </div> */}
          </div>
        </main>

        {/* Floating Bottom Navigation - Tablet/Mobile Only */}
        <FloatingBottomNav
          unreadChats={unreadCount}
          newBookings={2}
          notificationCount={unreadCount}
          onNavigate={(tab) => {
            if (tab === "chats") {
              setChatOpen(true)
            } else if (tab === "bookings") {
              toast.info("📅 Opening today's bookings...")
            } else if (tab === "ai-tools") {
              toast.info("🤖 Opening AI Tools panel...")
            } else if (tab === "profile") {
              toast.info("👤 Opening profile...")
            }
          }}
        />

        {/* Chat Drawer */}
        {selectedCustomer && (
          <ChatDrawer
            open={chatOpen}
            onOpenChange={setChatOpen}
            customer={{
              id: selectedCustomer.id,
              name: selectedCustomer.name,
              photo: selectedCustomer.photo,
              initials: selectedCustomer.initials,
              isOnline: selectedCustomer.isOnline,
              isTyping: false,
            }}
            messages={messages}
            onSendMessage={handleSendMessage}
            onCall={() => handleCall(selectedCustomer.id)}
            onVideoCall={() => alert("📹 Starting video call...")}
          />
        )}

        {/* Quick Proposal - Tablet Optimized */}
        <QuickProposal
          open={proposalOpen}
          onOpenChange={setProposalOpen}
          lead={selectedLead}
          onSent={() => {
            alert(`✅ Proposal sent to ${selectedLead?.name}!`)
          }}
        />

        {/* Priority Score Detail Drawer */}
        {selectedLeadForScore && (
          <div className={`fixed inset-0 z-50 ${scoreDetailOpen ? "block" : "hidden"}`}>
            <button
              type="button"
              className="absolute inset-0 bg-black/50 cursor-default"
              onClick={() => setScoreDetailOpen(false)}
              aria-label="Close priority score details"
            />
            <div className="absolute right-0 top-0 bottom-0 w-full sm:w-96 bg-background shadow-xl transform transition-transform">
              <div className="h-full overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Priority Score Details</h3>
                  <Button variant="ghost" size="sm" onClick={() => setScoreDetailOpen(false)}>
                    ✕
                  </Button>
                </div>
                {selectedLeadForScore && (
                  <PriorityScoreCard
                    leadName={selectedLeadForScore.name}
                    priorityScore={selectedLeadForScore.priorityScore}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Offline Indicator */}
        <OfflineIndicator />

        {/* Notification Toasts */}
        {notifications.map((notification) => (
          <LeadNotificationToast
            key={notification.id}
            notification={notification}
            onClose={() => {
              setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
            }}
          />
        ))}

        {/* Floating Bottom Navigation - Mobile Only */}
        <FloatingBottomNav
          unreadChats={2}
          newBookings={1}
          notificationCount={unreadCount}
          onNavigate={(tab) => {
            console.log("Navigating to:", tab)
            if (tab === "chats") {
              setChatOpen(true)
            }
          }}
        />

        <Footer />
        </div>
      </ErrorBoundary>
    </PageLayout>
  )
}
