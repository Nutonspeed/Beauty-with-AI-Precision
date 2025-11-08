"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createBrowserClient } from "@/lib/supabase/client"
import { AlertCircle, Check, Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function PasswordChangeForm() {
  const supabase = createBrowserClient()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Show/hide password
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Password strength
  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return { strength: 1, text: "อ่อนแอ", color: "text-red-500" }
    if (password.length < 8) return { strength: 2, text: "ปานกลาง", color: "text-yellow-500" }

    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*]/.test(password)

    const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length

    if (score >= 3 && password.length >= 8) {
      return { strength: 4, text: "แข็งแรงมาก", color: "text-green-500" }
    } else if (score >= 2) {
      return { strength: 3, text: "แข็งแรง", color: "text-blue-500" }
    }

    return { strength: 2, text: "ปานกลาง", color: "text-yellow-500" }
  }

  const passwordStrength = getPasswordStrength(newPassword)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Validate
      if (!currentPassword) {
        setError("กรุณากรอกรหัสผ่านปัจจุบัน")
        setIsLoading(false)
        return
      }

      if (newPassword.length < 8) {
        setError("รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร")
        setIsLoading(false)
        return
      }

      if (newPassword !== confirmPassword) {
        setError("รหัสผ่านใหม่ไม่ตรงกัน")
        setIsLoading(false)
        return
      }

      if (currentPassword === newPassword) {
        setError("รหัสผ่านใหม่ต้องไม่เหมือนรหัสผ่านเดิม")
        setIsLoading(false)
        return
      }

      // Verify current password by trying to sign in
      const { data: user } = await supabase.auth.getUser()
      if (!user.user?.email) {
        setError("ไม่พบข้อมูลผู้ใช้")
        setIsLoading(false)
        return
      }

      // Try to sign in with current password to verify it
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.user.email,
        password: currentPassword,
      })

      if (verifyError) {
        setError("รหัสผ่านปัจจุบันไม่ถูกต้อง")
        setIsLoading(false)
        return
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) throw updateError

      setSuccess(true)
      toast.success("เปลี่ยนรหัสผ่านสำเร็จ!")

      // Clear form
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน")
      toast.error("เกิดข้อผิดพลาด")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <Check className="h-4 w-4" />
          <AlertDescription>เปลี่ยนรหัสผ่านสำเร็จ!</AlertDescription>
        </Alert>
      )}

      {/* Current Password */}
      <div className="space-y-2">
        <Label htmlFor="currentPassword">
          Current Password / รหัสผ่านปัจจุบัน <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="currentPassword"
            type={showCurrent ? "text" : "password"}
            placeholder="กรอกรหัสผ่านปัจจุบัน"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* New Password */}
      <div className="space-y-2">
        <Label htmlFor="newPassword">
          New Password / รหัสผ่านใหม่ <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showNew ? "text" : "password"}
            placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* Password Strength Indicator */}
        {newPassword && (
          <div className="space-y-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    level <= passwordStrength.strength
                      ? passwordStrength.color.replace("text-", "bg-")
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                />
              ))}
            </div>
            <p className={`text-xs ${passwordStrength.color}`}>ความแข็งแรง: {passwordStrength.text}</p>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">
          Confirm New Password / ยืนยันรหัสผ่านใหม่ <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* Password Match Indicator */}
        {confirmPassword && (
          <p
            className={`text-xs ${newPassword === confirmPassword ? "text-green-500" : "text-red-500"}`}
          >
            {newPassword === confirmPassword ? "✓ รหัสผ่านตรงกัน" : "✗ รหัสผ่านไม่ตรงกัน"}
          </p>
        )}
      </div>

      {/* Security Tips */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <p className="mb-2 text-sm font-medium">💡 เคล็ดลับความปลอดภัย:</p>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>• ใช้อักษรตัวพิมพ์ใหญ่และเล็กผสมกัน</li>
          <li>• เพิ่มตัวเลขและอักขระพิเศษ (!@#$%^&*)</li>
          <li>• อย่างน้อย 8 ตัวอักษร (แนะนำ 12+)</li>
          <li>• อย่าใช้รหัสผ่านเดียวกันในหลายเว็บไซต์</li>
        </ul>
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            กำลังเปลี่ยนรหัสผ่าน...
          </>
        ) : (
          "Change Password / เปลี่ยนรหัสผ่าน"
        )}
      </Button>
    </form>
  )
}
