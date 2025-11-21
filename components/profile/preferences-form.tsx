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

export function PreferencesForm({ userId }: PreferencesFormProps) {
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
      toast.success("บันทึกการตั้งค่าสำเร็จ!")

      // Reload page to apply theme changes
      setTimeout(() => {
        window.location.reload()
      }, 1000)
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
          <AlertDescription>บันทึกการตั้งค่าสำเร็จ! กำลังรีโหลดหน้า...</AlertDescription>
        </Alert>
      )}

      {/* Language */}
      <div className="space-y-2">
        <Label htmlFor="language">Language / ภาษา</Label>
        <Select
          value={preferences.language}
          onValueChange={(value) => setPreferences({ ...preferences, language: value })}
        >
          <SelectTrigger id="language">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="th">🇹🇭 ไทย (Thai)</SelectItem>
            <SelectItem value="en">🇬🇧 English</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">เลือกภาษาที่ต้องการใช้ในระบบ</p>
      </div>

      {/* Theme */}
      <div className="space-y-2">
        <Label htmlFor="theme">Theme / ธีม</Label>
        <Select
          value={preferences.theme}
          onValueChange={(value) => setPreferences({ ...preferences, theme: value })}
        >
          <SelectTrigger id="theme">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">☀️ Light / สว่าง</SelectItem>
            <SelectItem value="dark">🌙 Dark / มืด</SelectItem>
            <SelectItem value="system">💻 System / ตามระบบ</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">เลือกธีมการแสดงผล</p>
      </div>

      {/* Timezone */}
      <div className="space-y-2">
        <Label htmlFor="timezone">Timezone / เขตเวลา</Label>
        <Select
          value={preferences.timezone}
          onValueChange={(value) => setPreferences({ ...preferences, timezone: value })}
        >
          <SelectTrigger id="timezone">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Asia/Bangkok">🇹🇭 Bangkok (GMT+7)</SelectItem>
            <SelectItem value="Asia/Singapore">🇸🇬 Singapore (GMT+8)</SelectItem>
            <SelectItem value="Asia/Hong_Kong">🇭🇰 Hong Kong (GMT+8)</SelectItem>
            <SelectItem value="Asia/Tokyo">🇯🇵 Tokyo (GMT+9)</SelectItem>
            <SelectItem value="Europe/London">🇬🇧 London (GMT+0)</SelectItem>
            <SelectItem value="America/New_York">🇺🇸 New York (GMT-5)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">เลือกเขตเวลาสำหรับการแสดงวันที่และเวลา</p>
      </div>

      {/* Date Format */}
      <div className="space-y-2">
        <Label htmlFor="dateFormat">Date Format / รูปแบบวันที่</Label>
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
        <p className="text-xs text-muted-foreground">เลือกรูปแบบการแสดงวันที่</p>
      </div>

      {/* Currency */}
      <div className="space-y-2">
        <Label htmlFor="currency">Currency / สกุลเงิน</Label>
        <Select
          value={preferences.currency}
          onValueChange={(value) => setPreferences({ ...preferences, currency: value })}
        >
          <SelectTrigger id="currency">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="THB">🇹🇭 THB (บาท)</SelectItem>
            <SelectItem value="USD">🇺🇸 USD ($)</SelectItem>
            <SelectItem value="EUR">🇪🇺 EUR (€)</SelectItem>
            <SelectItem value="GBP">🇬🇧 GBP (£)</SelectItem>
            <SelectItem value="SGD">🇸🇬 SGD (S$)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">เลือกสกุลเงินสำหรับการแสดงราคา</p>
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
