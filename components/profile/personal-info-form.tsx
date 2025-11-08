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

export function PersonalInfoForm({ user, profile }: PersonalInfoFormProps) {
  const router = useRouter()
  const supabase = createBrowserClient()

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
      // Validate
      if (!fullName || fullName.length < 2) {
        setError("กรุณากรอกชื่อ-นามสกุล (อย่างน้อย 2 ตัวอักษร)")
        setIsLoading(false)
        return
      }

      if (phone && !/^\d{10}$/.test(phone)) {
        setError("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก)")
        setIsLoading(false)
        return
      }

      // Update profile
      const { error: updateError } = await supabase
        .from("users")
        .update({
          full_name: fullName,
          phone: phone || null,
          address: address || null,
          bio: bio || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (updateError) throw updateError

      setSuccess(true)
      toast.success("อัปเดตข้อมูลสำเร็จ!")

      // Refresh the page to show updated data
      setTimeout(() => {
        router.refresh()
      }, 1000)
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล")
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
          <AlertDescription>อัปเดตข้อมูลสำเร็จ!</AlertDescription>
        </Alert>
      )}

      {/* Profile Picture */}
      <div className="space-y-2">
        <Label>Profile Picture / รูปโปรไฟล์</Label>
        <div className="flex items-center gap-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
            {fullName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
          </div>
          <Button type="button" variant="outline" disabled>
            <Upload className="mr-2 h-4 w-4" />
            Upload Photo (Coming Soon)
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          รองรับไฟล์ JPG, PNG (สูงสุด 2MB) - ฟีเจอร์นี้จะเปิดใช้งานเร็วๆ นี้
        </p>
      </div>

      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="fullName">
          Full Name / ชื่อ-นามสกุล <span className="text-red-500">*</span>
        </Label>
        <Input
          id="fullName"
          type="text"
          placeholder="กรอกชื่อ-นามสกุล"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          minLength={2}
        />
      </div>

      {/* Email (Read-only) */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={user.email} disabled className="bg-muted" />
        <p className="text-xs text-muted-foreground">
          อีเมลไม่สามารถเปลี่ยนแปลงได้ ติดต่อแอดมินหากต้องการเปลี่ยน
        </p>
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number / เบอร์โทรศัพท์</Label>
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
        <Label htmlFor="address">Address / ที่อยู่</Label>
        <Textarea
          id="address"
          placeholder="กรอกที่อยู่"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={3}
        />
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio">Bio / เกี่ยวกับคุณ</Label>
        <Textarea
          id="bio"
          placeholder="เล่าเกี่ยวกับตัวคุณ..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground">สูงสุด 500 ตัวอักษร</p>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              กำลังบันทึก...
            </>
          ) : (
            "Save Changes / บันทึกการเปลี่ยนแปลง"
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
          Reset
        </Button>
      </div>
    </form>
  )
}
