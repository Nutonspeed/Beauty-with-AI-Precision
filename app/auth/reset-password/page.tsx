'use client'

/**
 * Reset Password Page
 * ตั้งรหัสผ่านใหม่หลังจากคลิกลิงก์จากอีเมล
 */

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2, Lock, Check, AlertCircle } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Suspense } from "react"

function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validToken, setValidToken] = useState(false)
  const [checkingToken, setCheckingToken] = useState(true)
  
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check if we have a valid reset token
  useEffect(() => {
    const checkToken = async () => {
      const supabase = createClient()
      
      // Check if user came from reset link
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setValidToken(true)
      } else {
        // Check URL hash for token (Supabase sends token in URL hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const type = hashParams.get('type')
        
        if (accessToken && type === 'recovery') {
          setValidToken(true)
        } else {
          setValidToken(false)
        }
      }
      
      setCheckingToken(false)
    }

    checkToken()
  }, [])

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, text: "", color: "" }
    if (password.length < 6) return { strength: 1, text: "อ่อนแอ", color: "text-red-500" }
    if (password.length < 8) return { strength: 2, text: "ปานกลาง", color: "text-yellow-500" }
    
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[!@#$%^&*]/.test(password)
    
    const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length
    
    if (score >= 3 && password.length >= 8) {
      return { strength: 4, text: "แข็งแรงมาก", color: "text-green-500" }
    } else if (score >= 2) {
      return { strength: 3, text: "แข็งแรง", color: "text-blue-500" }
    }
    
    return { strength: 2, text: "ปานกลาง", color: "text-yellow-500" }
  }

  const passwordStrength = getPasswordStrength(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setLoading(true)

    // Validation
    if (!password) {
      setError('กรุณากรอกรหัสผ่านใหม่')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) {
        console.error('[ResetPassword] Error:', updateError)
        setError(updateError.message || 'เกิดข้อผิดพลาดในการตั้งรหัสผ่านใหม่')
        setLoading(false)
        return
      }

      console.log('[ResetPassword] ✅ Password updated successfully')
      setSuccess(true)

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)

    } catch (err: any) {
      console.error('[ResetPassword] Unexpected error:', err)
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking token
  if (checkingToken) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">กำลังตรวจสอบลิงก์...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error if invalid token
  if (!validToken) {
    return (
      <div className="container flex items-center justify-center min-h-screen py-10">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-950">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              ลิงก์ไม่ถูกต้อง
            </CardTitle>
            <CardDescription className="text-center">
              ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                กรุณาขอลิงก์รีเซ็ตรหัสผ่านใหม่
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Link href="/auth/forgot-password" className="w-full">
              <Button className="w-full">
                ขอลิงก์รีเซ็ตรหัสผ่านใหม่
              </Button>
            </Link>
            <Link href="/auth/login" className="w-full">
              <Button variant="outline" className="w-full">
                กลับหน้าเข้าสู่ระบบ
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Lock className="w-6 h-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            ตั้งรหัสผ่านใหม่
          </CardTitle>
          <CardDescription className="text-center">
            กรอกรหัสผ่านใหม่ของคุณ
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 text-green-900 border-green-200 dark:bg-green-950 dark:text-green-100">
                <Check className="h-4 w-4" />
                <AlertDescription>
                  ✅ เปลี่ยนรหัสผ่านสำเร็จ! กำลังนำคุณไปหน้าเข้าสู่ระบบ...
                </AlertDescription>
              </Alert>
            )}

            {!success && (
              <>
                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">รหัสผ่านใหม่</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="อย่างน้อย 8 ตัวอักษร"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      autoComplete="new-password"
                      autoFocus
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
                  
                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              level <= passwordStrength.strength
                                ? passwordStrength.color.replace('text-', 'bg-')
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs ${passwordStrength.color}`}>
                        ความแข็งแรง: {passwordStrength.text}
                      </p>
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    แนะนำ: ใช้ตัวพิมพ์ใหญ่, ตัวพิมพ์เล็ก, ตัวเลข และอักขระพิเศษ
                  </p>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="กรอกรหัสผ่านอีกครั้ง"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={loading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  
                  {/* Password Match Indicator */}
                  {confirmPassword && (
                    <p className={`text-xs ${
                      password === confirmPassword
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}>
                      {password === confirmPassword
                        ? '✓ รหัสผ่านตรงกัน'
                        : '✗ รหัสผ่านไม่ตรงกัน'}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
                </Button>
              </>
            )}
          </CardContent>

          {!success && (
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center text-muted-foreground">
                จำรหัสผ่านได้แล้ว?{' '}
                <Link 
                  href="/auth/login" 
                  className="text-primary hover:underline font-medium"
                >
                  เข้าสู่ระบบ
                </Link>
              </div>
            </CardFooter>
          )}
        </form>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">กำลังโหลด...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
