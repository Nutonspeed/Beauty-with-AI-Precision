import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, History, User, Sparkles, TrendingUp, FileText, Target } from "lucide-react"
import { BookingHistoryList } from "@/components/customer/booking-history-list"
import { AnalysisHistoryList } from "@/components/customer/analysis-history-list"
import { ProfileCard } from "@/components/customer/profile-card"
import Link from "next/link"

export default async function CustomerDashboardPage() {
  const supabase = await createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login?callbackUrl=/customer/dashboard")
  }

  // Fetch user profile using service role client to bypass RLS
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .single()

  if (profileError) {
    console.log("[v0] Error fetching profile:", profileError)
  }

  let bookingCount = 0
  const { count, error: bookingError } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("user_id", session.user.id)

  if (!bookingError) {
    bookingCount = count || 0
  } else {
    console.log("[v0] Bookings table not available:", bookingError.message)
  }

  // Fetch analysis count
  const { count: analysisCount } = await supabase
    .from("skin_analyses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", session.user.id)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">
              My Dashboard
              <br />
              <span className="text-xl text-primary">แดชบอร์ดของฉัน</span>
            </h1>
            <p className="text-muted-foreground">Welcome back, {profile?.full_name || session.user.email}</p>
          </div>

          {/* Quick Stats */}
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold">{bookingCount}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
                  <Sparkles className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">AI Analyses</p>
                  <p className="text-2xl font-bold">{analysisCount || 0}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                  <User className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="text-lg font-bold">
                    {new Date(session.user.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Quick Actions / เมนูด่วน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Link href="/booking">
                  <Card className="cursor-pointer border-2 border-transparent transition-all hover:border-primary/50 hover:shadow-md">
                    <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                        <Calendar className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-semibold">Book Appointment</p>
                        <p className="text-xs text-muted-foreground">จองนัดหมาย</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/analysis">
                  <Card className="cursor-pointer border-2 border-transparent transition-all hover:border-primary/50 hover:shadow-md">
                    <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
                        <Sparkles className="h-6 w-6 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-semibold">AI Analysis</p>
                        <p className="text-xs text-muted-foreground">วิเคราะห์ผิว AI</p>
                      </div>
                      <Badge className="bg-primary text-xs">Popular</Badge>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/treatment-plans">
                  <Card className="cursor-pointer border-2 border-transparent transition-all hover:border-primary/50 hover:shadow-md">
                    <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                        <FileText className="h-6 w-6 text-green-500" />
                      </div>
                      <div>
                        <p className="font-semibold">Treatment Plans</p>
                        <p className="text-xs text-muted-foreground">แผนการรักษา</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/progress">
                  <Card className="cursor-pointer border-2 border-transparent transition-all hover:border-primary/50 hover:shadow-md">
                    <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
                        <TrendingUp className="h-6 w-6 text-orange-500" />
                      </div>
                      <div>
                        <p className="font-semibold">My Progress</p>
                        <p className="text-xs text-muted-foreground">ความคืบหน้า</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link href="/analysis/history">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <History className="h-4 w-4" />
                    <span>Analysis History / ประวัติการวิเคราะห์</span>
                  </Button>
                </Link>
                <Link href="/payment">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Payment / ชำระเงิน</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <Tabs defaultValue="bookings" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bookings">
                <Calendar className="mr-2 h-4 w-4" />
                Bookings
              </TabsTrigger>
              <TabsTrigger value="analyses">
                <History className="mr-2 h-4 w-4" />
                Analyses
              </TabsTrigger>
              <TabsTrigger value="profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bookings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Booking History / ประวัติการจอง</CardTitle>
                </CardHeader>
                <CardContent>
                  <BookingHistoryList userId={session.user.id} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analyses" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analysis History / ประวัติการวิเคราะห์</CardTitle>
                </CardHeader>
                <CardContent>
                  <AnalysisHistoryList userId={session.user.id} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="mt-6">
              <ProfileCard user={session.user} profile={profile} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
