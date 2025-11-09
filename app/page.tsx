"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Bot, BrainCircuit, Camera } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16 items-center">
              <div className="space-y-4">
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                  AI-Powered Sales & Analysis
                </Badge>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-gray-900 dark:text-gray-50">
                  The Future of Personalized Skin Care
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                  Empower your sales team with our advanced AI skin analysis, AR visualization, and automated sales tools. Drive engagement and boost conversions.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Link
                    href="/demo"
                    className="inline-flex h-12 items-center justify-center rounded-md bg-blue-600 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-950 disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    Request a Demo
                  </Link>
                  <Link
                    href="/auth/login"
                    className="inline-flex h-12 items-center justify-center rounded-md border border-gray-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50"
                    prefetch={false}
                  >
                    Sales Login
                  </Link>
                </div>
              </div>
              <div className="hidden lg:block">
                {/* Placeholder for a cool graphic or animation */}
                <div className="w-full h-80 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <p className="text-gray-500">[AI Analysis in Action]</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Key Features for Sales Excellence</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Our platform provides everything your team needs to succeed in the modern beauty industry.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-3 mt-12">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">
                      <BrainCircuit className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold">AI Skin Analysis</h3>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get instant, accurate skin analysis from a single photo. Identify concerns like wrinkles, pores, and pigmentation with over 95% accuracy.
                  </p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-full">
                      <Camera className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold">AR Treatment Simulation</h3>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Show customers the potential results of treatments in real-time with our advanced Augmented Reality technology.
                  </p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full">
                      <Bot className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold">AI-Powered Sales Dashboard</h3>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Prioritize leads with our intelligent scoring system. Get real-time notifications and manage your sales pipeline effectively.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Ready to Transform Your Sales Process?
              </h2>
              <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Join leading clinics and beauty brands who are using our technology to deliver exceptional customer experiences and drive revenue.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <Link href="/demo">
                <Button size="lg" className="w-full">
                  Get Started Today <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Sign up for a personalized demo.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
