import { redirect } from "next/navigation"
import { PageLayout } from "@/components/layouts/page-layout"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PerformanceCards } from "@/components/dashboard/performance-cards"
import { LivePipeline } from "@/components/dashboard/live-pipeline"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { TopPrograms } from "@/components/dashboard/top-programs"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { StaffAvailability } from "@/components/dashboard/staff-availability"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Settings, Bell, User, Calendar, Users, BarChart3, Package, Building2, MessageSquare, TrendingUp, Zap, Monitor } from "lucide-react"
import { checkUserRole } from "@/lib/auth/check-role"
import Link from "next/link"

export default async function CenterDashboardPage() {
  console.log('[CenterDashboard] 📍 Page rendering...')
  
  try {
    // ✅ Allow center_owner and center_staff
    const { user, centerId } = await checkUserRole(["center_owner", "center_staff", "center_admin", "super_admin"])

    if (!user || !centerId) {
      console.log('[CenterDashboard] ❌ No user/center, redirecting to login')
      redirect("/auth/login")
    }
    
    console.log('[CenterDashboard] ✅ User authorized:', user.email, 'Center:', centerId)

    // Fetch dashboard data
    let dashboardData = null
    try {
      // Simulate data fetching - replace with actual data fetching logic
      dashboardData = {
        totalClients: 156,
        todayAppointments: 12,
        monthlyRevenue: 458900,
        activeStaff: 8
      }
      console.log('[CenterDashboard] ✅ Data fetched successfully')
    } catch (dataError) {
      console.error('[CenterDashboard] ⚠️ Data fetch error:', dataError)
      dashboardData = {
        totalClients: 0,
        todayAppointments: 0,
        monthlyRevenue: 0,
        activeStaff: 0
      }
    }

  return (
    <PageLayout>
      <div className="md:flex min-h-screen flex-col bg-muted/30">
        <Header />

      <main className="flex-1">
        {/* Header */}
        <div className="border-b bg-background dark:bg-gray-900">
          <div className="container py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Center Dashboard</h1>
                <p className="text-foreground/70">Welcome back, {user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-8">
          {/* Quick Management Menu */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Management Tools / เครื่องมือจัดการ</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Link href="/center/clients">
                <Card className="cursor-pointer border-2 border-transparent transition-all hover:border-primary/50 hover:shadow-md">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                      <User className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Clients</p>
                      <p className="text-xs text-muted-foreground">ลูกค้า & Leads</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/schedule">
                <Card className="cursor-pointer border-2 border-transparent transition-all hover:border-primary/50 hover:shadow-md">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                      <Calendar className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Schedule</p>
                      <p className="text-xs text-muted-foreground">ตารางนัดหมาย</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/queue/patient">
                <Card className="cursor-pointer border-2 border-transparent transition-all hover:border-primary/50 hover:shadow-md">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
                      <Users className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Queue</p>
                      <p className="text-xs text-muted-foreground">จัดการคิว</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href={`/center/queue/display?centerId=${centerId}`} target="_blank">
                <Card className="cursor-pointer border-2 border-yellow-500/30 bg-yellow-50 dark:bg-yellow-900/10 transition-all hover:border-yellow-500 hover:shadow-md">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20">
                      <Monitor className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Queue Display</p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-400">📺 หน้าจอแสดงคิว</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/center/analytics">
                <Card className="cursor-pointer border-2 border-transparent transition-all hover:border-primary/50 hover:shadow-md">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                      <BarChart3 className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Analytics</p>
                      <p className="text-xs text-muted-foreground">วิเคราะห์ข้อมูล</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/inventory">
                <Card className="cursor-pointer border-2 border-transparent transition-all hover:border-primary/50 hover:shadow-md">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10">
                      <Package className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Inventory</p>
                      <p className="text-xs text-muted-foreground">สต็อกสินค้า</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/center/staff">
                <Card className="cursor-pointer border-2 border-transparent transition-all hover:border-primary/50 hover:shadow-md">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/10">
                      <Users className="h-5 w-5 text-teal-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Staff</p>
                      <p className="text-xs text-muted-foreground">จัดการทีมงาน</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/branches">
                <Card className="cursor-pointer border-2 border-transparent transition-all hover:border-primary/50 hover:shadow-md">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10">
                      <Building2 className="h-5 w-5 text-cyan-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Branches</p>
                      <p className="text-xs text-muted-foreground">จัดการสาขา</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/chat">
                <Card className="cursor-pointer border-2 border-transparent transition-all hover:border-primary/50 hover:shadow-md">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500/10">
                      <MessageSquare className="h-5 w-5 text-pink-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Live Chat</p>
                      <p className="text-xs text-muted-foreground">แชทสด</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/center/settings/automation">
                <Card className="cursor-pointer border-2 border-transparent transition-all hover:border-primary/50 hover:shadow-md">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                      <Zap className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Automation</p>
                      <p className="text-xs text-muted-foreground">ระบบอัตโนมัติ</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/analytics">
                <Card className="cursor-pointer border-2 border-transparent transition-all hover:border-primary/50 hover:shadow-md">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10">
                      <TrendingUp className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Analytics</p>
                      <p className="text-xs text-muted-foreground">วิเคราะห์ข้อมูล</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/analytics/realtime">
                <Card className="cursor-pointer border-2 border-transparent transition-all hover:border-primary/50 hover:shadow-md">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                      <TrendingUp className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Realtime</p>
                      <p className="text-xs text-muted-foreground">แบบเรียลไทม์</p>
                    </div>
                    <Badge className="ml-auto bg-red-500 text-xs">Live</Badge>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Today's Performance */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Badge className="mb-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100">Live</Badge>
                <h2 className="text-xl font-semibold">Today's Performance</h2>
                <p className="text-sm text-foreground/70">Last updated: {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
            <PerformanceCards />
          </div>

          {/* Live Sales Pipeline */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-6">🔥 Live Sales Pipeline</h2>
            <LivePipeline />
          </div>

          {/* Revenue Trends */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-6">📈 Revenue Trends (This Month)</h2>
            <RevenueChart />
          </div>

          {/* Top Performing Programs */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-6">🎯 Top Performing Programs</h2>
            <TopPrograms />
          </div>

          {/* Staff & Activity Grid */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-6">👥 Team & Activity</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StaffAvailability />
              <RecentActivity />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-6">⚡ Quick Actions</h2>
            <QuickActions />
          </div>
        </div>
      </main>

      <Footer />
      </div>
    </PageLayout>
  )
  } catch (error) {
    console.error('[CenterDashboard] ❌ Critical error:', error)
    redirect("/auth/login?error=dashboard_failed")
  }
}
