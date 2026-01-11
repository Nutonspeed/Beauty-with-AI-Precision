import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Bell, Lock, Palette, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { PersonalInfoForm } from '@/components/profile/personal-info-form'
import { PasswordChangeForm } from '@/components/profile/password-change-form'
import { NotificationSettings } from '@/components/profile/notification-settings'
import { PreferencesForm } from '@/components/profile/preferences-form'

type PageProps = {
  params: Promise<{ locale: string }>
}

export default async function ProfilePage({ params }: PageProps) {
  const { locale } = await params

  if (process.env.NEXT_PUBLIC_TEST_MODE === 'true') {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-muted/30">
          <div className="container py-8">
            <div className="mb-8">
              <h1 className="mb-2 text-3xl font-bold">Profile Settings</h1>
              <p className="text-muted-foreground">Test Mode</p>
            </div>

            <Card className="mb-6">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                  U
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">Test User</h2>
                  <p className="text-sm text-muted-foreground">test@example.com</p>
                </div>
                <Badge variant="secondary" className="text-sm">
                  admin
                </Badge>
              </CardContent>
            </Card>

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

              <TabsContent value="personal" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Test content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <input className="hidden" />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Password & Security</CardTitle>
                    <CardDescription>Test content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <input type="password" />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>Test content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <button role="switch" type="button">
                      Toggle
                    </button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>Test content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <button type="button">Save</button>
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

  const supabase = await createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect(`/${locale}/auth/login?callbackUrl=/${locale}/profile`)
  }

  const { data: profile } = await supabase.from('users').select('*').eq('id', session.user.id).single()

  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      customer: 'ลูกค้า (Customer)',
      sales_staff: 'พนักงานขาย (Sales Staff)',
      center_owner: 'เจ้าของศูนย์ความงาม (Center Owner)',
      center_staff: 'พนักงาน (Staff)',
      admin: 'ผู้ดูแลระบบ (Admin)',
      super_admin: 'ผู้ดูแลระบบสูงสุด (Super Admin)',
    }
    return roleMap[role] || role
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#020617] text-slate-200 selection:bg-pink-500/30">
      <Header />

      <main className="flex-1 relative overflow-hidden">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12 space-y-4"
          >
            <Badge variant="outline" className="px-4 py-1 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10">
              Aesthetic Profile Infrastructure
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white italic">
              Profile Settings
              <br />
              <span className="text-2xl md:text-3xl bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent not-italic font-light">ตั้งค่าโปรไฟล์</span>
            </h1>
            <p className="text-slate-400 font-light tracking-wide max-w-2xl italic">Manage your aesthetic account nodes and system preferences with precision.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="mb-10 border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
              <CardContent className="flex flex-col md:flex-row items-center gap-10 p-10 lg:p-12">
                <div className="relative group/avatar">
                  <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur opacity-20 group-hover/avatar:opacity-40 transition duration-1000" />
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white/[0.03] border border-white/10 text-4xl font-black text-pink-400 shadow-inner group-hover/avatar:scale-105 transition-transform duration-700">
                    {profile?.full_name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left space-y-2">
                  <h2 className="text-3xl font-bold text-white tracking-tight italic">{profile?.full_name || 'System User'}</h2>
                  <p className="text-lg text-slate-500 font-light tracking-wide">{session.user.email}</p>
                </div>
                <Badge className="bg-pink-600/10 text-pink-400 border border-pink-500/20 px-6 py-2 rounded-full uppercase tracking-widest text-[10px] font-black italic shadow-inner">
                  {getRoleDisplay(profile?.role || 'customer')}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>

          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-white/[0.02] border border-white/5 p-2 rounded-[2rem] mb-10 h-auto gap-2">
              <TabsTrigger value="personal" className="rounded-2xl py-4 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.15em] text-[10px]">
                <User className="mr-3 h-4 w-4" />
                Personal Info
              </TabsTrigger>
              <TabsTrigger value="security" className="rounded-2xl py-4 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.15em] text-[10px]">
                <Lock className="mr-3 h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications" className="rounded-2xl py-4 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.15em] text-[10px]">
                <Bell className="mr-3 h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="preferences" className="rounded-2xl py-4 data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all font-black uppercase tracking-[0.15em] text-[10px]">
                <Palette className="mr-3 h-4 w-4" />
                Preferences
              </TabsTrigger>
            </TabsList>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <TabsContent value="personal" className="mt-0 outline-none">
                <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <CardHeader className="p-10 lg:p-12 pb-4">
                    <CardTitle className="text-2xl font-bold text-white tracking-tight italic">Personal Information</CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">Synchronize your aesthetic identity</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 lg:p-12 pt-6">
                    <PersonalInfoForm user={session.user} profile={profile} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="mt-0 outline-none">
                <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <CardHeader className="p-10 lg:p-12 pb-4">
                    <CardTitle className="text-2xl font-bold text-white tracking-tight italic">Password & Security</CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">Manage secure access keys</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 lg:p-12 pt-6">
                    <PasswordChangeForm />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="mt-0 outline-none">
                <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <CardHeader className="p-10 lg:p-12 pb-4">
                    <CardTitle className="text-2xl font-bold text-white tracking-tight italic">Notification Settings</CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">Configure real-time system alerts</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 lg:p-12 pt-6">
                    <NotificationSettings userId={session.user.id} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences" className="mt-0 outline-none">
                <Card className="border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <CardHeader className="p-10 lg:p-12 pb-4">
                    <CardTitle className="text-2xl font-bold text-white tracking-tight italic">Preferences</CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">Customize system interface parameters</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 lg:p-12 pt-6">
                    <PreferencesForm userId={session.user.id} />
                  </CardContent>
                </Card>
              </TabsContent>
            </motion.div>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
