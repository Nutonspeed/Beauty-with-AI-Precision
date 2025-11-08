'use client'

/**
 * Forgot Password Page
 * ส่ง email reset password link ให้ user
 */

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, ArrowLeft, Check } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setLoading(true)

    // Validation
    if (!email) {
      setError('กรุณากรอกอีเมล')
      setLoading(false)
      return
    }

    if (!email.includes('@')) {
      setError('กรุณากรอกอีเมลที่ถูกต้อง')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      // Send password reset email
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (resetError) {
        console.error('[ForgotPassword] Error:', resetError)
        
        // Don't reveal if email exists or not (security best practice)
        // Always show success message
        setSuccess(true)
      } else {
        setSuccess(true)
      }

    } catch (err: any) {
      console.error('[ForgotPassword] Unexpected error:', err)
      // Still show success to prevent email enumeration
      setSuccess(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Mail className="w-6 h-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            ลืมรหัสผ่าน?
          </CardTitle>
          <CardDescription className="text-center">
            กรอกอีเมลของคุณ เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่
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
                  ✅ ส่งอีเมลเรียบร้อยแล้ว! กรุณาตรวจสอบกล่องจดหมายของคุณ
                  <br />
                  <span className="text-xs text-green-700 dark:text-green-300 mt-1 block">
                    (อาจอยู่ในโฟลเดอร์ Spam/Junk)
                  </span>
                </AlertDescription>
              </Alert>
            )}

            {!success && (
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
                  autoFocus
                  required
                />
                <p className="text-xs text-muted-foreground">
                  กรอกอีเมลที่คุณใช้สมัครสมาชิก
                </p>
              </div>
            )}

            {!success && (
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'กำลังส่งอีเมล...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
              </Button>
            )}

            {success && (
              <div className="space-y-3">
                <Button 
                  type="button"
                  className="w-full" 
                  onClick={() => router.push('/auth/login')}
                >
                  กลับไปหน้าเข้าสู่ระบบ
                </Button>
                
                <Button 
                  type="button"
                  variant="outline"
                  className="w-full" 
                  onClick={() => {
                    setSuccess(false)
                    setEmail("")
                  }}
                >
                  ส่งอีเมลอีกครั้ง
                </Button>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            {!success && (
              <>
                <div className="text-sm text-center text-muted-foreground">
                  จำรหัสผ่านได้แล้ว?{' '}
                  <Link 
                    href="/auth/login" 
                    className="text-primary hover:underline font-medium"
                  >
                    เข้าสู่ระบบ
                  </Link>
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

                <Link href="/auth/login" className="w-full">
                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-full"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    กลับหน้าเข้าสู่ระบบ
                  </Button>
                </Link>
              </>
            )}

            {/* Help Section */}
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <div className="text-xl">💡</div>
                <div className="flex-1 text-xs text-blue-900 dark:text-blue-100">
                  <strong>ไม่ได้รับอีเมล?</strong>
                  <ul className="mt-2 space-y-1 text-blue-800 dark:text-blue-200">
                    <li>• ตรวจสอบโฟลเดอร์ Spam/Junk</li>
                    <li>• ตรวจสอบว่าอีเมลถูกต้องหรือไม่</li>
                    <li>• รอสัก 5-10 นาที</li>
                    <li>• ลองส่งอีเมลอีกครั้ง</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
