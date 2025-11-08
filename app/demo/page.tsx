"use client"

import { signIn } from "next-auth/react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Briefcase, ShoppingCart, ArrowRight, Sparkles, BarChart3, MessageSquare, Zap } from "lucide-react"

export default function DemoPage() {
  const demoAccounts = [
    {
      role: "Clinic Owner",
      email: "clinic-owner@example.com",
      password: "password123",
      icon: Briefcase,
      color: "bg-blue-500",
      features: [
        "Executive Dashboard with KPIs",
        "Live Pipeline Management",
        "Revenue Analytics",
        "Quick Actions Panel",
      ],
      path: "/clinic/dashboard",
    },
    {
      role: "Sales Staff",
      email: "sales@example.com",
      password: "password123",
      icon: BarChart3,
      color: "bg-green-500",
      features: [
        "AI-Powered Lead Scoring",
        "Live Chat with Customers",
        "AI Proposal Generator",
        "Treatment Comparison Tool",
      ],
      path: "/sales/dashboard",
    },
    {
      role: "Customer",
      email: "customer@example.com",
      password: "password123",
      icon: User,
      color: "bg-purple-500",
      features: [
        "AI Skin Analysis",
        "AR Treatment Simulator",
        "Before/After Comparisons",
        "Treatment Recommendations",
      ],
      path: "/analysis",
    },
    {
      role: "Super Admin",
      email: "admin@ai367bar.com",
      password: "password123",
      icon: Zap,
      color: "bg-orange-500",
      features: [
        "Multi-Tenant Management",
        "Create & Configure Clinics",
        "Usage Analytics",
        "Platform Administration",
      ],
      path: "/super-admin",
    },
  ]

  const handleQuickLogin = async (email: string, password: string, path: string) => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.ok) {
      globalThis.location.href = path
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-gradient-to-b from-muted/30 to-background">
        <div className="container py-16">
          {/* Hero Section */}
          <div className="mb-12 text-center">
            <Badge className="mb-4 bg-primary/10 text-primary" variant="secondary">
              <Sparkles className="mr-2 h-3 w-3" />
              AI367BAR B2B2C Demo
            </Badge>
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
              Experience the Future of
              <br />
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                AI-Powered Aesthetic Clinic Management
              </span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
              ทดสอบระบบด้วย Demo Accounts ที่พร้อมใช้งาน เข้าถึงฟีเจอร์ AI ที่ทรงพลัง
              <br />
              และสัมผัสประสบการณ์การบริหารคลินิกยุคใหม่
            </p>
          </div>

          {/* Demo Accounts Grid */}
          <div className="mb-16 grid gap-6 md:grid-cols-3">
            {demoAccounts.map((account) => {
              const Icon = account.icon
              return (
                <Card key={account.role} className="relative overflow-hidden border-2 transition-all hover:border-primary hover:shadow-lg">
                  <div className={`absolute left-0 top-0 h-1 w-full ${account.color}`} />
                  <CardHeader>
                    <div className="mb-4 flex items-center justify-between">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${account.color} text-white`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <Badge variant="outline">{account.role}</Badge>
                    </div>
                    <CardTitle className="text-xl">{account.role}</CardTitle>
                    <CardDescription>
                      {account.role === "Clinic Owner" && "Dashboard ระดับผู้บริหารพร้อม Analytics"}
                      {account.role === "Sales Staff" && "เครื่องมือขายที่ขับเคลื่อนด้วย AI"}
                      {account.role === "Customer" && "ประสบการณ์ลูกค้าด้วยเทคโนโลยี AI + AR"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Credentials */}
                    <div className="rounded-lg bg-muted/50 p-3 text-xs">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="font-semibold">Email:</span>
                        <code className="text-primary">{account.email}</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Password:</span>
                        <code className="text-primary">{account.password}</code>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                      {account.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <Zap className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Quick Login Button */}
                    <Button
                      className="w-full"
                      onClick={() => handleQuickLogin(account.email, account.password, account.path)}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Quick Login as {account.role}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Feature Highlights */}
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-2xl">✨ Key Features</CardTitle>
              <CardDescription>What makes AI367BAR unique</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">AI-Powered Analysis</h3>
                  <p className="text-sm text-muted-foreground">Advanced skin analysis using multiple AI models</p>
                </div>
                <div className="space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500 text-white">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">Real-time Analytics</h3>
                  <p className="text-sm text-muted-foreground">Live dashboards with actionable insights</p>
                </div>
                <div className="space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500 text-white">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">Live Chat</h3>
                  <p className="text-sm text-muted-foreground">Real-time customer communication</p>
                </div>
                <div className="space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 text-white">
                    <Zap className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">AR Simulator</h3>
                  <p className="text-sm text-muted-foreground">Visualize treatment results before purchase</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <div className="mt-12 text-center">
            <h3 className="mb-4 text-2xl font-bold">Ready to Transform Your Clinic?</h3>
            <p className="mb-6 text-muted-foreground">
              Start with any demo account above or explore the platform
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="outline" onClick={() => (window.location.href = "/")}>
                Back to Home
              </Button>
              <Button size="lg" onClick={() => (window.location.href = "/auth/login")}>
                Go to Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
