"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Mail,
  MessageSquare,
  Phone,
  Package,
  Calendar,
  Users,
  Gift,
  Save,
  AlertCircle,
} from "lucide-react";

interface AutomationSettings {
  // Inventory Alerts
  inventory_alerts_enabled: boolean;
  inventory_alert_threshold: number;
  inventory_alert_emails: string[];

  // Appointment Reminders
  appointment_reminders_enabled: boolean;
  reminder_24h_enabled: boolean;
  reminder_1h_enabled: boolean;
  reminder_channels: string[];
  reminder_template_24h: string;
  reminder_template_1h: string;

  // Booking Confirmations
  booking_confirmation_enabled: boolean;
  booking_confirmation_channels: string[];
  booking_confirmation_template: string;

  // Customer Follow-ups
  follow_up_enabled: boolean;
  follow_up_after_days: number;
  follow_up_template: string;

  // Inactive Customer Campaign
  inactive_campaign_enabled: boolean;
  inactive_after_days: number;
  inactive_campaign_template: string;

  // Birthday Wishes
  birthday_wishes_enabled: boolean;
  birthday_template: string;
  birthday_discount_percentage: number;

  // Staff Schedule Notifications
  staff_schedule_notifications_enabled: boolean;
  schedule_notification_time: string;
}

interface AutomationSettingsClientProps {
  initialSettings: AutomationSettings;
}

export default function AutomationSettingsClient({
  initialSettings,
}: AutomationSettingsClientProps) {
  const [settings, setSettings] = useState<AutomationSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const updateSetting = <K extends keyof AutomationSettings>(
    key: K,
    value: AutomationSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const toggleChannel = (
    settingKey: "reminder_channels" | "booking_confirmation_channels",
    channel: string
  ) => {
    const channels = settings[settingKey] as string[];
    if (channels.includes(channel)) {
      updateSetting(
        settingKey,
        channels.filter((c) => c !== channel) as any
      );
    } else {
      updateSetting(settingKey, [...channels, channel] as any);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage("");

    try {
      const response = await fetch("/api/clinic/settings/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaveMessage("บันทึกการตั้งค่าสำเร็จ! ✅");
      } else {
        setSaveMessage("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      }
    } catch (error) {
      setSaveMessage("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ระบบอัตโนมัติ</h1>
          <p className="text-muted-foreground mt-1">
            ตั้งค่าการแจ้งเตือนและการติดต่อลูกค้าอัตโนมัติ
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
        </Button>
      </div>

      {saveMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-800 dark:text-green-200">{saveMessage}</p>
        </div>
      )}

      {/* Inventory Alerts */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <Package className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">แจ้งเตือนสินค้าคงเหลือต่ำ</h2>
            <p className="text-sm text-muted-foreground">
              รับอีเมลเมื่อสินค้ามีจำนวนต่ำกว่าที่กำหนด
            </p>
          </div>
          <Switch
            checked={settings.inventory_alerts_enabled}
            onCheckedChange={(checked) =>
              updateSetting("inventory_alerts_enabled", checked)
            }
          />
        </div>

        {settings.inventory_alerts_enabled && (
          <div className="space-y-4 pl-13">
            <div>
              <Label>จำนวนขั้นต่ำที่แจ้งเตือน</Label>
              <Input
                type="number"
                value={settings.inventory_alert_threshold}
                onChange={(e) =>
                  updateSetting(
                    "inventory_alert_threshold",
                    parseInt(e.target.value) || 0
                  )
                }
                className="mt-1 max-w-xs"
              />
              <p className="text-xs text-muted-foreground mt-1">
                แจ้งเตือนเมื่อสินค้าเหลือน้อยกว่าจำนวนนี้
              </p>
            </div>

            <div>
              <Label>อีเมลที่ต้องการรับการแจ้งเตือน</Label>
              <Input
                type="email"
                placeholder="admin@clinic.com, manager@clinic.com"
                defaultValue={settings.inventory_alert_emails.join(", ")}
                onChange={(e) =>
                  updateSetting(
                    "inventory_alert_emails",
                    e.target.value.split(",").map((email) => email.trim())
                  )
                }
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                ใส่หลายอีเมลโดยคั่นด้วยจุลภาค (,)
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Appointment Reminders */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">แจ้งเตือนการนัดหมาย</h2>
            <p className="text-sm text-muted-foreground">
              ส่งข้อความแจ้งเตือนลูกค้าก่อนนัดหมาย
            </p>
          </div>
          <Switch
            checked={settings.appointment_reminders_enabled}
            onCheckedChange={(checked) =>
              updateSetting("appointment_reminders_enabled", checked)
            }
          />
        </div>

        {settings.appointment_reminders_enabled && (
          <div className="space-y-6 pl-13">
            {/* Reminder Timing */}
            <div className="space-y-3">
              <Label>เวลาที่ส่งการแจ้งเตือน</Label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <Switch
                    checked={settings.reminder_24h_enabled}
                    onCheckedChange={(checked) =>
                      updateSetting("reminder_24h_enabled", checked)
                    }
                  />
                  <span>24 ชั่วโมงก่อน</span>
                </label>
                <label className="flex items-center gap-2">
                  <Switch
                    checked={settings.reminder_1h_enabled}
                    onCheckedChange={(checked) =>
                      updateSetting("reminder_1h_enabled", checked)
                    }
                  />
                  <span>1 ชั่วโมงก่อน</span>
                </label>
              </div>
            </div>

            {/* Channels */}
            <div>
              <Label>ช่องทางการส่ง</Label>
              <div className="flex gap-2 mt-2">
                {[
                  { value: "sms", label: "SMS", icon: Phone },
                  { value: "line", label: "LINE", icon: MessageSquare },
                  { value: "email", label: "Email", icon: Mail },
                ].map((channel) => (
                  <Badge
                    key={channel.value}
                    variant={
                      settings.reminder_channels.includes(channel.value)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer px-3 py-1.5"
                    onClick={() =>
                      toggleChannel("reminder_channels", channel.value)
                    }
                  >
                    <channel.icon className="w-3 h-3 mr-1" />
                    {channel.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Template 24h */}
            {settings.reminder_24h_enabled && (
              <div>
                <Label>ข้อความแจ้งเตือน (24 ชั่วโมงก่อน)</Label>
                <Textarea
                  value={settings.reminder_template_24h}
                  onChange={(e) =>
                    updateSetting("reminder_template_24h", e.target.value)
                  }
                  rows={3}
                  className="mt-1 font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  ตัวแปรที่ใช้ได้: {"{"}
                  {"{"}customer_name{"}"}
                  {"}"}, {"{"}
                  {"{"}time{"}"}
                  {"}"}, {"{"}
                  {"{"}treatment{"}"}
                  {"}"}, {"{"}
                  {"{"}clinic_phone{"}"}
                  {"}"}
                </p>
              </div>
            )}

            {/* Template 1h */}
            {settings.reminder_1h_enabled && (
              <div>
                <Label>ข้อความแจ้งเตือน (1 ชั่วโมงก่อน)</Label>
                <Textarea
                  value={settings.reminder_template_1h}
                  onChange={(e) =>
                    updateSetting("reminder_template_1h", e.target.value)
                  }
                  rows={3}
                  className="mt-1 font-mono text-sm"
                />
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Booking Confirmations */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Bell className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">ยืนยันการจอง</h2>
            <p className="text-sm text-muted-foreground">
              ส่งข้อความยืนยันทันทีหลังจากลูกค้าจองคิว
            </p>
          </div>
          <Switch
            checked={settings.booking_confirmation_enabled}
            onCheckedChange={(checked) =>
              updateSetting("booking_confirmation_enabled", checked)
            }
          />
        </div>

        {settings.booking_confirmation_enabled && (
          <div className="space-y-4 pl-13">
            <div>
              <Label>ช่องทางการส่ง</Label>
              <div className="flex gap-2 mt-2">
                {[
                  { value: "line", label: "LINE", icon: MessageSquare },
                  { value: "email", label: "Email", icon: Mail },
                  { value: "sms", label: "SMS", icon: Phone },
                ].map((channel) => (
                  <Badge
                    key={channel.value}
                    variant={
                      settings.booking_confirmation_channels.includes(
                        channel.value
                      )
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer px-3 py-1.5"
                    onClick={() =>
                      toggleChannel(
                        "booking_confirmation_channels",
                        channel.value
                      )
                    }
                  >
                    <channel.icon className="w-3 h-3 mr-1" />
                    {channel.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>เทมเพลตข้อความยืนยัน</Label>
              <Textarea
                value={settings.booking_confirmation_template}
                onChange={(e) =>
                  updateSetting("booking_confirmation_template", e.target.value)
                }
                rows={6}
                className="mt-1 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                ตัวแปรที่ใช้ได้: {"{"}
                {"{"}booking_id{"}"}
                {"}"}, {"{"}
                {"{"}date{"}"}
                {"}"}, {"{"}
                {"{"}time{"}"}
                {"}"}, {"{"}
                {"{"}treatment{"}"}
                {"}"}, {"{"}
                {"{"}staff_name{"}"}
                {"}"}
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Customer Follow-ups */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">ติดตามผลหลัง Treatment</h2>
            <p className="text-sm text-muted-foreground">
              ส่งข้อความถามความพึงพอใจหลังการรักษา
            </p>
          </div>
          <Switch
            checked={settings.follow_up_enabled}
            onCheckedChange={(checked) =>
              updateSetting("follow_up_enabled", checked)
            }
          />
        </div>

        {settings.follow_up_enabled && (
          <div className="space-y-4 pl-13">
            <div>
              <Label>ส่งข้อความหลังการรักษา (วัน)</Label>
              <Input
                type="number"
                value={settings.follow_up_after_days}
                onChange={(e) =>
                  updateSetting(
                    "follow_up_after_days",
                    parseInt(e.target.value) || 0
                  )
                }
                className="mt-1 max-w-xs"
              />
            </div>

            <div>
              <Label>เทมเพลตข้อความติดตาม</Label>
              <Textarea
                value={settings.follow_up_template}
                onChange={(e) =>
                  updateSetting("follow_up_template", e.target.value)
                }
                rows={4}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Inactive Customer Campaign */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-pink-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">แคมเปญลูกค้าหายไป</h2>
            <p className="text-sm text-muted-foreground">
              ส่งข้อความชวนกลับมาใช้บริการให้ลูกค้าที่ไม่ได้มานาน
            </p>
          </div>
          <Switch
            checked={settings.inactive_campaign_enabled}
            onCheckedChange={(checked) =>
              updateSetting("inactive_campaign_enabled", checked)
            }
          />
        </div>

        {settings.inactive_campaign_enabled && (
          <div className="space-y-4 pl-13">
            <div>
              <Label>ถือว่าไม่ได้ใช้บริการ (วัน)</Label>
              <Input
                type="number"
                value={settings.inactive_after_days}
                onChange={(e) =>
                  updateSetting(
                    "inactive_after_days",
                    parseInt(e.target.value) || 0
                  )
                }
                className="mt-1 max-w-xs"
              />
              <p className="text-xs text-muted-foreground mt-1">
                ส่งข้อความถ้าไม่มีการจองนานเกินจำนวนวันนี้
              </p>
            </div>

            <div>
              <Label>เทมเพลตข้อความชวนกลับ</Label>
              <Textarea
                value={settings.inactive_campaign_template}
                onChange={(e) =>
                  updateSetting("inactive_campaign_template", e.target.value)
                }
                rows={5}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Birthday Wishes */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
            <Gift className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">อวยพรวันเกิด</h2>
            <p className="text-sm text-muted-foreground">
              ส่งข้อความอวยพรและส่วนลดพิเศษในวันเกิดลูกค้า
            </p>
          </div>
          <Switch
            checked={settings.birthday_wishes_enabled}
            onCheckedChange={(checked) =>
              updateSetting("birthday_wishes_enabled", checked)
            }
          />
        </div>

        {settings.birthday_wishes_enabled && (
          <div className="space-y-4 pl-13">
            <div>
              <Label>ส่วนลดวันเกิด (%)</Label>
              <Input
                type="number"
                value={settings.birthday_discount_percentage}
                onChange={(e) =>
                  updateSetting(
                    "birthday_discount_percentage",
                    parseInt(e.target.value) || 0
                  )
                }
                className="mt-1 max-w-xs"
              />
            </div>

            <div>
              <Label>เทมเพลตข้อความวันเกิด</Label>
              <Textarea
                value={settings.birthday_template}
                onChange={(e) =>
                  updateSetting("birthday_template", e.target.value)
                }
                rows={5}
                className="mt-1 font-mono text-sm"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Staff Schedule Notifications */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">แจ้งเตือนตารางงานทีม</h2>
            <p className="text-sm text-muted-foreground">
              ส่งตารางงานประจำวันให้ทีมทุกเช้า
            </p>
          </div>
          <Switch
            checked={settings.staff_schedule_notifications_enabled}
            onCheckedChange={(checked) =>
              updateSetting("staff_schedule_notifications_enabled", checked)
            }
          />
        </div>

        {settings.staff_schedule_notifications_enabled && (
          <div className="pl-13">
            <Label>เวลาที่ส่งการแจ้งเตือน</Label>
            <Input
              type="time"
              value={settings.schedule_notification_time}
              onChange={(e) =>
                updateSetting("schedule_notification_time", e.target.value)
              }
              className="mt-1 max-w-xs"
            />
            <p className="text-xs text-muted-foreground mt-1">
              ส่งตารางงานให้ทีมทุกวันเวลานี้
            </p>
          </div>
        )}
      </Card>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "กำลังบันทึก..." : "บันทึกการตั้งค่าทั้งหมด"}
        </Button>
      </div>
    </div>
  );
}
