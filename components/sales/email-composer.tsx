"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Mail, Send, Eye, X, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  category: string
  variables: string[]
  is_active: boolean
  usage_count: number
}

interface EmailComposerProps {
  leadId: string
  leadName?: string
  leadEmail?: string
  onClose?: () => void
  onSent?: () => void
}

export function EmailComposer({
  leadId,
  leadName = "",
  leadEmail = "",
  onClose,
  onSent,
}: EmailComposerProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [preview, setPreview] = useState(false)

  // Form state
  const [recipientEmail, setRecipientEmail] = useState(leadEmail)
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [variables, setVariables] = useState<Record<string, string>>({})

  const supabase = createClient()

  // Load templates
  useEffect(() => {
    loadTemplates()
  }, [])

  // Load default variables
  useEffect(() => {
    setVariables({
      customer_name: leadName,
      clinic_name: "Beauty AI Clinic",
      sales_name: "ทีมงานขาย",
      appointment_date: new Date().toLocaleDateString("th-TH"),
      appointment_time: "14:00",
      service_name: "Skin Analysis",
      total_price: "15,000",
      valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("th-TH"),
    })
  }, [leadName])

  const loadTemplates = async () => {
    try {
      const response = await fetch("/api/sales/email-templates")
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error("Failed to load templates:", error)
      toast.error("ไม่สามารถโหลดเทมเพลตได้")
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setSelectedTemplate(template)
      setSubject(replaceVariables(template.subject))
      setContent(replaceVariables(template.content))
    }
  }

  const replaceVariables = (text: string): string => {
    let result = text
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, "g"), value)
    })
    return result
  }

  const handleSend = async () => {
    if (!recipientEmail || !subject || !content) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน")
      return
    }

    setSending(true)

    try {
      // Send email via Resend service
      const response = await fetch("/api/sales/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipientEmail,
          subject,
          html: content,
          template_id: selectedTemplate?.id || null,
          variables,
          lead_id: leadId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email")
      }

      toast.success("ส่งอีเมลสำเร็จ!", {
        description: `ส่งไปยัง ${recipientEmail}`,
      })

      onSent?.()
      onClose?.()
    } catch (error) {
      console.error("Failed to send email:", error)
      toast.error("ไม่สามารถส่งอีเมลได้", {
        description: error instanceof Error ? error.message : "กรุณาลองใหม่อีกครั้ง"
      })
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">ส่งอีเมลถึงลูกค้า</h3>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Template Selector */}
        <div className="space-y-2">
          <Label>เลือกเทมเพลต (ไม่บังคับ)</Label>
          <div className="flex gap-2">
            <Select onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="-- เลือกเทมเพลต --" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-2">
                      <span>{template.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTemplate && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setSelectedTemplate(null)
                  setSubject("")
                  setContent("")
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {selectedTemplate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>ใช้งาน {selectedTemplate.usage_count} ครั้ง</span>
            </div>
          )}
        </div>

        {/* Recipient */}
        <div className="space-y-2">
          <Label htmlFor="recipient">ผู้รับ *</Label>
          <Input
            id="recipient"
            type="email"
            placeholder="customer@email.com"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
          />
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <Label htmlFor="subject">หัวข้อ *</Label>
          <Input
            id="subject"
            placeholder="หัวข้ออีเมล"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Label htmlFor="content">เนื้อหา *</Label>
          <Textarea
            id="content"
            placeholder="เนื้อหาอีเมล..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="font-mono text-sm"
          />
          {selectedTemplate && selectedTemplate.variables.length > 0 && (
            <p className="text-xs text-muted-foreground">
              ตัวแปรที่ใช้ได้: {selectedTemplate.variables.map((v) => `{{${v}}}`).join(", ")}
            </p>
          )}
        </div>

        {/* Preview Mode */}
        {preview && (
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="mb-2 font-medium">ตัวอย่างอีเมล</h4>
            <div className="space-y-2 text-sm">
              <div>
                <strong>ถึง:</strong> {recipientEmail}
              </div>
              <div>
                <strong>หัวข้อ:</strong> {subject}
              </div>
              <div className="mt-4 rounded border bg-white p-4">
                <div dangerouslySetInnerHTML={{ __html: content }} />
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleSend}
            disabled={sending || !recipientEmail || !subject || !content}
            className="flex-1"
          >
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังส่ง...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                ส่งอีเมล
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setPreview(!preview)}
            disabled={!content}
          >
            <Eye className="mr-2 h-4 w-4" />
            {preview ? "ซ่อนตัวอย่าง" : "ดูตัวอย่าง"}
          </Button>
        </div>

        {/* Info */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          <p>
            💡 <strong>หมายเหตุ:</strong> อีเมลจะถูกบันทึกลงในระบบ และสามารถติดตามสถานะการเปิด/คลิกได้
          </p>
        </div>
      </div>
    </Card>
  )
}
