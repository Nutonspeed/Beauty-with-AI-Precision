"use client"

import { useState, useEffect } from "react"
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

export function NotificationSettings({ userId }: NotificationSettingsProps) {
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

  // Load preferences
  useEffect(() => {
    loadPreferences()
  }, [userId])

  const loadPreferences = async () => {
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
  }

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
      toast.success("บันทึกการตั้งค่าสำเร็จ!")
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการบันทึก")
      toast.error("เกิดข้อผิดพลาด")
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
          <AlertDescription>บันทึกการตั้งค่าสำเร็จ!</AlertDescription>
        </Alert>
      )}

      {/* Email Notifications */}
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 font-medium">Email Notifications / การแจ้งเตือนทางอีเมล</h3>
          <p className="text-sm text-muted-foreground">รับการแจ้งเตือนผ่านอีเมล</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-bookings">Booking Confirmations / ยืนยันการจอง</Label>
              <p className="text-sm text-muted-foreground">แจ้งเตือนเมื่อมีการจอง/เปลี่ยนแปลง/ยกเลิก</p>
            </div>
            <Switch
              id="email-bookings"
              checked={preferences.email_bookings}
              onCheckedChange={() => handleToggle("email_bookings")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-analyses">Analysis Results / ผลการวิเคราะห์</Label>
              <p className="text-sm text-muted-foreground">แจ้งเตือนเมื่อผลการวิเคราะห์ผิวพร้อม</p>
            </div>
            <Switch
              id="email-analyses"
              checked={preferences.email_analyses}
              onCheckedChange={() => handleToggle("email_analyses")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-promotions">Promotions & Offers / โปรโมชั่น</Label>
              <p className="text-sm text-muted-foreground">รับข้อเสนอพิเศษและโปรโมชั่น</p>
            </div>
            <Switch
              id="email-promotions"
              checked={preferences.email_promotions}
              onCheckedChange={() => handleToggle("email_promotions")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-updates">Product Updates / อัปเดตผลิตภัณฑ์</Label>
              <p className="text-sm text-muted-foreground">ข่าวสารและอัปเดตจากระบบ</p>
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
          <h3 className="mb-2 font-medium">SMS Notifications / การแจ้งเตือนทาง SMS</h3>
          <p className="text-sm text-muted-foreground">รับการแจ้งเตือนผ่าน SMS</p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="sms-reminders">Appointment Reminders / เตือนการนัดหมาย</Label>
            <p className="text-sm text-muted-foreground">แจ้งเตือนก่อนนัดหมาย 24 ชั่วโมง</p>
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
          <h3 className="mb-2 font-medium">Push Notifications / การแจ้งเตือนบนอุปกรณ์</h3>
          <p className="text-sm text-muted-foreground">รับการแจ้งเตือนแบบ Push (Coming Soon)</p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="push-notifications">Enable Push Notifications</Label>
            <p className="text-sm text-muted-foreground">ฟีเจอร์นี้จะเปิดใช้งานเร็วๆ นี้</p>
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
              กำลังบันทึก...
            </>
          ) : (
            "Save Preferences / บันทึกการตั้งค่า"
          )}
        </Button>
      </div>
    </div>
  )
}
