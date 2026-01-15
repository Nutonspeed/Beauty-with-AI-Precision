"use client"

import { useState, useEffect, useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createBrowserClient } from "@/lib/supabase/client"
import { Check, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface NotificationSettingsProps {
  userId: string
}

interface NotificationPreferences {
  email_bookings: boolean
  email_analyses: boolean
  email_promotions: boolean
  email_updates: boolean
  sms_reminders: boolean
  push_notifications: boolean
}

import { useTranslations } from "next-intl"

export function NotificationSettings({ userId }: NotificationSettingsProps) {
  const t = useTranslations('profile.notifications')
  const commonT = useTranslations('common')
  const supabase = createBrowserClient()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_bookings: true,
    email_analyses: true,
    email_promotions: false,
    email_updates: true,
    sms_reminders: true,
    push_notifications: false,
  })

  const loadPreferences = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("notification_settings")
        .eq("user_id", userId)
        .single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      if (data?.notification_settings) {
        setPreferences({ ...preferences, ...data.notification_settings })
      }
    } catch (err: any) {
      console.error("Error loading preferences:", err)
    } finally {
      setIsLoading(false)
    }
  }, [userId, preferences, supabase])

  // Load preferences
  useEffect(() => {
    loadPreferences()
  }, [userId, loadPreferences])

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
    setSuccess(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      // Upsert preferences
      const { error: upsertError } = await supabase.from("user_preferences").upsert(
        {
          user_id: userId,
          notification_settings: preferences,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      )

      if (upsertError) throw upsertError

      setSuccess(true)
      toast.success(t('successMessage'))
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
          <AlertDescription>{t('successMessage')}</AlertDescription>
        </Alert>
      )}

      {/* Email Notifications */}
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 font-medium">{t('emailTitle')}</h3>
          <p className="text-sm text-muted-foreground">{t('emailDesc')}</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-bookings">{t('emailBookings.label')}</Label>
              <p className="text-sm text-muted-foreground">{t('emailBookings.description')}</p>
            </div>
            <Switch
              id="email-bookings"
              checked={preferences.email_bookings}
              onCheckedChange={() => handleToggle("email_bookings")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-analyses">{t('emailAnalyses.label')}</Label>
              <p className="text-sm text-muted-foreground">{t('emailAnalyses.description')}</p>
            </div>
            <Switch
              id="email-analyses"
              checked={preferences.email_analyses}
              onCheckedChange={() => handleToggle("email_analyses")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-promotions">{t('emailPromotions.label')}</Label>
              <p className="text-sm text-muted-foreground">{t('emailPromotions.description')}</p>
            </div>
            <Switch
              id="email-promotions"
              checked={preferences.email_promotions}
              onCheckedChange={() => handleToggle("email_promotions")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-updates">{t('emailUpdates.label')}</Label>
              <p className="text-sm text-muted-foreground">{t('emailUpdates.description')}</p>
            </div>
            <Switch
              id="email-updates"
              checked={preferences.email_updates}
              onCheckedChange={() => handleToggle("email_updates")}
            />
          </div>
        </div>
      </div>

      {/* SMS Notifications */}
      <div className="space-y-4 border-t pt-6">
        <div>
          <h3 className="mb-2 font-medium">{t('smsTitle')}</h3>
          <p className="text-sm text-muted-foreground">{t('smsDesc')}</p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="sms-reminders">{t('smsReminders.label')}</Label>
            <p className="text-sm text-muted-foreground">{t('smsReminders.description')}</p>
          </div>
          <Switch
            id="sms-reminders"
            checked={preferences.sms_reminders}
            onCheckedChange={() => handleToggle("sms_reminders")}
          />
        </div>
      </div>

      {/* Push Notifications */}
      <div className="space-y-4 border-t pt-6">
        <div>
          <h3 className="mb-2 font-medium">{t('pushTitle')}</h3>
          <p className="text-sm text-muted-foreground">{t('pushDesc')}</p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="push-notifications">{t('pushNotifications.label')}</Label>
            <p className="text-sm text-muted-foreground">{t('pushNotifications.description')}</p>
          </div>
          <Switch
            id="push-notifications"
            checked={preferences.push_notifications}
            onCheckedChange={() => handleToggle("push_notifications")}
            disabled
          />
        </div>
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
