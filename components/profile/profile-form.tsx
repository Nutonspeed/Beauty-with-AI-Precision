"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth/context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Save, User, Bell, Palette } from "lucide-react"
import type { UserProfileData, UpdateProfileRequest } from "@/types/api"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { useTranslations } from "next-intl"

export function UserProfileForm() {
  const t = useTranslations('profile.form')
  const { user, loading } = useAuth()
  const router = useRouter()
  const lp = useLocalizePath()
  const [_profile, setProfile] = useState<UserProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [skinType, setSkinType] = useState<string>('')
  const [primaryConcerns, setPrimaryConcerns] = useState<string[]>([])
  const [allergies, setAllergies] = useState<string>('')
  const [language, setLanguage] = useState<string>('th')
  const [notifications, setNotifications] = useState<boolean>(true)
  const [theme, setTheme] = useState<string>('system')

  useEffect(() => {
    if (!loading && !user) {
      router.push(lp('/auth/login?callbackUrl=/profile'))
      return
    }

    if (!loading && user) {
      loadProfile()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, router])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/user/profile')
      if (!response.ok) {
        throw new Error(t('errors.loadFailed'))
      }

      const data = await response.json()
      if (data.success && data.profile) {
        const prof = data.profile
        setProfile(prof)
        setSkinType(prof.skinType || '')
        setPrimaryConcerns(prof.primaryConcerns || [])
        setAllergies(prof.allergies || '')
        setLanguage(prof.preferences?.language || 'th')
        setNotifications(prof.preferences?.notifications ?? true)
        setTheme(prof.preferences?.theme || 'system')
      }
    } catch (err) {
      console.error('Failed to load profile:', err)
      setError(err instanceof Error ? err.message : t('errors.loadFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)
      setSuccess(false)

      const updateData: UpdateProfileRequest = {
        skinType: skinType as 'oily' | 'dry' | 'combination' | 'normal' | 'sensitive' | undefined,
        primaryConcerns,
        allergies: allergies || undefined,
        preferences: {
          language,
          notifications,
          theme: theme as 'light' | 'dark' | 'system',
        },
      }

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error(t('errors.saveFailed'))
      }

      const data = await response.json()
      if (data.success) {
        setProfile(data.data)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      console.error('Failed to save profile:', err)
      setError(err instanceof Error ? err.message : t('errors.saveFailed'))
    } finally {
      setIsSaving(false)
    }
  }

  const toggleConcern = (concern: string) => {
    setPrimaryConcerns((prev) =>
      prev.includes(concern)
        ? prev.filter((c) => c !== concern)
        : [...prev, concern]
    )
  }

  if (loading || isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Card className="border-red-500/20 bg-red-500/10">
          <CardContent className="p-4">
            <p className="text-sm text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-500/20 bg-green-500/10">
          <CardContent className="p-4">
            <p className="text-sm text-green-700">{t('successMessage')}</p>
          </CardContent>
        </Card>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>{t('basicInfoTitle')}</CardTitle>
          </div>
          <CardDescription>
            {t('basicInfoDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skinType">{t('skinTypeLabel')}</Label>
            <Select value={skinType} onValueChange={setSkinType}>
              <SelectTrigger id="skinType">
                <SelectValue placeholder={t('skinTypePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oily">{t('skinTypes.oily')}</SelectItem>
                <SelectItem value="dry">{t('skinTypes.dry')}</SelectItem>
                <SelectItem value="combination">{t('skinTypes.combination')}</SelectItem>
                <SelectItem value="normal">{t('skinTypes.normal')}</SelectItem>
                <SelectItem value="sensitive">{t('skinTypes.sensitive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('primaryConcernsLabel')}</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {['wrinkle', 'pigmentation', 'pore', 'redness', 'acne', 'dark_circle'].map((concern) => (
                <div key={concern} className="flex items-center space-x-2">
                  <Checkbox
                    id={concern}
                    checked={primaryConcerns.includes(concern)}
                    onCheckedChange={() => toggleConcern(concern)}
                  />
                  <label
                    htmlFor={concern}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {getConcernLabel(concern, t)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies">{t('allergiesLabel')}</Label>
            <Input
              id="allergies"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder={t('allergiesPlaceholder')}
            />
            <p className="text-xs text-muted-foreground">
              {t('allergiesHint')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle>{t('preferencesTitle')}</CardTitle>
          </div>
          <CardDescription>
            {t('preferencesDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">{t('languageLabel')}</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{t('languages.en')}</SelectItem>
                <SelectItem value="th">{t('languages.th')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme">{t('themeLabel')}</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{t('themes.light')}</SelectItem>
                <SelectItem value="dark">{t('themes.dark')}</SelectItem>
                <SelectItem value="system">{t('themes.system')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>{t('notificationsTitle')}</CardTitle>
          </div>
          <CardDescription>
            {t('notificationsDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="notifications"
              checked={notifications}
              onCheckedChange={(checked) => setNotifications(checked as boolean)}
            />
            <label
              htmlFor="notifications"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t('notificationsLabel')}
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.push(lp('/analysis'))}>
          {t('cancel')}
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('saving')}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {t('save')}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// Helper function
function getConcernLabel(type: string, t: any): string {
  return t(`concerns.${type}`) || type
}
