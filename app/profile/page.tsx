import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { User, Lock, Bell, Palette } from "lucide-react"
import { PersonalInfoForm } from "@/components/profile/personal-info-form"
import { PasswordChangeForm } from "@/components/profile/password-change-form"
import { NotificationSettings } from "@/components/profile/notification-settings"
import { PreferencesForm } from "@/components/profile/preferences-form"

export default async function ProfilePage() {
  const supabase = await createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login?callbackUrl=/profile")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("users").select("*").eq("id", session.user.id).single()

  // Get role display name
  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      customer: "ลูกค้า (Customer)",
      sales_staff: "พนักงานขาย (Sales Staff)",
      clinic_owner: "เจ้าของคลินิก (Clinic Owner)",
      clinic_staff: "พนักงานคลินิก (Clinic Staff)",
      admin: "ผู้ดูแลระบบ (Admin)",
      super_admin: "ผู้ดูแลระบบสูงสุด (Super Admin)",
    }
    return roleMap[role] || role
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">
              Profile Settings
              <br />
              <span className="text-xl text-primary">ตั้งค่าโปรไฟล์</span>
            </h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>

          {/* Account Info Card */}
          <Card className="mb-6">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                {profile?.full_name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{profile?.full_name || "User"}</h2>
                <p className="text-sm text-muted-foreground">{session.user.email}</p>
              </div>
              <Badge variant="secondary" className="text-sm">
                {getRoleDisplay(profile?.role || "customer")}
              </Badge>
            </CardContent>
          </Card>

          {/* Settings Tabs */}
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">
                <User className="mr-2 h-4 w-4" />
                Personal Info
              </TabsTrigger>
              <TabsTrigger value="security">
                <Lock className="mr-2 h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="preferences">
                <Palette className="mr-2 h-4 w-4" />
                Preferences
              </TabsTrigger>
            </TabsList>

            {/* Personal Info Tab */}
            <TabsContent value="personal" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details and contact information</CardDescription>
                </CardHeader>
                <CardContent>
                  <PersonalInfoForm user={session.user} profile={profile} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Password & Security</CardTitle>
                  <CardDescription>Manage your password and account security settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <PasswordChangeForm />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Choose what notifications you want to receive</CardDescription>
                </CardHeader>
                <CardContent>
                  <NotificationSettings userId={session.user.id} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Customize your experience</CardDescription>
                </CardHeader>
                <CardContent>
                  <PreferencesForm userId={session.user.id} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
