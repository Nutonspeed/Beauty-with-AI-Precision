"use client"

/**
 * Privacy Settings Page
 * GDPR-compliant privacy controls for customers
 */

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Shield, 
  Mail, 
  Download, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  Lock,
  Database,
  FileText,
  Clock
} from "lucide-react"
import type { EmailPreferences, PrivacySettings } from "@/types/privacy"

export default function PrivacySettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [emailPreferences, setEmailPreferences] = useState<EmailPreferences>({
    weeklyDigest: true,
    progressReports: true,
    goalAchievements: true,
    reEngagement: false,
    bookingReminders: true,
    analysisComplete: true,
    marketingEmails: false,
    productUpdates: false,
  })

  const [privacySettings, setPrivacySettings] = useState({
    shareDataForResearch: false,
    shareAnonymousData: true,
    allowThirdPartyAnalytics: true,
  })

  const [dataExportStatus, setDataExportStatus] = useState<{
    requested: boolean;
    status: string | null;
    downloadUrl: string | null;
  }>({
    requested: false,
    status: null,
    downloadUrl: null,
  })

  const [deletionRequest, setDeletionRequest] = useState<{
    requested: boolean;
    scheduledFor: Date | null;
  }>({
    requested: false,
    scheduledFor: null,
  })

  useEffect(() => {
    loadPrivacySettings()
  }, [])

  const loadPrivacySettings = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/privacy/settings")
      
      if (!response.ok) {
        throw new Error("Failed to load privacy settings")
      }

      const data = await response.json()
      
      if (data.emailPreferences) {
        setEmailPreferences(data.emailPreferences)
      }
      
      if (data.privacySettings) {
        setPrivacySettings({
          shareDataForResearch: data.privacySettings.shareDataForResearch || false,
          shareAnonymousData: data.privacySettings.shareAnonymousData || true,
          allowThirdPartyAnalytics: data.privacySettings.allowThirdPartyAnalytics || true,
        })
      }

      if (data.dataExport) {
        setDataExportStatus(data.dataExport)
      }

      if (data.accountDeletion) {
        setDeletionRequest(data.accountDeletion)
      }
    } catch (err) {
      console.error("Error loading privacy settings:", err)
      setError("ไม่สามารถโหลดการตั้งค่าได้")
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      setError(null)
      setSaveSuccess(false)

      const response = await fetch("/api/privacy/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailPreferences,
          privacySettings,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error("Error saving settings:", err)
      setError("ไม่สามารถบันทึกการตั้งค่าได้")
    } finally {
      setSaving(false)
    }
  }

  const requestDataExport = async () => {
    try {
      setSaving(true)
      setError(null)

      const response = await fetch("/api/privacy/export-data", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to request data export")
      }

      const data = await response.json()
      setDataExportStatus({
        requested: true,
        status: data.status,
        downloadUrl: data.downloadUrl || null,
      })

      alert("คำขอส่งออกข้อมูลของคุณได้รับการบันทึกแล้ว คุณจะได้รับอีเมลเมื่อข้อมูลพร้อมดาวน์โหลด")
    } catch (err) {
      console.error("Error requesting data export:", err)
      setError("ไม่สามารถส่งคำขอส่งออกข้อมูลได้")
    } finally {
      setSaving(false)
    }
  }

  const requestAccountDeletion = async () => {
    const confirmed = confirm(
      "คุณแน่ใจหรือไม่ว่าต้องการลบบัญชี?\n\n" +
      "การลบบัญชีจะทำให้:\n" +
      "- ข้อมูลทั้งหมดของคุณถูกลบอย่างถาวร\n" +
      "- การวิเคราะห์และประวัติทั้งหมดจะหายไป\n" +
      "- คุณจะไม่สามารถเข้าถึงบัญชีนี้อีกต่อไป\n\n" +
      "การลบจะเกิดขึ้นหลังจาก 30 วัน คุณสามารถยกเลิกได้ภายในเวลาดังกล่าว"
    )

    if (!confirmed) return

    try {
      setSaving(true)
      setError(null)

      const response = await fetch("/api/privacy/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: "User requested account deletion",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to request account deletion")
      }

      const data = await response.json()
      setDeletionRequest({
        requested: true,
        scheduledFor: new Date(data.scheduledFor),
      })

      alert("คำขอลบบัญชีของคุณได้รับการบันทึกแล้ว บัญชีจะถูกลบหลังจาก 30 วัน")
    } catch (err) {
      console.error("Error requesting account deletion:", err)
      setError("ไม่สามารถส่งคำขอลบบัญชีได้")
    } finally {
      setSaving(false)
    }
  }

  const cancelAccountDeletion = async () => {
    try {
      setSaving(true)
      setError(null)

      const response = await fetch("/api/privacy/delete-account", {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to cancel account deletion")
      }

      setDeletionRequest({
        requested: false,
        scheduledFor: null,
      })

      alert("คำขอลบบัญชีถูกยกเลิกแล้ว")
    } catch (err) {
      console.error("Error cancelling account deletion:", err)
      setError("ไม่สามารถยกเลิกคำขอลบบัญชีได้")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container max-w-4xl py-10">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <Shield className="h-8 w-8 text-purple-600" />
          ความเป็นส่วนตัวและความปลอดภัย
        </h1>
        <p className="text-muted-foreground">
          จัดการการตั้งค่าความเป็นส่วนตัวและควบคุมข้อมูลของคุณ
        </p>
      </div>

      {/* Success/Error Messages */}
      {saveSuccess && (
        <Alert className="mb-6 border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            บันทึกการตั้งค่าเรียบร้อยแล้ว
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="mb-6 border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Account Deletion Warning */}
      {deletionRequest.requested && deletionRequest.scheduledFor && (
        <Alert className="mb-6 border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>คำเตือน:</strong> บัญชีของคุณจะถูกลบในวันที่{" "}
            {new Date(deletionRequest.scheduledFor).toLocaleDateString("th-TH")}
            <Button
              variant="outline"
              size="sm"
              onClick={cancelAccountDeletion}
              disabled={saving}
              className="ml-4"
            >
              ยกเลิกคำขอ
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Email Preferences */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            การตั้งค่าอีเมล
          </CardTitle>
          <CardDescription>
            เลือกอีเมลประเภทที่คุณต้องการรับ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>สรุปความคืบหน้าประจำสัปดาห์</Label>
              <p className="text-sm text-muted-foreground">
                รับสรุปผลการดูแลผิวทุกวันจันทร์
              </p>
            </div>
            <Switch
              checked={emailPreferences.weeklyDigest}
              onCheckedChange={(checked) =>
                setEmailPreferences({ ...emailPreferences, weeklyDigest: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>รายงานความคืบหน้า</Label>
              <p className="text-sm text-muted-foreground">
                รับรายงานเปรียบเทียบทุก 2 สัปดาห์
              </p>
            </div>
            <Switch
              checked={emailPreferences.progressReports}
              onCheckedChange={(checked) =>
                setEmailPreferences({ ...emailPreferences, progressReports: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>การบรรลุเป้าหมาย</Label>
              <p className="text-sm text-muted-foreground">
                รับการแจ้งเตือนเมื่อคุณบรรลุเป้าหมาย
              </p>
            </div>
            <Switch
              checked={emailPreferences.goalAchievements}
              onCheckedChange={(checked) =>
                setEmailPreferences({ ...emailPreferences, goalAchievements: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>การเตือนการนัดหมาย</Label>
              <p className="text-sm text-muted-foreground">
                รับการแจ้งเตือนก่อนการนัดหมาย
              </p>
            </div>
            <Switch
              checked={emailPreferences.bookingReminders}
              onCheckedChange={(checked) =>
                setEmailPreferences({ ...emailPreferences, bookingReminders: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>การวิเคราะห์เสร็จสมบูรณ์</Label>
              <p className="text-sm text-muted-foreground">
                รับการแจ้งเตือนเมื่อการวิเคราะห์เสร็จสิ้น
              </p>
            </div>
            <Switch
              checked={emailPreferences.analysisComplete}
              onCheckedChange={(checked) =>
                setEmailPreferences({ ...emailPreferences, analysisComplete: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>อีเมลการตลาด</Label>
              <p className="text-sm text-muted-foreground">
                รับข้อเสนอพิเศษและโปรโมชั่น
              </p>
            </div>
            <Switch
              checked={emailPreferences.marketingEmails}
              onCheckedChange={(checked) =>
                setEmailPreferences({ ...emailPreferences, marketingEmails: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>อัปเดตผลิตภัณฑ์</Label>
              <p className="text-sm text-muted-foreground">
                รับข่าวสารฟีเจอร์ใหม่และการปรับปรุง
              </p>
            </div>
            <Switch
              checked={emailPreferences.productUpdates}
              onCheckedChange={(checked) =>
                setEmailPreferences({ ...emailPreferences, productUpdates: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>อีเมลกระตุ้นการใช้งาน</Label>
              <p className="text-sm text-muted-foreground">
                รับอีเมลเมื่อไม่ได้ใช้งานสักระยะ
              </p>
            </div>
            <Switch
              checked={emailPreferences.reEngagement}
              onCheckedChange={(checked) =>
                setEmailPreferences({ ...emailPreferences, reEngagement: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Sharing */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            การแชร์ข้อมูล
          </CardTitle>
          <CardDescription>
            ควบคุมวิธีการใช้ข้อมูลของคุณ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>แชร์ข้อมูลเพื่อการวิจัย</Label>
              <p className="text-sm text-muted-foreground">
                ช่วยปรับปรุง AI โดยแชร์ข้อมูลของคุณแบบไม่ระบุตัวตน
              </p>
            </div>
            <Switch
              checked={privacySettings.shareDataForResearch}
              onCheckedChange={(checked) =>
                setPrivacySettings({ ...privacySettings, shareDataForResearch: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>แชร์ข้อมูลแบบไม่ระบุตัวตน</Label>
              <p className="text-sm text-muted-foreground">
                แชร์สถิติการใช้งานเพื่อปรับปรุงบริการ
              </p>
            </div>
            <Switch
              checked={privacySettings.shareAnonymousData}
              onCheckedChange={(checked) =>
                setPrivacySettings({ ...privacySettings, shareAnonymousData: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>อนุญาตการวิเคราะห์จากบุคคลที่สาม</Label>
              <p className="text-sm text-muted-foreground">
                ใช้ Google Analytics และ Hotjar เพื่อปรับปรุงประสบการณ์
              </p>
            </div>
            <Switch
              checked={privacySettings.allowThirdPartyAnalytics}
              onCheckedChange={(checked) =>
                setPrivacySettings({ ...privacySettings, allowThirdPartyAnalytics: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            ส่งออกข้อมูล
          </CardTitle>
          <CardDescription>
            ดาวน์โหลดสำเนาข้อมูลทั้งหมดของคุณ (GDPR)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dataExportStatus.requested ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>สถานะ: {dataExportStatus.status || "กำลังดำเนินการ..."}</span>
              </div>
              {dataExportStatus.downloadUrl && (
                <Button asChild>
                  <a href={dataExportStatus.downloadUrl} download>
                    <Download className="h-4 w-4 mr-2" />
                    ดาวน์โหลดข้อมูล
                  </a>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                คุณสามารถขอสำเนาข้อมูลทั้งหมดของคุณได้ รวมถึง:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-2">
                <li>ข้อมูลส่วนตัวและโปรไฟล์</li>
                <li>ประวัติการวิเคราะห์ผิวทั้งหมด</li>
                <li>รูปภาพที่อัปโหลด</li>
                <li>การนัดหมายและประวัติการชำระเงิน</li>
                <li>ประวัติการตั้งค่าและการกระทำ</li>
              </ul>
              <Button onClick={requestDataExport} disabled={saving}>
                <Download className="h-4 w-4 mr-2" />
                ขอส่งออกข้อมูล
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Deletion */}
      <Card className="mb-6 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            ลบบัญชี
          </CardTitle>
          <CardDescription>
            ลบบัญชีและข้อมูลทั้งหมดของคุณอย่างถาวร
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deletionRequest.requested ? (
            <div className="space-y-4">
              <Alert className="border-red-500 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  บัญชีของคุณจะถูกลบในวันที่{" "}
                  {deletionRequest.scheduledFor
                    ? new Date(deletionRequest.scheduledFor).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "ไม่ทราบ"}
                </AlertDescription>
              </Alert>
              <Button
                variant="outline"
                onClick={cancelAccountDeletion}
                disabled={saving}
              >
                ยกเลิกคำขอลบบัญชี
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert className="border-yellow-500 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  การลบบัญชีจะทำให้ข้อมูลทั้งหมดของคุณถูกลบอย่างถาวร
                  และไม่สามารถกู้คืนได้
                </AlertDescription>
              </Alert>
              <p className="text-sm text-muted-foreground">
                หากคุณลบบัญชี:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-2">
                <li>ข้อมูลทั้งหมดจะถูกลบภายใน 30 วัน</li>
                <li>คุณจะไม่สามารถเข้าถึงบัญชีนี้อีกต่อไป</li>
                <li>การวิเคราะห์และรูปภาพทั้งหมดจะหายไป</li>
                <li>การนัดหมายที่กำลังดำเนินการจะถูกยกเลิก</li>
              </ul>
              <Button
                variant="destructive"
                onClick={requestAccountDeletion}
                disabled={saving}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                ขอลบบัญชี
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy Policy & Terms */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            นโยบายและข้อกำหนด
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="link" className="p-0 h-auto" asChild>
            <a href="/privacy" target="_blank">
              <Lock className="h-4 w-4 mr-2" />
              อ่านนโยบายความเป็นส่วนตัว
            </a>
          </Button>
          <br />
          <Button variant="link" className="p-0 h-auto" asChild>
            <a href="/terms-of-service" target="_blank">
              <FileText className="h-4 w-4 mr-2" />
              อ่านข้อกำหนดการให้บริการ
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={loadPrivacySettings} disabled={saving}>
          รีเซ็ต
        </Button>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
        </Button>
      </div>
    </div>
  )
}
