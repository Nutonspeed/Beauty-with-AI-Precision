"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createBrowserClient } from "@/lib/supabase/client"
import { AlertCircle, Check, Loader2, Upload } from "lucide-react"
import { toast } from "sonner"

interface PersonalInfoFormProps {
  user: any
  profile: any
}

import { useTranslations } from "next-intl"

export function PersonalInfoForm({ user, profile }: PersonalInfoFormProps) {
  const t = useTranslations('profile.personal')
  const commonT = useTranslations('common')
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [phone, setPhone] = useState(profile?.phone || "")
  const [address, setAddress] = useState(profile?.address || "")
  const [bio, setBio] = useState(profile?.bio || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Lazily create Supabase client in browser-only context
      const supabase = createBrowserClient()

      // Validate
      if (!fullName || fullName.length < 2) {
        setError(t('errors.nameTooShort'))
        setIsLoading(false)
        return
      }

      if (phone && !/^\d{10}$/.test(phone)) {
        setError(t('errors.invalidPhone'))
        setIsLoading(false)
        return
      }

      // Update profile using internal API (service role bypass)
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error(t('errors.noSession'))
      }

      const response = await fetch("/api/user-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          updates: {
            full_name: fullName,
            phone: phone || null,
            updated_at: new Date().toISOString(),
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update profile")
      }

      await response.json()

      setSuccess(true)
      toast.success(t('success.saveSuccess'))

      // Refresh the page to show updated data
      setTimeout(() => {
        router.refresh()
      }, 1000)
    } catch (err: any) {
      setError(err.message || t('errors.saveFailed'))
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
          <AlertDescription>{t('success.saveSuccess')}</AlertDescription>
        </Alert>
      )}

      {/* Profile Picture */}
      <div className="space-y-2">
        <Label>{t('profilePictureLabel')}</Label>
        <div className="flex items-center gap-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
            {fullName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
          </div>
          <Button type="button" variant="outline" disabled>
            <Upload className="mr-2 h-4 w-4" />
            {t('uploadPhotoComingSoon')}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {t('uploadPhotoHint')}
        </p>
      </div>

      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="fullName">
          {t('fullNameLabel')} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="fullName"
          type="text"
          placeholder={t('fullNamePlaceholder')}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          minLength={2}
        />
      </div>

      {/* Email (Read-only) */}
      <div className="space-y-2">
        <Label htmlFor="email">{t('emailLabel')}</Label>
        <Input id="email" type="email" value={user.email} disabled className="bg-muted" />
        <p className="text-xs text-muted-foreground">
          {t('emailHint')}
        </p>
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">{t('phoneLabel')}</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="0812345678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={10}
        />
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">{t('addressLabel')}</Label>
        <Textarea
          id="address"
          placeholder={t('addressPlaceholder')}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={3}
        />
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio">{t('bioLabel')}</Label>
        <Textarea
          id="bio"
          placeholder={t('bioPlaceholder')}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground">{t('bioHint')}</p>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('actions.saving')}
            </>
          ) : (
            t('actions.save')
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setFullName(profile?.full_name || "")
            setPhone(profile?.phone || "")
            setAddress(profile?.address || "")
            setBio(profile?.bio || "")
            setError(null)
            setSuccess(false)
          }}
          disabled={isLoading}
        >
          {t('actions.reset')}
        </Button>
      </div>
    </form>
  )
}
