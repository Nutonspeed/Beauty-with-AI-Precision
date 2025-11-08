'use client'

/**
 * Register Page - สมัครสมาชิกใหม่
 * รองรับ 3 roles: customer, sales_staff, clinic_owner
 */

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2, UserPlus, Check } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    role: "customer" as "customer" | "sales_staff" | "clinic_owner"
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()

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

  const passwordStrength = getPasswordStrength(formData.password)

  const validateForm = (): string | null => {
    // Email validation
    if (!formData.email) return "กรุณากรอกอีเมล"
    if (!formData.email.includes('@')) return "กรุณากรอกอีเมลที่ถูกต้อง"
    
    // Password validation
    if (!formData.password) return "กรุณากรอกรหัสผ่าน"
    if (formData.password.length < 8) return "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"
    if (formData.password !== formData.confirmPassword) return "รหัสผ่านไม่ตรงกัน"
    
    // Name validation
    if (!formData.fullName) return "กรุณากรอกชื่อ-นามสกุล"
    if (formData.fullName.length < 2) return "ชื่อ-นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร"
    
    // Phone validation (optional but must be valid if provided)
    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
      return "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก"
    }
    
    return null
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setLoading(true)

    // Validate form
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setLoading(false)
      return
    }

    try {
      // Call register API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phone || null,
          role: formData.role
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Success!
      setSuccess(true)
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)

    } catch (err: any) {
      if (err.message.includes('already registered')) {
        setError('อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น')
      } else if (err.message.includes('Invalid email')) {
        setError('รูปแบบอีเมลไม่ถูกต้อง')
      } else {
        setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
      }
      console.error('Registration error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-10">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            สมัครสมาชิก
          </CardTitle>
          <CardDescription className="text-center">
            สร้างบัญชีใหม่เพื่อเข้าใช้งานระบบ
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleRegister}>
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
                  สมัครสมาชิกสำเร็จ! กำลังนำคุณไปหน้าเข้าสู่ระบบ...
                </AlertDescription>
              </Alert>
            )}

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role">ประเภทบัญชี</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                disabled={loading || success}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="เลือกประเภทบัญชี" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">ลูกค้า (Customer)</SelectItem>
                  <SelectItem value="sales_staff">พนักงานขาย (Sales Staff)</SelectItem>
                  <SelectItem value="clinic_owner">เจ้าของคลินิก (Clinic Owner)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {formData.role === "customer" && "สำหรับผู้ใช้ทั่วไปที่ต้องการวิเคราะห์ผิว"}
                {formData.role === "sales_staff" && "สำหรับพนักงานขายที่ต้องการดูข้อมูลลูกค้า"}
                {formData.role === "clinic_owner" && "สำหรับเจ้าของคลินิกที่ต้องการจัดการระบบ"}
              </p>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">ชื่อ-นามสกุล</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="นาย ตัวอย่าง ทดสอบ"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                disabled={loading || success}
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={loading || success}
                autoComplete="email"
                required
              />
            </div>

            {/* Phone (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="phone">เบอร์โทรศัพท์ (ไม่บังคับ)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0812345678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                disabled={loading || success}
                maxLength={10}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={loading || success}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={loading || success}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
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
              <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  disabled={loading || success}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={loading || success}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <p className={`text-xs ${
                  formData.password === formData.confirmPassword
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}>
                  {formData.password === formData.confirmPassword
                    ? '✓ รหัสผ่านตรงกัน'
                    : '✗ รหัสผ่านไม่ตรงกัน'}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || success}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'กำลังสมัครสมาชิก...' : success ? 'สมัครสมาชิกสำเร็จ!' : 'สมัครสมาชิก'}
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              มีบัญชีอยู่แล้ว?{' '}
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

            <Button 
              type="button"
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/')}
              disabled={loading}
            >
              กลับหน้าหลัก
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
