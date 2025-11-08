"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Save, User, Bell, Palette } from "lucide-react"
import type { UserProfileData, UpdateProfileRequest } from "@/types/api"

export function UserProfileForm() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfileData | null>(null)
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
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/profile')
      return
    }

    if (status === 'authenticated') {
      loadProfile()
    }
  }, [status, router])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/user/profile')
      if (!response.ok) {
        throw new Error('Failed to load profile')
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
      setError(err instanceof Error ? err.message : 'Failed to load profile')
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
        throw new Error('Failed to update profile')
      }

      const data = await response.json()
      if (data.success) {
        setProfile(data.data)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      console.error('Failed to save profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to save profile')
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

  if (status === 'loading' || isLoading) {
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
            <p className="text-sm text-green-700">Profile updated successfully!</p>
          </CardContent>
        </Card>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>Basic Information / ข้อมูลพื้นฐาน</CardTitle>
          </div>
          <CardDescription>
            Your personal skin profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skinType">Skin Type / ประเภทผิว</Label>
            <Select value={skinType} onValueChange={setSkinType}>
              <SelectTrigger id="skinType">
                <SelectValue placeholder="Select skin type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oily">Oily / มัน</SelectItem>
                <SelectItem value="dry">Dry / แห้ง</SelectItem>
                <SelectItem value="combination">Combination / ผสม</SelectItem>
                <SelectItem value="normal">Normal / ปกติ</SelectItem>
                <SelectItem value="sensitive">Sensitive / บอบบาง</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Primary Concerns / ปัญหาหลัก</Label>
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
                    {getConcernLabel(concern)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies / การแพ้</Label>
            <Input
              id="allergies"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="List any allergies or sensitivities..."
            />
            <p className="text-xs text-muted-foreground">
              Optional - helps us provide better recommendations
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle>Preferences / การตั้งค่า</CardTitle>
          </div>
          <CardDescription>
            Customize your experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">Language / ภาษา</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="th">ไทย (Thai)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme">Theme / ธีม</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light / สว่าง</SelectItem>
                <SelectItem value="dark">Dark / มืด</SelectItem>
                <SelectItem value="system">System / ระบบ</SelectItem>
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
            <CardTitle>Notifications / การแจ้งเตือน</CardTitle>
          </div>
          <CardDescription>
            Manage how you receive updates
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
              Receive email notifications about analysis results and recommendations
              <br />
              <span className="text-xs text-muted-foreground">
                รับการแจ้งเตือนทางอีเมลเกี่ยวกับผลการวิเคราะห์และคำแนะนำ
              </span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.push('/analysis')}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Profile
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// Helper function
function getConcernLabel(type: string): string {
  const labels: Record<string, string> = {
    wrinkle: 'Wrinkles / ริ้วรอย',
    pigmentation: 'Dark Spots / จุดด่างดำ',
    pore: 'Pores / รูขุมขน',
    redness: 'Redness / ผิวแดง',
    acne: 'Acne / สิว',
    dark_circle: 'Dark Circles / ใต้ตาคล้ำ',
  }
  return labels[type] || type
}
