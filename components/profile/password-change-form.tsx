"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createBrowserClient } from "@/lib/supabase/client"
import { AlertCircle, Check, Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useTranslations } from "next-intl"

export function PasswordChangeForm() {
  const t = useTranslations('profile.password')
  const commonT = useTranslations('common')
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
    if (password.length < 6) return { strength: 1, text: t('strength.weak'), color: "text-red-500" }
    if (password.length < 8) return { strength: 2, text: t('strength.medium'), color: "text-yellow-500" }

    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*]/.test(password)

    const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length

    if (score >= 3 && password.length >= 8) {
      return { strength: 4, text: t('strength.veryStrong'), color: "text-green-500" }
    } else if (score >= 2) {
      return { strength: 3, text: t('strength.strong'), color: "text-blue-500" }
    }

    return { strength: 2, text: t('strength.medium'), color: "text-yellow-500" }
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
        setError(t('errors.currentRequired'))
        setIsLoading(false)
        return
      }

      if (newPassword.length < 8) {
        setError(t('errors.tooShort'))
        setIsLoading(false)
        return
      }

      if (newPassword !== confirmPassword) {
        setError(t('errors.mismatch'))
        setIsLoading(false)
        return
      }

      if (currentPassword === newPassword) {
        setError(t('errors.sameAsOld'))
        setIsLoading(false)
        return
      }

      // Verify current password by trying to sign in
      const { data: user } = await supabase.auth.getUser()
      if (!user.user?.email) {
        setError(t('errors.userNotFound'))
        setIsLoading(false)
        return
      }

      // Try to sign in with current password to verify it
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.user.email,
        password: currentPassword,
      })

      if (verifyError) {
        setError(t('errors.incorrectCurrent'))
        setIsLoading(false)
        return
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) throw updateError

      setSuccess(true)
      toast.success(t('success.changeSuccess'))

      // Clear form
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      setError(err.message || t('errors.changeFailed'))
      toast.error(commonT('error'))
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
          <AlertDescription>{t('success.changeSuccess')}</AlertDescription>
        </Alert>
      )}

      {/* Current Password */}
      <div className="space-y-2">
        <Label htmlFor="currentPassword">
          {t('currentPasswordLabel')} <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="currentPassword"
            type={showCurrent ? "text" : "password"}
            placeholder={t('currentPasswordPlaceholder')}
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
          {t('newPasswordLabel')} <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showNew ? "text" : "password"}
            placeholder={t('newPasswordPlaceholder')}
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
            <p className={`text-xs ${passwordStrength.color}`}>{t('strength.label')}: {passwordStrength.text}</p>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">
          {t('confirmPasswordLabel')} <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            placeholder={t('confirmPasswordPlaceholder')}
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
            {newPassword === confirmPassword ? `✓ ${t('match.success')}` : `✗ ${t('match.error')}`}
          </p>
        )}
      </div>

      {/* Security Tips */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <p className="mb-2 text-sm font-medium">💡 {t('tips.title')}:</p>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>• {t('tips.mixed')}</li>
          <li>• {t('tips.special')}</li>
          <li>• {t('tips.length')}</li>
          <li>• {t('tips.reuse')}</li>
        </ul>
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('actions.changing')}
          </>
        ) : (
          t('actions.change')
        )}
      </Button>
    </form>
  )
}
