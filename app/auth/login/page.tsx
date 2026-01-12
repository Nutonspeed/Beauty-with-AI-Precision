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
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const showDemo = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SHOW_DEMO_LOGINS === 'true'
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  
  const { signIn, user } = useAuth()
  const router = useRouter()

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user) {
      console.log('[LoginPage] User detected, redirecting based on role:', user.role)
      const normalized = normalizeRole(user.role as any)
      const redirectPath = getDefaultLandingPage(normalized as any)
      console.log('[LoginPage] Redirecting to:', redirectPath)
      router.push(redirectPath)
    }
  }, [user, router])

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
      
      const { error } = await signIn(email, password)
      
      if (error) {
        console.error('[LoginPage] ❌ Login error:', error)
        if (error.message.includes('Invalid login credentials')) {
          setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
        } else if (error.message.includes('Email not confirmed')) {
          setError('กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ')
        } else {
          setError(error.message)
        }
        setLoading(false)
        return
      }

      console.log('[LoginPage] ✅ Login successful! Waiting for auth context...')
      
      // Keep loading = true while waiting for auth context to update
      // useEffect will detect user change and redirect based on role
      // Don't setLoading(false) here - let redirect happen with spinner visible
    } catch (err) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
      console.error('[LoginPage] ❌ Unexpected error:', err)
      setLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <LogIn className="w-6 h-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            เข้าสู่ระบบ
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
                href="mailto:admin@beautycenter.com?subject=ขอเข้าใช้งานระบบ" 
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
                          setEmail('center-owner@example.com')
                          setPassword('password123')
                        }}
                        className="w-full text-left font-mono bg-white dark:bg-blue-900 p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                      >
                        <div className="font-semibold text-blue-700 dark:text-blue-300">🏥 Center Owner</div>
                        <div>center-owner@example.com</div>
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
    </div>
  )
}
