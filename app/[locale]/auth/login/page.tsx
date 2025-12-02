'use client'

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/context"
import { getDefaultLandingPage } from "@/lib/auth/role-config"
import { normalizeRole } from "@/lib/auth/role-normalize"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2, LogIn, ArrowLeft, Sparkles, Shield, Zap } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function LoginPage() {
  const showDemo = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SHOW_DEMO_LOGINS === 'true'
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  
  const { signIn, user } = useAuth()
  const router = useRouter()

  // Auto-redirect if already logged in (use canonical normalization + default landing)
  useEffect(() => {
    if (user) {
      try {
        const normalized = normalizeRole(user.role as any)
        const redirectPath = getDefaultLandingPage(normalized as any)
        globalThis.location.href = redirectPath
      } catch (e) {
        console.warn('[LoginPage] Failed to resolve landing page, fallback to /dashboard', e)
        globalThis.location.href = '/dashboard'
      }
    }
  }, [user])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Validation
    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน')
      setLoading(false)
      return
    }

    if (!email.includes('@')) {
      setError('กรุณากรอกอีเมลที่ถูกต้อง')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      setLoading(false)
      return
    }

    try {
      console.log('[LoginPage] 🔐 Attempting login for:', email)
      
      const result = await signIn(email, password)
      
      if (result.error) {
        console.error('[LoginPage] ❌ Login error:', result.error)
        if (result.error instanceof Error && result.error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password')
        } else if (result.error instanceof Error && result.error.message.includes('Email not confirmed')) {
          setError('กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ')
        } else {
          setError(result.error instanceof Error ? result.error.message : 'Unknown error')
        }
        setLoading(false)
        return
      }

      console.log('[LoginPage] ✅ Login successful! Role:', result.role)
      
      // Redirect immediately based on role from signIn response
      const role = result.role || 'customer'
      const redirectPath = getDefaultLandingPage(normalizeRole(role as any) as any)
      console.log('[LoginPage] 🚀 Redirecting to:', redirectPath)
      
      // Use router.push for faster redirect
      router.push(redirectPath)
    } catch (err) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
      console.error('[LoginPage] ❌ Unexpected error:', err)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-700 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-400/20 rounded-full blur-2xl animate-pulse delay-500" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Sparkles className="w-8 h-8" />
              </div>
              <span className="text-3xl font-bold">ClinicIQ</span>
            </div>
            
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              AI-Powered<br />Skin Analysis
            </h1>
            <p className="text-xl text-white/80 mb-8">
              ระบบวิเคราะห์ผิวหน้าด้วย AI ที่แม่นยำ<br />
              สำหรับคลินิกความงามชั้นนำ
            </p>
            
            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Zap className="w-5 h-5" />
                </div>
                <span>วิเคราะห์ผิว 8 มิติด้วย AI</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Shield className="w-5 h-5" />
                </div>
                <span>ปลอดภัย ได้มาตรฐาน PDPA</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span>AR จำลองผลลัพธ์แบบเรียลไทม์</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-gradient-to-br from-background to-muted/30">
        {/* Back to Home Button - Top Left */}
        <Link 
          href="/"
          className="fixed top-4 left-4 z-10 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent lg:text-white lg:hover:bg-white/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">กลับหน้าหลัก</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-4">
              {/* Mobile Logo */}
              <div className="flex items-center justify-center mb-4 lg:hidden">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    ClinicIQ
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-center mb-2">
                <motion.div 
                  className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogIn className="w-7 h-7 text-white" />
                </motion.div>
              </div>
              <CardTitle className="text-2xl font-bold text-center">
                ยินดีต้อนรับกลับ
              </CardTitle>
              <CardDescription className="text-center">
                เข้าสู่ระบบเพื่อใช้งานฟีเจอร์วิเคราะห์ผิวหน้า
              </CardDescription>
            </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  ลืมรหัสผ่าน?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              ระบบนี้เปิดให้เฉพาะผู้ใช้ที่ได้รับเชิญเท่านั้น{' '}
              <a 
                href="mailto:admin@beautyclinic.com?subject=ขอเข้าใช้งานระบบ" 
                className="text-primary hover:underline font-medium"
              >
                ติดต่อผู้ดูแลระบบ
              </a>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  หรือ
                </span>
              </div>
            </div>

            <Button 
              type="button"
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/')}
            >
              กลับหน้าหลัก
            </Button>

            {/* Demo accounts for testing (hidden by default; enable with NEXT_PUBLIC_SHOW_DEMO_LOGINS=true) */}
            {showDemo && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <div className="text-2xl">🧪</div>
                  <div className="flex-1">
                    <p className="text-blue-900 dark:text-blue-100 text-sm font-semibold mb-2">
                      Demo Accounts (Password: password123)
                    </p>
                    <div className="text-blue-800 dark:text-blue-200 space-y-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('admin@ai367bar.com')
                          setPassword('password123')
                        }}
                        className="w-full text-left font-mono bg-white dark:bg-blue-900 p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                      >
                        <div className="font-semibold text-orange-700 dark:text-orange-300">🔧 Super Admin</div>
                        <div>admin@ai367bar.com</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('clinic-owner@example.com')
                          setPassword('password123')
                        }}
                        className="w-full text-left font-mono bg-white dark:bg-blue-900 p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                      >
                        <div className="font-semibold text-blue-700 dark:text-blue-300">🏥 Clinic Owner</div>
                        <div>clinic-owner@example.com</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('sales@example.com')
                          setPassword('password123')
                        }}
                        className="w-full text-left font-mono bg-white dark:bg-blue-900 p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                      >
                        <div className="font-semibold text-green-700 dark:text-green-300">💼 Sales Staff</div>
                        <div>sales@example.com</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('customer@example.com')
                          setPassword('password123')
                        }}
                        className="w-full text-left font-mono bg-white dark:bg-blue-900 p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                      >
                        <div className="font-semibold text-purple-700 dark:text-purple-300">👤 Customer</div>
                        <div>customer@example.com</div>
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-blue-700 dark:text-blue-300 italic">
                      💡 คลิกเพื่อกรอกอัตโนมัติ (Demo presets only; no real accounts)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardFooter>
        </form>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
