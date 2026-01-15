"use client"

import { useState, useEffect, useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createBrowserClient } from "@/lib/supabase/client"
import { Check, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface PreferencesFormProps {
  userId: string
}

interface UserPreferences {
  language: string
  theme: string
  timezone: string
  date_format: string
  currency: string
}

import { useTranslations } from "next-intl"

export function PreferencesForm({ userId }: PreferencesFormProps) {
  const t = useTranslations('profile.preferences')
  const commonT = useTranslations('common')
  const supabase = createBrowserClient()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [preferences, setPreferences] = useState<UserPreferences>({
    language: "th",
    theme: "system",
    timezone: "Asia/Bangkok",
    date_format: "DD/MM/YYYY",
    currency: "THB",
  })

  const loadPreferences = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      if (data) {
        setPreferences({
          language: data.language || "th",
          theme: data.theme || "system",
          timezone: data.timezone || "Asia/Bangkok",
          date_format: data.date_format || "DD/MM/YYYY",
          currency: data.currency || "THB",
        })
      }
    } catch (err: any) {
      console.error("Error loading preferences:", err)
    } finally {
      setIsLoading(false)
    }
  }, [userId, supabase])

  // Load preferences
  useEffect(() => {
    loadPreferences()
  }, [userId, loadPreferences])

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      // Upsert preferences
      const { error: upsertError } = await supabase.from("user_preferences").upsert(
        {
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      )

      if (upsertError) throw upsertError

      setSuccess(true)
      toast.success(t('success.saveSuccess'))

      // Reload page to apply theme changes
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err: any) {
      setError(err.message || t('errors.saveFailed'))
      toast.error(commonT('error'))
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <Check className="h-4 w-4" />
          <AlertDescription>{t('success.reloadMessage')}</AlertDescription>
        </Alert>
      )}

      {/* Language */}
      <div className="space-y-2">
        <Label htmlFor="language">{t('language.label')}</Label>
        <Select
          value={preferences.language}
          onValueChange={(value) => setPreferences({ ...preferences, language: value })}
        >
          <SelectTrigger id="language">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="th">{t('language.options.th')}</SelectItem>
            <SelectItem value="en">{t('language.options.en')}</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">{t('language.description')}</p>
      </div>

      {/* Theme */}
      <div className="space-y-2">
        <Label htmlFor="theme">{t('theme.label')}</Label>
        <Select
          value={preferences.theme}
          onValueChange={(value) => setPreferences({ ...preferences, theme: value })}
        >
          <SelectTrigger id="theme">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">{t('theme.options.light')}</SelectItem>
            <SelectItem value="dark">{t('theme.options.dark')}</SelectItem>
            <SelectItem value="system">{t('theme.options.system')}</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">{t('theme.description')}</p>
      </div>

      {/* Timezone */}
      <div className="space-y-2">
        <Label htmlFor="timezone">{t('timezone.label')}</Label>
        <Select
          value={preferences.timezone}
          onValueChange={(value) => setPreferences({ ...preferences, timezone: value })}
        >
          <SelectTrigger id="timezone">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Asia/Bangkok">{t('timezone.options.bangkok')}</SelectItem>
            <SelectItem value="Asia/Singapore">{t('timezone.options.singapore')}</SelectItem>
            <SelectItem value="Asia/Hong_Kong">{t('timezone.options.hongkong')}</SelectItem>
            <SelectItem value="Asia/Tokyo">{t('timezone.options.tokyo')}</SelectItem>
            <SelectItem value="Europe/London">{t('timezone.options.london')}</SelectItem>
            <SelectItem value="America/New_York">{t('timezone.options.newyork')}</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">{t('timezone.description')}</p>
      </div>

      {/* Date Format */}
      <div className="space-y-2">
        <Label htmlFor="dateFormat">{t('dateFormat.label')}</Label>
        <Select
          value={preferences.date_format}
          onValueChange={(value) => setPreferences({ ...preferences, date_format: value })}
        >
          <SelectTrigger id="dateFormat">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</SelectItem>
            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</SelectItem>
            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">{t('dateFormat.description')}</p>
      </div>

      {/* Currency */}
      <div className="space-y-2">
        <Label htmlFor="currency">{t('currency.label')}</Label>
        <Select
          value={preferences.currency}
          onValueChange={(value) => setPreferences({ ...preferences, currency: value })}
        >
          <SelectTrigger id="currency">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="THB">{t('currency.options.thb')}</SelectItem>
            <SelectItem value="USD">{t('currency.options.usd')}</SelectItem>
            <SelectItem value="EUR">{t('currency.options.eur')}</SelectItem>
            <SelectItem value="GBP">{t('currency.options.gbp')}</SelectItem>
            <SelectItem value="SGD">{t('currency.options.sgd')}</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">{t('currency.description')}</p>
      </div>

      {/* Save Button */}
      <div className="border-t pt-6">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('actions.saving')}
            </>
          ) : (
            t('actions.save')
          )}
        </Button>
      </div>
    </div>
  )
}
