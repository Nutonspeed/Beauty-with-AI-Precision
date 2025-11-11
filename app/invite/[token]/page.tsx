'use client'

/**
 * Accept Invitation Page
 * /invite/[token]
 * 
 * Flow:
 * 1. Validate token on load
 * 2. Show invitation details
 * 3. Form: Full Name + Password
 * 4. Create account via API
 * 5. Auto-login and redirect
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Building2, UserCircle, CheckCircle2, XCircle } from 'lucide-react'

interface InvitationData {
  id: string
  email: string
  invited_role: string
  clinic_id: string | null
  clinic_name: string | null
  status: string
  is_valid: boolean
  error_message: string | null
}

// Role name mapping (Thai)
const roleNames: Record<string, string> = {
  clinic_owner: 'เจ้าของคลินิก',
  clinic_manager: 'ผู้จัดการคลินิก',
  clinic_staff: 'พนักงานคลินิก',
  sales_staff: 'พนักงานขาย',
  customer: 'ลูกค้า'
}

export default function AcceptInvitationPage({ params }: { params: { token: string } }) {
  const router = useRouter()
  const { token } = params

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  // Validate token on mount
  useEffect(() => {
    validateToken()
  }, [token])

  const validateToken = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/invitations/${token}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to validate invitation')
      }

      if (!data.success || !data.invitation.is_valid) {
        throw new Error(data.invitation.error_message || 'Invitation is not valid')
      }

      setInvitation(data.invitation)
    } catch (err: any) {
      console.error('Error validating token:', err)
      setError(err.message || 'Failed to validate invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    // Validate form
    if (!fullName.trim()) {
      setFormError('กรุณากรอกชื่อ-นามสกุล')
      return
    }

    if (password.length < 8) {
      setFormError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
      return
    }

    if (password !== confirmPassword) {
      setFormError('รหัสผ่านไม่ตรงกัน')
      return
    }

    try {
      setSubmitting(true)
      setFormError(null)

      const response = await fetch(`/api/invitations/${token}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: fullName,
          password: password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account')
      }

      // Success! Redirect based on role
      const role = data.user.role
      
      // Show success message briefly
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Redirect to appropriate page
      if (role === 'super_admin') {
        router.push('/super-admin')
      } else if (role === 'clinic_owner' || role === 'clinic_manager') {
        router.push('/admin')
      } else if (role === 'sales_staff') {
        router.push('/booking')
      } else if (role === 'customer') {
        router.push('/booking')
      } else {
        router.push('/')
      }

      // Force reload to update session
      router.refresh()

    } catch (err: any) {
      console.error('Error accepting invitation:', err)
      setFormError(err.message || 'เกิดข้อผิดพลาดในการสร้างบัญชี')
    } finally {
      setSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">กำลังตรวจสอบคำเชิญ...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">
              คำเชิญไม่ถูกต้อง
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Invalid Invitation
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert className="bg-red-50 border-red-200">
              <AlertDescription className="text-red-900">
                {error || 'ไม่พบคำเชิญหรือคำเชิญหมดอายุแล้ว'}
              </AlertDescription>
            </Alert>

            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>สาเหตุที่เป็นไปได้:</strong></p>
              <ul className="list-disc list-inside pl-2 space-y-1">
                <li>ลิงก์คำเชิญหมดอายุ (7 วัน)</li>
                <li>คำเชิญถูกยกเลิกแล้ว</li>
                <li>บัญชีถูกสร้างไปแล้ว</li>
                <li>ลิงก์ไม่ถูกต้อง</li>
              </ul>
            </div>

            <Button 
              className="w-full"
              onClick={() => router.push('/auth/login')}
            >
              กลับไปหน้าเข้าสู่ระบบ
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success - Show form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            ยินดีต้อนรับ!
          </CardTitle>
          <CardDescription className="text-base mt-2">
            สร้างบัญชีของคุณ
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Invitation Details */}
          <Alert className="bg-blue-50 border-blue-200">
            <Mail className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              <div className="space-y-2">
                <div>
                  <strong className="block text-sm">อีเมล:</strong>
                  <p className="text-sm">{invitation.email}</p>
                </div>
                <div>
                  <strong className="block text-sm">บทบาท:</strong>
                  <p className="text-sm">{roleNames[invitation.invited_role] || invitation.invited_role}</p>
                </div>
                {invitation.clinic_name && (
                  <div>
                    <strong className="block text-sm">คลินิก:</strong>
                    <p className="text-sm">{invitation.clinic_name}</p>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-900">
                  {formError}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">
                ชื่อ-นามสกุล <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="กรอกชื่อ-นามสกุล"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                รหัสผ่าน <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="อย่างน้อย 8 ตัวอักษร"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                disabled={submitting}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังสร้างบัญชี...
                </>
              ) : (
                'สร้างบัญชีและเข้าสู่ระบบ'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500">
            <p>
              เมื่อสร้างบัญชี คุณจะถูกนำเข้าสู่ระบบโดยอัตโนมัติ
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
